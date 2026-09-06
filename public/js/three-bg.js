/* ─────────────────────────────────────────────────────────
   three-bg.js — ALHYDRA generative hero backdrop

   An original scene built from the system's own motifs:
     · three intertwined helices  → the tower's helical net-pot pitch
     · a drifting bokeh field     → microalgae in suspension
     · two counter-rotating rings → the solar wings / turbine axis
     · a sparse link mesh         → the sensor network

   Progressive enhancement: if WebGL, three.js, or the budget
   for it is missing, the hero simply keeps its CSS background and
   nothing here runs.
───────────────────────────────────────────────────────── */
'use strict';

(function () {
  const MOUNT = 'three-hero';

  function affordable() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    if (navigator.connection?.saveData) return false;
    if (navigator.deviceMemory && navigator.deviceMemory < 3) return false;
    if (window.innerWidth < 620) return false;          // phones keep the static hero
    try {
      const c = document.createElement('canvas');
      return !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch { return false; }
  }

  function boot() {
    const mount = document.getElementById(MOUNT);
    if (!mount || typeof THREE === 'undefined') return;

    const W = () => mount.clientWidth  || window.innerWidth;
    const H = () => mount.clientHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(W(), H());
    mount.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    scene.fog    = new THREE.FogExp2(0x080d18, 0.036);
    const camera = new THREE.PerspectiveCamera(52, W() / H(), 0.1, 120);
    camera.position.set(0, 0.4, 17);

    /* ── a soft round sprite, drawn once into a canvas ── */
    function dot(hex) {
      const s = 64, c = document.createElement('canvas');
      c.width = c.height = s;
      const g = c.getContext('2d');
      const rg = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      rg.addColorStop(0.00, hex + 'ff');
      rg.addColorStop(0.35, hex + 'aa');
      rg.addColorStop(1.00, hex + '00');
      g.fillStyle = rg;
      g.fillRect(0, 0, s, s);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace ?? t.colorSpace;
      return t;
    }
    const spriteTeal  = dot('#5eead4');
    const spriteGreen = dot('#10b981');
    const spriteAmber = dot('#f5b342');

    const group = new THREE.Group();
    scene.add(group);

    /* ── 1. Three intertwined helices ─────────────────── */
    const STRANDS = 3, PER = 150, TURNS = 3.4, HEIGHT = 17, RAD = 2.45;
    const helixPos = [];
    const nodes = [];                        // kept for the link mesh
    for (let s = 0; s < STRANDS; s++) {
      const phase = (s / STRANDS) * Math.PI * 2;
      for (let i = 0; i < PER; i++) {
        const t = i / (PER - 1);
        const a = phase + t * Math.PI * 2 * TURNS;
        const r = RAD * (1 + 0.07 * Math.sin(t * Math.PI * 3));
        const v = new THREE.Vector3(Math.cos(a) * r, (t - 0.5) * HEIGHT, Math.sin(a) * r);
        helixPos.push(v.x, v.y, v.z);
        if (i % 9 === 0) nodes.push(v);
      }
    }
    const helixGeo = new THREE.BufferGeometry();
    helixGeo.setAttribute('position', new THREE.Float32BufferAttribute(helixPos, 3));
    const helix = new THREE.Points(helixGeo, new THREE.PointsMaterial({
      size: 0.19, map: spriteGreen, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, opacity: 0.9, sizeAttenuation: true
    }));
    group.add(helix);

    /* ── 2. Sensor link mesh between nearby helix nodes ── */
    const linkPts = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].distanceTo(nodes[j]) < 3.1) {
          linkPts.push(nodes[i].x, nodes[i].y, nodes[i].z, nodes[j].x, nodes[j].y, nodes[j].z);
        }
      }
    }
    const linkGeo = new THREE.BufferGeometry();
    linkGeo.setAttribute('position', new THREE.Float32BufferAttribute(linkPts, 3));
    group.add(new THREE.LineSegments(linkGeo, new THREE.LineBasicMaterial({
      color: 0x0ea5a0, transparent: true, opacity: 0.11,
      blending: THREE.AdditiveBlending, depthWrite: false
    })));

    /* ── 3. Drifting algae field ──────────────────────── */
    const N = 720;
    const cloud = new Float32Array(N * 3);
    const speed = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      cloud[i * 3]     = (Math.random() - 0.5) * 30;
      cloud[i * 3 + 1] = (Math.random() - 0.5) * 24;
      cloud[i * 3 + 2] = (Math.random() - 0.5) * 20 - 3;
      speed[i] = 0.006 + Math.random() * 0.020;
    }
    const cloudGeo = new THREE.BufferGeometry();
    cloudGeo.setAttribute('position', new THREE.BufferAttribute(cloud, 3));
    const cloudPts = new THREE.Points(cloudGeo, new THREE.PointsMaterial({
      size: 0.30, map: spriteTeal, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, opacity: 0.42, sizeAttenuation: true
    }));
    scene.add(cloudPts);

    /* a handful of warm motes for the solar accent */
    const M = 46, warm = new Float32Array(M * 3);
    for (let i = 0; i < M; i++) {
      warm[i * 3]     = (Math.random() - 0.5) * 26;
      warm[i * 3 + 1] = (Math.random() - 0.5) * 18;
      warm[i * 3 + 2] = (Math.random() - 0.5) * 14 - 2;
    }
    const warmGeo = new THREE.BufferGeometry();
    warmGeo.setAttribute('position', new THREE.BufferAttribute(warm, 3));
    scene.add(new THREE.Points(warmGeo, new THREE.PointsMaterial({
      size: 0.42, map: spriteAmber, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, opacity: 0.5
    })));

    /* ── 4. Counter-rotating rings ────────────────────── */
    function ring(radius, tube, color, opacity) {
      const g = new THREE.TorusGeometry(radius, tube, 3, 128);
      const m = new THREE.MeshBasicMaterial({
        color, wireframe: true, transparent: true, opacity,
        blending: THREE.AdditiveBlending, depthWrite: false
      });
      return new THREE.Mesh(g, m);
    }
    const ringA = ring(9.2, 0.02, 0x10b981, 0.11);
    ringA.rotation.x = Math.PI / 2.9;
    ringA.rotation.z = -0.22;
    scene.add(ringA);

    const ringB = ring(11.4, 0.015, 0x06b6d4, 0.08);
    ringB.rotation.x = Math.PI / 2.55;
    ringB.rotation.z = 0.5;
    scene.add(ringB);

    /* ── interaction + loop ───────────────────────────── */
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    window.addEventListener('pointermove', e => {
      pointer.tx = (e.clientX / window.innerWidth  - 0.5) * 2;
      pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    let visible = true, running = true;
    document.addEventListener('visibilitychange', () => { running = !document.hidden; });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => { visible = en.isIntersecting; })
        .observe(mount);
    }

    const clock = new THREE.Clock();
    const pos = cloudGeo.attributes.position;

    function frame() {
      requestAnimationFrame(frame);
      if (!running || !visible) return;

      const dt = Math.min(clock.getDelta(), 0.05);
      const t  = clock.elapsedTime;

      group.rotation.y += dt * 0.085;
      group.position.y  = Math.sin(t * 0.35) * 0.28;

      ringA.rotation.z += dt * 0.10;
      ringB.rotation.z -= dt * 0.065;

      // algae drift upward and wrap around
      for (let i = 0; i < N; i++) {
        let y = pos.array[i * 3 + 1] + speed[i];
        if (y > 12) y = -12;
        pos.array[i * 3 + 1] = y;
        pos.array[i * 3] += Math.sin(t * 0.35 + i) * 0.0016;
      }
      pos.needsUpdate = true;

      // eased camera parallax
      pointer.x += (pointer.tx - pointer.x) * 0.045;
      pointer.y += (pointer.ty - pointer.y) * 0.045;
      camera.position.x = pointer.x * 2.0 + Math.sin(t * 0.13) * 0.5;
      camera.position.y = 0.4 - pointer.y * 1.2 + Math.cos(t * 0.11) * 0.35;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    }
    frame();

    requestAnimationFrame(() => mount.classList.add('is-ready'));

    let rz;
    window.addEventListener('resize', () => {
      clearTimeout(rz);
      rz = setTimeout(() => {
        camera.aspect = W() / H();
        camera.updateProjectionMatrix();
        renderer.setSize(W(), H());
      }, 140);
    });
  }

  /* Pull three.js in only when the scene is actually going to run. */
  function load() {
    if (!affordable() || !document.getElementById(MOUNT)) return;
    if (typeof THREE !== 'undefined') { boot(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.min.js';
    s.async = true;
    s.onload = boot;
    s.onerror = () => { /* hero keeps its CSS background */ };
    document.head.appendChild(s);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load);
  else load();
})();
