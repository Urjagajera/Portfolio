(() => {
  "use strict";

  const STORAGE_THEME = "portfolio.theme";
  const STORAGE_PROGRESS = "portfolio.progress.v1";
  const STORAGE_LAST_PORTAL = "portfolio.lastPortal";

  const prefersReducedMotion = () =>
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const isSmallScreen = () =>
    window.matchMedia && window.matchMedia("(max-width: 768px)").matches;

  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_PROGRESS);
      const parsed = raw ? JSON.parse(raw) : null;
      if (!parsed || typeof parsed !== "object") return { visited: {} };
      if (!parsed.visited || typeof parsed.visited !== "object") return { visited: {} };
      return parsed;
    } catch {
      return { visited: {} };
    }
  }

  function saveProgress(progress) {
    try {
      localStorage.setItem(STORAGE_PROGRESS, JSON.stringify(progress));
    } catch {
      // ignore
    }
  }

  function markVisited(sectionKey) {
    if (!sectionKey) return;
    const progress = loadProgress();
    progress.visited[sectionKey] = true;
    saveProgress(progress);
  }

  function setTheme(theme) {
    const html = document.documentElement;
    if (theme === "dark") html.setAttribute("data-theme", "dark");
    else html.removeAttribute("data-theme");
  }

  function getInitialTheme() {
    const saved = localStorage.getItem(STORAGE_THEME);
    if (saved === "dark" || saved === "light") return saved;
    const systemDark =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    return systemDark ? "dark" : "light";
  }

  function initThemeToggle() {
    setTheme(getInitialTheme());

    const nav = qs("header nav") || qs("nav");
    if (!nav) return;

    if (qs(".theme-toggle", nav)) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "theme-toggle";
    btn.setAttribute("aria-label", "Toggle dark mode");
    btn.title = "Toggle theme";

    const syncLabel = () => {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      btn.textContent = isDark ? "Dark" : "Light";
    };

    btn.addEventListener("click", () => {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      const next = isDark ? "light" : "dark";
      setTheme(next);
      localStorage.setItem(STORAGE_THEME, next);
      syncLabel();
    });

    syncLabel();
    nav.appendChild(btn);
  }

  function ensureTransitionOverlay() {
    let overlay = qs(".page-transition");
    if (overlay) return overlay;
    overlay = document.createElement("div");
    overlay.className = "page-transition";
    overlay.setAttribute("aria-hidden", "true");
    document.body.appendChild(overlay);
    return overlay;
  }

  function runPageTransition(variant = "enter") {
    if (prefersReducedMotion()) return Promise.resolve();
    const overlay = ensureTransitionOverlay();
    overlay.classList.add("is-entering");
    return new Promise((resolve) => {
      window.setTimeout(() => {
        overlay.classList.remove("is-entering");
        resolve();
      }, variant === "enter" ? 260 : 260);
    });
  }

  function initReturnToDashboard() {
    const isDashboard = location.pathname.endsWith("index.html") || location.pathname.endsWith("/");
    if (isDashboard) return;

    if (qs(".return-dashboard")) return;

    const a = document.createElement("a");
    a.className = "return-dashboard js-return-dashboard";
    a.href = "index.html";
    a.innerHTML = `
      <span class="return-dashboard__icon" aria-hidden="true">←</span>
      <span>Return to Dashboard</span>
    `;
    document.body.appendChild(a);
  }

  function initSmoothScrolling() {
    document.addEventListener("click", (event) => {
      const link = event.target instanceof Element ? event.target.closest("a") : null;
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#")) return;

      const target = qs(href);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
    });
  }

  function initPortalNavigation() {
    // Track current page visit (game progress)
    const file = (location.pathname.split("/").pop() || "").toLowerCase();
    if (file.includes("projects")) markVisited("projects");
    else if (file.includes("achievement")) markVisited("certificates");
    else if (file.includes("participation")) markVisited("participation");
    else if (file.includes("me")) {
      markVisited("about");
      if (location.hash && location.hash.toLowerCase().includes("contact")) markVisited("contact");
    } else if (file.includes("index") || file === "") {
      markVisited("dashboard");
    }

    // Portal click transitions (dashboard portals + return button)
    document.addEventListener("click", async (event) => {
      const portal = event.target instanceof Element ? event.target.closest(".js-portal") : null;
      const ret = event.target instanceof Element ? event.target.closest(".js-return-dashboard") : null;
      const target = portal || ret;
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Allow default for same-page hash portals (smooth scroll handles it)
      if (href.startsWith("#")) {
        const sectionKey = portal?.getAttribute("data-section");
        if (sectionKey) markVisited(sectionKey);
        return;
      }

      // Store last portal color to help dashboard feel continuous
      if (portal) {
        const c = portal.getAttribute("data-portal-color") || "";
        const sectionKey = portal.getAttribute("data-section") || "";
        if (sectionKey) markVisited(sectionKey);
        try {
          localStorage.setItem(STORAGE_LAST_PORTAL, JSON.stringify({ c, t: Date.now() }));
        } catch {
          // ignore
        }
      }

      event.preventDefault();
      await runPageTransition("enter");
      window.location.href = href;
    });
  }

  function initRevealAnimations() {
    const candidates = [
      ...qsa(".grid-item"),
      ...qsa(".project-card"),
      ...qsa(".experience-item"),
      ...qsa("main > section"),
    ];

    candidates.forEach((el) => el.classList.add("reveal"));
    if (prefersReducedMotion()) {
      candidates.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
    );

    candidates.forEach((el) => io.observe(el));
  }

  function initHeroMotion() {
    const hero = qs(".intro");
    if (!hero) return;

    if (!qs(".hero-orbs", hero)) {
      const orbs = document.createElement("div");
      orbs.className = "hero-orbs";
      orbs.setAttribute("aria-hidden", "true");
      orbs.innerHTML = `
        <span class="orb orb--1"></span>
        <span class="orb orb--2"></span>
        <span class="orb orb--3"></span>
      `;
      hero.prepend(orbs);
    }

    const disableParallax =
      prefersReducedMotion() || (window.matchMedia && window.matchMedia("(max-width: 768px)").matches);
    if (disableParallax) return;

    let rafId = 0;
    let targetX = 0;
    let targetY = 0;

    const update = () => {
      rafId = 0;
      hero.style.setProperty("--mx", `${targetX}px`);
      hero.style.setProperty("--my", `${targetY}px`);
    };

    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      targetX = x * 10;
      targetY = y * 10;
      if (!rafId) rafId = requestAnimationFrame(update);
    });

    hero.addEventListener("pointerleave", () => {
      targetX = 0;
      targetY = 0;
      if (!rafId) rafId = requestAnimationFrame(update);
    });
  }

  function initAccordionCertificates() {
    const grids = qsa(".grid");
    if (!grids.length) return;

    grids.forEach((grid) => {
      const items = qsa(".grid-item", grid);
      items.forEach((item, idx) => {
        const details = qs(".certificate-details", item);
        const hasCertificateImage = Boolean(qs("img.certificate-img", item));
        if (!details || !hasCertificateImage) return;

        // Make title row + button once (minimal HTML changes)
        if (!qs(".card-title", item)) {
          const strong = qs("strong", item);
          const titleText = strong ? strong.textContent.trim() : "Details";

          const titleRow = document.createElement("div");
          titleRow.className = "card-title";

          const title = document.createElement("div");
          title.textContent = titleText;

          const actions = document.createElement("div");
          actions.className = "card-actions";

          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "btn js-accordion-toggle";
          btn.textContent = "Details";

          const panelId = `cert-details-${Math.random().toString(16).slice(2)}-${idx}`;
          details.id = details.id || panelId;
          btn.setAttribute("aria-controls", details.id);
          btn.setAttribute("aria-expanded", "false");

          actions.appendChild(btn);
          titleRow.appendChild(title);
          titleRow.appendChild(actions);

          // Insert at the top, but keep original <strong> for content (we’ll visually replace it)
          item.insertBefore(titleRow, item.firstChild);
          if (strong) strong.style.display = "none";
        }

        // Collapse by default
        details.hidden = true;
      });

      // Event delegation (accordion style: one open at a time per grid)
      grid.addEventListener("click", (event) => {
        const btn =
          event.target instanceof Element
            ? event.target.closest(".js-accordion-toggle")
            : null;
        if (!btn) return;

        const id = btn.getAttribute("aria-controls");
        if (!id) return;

        const panel = document.getElementById(id);
        if (!panel) return;

        const isOpen = btn.getAttribute("aria-expanded") === "true";

        qsa(".js-accordion-toggle", grid).forEach((b) => b.setAttribute("aria-expanded", "false"));
        qsa(".certificate-details", grid).forEach((p) => (p.hidden = true));

        if (!isOpen) {
          btn.setAttribute("aria-expanded", "true");
          panel.hidden = false;
        }
      });
    });
  }

  function initCounters() {
    const counters = qsa("[data-count-to]");
    if (!counters.length) return;

    const animate = (el) => {
      const to = Number(el.getAttribute("data-count-to") || "0");
      if (!Number.isFinite(to)) return;

      const suffix = el.getAttribute("data-count-suffix") || "";
      const duration = Number(el.getAttribute("data-count-duration") || "1200");
      const start = performance.now();

      const from = Number(el.getAttribute("data-count-from") || "0");
      const easeOut = (t) => 1 - Math.pow(1 - t, 3);

      const tick = (now) => {
        const t = Math.min(1, (now - start) / Math.max(300, duration));
        const value = Math.round(from + (to - from) * easeOut(t));
        el.textContent = `${value}${suffix}`;
        if (t < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    };

    if (prefersReducedMotion()) {
      counters.forEach((el) => {
        const to = el.getAttribute("data-count-to") || "0";
        const suffix = el.getAttribute("data-count-suffix") || "";
        el.textContent = `${to}${suffix}`;
      });
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animate(entry.target);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.35 }
    );

    counters.forEach((el) => io.observe(el));
  }

  function ensureModal() {
    let modal = qs(".modal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.className = "modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-hidden", "true");

    modal.innerHTML = `
      <div class="modal__dialog">
        <div class="modal__bar">
          <div class="modal__title" data-modal-title>Preview</div>
          <button type="button" class="btn" data-modal-close>Close</button>
        </div>
        <div class="modal__content">
          <img class="modal__img" alt="" />
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    return modal;
  }

  function initImageModal() {
    const modal = ensureModal();
    const imgEl = qs(".modal__img", modal);
    const titleEl = qs("[data-modal-title]", modal);
    const closeBtn = qs("[data-modal-close]", modal);

    const close = () => {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      imgEl.removeAttribute("src");
      imgEl.alt = "";
    };

    closeBtn?.addEventListener("click", close);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("is-open")) close();
    });

    document.addEventListener("click", (event) => {
      const img =
        event.target instanceof Element ? event.target.closest("img.certificate-img") : null;
      if (!img) return;

      const src = img.getAttribute("src");
      if (!src) return;

      const alt = img.getAttribute("alt") || "Certificate image";
      titleEl.textContent = alt;
      imgEl.src = src;
      imgEl.alt = alt;

      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
    });
  }

  function inferTagsFromText(text) {
    const t = (text || "").toLowerCase();
    const tags = new Set();
    if (t.includes("hackathon")) tags.add("Hackathon");
    if (t.includes("volunteer") || t.includes("volunteering")) tags.add("Volunteering");
    if (t.includes("course") || t.includes("coursera") || t.includes("learn")) tags.add("Courses");
    if (t.includes("workshop") || t.includes("session") || t.includes("seminar")) tags.add("Workshops");
    if (t.includes("participation") || t.includes("participated")) tags.add("Participation");
    if (t.includes("achievement") || t.includes("badge") || t.includes("problems solved"))
      tags.add("Achievements");
    return Array.from(tags);
  }

  function initAutoFilters() {
    const grid = qs("main .grid");
    if (!grid) return;

    const items = qsa(".grid-item", grid);
    if (items.length < 6) return; // avoid noise on tiny lists

    // Assign inferred tags once if missing
    items.forEach((item) => {
      if (item.getAttribute("data-tags")) return;
      const title = (qs(".card-title", item)?.textContent || qs("strong", item)?.textContent || "").trim();
      const details = qs(".certificate-details", item)?.textContent || "";
      const tags = inferTagsFromText(`${title} ${details}`);
      if (tags.length) item.setAttribute("data-tags", tags.join(","));
    });

    const allTags = new Set();
    items.forEach((item) => {
      (item.getAttribute("data-tags") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((tag) => allTags.add(tag));
    });

    const tags = ["All", ...Array.from(allTags)];
    if (tags.length <= 2) return;

    if (qs(".filters")) return;

    const bar = document.createElement("div");
    bar.className = "filters";
    bar.setAttribute("data-filter-bar", "true");

    const makeChip = (label) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "filter-chip";
      b.textContent = label;
      b.setAttribute("aria-pressed", label === "All" ? "true" : "false");
      b.dataset.filter = label;
      return b;
    };

    tags.forEach((t) => bar.appendChild(makeChip(t)));
    grid.parentElement?.insertBefore(bar, grid);

    bar.addEventListener("click", (event) => {
      const chip = event.target instanceof Element ? event.target.closest(".filter-chip") : null;
      if (!chip) return;

      const selected = chip.dataset.filter || "All";
      qsa(".filter-chip", bar).forEach((c) =>
        c.setAttribute("aria-pressed", c === chip ? "true" : "false")
      );

      items.forEach((item) => {
        const itemTags = (item.getAttribute("data-tags") || "")
          .split(",")
          .map((s) => s.trim());
        const show = selected === "All" || itemTags.includes(selected);
        item.style.display = show ? "" : "none";
      });
    });
  }

  function initContactForm() {
    const contactForm = qs("#contactForm") || qs("form");
    if (!contactForm) return;

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());

    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = (qs("input[type='text']", contactForm)?.value || "").trim();
      const email = (qs("input[type='email']", contactForm)?.value || "").trim();
      const queries = (qs("textarea", contactForm)?.value || "").trim();

      if (!name || !email || !queries) {
        alert("Please fill in all fields.");
        return;
      }
      if (!validateEmail(email)) {
        alert("Please enter a valid email address.");
        return;
      }

      alert(`Thank you, ${name}! Your message has been sent.`);
      contactForm.reset();
    });
  }

  function initProjectCards() {
    const grid = qs(".project-grid");
    if (!grid) return;

    qsa(".project-card", grid).forEach((card) => {
      const details = qs(".project-details", card);
      if (!details) return;
      card.classList.remove("is-open");
      details.setAttribute("aria-hidden", "true");
    });

    grid.addEventListener("click", (event) => {
      const btn =
        event.target instanceof Element ? event.target.closest(".js-project-toggle") : null;
      if (!btn) return;

      const card = btn.closest(".project-card");
      if (!card) return;

      const details = qs(".project-details", card);
      if (!details) return;

      const isOpen = card.classList.contains("is-open");
      card.classList.toggle("is-open", !isOpen);
      btn.setAttribute("aria-expanded", isOpen ? "false" : "true");
      details.setAttribute("aria-hidden", isOpen ? "true" : "false");
      btn.textContent = isOpen ? "View Details" : "Hide Details";
    });
  }

  function initCursorGlow() {
    if (prefersReducedMotion() || isSmallScreen()) return;
    if (qs(".cursor-glow")) return;

    const glow = document.createElement("div");
    glow.className = "cursor-glow";
    glow.setAttribute("aria-hidden", "true");
    document.body.appendChild(glow);

    let rafId = 0;
    let x = -999;
    let y = -999;
    let activeColor = "rgba(102, 182, 255, 0.18)";

    const update = () => {
      rafId = 0;
      glow.style.transform = `translate3d(${x - 130}px, ${y - 130}px, 0)`;
      glow.style.background = `radial-gradient(circle at 50% 50%, ${activeColor}, transparent 60%)`;
    };

    document.addEventListener("pointermove", (e) => {
      x = e.clientX;
      y = e.clientY;
      if (!rafId) rafId = requestAnimationFrame(update);
      glow.classList.add("is-on");
    });

    document.addEventListener("pointerleave", () => {
      glow.classList.remove("is-on");
    });

    document.addEventListener("mouseover", (e) => {
      const p = e.target instanceof Element ? e.target.closest(".portal") : null;
      if (!p) return;
      const style = getComputedStyle(p);
      const c = style.getPropertyValue("--p").trim();
      activeColor = c ? `color-mix(in srgb, ${c}, transparent 82%)` : "rgba(102, 182, 255, 0.18)";
    });
  }

  function initProgressUI() {
    const progressText = qs("[data-progress-text]");
    const fill = qs("[data-progress-fill]");
    const bar = qs(".progress-bar");
    if (!progressText || !fill || !bar) return;

    const progress = loadProgress();
    const keys = ["projects", "certificates", "skills", "about", "contact", "participation"];
    const visitedCount = keys.filter((k) => progress.visited[k]).length;
    const pct = Math.round((visitedCount / keys.length) * 100);

    progressText.textContent = `${pct}%`;
    fill.style.width = `${pct}%`;
    bar.setAttribute("aria-valuenow", String(pct));
  }

  function initTicTacToeWidget() {
    if (qs(".ttt-widget")) return;

    const widget = document.createElement("aside");
    widget.className = "ttt-widget is-minimized";
    widget.setAttribute("aria-label", "Tic Tac Toe widget");
    widget.innerHTML = `
      <button type="button" class="ttt-toggle" aria-expanded="false" aria-controls="ttt-panel">Tic Tac Toe</button>
      <section class="ttt-panel" id="ttt-panel" hidden>
        <div class="ttt-head">
          <strong>Tic Tac Toe</strong>
          <button type="button" class="btn ttt-reset">Reset</button>
        </div>
        <p class="ttt-status" aria-live="polite">Player X's turn</p>
        <div class="ttt-board" role="grid" aria-label="Tic Tac Toe Board">
          <button class="ttt-cell" type="button" data-idx="0" role="gridcell" aria-label="Cell 1"></button>
          <button class="ttt-cell" type="button" data-idx="1" role="gridcell" aria-label="Cell 2"></button>
          <button class="ttt-cell" type="button" data-idx="2" role="gridcell" aria-label="Cell 3"></button>
          <button class="ttt-cell" type="button" data-idx="3" role="gridcell" aria-label="Cell 4"></button>
          <button class="ttt-cell" type="button" data-idx="4" role="gridcell" aria-label="Cell 5"></button>
          <button class="ttt-cell" type="button" data-idx="5" role="gridcell" aria-label="Cell 6"></button>
          <button class="ttt-cell" type="button" data-idx="6" role="gridcell" aria-label="Cell 7"></button>
          <button class="ttt-cell" type="button" data-idx="7" role="gridcell" aria-label="Cell 8"></button>
          <button class="ttt-cell" type="button" data-idx="8" role="gridcell" aria-label="Cell 9"></button>
        </div>
      </section>
    `;
    document.body.appendChild(widget);

    const panel = qs(".ttt-panel", widget);
    const toggle = qs(".ttt-toggle", widget);
    const status = qs(".ttt-status", widget);
    const boardEl = qs(".ttt-board", widget);
    const cells = qsa(".ttt-cell", widget);
    const resetBtn = qs(".ttt-reset", widget);

    let board = Array(9).fill("");
    let current = "X";
    let winner = "";

    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];

    const openPanel = () => {
      widget.classList.remove("is-minimized");
      toggle.setAttribute("aria-expanded", "true");
      panel.hidden = false;
    };

    const closePanel = () => {
      widget.classList.add("is-minimized");
      toggle.setAttribute("aria-expanded", "false");
      panel.hidden = true;
    };

    const render = () => {
      cells.forEach((cell, i) => {
        cell.textContent = board[i];
        cell.disabled = Boolean(board[i]) || Boolean(winner);
      });

      if (winner) {
        status.textContent = winner === "draw" ? "It's a draw" : `Player ${winner} wins`;
        widget.classList.add("is-win");
      } else {
        status.textContent = `Player ${current}'s turn`;
        widget.classList.remove("is-win");
      }
    };

    const checkWinner = () => {
      for (const [a, b, c] of lines) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
      }
      if (board.every(Boolean)) return "draw";
      return "";
    };

    const reset = () => {
      board = Array(9).fill("");
      current = "X";
      winner = "";
      render();
    };

    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      if (expanded) closePanel();
      else openPanel();
    });

    boardEl.addEventListener("click", (event) => {
      const cell = event.target instanceof Element ? event.target.closest(".ttt-cell") : null;
      if (!cell || winner) return;
      const idx = Number(cell.getAttribute("data-idx"));
      if (!Number.isInteger(idx) || board[idx]) return;

      board[idx] = current;
      winner = checkWinner();
      if (!winner) current = current === "X" ? "O" : "X";
      render();
    });

    resetBtn?.addEventListener("click", reset);
    render();
  }

  document.addEventListener("DOMContentLoaded", () => {
    initThemeToggle();
    initHeroMotion();
    initPortalNavigation();
    initReturnToDashboard();
    initSmoothScrolling();
    initRevealAnimations();
    initAccordionCertificates();
    initCounters();
    initImageModal();
    initAutoFilters(); // bonus (auto-infers tags)
    initContactForm();
    initProjectCards();
    initTicTacToeWidget();
    initCursorGlow();
    initProgressUI();
  });
})();
