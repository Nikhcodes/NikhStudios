/* ═══════════════════════════════════════
   NikhStudios — script.js
   All interactions, canvas, scroll FX
   ═══════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────
   1. CUSTOM CURSOR
────────────────────────────────── */
(function initCursor() {
  const dot   = document.getElementById('cursorDot');
  const ring  = document.getElementById('cursorRing');
  const trail = document.getElementById('cursorTrail');
  if (!dot) return;

  let mx = 0, my = 0;
  let rx = 0, ry = 0;
  let tx = 0, ty = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  (function animate() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    tx += (mx - tx) * 0.07;
    ty += (my - ty) * 0.07;

    ring.style.left  = rx + 'px';
    ring.style.top   = ry + 'px';
    trail.style.left = tx + 'px';
    trail.style.top  = ty + 'px';

    requestAnimationFrame(animate);
  })();

  document.addEventListener('mousedown', () => dot.style.transform = 'translate(-50%,-50%) scale(0.6)');
  document.addEventListener('mouseup',   () => dot.style.transform = 'translate(-50%,-50%) scale(1)');
})();

/* ──────────────────────────────────
   2. NAVBAR SCROLL EFFECT
────────────────────────────────── */
(function initNav() {
  const nav    = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  if (toggle) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      links.classList.toggle('open');
    });
  }

  // Close on link click
  links && links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      toggle && toggle.classList.remove('open');
      links.classList.remove('open');
    });
  });
})();

/* ──────────────────────────────────
   3. LIVE CLOCK
────────────────────────────────── */
(function initClock() {
  const el = document.getElementById('sysTime');
  if (!el) return;
  function tick() {
    const now = new Date();
    const pad = n => String(n).padStart(2,'0');
    el.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  }
  tick();
  setInterval(tick, 1000);
})();

/* ──────────────────────────────────
   4. LIQUID METAL CANVAS BACKGROUND
   (Perlin-style noise + chrome sheen)
────────────────────────────────── */
(function initCanvas() {
  const canvas = document.getElementById('metalCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, time = 0;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Simplex-lite: smooth noise via sin stacking
  function noise(x, y, t) {
    return (
      Math.sin(x * 0.004 + t * 0.6) * 0.4 +
      Math.sin(y * 0.006 + t * 0.4) * 0.3 +
      Math.sin((x + y) * 0.003 + t * 0.5) * 0.3 +
      Math.sin(x * 0.009 - y * 0.005 + t * 0.7) * 0.2 +
      Math.cos(x * 0.002 + y * 0.008 - t * 0.3) * 0.2
    ) / 1.4;
  }

  // Particle field for subtle chrome dust
  const particles = Array.from({ length: 60 }, () => ({
    x: Math.random() * 1920, y: Math.random() * 1080,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    r: Math.random() * 1.5 + 0.3,
    a: Math.random(),
  }));

  function draw() {
    time += 0.008;
    ctx.clearRect(0, 0, W, H);

    // ── Flowing metal waves ──
    const rows = 6;
    for (let r = 0; r < rows; r++) {
      const t = time + r * 0.4;
      const yBase = H * (r / rows);

      ctx.beginPath();
      ctx.moveTo(0, H);

      for (let x = 0; x <= W; x += 4) {
        const n = noise(x, yBase, t);
        const y = yBase + n * 90 + 45;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H);
      ctx.closePath();

      // chrome gradient per wave
      const brightness = 0.5 + (r / rows) * 0.5;
      const alpha      = 0.025 - r * 0.003;
      const grad = ctx.createLinearGradient(0, yBase, W, yBase + 80);
      grad.addColorStop(0,   `rgba(${Math.round(180*brightness)},${Math.round(190*brightness)},${Math.round(220*brightness)},${alpha})`);
      grad.addColorStop(0.3, `rgba(${Math.round(100*brightness)},${Math.round(110*brightness)},${Math.round(160*brightness)},${alpha * 0.5})`);
      grad.addColorStop(1,   `rgba(0,200,255,${alpha * 0.3})`);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // ── Radial chrome orb glow ──
    const ox = W * 0.7 + Math.sin(time * 0.5) * 30;
    const oy = H * 0.4 + Math.cos(time * 0.3) * 20;
    const orb = ctx.createRadialGradient(ox, oy, 0, ox, oy, 300);
    orb.addColorStop(0,   'rgba(0,220,255,0.04)');
    orb.addColorStop(0.5, 'rgba(100,150,220,0.015)');
    orb.addColorStop(1,   'transparent');
    ctx.fillStyle = orb;
    ctx.fillRect(0, 0, W, H);

    // ── Cyan accent glow top-left ──
    const al = ctx.createRadialGradient(W*0.1, H*0.15, 0, W*0.1, H*0.15, 200);
    al.addColorStop(0,   'rgba(0,180,255,0.05)');
    al.addColorStop(1,   'transparent');
    ctx.fillStyle = al;
    ctx.fillRect(0, 0, W, H);

    // ── Orange ember glow bottom ──
    const og = ctx.createRadialGradient(W*0.3, H*0.9, 0, W*0.3, H*0.9, 250);
    og.addColorStop(0,   'rgba(255,100,30,0.04)');
    og.addColorStop(1,   'transparent');
    ctx.fillStyle = og;
    ctx.fillRect(0, 0, W, H);

    // ── Chrome dust particles ──
    particles.forEach(p => {
      p.x += p.vx + noise(p.x, p.y, time) * 0.4;
      p.y += p.vy + noise(p.y, p.x, time + 10) * 0.4;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

      const a = p.a * 0.3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(160,180,220,${a})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }
  draw();
})();

/* ──────────────────────────────────
   5. SVG LIQUID BLOB ANIMATION (hero)
────────────────────────────────── */
(function initBlobs() {
  const blobs = [
    { el: document.getElementById('blob1'), cx: 400, cy: 300, rx: 130, ry: 110,
      dx: 0, dy: 0, sx: 0.003, sy: 0.002, phase: 0 },
    { el: document.getElementById('blob2'), cx: 520, cy: 220, rx: 72, ry: 65,
      dx: 0, dy: 0, sx: 0.005, sy: 0.004, phase: 1.2 },
    { el: document.getElementById('blob3'), cx: 290, cy: 390, rx: 55, ry: 50,
      dx: 0, dy: 0, sx: 0.004, sy: 0.006, phase: 2.4 },
    { el: document.getElementById('blob4'), cx: 460, cy: 370, rx: 42, ry: 38,
      dx: 0, dy: 0, sx: 0.007, sy: 0.005, phase: 0.8 },
    { el: document.getElementById('blob5'), cx: 320, cy: 230, rx: 26, ry: 26,
      dx: 0, dy: 0, sx: 0.006, sy: 0.008, phase: 3.1 },
  ];

  let t = 0;
  function animateBlobs() {
    t += 0.01;
    blobs.forEach(b => {
      if (!b.el) return;
      const nx = b.cx + Math.sin(t * b.sx * 80 + b.phase) * 28
                      + Math.cos(t * b.sy * 60 + b.phase * 0.7) * 16;
      const ny = b.cy + Math.cos(t * b.sy * 80 + b.phase) * 22
                      + Math.sin(t * b.sx * 60 + b.phase * 1.3) * 12;
      const srx = b.rx * (1 + Math.sin(t * 0.7 + b.phase) * 0.08);
      const sry = b.ry * (1 + Math.cos(t * 0.5 + b.phase) * 0.08);
      b.el.setAttribute('cx', nx.toFixed(2));
      b.el.setAttribute('cy', ny.toFixed(2));
      b.el.setAttribute('rx', srx.toFixed(2));
      b.el.setAttribute('ry', sry.toFixed(2));
    });
    requestAnimationFrame(animateBlobs);
  }
  animateBlobs();

  // About section blobs
  const ab = [
    { el: document.getElementById('ab1'), cx: 250, cy: 200, r: 100, sx: 0.004, phase: 0 },
    { el: document.getElementById('ab2c'), cx: 310, cy: 160, r: 60, sx: 0.006, phase: 1.5 },
    { el: document.getElementById('ab3c'), cx: 190, cy: 250, r: 45, sx: 0.005, phase: 2.8 },
  ];
  let t2 = 0;
  function animateAboutBlobs() {
    t2 += 0.01;
    ab.forEach(b => {
      if (!b.el) return;
      const nx = b.cx + Math.sin(t2 * b.sx * 90 + b.phase) * 25;
      const ny = b.cy + Math.cos(t2 * b.sx * 70 + b.phase) * 20;
      const nr = b.r * (1 + Math.sin(t2 * 0.6 + b.phase) * 0.07);
      b.el.setAttribute('cx', nx.toFixed(2));
      b.el.setAttribute('cy', ny.toFixed(2));
      b.el.setAttribute('r', nr.toFixed(2));
    });
    requestAnimationFrame(animateAboutBlobs);
  }
  animateAboutBlobs();
})();

/* ──────────────────────────────────
   6. WAVE BARS (audio preview)
────────────────────────────────── */
(function initWaveBars() {
  const container = document.getElementById('waveBars');
  if (!container) return;
  const count = 32;
  for (let i = 0; i < count; i++) {
    const bar = document.createElement('div');
    bar.className = 'wave-bar';
    const maxH = 16 + Math.random() * 50;
    const dur  = 0.4 + Math.random() * 0.8;
    bar.style.setProperty('--h', maxH + 'px');
    bar.style.setProperty('--dur', dur + 's');
    bar.style.animationDelay = (Math.random() * 0.8) + 's';
    // Gradient from orange to cyan toward center
    const dist = Math.abs(i - count / 2) / (count / 2);
    const r = Math.round(255 * dist + 0 * (1 - dist));
    const g = Math.round(107 * dist + 229 * (1 - dist));
    const b = Math.round(53 * dist + 255 * (1 - dist));
    bar.style.background = `rgb(${r},${g},${b})`;
    bar.style.boxShadow  = `0 0 6px rgba(${r},${g},${b},0.5)`;
    container.appendChild(bar);
  }
})();

/* ──────────────────────────────────
   7. UI SPARKLINE
────────────────────────────────── */
(function initSparkline() {
  const el = document.getElementById('sparkline');
  if (!el) return;
  const heights = [18, 28, 12, 35, 22, 30, 26, 32, 20, 28, 32, 24, 30, 28, 32];
  heights.forEach(h => {
    const bar = document.createElement('div');
    bar.className = 'spark-bar';
    bar.style.height = h + 'px';
    bar.style.opacity = 0.3 + (h / 35) * 0.7;
    el.appendChild(bar);
  });
})();

/* ──────────────────────────────────
   8. SCROLL REVEAL (Intersection Observer)
────────────────────────────────── */
(function initScrollReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const delay = parseInt(el.dataset.delay || 0, 10);
      setTimeout(() => el.classList.add('anim-in'), delay);
      observer.unobserve(el);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  // Animate data-anim elements
  document.querySelectorAll('[data-anim]').forEach(el => observer.observe(el));

  // Stagger project cards
  const cardObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const cards = entry.target.querySelectorAll('.project-card');
      cards.forEach((card, i) => {
        setTimeout(() => card.classList.add('anim-in'), i * 90);
      });
      cardObserver.unobserve(entry.target);
    });
  }, { threshold: 0.05 });
  const grid = document.querySelector('.projects-grid');
  if (grid) cardObserver.observe(grid);

  // Stats strip
  const statsObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('[data-count]').forEach(el => {
        animateCount(el, parseInt(el.dataset.count, 10));
      });
      statsObserver.unobserve(entry.target);
    });
  }, { threshold: 0.3 });
  const strip = document.querySelector('.stats-strip');
  if (strip) statsObserver.observe(strip);
})();

/* ──────────────────────────────────
   9. COUNT-UP ANIMATION
────────────────────────────────── */
function animateCount(el, target) {
  const duration = 1800;
  const start    = performance.now();
  const suffix   = el.textContent.replace(/[0-9]/g, '');

  (function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  })(start);
}

/* ──────────────────────────────────
   10. SMOOTH HERO PARALLAX
────────────────────────────────── */
(function initParallax() {
  const scene = document.querySelector('.liquid-scene');
  const grid  = document.querySelector('.hero-bg-grid');
  if (!scene) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    scene.style.transform = `translateY(${y * 0.25}px)`;
    if (grid) grid.style.transform = `translateY(${y * 0.15}px)`;
  }, { passive: true });
})();

/* ──────────────────────────────────
   11. MAGNETIC BUTTONS
────────────────────────────────── */
(function initMagnetic() {
  document.querySelectorAll('.btn-primary, .nav-cta, .contact-email').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) * 0.25;
      const dy   = (e.clientY - cy) * 0.25;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
})();

/* ──────────────────────────────────
   12. HERO TITLE GLITCH PULSE
────────────────────────────────── */
(function initGlitch() {
  const title = document.querySelector('.title-accent');
  if (!title) return;

  function glitch() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%';
    const original = 'Studios';
    let frame = 0;
    const maxFrames = 18;

    const interval = setInterval(() => {
      if (frame >= maxFrames) {
        title.textContent = original;
        clearInterval(interval);
        // Schedule next glitch
        setTimeout(glitch, 6000 + Math.random() * 8000);
        return;
      }
      const progress = frame / maxFrames;
      title.textContent = original.split('').map((ch, i) => {
        if (progress > i / original.length) return ch;
        return chars[Math.floor(Math.random() * chars.length)];
      }).join('');
      frame++;
    }, 45);
  }

  setTimeout(glitch, 3000);
})();

/* ──────────────────────────────────
   13. CARD TILT EFFECT
────────────────────────────────── */
(function initTilt() {
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect  = card.getBoundingClientRect();
      const cx    = rect.left + rect.width  / 2;
      const cy    = rect.top  + rect.height / 2;
      const dx    = (e.clientX - cx) / (rect.width  / 2);
      const dy    = (e.clientY - cy) / (rect.height / 2);
      const rotX  = dy * -5;
      const rotY  = dx *  5;
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px) scale(1.015)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ──────────────────────────────────
   14. PAGE LOAD ENTRANCE
────────────────────────────────── */
(function initEntrance() {
  // Trigger hero data-anim elements immediately
  const heroEls = document.querySelectorAll('.hero [data-anim]');
  heroEls.forEach(el => {
    const delay = parseInt(el.dataset.delay || 0, 10) + 200;
    setTimeout(() => el.classList.add('anim-in'), delay);
  });
})();
