/* ============================================================
   DRB v2 — main.js
   Premium portfolio interactions
   ============================================================ */
'use strict';

/* ── NAV scroll state ── */
const nav = document.getElementById('nav');
let lastY = 0;
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
  lastY = window.scrollY;
}, { passive: true });

/* ── Active nav link tracking ── */
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-links a');
const secObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const match = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
      if (match) match.classList.add('active');
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach(s => secObs.observe(s));

/* ── Hamburger menu ── */
const hamburger    = document.getElementById('hamburger');
const navLinksList = document.getElementById('nav-links');
hamburger.addEventListener('click', () => {
  const open = hamburger.classList.toggle('open');
  navLinksList.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', String(open));
});
navLinksList.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  hamburger.classList.remove('open');
  navLinksList.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
}));

/* ── Scroll reveals ── */
const revealEls = document.querySelectorAll('.reveal');
const ro = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      // Stagger siblings by their index among visible reveals
      const siblings = [...e.target.parentElement.querySelectorAll('.reveal:not(.visible)')];
      const idx = siblings.indexOf(e.target);
      e.target.style.transitionDelay = Math.min(idx * 0.08, 0.4) + 's';
      e.target.classList.add('visible');
      ro.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
revealEls.forEach(el => ro.observe(el));

/* ══════════ BACKGROUND CANVAS ══════════ */
(function bgCanvas() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, pts;

  function init() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    const count = Math.floor(W * H / 28000);
    pts = Array.from({ length: Math.max(30, Math.min(count, 70)) }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - .5) * .18,
      vy: (Math.random() - .5) * .18,
      r:  Math.random() * 1.2 + .3,
      a:  Math.random() * .35 + .08,
    }));
  }
  init();

  let rto;
  window.addEventListener('resize', () => { clearTimeout(rto); rto = setTimeout(init, 200); });

  let mx = W / 2, my = H / 2;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      // Connections
      for (let j = i + 1; j < pts.length; j++) {
        const q = pts[j];
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(56,189,248,${.04 * (1 - d / 120)})`;
          ctx.lineWidth = .6;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
      // Mouse proximity — subtle repel
      const mdx = p.x - mx, mdy = p.y - my;
      const md  = Math.hypot(mdx, mdy);
      if (md < 100) { p.vx += mdx / md * .012; p.vy += mdy / md * .012; }

      // Draw dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(56,189,248,${p.a})`;
      ctx.fill();

      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      // Speed cap
      const spd = Math.hypot(p.vx, p.vy);
      if (spd > .4) { p.vx = p.vx / spd * .4; p.vy = p.vy / spd * .4; }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ══════════ PORTRAIT CANVAS (data art overlay) ══════════ */
(function portraitCanvas() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.getElementById('portrait-canvas');
  if (!canvas) return;
  const ctx  = canvas.getContext('2d');
  const wrap = document.getElementById('portrait-wrap');

  function resize() {
    canvas.width  = wrap.offsetWidth;
    canvas.height = wrap.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Thin data scan line
  let scanY = 0;
  function drawScan() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Scan line
    const grad = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
    grad.addColorStop(0,   'rgba(56,189,248,0)');
    grad.addColorStop(0.5, 'rgba(56,189,248,0.06)');
    grad.addColorStop(1,   'rgba(56,189,248,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, scanY - 20, canvas.width, 40);

    // Thin corner geometric lines
    const w = canvas.width, h = canvas.height;
    const len = 30, lw = .8, col = 'rgba(56,189,248,0.45)';
    ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath();
    // TL
    ctx.moveTo(12, 12 + len); ctx.lineTo(12, 12); ctx.lineTo(12 + len, 12);
    // TR
    ctx.moveTo(w - 12 - len, 12); ctx.lineTo(w - 12, 12); ctx.lineTo(w - 12, 12 + len);
    // BL
    ctx.moveTo(12, h - 12 - len); ctx.lineTo(12, h - 12); ctx.lineTo(12 + len, h - 12);
    // BR
    ctx.moveTo(w - 12 - len, h - 12); ctx.lineTo(w - 12, h - 12); ctx.lineTo(w - 12, h - 12 - len);
    ctx.stroke();

    scanY += .6;
    if (scanY > canvas.height + 20) scanY = -20;
    requestAnimationFrame(drawScan);
  }
  drawScan();

  // Subtle parallax on portrait with mouse
  document.addEventListener('mousemove', e => {
    const rect  = wrap.getBoundingClientRect();
    const cx    = rect.left + rect.width / 2;
    const cy    = rect.top  + rect.height / 2;
    const dx    = (e.clientX - cx) / window.innerWidth;
    const dy    = (e.clientY - cy) / window.innerHeight;
    wrap.style.transform = `translate(${dx * 6}px, ${dy * 4}px)`;
  }, { passive: true });
})();

/* ══════════ SKILL CONSTELLATION ══════════ */
(function constellation() {
  const canvas = document.getElementById('constellation');
  if (!canvas) return;
  const ctx  = canvas.getContext('2d');
  const hint = document.getElementById('skills-hint');

  const NODES = [
    // Core — center-ish
    { id: 'python',    label: 'Python',           group: 'lang',    x: .5,  y: .45, projects: ['CardioSense AI', 'Data Science Intern'], r: 8 },
    { id: 'pandas',    label: 'Pandas',            group: 'data',    x: .38, y: .35, projects: ['CardioSense AI'], r: 5 },
    { id: 'numpy',     label: 'NumPy',             group: 'data',    x: .28, y: .5,  projects: ['CardioSense AI'], r: 5 },
    { id: 'sklearn',   label: 'Scikit-learn',      group: 'ml',      x: .42, y: .6,  projects: ['CardioSense AI'], r: 6 },
    { id: 'shap',      label: 'SHAP',              group: 'ml',      x: .56, y: .7,  projects: ['CardioSense AI'], r: 5 },
    { id: 'react',     label: 'React',             group: 'web',     x: .65, y: .38, projects: ['CardioSense AI'], r: 6 },
    { id: 'fastapi',   label: 'FastAPI',           group: 'web',     x: .72, y: .52, projects: ['CardioSense AI'], r: 6 },
    { id: 'docker',    label: 'Docker',            group: 'devops',  x: .62, y: .63, projects: ['CardioSense AI', 'Jellyfin Lab'], r: 6 },
    { id: 'git',       label: 'Git',               group: 'devops',  x: .75, y: .72, projects: ['CardioSense AI'], r: 4 },
    { id: 'nginx',     label: 'Nginx',             group: 'devops',  x: .82, y: .42, projects: ['CardioSense AI', 'Jellyfin Lab'], r: 4 },
    { id: 'mikrotik',  label: 'MikroTik RouterOS', group: 'network', x: .22, y: .68, projects: ['Jellyfin Lab'], exp: ['Agni Systems'], r: 6 },
    { id: 'wireguard', label: 'WireGuard',         group: 'network', x: .14, y: .55, projects: ['Jellyfin Lab'], exp: ['Agni Systems'], r: 5 },
    { id: 'vpn',       label: 'VPN',               group: 'network', x: .18, y: .4,  exp: ['Agni Systems'], r: 4 },
    { id: 'sql',       label: 'SQL',               group: 'data',    x: .34, y: .22, projects: ['CardioSense AI'], r: 4 },
    { id: 'cnn',       label: 'CNN / Deep Learning', group: 'ml',   x: .5,  y: .2,  projects: ['Research'], r: 5 },
  ];

  const EDGES = [
    ['python','pandas'], ['python','numpy'], ['python','sklearn'], ['python','shap'],
    ['python','cnn'], ['python','sql'],
    ['sklearn','shap'], ['react','fastapi'], ['fastapi','docker'],
    ['docker','nginx'], ['mikrotik','wireguard'], ['wireguard','vpn'],
    ['pandas','sklearn'], ['numpy','sklearn'],
    ['docker','git'],
  ];

  const GROUP_COLORS = {
    lang:    'rgba(56,189,248,',
    data:    'rgba(56,189,248,',
    ml:      'rgba(129,140,248,',
    web:     'rgba(56,189,248,',
    devops:  'rgba(245,158,11,',
    network: 'rgba(129,140,248,',
  };

  let W, H, hovered = null;

  function init() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    NODES.forEach(n => { n.px = n.x * W; n.py = n.y * H; });
  }
  init();
  let rto;
  window.addEventListener('resize', () => { clearTimeout(rto); rto = setTimeout(init, 150); });

  function getConnected(nodeId) {
    const connected = new Set([nodeId]);
    EDGES.forEach(([a, b]) => { if (a === nodeId) connected.add(b); if (b === nodeId) connected.add(a); });
    return connected;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const connected = hovered ? getConnected(hovered) : null;

    // Draw edges
    EDGES.forEach(([a, b]) => {
      const na = NODES.find(n => n.id === a);
      const nb = NODES.find(n => n.id === b);
      if (!na || !nb) return;
      const isActive = connected && connected.has(a) && connected.has(b);
      ctx.beginPath();
      ctx.moveTo(na.px, na.py);
      ctx.lineTo(nb.px, nb.py);
      ctx.strokeStyle = isActive ? 'rgba(56,189,248,0.35)' : 'rgba(255,255,255,0.05)';
      ctx.lineWidth = isActive ? 1 : .5;
      ctx.stroke();
    });

    // Draw nodes
    NODES.forEach(n => {
      const isHov    = hovered === n.id;
      const isConn   = connected && connected.has(n.id);
      const baseCol  = GROUP_COLORS[n.group] || 'rgba(255,255,255,';
      const alpha    = hovered ? (isConn ? .95 : .2) : .65;
      const radius   = n.r + (isHov ? 3 : 0);
      const fontSize = isHov ? 13 : 11.5;

      // Glow for hovered
      if (isHov) {
        const grd = ctx.createRadialGradient(n.px, n.py, 0, n.px, n.py, 28);
        grd.addColorStop(0, 'rgba(56,189,248,0.18)');
        grd.addColorStop(1, 'rgba(56,189,248,0)');
        ctx.beginPath();
        ctx.arc(n.px, n.py, 28, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      }

      // Dot
      ctx.beginPath();
      ctx.arc(n.px, n.py, radius, 0, Math.PI * 2);
      ctx.fillStyle = baseCol + alpha + ')';
      ctx.fill();

      // Label
      ctx.font = `${isHov ? '500' : '400'} ${fontSize}px 'Inter', sans-serif`;
      ctx.fillStyle = `rgba(${isHov ? '241,245,249' : '100,116,139'},${hovered ? (isConn ? 1 : .3) : .85})`;
      ctx.textAlign = 'center';
      ctx.fillText(n.label, n.px, n.py - radius - 6);
    });

    requestAnimationFrame(draw);
  }
  draw();

  // Mouse interaction
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    let found = null;
    NODES.forEach(n => {
      const d = Math.hypot(n.px - mx, n.py - my);
      if (d < n.r + 18) found = n.id;
    });
    hovered = found;
    canvas.style.cursor = found ? 'pointer' : 'crosshair';

    if (found) {
      const node = NODES.find(n => n.id === found);
      const projs = [...(node.projects || []), ...(node.exp || [])].join(' · ');
      if (hint) { hint.textContent = projs || node.label; hint.style.color = 'rgba(241,245,249,.8)'; }
    } else {
      if (hint) { hint.textContent = 'Hover a technology to see where it appears'; hint.style.color = ''; }
    }
  });
  canvas.addEventListener('mouseleave', () => {
    hovered = null;
    if (hint) hint.textContent = 'Hover a technology to see where it appears';
  });
})();

/* ══════════ CARDIOSENSE GALLERY ══════════ */
(function gallery() {
  const thumbs = document.querySelectorAll('.css-thumb');
  const img    = document.getElementById('css-img');
  if (!thumbs.length || !img) return;

  function activate(btn) {
    thumbs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    img.style.opacity = '0';
    setTimeout(() => {
      img.src = btn.dataset.src;
      img.alt = btn.dataset.alt + ' screenshot';
      img.style.opacity = '1';
    }, 220);
  }
  thumbs.forEach(btn => btn.addEventListener('click', () => activate(btn)));

  // Auto-cycle every 5s
  let t = setInterval(() => {
    const active = document.querySelector('.css-thumb.active');
    const arr = [...thumbs];
    const idx = arr.indexOf(active);
    activate(arr[(idx + 1) % arr.length]);
  }, 5000);
  thumbs.forEach(b => b.addEventListener('click', () => { clearInterval(t); }));
})();

/* ══════════ JELLYFIN NETWORK DIAGRAM ANIMATION ══════════ */
(function netDiagram() {
  const diagram = document.getElementById('net-diagram');
  if (!diagram) return;
  const paths = diagram.querySelectorAll('.nd-path');
  let animated = false;

  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !animated) {
      animated = true;
      paths.forEach((p, i) => {
        setTimeout(() => p.classList.add('drawn'), i * 180);
      });
      setTimeout(() => diagram.classList.add('animated'), paths.length * 180 + 100);
      obs.disconnect();
    }
  }, { threshold: .3 });
  obs.observe(diagram);
})();

/* ══════════ EXPERIENCE EXPAND/COLLAPSE ══════════ */
document.querySelectorAll('.exp-item').forEach(item => {
  function toggle() {
    const expanded = item.getAttribute('aria-expanded') === 'true';
    item.setAttribute('aria-expanded', String(!expanded));
  }
  item.addEventListener('click', toggle);
  item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
});

/* ══════════ CHATBOT ══════════ */
const FAQ = [
  { q: /study|degree|university|dortmund|msc|master/i,
    a: 'Dhrubo is pursuing an M.Sc. in Data Science at TU Dortmund University, Germany, since April 2026.' },
  { q: /cardiosense|heart|flagship|ml.*project/i,
    a: 'CardioSense AI is Dhrubo\'s flagship project — a full-stack ML healthcare platform built with React, FastAPI, Scikit-learn, SHAP explainability, Docker, and GitHub Actions. It includes patient management, prediction history, analytics and nearby hospital search. Educational project. GitHub: github.com/RATUL2060/CardioSense-AI' },
  { q: /jellyfin|self.?host|media server|infra.*project/i,
    a: 'Dhrubo built a secure self-hosted Jellyfin media server using Docker, Cloudflare Tunnel, Nginx and MikroTik RouterOS — simulating real ISP networking with WireGuard VPN, PPPoE and QoS. GitHub: github.com/RATUL2060/Networked-Jellyfin-Lab' },
  { q: /network|mikrotik|cisco|noc|agni/i,
    a: 'Dhrubo worked as a Junior Network Engineer (NOC) at Agni Systems Limited in Bangladesh (March–December 2025), maintaining ISP infrastructure with MikroTik RouterOS and Cisco, diagnosing outages and configuring VPN, PPPoE and QoS.' },
  { q: /intern|maxgen|data science.*work/i,
    a: 'Dhrubo completed a Data Science internship at Maxgen Technologies in India (Jan–Apr 2024), working on ML projects and a Heart Disease Prediction pipeline.' },
  { q: /technolog|skill|python|docker|react|stack/i,
    a: 'Core stack: Python, Pandas, NumPy, Scikit-learn (Data Science) · React, FastAPI, SQLite (Full-Stack) · Docker, Nginx, GitHub Actions (DevOps) · MikroTik RouterOS, WireGuard, VPN (Networking) · SHAP / Explainable AI.' },
  { q: /available|werkstudent|hire|job|internship|opportunit/i,
    a: 'Dhrubo is currently available for Werkstudent positions and internships in Germany, particularly in Data Science, ML Engineering and related technical roles.' },
  { q: /research|cnn|anomaly/i,
    a: 'Dhrubo is exploring CNN-based network anomaly detection — applying convolutional neural networks to network traffic data. Research in progress, no publications yet.' },
  { q: /contact|email|reach|github|linkedin/i,
    a: 'Email: basakdhrubo@gmail.com · GitHub: github.com/RATUL2060 · LinkedIn: linkedin.com/in/dhrubo-ratul-b-a12253236' },
  { q: /who|about|background|summary|tell me/i,
    a: 'Dhrubo Ratul Basak is a Computer Engineering graduate now studying M.Sc. Data Science at TU Dortmund. He builds ML applications, has real-world networking experience, and combines Data Science, Software Engineering and Infrastructure in his work.' },
];

function faqAnswer(msg) {
  for (const { q, a } of FAQ) {
    if (q.test(msg)) return a;
  }
  return 'I don\'t have that specific detail in the portfolio. Reach Dhrubo directly at basakdhrubo@gmail.com or github.com/RATUL2060';
}

const state = { open: false, history: [] };

function toggleChat(force) {
  const fab   = document.getElementById('chatbot-fab');
  const panel = document.getElementById('chatbot-panel');
  const open  = force !== undefined ? force : !state.open;
  state.open = open;
  panel.hidden = !open;
  fab.setAttribute('aria-expanded', String(open));
  if (open) setTimeout(() => document.getElementById('cp-input').focus(), 100);
}

document.getElementById('chatbot-fab').addEventListener('click', () => toggleChat());
document.getElementById('chatbot-close').addEventListener('click', () => toggleChat(false));
document.getElementById('ask-nav-btn')?.addEventListener('click', () => toggleChat(true));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && state.open) toggleChat(false); });

function appendMsg(text, role) {
  const body = document.getElementById('cp-messages');
  const wrap = document.createElement('div');
  wrap.className = 'cp-msg ' + (role === 'user' ? 'cp-msg-user' : 'cp-msg-bot');
  const inner = document.createElement('div');
  inner.className = 'cm-text';
  inner.textContent = text;
  wrap.appendChild(inner);
  body.appendChild(wrap);
  body.scrollTop = body.scrollHeight;
}

function showTyping() {
  const body = document.getElementById('cp-messages');
  const wrap = document.createElement('div');
  wrap.id = 'cp-typing';
  wrap.className = 'cp-msg cp-msg-bot';
  const dot = document.createElement('div');
  dot.className = 'cp-typing';
  dot.innerHTML = '<span></span><span></span><span></span>';
  wrap.appendChild(dot);
  body.appendChild(wrap);
  body.scrollTop = body.scrollHeight;
}
function removeTyping() { document.getElementById('cp-typing')?.remove(); }

async function sendChat(event) {
  if (event) event.preventDefault();
  const input = document.getElementById('cp-input');
  const msg   = input.value.trim();
  if (!msg) return;
  input.value = '';

  document.getElementById('cp-suggestions')?.remove();
  appendMsg(msg, 'user');
  state.history.push({ role: 'user', content: msg });
  showTyping();

  let reply;
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, history: state.history.slice(-6) }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.fallback) throw new Error('fallback');
      reply = data.reply;
    } else throw new Error('api');
  } catch {
    reply = faqAnswer(msg);
  }

  removeTyping();
  appendMsg(reply, 'bot');
  state.history.push({ role: 'assistant', content: reply });
}

function askSuggestion(btn) {
  document.getElementById('cp-input').value = btn.textContent;
  sendChat(null);
}
