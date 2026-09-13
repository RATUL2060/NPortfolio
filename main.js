/* ============================================================
   DRB v3 — CYBERPUNK main.js
   ============================================================ */
'use strict';

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ══════════ CUSTOM CURSOR ══════════ */
if (!REDUCED && window.innerWidth > 768) {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  let rx = 0, ry = 0, mx = 0, my = 0;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

  (function moveCursor() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    if (dot)  { dot.style.left  = mx + 'px'; dot.style.top  = my + 'px'; }
    if (ring) { ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; }
    requestAnimationFrame(moveCursor);
  })();

  document.querySelectorAll('a, button, .exp-item, .cg-tab, .css-thumb, .cp-sug').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

/* ══════════ NAV ══════════ */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 40), { passive: true });

const navLinks = document.querySelectorAll('.nav-links a');
const secObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const a = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
      if (a) a.classList.add('active');
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('section[id]').forEach(s => secObs.observe(s));

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

/* ══════════ TYPEWRITER EFFECT ══════════ */
(function typewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;
  const text = "I build intelligent applications where data, software and systems meet.";
  let i = 0;
  const delay = REDUCED ? 0 : 45;

  function type() {
    if (i < text.length) {
      el.textContent += text[i++];
      setTimeout(type, delay + (Math.random() * 20));
    }
  }
  // Start after a short delay so hero loads first
  setTimeout(type, REDUCED ? 0 : 800);
})();

/* ══════════ SCROLL REVEALS ══════════ */
const ro = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const siblings = [...(e.target.parentElement?.querySelectorAll('.reveal:not(.visible)') || [])];
      const idx = siblings.indexOf(e.target);
      e.target.style.transitionDelay = Math.min(idx * 0.07, 0.35) + 's';
      e.target.classList.add('visible');
      ro.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => ro.observe(el));

/* ══════════ BG CANVAS — CYBERPUNK PARTICLES ══════════ */
(function bgCanvas() {
  if (REDUCED) return;
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, pts;

  function init() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    const n = Math.min(Math.floor(W * H / 22000), 80);
    pts = Array.from({ length: n }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - .5) * .2,
      vy: (Math.random() - .5) * .2,
      r:  Math.random() * 1.4 + .3,
      a:  Math.random() * .4 + .08,
      col: Math.random() > .6 ? '168,85,247' : '0,245,212',
    }));
  }
  init();
  let rto; window.addEventListener('resize', () => { clearTimeout(rto); rto = setTimeout(init, 200); });

  let mx = W / 2, my = H / 2;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      for (let j = i + 1; j < pts.length; j++) {
        const q = pts[j];
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 115) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,245,212,${.05 * (1 - d / 115)})`;
          ctx.lineWidth = .5;
          ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
      // Mouse repulsion
      const dx = p.x - mx, dy = p.y - my;
      const md = Math.hypot(dx, dy);
      if (md < 90) { p.vx += dx / md * .014; p.vy += dy / md * .014; }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.col},${p.a})`;
      ctx.fill();

      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      const spd = Math.hypot(p.vx, p.vy);
      if (spd > .45) { p.vx = p.vx / spd * .45; p.vy = p.vy / spd * .45; }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ══════════ PORTRAIT CANVAS — RGB SPLIT + SCAN ══════════ */
(function portraitFx() {
  if (REDUCED) return;
  const canvas = document.getElementById('portrait-canvas');
  const img    = document.getElementById('portrait-img');
  if (!canvas || !img) return;
  const ctx  = canvas.getContext('2d');
  const wrap = document.getElementById('portrait-frame');

  function resize() {
    canvas.width  = wrap.offsetWidth;
    canvas.height = wrap.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  let scanY = 0;
  let glitchTimer = 0;
  let glitching = false;

  function drawPortrait() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const w = canvas.width, h = canvas.height;

    // Scan line
    const g = ctx.createLinearGradient(0, scanY - 16, 0, scanY + 16);
    g.addColorStop(0,   'rgba(0,245,212,0)');
    g.addColorStop(.5,  'rgba(0,245,212,0.07)');
    g.addColorStop(1,   'rgba(0,245,212,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, scanY - 16, w, 32);
    scanY = (scanY + .8) % (h + 32);

    // Random glitch strips
    glitchTimer++;
    if (!glitching && glitchTimer > 240 && Math.random() > .97) {
      glitching = true; glitchTimer = 0;
    }
    if (glitching) {
      const strips = Math.floor(Math.random() * 4) + 1;
      for (let i = 0; i < strips; i++) {
        const sy = Math.random() * h;
        const sh = Math.random() * 6 + 1;
        const ox = (Math.random() - .5) * 10;
        ctx.fillStyle = `rgba(0,245,212,0.04)`;
        ctx.fillRect(ox, sy, w, sh);
      }
      if (glitchTimer > 8) glitching = false;
      glitchTimer++;
    }

    requestAnimationFrame(drawPortrait);
  }
  drawPortrait();

  // Mouse parallax on portrait
  if (!REDUCED) {
    document.addEventListener('mousemove', e => {
      const rect = wrap.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) / window.innerWidth;
      const dy = (e.clientY - cy) / window.innerHeight;
      wrap.style.transform = `translate(${dx * 8}px, ${dy * 5}px)`;
    }, { passive: true });
  }
})();

/* ══════════ SKILL CONSTELLATION ══════════ */
(function constellation() {
  const canvas = document.getElementById('constellation');
  if (!canvas) return;
  const ctx  = canvas.getContext('2d');
  const hint = document.getElementById('skills-hint');

  const NODES = [
    { id: 'python',    label: 'Python',             group: 'lang',    x:.5,  y:.45, r:8, proj:['CardioSense AI'], exp:['Data Science Intern'] },
    { id: 'pandas',    label: 'Pandas',              group: 'data',    x:.35, y:.32, r:5, proj:['CardioSense AI'] },
    { id: 'numpy',     label: 'NumPy',               group: 'data',    x:.25, y:.48, r:5, proj:['CardioSense AI'] },
    { id: 'sklearn',   label: 'Scikit-learn',        group: 'ml',      x:.42, y:.6,  r:6, proj:['CardioSense AI'] },
    { id: 'shap',      label: 'SHAP',                group: 'ml',      x:.57, y:.7,  r:5, proj:['CardioSense AI'] },
    { id: 'react',     label: 'React',               group: 'web',     x:.66, y:.35, r:6, proj:['CardioSense AI'] },
    { id: 'fastapi',   label: 'FastAPI',             group: 'web',     x:.73, y:.5,  r:6, proj:['CardioSense AI'] },
    { id: 'docker',    label: 'Docker',              group: 'devops',  x:.64, y:.62, r:6, proj:['CardioSense AI','Jellyfin Lab'] },
    { id: 'nginx',     label: 'Nginx',               group: 'devops',  x:.8,  y:.4,  r:4, proj:['CardioSense AI','Jellyfin Lab'] },
    { id: 'git',       label: 'Git / GitHub Actions',group: 'devops',  x:.77, y:.68, r:4, proj:['CardioSense AI'] },
    { id: 'mikrotik',  label: 'MikroTik RouterOS',   group: 'network', x:.22, y:.68, r:6, proj:['Jellyfin Lab'], exp:['Agni Systems'] },
    { id: 'wireguard', label: 'WireGuard',           group: 'network', x:.13, y:.53, r:5, proj:['Jellyfin Lab'], exp:['Agni Systems'] },
    { id: 'vpn',       label: 'VPN',                 group: 'network', x:.18, y:.38, r:4, exp:['Agni Systems'] },
    { id: 'sql',       label: 'SQL',                 group: 'data',    x:.36, y:.2,  r:4, proj:['CardioSense AI'] },
    { id: 'cnn',       label: 'CNN / Deep Learning', group: 'ml',      x:.5,  y:.18, r:5, proj:['Research'] },
  ];

  const EDGES = [
    ['python','pandas'],['python','numpy'],['python','sklearn'],['python','shap'],
    ['python','cnn'],['python','sql'],['sklearn','shap'],['react','fastapi'],
    ['fastapi','docker'],['docker','nginx'],['mikrotik','wireguard'],['wireguard','vpn'],
    ['pandas','sklearn'],['numpy','sklearn'],['docker','git'],['fastapi','git'],
  ];

  const G_COL = {
    lang:'0,245,212', data:'0,245,212', ml:'168,85,247',
    web:'0,245,212', devops:'251,191,36', network:'168,85,247',
  };

  let W, H, hovered = null;

  function init() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    NODES.forEach(n => { n.px = n.x * W; n.py = n.y * H; });
  }
  init();
  let rto; window.addEventListener('resize', () => { clearTimeout(rto); rto = setTimeout(init, 150); });

  function getConn(id) {
    const s = new Set([id]);
    EDGES.forEach(([a,b]) => { if(a===id) s.add(b); if(b===id) s.add(a); });
    return s;
  }

  let animFrame = 0;
  function draw() {
    animFrame++;
    ctx.clearRect(0, 0, W, H);
    const conn = hovered ? getConn(hovered) : null;

    // Edges
    EDGES.forEach(([a,b]) => {
      const na = NODES.find(n=>n.id===a), nb = NODES.find(n=>n.id===b);
      if (!na || !nb) return;
      const active = conn && conn.has(a) && conn.has(b);
      ctx.beginPath();
      ctx.moveTo(na.px, na.py); ctx.lineTo(nb.px, nb.py);
      if (active) {
        // Animated pulse along active edges
        const t = (animFrame % 80) / 80;
        const gx = na.px + (nb.px - na.px) * t;
        const gy = na.py + (nb.py - na.py) * t;
        ctx.strokeStyle = 'rgba(0,245,212,0.4)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(gx, gy, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,245,212,0.8)';
        ctx.fill();
      } else {
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = .5;
        ctx.stroke();
      }
    });

    // Nodes
    NODES.forEach(n => {
      const isHov   = hovered === n.id;
      const isConn  = conn && conn.has(n.id);
      const col     = G_COL[n.group] || '255,255,255';
      const alpha   = hovered ? (isConn ? 1 : .15) : .6;
      const r       = n.r + (isHov ? 4 : 0);

      // Glow halo
      if (isHov) {
        const grd = ctx.createRadialGradient(n.px, n.py, 0, n.px, n.py, 36);
        grd.addColorStop(0, `rgba(${col},0.22)`);
        grd.addColorStop(1, `rgba(${col},0)`);
        ctx.beginPath(); ctx.arc(n.px, n.py, 36, 0, Math.PI*2);
        ctx.fillStyle = grd; ctx.fill();
      } else if (isConn && conn) {
        const grd = ctx.createRadialGradient(n.px, n.py, 0, n.px, n.py, 18);
        grd.addColorStop(0, `rgba(${col},0.12)`);
        grd.addColorStop(1, `rgba(${col},0)`);
        ctx.beginPath(); ctx.arc(n.px, n.py, 18, 0, Math.PI*2);
        ctx.fillStyle = grd; ctx.fill();
      }

      // Dot
      ctx.beginPath(); ctx.arc(n.px, n.py, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${col},${alpha})`; ctx.fill();
      if (isHov) {
        ctx.strokeStyle = `rgba(${col},0.8)`; ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Label
      const fs  = isHov ? 13 : 11.5;
      const fc  = hovered ? (isConn ? 'rgba(226,232,240,1)' : 'rgba(100,116,139,0.3)') : 'rgba(100,116,139,0.85)';
      ctx.font = `${isHov ? '600' : '400'} ${fs}px 'Inter', sans-serif`;
      ctx.fillStyle = fc;
      ctx.textAlign = 'center';
      ctx.fillText(n.label, n.px, n.py - r - 7);
    });

    requestAnimationFrame(draw);
  }
  draw();

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    let found = null;
    NODES.forEach(n => { if (Math.hypot(n.px-mx, n.py-my) < n.r + 20) found = n.id; });
    hovered = found;
    canvas.style.cursor = 'none';
    if (found) {
      const n = NODES.find(x=>x.id===found);
      const all = [...(n.proj||[]), ...(n.exp||[])].join(' · ');
      if (hint) { hint.textContent = all || n.label; hint.style.color = 'rgba(0,245,212,.9)'; }
    } else {
      if (hint) { hint.textContent = 'HOVER A NODE TO TRACE CONNECTIONS'; hint.style.color = ''; }
    }
  });
  canvas.addEventListener('mouseleave', () => {
    hovered = null;
    if (hint) { hint.textContent = 'HOVER A NODE TO TRACE CONNECTIONS'; hint.style.color = ''; }
  });
})();

/* ══════════ GALLERY ══════════ */
(function gallery() {
  const tabs = document.querySelectorAll('.cg-tab');
  const img  = document.getElementById('cg-img');
  if (!tabs.length || !img) return;

  function activate(btn) {
    tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected','false'); });
    btn.classList.add('active'); btn.setAttribute('aria-selected','true');
    img.style.opacity = '0';
    setTimeout(() => { img.src = btn.dataset.src; img.alt = btn.dataset.alt; img.style.opacity = '1'; }, 220);
  }
  tabs.forEach(t => t.addEventListener('click', () => activate(t)));

  let iv = setInterval(() => {
    const arr = [...tabs];
    const idx = arr.indexOf(document.querySelector('.cg-tab.active'));
    activate(arr[(idx + 1) % arr.length]);
  }, 5000);
  tabs.forEach(t => t.addEventListener('click', () => clearInterval(iv)));
})();

/* ══════════ JELLYFIN NETWORK DIAGRAM ══════════ */
(function netDiagram() {
  const wrap = document.getElementById('nd-wrap');
  if (!wrap) return;
  const paths = wrap.querySelectorAll('.nd-path');
  let done = false;
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !done) {
      done = true;
      paths.forEach((p, i) => setTimeout(() => p.classList.add('drawn'), i * 200));
      setTimeout(() => wrap.classList.add('animated'), paths.length * 200 + 100);
      obs.disconnect();
    }
  }, { threshold: .3 });
  obs.observe(wrap);
})();

/* ══════════ EXPERIENCE EXPAND ══════════ */
document.querySelectorAll('.exp-item').forEach(item => {
  function toggle() {
    const ex = item.getAttribute('aria-expanded') === 'true';
    item.setAttribute('aria-expanded', String(!ex));
  }
  item.addEventListener('click', toggle);
  item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
});

/* ══════════ CHATBOT ══════════ */
const FAQ = [
  { q:/study|degree|university|dortmund|msc|master/i,
    a:'Dhrubo is pursuing an M.Sc. in Data Science at TU Dortmund University, Germany, since April 2026.' },
  { q:/cardiosense|heart|flagship|ml.*project|project.*ml/i,
    a:'CardioSense AI is Dhrubo\'s flagship project — a full-stack ML healthcare platform with React, FastAPI, Scikit-learn, SHAP explainability, Docker and GitHub Actions CI. It includes patient management, prediction history, analytics dashboard and hospital search. GitHub: github.com/RATUL2060/CardioSense-AI. Educational project — predictions are not medical diagnoses.' },
  { q:/jellyfin|media server|self.?host|network.*project/i,
    a:'Dhrubo built a secure self-hosted Jellyfin media server using Docker, Cloudflare Tunnel, Nginx Proxy Manager and MikroTik RouterOS — simulating ISP networking with WireGuard VPN, PPPoE and QoS. GitHub: github.com/RATUL2060/Networked-Jellyfin-Lab' },
  { q:/network|mikrotik|cisco|noc|agni/i,
    a:'Dhrubo worked as Junior Network Engineer (NOC) at Agni Systems Limited, Bangladesh (March–December 2025). Monitored and troubleshot live network using MikroTik RouterOS and Cisco devices, diagnosed outages, configured VPN, PPPoE and QoS.' },
  { q:/intern|maxgen|data science.*work|experience.*data/i,
    a:'Dhrubo completed a Data Science internship at Maxgen Technologies, India (Jan–Apr 2024), working on ML projects and a Heart Disease Prediction pipeline using Python and Scikit-learn.' },
  { q:/technolog|skill|stack|python|docker|react|fastapi/i,
    a:'Core stack: Python, Pandas, NumPy, Scikit-learn (Data Science) · React, FastAPI, SQLite (Full-Stack) · Docker, Nginx, GitHub Actions (DevOps) · MikroTik RouterOS, WireGuard, VPN (Networking) · SHAP / Explainable AI · CNN (learning).' },
  { q:/available|werkstudent|hire|job|internship|opportunit/i,
    a:'Dhrubo is currently available for Werkstudent positions and internships in Germany, particularly in Data Science, ML Engineering and related technical roles.' },
  { q:/research|cnn|anomaly|detection/i,
    a:'Dhrubo is exploring CNN-based network anomaly detection — applying CNNs to network traffic data for anomaly and intrusion identification. Research in progress as part of M.Sc. studies. No publications yet.' },
  { q:/contact|email|reach|github|linkedin/i,
    a:'Email: basakdhrubo@gmail.com · GitHub: github.com/RATUL2060 · LinkedIn: linkedin.com/in/dhrubo-ratul-b-a12253236' },
  { q:/who|about|background|summary|tell me about/i,
    a:'Dhrubo Ratul Basak is a Computer Engineering graduate studying M.Sc. Data Science at TU Dortmund. He builds ML applications, has real-world networking experience, and combines Data Science, Software Engineering and Infrastructure in his work.' },
  { q:/scholarship|iccr|award/i,
    a:'Dhrubo received the ICCR International Scholarship from the Government of India for his undergraduate studies at Gujarat Technological University.' },
];

function faqAns(msg) {
  for (const { q, a } of FAQ) if (q.test(msg)) return a;
  return 'I don\'t have that detail in the portfolio. Reach Dhrubo directly: basakdhrubo@gmail.com or github.com/RATUL2060';
}

const cState = { open: false, hist: [] };

function toggleChat(force) {
  const fab   = document.getElementById('chatbot-fab');
  const panel = document.getElementById('chatbot-panel');
  const open  = force !== undefined ? force : !cState.open;
  cState.open = open;
  panel.hidden = !open;
  fab.setAttribute('aria-expanded', String(open));
  if (open) setTimeout(() => document.getElementById('cp-in')?.focus(), 80);
}
document.getElementById('chatbot-fab').addEventListener('click', () => toggleChat());
document.getElementById('chatbot-close').addEventListener('click', () => toggleChat(false));
document.getElementById('ask-nav-btn')?.addEventListener('click', () => toggleChat(true));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && cState.open) toggleChat(false); });

function appendMsg(text, role) {
  const body = document.getElementById('cp-body');
  const wrap = document.createElement('div');
  wrap.className = 'cp-msg ' + role;
  const d = document.createElement('div');
  d.className = 'cm-t'; d.textContent = text;
  wrap.appendChild(d); body.appendChild(wrap);
  body.scrollTop = body.scrollHeight;
}
function showTyping() {
  const body = document.getElementById('cp-body');
  const w = document.createElement('div');
  w.id = 'cp-typing'; w.className = 'cp-msg bot';
  const d = document.createElement('div');
  d.className = 'cp-typing-wrap';
  d.innerHTML = '<span></span><span></span><span></span>';
  w.appendChild(d); body.appendChild(w); body.scrollTop = body.scrollHeight;
}
function removeTyping() { document.getElementById('cp-typing')?.remove(); }

async function sendChat(ev) {
  if (ev) ev.preventDefault();
  const inp = document.getElementById('cp-in');
  const msg = inp.value.trim(); if (!msg) return;
  inp.value = '';
  document.getElementById('cp-sugs')?.remove();
  appendMsg(msg, 'user');
  cState.hist.push({ role:'user', content:msg });
  showTyping();

  let reply;
  try {
    const res = await fetch('/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, history: cState.hist.slice(-6) }),
    });
    if (res.ok) { const d = await res.json(); if (d.fallback) throw 0; reply = d.reply; }
    else throw 0;
  } catch { reply = faqAns(msg); }

  removeTyping(); appendMsg(reply, 'bot');
  cState.hist.push({ role:'assistant', content:reply });
}

function askSugg(btn) { document.getElementById('cp-in').value = btn.textContent; sendChat(null); }
