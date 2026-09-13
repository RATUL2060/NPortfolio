/* ═══════════════════════════════════════════════════════
   DHRUBO RATUL BASAK — PORTFOLIO JS
═══════════════════════════════════════════════════════ */

'use strict';

/* ── NAV SCROLL ── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
});

/* ── ACTIVE NAV LINK ── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const active = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });
sections.forEach(s => observer.observe(s));

/* ── HAMBURGER ── */
const hamburger = document.getElementById('hamburger');
const navLinksList = document.getElementById('nav-links');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinksList.classList.toggle('open');
});
navLinksList.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinksList.classList.remove('open');
  });
});

/* ── LANGUAGE SWITCH ── */
function setLang(lang) {
  document.documentElement.setAttribute('data-lang', lang);
  document.getElementById('btn-en').classList.toggle('active', lang === 'en');
  document.getElementById('btn-de').classList.toggle('active', lang === 'de');

  document.querySelectorAll('[data-en][data-de]').forEach(el => {
    el.textContent = el.getAttribute(`data-${lang}`) || el.getAttribute('data-en');
  });
  localStorage.setItem('lang', lang);
}
// Restore saved language
const savedLang = localStorage.getItem('lang');
if (savedLang && savedLang !== 'en') setLang(savedLang);

/* ── SCROLL REVEAL ── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(
  '.tl-card, .project-card, .research-card, .skill-group, .ach-card, ' +
  '.cert-card, .lang-card, .connect-card, .contact-form, .contact-info, ' +
  '.about-text, .about-side, .fact'
).forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

/* ── CANVAS PARTICLE BACKGROUND (HERO) ── */
(function initCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const PARTICLE_COUNT = 60;
  const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.5 + 0.3,
    vx: (Math.random() - 0.5) * 0.25,
    vy: (Math.random() - 0.5) * 0.25,
    a: Math.random() * 0.5 + 0.1,
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connection lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(79,142,247,${0.06 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw dots
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(79,142,247,${p.a})`;
      ctx.fill();

      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    });

    requestAnimationFrame(draw);
  }
  draw();
})();

/* ── TECH STACK VISUAL CYCLE ── */
(function cycleStack() {
  const items = document.querySelectorAll('.tsv-item');
  if (!items.length) return;
  let current = 0;
  setInterval(() => {
    items[current].classList.remove('active');
    current = (current + 1) % items.length;
    items[current].classList.add('active');
  }, 1800);
})();

/* ── GSAP HERO ENTRANCE (if GSAP loaded) ── */
window.addEventListener('load', () => {
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  gsap.timeline()
    .from('.hero-status',   { y: 20, opacity: 0, duration: .5, ease: 'power3.out' })
    .from('.hero-location', { y: 16, opacity: 0, duration: .4, ease: 'power3.out' }, '-=.2')
    .from('.hero-name',     { y: 30, opacity: 0, duration: .7, ease: 'power3.out' }, '-=.2')
    .from('.hero-title',    { y: 20, opacity: 0, duration: .5, ease: 'power3.out' }, '-=.4')
    .from('.hero-tagline',  { y: 16, opacity: 0, duration: .5, ease: 'power3.out' }, '-=.3')
    .from('.hero-badges .badge', { y: 12, opacity: 0, duration: .4, stagger: .1, ease: 'power3.out' }, '-=.3')
    .from('.hero-actions .btn',  { y: 12, opacity: 0, duration: .4, stagger: .08, ease: 'power3.out' }, '-=.3')
    .from('.profile-ring',       { scale: .9, opacity: 0, duration: .7, ease: 'back.out(1.4)' }, '-=.6')
    .from('.tech-stack-visual',  { x: 20, opacity: 0, duration: .5, ease: 'power3.out' }, '-=.4')
    .from('.ring-badge',         { scale: .7, opacity: 0, duration: .4, ease: 'back.out(1.7)' }, '-=.2');
});

/* ── CONTACT FORM ── */
function handleFormSubmit(event) {
  event.preventDefault();
  const btn = document.getElementById('submit-btn');
  const nameVal = document.getElementById('cf-name').value.trim();
  const emailVal = document.getElementById('cf-email').value.trim();
  const msgVal = document.getElementById('cf-msg').value.trim();
  if (!nameVal || !emailVal || !msgVal) return;

  const originalText = btn.querySelector('span').textContent;
  btn.querySelector('span').textContent = 'Sending...';
  btn.disabled = true;

  // Simulate send (replace with actual backend/Netlify forms if needed)
  setTimeout(() => {
    btn.querySelector('span').textContent = '✓ Message sent!';
    btn.style.background = 'var(--green)';
    setTimeout(() => {
      btn.querySelector('span').textContent = originalText;
      btn.style.background = '';
      btn.disabled = false;
      event.target.reset();
    }, 3000);
  }, 1000);
}
