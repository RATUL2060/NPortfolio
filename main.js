/* ============================================================
   DRB // DATA SYSTEM — main.js
   Modules: Loader, Canvas, Nav, SystemMap, Skills,
            Gallery, Reveals, Lang, Chatbot, Forms
   ============================================================ */
'use strict';

/* ══════════ 1. LOADER ══════════ */
(function initLoader() {
  const loader  = document.getElementById('loader');
  const fill    = document.getElementById('loader-fill');
  const status  = document.getElementById('loader-status');
  const lines   = document.getElementById('loader-lines');
  if (!loader) return;

  // Skip on return visits
  if (sessionStorage.getItem('drb_booted')) {
    loader.classList.add('done');
    setTimeout(() => loader.remove(), 600);
    return;
  }

  const steps = [
    { pct: 15,  msg: 'LOADING PROFILE MODULE...' },
    { pct: 35,  msg: 'LOADING ML MODULES...' },
    { pct: 55,  msg: 'LOADING PROJECT DATABASE...' },
    { pct: 75,  msg: 'LOADING NETWORK MODULE...' },
    { pct: 90,  msg: 'ESTABLISHING CONNECTION...' },
    { pct: 100, msg: 'SYSTEM ONLINE.' },
  ];

  let i = 0;
  function nextStep() {
    if (i >= steps.length) {
      sessionStorage.setItem('drb_booted', '1');
      setTimeout(() => {
        loader.classList.add('done');
        setTimeout(() => loader.remove(), 600);
      }, 400);
      return;
    }
    const s = steps[i++];
    fill.style.width = s.pct + '%';
    status.textContent = s.msg;
    const line = document.createElement('div');
    line.textContent = '> ' + s.msg;
    lines.appendChild(line);
    setTimeout(nextStep, i === steps.length ? 600 : 320);
  }
  nextStep();
})();

/* ══════════ 2. CANVAS BACKGROUND ══════════ */
(function initCanvas() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  let resizeTimer;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); });

  const COUNT = window.innerWidth < 700 ? 20 : 50;
  const particles = Array.from({ length: COUNT }, () => ({
    x:  Math.random() * canvas.width,
    y:  Math.random() * canvas.height,
    r:  Math.random() * 1.4 + 0.3,
    vx: (Math.random() - 0.5) * 0.22,
    vy: (Math.random() - 0.5) * 0.22,
    a:  Math.random() * 0.4 + 0.1,
  }));

  let mx = -1, my = -1;
  canvas.parentElement.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mx = e.clientX - r.left;
    my = e.clientY - r.top;
  });

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 110) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,212,255,${0.055 * (1 - d / 110)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
      // Mouse repulsion
      if (mx > 0) {
        const dx = p.x - mx, dy = p.y - my;
        const md = Math.hypot(dx, dy);
        if (md < 80) { p.vx += dx / md * 0.04; p.vy += dy / md * 0.04; }
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,212,255,${p.a})`;
      ctx.fill();
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      // Clamp velocity
      const speed = Math.hypot(p.vx, p.vy);
      if (speed > 0.5) { p.vx = p.vx / speed * 0.5; p.vy = p.vy / speed * 0.5; }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ══════════ 3. NAV ══════════ */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 20), { passive: true });

// Active section tracking
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-links a');
const secObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const a = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
      if (a) a.classList.add('active');
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach(s => secObs.observe(s));

// Mobile hamburger
const hamburger = document.getElementById('hamburger');
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

// Nav chatbot button
document.getElementById('chatbot-nav-btn').addEventListener('click', () => toggleChatbot(true));

/* ══════════ 4. LANGUAGE SWITCH ══════════ */
function setLang(lang) {
  document.documentElement.setAttribute('data-lang', lang);
  const enBtn = document.getElementById('btn-en');
  const deBtn = document.getElementById('btn-de');
  enBtn.classList.toggle('active', lang === 'en');
  deBtn.classList.toggle('active', lang === 'de');
  enBtn.setAttribute('aria-pressed', String(lang === 'en'));
  deBtn.setAttribute('aria-pressed', String(lang === 'de'));
  document.querySelectorAll('[data-en][data-de]').forEach(el => {
    el.textContent = el.getAttribute(`data-${lang}`) || el.getAttribute('data-en');
  });
  localStorage.setItem('drb_lang', lang);
}
// Restore saved lang
const savedLang = localStorage.getItem('drb_lang');
if (savedLang && savedLang !== 'en') setLang(savedLang);

/* ══════════ 5. SCROLL REVEAL ══════════ */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.1 });

const REVEAL_SELECTORS = [
  '.tl-item', '.tl-body', '.project-card', '.cs-feat', '.cs-arch', '.cs-gallery', '.cs-stack',
  '.research-topic', '.research-pipeline', '.sg', '.exp-item', '.cert-card', '.ach-card',
  '.about-text', '.about-panel', '.contact-info', '.contact-form', '.research-notice',
  '.sm-node', '.identity-node', '.hero-text', '.jf-desc', '.jf-arch'
];
document.querySelectorAll(REVEAL_SELECTORS.join(',')).forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = (i % 6) * 0.06 + 's';
  revealObs.observe(el);
});

/* ══════════ 6. SYSTEM MAP ══════════ */
(function initSysMap() {
  const nodes = document.querySelectorAll('.sm-node');
  if (!nodes.length) return;
  nodes.forEach(node => {
    node.addEventListener('mouseenter', () => {
      nodes.forEach(n => n.classList.remove('active'));
      node.classList.add('active');
    });
    node.addEventListener('mouseleave', () => node.classList.remove('active'));
  });
})();

/* ══════════ 7. CARDIOSENSE GALLERY ══════════ */
(function initGallery() {
  const thumbs = document.querySelectorAll('.cgt');
  const img    = document.getElementById('cg-img');
  const label  = document.getElementById('cg-label');
  if (!thumbs.length) return;

  function activate(btn) {
    thumbs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    img.style.opacity = '0';
    setTimeout(() => {
      img.src = btn.dataset.src;
      img.alt = btn.dataset.label || 'CardioSense screenshot';
      label.textContent = btn.dataset.label || '';
      img.style.opacity = '1';
    }, 200);
  }

  thumbs.forEach(btn => btn.addEventListener('click', () => activate(btn)));

  // Keyboard navigation
  document.getElementById('cg-main')?.addEventListener('keydown', e => {
    const active = document.querySelector('.cgt.active');
    const idx = [...thumbs].indexOf(active);
    if (e.key === 'ArrowRight' && idx < thumbs.length - 1) activate(thumbs[idx + 1]);
    if (e.key === 'ArrowLeft'  && idx > 0)                  activate(thumbs[idx - 1]);
  });

  // Auto cycle
  let galleryTimer = setInterval(() => {
    const active = document.querySelector('.cgt.active');
    const idx = [...thumbs].indexOf(active);
    activate(thumbs[(idx + 1) % thumbs.length]);
  }, 4000);

  thumbs.forEach(btn => {
    btn.addEventListener('click', () => { clearInterval(galleryTimer); });
  });
})();

/* ══════════ 8. SKILL MATRIX HOVER ══════════ */
(function initSkillMatrix() {
  const tags = document.querySelectorAll('.stag[data-skill]');
  if (!tags.length) return;

  // Map: project/exp id -> highlight element
  const highlight = (id, on) => {
    const el = document.getElementById(id) || document.querySelector(`[data-tl-id="${id}"]`);
    if (el) el.style.boxShadow = on ? '0 0 0 2px rgba(0,212,255,.5)' : '';
  };

  tags.forEach(tag => {
    tag.addEventListener('mouseenter', () => {
      const proj = (tag.dataset.projects || '').split(',').filter(Boolean);
      const exps = (tag.dataset.exp || '').split(',').filter(Boolean);
      proj.forEach(id => {
        const sec = document.getElementById(id === 'jellyfin' ? 'projects' : id === 'research' ? 'research' : 'cardiosense');
        if (sec) sec.style.outline = '2px solid rgba(0,212,255,.25)';
      });
    });
    tag.addEventListener('mouseleave', () => {
      document.querySelectorAll('section').forEach(s => s.style.outline = '');
    });
  });
})();

/* ══════════ 9. CONTACT FORM ══════════ */
function handleFormSubmit(event) {
  event.preventDefault();
  const btn   = document.getElementById('submit-btn');
  const label = document.getElementById('submit-label');
  const name  = document.getElementById('cf-name').value.trim();
  const email = document.getElementById('cf-email').value.trim();
  const msg   = document.getElementById('cf-msg').value.trim();
  if (!name || !email || !msg) return;

  const orig = label.textContent;
  label.textContent = 'SENDING...';
  btn.disabled = true;

  setTimeout(() => {
    label.textContent = '✓ MESSAGE SENT';
    btn.style.background = '#10b981';
    setTimeout(() => {
      label.textContent = orig;
      btn.style.background = '';
      btn.disabled = false;
      event.target.reset();
    }, 3000);
  }, 900);
}

/* ══════════ 10. CHATBOT ══════════ */
const PORTFOLIO_KB = {
  profile: {
    name: 'Dhrubo Ratul Basak',
    location: 'Dortmund, Germany',
    origin: 'Dhaka, Bangladesh',
    title: 'Data Science • Machine Learning • Network Engineering',
    summary: 'M.Sc. Data Science student at TU Dortmund with a background in Computer Engineering and professional experience in Network Engineering and Data Science.',
    availability: 'Available for Werkstudent and internship opportunities in Germany.',
    email: 'basakdhrubo@gmail.com',
    github: 'https://github.com/RATUL2060',
    linkedin: 'https://www.linkedin.com/in/dhrubo-ratul-b-a12253236/?locale=de',
  },
  education: {
    masters: 'M.Sc. Data Science at TU Dortmund University, Germany. Started April 2026. Currently in first semester. Focus: statistical learning, machine learning algorithms, data engineering.',
    bachelors: 'B.E. Computer Engineering at Gujarat Technological University, India. September 2020 – June 2024.',
    scholarship: 'Awarded ICCR International Scholarship by the Government of India for undergraduate studies abroad.',
    minor: 'Completed Minor Degree in Global Citizenship & Personality Development.',
  },
  experience: {
    networkEngineer: 'Junior Network Engineer (NOC) at Agni Systems Limited, Bangladesh. March 2025 – December 2025. Monitored and troubleshot network issues using MikroTik RouterOS and Cisco devices. Diagnosed outages and resolved connectivity issues. Worked with VPN, PPPoE, QoS configurations.',
    dataScienceIntern: 'Data Science Intern at Maxgen Technologies Pvt. Ltd., India. January 2024 – April 2024. Worked on data analysis and machine learning projects. Worked on a Heart Disease Prediction system.',
  },
  projects: {
    cardioSenseAI: 'CardioSense AI is a full-stack ML healthcare application. It includes: React frontend, FastAPI backend, JWT authentication, patient CRUD management, heart disease risk prediction using ML, explainable AI with SHAP, prediction history, interactive analytics dashboard, nearby cardiologist search using Leaflet/OpenStreetMap. Deployed with Docker and Docker Compose. CI via GitHub Actions. GitHub: https://github.com/RATUL2060/CardioSense-AI. This is an educational and portfolio project. Predictions are not medical diagnoses.',
    jellyfin: 'Secure self-hosted Jellyfin media server with HTTPS via Cloudflare Tunnel and Nginx Proxy Manager. Simulates ISP networking using MikroTik RouterOS with PPPoE, WireGuard VPN, and QoS. GitHub: https://github.com/RATUL2060/Networked-Jellyfin-Lab.git',
  },
  research: {
    current: 'Currently exploring CNN-based network anomaly detection — applying convolutional neural networks to network traffic data for anomaly and intrusion detection. Research in progress, no publications yet.',
  },
  skills: {
    programming: 'Python, SQL',
    dataScience: 'Pandas, NumPy, Scikit-learn, data analysis, preprocessing, model selection',
    machineLearning: 'Classification, regression, SHAP/explainable AI, model evaluation, anomaly detection, CNN (learning)',
    fullStack: 'React, FastAPI, REST API, SQLAlchemy, Pydantic, JWT, SQLite',
    devops: 'Docker, Docker Compose, Nginx, Git, GitHub Actions',
    networking: 'MikroTik RouterOS, WireGuard, VPN, PPPoE, QoS, Cloudflare Tunnel, Nginx Proxy Manager, Cisco, Network Operations',
    other: 'Streamlit, Caddy',
  },
  certifications: [
    'MikroTik MTCNA Training — Udemy',
    'Goethe-Zertifikat A1 — Goethe-Institut',
    'Network Security — Coursera',
    'Cyber Security Workshop — Skill Development Program',
  ],
  languages: { english: 'C1 — Advanced', german: 'A2 — Elementary (learning)', bengali: 'Native', hindi: 'Conversational' },
  achievements: [
    'ICCR International Scholarship (Government of India, 2020–2024)',
    'Minor Degree in Global Citizenship & Personality Development',
    'World STEM & Robotics Olympiad (WSRO) — International — Line Following and Robo Race with embedded systems',
    'International Model United Nations (IMUN) — Delegate to Albania — environmental challenges research',
  ],
};

// FAQ fallback
const FAQ = [
  { q: /study|studying|degree|university|tud?ortmund|msc|master/i, a: `Dhrubo is currently pursuing an M.Sc. in Data Science at TU Dortmund University in Germany, since April 2026.` },
  { q: /cardiosense|cardiac|heart|ml.*project|flagship/i, a: `CardioSense AI is Dhrubo's flagship project — a full-stack ML healthcare application with React, FastAPI, JWT auth, patient management, SHAP explainable AI, analytics dashboard, and nearby hospital search using Leaflet/OpenStreetMap. Deployed with Docker. It is an educational portfolio project; predictions are not medical diagnoses. GitHub: https://github.com/RATUL2060/CardioSense-AI` },
  { q: /jellyfin|media server|self.?host|network.*project/i, a: `Dhrubo built a secure self-hosted Jellyfin media server using Docker, Cloudflare Tunnel, Nginx Proxy Manager and MikroTik RouterOS — simulating real ISP networking concepts including WireGuard VPN, PPPoE and QoS.` },
  { q: /network|mikrotik|cisco|noc|agni/i, a: `Dhrubo worked as a Junior Network Engineer (NOC) at Agni Systems Limited in Bangladesh (March–December 2025). He monitored network issues, worked with MikroTik RouterOS and Cisco devices, diagnosed outages, and configured VPN, PPPoE and QoS policies.` },
  { q: /intern|maxgen|data science.*work|work.*data science/i, a: `Dhrubo completed a Data Science internship at Maxgen Technologies Pvt. Ltd. in India (January–April 2024), working on data analysis, machine learning and a Heart Disease Prediction project.` },
  { q: /technolog|skill|know|use|stack|python|docker|react|fastapi/i, a: `Dhrubo's core stack: Python, SQL, Pandas, NumPy, Scikit-learn (Data Science), React, FastAPI, SQLAlchemy, JWT, SQLite (Full-Stack), Docker, Nginx, GitHub Actions (DevOps), MikroTik RouterOS, WireGuard, VPN (Networking), SHAP / Explainable AI, CNN (learning).` },
  { q: /available|work|werkstudent|hire|job|opportunity|internship/i, a: `Dhrubo is currently available for Werkstudent positions and internships in Germany, particularly in Data Science, ML Engineering and related technical roles.` },
  { q: /research|cnn|anomaly|detection/i, a: `Dhrubo is currently exploring CNN-based network anomaly detection — applying convolutional neural networks to network traffic for anomaly and intrusion detection. This is active research in progress with no publications yet.` },
  { q: /location|where|country|germany|dortmund/i, a: `Dhrubo is based in Dortmund, Germany.` },
  { q: /contact|email|reach|linkedin|github/i, a: `You can reach Dhrubo at basakdhrubo@gmail.com, on GitHub at github.com/RATUL2060, or on LinkedIn (link in the Contact section).` },
  { q: /scholarship|iccr|award|achievement/i, a: `Dhrubo was awarded the ICCR International Scholarship by the Government of India for his undergraduate studies. He also participated in the World STEM & Robotics Olympiad and served as an IMUN delegate for Albania.` },
  { q: /language|english|german|bengali|hindi/i, a: `Dhrubo speaks English (C1 – Advanced), German (A2 – learning), Bengali (Native), and Hindi (Conversational).` },
  { q: /background|who|about|summary|tell me about dhrubo/i, a: `Dhrubo Ratul Basak is a Computer Engineering graduate now studying M.Sc. Data Science at TU Dortmund, Germany. He builds full-stack ML applications (CardioSense AI) and has real-world networking experience as a Network Engineer. His profile combines Data Science, Machine Learning, Software Engineering, and Network Infrastructure.` },
  { q: /education|bachelor|gtu|gujarat/i, a: `Dhrubo completed a B.E. in Computer Engineering at Gujarat Technological University, India (2020–2024) on an ICCR scholarship, with a Minor in Global Citizenship & Personality Development.` },
];

function fallbackAnswer(msg) {
  for (const { q, a } of FAQ) {
    if (q.test(msg)) return a;
  }
  return `I don't have that specific information in Dhrubo's portfolio. You can reach him directly at basakdhrubo@gmail.com or check his GitHub at github.com/RATUL2060.`;
}

// Chatbot state
const chatbotState = { open: false, history: [] };

function toggleChatbot(force) {
  const fab   = document.getElementById('chatbot-fab');
  const panel = document.getElementById('chatbot-panel');
  const open  = force !== undefined ? force : !chatbotState.open;
  chatbotState.open = open;
  panel.hidden = !open;
  fab.setAttribute('aria-expanded', String(open));
  if (open) document.getElementById('chatbot-input').focus();
}

document.getElementById('chatbot-fab').addEventListener('click', () => toggleChatbot());
document.getElementById('chatbot-close').addEventListener('click', () => toggleChatbot(false));

function appendMessage(text, role) {
  const body = document.getElementById('chatbot-body');
  const wrap = document.createElement('div');
  wrap.className = 'chat-msg ' + (role === 'user' ? 'user-msg' : 'bot-msg');
  const inner = document.createElement('div');
  inner.className = 'cm-text';
  inner.textContent = text;
  wrap.appendChild(inner);
  body.appendChild(wrap);
  body.scrollTop = body.scrollHeight;
  return wrap;
}

function showTyping() {
  const body = document.getElementById('chatbot-body');
  const wrap = document.createElement('div');
  wrap.className = 'chat-msg bot-msg';
  wrap.id = 'typing-indicator';
  const dot = document.createElement('div');
  dot.className = 'cp-typing';
  dot.innerHTML = '<span></span><span></span><span></span>';
  wrap.appendChild(dot);
  body.appendChild(wrap);
  body.scrollTop = body.scrollHeight;
}
function removeTyping() { document.getElementById('typing-indicator')?.remove(); }

async function sendChatMessage(event) {
  if (event) event.preventDefault();
  const input = document.getElementById('chatbot-input');
  const msg   = input.value.trim();
  if (!msg) return;
  input.value = '';

  appendMessage(msg, 'user');
  chatbotState.history.push({ role: 'user', content: msg });
  showTyping();

  // Try API, fall back to local
  let reply;
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, history: chatbotState.history.slice(-6) }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.fallback) throw new Error('fallback');
      reply = data.reply;
    } else {
      throw new Error('api_error');
    }
  } catch {
    reply = fallbackAnswer(msg);
  }

  removeTyping();
  appendMessage(reply, 'bot');
  chatbotState.history.push({ role: 'assistant', content: reply });
}

function askSuggestion(btn) {
  document.getElementById('chatbot-input').value = btn.textContent;
  sendChatMessage(null);
  btn.closest('.cp-suggestions')?.remove();
}

// Keyboard: Escape closes chatbot
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && chatbotState.open) toggleChatbot(false);
});

/* ══════════ GSAP entrance (optional) ══════════ */
window.addEventListener('load', () => {
  if (typeof gsap === 'undefined') return;
  gsap.from('.hero-meta',      { y: 20, opacity: 0, duration: .5, delay: .1 });
  gsap.from('.hero-name',      { y: 30, opacity: 0, duration: .7, delay: .2 });
  gsap.from('.hero-roles',     { y: 20, opacity: 0, duration: .5, delay: .4 });
  gsap.from('.hero-tagline',   { y: 16, opacity: 0, duration: .5, delay: .55 });
  gsap.from('.hero-edu-badge', { y: 12, opacity: 0, duration: .4, delay: .65 });
  gsap.from('.hero-avail',     { y: 12, opacity: 0, duration: .4, delay: .75 });
  gsap.from('.hero-actions .btn', { y: 12, opacity: 0, duration: .4, stagger: .08, delay: .85 });
  gsap.from('.identity-node', { scale: .92, opacity: 0, duration: .7, delay: .3, ease: 'back.out(1.4)' });
});
