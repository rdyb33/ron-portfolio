/* ============================================================
   Hero WebGL — interactive node-network constellation.
   Represents connected automation systems / agentic nodes.
   Degrades gracefully: skips on no-WebGL or reduced-motion.
   ============================================================ */
(function () {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 820px)').matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: true, powerPreference: 'high-performance' });
  } catch (e) {
    canvas.style.display = 'none';
    return;
  }

  const DPR = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
  renderer.setPixelRatio(DPR);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.z = 26;

  const COLOR_PRIMARY = new THREE.Color(0xff6b1a);
  const COLOR_ACCENT  = new THREE.Color(0x22d3ee);

  // ---- Node field ----
  const NODE_COUNT = isMobile ? 70 : 150;
  const SPREAD_X = 46, SPREAD_Y = 28, SPREAD_Z = 22;
  const nodes = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    nodes.push({
      base: new THREE.Vector3(
        (Math.random() - 0.5) * SPREAD_X,
        (Math.random() - 0.5) * SPREAD_Y,
        (Math.random() - 0.5) * SPREAD_Z
      ),
      pos: new THREE.Vector3(),
      drift: new THREE.Vector3(
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4
      ),
      phase: Math.random() * Math.PI * 2,
      accent: Math.random() > 0.78
    });
  }

  // ---- Points geometry ----
  const pointGeo = new THREE.BufferGeometry();
  const pointPos = new Float32Array(NODE_COUNT * 3);
  const pointColor = new Float32Array(NODE_COUNT * 3);
  for (let i = 0; i < NODE_COUNT; i++) {
    const c = nodes[i].accent ? COLOR_ACCENT : COLOR_PRIMARY;
    pointColor[i * 3] = c.r; pointColor[i * 3 + 1] = c.g; pointColor[i * 3 + 2] = c.b;
  }
  pointGeo.setAttribute('position', new THREE.BufferAttribute(pointPos, 3));
  pointGeo.setAttribute('color', new THREE.BufferAttribute(pointColor, 3));

  // round soft sprite for points
  function makeDot() {
    const s = 64, cv = document.createElement('canvas');
    cv.width = cv.height = s;
    const ctx = cv.getContext('2d');
    const g = ctx.createRadialGradient(s/2, s/2, 0, s/2, s/2, s/2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.4, 'rgba(255,255,255,0.85)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
    const tex = new THREE.CanvasTexture(cv);
    return tex;
  }
  const pointMat = new THREE.PointsMaterial({
    size: isMobile ? 0.55 : 0.7,
    map: makeDot(),
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  });
  const points = new THREE.Points(pointGeo, pointMat);
  scene.add(points);

  // ---- Lines (dynamic nearest-neighbour connections) ----
  const MAX_LINES = NODE_COUNT * 6;
  const lineGeo = new THREE.BufferGeometry();
  const linePos = new Float32Array(MAX_LINES * 2 * 3);
  const lineCol = new Float32Array(MAX_LINES * 2 * 3);
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
  lineGeo.setAttribute('color', new THREE.BufferAttribute(lineCol, 3));
  const lineMat = new THREE.LineBasicMaterial({
    vertexColors: true, transparent: true, opacity: 0.5,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(lines);

  const CONNECT_DIST = isMobile ? 9 : 8.5;
  const CONNECT_DIST_SQ = CONNECT_DIST * CONNECT_DIST;

  // ---- Pointer parallax ----
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const onMove = (e) => {
    const t = e.touches ? e.touches[0] : e;
    pointer.tx = (t.clientX / window.innerWidth - 0.5);
    pointer.ty = (t.clientY / window.innerHeight - 0.5);
  };
  window.addEventListener('mousemove', onMove, { passive: true });
  window.addEventListener('touchmove', onMove, { passive: true });

  // ---- Resize ----
  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);

  // ---- Animation loop ----
  let raf, t = 0, running = true;
  const clock = new THREE.Clock();

  function frame() {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    t += dt;

    // Update node positions
    const posAttr = pointGeo.attributes.position.array;
    for (let i = 0; i < NODE_COUNT; i++) {
      const n = nodes[i];
      n.pos.set(
        n.base.x + Math.sin(t * n.drift.x + n.phase) * 2.2,
        n.base.y + Math.cos(t * n.drift.y + n.phase) * 2.2,
        n.base.z + Math.sin(t * n.drift.z + n.phase) * 2.0
      );
      posAttr[i * 3] = n.pos.x;
      posAttr[i * 3 + 1] = n.pos.y;
      posAttr[i * 3 + 2] = n.pos.z;
    }
    pointGeo.attributes.position.needsUpdate = true;

    // Rebuild connections
    let lineIdx = 0;
    const lp = lineGeo.attributes.position.array;
    const lc = lineGeo.attributes.color.array;
    for (let i = 0; i < NODE_COUNT && lineIdx < MAX_LINES; i++) {
      for (let j = i + 1; j < NODE_COUNT && lineIdx < MAX_LINES; j++) {
        const a = nodes[i].pos, b = nodes[j].pos;
        const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
        const dSq = dx * dx + dy * dy + dz * dz;
        if (dSq < CONNECT_DIST_SQ) {
          const strength = 1 - dSq / CONNECT_DIST_SQ;
          const o = lineIdx * 6;
          lp[o] = a.x;     lp[o+1] = a.y;     lp[o+2] = a.z;
          lp[o+3] = b.x;   lp[o+4] = b.y;     lp[o+5] = b.z;
          const ca = nodes[i].accent ? COLOR_ACCENT : COLOR_PRIMARY;
          const cb = nodes[j].accent ? COLOR_ACCENT : COLOR_PRIMARY;
          lc[o] = ca.r * strength;   lc[o+1] = ca.g * strength;   lc[o+2] = ca.b * strength;
          lc[o+3] = cb.r * strength; lc[o+4] = cb.g * strength;   lc[o+5] = cb.b * strength;
          lineIdx++;
        }
      }
    }
    lineGeo.setDrawRange(0, lineIdx * 2);
    lineGeo.attributes.position.needsUpdate = true;
    lineGeo.attributes.color.needsUpdate = true;

    // Pointer parallax + slow auto rotation
    pointer.x += (pointer.tx - pointer.x) * 0.045;
    pointer.y += (pointer.ty - pointer.y) * 0.045;
    const targetRotY = pointer.x * 0.5 + t * 0.03;
    const targetRotX = pointer.y * 0.35;
    points.rotation.y = lines.rotation.y = targetRotY;
    points.rotation.x = lines.rotation.x = targetRotX;
    camera.position.x += (pointer.x * 6 - camera.position.x) * 0.04;
    camera.position.y += (-pointer.y * 4 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  // Pause when hero off-screen (perf)
  const hero = document.getElementById('hero');
  if ('IntersectionObserver' in window && hero) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting && !running) { running = true; clock.getDelta(); frame(); }
        else if (!en.isIntersecting) { running = false; cancelAnimationFrame(raf); }
      });
    }, { threshold: 0.02 });
    io.observe(hero);
  }

  resize();
  if (reduceMotion) {
    // Render a single static frame.
    running = true; frame(); running = false; cancelAnimationFrame(raf);
  } else {
    frame();
  }
})();
