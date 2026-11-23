'use strict';
/* zenda studio. — app.js v3 (una sola página, 4 paquetes sin precios) */
const CONFIG = {
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzBQgX8U0CzNe_zH8slUUAgDPMlQG3o0TidWUQ8cX2I88tEGSa6-4zsZet6Y-bqqd12GQ/exec',
  WHATSAPP_NUMBER: '50258798301'
};

const PALETTES = [
  { c1: '#0066ff', c2: '#38bdf8', c3: '#6366f1', soft: 'rgba(0,102,255,.09)', wash: 'rgba(0,102,255,.12)', border: 'rgba(0,102,255,.30)' },
  { c1: '#e8470f', c2: '#fb923c', c3: '#f43f5e', soft: 'rgba(232,71,15,.09)', wash: 'rgba(232,71,15,.11)', border: 'rgba(232,71,15,.30)' },
  { c1: '#059669', c2: '#14b8a6', c3: '#0ea5e9', soft: 'rgba(5,150,105,.09)', wash: 'rgba(5,150,105,.12)', border: 'rgba(5,150,105,.30)' },
  { c1: '#6366f1', c2: '#a855f7', c3: '#38bdf8', soft: 'rgba(99,102,241,.09)', wash: 'rgba(99,102,241,.12)', border: 'rgba(99,102,241,.32)' },
  { c1: '#e11d48', c2: '#fb7185', c3: '#8b5cf6', soft: 'rgba(225,29,72,.09)', wash: 'rgba(225,29,72,.11)', border: 'rgba(225,29,72,.30)' }
];

const PLANS = [
  { code: 'PLAN-1', num: '01', team: '1 persona', title: 'Emprendedor', ideal: 'Para quien vende solo por Instagram, TikTok y WhatsApp.',
    features: ['Página de enlace profesional para tu bio de IG y TikTok', 'Tus productos o servicios con fotos y descripción', 'Botón de pedido a WhatsApp con el mensaje ya armado', 'Diseño pensado primero para celular', 'Sin mensualidades'] },
  { code: 'PLAN-2', num: '02', team: '2 a 3 personas', popular: true, title: 'Negocio & Equipo', ideal: 'Para equipos que comparten pedidos, inventario y atención.',
    features: ['Todo lo del paquete Emprendedor', 'Panel privado para cambiar fotos y precios desde el celular', 'Hoja compartida de clientes y pedidos en Google Sheets', 'Capacitación práctica para tu equipo'] },
  { code: 'PLAN-3', num: '03', team: '4 a 6 personas', title: 'Operación & Flujos', ideal: 'Para negocios con ventas diarias que necesitan automatizar.',
    features: ['Todo lo del paquete Negocio & Equipo', 'Mini CRM para dar seguimiento a cada cliente', 'Avisos automáticos de pedidos por correo o WhatsApp', 'Tablero de ventas e inventario en vivo', '30 días de soporte prioritario'] },
  { code: 'PLAN-4', num: '04', team: '6+ personas', title: 'Empresa a Medida', ideal: 'Para varias áreas, alto volumen y reportes gerenciales.',
    features: ['Todo lo del paquete Operación & Flujos', 'Análisis de tu operación y sistema diseñado a tu medida', 'Base de datos y flujos entre áreas', 'Dashboards gerenciales con reportes automáticos', 'Acompañamiento técnico continuo'] }
];

const ICON_SUN = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>';
const ICON_MOON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
const ICON_CHECK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const linkWhatsApp = (msg) => `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
const msgPlan = (p) => `Hola Zenda Studio, me interesa un paquete:\n- Paquete: ${p.code} · ${p.title}\n- Equipo: ${p.team}\nVengo de la web. ¿Me brindan información y el costo?`;

function initDynamicPalette() {
  let last = -1;
  try { const r = sessionStorage.getItem('zenda_palette_idx'); if (r !== null) last = Number(r); } catch (e) {}
  let idx = Math.floor(Math.random() * PALETTES.length);
  if (idx === last) idx = (idx + 1) % PALETTES.length;
  try { sessionStorage.setItem('zenda_palette_idx', String(idx)); } catch (e) {}
  const p = PALETTES[idx], s = document.documentElement.style;
  s.setProperty('--c1', p.c1); s.setProperty('--c2', p.c2); s.setProperty('--c3', p.c3);
  s.setProperty('--accent', p.c1); s.setProperty('--accent-soft', p.soft);
  s.setProperty('--accent-wash', p.wash); s.setProperty('--accent-border', p.border);
  const meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.content = p.c1;
}

function initGreeting() {
  const timeEl = document.getElementById('greeting-time');
  const phraseEl = document.getElementById('greeting-phrase');
  if (!timeEl || !phraseEl) return;
  let hour = new Date().getHours();
  try { hour = Number(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Guatemala', hour: 'numeric', hour12: false }).format(new Date())) % 24; } catch (e) {}
  let g, f;
  if (hour >= 5 && hour < 12) { g = 'Buenos días'; f = ['Buen momento para ordenar tus ventas.', 'Haz que tu enlace de IG y TikTok venda solo.', 'Arranca el día automatizando tu negocio.']; }
  else if (hour >= 12 && hour < 19) { g = 'Buenas tardes'; f = ['Deja de responder “precio” uno por uno.', 'Sistemas claros para negocios que crecen.', 'Tu negocio en línea listo en días.']; }
  else if (hour >= 19) { g = 'Buenas noches'; f = ['Mientras descansas, tu página sigue captando clientes.', 'Disponible 24/7, sin mensualidades.', 'Buena hora para dar el siguiente salto.']; }
  else { g = '¿Trabajando de madrugada?'; f = ['Tu negocio merece un sistema que trabaje contigo 24/7.', 'Las mejores ideas nacen a esta hora.']; }
  timeEl.textContent = g;
  phraseEl.textContent = f[Math.floor(Math.random() * f.length)];
}

function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  const b = document.getElementById('theme-toggle'); if (b) b.innerHTML = t === 'dark' ? ICON_SUN : ICON_MOON;
}
function initTheme() {
  let t = null;
  try { t = localStorage.getItem('zenda_theme'); } catch (e) {}
  if (!t) t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  applyTheme(t);
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const n = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('zenda_theme', n); } catch (e) {}
    applyTheme(n);
  });
}

function updateGeneralWhatsApp() {
  const wa = linkWhatsApp('Hola Zenda Studio, quiero información sobre sus paquetes. Vengo de la web.');
  document.querySelectorAll('.js-wa-general').forEach(el => { el.href = wa; });
}

function renderPlans() {
  const c = document.getElementById('plans-grid');
  if (!c) return;
  c.innerHTML = PLANS.map(p => `
    <article class="plan-card ${p.popular ? 'popular' : ''}">
      <div class="plan-top"><span class="plan-num">${esc(p.num)}</span>${p.popular ? '<span class="plan-popular-tag">Recomendado</span>' : ''}</div>
      <span class="plan-team">${esc(p.team)}</span>
      <h3>${esc(p.title)}</h3>
      <p class="plan-for">${esc(p.ideal)}</p>
      <div class="plan-includes">Incluye</div>
      <ul class="feature-list">${p.features.map(f => `<li>${ICON_CHECK}<span>${esc(f)}</span></li>`).join('')}</ul>
      <a href="${linkWhatsApp(msgPlan(p))}" target="_blank" rel="noopener" class="btn ${p.popular ? 'btn-primary' : 'btn-secondary'} btn-full">Quiero este paquete &rarr;</a>
    </article>`).join('');
}

/* Amiguito */
const BOT_TIPS = [
  { tag: 'IG y TikTok', text: 'Un enlace claro con tus productos y botón a WhatsApp te ahorra mil “¿precio?”.' },
  { tag: '1 persona', text: 'Si trabajas solo, deja que tu página muestre todo mientras tú cierras ventas.' },
  { tag: '2–3 personas', text: 'Con una hoja compartida tu equipo no vuelve a perder un pedido.' },
  { tag: 'Ahorro', text: 'Al vivir en tus cuentas de Google y GitHub te ahorras rentas mensuales.' },
  { tag: 'Escalable', text: 'Empieza simple hoy y suma automatizaciones o chatbot cuando crezcas.' }
];
const DODGE_LINES = ['¡Casi! Así de rápida carga tu futura web.', '¡Uy! No me atrapes a mí, atrapa más clientes.'];

function initZendaBot() {
  const bot = document.getElementById('zenda-bot'), orb = document.getElementById('bot-orb'), bubble = document.getElementById('bot-bubble');
  if (!bot || !orb || !bubble) return;
  const tagEl = document.getElementById('bot-tag'), msgEl = document.getElementById('bot-msg');
  const eyeL = document.getElementById('eye-l'), eyeR = document.getElementById('eye-r'), mouth = document.getElementById('bot-mouth');
  const MOUTH = 'M13 22.5 Q18 26.5 23 22.5';
  let idx = Math.floor(Math.random() * BOT_TIPS.length), dismissed = false, dodges = 0, lastMove = 0, timer = null;
  const isTouch = window.matchMedia('(hover: none)').matches;

  const say = (tag, text, mood) => {
    bubble.hidden = false; dismissed = false;
    tagEl.textContent = tag; msgEl.textContent = text;
    if (mood === 'happy') {
      mouth.setAttribute('d', 'M12 21 Q18 28 24 21');
      orb.classList.remove('excited'); void orb.offsetWidth; orb.classList.add('excited');
      setTimeout(() => mouth.setAttribute('d', MOUTH), 1300);
    } else if (mood === 'surprised') {
      mouth.setAttribute('d', 'M15.5 23 Q18 25.5 20.5 23');
      setTimeout(() => mouth.setAttribute('d', MOUTH), 650);
    }
  };
  const nextTip = () => { idx = (idx + 1) % BOT_TIPS.length; say(BOT_TIPS[idx].tag, BOT_TIPS[idx].text); };
  const startTimer = () => { clearInterval(timer); timer = setInterval(() => { if (!dismissed && !bubble.hidden) nextTip(); }, 9500); };

  tagEl.textContent = BOT_TIPS[idx].tag; msgEl.textContent = BOT_TIPS[idx].text;
  if (window.innerWidth <= 640) { bubble.hidden = true; setTimeout(() => { if (!dismissed) bubble.hidden = false; }, 4000); }
  startTimer();
  document.getElementById('bot-next').onclick = () => { nextTip(); startTimer(); };
  document.getElementById('bot-close').onclick = () => { bubble.hidden = true; dismissed = true; bot.style.transform = ''; dodges = 0; };

  const lookAt = (x, y) => {
    const r = orb.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const a = Math.atan2(y - cy, x - cx), d = Math.min(2.2, Math.hypot(x - cx, y - cy) / 90);
    eyeL.setAttribute('cx', (12.5 + Math.cos(a) * d).toFixed(2)); eyeL.setAttribute('cy', (14.5 + Math.sin(a) * d).toFixed(2));
    eyeR.setAttribute('cx', (23.5 + Math.cos(a) * d).toFixed(2)); eyeR.setAttribute('cy', (14.5 + Math.sin(a) * d).toFixed(2));
  };
  if (!isTouch) document.addEventListener('mousemove', e => lookAt(e.clientX, e.clientY), { passive: true });

  const moves = isTouch ? [{ x: -54, y: -26 }, { x: -14, y: -70 }] : [{ x: -100, y: -32 }, { x: -20, y: -104 }];
  const dodge = () => {
    const now = Date.now(); if (now - lastMove < 350) return; lastMove = now;
    bot.style.transform = `translate(${moves[dodges].x}px, ${moves[dodges].y}px)`;
    say('¡Ups!', DODGE_LINES[dodges], 'surprised'); dodges++;
  };
  if (!reduceMotion) orb.addEventListener('mouseenter', () => { if (!isTouch && dodges < 2) dodge(); });
  orb.addEventListener('click', () => {
    if (isTouch && !reduceMotion && dodges < 2) { dodge(); return; }
    bot.style.transform = ''; dodges = 2;
    say('¡Me atrapaste!', 'Escríbenos directo por WhatsApp o Instagram y armamos tu proyecto.', 'happy');
  });
}

/* Solo lee de tu Google Sheet el número de WhatsApp y el banner (pestaña Config) */
async function cargarConfig() {
  try {
    const res = await fetch(CONFIG.APPS_SCRIPT_URL);
    const json = await res.json();
    if (json.status !== 'ok' || !json.config) return;
    const wa = String(json.config.whatsapp || '').replace(/\D/g, '');
    if (wa && wa !== '50200000000') CONFIG.WHATSAPP_NUMBER = wa;
    const promo = String(json.config.banner_promo || '').trim();
    const bar = document.getElementById('promo-bar');
    if (bar && promo) { bar.textContent = promo; bar.hidden = false; }
    updateGeneralWhatsApp(); renderPlans();
  } catch (e) { console.warn('Config no disponible, se usa el número por defecto.', e); }
}

function initSecretAccess() {
  let clicks = 0, t;
  document.getElementById('secret-dot')?.addEventListener('click', () => {
    clicks++; clearTimeout(t); t = setTimeout(() => { clicks = 0; }, 2200);
    if (clicks >= 5) { clicks = 0; window.location.href = 'admin.html'; }
  });
  document.addEventListener('keydown', e => { if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'z') window.location.href = 'admin.html'; });
}

document.addEventListener('DOMContentLoaded', () => {
  const y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
  initDynamicPalette();
  initTheme();
  initGreeting();
  updateGeneralWhatsApp();
  renderPlans();
  initZendaBot();
  initSecretAccess();
  cargarConfig();
});