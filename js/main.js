/* ============================================================
   Main interactions — preloader, cursor, nav, GSAP reveals,
   counters, marquee, gallery + lightbox.
   ============================================================ */
(function () {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = typeof gsap !== 'undefined';
  if (hasGSAP && typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

  document.body.classList.add('is-loading');

  /* ---------- GALLERY DATA ---------- */
  const BASE = 'assets/img/projects/';
  const GALLERY = {
    automation: ['PXL_20260328_001658826.jpg','PXL_20260328_001716538.jpg','PXL_20260328_001733342.jpg','PXL_20260328_002546031.jpg','PXL_20260220_224438452.jpg','PXL_20250331_211817374.jpg','PXL_20240610_164100949.jpg','ApplicationFrameHost_sLRNpNe1Bs.jpg','ApplicationFrameHost_0RKTCYjqWb.jpg','ApplicationFrameHost_GW5VjsN5ze.jpg','ApplicationFrameHost_McMrGCH0m2.jpg','ApplicationFrameHost_VrswYv80zN.jpg','ApplicationFrameHost_drqZNDFkrz.jpg','ApplicationFrameHost_ow0rtNMSFP.jpg','ApplicationFrameHost_zKdku25d6Z.jpg','ApplicationFrameHost_ExyNcE5yRA.png','Picture1.jpg','Picture2.jpg','Picture3.jpg','Picture4.png','Picture5.png','Picture6.png','Picture10.jpg','Picture20.jpg','20161111_085500.jpg','20161111_085643.jpg','20180712_115826.jpg','20180712_115912.jpg'],
    design: ['PXL_20260318_204901655.jpg','PXL_20260318_205044218.jpg','PXL_20260318_205101942.jpg','IMG_20231109_100344.jpg','20190116_111810.jpg','20180712_115847.jpg','20180614_142623.jpg','20180614_142951.jpg','20170714_145528.jpg','20170119_161718.jpg','20170119_162009.jpg','20161111_085625.jpg','20161028_113533.jpg','20160324_140703.jpg','20160119_132850.jpg','20151030_151210_001.jpg','20151001_162624.jpg'],
    '3d': ['PXL_20260220_224027999.jpg','PXL_20250331_214304114.jpg','chrome_3NjH9J59oV.png','chrome_48Flgtljr6.png','chrome_CRBQl8Durp.png','chrome_NuGIeQhFc3.png','chrome_PiJYJsfj49.png','chrome_XTO4t08LnR.png','chrome_fg5jHFl03k.png','chrome_l3MqGTxLN5.png','chrome_pSQ1w6Vvu7.png','chrome_shy3pSdaxA.png']
  };
  const FOLDER = { automation: 'automation', design: 'design', '3d': '3d-prints' };
  const LABEL = { automation: 'Automation & Robotics', design: 'Manufacturing & Design', '3d': '3D Printing & Additive' };

  function buildGallery() {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return [];
    const flat = [];
    Object.keys(GALLERY).forEach((cat) => {
      GALLERY[cat].forEach((file) => {
        const src = BASE + FOLDER[cat] + '/' + file.replace(/\.(jpe?g|png)$/i, '.webp');
        const a = document.createElement('a');
        a.className = 'gallery__item';
        a.href = src;
        a.dataset.cat = cat;
        a.setAttribute('data-cursor', 'view');
        a.innerHTML = '<img src="' + src + '" alt="' + LABEL[cat] + '" loading="lazy" />';
        grid.appendChild(a);
        flat.push({ el: a, src: src, cat: cat, label: LABEL[cat] });
      });
    });
    return flat;
  }
  const galleryItems = buildGallery();

  /* ---------- GALLERY FILTER ---------- */
  const filters = document.getElementById('galleryFilters');
  if (filters) {
    filters.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      filters.querySelectorAll('button').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const f = btn.dataset.filter;
      galleryItems.forEach((it) => {
        it.el.classList.toggle('is-hidden', !(f === 'all' || it.cat === f));
      });
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    });
  }

  /* ---------- LIGHTBOX ---------- */
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  const lbCap = document.getElementById('lightboxCaption');
  let visibleList = [], lbIndex = 0;

  function openLightbox(item) {
    visibleList = galleryItems.filter((g) => !g.el.classList.contains('is-hidden'));
    lbIndex = visibleList.findIndex((g) => g.src === item.src);
    showLightbox();
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.classList.add('menu-open');
  }
  function showLightbox() {
    const it = visibleList[lbIndex];
    if (!it) return;
    lbImg.src = it.src;
    lbCap.textContent = it.label + '  —  ' + (lbIndex + 1) + ' / ' + visibleList.length;
  }
  function closeLightbox() {
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-open');
  }
  function step(n) { lbIndex = (lbIndex + n + visibleList.length) % visibleList.length; showLightbox(); }

  galleryItems.forEach((it) => {
    it.el.addEventListener('click', (e) => { e.preventDefault(); openLightbox(it); });
  });
  if (lb) {
    document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
    document.getElementById('lightboxNext').addEventListener('click', () => step(1));
    document.getElementById('lightboxPrev').addEventListener('click', () => step(-1));
    lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });
    window.addEventListener('keydown', (e) => {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    });
  }

  /* ---------- CUSTOM CURSOR ---------- */
  const cursor = document.getElementById('cursor');
  const cursorDot = document.getElementById('cursorDot');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (fine && cursor && cursorDot && hasGSAP) {
    const xTo = gsap.quickTo(cursor, 'x', { duration: 0.4, ease: 'power3' });
    const yTo = gsap.quickTo(cursor, 'y', { duration: 0.4, ease: 'power3' });
    const xDot = gsap.quickTo(cursorDot, 'x', { duration: 0.1, ease: 'power2' });
    const yDot = gsap.quickTo(cursorDot, 'y', { duration: 0.1, ease: 'power2' });
    window.addEventListener('mousemove', (e) => {
      xTo(e.clientX); yTo(e.clientY); xDot(e.clientX); yDot(e.clientY);
    });
    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest('[data-cursor]');
      cursor.classList.remove('is-hover', 'is-view');
      if (target) {
        cursor.classList.add(target.dataset.cursor === 'view' ? 'is-view' : 'is-hover');
      }
    });
  }

  /* ---------- NAV ---------- */
  const nav = document.getElementById('nav');
  let lastY = 0;
  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 40);
    if (y > lastY && y > 600 && !document.body.classList.contains('menu-open')) nav.classList.add('is-hidden');
    else nav.classList.remove('is-hidden');
    lastY = y;
    const sp = document.getElementById('scrollProgress');
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (sp) sp.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- MOBILE MENU ---------- */
  const burger = document.getElementById('navBurger');
  const mobileMenu = document.getElementById('mobileMenu');
  function toggleMenu(force) {
    const open = force !== undefined ? force : !mobileMenu.classList.contains('is-open');
    mobileMenu.classList.toggle('is-open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    nav.classList.toggle('menu-active', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
  }
  if (burger) {
    burger.addEventListener('click', () => toggleMenu());
    mobileMenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => toggleMenu(false)));
  }

  /* ---------- COUNTERS ---------- */
  function runCounters() {
    document.querySelectorAll('.counter').forEach((el) => {
      if (el.dataset.done) return;
      const target = parseFloat(el.dataset.target);
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      el.dataset.done = '1';
      if (reduceMotion || !hasGSAP) { el.textContent = prefix + target.toFixed(decimals) + suffix; return; }
      const obj = { v: 0 };
      gsap.to(obj, {
        v: target, duration: 1.8, ease: 'power2.out',
        onUpdate: () => { el.textContent = prefix + obj.v.toFixed(decimals) + suffix; }
      });
    });
  }

  /* ---------- MARQUEE ---------- */
  function initMarquee() {
    const track = document.getElementById('marqueeTrack');
    if (!track || !hasGSAP || reduceMotion) return;
    track.innerHTML += track.innerHTML; // duplicate for seamless loop
    const total = track.scrollWidth / 2;
    gsap.to(track, { x: -total, duration: 28, ease: 'none', repeat: -1 });
  }

  /* ---------- GSAP REVEALS ---------- */
  function initReveals() {
    if (!hasGSAP || typeof ScrollTrigger === 'undefined') {
      document.querySelectorAll('[data-reveal], .reveal-fade').forEach((el) => { el.style.opacity = 1; el.style.transform = 'none'; });
      runCounters();
      return;
    }
    if (reduceMotion) {
      gsap.set('[data-reveal], .reveal-fade', { opacity: 1, y: 0 });
      runCounters();
      return;
    }

    // Hero intro
    const heroTl = gsap.timeline({ delay: 0.15 });
    heroTl
      .from('.hero__eyebrow span', { yPercent: 120, opacity: 0, duration: 0.8, ease: 'power3.out' })
      .from('.hero__title .line span', { yPercent: 115, duration: 1, ease: 'power4.out', stagger: 0.08 }, '-=0.5')
      .from('.hero__tagline', { y: 24, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5')
      .from('.hero__actions', { y: 24, opacity: 0, duration: 0.7, ease: 'power3.out' }, '-=0.55')
      .from('.hero__scroll', { opacity: 0, duration: 0.6 }, '-=0.3')
      .from('.hero__meta', { opacity: 0, duration: 0.6, stagger: 0.1 }, '-=0.5');

    // Generic batch reveals
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 88%',
      onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, overwrite: true })
    });
    gsap.utils.toArray('.reveal-fade').forEach((el) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%' }
      });
    });

    // Split-word reveals
    gsap.utils.toArray('.reveal-words').forEach((el) => {
      const words = el.textContent.trim().split(/\s+/);
      el.innerHTML = words.map((w) => '<span class="word"><span>' + w + '</span></span>').join(' ');
      el.querySelectorAll('.word').forEach((w) => { w.style.overflow = 'hidden'; w.style.display = 'inline-block'; w.style.verticalAlign = 'top'; });
      gsap.from(el.querySelectorAll('.word span'), {
        yPercent: 115, duration: 0.9, ease: 'power4.out', stagger: 0.04,
        scrollTrigger: { trigger: el, start: 'top 85%' }
      });
    });

    // Counters trigger
    ScrollTrigger.create({ trigger: '.metrics', start: 'top 75%', once: true, onEnter: runCounters });

    // Subtle parallax on project media
    gsap.utils.toArray('.project__media img').forEach((img) => {
      gsap.fromTo(img, { yPercent: -6 }, {
        yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  }

  /* ---------- PRELOADER ---------- */
  function initPreloader() {
    const pre = document.getElementById('preloader');
    const bar = document.getElementById('preloaderBar');
    const count = document.getElementById('preloaderCount');
    let p = 0;
    const finish = () => {
      document.body.classList.remove('is-loading');
      if (pre) pre.classList.add('is-done');
      initReveals();
      initMarquee();
      onScroll();
    };
    if (!pre || reduceMotion || !hasGSAP) {
      if (bar) bar.style.width = '100%';
      if (count) count.textContent = '100';
      finish();
      return;
    }
    const tick = () => {
      p += Math.random() * 18 + 6;
      if (p >= 100) p = 100;
      bar.style.width = p + '%';
      count.textContent = Math.floor(p);
      if (p < 100) setTimeout(tick, 120 + Math.random() * 120);
      else setTimeout(finish, 350);
    };
    tick();
  }

  // year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  if (document.readyState === 'complete') initPreloader();
  else window.addEventListener('load', initPreloader);
})();
