-- ============================================================================
-- Migration: Full SAR Setup (MySQL 5.6)
-- Purpose: Tables, indexes, seed data, and stored procedures for SAR management
-- Date: June 1, 2026
-- Target DB: `orbin`
-- Run Order:
--   1. Create SarNoSequence  (parent table)
--   2. Create SarNoHistory   (child table, FK -> SarNoSequence)
--   3. Seed / initialize data
--   4. Stored procedures: Reserve, Commit, Reconcile, Rollback
-- ============================================================================

USE orbin;

-- ============================================================================
-- 1. SarNoSequence
-- ============================================================================

CREATE TABLE IF NOT EXISTS SarNoSequence (
    SequenceId          INT             NOT NULL AUTO_INCREMENT,
    Tin                 VARCHAR(50)     NOT NULL,
    BhfId               VARCHAR(10)     NOT NULL,

    -- Sequence State
    CurrentSarNo        INT             NOT NULL DEFAULT 0,
    NextReservation     INT             NOT NULL DEFAULT 1,
    LastAllocatedSarNo  INT             DEFAULT NULL,
    RemoteLastSarNo     INT             DEFAULT NULL,

    -- Counters
    AllocationCount     INT             NOT NULL DEFAULT 0,
    PersistenceCount    INT             NOT NULL DEFAULT 0,

    -- Timestamps
    LastAllocatedDt     DATETIME        DEFAULT NULL,
    LastPersistDt       DATETIME        DEFAULT NULL,
    LastRemoteSyncDt    DATETIME        DEFAULT NULL,
    LastReconciliationDt DATETIME       DEFAULT NULL,

    -- Concurrency Control
    IsLocked            TINYINT(1)      NOT NULL DEFAULT 0,
    LockedBySpid        INT             DEFAULT NULL,
    LockedDt            DATETIME        DEFAULT NULL,
    LockExpiryDt        DATETIME        DEFAULT NULL,

    -- Audit
    CreatedDt           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ModifiedDt          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                        ON UPDATE CURRENT_TIMESTAMP,
    ModifiedBy          VARCHAR(100)    DEFAULT NULL,

    PRIMARY KEY (SequenceId),
    UNIQUE KEY uq_SarNoSequence_TinBhf (Tin, BhfId)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_SarNoSequence_Lock       ON SarNoSequence (IsLocked, LockExpiryDt);
CREATE INDEX idx_SarNoSequence_RemoteSync ON SarNoSequence (RemoteLastSarNo, LastRemoteSyncDt);

SELECT 'SarNoSequence table created (or already exists) in database orbin.' AS migration_log;

-- ============================================================================
-- 2. SarNoHistory
-- ============================================================================

CREATE TABLE IF NOT EXISTS SarNoHistory (
    HistoryId               INT             NOT NULL AUTO_INCREMENT,
    Tin                     VARCHAR(50)     NOT NULL,
    BhfId                   VARCHAR(10)     NOT NULL,
    SarNo                   INT             NOT NULL,

    -- Operation Context
    OperationType           VARCHAR(50)     NOT NULL,
    ReferenceNo             VARCHAR(100)    DEFAULT NULL,
    ReferenceType           VARCHAR(50)     DEFAULT NULL,

    -- State Tracking
    Status                  VARCHAR(20)     NOT NULL,
    AllocationDt            DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PersistenceDt           DATETIME        DEFAULT NULL,
    RemoteConfirmDt         DATETIME        DEFAULT NULL,

    -- Reconciliation Tracking
    WasReconciled           TINYINT(1)      NOT NULL DEFAULT 0,
    OriginalSarNo           INT             DEFAULT NULL,
    ReconciliationReason    VARCHAR(500)    DEFAULT NULL,

    -- Remote Sync Details
    RemoteExpectedSarNo     INT             DEFAULT NULL,
    RemoteResponseCode      VARCHAR(10)     DEFAULT NULL,
    RemoteMessage           VARCHAR(500)    DEFAULT NULL,
    RemoteResponseDt        DATETIME        DEFAULT NULL,

    -- Operation Details
    ItemCount               INT             DEFAULT NULL,
    TotalAmount             DECIMAL(18,2)   DEFAULT NULL,

    -- Reference Data for Audit Reports
    TinDescription          VARCHAR(100)    DEFAULT NULL,
    BhfIdDescription        VARCHAR(100)    DEFAULT NULL,

    -- Audit Trail
    CreatedBy               VARCHAR(100)    DEFAULT NULL,
    ModifiedDt              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                            ON UPDATE CURRENT_TIMESTAMP,
    ModifiedBy              VARCHAR(100)    DEFAULT NULL,

    PRIMARY KEY (HistoryId),

    CONSTRAINT fk_SarNoHistory_Sequence FOREIGN KEY (Tin, BhfId)
        REFERENCES SarNoSequence (Tin, BhfId)
        ON DELETE RESTRICT
        ON UPDATE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_SarNoHistory_SarNo         ON SarNoHistory (Tin, BhfId, SarNo);
CREATE INDEX idx_SarNoHistory_Status        ON SarNoHistory (Status, AllocationDt);
CREATE INDEX idx_SarNoHistory_Reference     ON SarNoHistory (ReferenceType, ReferenceNo);
CREATE INDEX idx_SarNoHistory_AllocationDt  ON SarNoHistory (AllocationDt);
CREATE INDEX idx_SarNoHistory_Reconciled    ON SarNoHistory (WasReconciled);

SELECT 'SarNoHistory table created (or already exists) in database orbin.' AS migration_log;

-- ============================================================================
-- 3. Seed / Initialize Data
-- ============================================================================

START TRANSACTION;

-- Upsert SarNoSequence rows from EtimsSetUp + SendStockInOutDetails
INSERT INTO SarNoSequence (
    Tin, BhfId, CurrentSarNo, NextReservation, LastAllocatedSarNo, RemoteLastSarNo,
    AllocationCount, PersistenceCount, CreatedDt, ModifiedDt, ModifiedBy
)
SELECT
    es.EtimsPin                             AS Tin,
    es.EtimsBranch                          AS BhfId,
    COALESCE(MAX(ssio.SarNo), 0)            AS CurrentSarNo,
    COALESCE(MAX(ssio.SarNo), 0) + 1       AS NextReservation,
    NULL                                    AS LastAllocatedSarNo,
    NULL                                    AS RemoteLastSarNo,
    0                                       AS AllocationCount,
    COUNT(ssio.SarNo)                       AS PersistenceCount,
    NOW()                                   AS CreatedDt,
    NOW()                                   AS ModifiedDt,
    USER()                                  AS ModifiedBy
FROM EtimsSetUp es
LEFT JOIN SendStockInOutDetails ssio
    ON es.EtimsPin = ssio.Tin AND es.EtimsBranch = ssio.BhfId
WHERE es.EtimsPin IS NOT NULL AND es.EtimsBranch IS NOT NULL
GROUP BY es.EtimsPin, es.EtimsBranch
ON DUPLICATE KEY UPDATE
    CurrentSarNo     = VALUES(CurrentSarNo),
    NextReservation  = VALUES(NextReservation),
    PersistenceCount = VALUES(PersistenceCount),
    ModifiedDt       = NOW(),
    ModifiedBy       = USER();

-- Migrate existing SendStockInOutDetails into SarNoHistory (skip already-migrated rows)
INSERT INTO SarNoHistory (
    Tin, BhfId, SarNo, OperationType, ReferenceNo, ReferenceType, Status,
    AllocationDt, PersistenceDt, RemoteConfirmDt, CreatedBy, ModifiedDt, ModifiedBy
)
SELECT
    ssio.Tin,
    ssio.BhfId,
    ssio.SarNo,
    'Legacy'            AS OperationType,
    NULL                AS ReferenceNo,
    'SendStockInOut'    AS ReferenceType,
    'Persisted'         AS Status,
    ssio.OcrnDt         AS AllocationDt,
    ssio.OcrnDt         AS PersistenceDt,
    ssio.OcrnDt         AS RemoteConfirmDt,
    'Migration'         AS CreatedBy,
    NOW()               AS ModifiedDt,
    USER()              AS ModifiedBy
FROM SendStockInOutDetails ssio
WHERE NOT EXISTS (
    SELECT 1 FROM SarNoHistory h
    WHERE h.Tin = ssio.Tin AND h.BhfId = ssio.BhfId AND h.SarNo = ssio.SarNo
);

COMMIT;

SELECT 'SarNoSequence initialization completed (orbin).' AS migration_log;

-- ============================================================================
-- 4. Stored Procedures
-- ============================================================================

-- ----------------------------------------------------------------------------
-- sp_SarNo_Reserve
-- ----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_SarNo_Reserve;
DELIMITER $$
CREATE PROCEDURE sp_SarNo_Reserve(
    IN  p_Tin           VARCHAR(50),
    IN  p_BhfId         VARCHAR(10),
    IN  p_OperationType VARCHAR(50),
    IN  p_ReferenceNo   VARCHAR(100),
    IN  p_ReferenceType VARCHAR(50),
    OUT p_AllocatedSarNo INT,
    OUT p_ErrorMessage  VARCHAR(500)
)
proc_reserve: BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_AllocatedSarNo = 0;
        SET p_ErrorMessage   = 'SQL exception during reserve';
    END;

    START TRANSACTION;

    -- Release any expired locks
    UPDATE SarNoSequence
    SET IsLocked = 0, LockedBySpid = NULL, LockedDt = NULL, LockExpiryDt = NULL
    WHERE IsLocked = 1 AND LockExpiryDt < NOW();

    -- Acquire lock for this (Tin, BhfId)
    UPDATE SarNoSequence
    SET IsLocked     = 1,
        LockedBySpid = CONNECTION_ID(),
        LockedDt     = NOW(),
        LockExpiryDt = DATE_ADD(NOW(), INTERVAL 5 MINUTE)
    WHERE Tin = p_Tin AND BhfId = p_BhfId
      AND (IsLocked = 0 OR LockExpiryDt < NOW());

    IF ROW_COUNT() = 0 THEN
        ROLLBACK;
        SET p_AllocatedSarNo = 0;
        SET p_ErrorMessage   = 'Could not acquire lock';
        LEAVE proc_reserve;
    END IF;

    -- Read next reservation number
    SELECT NextReservation INTO p_AllocatedSarNo
    FROM SarNoSequence
    WHERE Tin = p_Tin AND BhfId = p_BhfId
    FOR UPDATE;

    IF p_AllocatedSarNo IS NULL THEN
        ROLLBACK;
        SET p_AllocatedSarNo = 0;
        SET p_ErrorMessage   = CONCAT('Sequence not found for ', p_Tin, ':', p_BhfId);
        LEAVE proc_reserve;
    END IF;

    -- Increment sequence
    UPDATE SarNoSequence
    SET NextReservation    = NextReservation + 1,
        LastAllocatedSarNo = p_AllocatedSarNo,
        LastAllocatedDt    = NOW(),
        AllocationCount    = AllocationCount + 1,
        ModifiedDt         = NOW(),
        ModifiedBy         = USER()
    WHERE Tin = p_Tin AND BhfId = p_BhfId;

    -- Write history record
    INSERT INTO SarNoHistory (Tin, BhfId, SarNo, OperationType, ReferenceNo, ReferenceType, Status, AllocationDt, CreatedBy)
    VALUES (p_Tin, p_BhfId, p_AllocatedSarNo, p_OperationType, p_ReferenceNo, p_ReferenceType, 'Allocated', NOW(), USER());

    COMMIT;
    SET p_ErrorMessage = NULL;
END$$
DELIMITER ;

-- ----------------------------------------------------------------------------
-- sp_SarNo_Commit
-- ----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_SarNo_Commit;
DELIMITER $$
CREATE PROCEDURE sp_SarNo_Commit(
    IN  p_Tin          VARCHAR(50),
    IN  p_BhfId        VARCHAR(10),
    IN  p_SarNo        INT,
    OUT p_ErrorMessage VARCHAR(500)
)
proc_commit: BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_ErrorMessage = 'SQL exception during commit';
    END;

    START TRANSACTION;

    UPDATE SarNoSequence
    SET CurrentSarNo     = p_SarNo,
        IsLocked         = 0,
        LockedBySpid     = NULL,
        LockedDt         = NULL,
        LockExpiryDt     = NULL,
        LastPersistDt    = NOW(),
        PersistenceCount = PersistenceCount + 1,
        ModifiedDt       = NOW(),
        ModifiedBy       = USER()
    WHERE Tin = p_Tin AND BhfId = p_BhfId;

    IF ROW_COUNT() = 0 THEN
        ROLLBACK;
        SET p_ErrorMessage = 'Sequence not found';
        LEAVE proc_commit;
    END IF;

    UPDATE SarNoHistory
    SET Status        = 'Persisted',
        PersistenceDt = NOW(),
        ModifiedDt    = NOW(),
        ModifiedBy    = USER()
    WHERE Tin = p_Tin AND BhfId = p_BhfId AND SarNo = p_SarNo AND Status = 'Allocated';

    COMMIT;
    SET p_ErrorMessage = NULL;
END$$
DELIMITER ;

-- ----------------------------------------------------------------------------
-- sp_SarNo_Reconcile
-- ----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_SarNo_Reconcile;
DELIMITER $$
CREATE PROCEDURE sp_SarNo_Reconcile(
    IN  p_Tin                  VARCHAR(50),
    IN  p_BhfId                VARCHAR(10),
    IN  p_OriginalSarNo        INT,
    IN  p_RemoteExpectedSarNo  INT,
    IN  p_ReconciledSarNo      INT,
    IN  p_RemoteResponseCode   VARCHAR(10),
    IN  p_RemoteMessage        VARCHAR(500),
    OUT p_ErrorMessage         VARCHAR(500)
)
proc_reconcile: BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_ErrorMessage = 'SQL exception during reconcile';
    END;

    START TRANSACTION;

    UPDATE SarNoHistory
    SET Status                = 'Reconciled',
        WasReconciled         = 1,
        OriginalSarNo         = p_OriginalSarNo,
        RemoteExpectedSarNo   = p_RemoteExpectedSarNo,
        ReconciliationReason  = CONCAT('Remote expected SAR ', p_RemoteExpectedSarNo,
                                       ' but received ', p_OriginalSarNo,
                                       '. Retried with expected value.'),
        RemoteResponseCode    = p_RemoteResponseCode,
        RemoteMessage         = p_RemoteMessage,
        RemoteResponseDt      = NOW(),
        ModifiedDt            = NOW(),
        ModifiedBy            = USER()
    WHERE Tin = p_Tin AND BhfId = p_BhfId AND SarNo = p_ReconciledSarNo;

    UPDATE SarNoSequence
    SET RemoteLastSarNo       = p_RemoteExpectedSarNo,
        LastReconciliationDt  = NOW(),
        LastRemoteSyncDt      = NOW(),
        IsLocked              = 0,
        LockedBySpid          = NULL,
        LockedDt              = NULL,
        LockExpiryDt          = NULL,
        ModifiedDt            = NOW(),
        ModifiedBy            = USER()
    WHERE Tin = p_Tin AND BhfId = p_BhfId;

    COMMIT;
    SET p_ErrorMessage = NULL;
END$$
DELIMITER ;

-- ----------------------------------------------------------------------------
-- sp_SarNo_Rollback
-- ----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_SarNo_Rollback;
DELIMITER $$
CREATE PROCEDURE sp_SarNo_Rollback(
    IN  p_Tin           VARCHAR(50),
    IN  p_BhfId         VARCHAR(10),
    IN  p_SarNo         INT,
    IN  p_FailureReason VARCHAR(500),
    OUT p_ErrorMessage  VARCHAR(500)
)
proc_rollback: BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_ErrorMessage = 'SQL exception during rollback';
    END;

    START TRANSACTION;

    UPDATE SarNoSequence
    SET IsLocked     = 0,
        LockedBySpid = NULL,
        LockedDt     = NULL,
        LockExpiryDt = NULL,
        ModifiedDt   = NOW(),
        ModifiedBy   = USER()
    WHERE Tin = p_Tin AND BhfId = p_BhfId;

    UPDATE SarNoHistory
    SET Status       = 'Failed',
        RemoteMessage = p_FailureReason,
        ModifiedDt   = NOW(),
        ModifiedBy   = USER()
    WHERE Tin = p_Tin AND BhfId = p_BhfId AND SarNo = p_SarNo AND Status = 'Allocated';

    COMMIT;
    SET p_ErrorMessage = NULL;
END$$
DELIMITER ;

SELECT 'SAR stored procedures created/updated (orbin).' AS migration_log;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
