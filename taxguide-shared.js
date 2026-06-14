/* ============================================================
   TaxGuide Africa LLP — Shared Nav + Footer
   Include this file on every page:
   <script src="taxguide-shared.js"></script>
   before closing </body>
   ============================================================ */

(function () {
  /* ── 1. INJECT SHARED CSS ────────────────────── */
  // Styles have been extracted to external stylesheet: taxguide-shared.css
  // Load shared stylesheet (and a page-specific placeholder) if not already present
  (function ensureTaxGuideStyles() {
    if (!document.querySelector('link[href="taxguide-shared.css"]')) {
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = "taxguide-shared.css";
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

  /* Build the left tabs + right panels HTML */
  const tabsHTML = services
    .map(
      (s, i) => `
    <button class="tg-svc-tab${i === 0 ? " active" : ""}" data-svc="${s.id}">
      <span class="tg-svc-tab-dot" style="background:${s.dot}"></span>
      <span class="tg-svc-tab-label">${s.label}</span>
      <svg class="tg-svc-tab-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>
    </button>
  `,
    )
    .join("");

  const panelsHTML = services
    .map(
      (s, i) => `
    <div class="tg-svc-panel${i === 0 ? " active" : ""}" data-panel="${s.id}">
      <div class="tg-svc-panel-head">
        <div class="tg-svc-panel-icon" style="background:${s.iconBg}">${s.icon}</div>
        <div>
          <div class="tg-svc-panel-title">${s.label}</div>
          <div class="tg-svc-panel-sub">${s.desc}</div>
        </div>
      </div>
      <div class="tg-svc-sub-grid">
        ${s.subs
          .map(
            (sub) => `
          <a href="taxguide-services.html#${s.id}" class="tg-svc-sub-item">${sub}</a>
        `,
          )
          .join("")}
      </div>
      <div class="tg-svc-panel-foot">
        <a href="taxguide-services.html#${s.id}">
          View all ${s.label} services
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>
    </div>
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

      <!-- SERVICES with mega-dropdown -->
      <li class="tg-has-dd tg-has-svc" style="position:relative;">
        <a href="taxguide-services.html" class="tg-nav-btn${active("services")}" aria-haspopup="true">
          Services
          <svg class="tg-chevron" viewBox="0 0 24 24" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
        </a>
        <div class="tg-svc-mega">
          <div class="tg-svc-left">
            <div class="tg-svc-left-head">Practice Areas</div>
            ${tabsHTML}
          </div>
          <div class="tg-svc-right">
            ${panelsHTML}
          </div>
        </div>
      </li>

      <li><a href="taxguide-careers.html" class="${active("careers")}">Careers</a></li>

      <!-- RESOURCES dropdown -->
      <li class="tg-has-dd">
        <a href="taxguide-resources.html" class="tg-nav-btn${resourcesActive()}" aria-haspopup="true">
          Resources
          <svg class="tg-chevron" viewBox="0 0 24 24" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
        </a>
        <div class="tg-dropdown">
          <a href="taxguide-blog.html" class="tg-dd-item">
            <div class="tg-dd-icon" style="background:rgba(0,87,125,0.08)">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--navy)" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
            </div>
            <div><div class="tg-dd-title">Blog</div><div class="tg-dd-desc">Expert articles, tax updates &amp; regulatory insights</div></div>
          </a>
          <a href="taxguide-publications.html" class="tg-dd-item">
            <div class="tg-dd-icon" style="background:rgba(10,160,215,0.08)">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" stroke-width="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </div>
            <div><div class="tg-dd-title">Publications</div><div class="tg-dd-desc">Whitepapers, reports &amp; regulatory bulletins</div></div>
          </a>
          <a href="taxguide-events.html" class="tg-dd-item">
            <div class="tg-dd-icon" style="background:rgba(239,191,4,0.10)">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            </div>
            <div><div class="tg-dd-title">Events</div><div class="tg-dd-desc">Seminars, webinars &amp; networking events</div></div>
          </a>
          <a href="taxguide-projects.html" class="tg-dd-item">
            <div class="tg-dd-icon" style="background:rgba(5,150,105,0.08)">
              <svg viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <div><div class="tg-dd-title">Projects</div><div class="tg-dd-desc">Case studies &amp; client engagement highlights</div></div>
          </a>
          <div class="tg-dd-div"></div>
          <div class="tg-dd-foot">
            <span>56+ publications available</span>
            <a href="taxguide-blog.html">Browse all <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
          </div>
        </div>
      </li>

      <!-- BRANCHES dropdown -->
      <li class="tg-has-dd">
        <a href="taxguide-branches.html" class="tg-nav-btn${branchesActive()}" aria-haspopup="true">
          Branches
          <svg class="tg-chevron" viewBox="0 0 24 24" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
        </a>
        <div class="tg-dropdown">
          <a href="taxguide-branches.html#nairobi" class="tg-dd-item">
            <div class="tg-dd-icon" style="background:rgba(0,87,125,0.08)">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--navy)" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div><div class="tg-dd-title">Nairobi</div><div class="tg-dd-desc">Milligan Court, 1st Floor, Suite 4</div></div>
          </a>
          <a href="taxguide-branches.html#mombasa" class="tg-dd-item">
            <div class="tg-dd-icon" style="background:rgba(10,160,215,0.08)">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div><div class="tg-dd-title">Mombasa</div><div class="tg-dd-desc">Coast region office</div></div>
          </a>
          <a href="taxguide-branches.html#kisumu" class="tg-dd-item">
            <div class="tg-dd-icon" style="background:rgba(239,191,4,0.10)">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div><div class="tg-dd-title">Kisumu</div><div class="tg-dd-desc">Western Kenya office</div></div>
          </a>
          <a href="taxguide-branches.html#oyugis" class="tg-dd-item">
            <div class="tg-dd-icon" style="background:rgba(5,150,105,0.08)">
              <svg viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div><div class="tg-dd-title">Homabay</div><div class="tg-dd-desc">South Nyanza office</div></div>
          </a>
          <div class="tg-dd-div"></div>
          <div class="tg-dd-foot">
            <span>4 offices across Kenya</span>
            <a href="taxguide-branches.html">View all <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
          </div>
        </div>
      </li>

      <li><a href="taxguide-contact.html" class="${active("contact")}">Contact</a></li>
    </ul>

    <div class="tg-nav-cta">
      <a href="taxguide-contact.html" class="tg-btn tg-btn-outline">Get in Touch</a>
      <a href="taxguide-services.html" class="tg-btn tg-btn-gold">Our Services</a>
    </div>

    <button class="tg-hamburger" id="tg-hamburger" aria-label="Open menu">
      <span></span><span></span><span></span>
    </button>
  </nav>

  <!-- Mobile drawer -->
  <div id="tg-mobile-menu">
    <div class="tg-drawer">
      <div class="tg-drawer-head">
        <a href="index.html" class="tg-logo">
          <div class="tg-logo-mark">TG</div>
          <div class="tg-logo-text"><span class="tg-name">TaxGuide Africa</span><span class="tg-llp">LLP</span></div>
        </a>
        <button class="tg-drawer-close" id="tg-drawer-close" aria-label="Close">
          <svg viewBox="0 0 24 24" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <nav class="tg-drawer-links">
        <a href="index.html" class="${active("home")}">Home</a>
        <a href="taxguide-about.html" class="${active("about")}">About</a>
        <a href="taxguide-services.html" class="${active("services")}">Services</a>
        <div class="tg-drawer-group">
          <div class="tg-drawer-group-label">Practice Areas</div>
          <a href="taxguide-services.html#accounting" class="tg-sub">Accounting &amp; Assurance</a>
          <a href="taxguide-services.html#tax" class="tg-sub">Tax Advisory</a>
          <a href="taxguide-services.html#legal" class="tg-sub">Legal &amp; Corporate</a>
          <a href="taxguide-services.html#financial" class="tg-sub">Financial Advisory</a>
          <a href="taxguide-services.html#technology" class="tg-sub">Technology &amp; Digital</a>
        </div>
        <a href="taxguide-careers.html" class="${active("careers")}">Careers</a>
        <div class="tg-drawer-group">
          <div class="tg-drawer-group-label">Resources</div>
          <a href="taxguide-blog.html" class="tg-sub${active("blog")}">Blog</a>
          <a href="taxguide-publications.html" class="tg-sub${active("publications")}">Publications</a>
          <a href="taxguide-events.html" class="tg-sub${active("events")}">Events</a>
          <a href="taxguide-projects.html" class="tg-sub${active("projects")}">Projects</a>
        </div>
        <div class="tg-drawer-group">
          <div class="tg-drawer-group-label">Branches</div>
          <a href="taxguide-branches.html" class="tg-sub${active("mombasa")}">Mombasa</a>
          <a href="taxguide-branches.html" class="tg-sub${active("oyugis")}">Oyugis</a>
          <a href="taxguide-branches.html" class="tg-sub${active("kisumu")}">Kisumu</a>
        </div>
        <a href="taxguide-contact.html" class="${active("contact")}">Contact</a>
      </nav>
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
       <a href="taxguide-home.html" class="tg-footer-logo" 
   style="margin-bottom:14px; display:inline-block; text-decoration:none;">
  <img src="images/logo.png" alt="TaxGuide Africa LLP"
       style="width:120px; height:120px; object-fit:contain; display:block; filter:brightness(0) invert(1);">
</a>
        <div class="tg-fdivider"></div>
        <p style="margin-top:16px;">A premier multidisciplinary professional services firm delivering world-class audit, tax, legal, financial, and technology advisory solutions across Africa.</p>
        <div class="tg-footer-contact">
          <div class="tg-fci">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>Milligan Court, 1st Floor, Suite 4<br>Opposite Ngong Hills Hotel, Nairobi, Kenya</span>
          </div>
          <div class="tg-fci">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.08a16 16 0 006 6z"/></svg>
            <span>+254 711 355 015</span>
          </div>
          <div class="tg-fci">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <span>info@taxguidellp.com</span>
          </div>
          <div class="tg-fci">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20"/></svg>
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
          <li><a href="#">Privacy Policy</a></li>
          <li><a href="#">Terms &amp; Conditions</a></li>
          <li><a href="#">Cookie Policy</a></li>
          <li><a href="#">Disclaimer</a></li>
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
        <a href="#" class="tg-flink">www.taxguidellp.com</a>
      </p>
      <div class="tg-socials">
        <a href="https://www.linkedin.com/company/taxguideafricallp" class="tg-social" aria-label="LinkedIn">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
        </a>
        <a href="https://x.com/Taxguideafrica" class="tg-social" aria-label="X / Twitter">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </a>
        <a href="https://www.facebook.com/profile.php?id=61555963430604" class="tg-social" aria-label="Facebook">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
        </a>
        <a href="https://www.instagram.com/taxguideafrica/" class="tg-social" aria-label="Instagram">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>
        </a>
        <a href="https://wa.me/254711355015" class="tg-social" aria-label="WhatsApp">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52 -.075 -.１４９ -.６６９ -１．６１２ -.９１６ -２．２０７ -.２４２ -．５７９ -.４８７ -．５ -.６６９ -．５１ -.１７３ -．００８ -.３７１ -．０１ -.５７ -．０１ -.１９８ ０ -.５２ .０７４ -.７９２ .３７２ -.２７２ .２９７ -１．０４ １．０１６ -１．０４ ２．４７９ ０ １．４６２ １．０６５ ２．８７５ １．２１３ ３．０７４ .１４９ .１９８ ２．０９６ ３．２ ５．０７７ ４．４８７ .７０９ .３０６ １．２６２ .４８９ １．６９４ .６２５ .７１２ .２２７ １．３６ .１９５ １．８７１ .₁₁₈ .５₇₁ -." stroke-width="2"><path d="M5,
        <a href="https://www.youtube.com/@TaxGuideAfricaLLP" class="tg-social" aria-label="YouTube">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 15l5.19-3L10 9v6z"/><path d="M21.8 8s-.2-1.4-.8-2c-.7-.8-1.5-.8-1.9-.8C16.4 5 12 5 12 5s-4.4 0-7.1.2c-.4 0-1.2 0-1.9.8-.6.6-.8 2-.8 2S2 9.6 2.1 11c0 .8.3 1.6.7 2 .7.8 1.6.8 1.9.8C7.6 14 12 14 12 14s4.4 0 7.1-.2c.4 0 1.2 0 1.9-.8.6-.6.8-2 .8-2z"/></svg>
        </a>
      </div>
    </div>
  </footer>
  `;

  /* ── 6. INJECT INTO DOM ──────────────────────── */
  const existingMainNav = document.getElementById("mainNav");
  if (existingMainNav) {
    existingMainNav.remove();
  }

  const navWrapper = document.createElement("div");
  navWrapper.innerHTML = navHTML;
  document.body.prepend(navWrapper.firstElementChild);

  const existingFooter = document.querySelector("footer");
  const footerWrapper = document.createElement("div");
  footerWrapper.innerHTML = footerHTML;
  if (existingFooter) {
    existingFooter.replaceWith(footerWrapper.firstElementChild);
  } else {
    document.body.appendChild(footerWrapper.firstElementChild);
  }

  /* ── 7. NAV SCROLL ───────────────────────────── */
  const tgNav = document.getElementById("tg-nav");
  window.addEventListener(
    "scroll",
    () => {
      tgNav && tgNav.classList.toggle("scrolled", window.scrollY > 60);
    },
    { passive: true },
  );

  /* ── 8. MOBILE DRAWER ────────────────────────── */
  const hamburger =
    document.getElementById("tg-hamburger") ||
    document.getElementById("navHamburger");
  const mobileMenu =
    document.getElementById("tg-mobile-menu") ||
    document.getElementById("navMobileMenu");
  const drawerClose =
    document.getElementById("tg-drawer-close") ||
    document.getElementById("navMobileClose");

  hamburger?.addEventListener("click", () => mobileMenu.classList.add("open"));
  drawerClose?.addEventListener("click", () =>
    mobileMenu.classList.remove("open"),
  );
  mobileMenu?.addEventListener("click", (e) => {
    if (e.target === mobileMenu) mobileMenu.classList.remove("open");
  });

  /* ── 9. SERVICES MEGA-DROPDOWN HOVER TABS ────── */
  // Activate panel on tab mouseover
  document.addEventListener("mouseover", (e) => {
    const tab = e.target.closest(".tg-svc-tab");
    if (!tab) return;
    const id = tab.dataset.svc;

    // Update tab active state
    document
      .querySelectorAll(".tg-svc-tab")
      .forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    // Show matching panel
    document
      .querySelectorAll(".tg-svc-panel")
      .forEach((p) => p.classList.remove("active"));
    const panel = document.querySelector(`.tg-svc-panel[data-panel="${id}"]`);
    if (panel) panel.classList.add("active");
  });

  /* ── 10. BODY PADDING ────────────────────────── */
  if (!document.body.style.paddingTop) {
    document.body.style.paddingTop = "72px";
  }
})();
