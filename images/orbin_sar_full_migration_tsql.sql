-- ============================================================================
-- Migration: Full SAR Setup (SQL Server / T-SQL)
-- Purpose: Tables, indexes, seed data, and stored procedures for SAR management
-- Date: June 1, 2026
-- Target DB: orbin
-- Run Order:
--   1. Create SarNoSequence  (parent table)
--   2. Create SarNoHistory   (child table, FK -> SarNoSequence)
--   3. Seed / initialize data
--   4. Stored procedures: Reserve, Commit, Reconcile, Rollback
-- ============================================================================

USE orbin;
GO

-- ============================================================================
-- 1. SarNoSequence
-- ============================================================================

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'SarNoSequence')
BEGIN
    CREATE TABLE SarNoSequence (
        SequenceId              INT             NOT NULL IDENTITY(1,1),
        Tin                     VARCHAR(50)     NOT NULL,
        BhfId                   VARCHAR(10)     NOT NULL,

        -- Sequence State
        CurrentSarNo            INT             NOT NULL DEFAULT 0,
        NextReservation         INT             NOT NULL DEFAULT 1,
        LastAllocatedSarNo      INT             NULL,
        RemoteLastSarNo         INT             NULL,

        -- Counters
        AllocationCount         INT             NOT NULL DEFAULT 0,
        PersistenceCount        INT             NOT NULL DEFAULT 0,

        -- Timestamps
        LastAllocatedDt         DATETIME        NULL,
        LastPersistDt           DATETIME        NULL,
        LastRemoteSyncDt        DATETIME        NULL,
        LastReconciliationDt    DATETIME        NULL,

        -- Concurrency Control
        IsLocked                BIT             NOT NULL DEFAULT 0,
        LockedBySpid            INT             NULL,
        LockedDt                DATETIME        NULL,
        LockExpiryDt            DATETIME        NULL,

        -- Audit
        CreatedDt               DATETIME        NOT NULL DEFAULT GETDATE(),
        ModifiedDt              DATETIME        NOT NULL DEFAULT GETDATE(),
        ModifiedBy              VARCHAR(100)    NULL,

        CONSTRAINT PK_SarNoSequence PRIMARY KEY (SequenceId),
        CONSTRAINT UQ_SarNoSequence_TinBhf UNIQUE (Tin, BhfId)
    );

    CREATE INDEX idx_SarNoSequence_Lock
        ON SarNoSequence (IsLocked, LockExpiryDt);

    CREATE INDEX idx_SarNoSequence_RemoteSync
        ON SarNoSequence (RemoteLastSarNo, LastRemoteSyncDt);

    PRINT 'SarNoSequence table created in database orbin.';
END
ELSE
    PRINT 'SarNoSequence already exists — skipped.';
GO

-- ============================================================================
-- 2. SarNoHistory
-- ============================================================================

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'SarNoHistory')
BEGIN
    CREATE TABLE SarNoHistory (
        HistoryId               INT             NOT NULL IDENTITY(1,1),
        Tin                     VARCHAR(50)     NOT NULL,
        BhfId                   VARCHAR(10)     NOT NULL,
        SarNo                   INT             NOT NULL,

        -- Operation Context
        OperationType           VARCHAR(50)     NOT NULL,
        ReferenceNo             VARCHAR(100)    NULL,
        ReferenceType           VARCHAR(50)     NULL,

        -- State Tracking
        Status                  VARCHAR(20)     NOT NULL,
        AllocationDt            DATETIME        NOT NULL DEFAULT GETDATE(),
        PersistenceDt           DATETIME        NULL,
        RemoteConfirmDt         DATETIME        NULL,

        -- Reconciliation Tracking
        WasReconciled           BIT             NOT NULL DEFAULT 0,
        OriginalSarNo           INT             NULL,
        ReconciliationReason    VARCHAR(500)    NULL,

        -- Remote Sync Details
        RemoteExpectedSarNo     INT             NULL,
        RemoteResponseCode      VARCHAR(10)     NULL,
        RemoteMessage           VARCHAR(500)    NULL,
        RemoteResponseDt        DATETIME        NULL,

        -- Operation Details
        ItemCount               INT             NULL,
        TotalAmount             DECIMAL(18,2)   NULL,

        -- Reference Data for Audit Reports
        TinDescription          VARCHAR(100)    NULL,
        BhfIdDescription        VARCHAR(100)    NULL,

        -- Audit Trail
        CreatedBy               VARCHAR(100)    NULL,
        ModifiedDt              DATETIME        NOT NULL DEFAULT GETDATE(),
        ModifiedBy              VARCHAR(100)    NULL,

        CONSTRAINT PK_SarNoHistory PRIMARY KEY (HistoryId),

        CONSTRAINT FK_SarNoHistory_Sequence FOREIGN KEY (Tin, BhfId)
            REFERENCES SarNoSequence (Tin, BhfId)
            ON DELETE NO ACTION
            ON UPDATE CASCADE
    );

    CREATE INDEX idx_SarNoHistory_SarNo
        ON SarNoHistory (Tin, BhfId, SarNo);

    CREATE INDEX idx_SarNoHistory_Status
        ON SarNoHistory (Status, AllocationDt);

    CREATE INDEX idx_SarNoHistory_Reference
        ON SarNoHistory (ReferenceType, ReferenceNo);

    CREATE INDEX idx_SarNoHistory_AllocationDt
        ON SarNoHistory (AllocationDt);

    CREATE INDEX idx_SarNoHistory_Reconciled
        ON SarNoHistory (WasReconciled);

    PRINT 'SarNoHistory table created in database orbin.';
END
ELSE
    PRINT 'SarNoHistory already exists — skipped.';
GO

-- ============================================================================
-- 3. Seed / Initialize Data
-- ============================================================================

BEGIN TRANSACTION;

BEGIN TRY

    -- Upsert SarNoSequence from EtimsSetUp + SendStockInOutDetails
    MERGE SarNoSequence AS tgt
    USING (
        SELECT
            es.EtimsPin                         AS Tin,
            es.EtimsBranch                      AS BhfId,
            COALESCE(MAX(ssio.SarNo), 0)        AS CurrentSarNo,
            COALESCE(MAX(ssio.SarNo), 0) + 1   AS NextReservation,
            COUNT(ssio.SarNo)                   AS PersistenceCount
        FROM EtimsSetUp es
        LEFT JOIN SendStockInOutDetails ssio
            ON es.EtimsPin = ssio.Tin AND es.EtimsBranch = ssio.BhfId
        WHERE es.EtimsPin IS NOT NULL AND es.EtimsBranch IS NOT NULL
        GROUP BY es.EtimsPin, es.EtimsBranch
    ) AS src ON tgt.Tin = src.Tin AND tgt.BhfId = src.BhfId
    WHEN MATCHED THEN
        UPDATE SET
            tgt.CurrentSarNo     = src.CurrentSarNo,
            tgt.NextReservation  = src.NextReservation,
            tgt.PersistenceCount = src.PersistenceCount,
            tgt.ModifiedDt       = GETDATE(),
            tgt.ModifiedBy       = SYSTEM_USER
    WHEN NOT MATCHED THEN
        INSERT (Tin, BhfId, CurrentSarNo, NextReservation, LastAllocatedSarNo, RemoteLastSarNo,
                AllocationCount, PersistenceCount, CreatedDt, ModifiedDt, ModifiedBy)
        VALUES (src.Tin, src.BhfId, src.CurrentSarNo, src.NextReservation, NULL, NULL,
                0, src.PersistenceCount, GETDATE(), GETDATE(), SYSTEM_USER);

    -- Migrate SendStockInOutDetails into SarNoHistory (skip already-migrated rows)
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
        GETDATE()           AS ModifiedDt,
        SYSTEM_USER         AS ModifiedBy
    FROM SendStockInOutDetails ssio
    WHERE NOT EXISTS (
        SELECT 1 FROM SarNoHistory h
        WHERE h.Tin = ssio.Tin AND h.BhfId = ssio.BhfId AND h.SarNo = ssio.SarNo
    );

    COMMIT TRANSACTION;
    PRINT 'SarNoSequence initialization completed (orbin).';

END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO

-- ============================================================================
-- 4. Stored Procedures
-- ============================================================================

-- ----------------------------------------------------------------------------
-- sp_SarNo_Reserve
-- ----------------------------------------------------------------------------
IF OBJECT_ID('sp_SarNo_Reserve', 'P') IS NOT NULL
    DROP PROCEDURE sp_SarNo_Reserve;
GO
CREATE PROCEDURE sp_SarNo_Reserve
    @p_Tin              VARCHAR(50),
    @p_BhfId            VARCHAR(10),
    @p_OperationType    VARCHAR(50),
    @p_ReferenceNo      VARCHAR(100),
    @p_ReferenceType    VARCHAR(50),
    @p_AllocatedSarNo   INT         OUTPUT,
    @p_ErrorMessage     VARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    SET @p_AllocatedSarNo = 0;
    SET @p_ErrorMessage   = NULL;

    BEGIN TRANSACTION;

    BEGIN TRY

        -- Release expired locks
        UPDATE SarNoSequence
        SET IsLocked = 0, LockedBySpid = NULL, LockedDt = NULL, LockExpiryDt = NULL
        WHERE IsLocked = 1 AND LockExpiryDt < GETDATE();

        -- Acquire lock
        UPDATE SarNoSequence WITH (ROWLOCK, UPDLOCK)
        SET IsLocked     = 1,
            LockedBySpid = @@SPID,
            LockedDt     = GETDATE(),
            LockExpiryDt = DATEADD(MINUTE, 5, GETDATE())
        WHERE Tin = @p_Tin AND BhfId = @p_BhfId
          AND (IsLocked = 0 OR LockExpiryDt < GETDATE());

        IF @@ROWCOUNT = 0
        BEGIN
            ROLLBACK TRANSACTION;
            SET @p_AllocatedSarNo = 0;
            SET @p_ErrorMessage   = 'Could not acquire lock';
            RETURN;
        END;

        -- Read next reservation
        SELECT @p_AllocatedSarNo = NextReservation
        FROM SarNoSequence WITH (UPDLOCK)
        WHERE Tin = @p_Tin AND BhfId = @p_BhfId;

        IF @p_AllocatedSarNo IS NULL
        BEGIN
            ROLLBACK TRANSACTION;
            SET @p_AllocatedSarNo = 0;
            SET @p_ErrorMessage   = 'Sequence not found for ' + @p_Tin + ':' + @p_BhfId;
            RETURN;
        END;

        -- Increment sequence
        UPDATE SarNoSequence
        SET NextReservation    = NextReservation + 1,
            LastAllocatedSarNo = @p_AllocatedSarNo,
            LastAllocatedDt    = GETDATE(),
            AllocationCount    = AllocationCount + 1,
            ModifiedDt         = GETDATE(),
            ModifiedBy         = SYSTEM_USER
        WHERE Tin = @p_Tin AND BhfId = @p_BhfId;

        -- Write history record
        INSERT INTO SarNoHistory (Tin, BhfId, SarNo, OperationType, ReferenceNo, ReferenceType, Status, AllocationDt, CreatedBy)
        VALUES (@p_Tin, @p_BhfId, @p_AllocatedSarNo, @p_OperationType, @p_ReferenceNo, @p_ReferenceType, 'Allocated', GETDATE(), SYSTEM_USER);

        COMMIT TRANSACTION;

    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        SET @p_AllocatedSarNo = 0;
        SET @p_ErrorMessage   = 'SQL exception during reserve: ' + ERROR_MESSAGE();
    END CATCH;
END;
GO

-- ----------------------------------------------------------------------------
-- sp_SarNo_Commit
-- ----------------------------------------------------------------------------
IF OBJECT_ID('sp_SarNo_Commit', 'P') IS NOT NULL
    DROP PROCEDURE sp_SarNo_Commit;
GO
CREATE PROCEDURE sp_SarNo_Commit
    @p_Tin          VARCHAR(50),
    @p_BhfId        VARCHAR(10),
    @p_SarNo        INT,
    @p_ErrorMessage VARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    SET @p_ErrorMessage = NULL;

    BEGIN TRANSACTION;

    BEGIN TRY

        UPDATE SarNoSequence
        SET CurrentSarNo     = @p_SarNo,
            IsLocked         = 0,
            LockedBySpid     = NULL,
            LockedDt         = NULL,
            LockExpiryDt     = NULL,
            LastPersistDt    = GETDATE(),
            PersistenceCount = PersistenceCount + 1,
            ModifiedDt       = GETDATE(),
            ModifiedBy       = SYSTEM_USER
        WHERE Tin = @p_Tin AND BhfId = @p_BhfId;

        IF @@ROWCOUNT = 0
        BEGIN
            ROLLBACK TRANSACTION;
            SET @p_ErrorMessage = 'Sequence not found';
            RETURN;
        END;

        UPDATE SarNoHistory
        SET Status        = 'Persisted',
            PersistenceDt = GETDATE(),
            ModifiedDt    = GETDATE(),
            ModifiedBy    = SYSTEM_USER
        WHERE Tin = @p_Tin AND BhfId = @p_BhfId
          AND SarNo = @p_SarNo AND Status = 'Allocated';

        COMMIT TRANSACTION;

    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        SET @p_ErrorMessage = 'SQL exception during commit: ' + ERROR_MESSAGE();
    END CATCH;
END;
GO

-- ----------------------------------------------------------------------------
-- sp_SarNo_Reconcile
-- ----------------------------------------------------------------------------
IF OBJECT_ID('sp_SarNo_Reconcile', 'P') IS NOT NULL
    DROP PROCEDURE sp_SarNo_Reconcile;
GO
CREATE PROCEDURE sp_SarNo_Reconcile
    @p_Tin                  VARCHAR(50),
    @p_BhfId                VARCHAR(10),
    @p_OriginalSarNo        INT,
    @p_RemoteExpectedSarNo  INT,
    @p_ReconciledSarNo      INT,
    @p_RemoteResponseCode   VARCHAR(10),
    @p_RemoteMessage        VARCHAR(500),
    @p_ErrorMessage         VARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    SET @p_ErrorMessage = NULL;

    BEGIN TRANSACTION;

    BEGIN TRY

        UPDATE SarNoHistory
        SET Status               = 'Reconciled',
            WasReconciled        = 1,
            OriginalSarNo        = @p_OriginalSarNo,
            RemoteExpectedSarNo  = @p_RemoteExpectedSarNo,
            ReconciliationReason = 'Remote expected SAR ' + CAST(@p_RemoteExpectedSarNo AS VARCHAR)
                                 + ' but received ' + CAST(@p_OriginalSarNo AS VARCHAR)
                                 + '. Retried with expected value.',
            RemoteResponseCode   = @p_RemoteResponseCode,
            RemoteMessage        = @p_RemoteMessage,
            RemoteResponseDt     = GETDATE(),
            ModifiedDt           = GETDATE(),
            ModifiedBy           = SYSTEM_USER
        WHERE Tin = @p_Tin AND BhfId = @p_BhfId AND SarNo = @p_ReconciledSarNo;

        UPDATE SarNoSequence
        SET RemoteLastSarNo      = @p_RemoteExpectedSarNo,
            LastReconciliationDt = GETDATE(),
            LastRemoteSyncDt     = GETDATE(),
            IsLocked             = 0,
            LockedBySpid         = NULL,
            LockedDt             = NULL,
            LockExpiryDt         = NULL,
            ModifiedDt           = GETDATE(),
            ModifiedBy           = SYSTEM_USER
        WHERE Tin = @p_Tin AND BhfId = @p_BhfId;

        COMMIT TRANSACTION;

    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        SET @p_ErrorMessage = 'SQL exception during reconcile: ' + ERROR_MESSAGE();
    END CATCH;
END;
GO

-- ----------------------------------------------------------------------------
-- sp_SarNo_Rollback
-- ----------------------------------------------------------------------------
IF OBJECT_ID('sp_SarNo_Rollback', 'P') IS NOT NULL
    DROP PROCEDURE sp_SarNo_Rollback;
GO
CREATE PROCEDURE sp_SarNo_Rollback
    @p_Tin           VARCHAR(50),
    @p_BhfId         VARCHAR(10),
    @p_SarNo         INT,
    @p_FailureReason VARCHAR(500),
    @p_ErrorMessage  VARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    SET @p_ErrorMessage = NULL;

    BEGIN TRANSACTION;

    BEGIN TRY

        UPDATE SarNoSequence
        SET IsLocked     = 0,
            LockedBySpid = NULL,
            LockedDt     = NULL,
            LockExpiryDt = NULL,
            ModifiedDt   = GETDATE(),
            ModifiedBy   = SYSTEM_USER
        WHERE Tin = @p_Tin AND BhfId = @p_BhfId;

        UPDATE SarNoHistory
        SET Status        = 'Failed',
            RemoteMessage = @p_FailureReason,
            ModifiedDt    = GETDATE(),
            ModifiedBy    = SYSTEM_USER
        WHERE Tin = @p_Tin AND BhfId = @p_BhfId
          AND SarNo = @p_SarNo AND Status = 'Allocated';

        COMMIT TRANSACTION;

    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        SET @p_ErrorMessage = 'SQL exception during rollback: ' + ERROR_MESSAGE();
    END CATCH;
END;
GO

PRINT 'SAR stored procedures created/updated (orbin).';
GO

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
