/* ============================================================
   DRB v5 — MAIN.JS
   Neural hero canvas, HUD clock, CardioSense modal preview,
   Telemetry radar, Project Tile 3D Tilt & Hover Animation,
   and in-browser AI Assistant.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. HUD UTC CLOCK ── */
  const clockEl = document.getElementById('hud-clock');
  function updateClock() {
    if (!clockEl) return;
    const now = new Date();
    const h = String(now.getUTCHours()).padStart(2, '0');
    const m = String(now.getUTCMinutes()).padStart(2, '0');
    const s = String(now.getUTCSeconds()).padStart(2, '0');
    clockEl.textContent = `${h}:${m}:${s} UTC`;
  }
  setInterval(updateClock, 1000);
  updateClock();

  /* ── 2. NEURAL NETWORK CANVAS (HERO) ── */
  const canvas = document.getElementById('hero-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];

    function resize() {
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
      initParticles();
    }

    function initParticles() {
      particles = [];
      const count = Math.floor((width * height) / 12000);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.7,
          vy: (Math.random() - 0.5) * 0.7,
          radius: Math.random() * 2 + 1.2,
          color: Math.random() > 0.4 ? '#00f0ff' : '#c084fc'
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      // Connect lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 240, 255, ${0.18 * (1 - dist / 130)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    resize();
    draw();
  }

  /* ── 3. SCROLL REVEAL OBSERVER ── */
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });
  reveals.forEach(el => observer.observe(el));

  /* ── 4. PROJECT TILE 3D TILT & HOVER INTERACTION ── */
  const projectTiles = document.querySelectorAll('.project-tile-interactive');
  projectTiles.forEach(tile => {
    tile.addEventListener('mousemove', (e) => {
      const rect = tile.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;
      
      tile.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });

    tile.addEventListener('mouseleave', () => {
      tile.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });

  /* ── 5. CARDIOSENSE MODAL PREVIEW ── */
  const modal = document.getElementById('cs-modal');
  const previewBtn = document.getElementById('preview-cardiosense-btn');
  const closeBtn = document.getElementById('modal-close-btn');
  const backdrop = document.getElementById('modal-backdrop');
  const modalImg = document.getElementById('modal-active-img');
  const mTabs = document.querySelectorAll('.m-tab');

  if (previewBtn && modal) {
    previewBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
    });

    const closeModal = () => {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);

    mTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        mTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        if (modalImg && tab.dataset.src) {
          modalImg.style.opacity = '0.3';
          setTimeout(() => {
            modalImg.src = tab.dataset.src;
            modalImg.style.opacity = '1';
          }, 150);
        }
      });
    });
  }

  /* ── 6. AI ASSISTANT PANEL & CHAT ENGINE ── */
  const triggerBtn = document.getElementById('assistant-trigger-btn');
  const openNavBtn = document.getElementById('open-assistant-btn');
  const closeAssistantBtn = document.getElementById('assistant-close-btn');
  const assistantPanel = document.getElementById('assistant-panel');
  const callout = document.getElementById('assistant-callout');
  const calloutClose = document.getElementById('callout-close-btn');
  const chatForm = document.getElementById('panel-form');
  const chatInput = document.getElementById('panel-input');
  const messagesBox = document.getElementById('panel-messages');
  const qpButtons = document.querySelectorAll('.qp-btn');

  function openAssistant() {
    if (assistantPanel) {
      assistantPanel.classList.add('open');
      assistantPanel.setAttribute('aria-hidden', 'false');
    }
    if (callout) callout.style.display = 'none';
  }

  function closeAssistant() {
    if (assistantPanel) {
      assistantPanel.classList.remove('open');
      assistantPanel.setAttribute('aria-hidden', 'true');
    }
  }

  if (triggerBtn) triggerBtn.addEventListener('click', openAssistant);
  if (openNavBtn) openNavBtn.addEventListener('click', openAssistant);
  if (callout) callout.addEventListener('click', (e) => {
    if (e.target !== calloutClose) openAssistant();
  });
  if (calloutClose) calloutClose.addEventListener('click', (e) => {
    e.stopPropagation();
    callout.style.display = 'none';
  });
  if (closeAssistantBtn) closeAssistantBtn.addEventListener('click', closeAssistant);

  // Pre-programmed Knowledge Base
  const KNOWLEDGE = [
    {
      keywords: ['cardiosense', 'heart', 'shap', 'healthcare', 'ml platform'],
      response: "CardioSense AI is Dhrubo's flagship full-stack machine learning platform for clinical heart-disease risk prediction. It features Explainable AI using SHAP waterfall and force plots, JWT auth, patient management, analytics, hospital geolocation with Leaflet/OSM, and Docker deployment."
    },
    {
      keywords: ['network', 'jellyfin', 'mikrotik', 'wireguard', 'routeros', 'isp', 'agni'],
      response: "Dhrubo has hands-on enterprise networking experience from Agni Systems Limited NOC (managing MikroTik & Cisco devices, fiber backbones, corporate VPNs, PPPoE and QoS). His Jellyfin Lab simulates a live ISP infrastructure with WireGuard tunnels, Cloudflare Zero Trust, and Nginx reverse proxies."
    },
    {
      keywords: ['werkstudent', 'germany', 'job', 'available', 'working student', 'dortmund'],
      response: "Yes! Dhrubo is currently located in Dortmund, Germany, enrolled in M.Sc. Data Science at TU Dortmund University, and is actively seeking a Werkstudent (Working Student) position in AI Engineering, Data Science, or Network Infrastructure."
    },
    {
      keywords: ['education', 'degree', 'tu dortmund', 'university', 'iccr', 'scholarship', 'bachelor'],
      response: "Dhrubo is currently pursuing an M.Sc. in Data Science at TU Dortmund University (2025–Present). He completed his B.E. in Computer Science & Engineering (2019–2023) after being awarded the prestigious competitive Indian ICCR Scholarship."
    },
    {
      keywords: ['research', 'cnn', 'anomaly', 'intrusion', 'deep learning'],
      response: "His active research at TU Dortmund focuses on CNN-based network anomaly detection. By encoding raw packet streams into spatial feature representations, the convolutional model detects zero-day attacks and stealthy cyber threats without requiring fixed signatures."
    },
    {
      keywords: ['contact', 'email', 'linkedin', 'github', 'hire'],
      response: "You can reach Dhrubo directly via email at dhruboratulbasak@gmail.com, on LinkedIn (linkedin.com/in/dhrubo-ratul-b-a12253236), or review his GitHub repositories at github.com/RATUL2060."
    }
  ];

  function botReply(text) {
    const msg = document.createElement('div');
    msg.className = 'bot-msg';
    msg.innerHTML = `<span class="msg-sender mono-xs">[DHRUBO.AI]</span><p>${text}</p>`;
    messagesBox.appendChild(msg);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }

  function userSend(text) {
    const userMsg = document.createElement('div');
    userMsg.className = 'user-msg';
    userMsg.innerHTML = `<p>${text}</p>`;
    messagesBox.appendChild(userMsg);
    messagesBox.scrollTop = messagesBox.scrollHeight;

    const lower = text.toLowerCase();
    let found = false;
    for (const item of KNOWLEDGE) {
      if (item.keywords.some(k => lower.includes(k))) {
        setTimeout(() => botReply(item.response), 350);
        found = true;
        break;
      }
    }

    if (!found) {
      setTimeout(() => {
        botReply("I have logged your query. Dhrubo specializes in AI engineering, Scikit-learn/PyTorch ML pipelines, and production network infrastructure. Feel free to connect via dhruboratulbasak@gmail.com!");
      }, 400);
    }
  }

  if (chatForm && chatInput) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = chatInput.value.trim();
      if (!val) return;
      chatInput.value = '';
      userSend(val);
    });
  }

  qpButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.dataset.q;
      if (q) userSend(q);
    });
  });

});
