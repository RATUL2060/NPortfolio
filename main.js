/* ============================================================
   DRB v4 — AI ENGINEER main.js
   Clean, modular. No competing effects.
   ============================================================ */
'use strict';

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ══════════ HEADER SCROLL ══════════ */
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ══════════ NAV ACTIVE LINK ══════════ */
const navAs = document.querySelectorAll('.nav-links a');
const sectionEls = document.querySelectorAll('section[id]');
new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navAs.forEach(a => a.classList.remove('active'));
      const a = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
      if (a) a.classList.add('active');
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' }).observe ? sectionEls.forEach(s =>
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navAs.forEach(a => a.classList.remove('active'));
        const a = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
        if (a) a.classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' }).observe(s)
) : null;

/* ══════════ HAMBURGER ══════════ */
const burger = document.getElementById('nav-burger');
const navList = document.getElementById('nav-links');
burger.addEventListener('click', () => {
  const open = burger.classList.toggle('open');
  navList.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
});
navList.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  burger.classList.remove('open');
  navList.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
}));

/* ══════════ SCROLL REVEALS ══════════ */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach((e, idx) => {
    if (e.isIntersecting) {
      // Stagger children in same parent
      const siblings = [...(e.target.parentElement?.querySelectorAll('.reveal:not(.in)') || [])];
      const i = siblings.indexOf(e.target);
      e.target.style.transitionDelay = Math.min(i * 0.06, 0.3) + 's';
      e.target.classList.add('in');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ══════════ HERO CANVAS — Neural Network ══════════ */
(function heroCanvas() {
  if (REDUCED) return;
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  // Neural net structure: input → hidden1 → hidden2 → output
  const LAYERS = [4, 6, 6, 3];
  const ACCENT = [129, 140, 248]; // indigo
  let nodes = [], edges = [], tick = 0;

  function buildNet() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    nodes = []; edges = [];
    const totalLayers = LAYERS.length;
    const xStep = W * 0.18;
    const xStart = W * 0.55; // right side

    LAYERS.forEach((count, li) => {
      const x = xStart + li * xStep;
      const yStep = H / (count + 1);
      for (let ni = 0; ni < count; ni++) {
        nodes.push({
          x, y: yStep * (ni + 1),
          layer: li, idx: ni,
          pulse: Math.random() * Math.PI * 2,
        });
      }
    });

    // Fully connect adjacent layers
    let offset = 0;
    for (let l = 0; l < LAYERS.length - 1; l++) {
      const aCount = LAYERS[l], bCount = LAYERS[l + 1];
      const aOff = LAYERS.slice(0, l).reduce((s, v) => s + v, 0);
      const bOff = aOff + aCount;
      for (let a = 0; a < aCount; a++) {
        for (let b = 0; b < bCount; b++) {
          edges.push({
            from: aOff + a, to: bOff + b,
            phase: Math.random() * Math.PI * 2,
            speed: 0.008 + Math.random() * 0.006,
          });
        }
      }
    }
  }
  buildNet();
  let rto; window.addEventListener('resize', () => { clearTimeout(rto); rto = setTimeout(buildNet, 200); });

  let mx = W * 0.5, my = H * 0.5;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

  function draw() {
    tick += 0.012;
    ctx.clearRect(0, 0, W, H);

    // Draw edges
    edges.forEach(e => {
      const a = nodes[e.from], b = nodes[e.to];
      const activity = (Math.sin(tick * e.speed * 80 + e.phase) + 1) * 0.5;
      const alpha = 0.03 + activity * 0.07;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = `rgba(${ACCENT.join(',')},${alpha})`;
      ctx.lineWidth = .6 + activity * .4;
      ctx.stroke();

      // Travelling dot on edge
      if (activity > 0.75 && Math.random() > 0.97) {
        const t = (tick * 0.3 + e.phase) % 1;
        const px = a.x + (b.x - a.x) * t;
        const py = a.y + (b.y - a.y) * t;
        ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${ACCENT.join(',')},0.6)`;
        ctx.fill();
      }
    });

    // Draw nodes
    nodes.forEach(n => {
      const pulse = (Math.sin(tick * 1.2 + n.pulse) + 1) * 0.5;
      const alpha = 0.25 + pulse * 0.5;
      const r = 3.5 + pulse * 1.5;

      // Glow
      const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 4);
      grd.addColorStop(0, `rgba(${ACCENT.join(',')},${alpha * 0.4})`);
      grd.addColorStop(1, `rgba(${ACCENT.join(',')},0)`);
      ctx.beginPath(); ctx.arc(n.x, n.y, r * 4, 0, Math.PI * 2);
      ctx.fillStyle = grd; ctx.fill();

      // Node dot
      ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${ACCENT.join(',')},${alpha})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }
  draw();
})();

/* ══════════ PORTRAIT SCAN LINE ══════════ */
(function portraitScan() {
  if (REDUCED) return;
  const canvas = document.getElementById('portrait-scan');
  const box    = document.getElementById('portrait-box');
  if (!canvas || !box) return;
  const ctx = canvas.getContext('2d');
  let W, H, scanY = 0;

  function resize() { W = canvas.width = box.offsetWidth; H = canvas.height = box.offsetHeight; }
  resize();
  window.addEventListener('resize', resize);

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const g = ctx.createLinearGradient(0, scanY - 12, 0, scanY + 12);
    g.addColorStop(0,   'rgba(129,140,248,0)');
    g.addColorStop(.5,  'rgba(129,140,248,0.08)');
    g.addColorStop(1,   'rgba(129,140,248,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, scanY - 12, W, 24);
    scanY += .7;
    if (scanY > H + 12) scanY = -12;
    requestAnimationFrame(draw);
  }
  draw();

  // Portrait parallax
  document.addEventListener('mousemove', e => {
    const r  = box.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width  / 2)) / window.innerWidth;
    const dy = (e.clientY - (r.top  + r.height / 2)) / window.innerHeight;
    box.style.transform = `translate(${dx * 7}px, ${dy * 4}px)`;
  }, { passive: true });
})();

/* ══════════ GALLERY ══════════ */
(function gallery() {
  const tabs = document.querySelectorAll('.gtab');
  const img  = document.getElementById('gallery-img');
  if (!tabs.length || !img) return;

  function activate(btn) {
    tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
    btn.classList.add('active'); btn.setAttribute('aria-selected', 'true');
    img.style.opacity = '0';
    setTimeout(() => { img.src = btn.dataset.src; img.alt = btn.dataset.alt; img.style.opacity = '1'; }, 200);
  }
  tabs.forEach(t => t.addEventListener('click', () => { activate(t); clearInterval(iv); }));

  const iv = setInterval(() => {
    const arr = [...tabs];
    const cur = arr.indexOf(document.querySelector('.gtab.active'));
    activate(arr[(cur + 1) % arr.length]);
  }, 5000);
})();

/* ══════════ JELLYFIN NETWORK ANIMATION ══════════ */
(function netDiagram() {
  const stack = document.getElementById('net-stack');
  if (!stack) return;
  const lines = stack.querySelectorAll('.ns-line');
  let done = false;
  new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !done) {
      done = true;
      lines.forEach((l, i) => setTimeout(() => l.classList.add('drawn'), i * 180));
      setTimeout(() => stack.classList.add('anim'), lines.length * 180 + 100);
    }
  }, { threshold: .35 }).observe(stack);
})();

/* ══════════ EXPERIENCE EXPAND ══════════ */
document.querySelectorAll('.exp-item').forEach(el => {
  function toggle() {
    el.setAttribute('aria-expanded', el.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
  }
  el.addEventListener('click', toggle);
  el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
});

/* ══════════ CHATBOT ══════════ */
const FAQ = [
  { q: /study|degree|university|dortmund|msc|master/i,
    a: 'Dhrubo is pursuing an M.Sc. in Data Science at TU Dortmund University, Germany, since April 2026.' },
  { q: /cardiosense|heart|flagship|ml.{0,10}project/i,
    a: 'CardioSense AI is Dhrubo\'s flagship project — a full-stack ML healthcare platform with React, FastAPI, Scikit-learn, SHAP explainability, Docker and GitHub Actions CI. It includes patient management, prediction history, analytics and hospital search (Leaflet/OpenStreetMap). GitHub: github.com/RATUL2060/CardioSense-AI. Educational project — predictions are not medical diagnoses.' },
  { q: /jellyfin|media server|self.?host|network.{0,10}project/i,
    a: 'Dhrubo built a secure self-hosted Jellyfin media system using Docker, Cloudflare Tunnel, Nginx Proxy Manager and MikroTik RouterOS — with WireGuard VPN, PPPoE and QoS. GitHub: github.com/RATUL2060/Networked-Jellyfin-Lab' },
  { q: /network|mikrotik|cisco|noc|agni/i,
    a: 'Dhrubo worked as Junior Network Engineer (NOC) at Agni Systems Limited, Bangladesh (March–December 2025), maintaining ISP infrastructure with MikroTik RouterOS and Cisco, configuring VPN, PPPoE and QoS.' },
  { q: /intern|maxgen|data science.{0,10}work/i,
    a: 'Data Science intern at Maxgen Technologies, India (Jan–Apr 2024). ML projects, data preprocessing and the Heart Disease Prediction pipeline using Python and Scikit-learn.' },
  { q: /technolog|skill|stack|python|docker|react/i,
    a: 'Stack: Python, Pandas, NumPy, SQL, Scikit-learn, SHAP (Data Science/ML) · React, FastAPI, SQLite (Full-Stack) · Docker, Nginx, GitHub Actions (DevOps) · MikroTik RouterOS, WireGuard, VPN, PPPoE (Networking).' },
  { q: /available|werkstudent|hire|job|intern|opportunit/i,
    a: 'Dhrubo is currently available for Werkstudent positions and internships in Germany, particularly in Data Science, ML Engineering and related technical roles.' },
  { q: /research|cnn|anomaly/i,
    a: 'Dhrubo is exploring CNN-based network anomaly detection as part of his M.Sc. studies. Research in progress — no publications yet.' },
  { q: /contact|email|reach|github|linkedin/i,
    a: 'Email: basakdhrubo@gmail.com · GitHub: github.com/RATUL2060 · LinkedIn: linkedin.com/in/dhrubo-ratul-b-a12253236' },
  { q: /who|about|background|tell me/i,
    a: 'Dhrubo Ratul Basak — M.Sc. Data Science student at TU Dortmund. He builds full-stack ML systems, has real-world network engineering experience and combines data science, software development and infrastructure in his work.' },
];
function faqAns(msg) {
  for (const { q, a } of FAQ) if (q.test(msg)) return a;
  return "I don't have that detail in the portfolio. Reach Dhrubo at basakdhrubo@gmail.com or github.com/RATUL2060";
}

const cs = { open: false, hist: [] };

function toggleChat(force) {
  const fab   = document.getElementById('chatbot-fab');
  const panel = document.getElementById('chatbot-panel');
  const open  = force !== undefined ? force : !cs.open;
  cs.open = open;
  panel.hidden = !open;
  fab.setAttribute('aria-expanded', String(open));
  if (open) setTimeout(() => document.getElementById('cp-input')?.focus(), 80);
}
document.getElementById('chatbot-fab').addEventListener('click', () => toggleChat());
document.getElementById('cp-close').addEventListener('click', () => toggleChat(false));
document.getElementById('nav-ask')?.addEventListener('click', () => toggleChat(true));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && cs.open) toggleChat(false); });

function appendMsg(text, role) {
  const body = document.getElementById('cp-messages');
  const w = document.createElement('div');
  w.className = `cp-msg ${role === 'user' ? 'cp-user' : 'cp-bot'}`;
  const d = document.createElement('div');
  d.className = 'cm-t'; d.textContent = text;
  w.appendChild(d); body.appendChild(w);
  body.scrollTop = body.scrollHeight;
}
function showTyping() {
  const body = document.getElementById('cp-messages');
  const w = document.createElement('div');
  w.id = 'cp-typing'; w.className = 'cp-msg cp-bot';
  const d = document.createElement('div');
  d.className = 'cp-typing-dots';
  d.innerHTML = '<span></span><span></span><span></span>';
  w.appendChild(d); body.appendChild(w);
  body.scrollTop = body.scrollHeight;
}
function removeTyping() { document.getElementById('cp-typing')?.remove(); }

async function sendChat(ev) {
  if (ev) ev.preventDefault();
  const inp = document.getElementById('cp-input');
  const msg = inp.value.trim(); if (!msg) return;
  inp.value = '';
  document.getElementById('cp-suggestions')?.remove();
  appendMsg(msg, 'user');
  cs.hist.push({ role: 'user', content: msg });
  showTyping();

  let reply;
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, history: cs.hist.slice(-6) }),
    });
    if (res.ok) { const d = await res.json(); if (d.fallback) throw 0; reply = d.reply; }
    else throw 0;
  } catch { reply = faqAns(msg); }

  removeTyping();
  appendMsg(reply, 'bot');
  cs.hist.push({ role: 'assistant', content: reply });
}
function askSugg(btn) { document.getElementById('cp-input').value = btn.textContent; sendChat(null); }
