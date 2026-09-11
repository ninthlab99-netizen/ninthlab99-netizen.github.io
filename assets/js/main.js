(function () {
  "use strict";

  document.getElementById("year").textContent = new Date().getFullYear();

    const state = { site: null, home: null, services: null, faq: null, contact: null, announcements: null, reviews: null, promotions: null, activeCategoryId: null };

  function el(tag, className, html) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (html !== undefined) node.innerHTML = html;
    return node;
  }

  async function loadJSON(path) {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error("無法載入 " + path);
    return res.json();
  }

  function applyText(id, value) {
    const node = document.getElementById(id);
    if (node && value !== undefined && value !== null) node.textContent = value;
  }

  function allCategories() {
    if (!state.services) return [];
    return [...state.services.core, ...state.services.other];
  }

  function findCategory(id) {
    return allCategories().find(c => c.id === id);
  }

  /* ---------------- LINE message generation ---------------- */

  function buildLineMessage(categoryName, issueLabel, isUnsure) {
    if (isUnsure) {
      return `您好，我的設備是 ${categoryName}，目前遇到異常，但我不確定是哪個問題，希望可以協助判斷。`;
    }
    return `您好，我想詢問 ${categoryName}「${issueLabel}」的維修，想請問維修費用及相關資訊，謝謝。`;
  }

  function buildOaMessageUrl(message) {
    const lineId = state.site.line_id;
    return "https://line.me/R/oaMessage/" + encodeURIComponent(lineId) + "/?" + encodeURIComponent(message);
  }

  function buildAddFriendUrl() {
    return "https://line.me/R/ti/p/" + encodeURIComponent(state.site.line_id);
  }

  function debounce(fn, wait) {
    let t;
    return function (...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), wait); };
  }

  /* ---------------- Tilt (drag/hover) effect ---------------- */

  const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function attachTilt(el) {
    if (prefersReducedMotion) return;
    const MAX = 6;
    function handleMove(clientX, clientY) {
      const rect = el.getBoundingClientRect();
      const px = (clientX - rect.left) / rect.width;
      const py = (clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * MAX * 2;
      const rotateX = (0.5 - py) * MAX * 2;
      el.style.transform = "perspective(900px) rotateX(" + rotateX.toFixed(2) + "deg) rotateY(" + rotateY.toFixed(2) + "deg) translateY(-2px)";
    }
    function reset() { el.style.transform = ""; }

    el.addEventListener("mousemove", (e) => handleMove(e.clientX, e.clientY));
    el.addEventListener("mouseleave", reset);
    el.addEventListener("touchmove", (e) => {
      if (e.touches && e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    el.addEventListener("touchend", reset);
  }

  /* ---------------- Click ripple effect ---------------- */

  function setupRippleDelegation() {
    const SELECTOR = ".btn, .issue-chip, .category-tab, .selector-card, .showcase-dot, .showcase-arrow";
    document.addEventListener("pointerdown", (e) => {
      const target = e.target.closest(SELECTOR);
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "ripple";
      const size = Math.max(rect.width, rect.height) * 1.6;
      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = (e.clientX - rect.left - size / 2) + "px";
      ripple.style.top = (e.clientY - rect.top - size / 2) + "px";
      const prevPosition = getComputedStyle(target).position;
      if (prevPosition === "static") target.style.position = "relative";
      target.classList.add("ripple-host");
      target.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove());
    });
  }

  /* ---------------- Header / Nav ---------------- */

  function renderHeaderAndNav() {
    const site = state.site;
    applyText("brand-name", site.brand_name);
    applyText("footer-brand", site.brand_name);
    applyText("reply-hours", site.reply_hours);
    applyText("footer-line-id", site.line_id);

    if (site.brand_name_zh) {
      applyText("footer-brand-zh", site.brand_name_zh);
    }

    const hoursLi = document.getElementById("footer-hours");
    if (site.business_hours) {
      hoursLi.textContent = "營業時間：" + site.business_hours;
      hoursLi.style.display = "";
    }

    document.querySelectorAll("#brand-logo, footer img[alt='NINTH LAB Logo']").forEach(img => {
      if (site.logo) img.src = site.logo;
    });

    const callBtn = document.getElementById("call-btn");
    const footerPhone = document.querySelector("#footer-phone a");
    if (site.phone) {
      callBtn.href = "tel:" + site.phone;
      callBtn.textContent = "撥打電話 " + (site.phone_display || site.phone);
      if (footerPhone) {
        footerPhone.href = "tel:" + site.phone;
        footerPhone.textContent = site.phone_display || site.phone;
      }
    }

    if (site.phone2) {
      const callBtn2 = document.getElementById("call-btn-2");
      callBtn2.href = "tel:" + site.phone2;
      callBtn2.textContent = "撥打電話 " + (site.phone2_display || site.phone2);
      callBtn2.style.display = "";

      const footerPhone2 = document.getElementById("footer-phone-2");
      footerPhone2.innerHTML = '<a href="tel:' + site.phone2 + '">' + (site.phone2_display || site.phone2) + "</a>";
      footerPhone2.style.display = "";
    }

    const lineBtn = document.getElementById("line-btn");
    lineBtn.href = buildAddFriendUrl();

    if (site.line_qr) document.querySelector(".qr-box img").src = site.line_qr;

    applyText("footer-areas", "服務地區：" + (site.service_areas || []).join("／"));
    applyText("footer-note", site.footer_note);

    // nav dropdown
    const dropdown = document.getElementById("services-dropdown");
    const mobileList = document.getElementById("mobile-services-list");
    dropdown.innerHTML = "";
    mobileList.innerHTML = "";
    allCategories().forEach(cat => {
      const a1 = el("a", null, cat.name);
      a1.href = "#items";
      a1.addEventListener("click", () => selectCategory(cat.id));
      dropdown.appendChild(a1);

      const a2 = el("a", "mobile-services-link", cat.name);
      a2.href = "#items";
      a2.addEventListener("click", () => { closeMobileMenu(); selectCategory(cat.id); });
      mobileList.appendChild(a2);
    });

    // footer other services list
    const footerOther = document.getElementById("footer-other-services");
    footerOther.innerHTML = "";
    state.services.other.forEach(cat => {
      footerOther.appendChild(el("li", null, cat.name));
    });
  }

  function setupNavInteractions() {
    const navItem = document.querySelector(".nav-item.has-dropdown");
    const btn = document.getElementById("services-nav-btn");
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const isOpen = navItem.classList.toggle("open");
      btn.setAttribute("aria-expanded", isOpen);
    });
    document.addEventListener("click", (e) => {
      if (!navItem.contains(e.target)) {
        navItem.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
      }
    });

    const hamburger = document.getElementById("hamburger-btn");
    const mobileMenu = document.getElementById("mobile-menu");
    hamburger.addEventListener("click", () => {
      const isOpen = mobileMenu.classList.toggle("open");
      hamburger.setAttribute("aria-expanded", isOpen);
    });

    const header = document.getElementById("site-header");
    const onScroll = () => {
      header.classList.toggle("scrolled", window.scrollY > 12);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function closeMobileMenu() {
    document.getElementById("mobile-menu").classList.remove("open");
    document.getElementById("hamburger-btn").setAttribute("aria-expanded", "false");
  }

  /* ---------------- Hero ---------------- */

  function renderHero() {
    const home = state.home;
    applyText("hero-eyebrow", home.hero?.eyebrow);
    applyText("hero-title", home.hero?.title);
    applyText("hero-subtitle", home.hero?.subtitle);
    applyText("hero-cta-primary", home.hero?.primary_cta);
    applyText("hero-cta-secondary", home.hero?.secondary_cta);
  }

  /* ---------------- Service selector ---------------- */

  const CATEGORY_ICONS = { iphone: "📱", android: "📱", computer: "💻", tablet: "📲", audio: "🔊", other3c: "🔧" };

  function renderSelector() {
    applyText("selector-title", state.home.selector?.title);
    applyText("selector-subtitle", state.home.selector?.subtitle);

    const grid = document.getElementById("selector-grid");
    grid.innerHTML = "";
    state.services.core.forEach(cat => {
      const card = el("div", "selector-card tilt-card");
      card.dataset.categoryId = cat.id;
      card.innerHTML =
        '<div class="selector-icon">' + (CATEGORY_ICONS[cat.id] || "") + "</div>" +
        "<h3>" + cat.name + "</h3>" +
        "<p>" + cat.tagline + "</p>";
      card.addEventListener("click", () => {
        selectCategory(cat.id);
        scrollToShowcase(cat.id);
      });
      grid.appendChild(card);
      attachTilt(card);
    });
  }

  function updateSelectorActive(id) {
    document.querySelectorAll(".selector-card").forEach(card => {
      card.classList.toggle("active", card.dataset.categoryId === id);
    });
  }

  /* ---------------- Showcase carousel ---------------- */

  let showcaseIndex = 0;

  function renderShowcase() {
    const track = document.getElementById("showcase-track");
    const dotsWrap = document.getElementById("showcase-dots");
    track.innerHTML = "";
    dotsWrap.innerHTML = "";

    state.services.core.forEach((cat, i) => {
      const slide = el("div", "showcase-slide tilt-card");
      slide.dataset.categoryId = cat.id;
      slide.innerHTML =
        '<img src="' + cat.image + '" alt="' + cat.name + ' 維修示意圖" loading="lazy">' +
        '<div class="showcase-slide-body">' +
        "<h3>" + cat.name + "</h3>" +
        '<p class="showcase-tagline">' + cat.tagline + "</p>" +
        (cat.note ? '<p class="showcase-note">' + cat.note + "</p>" : "") +
        '<a href="#items" class="btn btn-secondary showcase-cta">查看詳細項目</a>' +
        "</div>";
      slide.querySelector(".showcase-cta").addEventListener("click", () => selectCategory(cat.id));
      track.appendChild(slide);
      attachTilt(slide);

      const dot = el("div", "showcase-dot" + (i === 0 ? " active" : ""));
      dot.addEventListener("click", () => scrollShowcaseTo(i));
      dotsWrap.appendChild(dot);
    });

    document.getElementById("showcase-prev").addEventListener("click", () => scrollShowcaseTo(Math.max(0, showcaseIndex - 1)));
    document.getElementById("showcase-next").addEventListener("click", () => scrollShowcaseTo(Math.min(state.services.core.length - 1, showcaseIndex + 1)));

    track.addEventListener("scroll", debounce(() => {
      const slides = Array.from(track.children);
      const trackCenter = track.scrollLeft + track.clientWidth / 2;
      let closest = 0, closestDist = Infinity;
      slides.forEach((s, i) => {
        const dist = Math.abs((s.offsetLeft + s.clientWidth / 2) - trackCenter);
        if (dist < closestDist) { closestDist = dist; closest = i; }
      });
      showcaseIndex = closest;
      Array.from(dotsWrap.children).forEach((d, i) => d.classList.toggle("active", i === closest));
    }, 100), { passive: true });
  }

  function scrollShowcaseTo(index) {
    const track = document.getElementById("showcase-track");
    const slide = track.children[index];
    if (slide) slide.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  function scrollToShowcase(categoryId) {
    const idx = state.services.core.findIndex(c => c.id === categoryId);
    if (idx >= 0) {
      document.getElementById("showcase").scrollIntoView({ behavior: "smooth" });
      setTimeout(() => scrollShowcaseTo(idx), 350);
    }
  }

  /* ---------------- Category tabs + issue panels ---------------- */

  function renderItemsSection() {
    applyText("items-title", state.home.items_intro?.title);
    applyText("items-subtitle", state.home.items_intro?.subtitle);

    const tabsWrap = document.getElementById("category-tabs");
    const panelsWrap = document.getElementById("category-panels");
    tabsWrap.innerHTML = "";
    panelsWrap.innerHTML = "";

    state.services.core.forEach((cat, i) => {
      const tab = el("button", "category-tab" + (i === 0 ? " active" : ""), cat.name);
      tab.dataset.categoryId = cat.id;
      tab.addEventListener("click", () => selectCategory(cat.id));
      tabsWrap.appendChild(tab);

      panelsWrap.appendChild(buildIssuePanel(cat, i === 0));
    });

    state.activeCategoryId = state.services.core[0]?.id;
  }

  function buildIssuePanel(cat, isActive) {
    const panel = el("div", "category-panel" + (isActive ? " active" : ""));
    panel.dataset.categoryId = cat.id;

    if (cat.note) panel.appendChild(el("div", "category-note", cat.note));

    const chipsWrap = el("div", "issue-chips");
    const VISIBLE_COUNT = 6;
    cat.issues.forEach((issue, i) => {
      const chip = el("button", "issue-chip" + (i >= VISIBLE_COUNT ? " issue-hidden" : ""), issue);
      chip.addEventListener("click", () => selectIssue(cat, issue, false, chip, panel));
      chipsWrap.appendChild(chip);
    });
    const unsureChip = el("button", "issue-chip unsure", "不確定是哪裡壞的");
    unsureChip.addEventListener("click", () => selectIssue(cat, null, true, unsureChip, panel));
    chipsWrap.appendChild(unsureChip);

    if (cat.issues.length > VISIBLE_COUNT) {
      const moreBtn = el("button", "issue-more-btn", "查看更多");
      moreBtn.addEventListener("click", () => {
        chipsWrap.querySelectorAll(".issue-hidden").forEach(c => c.classList.remove("issue-hidden"));
        moreBtn.remove();
      });
      chipsWrap.appendChild(moreBtn);
    }

    panel.appendChild(chipsWrap);

    const confirmBox = el("div", "line-confirm");
    confirmBox.innerHTML =
      '<div class="line-confirm-label">將透過 LINE 傳送以下訊息給客服：</div>' +
      '<div class="line-confirm-text"></div>' +
      '<a href="#" target="_blank" rel="noopener" class="btn btn-primary">LINE 詢問此問題</a>';
    panel.appendChild(confirmBox);

    return panel;
  }

  function selectIssue(cat, issue, isUnsure, chipEl, panel) {
    panel.querySelectorAll(".issue-chip").forEach(c => c.classList.remove("selected"));
    chipEl.classList.add("selected");

    const message = buildLineMessage(cat.name, issue, isUnsure);
    const confirmBox = panel.querySelector(".line-confirm");
    confirmBox.querySelector(".line-confirm-text").textContent = message;
    confirmBox.querySelector("a").href = buildOaMessageUrl(message);
    confirmBox.classList.add("show");
  }

  function selectCategory(id) {
    state.activeCategoryId = id;
    document.querySelectorAll(".category-tab").forEach(t => t.classList.toggle("active", t.dataset.categoryId === id));
    document.querySelectorAll(".category-panel").forEach(p => p.classList.toggle("active", p.dataset.categoryId === id));
    updateSelectorActive(id);
  }

  /* ---------------- Other services ---------------- */

  function renderOtherServices() {
    applyText("other-services-title", state.home.other_services_title);
    const wrap = document.getElementById("other-panels");
    wrap.innerHTML = "";

    const grid = el("div", "other-grid");
    const withImage = state.services.other.filter(c => c.id !== "other3c");
    const other3c = state.services.other.find(c => c.id === "other3c");

    withImage.forEach(cat => {
      const card = el("div", "other-card tilt-card");
      if (cat.image) {
        const media = el("div", "other-card-media");
        media.innerHTML = '<img src="' + cat.image + '" alt="' + cat.name + ' 維修示意圖" loading="lazy">';
        card.appendChild(media);
      }
      const body = el("div", "other-card-body");
      body.innerHTML = "<h3>" + cat.name + "</h3>";
      if (cat.note) body.appendChild(el("div", "category-note", cat.note));

      const chipsWrap = el("div", "issue-chips");
      cat.issues.forEach(issue => {
        const chip = el("button", "issue-chip", issue);
        chip.addEventListener("click", () => selectIssue(cat, issue, false, chip, body));
        chipsWrap.appendChild(chip);
      });
      const unsureChip = el("button", "issue-chip unsure", "不確定是哪裡壞的");
      unsureChip.addEventListener("click", () => selectIssue(cat, null, true, unsureChip, body));
      chipsWrap.appendChild(unsureChip);
      body.appendChild(chipsWrap);

      const confirmBox = el("div", "line-confirm");
      confirmBox.innerHTML =
        '<div class="line-confirm-label">將透過 LINE 傳送以下訊息給客服：</div>' +
        '<div class="line-confirm-text"></div>' +
        '<a href="#" target="_blank" rel="noopener" class="btn btn-primary">LINE 詢問此問題</a>';
      body.appendChild(confirmBox);

      card.appendChild(body);
      grid.appendChild(card);
      attachTilt(card);
    });

    wrap.appendChild(grid);

    if (other3c) {
      const banner = el("div", "other3c-banner");
      banner.innerHTML = "<div><h3>" + other3c.name + "</h3><p>" + other3c.note + "</p></div>";
      const btn = el("a", "btn btn-primary", "LINE 詢問");
      btn.target = "_blank"; btn.rel = "noopener";
      btn.href = buildOaMessageUrl("您好，我有其他 3C 設備想詢問維修，方便請客服協助確認嗎？謝謝。");
      banner.appendChild(btn);
      wrap.appendChild(banner);
    }
  }

  /* ---------------- Process / Trust / Onsite ---------------- */

  function renderProcessTrustOnsite() {
    const home = state.home;
    const procList = document.getElementById("process-list");
    procList.innerHTML = "";
    (home.process || []).forEach(step => {
      const item = el("div", "process-item");
      item.innerHTML =
        '<div class="process-num">' + step.step + "</div>" +
        '<p class="process-title">' + step.title + "</p>" +
        (step.desc ? '<p class="process-desc">' + step.desc + "</p>" : "");
      procList.appendChild(item);
    });

    applyText("trust-title", home.trust?.title);
    applyText("trust-desc", home.trust?.desc);

    applyText("onsite-subtitle", home.onsite?.subtitle);
    applyText("onsite-title", home.onsite?.title);
    applyText("onsite-desc", home.onsite?.desc);
    applyText("onsite-cta", home.onsite?.cta);
  }

  /* ---------------- FAQ ---------------- */

  function renderFaq() {
    const wrap = document.getElementById("faq-list");
    wrap.innerHTML = "";
    (state.faq.items || []).forEach((item, i) => {
      const faqItem = el("div", "faq-item");
      const q = el("button", "faq-question");
      q.innerHTML = "<span>" + item.q + "</span><span class='faq-icon'>+</span>";
      const answer = el("div", "faq-answer");
      answer.innerHTML = '<div class="faq-answer-inner">' + item.a + "</div>";
      q.addEventListener("click", () => {
        const isOpen = faqItem.classList.contains("open");
        wrap.querySelectorAll(".faq-item").forEach(f => f.classList.remove("open"));
        if (!isOpen) faqItem.classList.add("open");
      });
      faqItem.appendChild(q);
      faqItem.appendChild(answer);
      wrap.appendChild(faqItem);
    });
  }

  /* ---------------- Contact ---------------- */

  function renderContact() {
    const contact = state.contact;
    applyText("contact-title", contact.title);
    applyText("contact-desc", contact.desc);
    applyText("contact-highlight", contact.highlight);
    const lineBtn = document.getElementById("line-btn");
    if (contact.line_button) lineBtn.textContent = contact.line_button;
  }

  /* ---------------- Announcements ---------------- */

  function renderAnnouncements() {
    const items = state.announcements?.items || [];
    const slot = document.getElementById("announcements-slot");
    if (!items.length) { slot.innerHTML = ""; return; }

    const section = el("section", null);
    section.id = "announcements";
    const wrap = el("div", "container");
    wrap.appendChild(el("div", "section-head", "<h2>最新公告</h2>"));
    const list = el("div", "announcement-list");
    items.forEach(item => {
      const card = el("div", "announcement-card");
      card.innerHTML =
        (item.date ? '<div class="announcement-date">' + item.date + "</div>" : "") +
        "<h3>" + item.title + "</h3>" +
        (item.content ? "<p>" + item.content + "</p>" : "");
      list.appendChild(card);
    });
    wrap.appendChild(list);
    section.appendChild(wrap);
    slot.innerHTML = "";
    slot.appendChild(section);
  }

/* ---------------- Battery promo ---------------- */ function renderBatteryPromo() { const promo = state.promotions?.battery_promo; const slot = document.getElementById("battery-promo-slot"); if (!promo || !promo.enabled) { slot.innerHTML = ""; return; } const section = el("section", "promo-section dark-panel"); const bg = el("div", "dark-panel-bg"); section.appendChild(bg); const wrap = el("div", "container", '<div style="position:relative;z-index:1;"></div>'); const inner = wrap.querySelector("div"); if (promo.badge) inner.appendChild(el("div", "promo-badge", promo.badge)); inner.appendChild(el("h2", "promo-title", promo.title || "")); if (promo.subtitle) inner.appendChild(el("p", "promo-subtitle", promo.subtitle)); const grid = el("div", "promo-grid"); (promo.items || []).forEach(function(item) { const card = el("div", "promo-item"); card.innerHTML = '<span class="promo-model">' + item.model + "</span>" + '<span class="promo-price">NT$ ' + item.price.toLocaleString() + "</span>"; grid.appendChild(card); }); inner.appendChild(grid); const cta = el("a", "btn btn-warm promo-cta", "LINE 詢問換電池"); cta.target = "_blank"; cta.rel = "noopener"; cta.href = buildOaMessageUrl("您好，我看到新開幕換電池優惠，想詢問我的 iPhone 換電池的相關細節，謝謝。"); inner.appendChild(cta); wrap.appendChild(inner); section.appendChild(wrap); slot.innerHTML = ""; slot.appendChild(section); }
  
  /* ---------------- Init ---------------- */

  async function init() {
    try {
      const [site, home, services, faq, contact, announcements, reviews, promotions] = await Promise.all([      
              loadJSON("content/site.json"), loadJSON("content/homepage.json"), loadJSON("content/services.json"), loadJSON("content/faq.json"), loadJSON("content/contact.json"), loadJSON("content/announcements.json"), loadJSON("content/reviews.json"), loadJSON("content/promotions.json") ]); state.site = site; state.home = home; state.services = services; state.faq = faq; state.contact = contact; state.announcements = announcements; state.reviews = reviews; state.promotions = promotions;

      document.title = site.seo?.title || document.title;
      const descTag = document.querySelector('meta[name="description"]');
      if (descTag && site.seo?.description) descTag.setAttribute("content", site.seo.description);

      renderHeaderAndNav();
      setupNavInteractions();
      setupRippleDelegation();
      renderHero();
      renderAnnouncements(); renderBatteryPromo();
      renderSelector();
      renderShowcase();
      renderItemsSection();
      renderOtherServices();
      renderProcessTrustOnsite();
      renderFaq();
      renderContact();
    } catch (err) {
      console.error(err);
    }
  }

  init();
})();
