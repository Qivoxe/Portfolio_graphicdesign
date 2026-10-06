/* ============================================================
   SHIVAM ROY — PORTFOLIO
   Vanilla JS only. No frameworks, no libraries.
   ============================================================ */
'use strict';

/* ------------------------------------------------------------
   0. Utilities
------------------------------------------------------------ */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const lerp = (a, b, t) => a + (b - a) * t;
const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------
   1. Page loader — 1.5s typography sequence, then clip away
------------------------------------------------------------ */
(function loader() {
  const loaderEl = $('#loader');
  // match the CSS bar (1.3s + delay) — total ~1.5s
  const total = prefersReduced ? 100 : 1500;
  window.addEventListener('load', () => {
    setTimeout(() => {
      loaderEl.classList.add('is-done');
      document.body.removeAttribute('data-loading');
      document.body.classList.add('is-loaded'); // triggers hero words
      setTimeout(() => loaderEl.remove(), 1100);
    }, total);
  });
  // Fallback if load event is slow (fonts etc.)
  setTimeout(() => {
    if (document.body.hasAttribute('data-loading')) {
      loaderEl.classList.add('is-done');
      document.body.removeAttribute('data-loading');
      document.body.classList.add('is-loaded');
      setTimeout(() => loaderEl.remove(), 1100);
    }
  }, 3500);
})();

/* ------------------------------------------------------------
   2. Navigation — shrink + translucent on scroll, active link
------------------------------------------------------------ */
(function nav() {
  const navEl = $('#nav');
  const links = $$('.nav__links a');
  const sections = links
    .map(a => $(a.getAttribute('href')))
    .filter(Boolean);

  const onScroll = () => {
    navEl.classList.toggle('is-scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(a =>
        a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => spy.observe(s));
})();

/* ------------------------------------------------------------
   3. Custom cursor — expands to "VIEW" on projects
------------------------------------------------------------ */
(function cursor() {
  if (isTouch) return;
  const cursorEl = $('#cursor');
  const label = $('#cursorLabel');
  let mx = innerWidth / 2, my = innerHeight / 2;
  let cx = mx, cy = my;

  document.body.classList.add('has-cursor');

  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
  window.addEventListener('mousedown', () => cursorEl.classList.add('is-down'));
  window.addEventListener('mouseup',   () => cursorEl.classList.remove('is-down'));

  // rAF loop — smooth trailing cursor
  (function raf() {
    cx = lerp(cx, mx, 0.22);
    cy = lerp(cy, my, 0.22);
    cursorEl.style.left = cx + 'px';
    cursorEl.style.top  = cy + 'px';
    requestAnimationFrame(raf);
  })();

  // delegate hover states
  document.addEventListener('mouseover', e => {
    const view = e.target.closest('[data-cursor="view"]');
    const link = e.target.closest('a, [data-cursor="link"]');
    if (view) { label.textContent = 'VIEW'; cursorEl.classList.add('is-view'); cursorEl.classList.remove('is-link'); }
    else if (link) { cursorEl.classList.add('is-link'); cursorEl.classList.remove('is-view'); }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('[data-cursor="view"], a, [data-cursor="link"]')) {
      cursorEl.classList.remove('is-view', 'is-link');
    }
  });
})();

/* ------------------------------------------------------------
   4. Hero — mouse-parallax composition (desktop only)
------------------------------------------------------------ */
(function heroParallax() {
  if (isTouch || prefersReduced) return;
  const comp = $('#heroComposition');
  if (!comp) return;
  const layers = $$('[data-depth]', comp);
  let tx = 0, ty = 0, x = 0, y = 0;

  window.addEventListener('mousemove', e => {
    tx = (e.clientX / innerWidth  - 0.5);
    ty = (e.clientY / innerHeight - 0.5);
  }, { passive: true });

  (function raf() {
    x = lerp(x, tx, 0.06);
    y = lerp(y, ty, 0.06);
    layers.forEach(el => {
      const d = parseFloat(el.dataset.depth);
      el.style.transform = `translate(${(-x * d).toFixed(2)}px, ${(-y * d).toFixed(2)}px)`;
    });
    requestAnimationFrame(raf);
  })();
})();

/* ------------------------------------------------------------
   5. Scroll reveals — IntersectionObserver
------------------------------------------------------------ */
(function reveals() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });

  $$('.reveal-line, .exp__stagewords').forEach(el => io.observe(el));

  // stagger capability list items
  const list = $('#capList');
  if (list) {
    const items = $$('li', list);
    items.forEach((li, i) => {
      li.style.opacity = '0';
      li.style.transform = 'translateY(24px)';
      li.style.transition = `opacity .8s var(--ease) ${i * 0.08}s, transform .8s var(--ease) ${i * 0.08}s,
                             padding .45s var(--ease), background-color .45s`;
    });
    const lio = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          items.forEach(li => { li.style.opacity = '1'; li.style.transform = 'none'; });
          lio.disconnect();
        }
      });
    }, { threshold: 0.3 });
    lio.observe(list);
  }
})();

/* ------------------------------------------------------------
   6. Magnetic buttons (contact CTA)
------------------------------------------------------------ */
(function magnetic() {
  if (isTouch || prefersReduced) return;
  $$('.magnetic').forEach(el => {
    let raf = null;
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `translate(${dx * 0.18}px, ${dy * 0.28}px)`;
      });
    });
    el.addEventListener('mouseleave', () => {
      cancelAnimationFrame(raf);
      el.style.transition = 'transform .6s var(--ease), color .5s var(--ease)';
      el.style.transform = 'translate(0, 0)';
      setTimeout(() => { el.style.transition = ''; }, 600);
    });
  });
})();

/* ------------------------------------------------------------
   7. Playground — Experiment 01: TYPE MOVES (cursor reactive)
------------------------------------------------------------ */
(function typeMoves() {
  if (isTouch || prefersReduced) return;
  const wrap = $('#expType');
  const letters = $$('#typeMoves span');
  if (!wrap) return;
  let raf = null, mx = 0, my = 0;

  wrap.addEventListener('mousemove', e => {
    const r = wrap.getBoundingClientRect();
    mx = (e.clientX - r.left) / r.width  - 0.5;
    my = (e.clientY - r.top)  / r.height - 0.5;
    if (!raf) raf = requestAnimationFrame(apply);
  });
  wrap.addEventListener('mouseleave', () => {
    cancelAnimationFrame(raf); raf = null;
    letters.forEach(s => { s.style.transform = ''; });
  });

  function apply() {
    raf = null;
    letters.forEach((s, i) => {
      const f = (i % 3 + 1) / 3; // per-letter variance
      s.style.transform =
        `translate(${mx * 44 * f}px, ${my * 34 * f}px) rotate(${mx * 5 * f}deg)`;
    });
  }
})();

/* ------------------------------------------------------------
   8. Playground — Experiment 02: infinite strip (JS-driven)
------------------------------------------------------------ */
(function strip() {
  const track = $('#stripTrack');
  if (!track || prefersReduced) return;
  let x = 0, paused = false, last = performance.now();
  const strip = track.closest('.strip');
  strip.addEventListener('mouseenter', () => paused = true);
  strip.addEventListener('mouseleave', () => paused = false);

  const half = () => track.children[0].offsetWidth;

  (function raf(now) {
    const dt = Math.min(now - last, 50); last = now;
    if (!paused) {
      x -= dt * 0.045; // px per ms — slow, intentional
      const h = half();
      if (h > 0 && -x >= h) x += h;
      track.style.transform = `translate3d(${x}px,0,0)`;
    }
    requestAnimationFrame(raf);
  })(last);
})();

/* ------------------------------------------------------------
   9. Playground — Experiment 03: distortion hover (CSS-driven)
   Handled in CSS (.distort). JS adds nothing — kept modular.

   Experiment 04: staged words — handled by reveal observer.
------------------------------------------------------------ */

/* ------------------------------------------------------------
   10. LEAFLOW horizontal gallery — drag + wheel (desktop)
------------------------------------------------------------ */
(function hscroll() {
  const track = $('#hscrollTrack');
  const wrap = $('#hscroll');
  if (!track || !wrap) return;

  // On mobile, native overflow scrolling takes over (CSS).
  if (isTouch) return;

  let target = 0, current = 0, max = 0, dragging = false, startX = 0, startTarget = 0;

  const measure = () => {
    max = Math.max(0, track.scrollWidth - wrap.clientWidth);
    target = Math.min(target, max);
  };
  measure();
  window.addEventListener('resize', measure);

  wrap.addEventListener('wheel', e => {
    // translate vertical wheel into horizontal glide while gallery is in view
    const r = wrap.getBoundingClientRect();
    const inView = r.top < innerHeight && r.bottom > 0;
    if (inView && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      const next = target + e.deltaY * 1.4;
      if ((next > 0 && next < max) ) { e.preventDefault(); target = next; }
    }
  }, { passive: false });

  wrap.addEventListener('pointerdown', e => {
    dragging = true; startX = e.clientX; startTarget = target;
    wrap.setPointerCapture(e.pointerId);
  });
  wrap.addEventListener('pointermove', e => {
    if (!dragging) return;
    target = Math.max(0, Math.min(max, startTarget - (e.clientX - startX) * 1.6));
  });
  const end = () => dragging = false;
  wrap.addEventListener('pointerup', end);
  wrap.addEventListener('pointercancel', end);

  (function raf() {
    current = lerp(current, target, 0.09);
    track.style.transform = `translate3d(${-current}px,0,0)`;
    requestAnimationFrame(raf);
  })();
})();

/* ------------------------------------------------------------
   11. Project modal — full-screen case study overlay
------------------------------------------------------------ */
const PROJECTS = {
  nova: {
    name: 'NOVA', tag: 'CULTURE IN MOTION',
    year: '2025', role: 'DESIGN & MOTION', category: 'GRAPHIC DESIGN / ART DIRECTION / MOTION',
    idea: 'NOVA is a festival celebrating moving culture — film, dance, performance. The identity needed to feel alive before anything moved: a poster system built on expanding rings, a strict two-typeface palette and one terracotta signal color carried across every surface.',
    process: 'We started with the ring — a single shape that could breathe, pulse and orbit. From there, a grid of festival posters, a 40-post Instagram campaign, printed flyers and a set of motion loops were all cut from the same system, so every touchpoint felt like one continuous gesture.',
    visual: 'Grotesk for information, serif for emotion. Ivory paper stock, terracotta ink, one olive accent. Motion loops exported as 6-second seamless cycles for screens around the venue.',
    final: 'The system shipped across 3 poster formats, 40+ social assets, wayfinding flyers and venue screens. Attendance grew 34% year over year — and the posters became collectibles.',
    imgs: ['assets/projects/nova-cover.png', 'assets/projects/nova-poster.png', 'assets/projects/proofmesh-cover.png'],
    alt: ['NOVA campaign overview', 'NOVA poster series', 'NOVA social system']
  },
  aurel: {
    name: 'AUREL', tag: 'VISUAL IDENTITY',
    year: '2025', role: 'ART DIRECTION & DESIGN', category: 'BRAND IDENTITY / GRAPHIC DESIGN',
    idea: 'AUREL is a slow-living lifestyle label. The identity is built on restraint: one serif wordmark, generous ivory space, and a quiet confidence that lets the products breathe.',
    process: 'Months of type exploration ended with a single decision — lowercase serif, wide tracking, nothing else. That decision scaled into stationery, packaging, a poster series and a social template kit the internal team could run themselves.',
    visual: 'A two-color print system (warm brown, terracotta) on uncoated stock. Every asset is composed on the same baseline grid, so the brand feels authored even when produced quickly.',
    final: 'Identity, packaging line, launch posters and a 30-piece social kit — delivered as a living guideline document, not a PDF graveyard.',
    imgs: ['assets/projects/aurel-cover.png', 'assets/projects/aurel-type.png', 'assets/images/hero-composition.png'],
    alt: ['AUREL identity system', 'AUREL type specimen', 'AUREL visual language']
  },
  framebase: {
    name: 'FRAMEBASE', tag: 'DIGITAL PRODUCT SYSTEM',
    year: '2026', role: 'PRODUCT DESIGNER', category: 'UI/UX / PRODUCT DESIGN',
    idea: 'Framebase is an analytics platform for video teams drowning in data. The goal: a dashboard that feels calm — dense information, clearly hierarchized, with motion used only to explain change.',
    process: 'Eight weeks from research to a shipped design system. We audited 40+ competitor screens, defined a token-based visual language, and designed every interaction state — hover, focus, loading, empty, error — before a single screen was considered done.',
    visual: 'A token-driven system: one type scale, a 4px spacing grid, semantic color roles and a component library covering 60+ patterns. Motion is capped at 300ms with a shared easing curve.',
    final: 'Dashboard, mobile companion app, full design system and interaction spec — adopted by three product teams and still growing.',
    imgs: ['assets/projects/framebase-cover.png', 'assets/projects/framebase-ui.png', 'assets/projects/leaflow-ui.png'],
    alt: ['Framebase dashboard', 'Framebase UI screens', 'Framebase mobile states']
  },
  proofmesh: {
    name: 'PROOFMESH', tag: 'DIGITAL EVIDENCE PLATFORM',
    year: '2025', role: 'UI/UX & VISUAL DESIGN', category: 'UI/UX / VISUAL DESIGN',
    idea: 'Proofmesh turns raw forensic data into evidence people can trust. The design problem was emotional as much as functional: interfaces that feel authoritative without feeling cold.',
    process: 'We designed around the idea of a paper evidence file — layered, annotated, tactile. Collage-like compositions in marketing, precise data-viz in product, one shared visual grammar between them.',
    visual: 'Warm neutrals replace the expected "security blue". Charts use terracotta and olive to encode meaning, with annotations treated like handwritten margin notes.',
    final: 'Product dashboard, data visualization library and responsive layouts shipped across web and tablet, with a 40-component viz kit.',
    imgs: ['assets/projects/proofmesh-cover.png', 'assets/projects/proofmesh-viz.png', 'assets/projects/framebase-cover.png'],
    alt: ['Proofmesh collage', 'Proofmesh data visualization', 'Proofmesh interface system']
  },
  leaflow: {
    name: 'LEAFLOW', tag: 'DIGITAL EXPERIENCE',
    year: '2026', role: 'UI/UX DESIGNER', category: 'UI/UX / VISUAL DESIGN',
    idea: 'Leafflow is a mindful finance app that treats attention as a budget. The experience needed to slow people down — opposite of every other finance product.',
    process: 'We prototyped the core loop in code before designing pixels: swipe to log, breathe to confirm. The visual system grew from those gestures — soft olive for calm states, terracotta only for moments that truly need you.',
    visual: 'A mobile-first visual system with oversized type, generous whitespace and motion tuned to 60fps spring physics. Every screen works one-handed.',
    final: 'Full mobile experience — onboarding, core loop, insights — with an interaction spec and a component library the dev team shipped in six weeks.',
    imgs: ['assets/projects/leaflow-cover.png', 'assets/projects/leafflow-ui.png', 'assets/images/play-form.png'],
    alt: ['Leafflow screens', 'Leafflow interaction design', 'Leafflow visual system']
  }
};
const PROJECT_ORDER = ['nova', 'aurel', 'framebase', 'proofmesh', 'leaflow'];

(function modal() {
  const modalEl = $('#modal');
  const panel = $('#modalPanel');
  const content = $('#modalContent');
  const closeBtn = $('#modalClose');
  const backdrop = $('#modalBackdrop');
  let lastFocus = null;

  function buildCase(key) {
    const p = PROJECTS[key];
    const idx = PROJECT_ORDER.indexOf(key);
    const nextKey = PROJECT_ORDER[(idx + 1) % PROJECT_ORDER.length];
    const next = PROJECTS[nextKey];
    const imgs = p.imgs.map((src, i) =>
      `<img src="${src}" alt="${p.alt[i]}" loading="lazy">`).join('');

    return `
      <div class="case">
        <div class="case__head">
          <h3 class="case__title">${p.name}<em>${p.tag}</em></h3>
          <div class="case__facts">
            <span><b>PROJECT</b>${p.name}</span>
            <span><b>YEAR</b>${p.year}</span>
            <span><b>ROLE</b>${p.role}</span>
            <span><b>CATEGORY</b>${p.category}</span>
          </div>
        </div>

        <div class="case__block"><h4>THE IDEA</h4><p>${p.idea}</p></div>
        <div class="case__block"><h4>THE PROCESS</h4><p>${p.process}</p></div>
        <div class="case__block"><h4>VISUAL SYSTEM</h4><p>${p.visual}</p></div>
        <div class="case__block"><h4>FINAL DESIGN</h4><p>${p.final}</p></div>

        <div class="case__imgs">${imgs}</div>

        <a href="#" class="case__next" data-next="${nextKey}">NEXT — ${next.name} &rarr;</a>
      </div>`;
  }

  function open(key) {
    lastFocus = document.activeElement;
    content.innerHTML = buildCase(key);
    modalEl.classList.add('is-open');
    modalEl.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    content.scrollTop = 0;
    closeBtn.focus({ preventScroll: true });
  }

  function close() {
    modalEl.classList.remove('is-open');
    modalEl.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }

  // open triggers
  $$('.project').forEach(card => {
    const openIt = () => open(card.dataset.project);
    card.addEventListener('click', openIt);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openIt(); }
    });
  });

  // next-project link inside modal
  content.addEventListener('click', e => {
    const next = e.target.closest('[data-next]');
    if (next) { e.preventDefault(); open(next.dataset.next); }
  });

  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modalEl.classList.contains('is-open')) close();
  });

  // subtle parallax of case images while modal scrolls
  content.addEventListener('scroll', () => {
    $$('.case__imgs img', content).forEach(img => {
      const r = img.getBoundingClientRect();
      const offset = (r.top + r.height / 2 - innerHeight / 2) * -0.03;
      img.style.transform = `translateY(${offset.toFixed(1)}px)`;
    });
  }, { passive: true });
})();

/* ------------------------------------------------------------
   12. Subtle image parallax across work visuals on scroll
------------------------------------------------------------ */
(function imageParallax() {
  if (isTouch || prefersReduced) return;
  const visuals = $$('.project__visual img');
  if (!visuals.length) return;
  let ticking = false;

  function update() {
    ticking = false;
    visuals.forEach(img => {
      const r = img.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const progress = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      img.style.setProperty('--par', progress.toFixed(3));
      img.style.translate = `0 ${(progress * -18).toFixed(1)}px`;
    });
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
})();
