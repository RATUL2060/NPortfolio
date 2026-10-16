/* ============================================================
   DRB v5 — MAIN.JS
   Neural hero canvas, HUD clock, CardioSense modal preview,
   Telemetry radar, Project Tile 3D Tilt & Hover Animation,
   in-browser AI Assistant, and Multilingual (EN / DE) Engine.
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
        ctx.shadowBlur = 8;
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

  /* ── 3. 3D TILT ON PROJECT TILES ── */
  const tiltCards = document.querySelectorAll('[data-tilt]');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5.5;
      const rotateY = ((x - centerX) / centerX) * 5.5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)`;
    });
  });

  /* ── 4. REVEAL ON SCROLL ── */
  const revealElements = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  revealElements.forEach(el => observer.observe(el));

  /* ── 5. CARDIOSENSE MODAL PREVIEW ── */
  const modal = document.getElementById('cs-modal');
  const openModalBtn = document.getElementById('preview-cardiosense-btn');
  const closeModalBtn = document.getElementById('modal-close-btn');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalImg = document.getElementById('modal-active-img');
  const modalTabs = document.querySelectorAll('.m-tab');

  function openModal() {
    if (modal) {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal() {
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  if (openModalBtn) openModalBtn.addEventListener('click', openModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

  modalTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      modalTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const src = tab.dataset.src;
      if (src && modalImg) {
        modalImg.style.opacity = '0.3';
        modalImg.src = src;
        modalImg.onload = () => { modalImg.style.opacity = '1'; };
      }
    });
  });

  /* ── 6. MOBILE BURGER NAVIGATION ── */
  const burger = document.getElementById('nav-burger');
  const navMenu = document.getElementById('nav-menu');
  if (burger && navMenu) {
    burger.addEventListener('click', () => {
      const open = navMenu.classList.toggle('nav-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('nav-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ── 7. COMPREHENSIVE MULTILINGUAL DICTIONARY (EN / DE) ── */
  const I18N = {
    en: {
      // Header & Brand
      "brand_sys": '[SYS_ROOT]',
      "nav_memories": '<span class="nav-num">01</span>MEMORIES',
      "nav_life_data": '<span class="nav-num">02</span>LIFE.DATA',
      "nav_stack": '<span class="nav-num">03</span>STACK',
      "nav_builds": '<span class="nav-num">04</span>BUILDS',
      "nav_nodes": '<span class="nav-num">05</span>NODES',
      "nav_research": '<span class="nav-num">06</span>RESEARCH',
      "nav_uplink": '<span class="nav-num">07</span>UPLINK',
      "nav_assistant_btn": 'AI_ASSISTANT',

      // Hero Section
      "hero_badge": 'DORTMUND, GERMANY · 51.51°N 7.46°E · AVAILABLE FOR WERKSTUDENT',
      "hero_tag_1": 'AI ENGINEERING',
      "hero_tag_2": 'DATA SCIENCE',
      "hero_tag_3": 'NETWORK INFRASTRUCTURE',
      "hero_desc": 'Building production-grade intelligent systems where machine learning models, distributed software and network infrastructure converge. M.Sc. Data Science student at TU Dortmund University.',
      "hero_cta_builds": '[ EXPLORE BUILDS ]',
      "hero_cta_uplink": '[ OPEN UPLINK ]',
      "hero_cta_github": 'GITHUB',
      "hud_rec": 'REC',
      "hud_domains": 'ML · NET · CLOUD',

      // About Section
      "about_tag": '[ ARCHIVE LOGS ]',
      "about_title_pre": 'SYS.',
      "about_title_post": 'ABOUT',
      "about_lead": 'I am an AI Engineer & Data Scientist pursuing an <strong>M.Sc. in Data Science at TU Dortmund University</strong>, Germany. My technical foundation unites statistical machine learning, backend system architecture, and production enterprise networking.',
      "about_p2": 'Previously, I graduated with a Bachelor of Engineering in Computer Science under a prestigious full scholarship from the Government of India. I served as a <strong>Junior Network Engineer at Agni Systems NOC</strong>, resolving ISP routing failures and managing corporate VPNs, and worked as a <strong>Data Science Intern at Maxgen Technologies</strong> developing ML risk models.',
      "about_stat1_label": 'DATA SCIENCE · TU DORTMUND',
      "about_stat2_label": 'YEARS PRODUCTION TECH',
      "about_stat3_label": 'ICCR SCHOLARSHIP RECIPIENT',

      // Telemetry / LIFE.DATA Section
      "telemetry_tag": '[ MEMORY ACCESS BLOCK ]',
      "telemetry_title_pre": 'LIFE.',
      "telemetry_title_post": 'DATA',
      "telemetry_beacon_active": 'TELEMETRY BEACON: ACTIVE',
      "telemetry_distance": 'DISTANCE: 7,320 KM',
      "wp1_title": '🌍 BANGLADESH & INDIA',
      "wp1_label": '[ ORIGIN POINT ]',
      "wp1_desc": 'System initialization. Root directory established in South Asia. Graduated with Bachelor of Engineering in Computer Science on a full competitive scholarship from the Government of India (ICCR).',
      "wp2_title": '⚡ NOC & DATA SYSTEMS',
      "wp2_label": '[ PRODUCTION OPERATIONS ]',
      "wp2_desc": 'Junior Network Engineer at Agni Systems Limited NOC managing ISP routing, MikroTik RouterOS & corporate VPNs. Data Science Intern at Maxgen Technologies engineering clinical prediction models.',
      "wp3_year": '2025 – PRESENT',
      "wp3_title": '🇩🇪 TU DORTMUND',
      "wp3_label": '[ ACTIVE NODE · M.SC. DATA SCIENCE ]',
      "wp3_desc": 'Master of Science in Data Science in Germany. Research on Convolutional Neural Networks (CNN) for network intrusion detection and end-to-end full-stack intelligent systems.',

      // Stack Section
      "stack_tag": '[ SYSTEM MODULES ]',
      "stack_title_pre": 'THE.',
      "stack_title_post": 'STACK',
      "mod1_head": '[ MOD_01 ] MACHINE LEARNING & AI',
      "tag_shap": 'SHAP (Explainable AI)',
      "tag_cnn_arch": 'CNN Architecture',
      "tag_fe": 'Feature Engineering',
      "tag_ad": 'Anomaly Detection',

      "mod2_head": '[ MOD_02 ] DATA SCIENCE & ANALYTICS',
      "tag_dp": 'Data Pipelines',
      "tag_sm": 'Statistical Modeling',

      "mod3_head": '[ MOD_03 ] FULL-STACK & API ENGINEERING',
      "tag_rest": 'RESTful Architecture',
      "tag_jwt": 'JWT Authentication',

      "mod4_head": '[ MOD_04 ] NETWORK INFRASTRUCTURE',
      "tag_qos": 'QoS Traffic Shaping',
      "tag_cisco": 'Cisco Devices',
      "tag_noc": 'NOC Monitoring',

      "mod5_head": '[ MOD_05 ] DEVOPS & CLOUD LAB',
      "tag_nginx": 'Nginx Reverse Proxy',
      "tag_cf": 'Cloudflare Tunnels',

      "mod6_head": '[ MOD_06 ] COMMUNICATIONS & PROTOCOLS',
      "lang_c1": 'English (C1 Professional)',
      "lang_a2": 'German (A2 Technical)',
      "lang_native": 'Bengali (Native)',
      "tag_agile": 'Agile Scrum',
      "tag_doc": 'Documentation',

      // Builds Section
      "builds_tag": '[ PROJECT ARCHIVES ]',
      "builds_title_pre": 'CORE.',
      "builds_title_post": 'BUILDS',
      
      "cardio_prot": '[PROT-ML-01]',
      "cardio_status": 'PRODUCTION DEPLOYED',
      "cardio_category": 'FULL-STACK ML HEALTHCARE PLATFORM',
      "cardio_desc": 'Production-grade machine learning platform for clinical heart-disease risk prediction. Features Explainable AI (SHAP waterfall & force plots), secure JWT user authentication, historical patient record analytics, and hospital geolocation routing via Leaflet & OpenStreetMap. Fully containerized with Docker and GitHub Actions CI.',
      "cardio_btn_source": 'VIEW SOURCE',
      "cardio_btn_preview": 'PREVIEW UI SCREENS ↗',

      "jelly_prot": '[PROT-NET-02]',
      "jelly_status": 'LIVE LAB TESTBED',
      "jelly_category": 'SELF-HOSTED ISP & INFRASTRUCTURE',
      "jelly_desc": 'Secure self-hosted media server and virtualized ISP network testbed. Implements MikroTik RouterOS routing, WireGuard encrypted VPN tunnels, PPPoE server authentication, and queue-tree QoS traffic shaping behind Cloudflare Zero Trust and Nginx Proxy Manager.',
      "jelly_btn_repo": 'VIEW REPOSITORY',

      // Modal
      "modal_preview_tag": '[PREVIEW]',
      "modal_title": 'CardioSense AI — Platform UI',
      "modal_tab_home": 'Home',
      "modal_tab_pred": 'Prediction & SHAP',
      "modal_tab_dash": 'Analytics Dashboard',
      "modal_tab_auth": 'Authentication',
      "modal_footer_btn": 'View CardioSense on GitHub ↗',

      // Experience Section
      "exp_tag": '[ FIELD OPERATIONS ]',
      "exp_title_pre": 'EXP.',
      "exp_title_post": 'NODES',
      "exp1_badge": '2025 · MAR – DEC',
      "exp1_role": 'Junior Network Engineer',
      "exp1_company": 'Agni Systems Limited &nbsp;·&nbsp; Dhaka, Bangladesh',
      "exp1_status": '[COMPLETED]',
      "exp1_body": 'Network Operations Center (NOC). Supervised 24/7 enterprise infrastructure using MikroTik RouterOS and Cisco devices. Diagnosed BGP/OSPF transit anomalies, resolved fiber backbone disruptions, deployed WireGuard / IPsec VPNs, and optimized QoS queues for corporate clients.',
      "tag_vpn_ipsec": 'VPN / IPsec',
      "tag_qos_queues": 'QoS Queues',

      "exp2_badge": '2024 · JAN – APR',
      "exp2_role": 'Data Science Intern',
      "exp2_company": 'Maxgen Technologies &nbsp;·&nbsp; India',
      "exp2_status": '[COMPLETED]',
      "exp2_body": 'Applied machine learning to clinical datasets. Formulated data preprocessing, feature engineering, and model validation pipelines for cardiovascular disease prediction using Python and Scikit-learn.',
      "tag_eda": 'Exploratory Analysis',

      // Research Section
      "research_tag": '[ NEURAL RESEARCH ]',
      "research_title_pre": 'RESEARCH.',
      "research_title_post": 'KERNEL',
      "research_sub": '[ M.SC. DATA SCIENCE THESIS / PROJECT ]',
      "research_heading": 'CNN-Based Network Traffic Anomaly & Intrusion Detection',
      "research_desc": 'Investigating 1D & 2D Convolutional Neural Networks (CNNs) for real-time anomaly detection in high-speed enterprise packet telemetry. By translating raw flow patterns into pseudo-images and spatial feature maps, the model recognizes novel zero-day patterns without predefined signatures.',
      "rp_step1": '<span>01</span> Raw Packets',
      "rp_step2": '<span>02</span> Spatial Encoding',
      "rp_step3": '<span>03</span> CNN Feature Maps',
      "rp_step4": '<span>04</span> Anomaly Trigger',
      "tag_cyber": 'Cybersecurity',

      // Education Section
      "edu_tag": '[ CREDENTIAL MATRIX ]',
      "edu_title_pre": 'EDU.',
      "edu_title_post": 'CREDS',
      "edu1_year": '2025 – PRESENT',
      "edu1_degree": 'Master of Science (M.Sc.) — Data Science',
      "edu1_school": 'TU Dortmund University &nbsp;·&nbsp; Germany',
      "edu1_desc": 'Advanced Machine Learning, Statistical Data Analysis, Neural Networks, Cloud Data Architectures.',
      "edu2_year": '2019 – 2023',
      "edu2_degree": 'Bachelor of Engineering (B.E.) — Computer Science',
      "edu2_school": 'Government of India ICCR Scholarship &nbsp;·&nbsp; India',
      "edu2_desc": 'Awarded prestigious competitive international scholarship. Focused on Algorithms, Operating Systems, Computer Networks.',

      // Contact Section
      "contact_tag": '[ DIRECT UPLINK ]',
      "contact_title_pre": 'UPLINK.',
      "contact_title_post": 'CHANNEL',
      "contact_lead": 'Seeking opportunities as a <strong>Werkstudent / Working Student</strong> in AI Engineering, Machine Learning, or Network Infrastructure in Germany.',
      "ci_label_email": 'EMAIL PROTOCOL',
      "ci_label_network": 'PROFESSIONAL NETWORK',
      "ci_val_linkedin": 'LinkedIn Profile ↗',
      "ci_label_repo": 'CODE REPOSITORY',
      "ci_val_repo": 'github.com/RATUL2060 ↗',
      "ci_label_loc": 'CURRENT LOCATION',
      "ci_val_loc": 'Dortmund, North Rhine-Westphalia, Germany',

      // Footer
      "footer_text": '[SYS_ROOT] &copy; 2026 DHRUBO RATUL BASAK &nbsp;·&nbsp; ALL SYSTEMS NOMINAL',
      "footer_top": 'RETURN TO TOP ↑',

      // AI Assistant
      "callout_text": 'Got a question? I know everything about Dhrubo 💡',
      "callout_tap": 'tap to chat →',
      "assistant_panel_title": 'DHRUBO_AI_ASSISTANT v2.5',
      "bot_welcome": "Greetings! I am Dhrubo's AI Assistant. Ask me anything about his technical stack, CardioSense AI, networking projects, or M.Sc. studies at TU Dortmund.",
      "qp_1": 'CardioSense AI?',
      "qp_2": 'Network Background?',
      "qp_3": 'Werkstudent in Germany?',
      "input_placeholder": 'Type an inquiry...',
      "aria_assistant_btn": 'Open AI Assistant',
      "aria_close_btn": 'Close Assistant',
      "aria_send_btn": 'Send message'
    },

    de: {
      // Header & Brand
      "brand_sys": '[SYS_ROOT]',
      "nav_memories": '<span class="nav-num">01</span>PROFIL',
      "nav_life_data": '<span class="nav-num">02</span>LEBENS.DATEN',
      "nav_stack": '<span class="nav-num">03</span>TECH-STACK',
      "nav_builds": '<span class="nav-num">04</span>PROJEKTE',
      "nav_nodes": '<span class="nav-num">05</span>STATIONEN',
      "nav_research": '<span class="nav-num">06</span>FORSCHUNG',
      "nav_uplink": '<span class="nav-num">07</span>KONTAKT',
      "nav_assistant_btn": 'KI_ASSISTENT',

      // Hero Section
      "hero_badge": 'DORTMUND, DEUTSCHLAND · 51.51°N 7.46°E · VERFÜGBAR ALS WERKSTUDENT',
      "hero_tag_1": 'KI-ENGINEERING',
      "hero_tag_2": 'DATENWISSENSCHAFT',
      "hero_tag_3": 'NETZWERK-INFRASTRUKTUR',
      "hero_desc": 'Entwicklung produktionsreifer intelligenter Systeme an der Schnittstelle von maschinellem Lernen, verteilter Software und Netzwerkinfrastruktur. M.Sc. Data Science Student an der Technischen Universität Dortmund.',
      "hero_cta_builds": '[ PROJEKTE ENTDECKEN ]',
      "hero_cta_uplink": '[ KONTAKT AUFNEHMEN ]',
      "hero_cta_github": 'GITHUB',
      "hud_rec": 'AUFNAHME',
      "hud_domains": 'KI · NETZWERK · CLOUD',

      // About Section
      "about_tag": '[ ARCHIV-PROTOKOLLE ]',
      "about_title_pre": 'SYS.',
      "about_title_post": 'ÜBER MICH',
      "about_lead": 'Ich bin ein AI Engineer & Data Scientist im Masterstudiengang <strong>Data Science an der TU Dortmund</strong>, Deutschland. Mein technisches Fundament vereint statistisches maschinelles Lernen, Backend-Systemarchitektur und praxiserprobte Unternehmensnetzwerke.',
      "about_p2": 'Zuvor schloss ich meinen Bachelor of Engineering in Informatik mit einem renommierten Vollstipendium der indischen Regierung ab. Als <strong>Junior-Netzwerkingenieur im NOC von Agni Systems</strong> behob ich ISP-Routing-Störungen und verwaltete Unternehmens-VPNs; als <strong>Data Science Praktikant bei Maxgen Technologies</strong> entwickelte ich ML-Risikomodelle.',
      "about_stat1_label": 'DATENWISSENSCHAFT · TU DORTMUND',
      "about_stat2_label": 'JAHRE PRAXISERFAHRUNG',
      "about_stat3_label": 'ICCR-VOLLSTIPENDIUM',

      // Telemetry / LIFE.DATA Section
      "telemetry_tag": '[ SPEICHERZUGRIFFS-BLOCK ]',
      "telemetry_title_pre": 'LEBENS.',
      "telemetry_title_post": 'DATEN',
      "telemetry_beacon_active": 'TELEMETRIE-BEACON: AKTIV',
      "telemetry_distance": 'DISTANZ: 7.320 KM',
      "wp1_title": '🌍 BANGLADESCH & INDIEN',
      "wp1_label": '[ URSPRUNGSPUNKT ]',
      "wp1_desc": 'Systeminitialisierung. Ursprungsverzeichnis in Südasien eingerichtet. Abschluss als Bachelor of Engineering in Informatik mit einem renommierten, wettbewerbsstarken Vollstipendium der indischen Regierung (ICCR).',
      "wp2_title": '⚡ NOC & DATENSYSTEME',
      "wp2_label": '[ PRODUKTIONSBETRIEB ]',
      "wp2_desc": 'Junior-Netzwerkingenieur im Network Operations Center (NOC) von Agni Systems Limited (ISP-Routing, MikroTik RouterOS & Unternehmens-VPNs). Data Science Praktikant bei Maxgen Technologies zur Entwicklung klinischer Vorhersagemodelle.',
      "wp3_year": '2025 – HEUTE',
      "wp3_title": '🇩🇪 TU DORTMUND',
      "wp3_label": '[ AKTIVER KNOTEN · M.SC. DATA SCIENCE ]',
      "wp3_desc": 'Master of Science in Data Science in Deutschland. Forschung zu Convolutional Neural Networks (CNN) für die Netzwerk-Angriffserkennung und End-to-End-Full-Stack-KI-Systeme.',

      // Stack Section
      "stack_tag": '[ SYSTEMMODULE ]',
      "stack_title_pre": 'DER.',
      "stack_title_post": 'TECH-STACK',
      "mod1_head": '[ MOD_01 ] MASCHINELLES LERNEN & KI',
      "tag_shap": 'SHAP (Erklärbare KI)',
      "tag_cnn_arch": 'CNN-Architektur',
      "tag_fe": 'Feature-Engineering',
      "tag_ad": 'Anomalieerkennung',

      "mod2_head": '[ MOD_02 ] DATA SCIENCE & ANALYTIK',
      "tag_dp": 'Daten-Pipelines',
      "tag_sm": 'Statistische Modellierung',

      "mod3_head": '[ MOD_03 ] FULL-STACK & API-ENTWICKLUNG',
      "tag_rest": 'RESTful-Architektur',
      "tag_jwt": 'JWT-Authentifizierung',

      "mod4_head": '[ MOD_04 ] NETZWERK-INFRASTRUKTUR',
      "tag_qos": 'QoS-Traffic-Shaping',
      "tag_cisco": 'Cisco-Netzwerkgeräte',
      "tag_noc": 'NOC-Überwachung',

      "mod5_head": '[ MOD_05 ] DEVOPS & CLOUD-LABOR',
      "tag_nginx": 'Nginx-Reverse-Proxy',
      "tag_cf": 'Cloudflare-Tunnel',

      "mod6_head": '[ MOD_06 ] KOMMUNIKATION & PROTOKOLLE',
      "lang_c1": 'Englisch (C1 Fließend)',
      "lang_a2": 'Deutsch (A2 Technisch)',
      "lang_native": 'Bengalisch (Muttersprache)',
      "tag_agile": 'Agiles Scrum',
      "tag_doc": 'Technische Dokumentation',

      // Builds Section
      "builds_tag": '[ PROJEKTARCHIV ]',
      "builds_title_pre": 'KERN.',
      "builds_title_post": 'PROJEKTE',
      
      "cardio_prot": '[PROTOKOLL-ML-01]',
      "cardio_status": 'IN PRODUKTION EINGESETZT',
      "cardio_category": 'FULL-STACK ML GESUNDHEITS-PLATTFORM',
      "cardio_desc": 'Produktionsreife Machine-Learning-Plattform zur klinischen Risikovorhersage von Herzerkrankungen. Mit Explainable AI (SHAP Waterfall- & Force-Plots), sicherer JWT-Authentifizierung, Verlaufsanalysen für Patientendaten und Krankenhaussuche via Leaflet & OpenStreetMap. Vollständig containerisiert mit Docker und GitHub Actions CI.',
      "cardio_btn_source": 'QUELLCODE ANSEHEN',
      "cardio_btn_preview": 'UI-VORSCHAU ÖFFNEN ↗',

      "jelly_prot": '[PROTOKOLL-NET-02]',
      "jelly_status": 'AKTIVE TESTUMGEBUNG',
      "jelly_category": 'SELF-HOSTED ISP & INFRASTRUKTUR',
      "jelly_desc": 'Sicheres, selbst gehostetes Medienserver- und virtualisiertes ISP-Testnetzwerk. Implementiert MikroTik RouterOS Routing, WireGuard-verschlüsselte VPN-Tunnel, PPPoE-Serverauthentifizierung und Queue-Tree QoS-Traffic-Shaping hinter Cloudflare Zero Trust und Nginx Proxy Manager.',
      "jelly_btn_repo": 'REPOSITORY ANSEHEN',

      // Modal
      "modal_preview_tag": '[VORSCHAU]',
      "modal_title": 'CardioSense AI — Plattform-Benutzeroberfläche',
      "modal_tab_home": 'Startseite',
      "modal_tab_pred": 'Vorhersage & SHAP',
      "modal_tab_dash": 'Analytik-Dashboard',
      "modal_tab_auth": 'Authentifizierung',
      "modal_footer_btn": 'CardioSense auf GitHub ansehen ↗',

      // Experience Section
      "exp_tag": '[ PRAXISEINSÄTZE ]',
      "exp_title_pre": 'BERUFS.',
      "exp_title_post": 'ERFAHRUNG',
      "exp1_badge": '2025 · MÄR – DEZ',
      "exp1_role": 'Junior-Netzwerkingenieur',
      "exp1_company": 'Agni Systems Limited &nbsp;·&nbsp; Dhaka, Bangladesch',
      "exp1_status": '[ABGESCHLOSSEN]',
      "exp1_body": 'Network Operations Center (NOC). 24/7-Überwachung der Unternehmensinfrastruktur mit MikroTik RouterOS und Cisco-Systemen. Diagnose von BGP/OSPF-Routing-Anomalien, Behebung von Ausfällen im Glasfaser-Backbone, Bereitstellung von WireGuard- / IPsec-VPNs und Optimierung von QoS-Warteschlangen für Unternehmenskunden.',
      "tag_vpn_ipsec": 'VPN & IPsec',
      "tag_qos_queues": 'QoS-Warteschlangen',

      "exp2_badge": '2024 · JAN – APR',
      "exp2_role": 'Data Science Praktikant',
      "exp2_company": 'Maxgen Technologies &nbsp;·&nbsp; Indien',
      "exp2_status": '[ABGESCHLOSSEN]',
      "exp2_body": 'Anwendung von maschinellem Lernen auf klinische Datensätze. Konzeption von Datenvorverarbeitungs-, Feature-Engineering- und Modellvalidierungspipelines zur Vorhersage von Herz-Kreislauf-Erkrankungen mit Python und Scikit-learn.',
      "tag_eda": 'Explorative Datenanalyse',

      // Research Section
      "research_tag": '[ NEURONALE FORSCHUNG ]',
      "research_title_pre": 'FORSCHUNGS.',
      "research_title_post": 'KERN',
      "research_sub": '[ M.SC. DATA SCIENCE MASTERARBEIT & FORSCHUNG ]',
      "research_heading": 'CNN-basierte Erkennung von Netzwerk-Anomalien & Intrusion Detection',
      "research_desc": 'Untersuchung von 1D- und 2D-Convolutional Neural Networks (CNNs) zur Echtzeit-Anomalieerkennung in hochfrequenter Unternehmens-Pakettelemetrie. Durch die Transformation von Rohdatenströmen in räumliche Merkmalskarten erkennt das Modell neuartige Zero-Day-Angriffsmuster ohne vordefinierte Signaturen.',
      "rp_step1": '<span>01</span> Rohdaten-Pakete',
      "rp_step2": '<span>02</span> Räumliche Kodierung',
      "rp_step3": '<span>03</span> CNN-Merkmalskarten',
      "rp_step4": '<span>04</span> Anomalie-Auslösung',
      "tag_cyber": 'Cybersicherheit',

      // Education Section
      "edu_tag": '[ QUALIFIKATIONSMATRIX ]',
      "edu_title_pre": 'AUSBILDUNG.',
      "edu_title_post": 'QUALIFIKATIONEN',
      "edu1_year": '2025 – HEUTE',
      "edu1_degree": 'Master of Science (M.Sc.) — Data Science',
      "edu1_school": 'TU Dortmund &nbsp;·&nbsp; Deutschland',
      "edu1_desc": 'Fortgeschrittenes maschinelles Lernen, statistische Datenanalyse, neuronale Netze, Cloud-Datenarchitekturen.',
      "edu2_year": '2019 – 2023',
      "edu2_degree": 'Bachelor of Engineering (B.E.) — Informatik',
      "edu2_school": 'ICCR-Vollstipendium der indischen Regierung &nbsp;·&nbsp; Indien',
      "edu2_desc": 'Ausgezeichnet mit einem renommierten, wettbewerbsintensiven internationalen Vollstipendium. Schwerpunkte: Algorithmen, Betriebssysteme, Computernetzwerke.',

      // Contact Section
      "contact_tag": '[ DIREKTE VERBINDUNG ]',
      "contact_title_pre": 'KONTAKT.',
      "contact_title_post": 'KANAL',
      "contact_lead": 'Ich suche ab sofort eine Stelle als <strong>Werkstudent</strong> in den Bereichen AI Engineering, maschinelles Lernen oder Netzwerkinfrastruktur in Deutschland.',
      "ci_label_email": 'E-MAIL-ADRESSE',
      "ci_label_network": 'BERUFLICHES NETZWERK',
      "ci_val_linkedin": 'LinkedIn-Profil ↗',
      "ci_label_repo": 'CODE-REPOSITORIES',
      "ci_val_repo": 'github.com/RATUL2060 ↗',
      "ci_label_loc": 'AKTUELLER WOHNORT',
      "ci_val_loc": 'Dortmund, Nordrhein-Westfalen, Deutschland',

      // Footer
      "footer_text": '[SYS_ROOT] &copy; 2026 DHRUBO RATUL BASAK &nbsp;·&nbsp; ALLE SYSTEME BEREIT',
      "footer_top": 'ZURÜCK ZUM ANFANG ↑',

      // AI Assistant
      "callout_text": 'Haben Sie eine Frage? Ich weiß alles über Dhrubo 💡',
      "callout_tap": 'Hier tippen zum Chatten →',
      "assistant_panel_title": 'DHRUBO_KI_ASSISTENT v2.5',
      "bot_welcome": 'Willkommen! Ich bin Dhrubos KI-Assistent. Fragen Sie mich gerne alles zu seinem Tech-Stack, CardioSense AI, Netzwerkprojekten oder seinem Masterstudium an der TU Dortmund.',
      "qp_1": 'Was ist CardioSense AI?',
      "qp_2": 'Netzwerk-Hintergrund?',
      "qp_3": 'Werkstudent in Deutschland?',
      "input_placeholder": 'Frage oder Nachricht eingeben...',
      "aria_assistant_btn": 'KI-Assistent öffnen',
      "aria_close_btn": 'Assistent schließen',
      "aria_send_btn": 'Nachricht senden'
    }
  };

  /* ── 8. MULTILINGUAL AI ASSISTANT KNOWLEDGE BASE ── */
  const KNOWLEDGE_EN = [
    {
      keywords: ['cardiosense', 'heart', 'shap', 'healthcare', 'ml platform', 'project'],
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

  const KNOWLEDGE_DE = [
    {
      keywords: ['cardiosense', 'herz', 'heart', 'shap', 'gesundheit', 'healthcare', 'ml-plattform', 'plattform', 'projekt'],
      response: "CardioSense AI ist Dhrubos zentrales Full-Stack-Machine-Learning-Projekt zur klinischen Risikovorhersage von Herzerkrankungen. Es bietet Explainable AI mit SHAP Waterfall- und Force-Plots, JWT-Authentifizierung, Patientenverwaltung, Analytik, Krankenhaus-Geolokalisierung mit Leaflet/OSM sowie Docker-Deployment."
    },
    {
      keywords: ['netzwerk', 'network', 'jellyfin', 'mikrotik', 'wireguard', 'routeros', 'isp', 'agni'],
      response: "Dhrubo verfügt über praktische Erfahrung im Enterprise-Networking aus dem Network Operations Center (NOC) von Agni Systems (Verwaltung von MikroTik- und Cisco-Geräten, Glasfaser-Backbones, Unternehmens-VPNs, PPPoE und QoS). Sein Jellyfin-Lab simuliert eine reale ISP-Infrastruktur mit WireGuard-Tunneln, Cloudflare Zero Trust und Nginx-Reverse-Proxys."
    },
    {
      keywords: ['werkstudent', 'deutschland', 'germany', 'job', 'stelle', 'verfügbar', 'arbeit', 'dortmund'],
      response: "Ja! Dhrubo lebt in Dortmund, absolviert den M.Sc. Data Science an der TU Dortmund und sucht ab sofort aktiv nach einer Werkstudentenstelle in den Bereichen AI Engineering, Data Science oder Netzwerkinfrastruktur in Deutschland."
    },
    {
      keywords: ['ausbildung', 'studium', 'education', 'abschluss', 'tu dortmund', 'universität', 'iccr', 'stipendium', 'bachelor'],
      response: "Dhrubo studiert derzeit im Master Data Science an der TU Dortmund (seit 2025). Seinen Bachelor of Engineering in Informatik (2019–2023) schloss er nach Auszeichnung mit dem angesehenen ICCR-Vollstipendium der indischen Regierung ab."
    },
    {
      keywords: ['forschung', 'research', 'cnn', 'anomalie', 'angriff', 'intrusion', 'deep learning'],
      response: "Seine aktuelle Forschung an der TU Dortmund konzentriert sich auf CNN-basierte Netzwerk-Anomalieerkennung. Durch die Übersetzung von Paketdatenströmen in räumliche Merkmalsdarstellungen erkennt das Modell Zero-Day-Angriffe zuverlässig ohne statische Signaturen."
    },
    {
      keywords: ['kontakt', 'contact', 'email', 'e-mail', 'linkedin', 'github', 'erreichen', 'einstellen'],
      response: "Sie erreichen Dhrubo direkt per E-Mail unter dhruboratulbasak@gmail.com, auf LinkedIn (linkedin.com/in/dhrubo-ratul-b-a12253236) oder über seine GitHub-Repositories auf github.com/RATUL2060."
    }
  ];

  let currentLang = 'en';

  function setLanguage(lang) {
    if (lang !== 'en' && lang !== 'de') lang = 'en';
    currentLang = lang;
    document.documentElement.lang = lang;

    // Update Language Buttons
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(btn => {
      const isActive = btn.dataset.lang === lang;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    // Update all text elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (I18N[lang] && I18N[lang][key] !== undefined) {
        el.innerHTML = I18N[lang][key];
      }
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (I18N[lang] && I18N[lang][key] !== undefined) {
        el.placeholder = I18N[lang][key];
      }
    });

    // Update aria labels
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria');
      if (I18N[lang] && I18N[lang][key] !== undefined) {
        el.setAttribute('aria-label', I18N[lang][key]);
      }
    });

    // Update assistant quick prompts
    const qpButtons = document.querySelectorAll('.qp-btn');
    if (qpButtons.length >= 3) {
      if (lang === 'de') {
        qpButtons[0].dataset.q = "Was ist CardioSense AI?";
        qpButtons[1].dataset.q = "Welche Netzwerkerfahrung hast du?";
        qpButtons[2].dataset.q = "Bist du als Werkstudent in Deutschland verfügbar?";
      } else {
        qpButtons[0].dataset.q = "What is CardioSense AI?";
        qpButtons[1].dataset.q = "What is your network background?";
        qpButtons[2].dataset.q = "Are you available for Werkstudent in Germany?";
      }
    }

    // Update initial welcome message if user has not sent messages yet
    const messagesBox = document.getElementById('panel-messages');
    if (messagesBox && messagesBox.querySelectorAll('.user-msg').length === 0) {
      const initialBotP = messagesBox.querySelector('.bot-msg p');
      if (initialBotP) {
        initialBotP.textContent = I18N[lang]["bot_welcome"];
      }
    }
  }

  // Language Button Event Listeners
  const langButtons = document.querySelectorAll('.lang-btn');
  langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const chosenLang = btn.dataset.lang;
      if (chosenLang && chosenLang !== currentLang) {
        setLanguage(chosenLang);
        try {
          localStorage.setItem('drb_portfolio_lang', chosenLang);
        } catch (e) {}
      }
    });
  });

  // Initialize Language: English default unless user previously chose German
  let savedLang = 'en';
  try {
    const stored = localStorage.getItem('drb_portfolio_lang');
    if (stored === 'de') savedLang = 'de';
  } catch (e) {}
  
  if (savedLang === 'de') {
    setLanguage('de');
  }

  /* ── 9. AI ASSISTANT PANEL & CHAT ENGINE ── */
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
    const kb = (currentLang === 'de') ? KNOWLEDGE_DE : KNOWLEDGE_EN;
    let found = false;
    for (const item of kb) {
      if (item.keywords.some(k => lower.includes(k))) {
        setTimeout(() => botReply(item.response), 350);
        found = true;
        break;
      }
    }

    if (!found) {
      const fallback = (currentLang === 'de')
        ? "Ich habe Ihre Anfrage erfasst. Dhrubo ist spezialisiert auf AI Engineering, Scikit-learn/PyTorch ML-Pipelines und produktive Netzwerkinfrastruktur. Kontaktieren Sie ihn gerne unter dhruboratulbasak@gmail.com!"
        : "I have logged your query. Dhrubo specializes in AI engineering, Scikit-learn/PyTorch ML pipelines, and production network infrastructure. Feel free to connect via dhruboratulbasak@gmail.com!";
      setTimeout(() => botReply(fallback), 400);
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
