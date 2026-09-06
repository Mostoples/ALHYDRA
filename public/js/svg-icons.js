/* ─────────────────────────────────────────────────────────
   svg-icons.js — ALHYDRA's own animated icon set

   Hand-drawn on a 24×24 grid, 1.7px strokes, round caps —
   one visual family, each with a moving part that says what
   the thing does (the pump spins, the tank fills, the leaf
   sways, the algae rises).

   Usage in markup:
       <i class="ai-icon" data-icon="tower"></i>
   Or from script:
       ALHYDRA.icons.render(el, 'tower');
       el.innerHTML = ALHYDRA.icons.get('tower');

   Motion classes (ai-spin, ai-sway, ai-rise, …) are defined
   in css/motion.css so a single stylesheet owns the timing.
───────────────────────────────────────────────────────── */
'use strict';

window.ALHYDRA = window.ALHYDRA || {};

ALHYDRA.icons = (() => {

  const open = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
               'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"';

  const SET = {

    /* the whole apparatus — column, side tubes, canopy, base */
    tower: `<svg ${open}>
      <path d="M10 6h4v13h-4z"/>
      <path d="M6 8v11M18 8v11" class="ai-blink"/>
      <path d="M4 21h16"/>
      <path d="M3 6h18" />
      <path d="M12 3v3"/>
      <circle cx="8.4" cy="10" r="1" fill="currentColor" stroke="none" class="ai-blink"/>
      <circle cx="15.6" cy="13" r="1" fill="currentColor" stroke="none" class="ai-blink ai-blink-2"/>
      <circle cx="8.4" cy="16" r="1" fill="currentColor" stroke="none" class="ai-blink ai-blink-3"/>
    </svg>`,

    /* microalgae photobioreactor — bubbles climb the tube */
    algae: `<svg ${open}>
      <rect x="8" y="3" width="8" height="18" rx="4"/>
      <circle cx="11" cy="16" r="1.15" fill="currentColor" stroke="none" class="ai-rise"/>
      <circle cx="13.4" cy="17" r="0.85" fill="currentColor" stroke="none" class="ai-rise ai-rise-2"/>
      <circle cx="12" cy="18" r="1"    fill="currentColor" stroke="none" class="ai-rise ai-rise-3"/>
      <path d="M8 12h8" opacity=".45"/>
    </svg>`,

    /* leaf — sways from the stem */
    leaf: `<svg ${open}>
      <g class="ai-sway">
        <path d="M12 21c0-7 3-11 8-12 0 7-3 11-8 12Z" fill="currentColor" fill-opacity=".16"/>
        <path d="M12 21c0-7-3-11-8-12 0 7 3 11 8 12Z" fill="currentColor" fill-opacity=".1"/>
        <path d="M12 21V11"/>
      </g>
    </svg>`,

    /* vertical-axis wind turbine — the rotor turns */
    wind: `<svg ${open}>
      <path d="M6 20h12M12 20V6"/>
      <g class="ai-spin">
        <ellipse cx="12" cy="6" rx="6" ry="2"/>
        <path d="M6 6c0 4 12 4 12 0"/>
      </g>
      <path d="M2 10h3M2 14h4" opacity=".55" class="ai-track"/>
    </svg>`,

    /* solar panel — a highlight sweeps the cells */
    solar: `<svg ${open}>
      <path d="M3 15h18l-2.4-8H5.4L3 15Z"/>
      <path d="M9.2 7 8 15M14.8 7 16 15M4.4 11h15.2" opacity=".55"/>
      <path d="M12 15v5M8 20h8"/>
      <path d="M6 11h12" class="ai-draw" opacity=".9"/>
    </svg>`,

    /* pump / circulation */
    pump: `<svg ${open}>
      <circle cx="12" cy="12" r="6.5"/>
      <g class="ai-spin">
        <path d="M12 12 12 6.2M12 12l5 2.9M12 12l-5 2.9"/>
      </g>
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/>
      <path d="M18.5 12H22M2 12h3.5"/>
    </svg>`,

    /* reservoir — the level breathes */
    tank: `<svg ${open}>
      <path d="M5 4h14v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4Z"/>
      <rect class="ai-fill-up" x="6.4" y="10" width="11.2" height="10.6" rx="1.4"
            fill="currentColor" fill-opacity=".25" stroke="none"/>
      <path d="M5 9h14" opacity=".45"/>
    </svg>`,

    /* droplet — pulses */
    drop: `<svg ${open}>
      <g class="ai-pulse">
        <path d="M12 3.5c3.4 4 5.4 6.6 5.4 9.2A5.4 5.4 0 0 1 12 18a5.4 5.4 0 0 1-5.4-5.3c0-2.6 2-5.2 5.4-9.2Z"
              fill="currentColor" fill-opacity=".16"/>
      </g>
      <path d="M9.4 13.2a2.7 2.7 0 0 0 2.6 2.4" opacity=".7"/>
    </svg>`,

    /* thermometer — the column rises and falls */
    temp: `<svg ${open}>
      <path d="M14 14.2V5a2 2 0 1 0-4 0v9.2a4 4 0 1 0 4 0Z"/>
      <rect class="ai-fill-up" x="11.1" y="9" width="1.8" height="8.6" rx=".9"
            fill="currentColor" stroke="none"/>
      <circle cx="12" cy="18" r="1.9" fill="currentColor" stroke="none"/>
    </svg>`,

    /* pH / lab flask */
    ph: `<svg ${open}>
      <path d="M9.5 3v6.2L4.8 17.4A2 2 0 0 0 6.5 20.5h11a2 2 0 0 0 1.7-3.1L14.5 9.2V3"/>
      <path d="M8.5 3h7"/>
      <path d="M7.2 14.6h9.6" opacity=".6"/>
      <circle cx="10.6" cy="17" r=".9" fill="currentColor" stroke="none" class="ai-rise"/>
      <circle cx="13.6" cy="17.6" r=".7" fill="currentColor" stroke="none" class="ai-rise ai-rise-2"/>
    </svg>`,

    /* live signal — bars breathe outward */
    signal: `<svg ${open}>
      <path d="M12 20v-4"/>
      <path d="M8.6 16.6a4.8 4.8 0 0 1 0-6.8M15.4 9.8a4.8 4.8 0 0 1 0 6.8" class="ai-blink"/>
      <path d="M5.8 19.4a8.8 8.8 0 0 1 0-12.4M18.2 7a8.8 8.8 0 0 1 0 12.4" class="ai-blink ai-blink-2"/>
      <circle cx="12" cy="13.2" r="1.6" fill="currentColor" stroke="none" class="ai-pulse"/>
    </svg>`,

    /* neural / AI */
    brain: `<svg ${open}>
      <circle cx="6"  cy="7"  r="2"/>
      <circle cx="6"  cy="17" r="2"/>
      <circle cx="18" cy="12" r="2"/>
      <circle cx="12" cy="5"  r="1.6"/>
      <circle cx="12" cy="19" r="1.6"/>
      <path d="M8 7.6 16.2 11M8 16.4 16.2 13M7.4 8.6 11 17.6M7.4 15.4 11 6.4" class="ai-track" opacity=".8"/>
    </svg>`,

    /* energy bolt */
    bolt: `<svg ${open}>
      <path d="M13.4 2 5 13.4h5.6L10 22l8.6-11.4H13L13.4 2Z"
            fill="currentColor" fill-opacity=".18" class="ai-pulse"/>
    </svg>`,

    /* cloud sync */
    cloud: `<svg ${open}>
      <path d="M7 18a4 4 0 0 1-.4-8A5.5 5.5 0 0 1 17.4 10 3.6 3.6 0 0 1 17 18H7Z"/>
      <path d="M12 12v5" class="ai-track"/>
      <path d="M9.8 15 12 17.4 14.2 15" class="ai-rise"/>
    </svg>`,

    /* gauge / dashboard */
    gauge: `<svg ${open}>
      <path d="M3.6 17a9 9 0 1 1 16.8 0"/>
      <g class="ai-sway" style="transform-origin:12px 17px">
        <path d="M12 17 16 11.6"/>
      </g>
      <circle cx="12" cy="17" r="1.5" fill="currentColor" stroke="none"/>
    </svg>`,

    /* growth chart */
    chart: `<svg ${open}>
      <path d="M4 4v16h16"/>
      <path d="M7.5 15.4 11 11.2l3 2.6 4.4-6" class="ai-draw"/>
      <circle cx="18.4" cy="7.8" r="1.5" fill="currentColor" stroke="none" class="ai-pulse"/>
    </svg>`,

    /* shield */
    shield: `<svg ${open}>
      <path d="M12 2.6 4.8 5.6v5.8c0 4.6 3 8.2 7.2 10 4.2-1.8 7.2-5.4 7.2-10V5.6L12 2.6Z"/>
      <path d="m8.8 12 2.3 2.4 4.1-4.6" class="ai-draw"/>
    </svg>`,

    /* seedling / sprout */
    sprout: `<svg ${open}>
      <path d="M12 21v-7"/>
      <g class="ai-sway">
        <path d="M12 14C8.7 14 6 11.4 6 8c3.3 0 6 2.6 6 6Z" fill="currentColor" fill-opacity=".16"/>
        <path d="M12 12c0-3.4 2.7-6 6-6 0 3.4-2.7 6-6 6Z"   fill="currentColor" fill-opacity=".12"/>
      </g>
      <path d="M7.5 21h9" opacity=".6"/>
    </svg>`
  };

  /** Return the raw SVG string for a name (empty string when unknown). */
  function get(name) { return SET[name] || ''; }

  /** Fill one element with an icon. */
  function render(el, name) {
    const svg = get(name);
    if (!svg) return false;
    el.innerHTML = svg;
    el.classList.add('ai-icon');
    el.setAttribute('aria-hidden', 'true');
    return true;
  }

  /** Hydrate every `[data-icon]` inside root (safe to re-run). */
  function hydrate(root = document) {
    root.querySelectorAll('[data-icon]:not([data-icon-done])').forEach(el => {
      if (render(el, el.dataset.icon)) el.dataset.iconDone = '1';
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => hydrate());
  else hydrate();

  /* Views that render their markup late can call hydrate() again;
     this catches the common case automatically. */
  if ('MutationObserver' in window) {
    let queued = false;
    new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; hydrate(); });
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  return { get, render, hydrate, names: () => Object.keys(SET) };
})();
