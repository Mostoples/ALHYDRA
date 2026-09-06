/* ─────────────────────────────────────────────────────────
   motion.js — ALHYDRA motion layer (landing + SPA)

   · page-transition curtain between the landing page and /app
   · scroll reveal / parallax / tilt
   · the showreel player
   · lazy, connection-aware background video

   Loaded on both pages; every block no-ops when its markup
   is absent, so one file serves index.html and app.html.
───────────────────────────────────────────────────────── */
'use strict';

window.ALHYDRA = window.ALHYDRA || {};

ALHYDRA.motion = (() => {

  const reduced = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Some phones report a slow link or ask to save data — skip the
     decorative video there and let the poster carry the section. */
  const heavyMediaOK = () => {
    const c = navigator.connection;
    if (!c) return true;
    if (c.saveData) return false;
    return !/^(slow-2g|2g|3g)$/.test(c.effectiveType || '');
  };

  /* ── 1. Page-transition curtain ─────────────────────── */
  const MARK = `
    <svg viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <circle class="pcm-ring"   cx="50" cy="50" r="28" stroke="#10B981" stroke-width="2" stroke-linecap="round"/>
      <circle class="pcm-ring-2" cx="50" cy="50" r="21" stroke="#06B6D4" stroke-width="1.4" stroke-linecap="round" opacity=".7"/>
      <path   class="pcm-stem"   d="M50 70 V38" stroke="#5EEAD4" stroke-width="2.4" stroke-linecap="round"/>
      <g class="pcm-leaf" style="transform-box:fill-box;transform-origin:center">
        <path d="M50 44 C42 44 36 38 36 30 C46 30 50 36 50 44 Z" fill="#34D399"/>
        <path d="M50 50 C58 50 64 44 64 36 C54 36 50 42 50 50 Z" fill="#10B981"/>
      </g>
    </svg>`;

  function buildCurtain() {
    if (document.getElementById('page-curtain')) return document.getElementById('page-curtain');
    const el = document.createElement('div');
    el.id = 'page-curtain';
    el.className = 'is-idle';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML =
      '<div class="pc-blade"></div><div class="pc-blade"></div>' +
      '<div class="pc-blade"></div><div class="pc-blade"></div>' +
      `<div class="pc-mark">${MARK}</div>` +
      '<div class="pc-label">ALHYDRA</div>';
    document.body.appendChild(el);
    return el;
  }

  function leaveTo(url) {
    if (reduced()) { window.location.href = url; return; }
    const c = buildCurtain();
    c.classList.remove('is-idle', 'is-arriving');
    // force a reflow so the animation restarts even on a repeat click
    void c.offsetWidth;
    c.classList.add('is-leaving');
    sessionStorage.setItem('alhydra:transition', '1');
    setTimeout(() => { window.location.href = url; }, 620);
  }

  function arrive() {
    if (!sessionStorage.getItem('alhydra:transition')) return;
    sessionStorage.removeItem('alhydra:transition');
    if (reduced()) return;
    const c = buildCurtain();
    c.classList.remove('is-idle');
    c.classList.add('is-arriving');
    setTimeout(() => {
      c.classList.remove('is-arriving');
      c.classList.add('is-idle');
    }, 900);
  }

  /* Intercept navigation between the two documents. */
  function initCurtain() {
    arrive();
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href]');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

      let dest;
      try { dest = new URL(a.href); } catch { return; }
      if (dest.origin !== location.origin) return;
      if (dest.pathname === location.pathname) return;   // same document → let the hash work

      e.preventDefault();
      leaveTo(a.href);
    });
  }

  /* ── 2. Scroll reveal ───────────────────────────────── */
  function initReveal() {
    const targets = document.querySelectorAll('[data-reveal]');
    if (!targets.length) return;

    if (reduced() || !('IntersectionObserver' in window)) {
      targets.forEach(t => t.classList.add('revealed'));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        reveal(en.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

    const pending = new Set(targets);
    function reveal(el) {
      el.classList.add('revealed');
      pending.delete(el);
      io.unobserve(el);
      if (!pending.size) window.removeEventListener('scroll', sweep);
    }

    /* Belt-and-braces: some situations never deliver an intersection
       callback (restored scroll positions, background/throttled tabs,
       embedded contexts). Sweep on scroll until everything is out. */
    function sweep() {
      const vh = window.innerHeight;
      pending.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) reveal(el);
      });
    }

    targets.forEach(t => io.observe(t));
    window.addEventListener('scroll', sweep, { passive: true });
    requestAnimationFrame(sweep);
  }

  /* ── 3. Parallax (one rAF loop for every element) ───── */
  function initParallax() {
    const els = [...document.querySelectorAll('[data-parallax]')];
    if (!els.length || reduced()) return;

    let ticking = false;
    const frame = () => {
      const vh = window.innerHeight;
      els.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const speed = parseFloat(el.dataset.parallax) || 0.12;
        // 0 at the viewport centre, ± as the element travels away from it
        const offset = (r.top + r.height / 2 - vh / 2) * -speed;
        el.style.setProperty('--py', offset.toFixed(1) + 'px');
      });
      ticking = false;
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    frame();
  }

  /* ── 4. Pointer tilt ────────────────────────────────── */
  function initTilt() {
    if (reduced() || window.matchMedia('(pointer: coarse)').matches) return;
    document.querySelectorAll('[data-tilt]').forEach(el => {
      const max = parseFloat(el.dataset.tilt) || 6;
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width  - 0.5;
        const py = (e.clientY - r.top)  / r.height - 0.5;
        el.classList.add('is-tilting');
        el.style.transform =
          `perspective(900px) rotateY(${( px * max * 2).toFixed(2)}deg) ` +
          `rotateX(${(-py * max * 2).toFixed(2)}deg)`;
      });
      el.addEventListener('pointerleave', () => {
        el.classList.remove('is-tilting');
        el.style.transform = '';   // hand control back to the stylesheet
      });
    });
  }

  /* ── 5. Decorative background video ─────────────────── */
  function initAmbient() {
    document.querySelectorAll('video[data-ambient]').forEach(v => {
      // No motion budget: leave the element in place so its poster still
      // renders, and never fetch the video file.
      if (reduced() || !heavyMediaOK()) { v.removeAttribute('autoplay'); return; }

      v.muted = true; v.loop = true; v.playsInline = true;
      v.setAttribute('muted', ''); v.setAttribute('playsinline', '');

      const start = () => {
        v.play().then(() => v.classList.add('is-ready')).catch(() => {});
      };
      // only fetch once the section is close to the viewport
      const io = new IntersectionObserver(([en]) => {
        if (!en.isIntersecting) return;
        io.disconnect();
        v.querySelectorAll('source[data-src]').forEach(s => { s.src = s.dataset.src; });
        v.load();
        v.addEventListener('canplay', start, { once: true });
      }, { rootMargin: '300px' });
      io.observe(v);

      // stop burning battery when the tab or section is hidden
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) v.pause(); else if (v.classList.contains('is-ready')) v.play().catch(() => {});
      });
    });
  }

  /* ── 6. Video players ───────────────────────────────── */
  /* Every `[data-reel]` shell gets its own transport. Chapters are read from
     the `[data-reel-time]` buttons that sit alongside it, so the cue points
     live in the markup next to their labels rather than in a table here that
     has to be kept in step with the edit. */

  function fmt(s) {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60), r = Math.floor(s % 60);
    return m + ':' + String(r).padStart(2, '0');
  }

  function setupReel(shell) {
    const v      = shell.querySelector('video');
    if (!v) return;
    const fill   = shell.querySelector('.reel-fill');
    const track  = shell.querySelector('.reel-track');
    const time   = shell.querySelector('.reel-time');
    const toggle = shell.querySelectorAll('[data-reel-toggle]');
    const mute   = shell.querySelector('[data-reel-mute]');
    const full   = shell.querySelector('[data-reel-full]');

    const scope  = shell.closest('section') || document;
    const chips  = [...scope.querySelectorAll('[data-reel-time]')];
    const cues   = chips.map(c => parseFloat(c.dataset.reelTime) || 0);

    function onMeta() {
      if (track && v.duration && !track.querySelector('.reel-tick')) {
        cues.forEach(t => {
          if (t <= 0) return;
          const tick = document.createElement('span');
          tick.className = 'reel-tick';
          tick.style.left = (t / v.duration * 100).toFixed(2) + '%';
          track.appendChild(tick);
        });
      }
      if (time) time.textContent = '0:00 / ' + fmt(v.duration);
    }
    // Metadata can already be in by the time this runs (cached video, or
    // preload="metadata" finishing first), in which case the event never fires.
    v.addEventListener('loadedmetadata', onMeta);
    if (v.readyState >= 1) onMeta();

    const setPlaying = on => {
      shell.classList.toggle('is-playing', on);
      shell.classList.toggle('is-paused', !on);
      toggle.forEach(b => {
        const i = b.querySelector('i');
        if (i) i.className = on ? 'fa-solid fa-pause' : 'fa-solid fa-play';
      });
    };

    const play = () => v.play().then(() => setPlaying(true)).catch(() => {});
    toggle.forEach(b => b.addEventListener('click', () => (v.paused ? play() : v.pause())));
    v.addEventListener('play',  () => setPlaying(true));
    v.addEventListener('pause', () => setPlaying(false));
    v.addEventListener('ended', () => shell.classList.remove('is-playing', 'is-paused'));

    v.addEventListener('timeupdate', () => {
      if (!v.duration) return;
      const p = v.currentTime / v.duration;
      if (fill) fill.style.width = (p * 100).toFixed(2) + '%';
      if (time) time.textContent = fmt(v.currentTime) + ' / ' + fmt(v.duration);

      let idx = -1;
      cues.forEach((t, i) => { if (v.currentTime >= t) idx = i; });
      chips.forEach((c, i) => c.classList.toggle('is-current', i === idx));
    });

    if (track) {
      const seek = e => {
        const r = track.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
        if (v.duration) v.currentTime = p * v.duration;
      };
      track.addEventListener('pointerdown', e => {
        seek(e); track.setPointerCapture(e.pointerId);
        const move = ev => seek(ev);
        const up = () => {
          track.removeEventListener('pointermove', move);
          window.removeEventListener('pointerup', up);
        };
        track.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
      });
    }

    chips.forEach((c, i) => c.addEventListener('click', () => {
      v.currentTime = cues[i];
      play();
    }));

    if (mute) mute.addEventListener('click', () => {
      v.muted = !v.muted;
      const i = mute.querySelector('i');
      if (i) i.className = v.muted ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high';
    });

    if (full) full.addEventListener('click', () => {
      if (document.fullscreenElement) document.exitFullscreen();
      else shell.requestFullscreen?.();
    });

    // stop playback once the player scrolls away
    new IntersectionObserver(([en]) => {
      if (!en.isIntersecting && !v.paused) v.pause();
    }, { threshold: 0.25 }).observe(shell);
  }

  function initReels() {
    document.querySelectorAll('[data-reel]').forEach(setupReel);
  }

  /* ── init ───────────────────────────────────────────── */
  function init() {
    initCurtain();
    initReveal();
    initParallax();
    initTilt();
    initAmbient();
    initReels();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  return { leaveTo, reduced, heavyMediaOK, initReveal };
})();
