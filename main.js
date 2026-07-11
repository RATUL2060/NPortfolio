// ================================================
// LANGUAGE SWITCHER
// ================================================
function setLang(lang) {
    document.documentElement.setAttribute('data-lang', lang);
    document.getElementById('btn-en').classList.toggle('active', lang === 'en');
    document.getElementById('btn-de').classList.toggle('active', lang === 'de');

    // Swap text content for elements with data-en / data-de
    document.querySelectorAll('[data-en]').forEach(el => {
        el.textContent = el.getAttribute(`data-${lang}`) || el.textContent;
    });

    // Swap placeholders
    document.querySelectorAll('[data-en-placeholder]').forEach(el => {
        el.placeholder = el.getAttribute(`data-${lang}-placeholder`) || el.placeholder;
    });
}

// ================================================
// SNOW EFFECT (hero section only, canvas full page)
// ================================================
const snowCanvas = document.getElementById('snow-canvas');
const snowCtx = snowCanvas.getContext('2d');

snowCanvas.width = window.innerWidth;
snowCanvas.height = window.innerHeight;

const snowflakes = [];
const SNOW_COUNT = 120;

for (let i = 0; i < SNOW_COUNT; i++) {
    snowflakes.push({
        x: Math.random() * snowCanvas.width,
        y: Math.random() * snowCanvas.height,
        r: Math.random() * 3 + 1,
        speed: Math.random() * 0.8 + 0.3,
        drift: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2,
    });
}

function drawSnow() {
    snowCtx.clearRect(0, 0, snowCanvas.width, snowCanvas.height);
    snowflakes.forEach(sf => {
        snowCtx.beginPath();
        snowCtx.arc(sf.x, sf.y, sf.r, 0, Math.PI * 2);
        snowCtx.fillStyle = `rgba(180, 215, 255, ${sf.opacity})`;
        snowCtx.shadowBlur = 6;
        snowCtx.shadowColor = `rgba(21, 88, 214, 0.4)`;
        snowCtx.fill();

        sf.y += sf.speed;
        sf.x += sf.drift;

        if (sf.y > snowCanvas.height) {
            sf.y = -10;
            sf.x = Math.random() * snowCanvas.width;
        }
        if (sf.x > snowCanvas.width) sf.x = 0;
        if (sf.x < 0) sf.x = snowCanvas.width;
    });
    requestAnimationFrame(drawSnow);
}
drawSnow();

window.addEventListener('resize', () => {
    snowCanvas.width = window.innerWidth;
    snowCanvas.height = window.innerHeight;
});

// ================================================
// CUSTOM CURSOR
// ================================================
const cursor = document.getElementById('custom-cursor');
document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});
document.querySelectorAll('a, button, .project-card, .skill-tags span, .contact-info-item, .achievement-card, .social-row').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
});

// ================================================
// THREE.JS BACKGROUND (subtle blue particles)
// ================================================
const initThreeJS = () => {
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const geo = new THREE.BufferGeometry();
    const count = 220;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * 90;
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.PointsMaterial({
        size: 0.15, color: 0x1558d6,
        transparent: true, opacity: 0.45,
        blending: THREE.NormalBlending,
    });
    const mesh = new THREE.Points(geo, mat);
    scene.add(mesh);

    let mx = 0, my = 0;
    const hw = window.innerWidth / 2, hh = window.innerHeight / 2;
    document.addEventListener('mousemove', e => { mx = e.clientX - hw; my = e.clientY - hh; });

    const animate = () => {
        requestAnimationFrame(animate);
        mesh.rotation.y += 0.0007;
        mesh.rotation.x += 0.0004;
        mesh.rotation.y += 0.03 * (mx * 0.001 - mesh.rotation.y);
        mesh.rotation.x += 0.03 * (my * 0.001 - mesh.rotation.x);
        renderer.render(scene, camera);
    };
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
};
initThreeJS();

// ================================================
// GSAP ANIMATIONS
// ================================================
gsap.registerPlugin(ScrollTrigger);

const tl = gsap.timeline();
tl.from('.logo',            { y:-40, opacity:0, duration:.7, ease:'power3.out' })
  .from('.nav-links li',    { y:-30, opacity:0, duration:.5, stagger:.07, ease:'power3.out' }, '-=.4')
  .from('.lang-switcher',   { opacity:0, duration:.4 }, '-=.3')
  .from('.hero-tag',        { y:20,  opacity:0, duration:.6, ease:'power3.out' }, '-=.2')
  .from('h1',               { y:30,  opacity:0, duration:.9, ease:'power3.out' }, '-=.4')
  .from('.subtitle',        { y:20,  opacity:0, duration:.7, ease:'power3.out' }, '-=.5')
  .from('.tagline',         { y:20,  opacity:0, duration:.6, ease:'power3.out' }, '-=.4')
  .from('.hero-stat-row',   { y:20,  opacity:0, duration:.5, ease:'power3.out' }, '-=.3')
  .from('.hero-buttons .btn', { y:20, opacity:0, duration:.5, stagger:.15, ease:'power3.out' }, '-=.3')
  .from('.profile-img-frame', { scale:.85, opacity:0, duration:1, ease:'elastic.out(1,.75)' }, '-=.8')
  .from('.badge-iccr, .badge-ml', { scale:.7, opacity:0, duration:.5, stagger:.2, ease:'back.out(1.7)' }, '-=.4');

// Scroll reveals
document.querySelectorAll('.reveal').forEach(el => {
    gsap.fromTo(el, { y:40, opacity:0 }, {
        y:0, opacity:1, duration:.75, ease:'power2.out',
        scrollTrigger: { trigger:el, start:'top 88%', toggleActions:'play none none reverse' }
    });
});

document.querySelectorAll('.section-title').forEach(t => {
    gsap.from(t, {
        x:-40, opacity:0, duration:.7, ease:'power2.out',
        scrollTrigger: { trigger:t, start:'top 88%', toggleActions:'play none none reverse' }
    });
});

gsap.from('.achievement-card', {
    y:50, opacity:0, duration:.7, stagger:.12, ease:'power2.out',
    scrollTrigger: { trigger:'.accomplishments-grid', start:'top 85%', toggleActions:'play none none reverse' }
});

// ================================================
// CONTACT FORM (simulated submit)
// ================================================
function handleFormSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('form-submit-btn');
    const span = btn.querySelector('span');
    const orig = span.textContent;
    span.textContent = '✓ Message Sent!';
    btn.disabled = true;
    btn.style.background = '#22c55e';
    setTimeout(() => {
        span.textContent = orig;
        btn.disabled = false;
        btn.style.background = '';
        e.target.reset();
    }, 3000);
}
