/* ============================
   NEXUS-MD — Main Script
   ============================ */

// ---- NAV SCROLL ----
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');
});

// ---- HAMBURGER MENU ----
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// ---- STAT COUNTER ANIMATION ----
function animateCounter(el, target, suffix) {
  const dur = 1800;
  const start = performance.now();
  const update = (now) => {
    const t = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.floor(eased * target);
    if (t < 1) requestAnimationFrame(update);
    else el.textContent = target;
  };
  requestAnimationFrame(update);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.stat-num').forEach(el => {
        animateCounter(el, parseInt(el.dataset.target), '');
      });
      statsObserver.disconnect();
    }
  });
}, { threshold: 0.3 });

const statsEl = document.querySelector('.hero-stats');
if (statsEl) statsObserver.observe(statsEl);

// ---- SCROLL REVEAL ----
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.feature-card, .step-card, .cmd-card, .section-header').forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

// ---- COPY CODE BUTTON ----
function copyCode(btn) {
  const code = btn.dataset.code;
  navigator.clipboard.writeText(code).then(() => {
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = 'Copy';
      btn.classList.remove('copied');
    }, 2000);
  });
}

// ---- CANVAS BACKGROUND (Hyperdrive / Grid Effect) ----
(function () {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, time = 0;
  const particles = [];
  const PARTICLE_COUNT = 80;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.z = Math.random() * 0.6 + 0.1;
      this.speed = Math.random() * 0.4 + 0.15;
      this.size = Math.random() * 1.5 + 0.4;
      this.color = Math.random() > 0.5 ? '#00ffff' : '#a855f7';
      this.alpha = Math.random() * 0.5 + 0.2;
      this.trail = [];
    }
    update() {
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > 12) this.trail.shift();
      this.y -= this.speed;
      this.x += Math.sin(time * 0.01 + this.z * 5) * 0.3;
      if (this.y < -10) this.reset(), this.y = H + 10;
    }
    draw() {
      ctx.save();
      for (let i = 0; i < this.trail.length; i++) {
        const a = (i / this.trail.length) * this.alpha * 0.5;
        ctx.globalAlpha = a;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.trail[i].x, this.trail[i].y, this.size * (i / this.trail.length), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  // Grid lines
  function drawGrid() {
    const gridSize = 80;
    const perspective = 0.0003;
    ctx.save();
    ctx.globalAlpha = 0.04;
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 0.5;
    const offset = (time * 0.5) % gridSize;
    for (let x = 0; x < W + gridSize; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x - offset % gridSize, 0);
      ctx.lineTo(x - offset % gridSize, H);
      ctx.stroke();
    }
    for (let y = 0; y < H + gridSize; y += gridSize) {
      ctx.globalAlpha = 0.02 + (y / H) * 0.04;
      ctx.beginPath();
      ctx.moveTo(0, y - offset % gridSize);
      ctx.lineTo(W, y - offset % gridSize);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Glow orbs
  function drawOrbs() {
    const orbs = [
      { x: W * 0.15, y: H * 0.3, r: 250, color: 'rgba(0,255,255,0.04)' },
      { x: W * 0.85, y: H * 0.6, r: 300, color: 'rgba(168,85,247,0.04)' },
      { x: W * 0.5, y: H * 0.85, r: 200, color: 'rgba(0,136,255,0.03)' },
    ];
    orbs.forEach(o => {
      const grad = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
      grad.addColorStop(0, o.color);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawOrbs();
    drawGrid();
    particles.forEach(p => { p.update(); p.draw(); });
    time++;
    requestAnimationFrame(loop);
  }

  loop();
})();

// ---- TERMINAL TYPEWRITER ----
(function () {
  const lines = document.querySelectorAll('#terminal-body .t-line');
  lines.forEach((line, i) => {
    line.style.opacity = '0';
    setTimeout(() => {
      line.style.transition = 'opacity 0.3s';
      line.style.opacity = '1';
    }, 300 + i * 300);
  });
})();
