/* ============================================================
   TaxGuide Africa LLP — Shared Nav + Footer
   Include this file on every page:
   <script src="taxguide-shared.1.0.1.js"></script>
   before closing </body>
   ============================================================ */

(function () {
  "use strict";

  /* ── 0. GUARD AGAINST DOUBLE-INJECTION ───────
     If this script is accidentally included twice on a page (a common
     copy/paste mistake across a multi-page static site), running the
     injector a second time would create duplicate #tg-nav /
     #tg-mobile-menu / #tg-footer IDs, duplicate event listeners on
     document/window, and a duplicate stylesheet <link>. Bail out early. */
  if (window.__tgSharedInitialized) return;
  window.__tgSharedInitialized = true;

  /* ── 1. INJECT SHARED CSS ────────────────────── */
  (function ensureTaxGuideStyles() {
    if (!document.querySelector('link[href="taxguide-shared.1.0.1.css"]')) {
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = "taxguide-shared.1.0.1.css";
      document.head.appendChild(l);
    }
    if (!document.querySelector('link[href="taxguide-page.css"]')) {
      const l2 = document.createElement("link");
      l2.rel = "stylesheet";
      l2.href = "taxguide-page.css";
      document.head.appendChild(l2);
    }
  })();

  /* ── 2. DETECT ACTIVE PAGE ───────────────────── */
  const path = location.pathname.split("/").pop() || "index.html";

  function active(page) {
    return path.includes(page) ? " tg-active" : "";
  }

  function resourcesActive() {
    const resourcePages = ["blog", "events", "publications", "projects"];
    return resourcePages.some((p) => path.includes(p)) ? " tg-active" : "";
  }

  function branchesActive() {
    const branchPages = ["kisumu", "oyugis", "mombasa"];
    return branchPages.some((p) => path.includes(p)) ? " tg-active" : "";
  }

  /* ── 3. SERVICES MEGA-DROPDOWN DATA ─────────── */
  const services = [
    {
      id: "accounting",
      label: "Accounting & Assurance",
      dot: "#0aa0d7",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" stroke-width="1.5"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>`,
      iconBg: "rgba(10,160,215,0.1)",
      desc: "Audit, reporting & compliance",
      subs: [
        "Accounting & bookkeeping",
        "Financial reporting (IFRS)",
        "Statutory & external audit",
        "Internal audit services",
        "Payroll & HR support",
        "Company start-up support",
        "Outsourcing services",
        "Systems & internal controls",
        "Fraud auditing & forensics",
        "Business risk services",
        "Sarbanes Oxley compliance",
        "Regulatory compliance",
      ],
    },
    {
      id: "tax",
      label: "Tax Advisory",
      dot: "#EFBF04",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`,
      iconBg: "rgba(239,191,4,0.1)",
      desc: "Local & international tax planning",
      subs: [
        "Corporate & business tax",
        "Private client tax",
        "Indirect tax (VAT/GST)",
        "Custom duties",
        "Employment tax",
        "Tax compliance",
        "Asset protection",
        "International tax planning",
        "Transfer pricing",
        "Expatriate tax",
        "BEPS compliance",
        "Tax dispute resolution",
      ],
    },
    {
      id: "legal",
      label: "Legal & Corporate Services",
      dot: "#a855f7",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="1.5"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z"/></svg>`,
      iconBg: "rgba(168,85,247,0.1)",
      desc: "Legal risk & corporate advisory",
      subs: [
        "Commercial & contract law",
        "Real estate law",
        "Business & corporate law",
        "Litigation",
        "Employment law",
        "Technology & e-commerce law",
        "Intellectual property",
        "Immigration services",
        "Anti-trust & competition",
        "Environmental law",
        "Bankruptcy & reorganisation",
        "Arbitration & mediation",
      ],
    },
    {
      id: "financial",
      label: "Financial Advisory",
      dot: "#059669",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
      iconBg: "rgba(5,150,105,0.1)",
      desc: "Strategic finance & investment",
      subs: [
        "Wealth management",
        "Mergers & acquisitions",
        "Feasibility studies",
        "Risk management",
        "Project finance",
        "Asset management",
        "Management consulting",
        "Strategic planning",
        "International expansion",
        "Cryptocurrency advisory",
        "Hedge fund advisory",
        "Corporate restructuring",
      ],
    },
    {
      id: "technology",
      label: "Technology & Digital",
      dot: "#f43f5e",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M17 8l-5 5-3-3-3 3"/></svg>`,
      iconBg: "rgba(244,63,94,0.1)",
      desc: "Digital transformation & IT audit",
      subs: [
        "Software development & Web design",
        "Cloud services & Database management",
        "Business intelligence & FinTech",
        "Office IT services & Server maintenance",
        "IT training & capacity building",
        "Audit, Assurance & Compliance",
        "Technology & IT Audit",
        "Cybersecurity Audit & Assurance",
        "Cloud, Data, AI & Digital Assurance",
        "ISO & Regulatory Compliance",
        "Third-Party Risk & Due Diligence",
        "Strategy, Risk & Resilience",
        "Technology Risk & Governance",
        "Digital Transformation Assurance",
        "Business Resilience & Continuity",
        "Technology Advisory & Managed Assurance",
      ],
    },
  ];

  /* Simple HTML-escaping for any data that ends up as text content.
     Not strictly needed for this static, developer-authored `services`
     array, but included so the pattern is safe if this data is ever
     sourced dynamically (e.g. a CMS) in future. */
  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* Build the left tabs + right panels HTML */
  const tabsHTML = services
    .map(
      (s, i) => `
    <button type="button" class="tg-svc-tab${i === 0 ? " active" : ""}" data-svc="${s.id}" role="tab" id="tg-svc-tab-${s.id}" aria-selected="${i === 0 ? "true" : "false"}" aria-controls="tg-svc-panel-${s.id}">
      <span class="tg-svc-tab-dot" style="background:${s.dot}"></span>
      <span class="tg-svc-tab-label">${escapeHTML(s.label)}</span>
      <svg class="tg-svc-tab-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
    </button>
  `,
    )
    .join("");

  const panelsHTML = services
    .map(
      (s, i) => `
    <div class="tg-svc-panel${i === 0 ? " active" : ""}" data-panel="${s.id}" id="tg-svc-panel-${s.id}" role="tabpanel" aria-labelledby="tg-svc-tab-${s.id}">
      <div class="tg-svc-panel-head">
        <div class="tg-svc-panel-icon" style="background:${s.iconBg}">${s.icon}</div>
        <div>
          <div class="tg-svc-panel-title">${escapeHTML(s.label)}</div>
          <div class="tg-svc-panel-sub">${escapeHTML(s.desc)}</div>
        </div>
      </div>
      <div class="tg-svc-sub-grid">
        ${s.subs
          .map(
            (sub) => `
          <a href="taxguide-services.html#${s.id}" class="tg-svc-sub-item">${escapeHTML(sub)}</a>
        `,
          )
          .join("")}
      </div>
      <div class="tg-svc-panel-foot">
        <a href="taxguide-services.html#${s.id}">
          View all ${escapeHTML(s.label)} services
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>
    </div>
  `,
    )
    .join("");

  /* Mobile drawer accordion HTML for Services — one row per practice
     area (mirrors the desktop mega-menu's left-hand tabs), linking
     straight to that section of the services page. Listing every
     individual sub-service (60+ across 5 categories) inside the
     mobile drawer would make the panel unusably long, so mobile gets
     the same 5-item grouping desktop users see first. */
  const svcAccordionHTML = services
    .map(
      (s) => `
      <a href="taxguide-services.html#${s.id}" class="tg-sub">
        <span class="tg-drawer-acc-dot" style="background:${s.dot}"></span>
        ${escapeHTML(s.label)}
      </a>
    `,
    )
    .join("");

  /* ── 4. NAV HTML ────────────────────────────── */
  const navHTML = `
  <nav id="tg-nav">
    <a href="index.html" class="tg-logo">
      <img src="images/logo.png" alt="TaxGuide Africa LLP" class="tg-logo-img">
    </a>

    <ul class="tg-nav-links">
      <li><a href="index.html" class="${active("home") || (path === "" || path === "index.html" ? "tg-active" : "")}">Home</a></li>
      <li><a href="taxguide-about.html" class="${active("about")}">About</a></li>

      <li class="tg-has-dd tg-has-svc">
        <a href="taxguide-services.html" class="tg-nav-btn${active("services")}" aria-haspopup="true" aria-expanded="false">
          Services
          <svg class="tg-chevron" viewBox="0 0 24 24" stroke-width="2.5" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
        </a>
        <div class="tg-svc-mega">
          <div class="tg-svc-left" role="tablist" aria-label="Practice areas">
            <div class="tg-svc-left-head">Practice Areas</div>
            ${tabsHTML}
          </div>
          <div class="tg-svc-right">
            ${panelsHTML}
          </div>
        </div>
      </li>

      <li><a href="taxguide-careers.html" class="${active("careers")}">Careers</a></li>

      <li class="tg-has-dd">
        <a href="taxguide-blog.html" class="tg-nav-btn${resourcesActive()}" aria-haspopup="true" aria-expanded="false">
          Resources
          <svg class="tg-chevron" viewBox="0 0 24 24" stroke-width="2.5" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
        </a>
        <div class="tg-dropdown">
          <a href="taxguide-blog.html" class="tg-dd-item">
            <div class="tg-dd-icon" style="background:rgba(0,87,125,0.08)">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--navy)" stroke-width="1.5" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
            </div>
            <div><div class="tg-dd-title">Blog</div><div class="tg-dd-desc">Expert articles, tax updates &amp; regulatory insights</div></div>
          </a>
          <a href="taxguide-publications.html" class="tg-dd-item">
            <div class="tg-dd-icon" style="background:rgba(10,160,215,0.08)">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" stroke-width="1.5" aria-hidden="true"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </div>
            <div><div class="tg-dd-title">Publications</div><div class="tg-dd-desc">Whitepapers, reports &amp; regulatory bulletins</div></div>
          </a>
          <a href="taxguide-events.html" class="tg-dd-item">
            <div class="tg-dd-icon" style="background:rgba(239,191,4,0.10)">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" stroke-width="1.5" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            </div>
            <div><div class="tg-dd-title">Events</div><div class="tg-dd-desc">Seminars, webinars &amp; networking events</div></div>
          </a>
          <a href="taxguide-projects.html" class="tg-dd-item">
            <div class="tg-dd-icon" style="background:rgba(5,150,105,0.08)">
              <svg viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="1.5" aria-hidden="true"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <div><div class="tg-dd-title">Projects</div><div class="tg-dd-desc">Case studies &amp; client engagement highlights</div></div>
          </a>
          <div class="tg-dd-div"></div>
          <div class="tg-dd-foot">
            <span>56+ publications available</span>
            <a href="taxguide-blog.html">Browse all <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
          </div>
        </div>
      </li>

      <li class="tg-has-dd">
        <a href="taxguide-branches.html" class="tg-nav-btn${branchesActive()}" aria-haspopup="true" aria-expanded="false">
          Branches
          <svg class="tg-chevron" viewBox="0 0 24 24" stroke-width="2.5" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
        </a>
        <div class="tg-dropdown">
          <a href="taxguide-branches.html#nairobi" class="tg-dd-item">
            <div class="tg-dd-icon" style="background:rgba(0,87,125,0.08)">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--navy)" stroke-width="1.5" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div><div class="tg-dd-title">Nairobi</div><div class="tg-dd-desc">Milligan Court, 1st Floor, Suite 4</div></div>
          </a>
          <a href="taxguide-branches.html#mombasa" class="tg-dd-item">
            <div class="tg-dd-icon" style="background:rgba(10,160,215,0.08)">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" stroke-width="1.5" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div><div class="tg-dd-title">Mombasa</div><div class="tg-dd-desc">Coast region office</div></div>
          </a>
          <a href="taxguide-branches.html#kisumu" class="tg-dd-item">
            <div class="tg-dd-icon" style="background:rgba(239,191,4,0.10)">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" stroke-width="1.5" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div><div class="tg-dd-title">Kisumu</div><div class="tg-dd-desc">Western Kenya office</div></div>
          </a>
          <a href="taxguide-branches.html#oyugis" class="tg-dd-item">
            <div class="tg-dd-icon" style="background:rgba(5,150,105,0.08)">
              <svg viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="1.5" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div><div class="tg-dd-title">Homabay</div><div class="tg-dd-desc">South Nyanza office</div></div>
          </a>
          <div class="tg-dd-div"></div>
          <div class="tg-dd-foot">
            <span>4 offices across Kenya</span>
            <a href="taxguide-branches.html">View all <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
          </div>
        </div>
      </li>

      <li><a href="taxguide-contact.html" class="${active("contact")}">Contact</a></li>
    </ul>

    <div class="tg-nav-cta">
      <a href="taxguide-contact.html" class="tg-btn tg-btn-outline">Get in Touch</a>
      <a href="taxguide-services.html" class="tg-btn tg-btn-gold">Our Services</a>
    </div>

    <button type="button" class="tg-hamburger" id="tg-hamburger" aria-label="Open menu" aria-expanded="false" aria-controls="tg-mobile-menu">
      <span></span><span></span><span></span>
    </button>
  </nav>

  <!-- Mobile drawer -->
  <div id="tg-mobile-menu" role="dialog" aria-modal="true" aria-label="Mobile navigation">
    <div class="tg-drawer">
      <div class="tg-drawer-head">
        <a href="index.html" class="tg-logo">
          <div class="tg-logo-mark">TG</div>
          <div class="tg-logo-text"><span class="tg-name">TaxGuide Africa</span><span class="tg-llp">LLP</span></div>
        </a>
        <button type="button" class="tg-drawer-close" id="tg-drawer-close" aria-label="Close menu">
          <svg viewBox="0 0 24 24" stroke-width="2.5" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- NEW: dedicated scroll region. This is the ONLY part of the
           drawer that scrolls; the head above and the CTA below are
           fixed, always-visible, and can never be overlapped by list
           content because they no longer share a scroll box with it. -->
      <div class="tg-drawer-scroll">
        <nav class="tg-drawer-links" aria-label="Mobile">
          <a href="index.html" class="${active("home")}">Home</a>
          <a href="taxguide-about.html" class="${active("about")}">About</a>

          <div class="tg-drawer-acc">
            <div class="tg-drawer-acc-row">
              <a href="taxguide-services.html" class="tg-drawer-acc-link${active("services")}">Services</a>
              <button type="button" class="tg-drawer-acc-toggle" aria-expanded="false" aria-controls="tg-acc-services">
                <svg viewBox="0 0 24 24" stroke-width="2.5" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
              </button>
            </div>
            <div class="tg-drawer-acc-panel" id="tg-acc-services">
              <div class="tg-drawer-acc-panel-inner">${svcAccordionHTML}</div>
            </div>
          </div>

          <a href="taxguide-careers.html" class="${active("careers")}">Careers</a>

          <div class="tg-drawer-acc">
            <div class="tg-drawer-acc-row">
              <a href="taxguide-blog.html" class="tg-drawer-acc-link${resourcesActive()}">Resources</a>
              <button type="button" class="tg-drawer-acc-toggle" aria-expanded="false" aria-controls="tg-acc-resources">
                <svg viewBox="0 0 24 24" stroke-width="2.5" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
              </button>
            </div>
            <div class="tg-drawer-acc-panel" id="tg-acc-resources">
              <div class="tg-drawer-acc-panel-inner">
                <a href="taxguide-blog.html" class="tg-sub">Blog</a>
                <a href="taxguide-publications.html" class="tg-sub">Publications</a>
                <a href="taxguide-events.html" class="tg-sub">Events</a>
                <a href="taxguide-projects.html" class="tg-sub">Projects</a>
              </div>
            </div>
          </div>

          <div class="tg-drawer-acc">
            <div class="tg-drawer-acc-row">
              <a href="taxguide-branches.html" class="tg-drawer-acc-link${branchesActive()}">Branches</a>
              <button type="button" class="tg-drawer-acc-toggle" aria-expanded="false" aria-controls="tg-acc-branches">
                <svg viewBox="0 0 24 24" stroke-width="2.5" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
              </button>
            </div>
            <div class="tg-drawer-acc-panel" id="tg-acc-branches">
              <div class="tg-drawer-acc-panel-inner">
                <a href="taxguide-branches.html#nairobi" class="tg-sub">Nairobi</a>
                <a href="taxguide-branches.html#mombasa" class="tg-sub">Mombasa</a>
                <a href="taxguide-branches.html#kisumu" class="tg-sub">Kisumu</a>
                <a href="taxguide-branches.html#oyugis" class="tg-sub">Homabay</a>
              </div>
            </div>
          </div>

          <a href="taxguide-contact.html" class="${active("contact")}">Contact</a>
        </nav>
      </div>

      <div class="tg-drawer-cta">
        <a href="taxguide-contact.html" class="tg-btn tg-btn-navy">Get in Touch</a>
        <a href="taxguide-services.html" class="tg-btn tg-btn-gold">Our Services</a>
      </div>
    </div>
  </div>
  `;

  /* ── 5. FOOTER HTML ──────────────────────────── */
  const footerHTML = `
  <footer id="tg-footer">
    <div class="tg-footer-top">
      <div class="tg-footer-brand">
        <a href="index.html" class="tg-footer-logo" style="margin-bottom:10px; display:inline-block; text-decoration:none;">
          <img src="images/logo.png" alt="TaxGuide Africa LLP" style="height:60px; width:auto; object-fit:contain; display:block; filter:brightness(0) invert(1); transform: scale(3.5); transform-origin: left center;">
        </a>
        <div class="tg-fdivider"></div>
        <p style="margin-top:16px;">A premier multidisciplinary professional services firm delivering world-class audit, tax, legal, financial, and technology advisory solutions across Africa.</p>
        <div class="tg-footer-contact">
          <div class="tg-fci">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>Milligan Court, 1st Floor, Suite 4<br>Opposite Ngong Hills Hotel, Nairobi, Kenya</span>
          </div>
          <div class="tg-fci">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.08a16 16 0 006 6z"/></svg>
            <span>+254 711 355 015</span>
          </div>
          <div class="tg-fci">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <span>info@taxguidellp.com</span>
          </div>
          <div class="tg-fci">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20"/></svg>
            <span>www.taxguidellp.com</span>
          </div>
        </div>
      </div>

      <div class="tg-footer-col">
        <h4>Services</h4>
        <ul>
          <li><a href="taxguide-services.html#accounting">Accounting &amp; Assurance</a></li>
          <li><a href="taxguide-services.html#tax">Tax Advisory</a></li>
          <li><a href="taxguide-services.html#legal">Legal &amp; Corporate</a></li>
          <li><a href="taxguide-services.html#financial">Financial Advisory</a></li>
          <li><a href="taxguide-services.html#technology">Technology &amp; Digital</a></li>
        </ul>
      </div>

      <div class="tg-footer-col">
        <h4>Company</h4>
        <ul>
          <li><a href="taxguide-about.html">About Us</a></li>
          <li><a href="taxguide-blog.html">Blog</a></li>
          <li><a href="taxguide-events.html">Events</a></li>
          <li><a href="taxguide-careers.html">Careers</a></li>
          <li><a href="taxguide-branches.html">Branches</a></li>
          <li><a href="taxguide-contact.html">Contact</a></li>
        </ul>
      </div>

      <div class="tg-footer-col">
        <h4>Legal</h4>
        <ul>
          <li><a href="privacy-policy.html">Privacy Policy</a></li>
          <li><a href="terms-conditions.html">Terms &amp; Conditions</a></li>
          <li><a href="cookie-policy.html">Cookie Policy</a></li>
          <li><a href="disclaimer.html">Disclaimer</a></li>
        </ul>
        <div class="tg-footer-qc">
          <div class="tg-footer-qc-label">Quick Contact</div>
          <a href="tel:+254711355015">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.08a16 16 0 006 6z"/></svg>
            +254 711 355 015
          </a>
          <a href="mailto:info@taxguidellp.com">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            info@taxguidellp.com
          </a>
        </div>
      </div>
    </div>

    <div class="tg-footer-bottom">
      <p>&copy; ${new Date().getFullYear()} TaxGuide Africa LLP. All rights reserved. |
        <a href="index.html" class="tg-flink" target="_blank" rel="noopener noreferrer">www.taxguidellp.com</a>
      </p>
      <div class="tg-socials">
        <a href="https://www.linkedin.com/company/taxguideafricallp" class="tg-social" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
        </a>
        <a href="https://x.com/Taxguideafrica" class="tg-social" aria-label="X / Twitter" target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </a>
        <a href="https://www.facebook.com/profile.php?id=61555963430604" class="tg-social" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
        </a>
        <a href="https://www.instagram.com/taxguideafrica/" class="tg-social" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>
        </a>
        <a href="https://wa.me/254711355015" class="tg-social" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        </a>
        <a href="https://www.youtube.com/@TaxGuideAfricaLLP" class="tg-social" aria-label="YouTube" target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M10 15l5.19-3L10 9v6z"/><path d="M21.8 8s-.2-1.4-.8-2c-.7-.8-1.5-.8-1.9-.8C16.4 5 12 5 12 5s-4.4 0-7.1.2c-.4 0-1.2 0-1.9.8-.6.6-.8 2-.8 2S2 9.6 2.1 11c0 .8.3 1.6.7 2 .7.8 1.6.8 1.9.8C7.6 14 12 14 12 14s4.4 0 7.1-.2c.4 0 1.2 0 1.9-.8.6-.6.8-2 .8-2z"/></svg>
        </a>
      </div>
    </div>
  </footer>
  `;

  /* ── 6. INJECT INTO DOM ──────────────────────── */
  function injectSharedElements() {
    // Legacy nav (older page markup, pre-dating this shared script) —
    // remove it so it doesn't sit alongside the injected nav.
    const existingMainNav = document.getElementById("mainNav");
    if (existingMainNav) existingMainNav.remove();

    // If a previous run already injected our own nav/drawer (defensive;
    // the __tgSharedInitialized guard above should normally prevent this),
    // remove them first rather than creating duplicate IDs.
    document.getElementById("tg-nav")?.remove();
    document.getElementById("tg-mobile-menu")?.remove();

    const navWrapper = document.createElement("div");
    navWrapper.innerHTML = navHTML;

    // navHTML contains two top-level nodes: <nav id="tg-nav"> and
    // <div id="tg-mobile-menu">. Both need to land in the DOM in that
    // order. Element.prepend() accepts multiple nodes and inserts them
    // in the order given, so no manual reverse-and-loop is needed.
    const nodes = [...navWrapper.children];
    document.body.prepend(...nodes);

    const existingFooter = document.querySelector("footer");
    const footerWrapper = document.createElement("div");
    footerWrapper.innerHTML = footerHTML;
    const newFooter = footerWrapper.firstElementChild;

    // Preserve #contact as an in-page scroll target (used by hero/nav CTAs)
    // without clobbering #tg-footer's id, which taxguide-shared.1.0.1.css relies on.
    if (
      existingFooter?.id === "contact" ||
      existingFooter?.querySelector?.("#contact")
    ) {
      const contactAnchor = document.createElement("span");
      contactAnchor.id = "contact";
      contactAnchor.style.cssText = "position:absolute;top:-88px;left:0;";
      newFooter.style.position = newFooter.style.position || "relative";
      newFooter.prepend(contactAnchor);
    }

    if (existingFooter) {
      existingFooter.replaceWith(newFooter);
    } else {
      document.body.appendChild(newFooter);
    }

    /* ── BODY PADDING ─────────────────────────────
       Only set this once; respect a value the page may already define
       (inline or otherwise) via a data attribute rather than reading
       computed/inline style back, which is unreliable across browsers. */
    if (!document.body.hasAttribute("data-tg-padded")) {
      document.body.style.paddingTop = "72px";
      document.body.setAttribute("data-tg-padded", "true");
    }

    initializeInteractions();
  }

  function initializeInteractions() {
    const tgNav = document.getElementById("tg-nav");
    const hamburger = document.getElementById("tg-hamburger");
    const mobileMenu = document.getElementById("tg-mobile-menu");
    const drawerClose = document.getElementById("tg-drawer-close");

    /* ── NAV SCROLL SHADOW ────────────────────────
       Cheap, single classList.toggle per scroll event; already passive
       and does not read layout, so no forced reflow / jank concern. */
    window.addEventListener(
      "scroll",
      () => {
        if (tgNav) tgNav.classList.toggle("scrolled", window.scrollY > 60);
      },
      { passive: true },
    );

    /* ── MOBILE DRAWER ─────────────────────────────
       Handles open/close, scroll locking (with iOS-safe body pinning),
       Escape key, click-outside, focus trapping, and returning focus to
       the hamburger button on close. */
    let scrollYBeforeOpen = 0;
    let lastFocusedBeforeOpen = null;

    function getFocusableInDrawer() {
      if (!mobileMenu) return [];
      return [
        ...mobileMenu.querySelectorAll(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ].filter((el) => el.offsetParent !== null);
    }

    function trapFocus(e) {
      if (e.key !== "Tab" || !mobileMenu?.classList.contains("open")) return;
      const focusable = getFocusableInDrawer();
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    const accordionToggles = mobileMenu
      ? [...mobileMenu.querySelectorAll(".tg-drawer-acc-toggle")]
      : [];

    function setAccordion(toggle, expand) {
      const panel = document.getElementById(toggle.getAttribute("aria-controls"));
      if (!panel) return;
      toggle.setAttribute("aria-expanded", expand ? "true" : "false");
      toggle.classList.toggle("expanded", expand);
      panel.classList.toggle("open", expand);
    }

    function openDrawer() {
      if (!mobileMenu) return;
      lastFocusedBeforeOpen = document.activeElement;
      scrollYBeforeOpen = window.scrollY;

      mobileMenu.classList.add("open");
      hamburger?.setAttribute("aria-expanded", "true");

      // Lock background scroll. Plain `overflow:hidden` on body does not
      // reliably stop touch scrolling on iOS Safari, so pin the body in
      // place with position:fixed and restore the scroll offset on close.
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollYBeforeOpen}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflow = "hidden";

      // Move focus into the drawer for keyboard/screen-reader users.
      const focusable = getFocusableInDrawer();
      (focusable[0] || drawerClose)?.focus();
    }

    function closeDrawer() {
      if (!mobileMenu) return;
      mobileMenu.classList.remove("open");
      hamburger?.setAttribute("aria-expanded", "false");

      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      window.scrollTo(0, scrollYBeforeOpen);

      // Return focus to whatever opened the drawer (normally the
      // hamburger) so keyboard users aren't dropped at the top of body.
      (lastFocusedBeforeOpen || hamburger)?.focus();

      // Collapse any expanded accordion so re-opening the drawer later
      // starts fresh rather than surprising the user with a panel still
      // open from last time.
      accordionToggles.forEach((t) => setAccordion(t, false));
    }

    hamburger?.addEventListener("click", () => {
      mobileMenu?.classList.contains("open") ? closeDrawer() : openDrawer();
    });
    drawerClose?.addEventListener("click", closeDrawer);
    mobileMenu?.addEventListener("click", (e) => {
      if (e.target === mobileMenu) closeDrawer();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && mobileMenu?.classList.contains("open")) {
        closeDrawer();
      } else {
        trapFocus(e);
      }
    });

    // If the viewport is resized/rotated past the desktop breakpoint
    // while the drawer is open (e.g. tablet rotation, devtools resize),
    // close it so it doesn't get stuck open behind the now-visible
    // desktop nav.
    let resizeTimer;
    window.addEventListener(
      "resize",
      () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          if (window.innerWidth > 768 && mobileMenu?.classList.contains("open")) {
            closeDrawer();
          }
        }, 150);
      },
      { passive: true },
    );

    /* ── MOBILE DRAWER ACCORDIONS (Services / Resources / Branches) ───
       Each accordion row has its own link (navigates normally) plus a
       dedicated toggle button that expands/collapses the sub-item panel
       without navigating. Only one panel open at a time keeps the list
       from growing unmanageably long on small screens. */
    accordionToggles.forEach((toggle) => {
      toggle.addEventListener("click", () => {
        const isOpen = toggle.getAttribute("aria-expanded") === "true";
        // Collapse any other open accordion first (single-open pattern
        // keeps the drawer scannable instead of turning into one long
        // scroll of every sub-item at once).
        accordionToggles.forEach((t) => {
          if (t !== toggle) setAccordion(t, false);
        });
        setAccordion(toggle, !isOpen);
      });
    });

    /* ── SERVICES MEGA-DROPDOWN TABS ───────────────
       Switches the active tab/panel on hover (desktop mouse), and also
       on focus and click so keyboard users (Tab) and touch/hybrid
       devices can operate it — the original mouseover-only handler was
       unusable without a mouse. */
    function activateServiceTab(tab) {
      if (!tab) return;
      const id = tab.dataset.svc;

      document.querySelectorAll(".tg-svc-tab").forEach((t) => {
        const isActive = t === tab;
        t.classList.toggle("active", isActive);
        t.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      document.querySelectorAll(".tg-svc-panel").forEach((panel) => {
        panel.classList.toggle("active", panel.dataset.panel === id);
      });
    }

    document.addEventListener("mouseover", (e) => {
      activateServiceTab(e.target.closest(".tg-svc-tab"));
    });
    document.addEventListener("focusin", (e) => {
      activateServiceTab(e.target.closest(".tg-svc-tab"));
    });
    document.addEventListener("click", (e) => {
      const tab = e.target.closest(".tg-svc-tab");
      if (tab) {
        e.preventDefault();
        activateServiceTab(tab);
      }
    });

    /* ── TOUCH: TAP TO OPEN HEADER DROPDOWNS ───────
       .tg-dropdown / .tg-svc-mega only open via CSS :hover /
       :focus-within, which never fire on tap. On touch devices, the
       first tap on a trigger opens its panel instead of navigating;
       tapping elsewhere (or a real link inside the panel) closes it. */
    document
      .querySelectorAll(".tg-has-dd > .tg-nav-btn, .tg-has-dd > a[aria-haspopup]")
      .forEach((trigger) => {
        trigger.addEventListener("click", (e) => {
          if (window.matchMedia("(hover: hover)").matches) return; // desktop: hover already handles it
          const li = trigger.closest(".tg-has-dd");
          const isOpen = li.classList.contains("tg-force-open");
          document
            .querySelectorAll(".tg-has-dd.tg-force-open")
            .forEach((el) => el !== li && el.classList.remove("tg-force-open"));
          if (!isOpen) {
            e.preventDefault();
            li.classList.add("tg-force-open");
          }
        });
      });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".tg-has-dd")) {
        document
          .querySelectorAll(".tg-has-dd.tg-force-open")
          .forEach((el) => el.classList.remove("tg-force-open"));
      }
    });

    /* ── DROPDOWN aria-expanded SYNC ───────────────
       The dropdown/mega-menu visuals are driven by CSS :hover /
       :focus-within (plus .tg-force-open on touch above), but
       aria-expanded should reflect actual state for assistive tech. */
    document.querySelectorAll(".tg-has-dd").forEach((li) => {
      const trigger = li.querySelector(":scope > .tg-nav-btn");
      if (!trigger) return;
      const setExpanded = (val) => trigger.setAttribute("aria-expanded", val ? "true" : "false");
      li.addEventListener("mouseenter", () => setExpanded(true));
      li.addEventListener("mouseleave", () => setExpanded(false));
      li.addEventListener("focusin", () => setExpanded(true));
      li.addEventListener("focusout", (e) => {
        if (!li.contains(e.relatedTarget)) setExpanded(false);
      });
    });
  }

  /* ── EXECUTION ENTRYPOINT ────────────────────── */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectSharedElements);
  } else {
    injectSharedElements();
  }
})();