'use strict';
/* zenda studio. — app.js v2 */
const CONFIG = {
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzBQgX8U0CzNe_zH8slUUAgDPMlQG3o0TidWUQ8cX2I88tEGSa6-4zsZet6Y-bqqd12GQ/exec',
  WHATSAPP_NUMBER: '50258798301',
  INSTAGRAM_URL: 'https://www.instagram.com/zenda.studio.gt/',
  MONEDA: 'Q',
  CACHE_KEY: 'zenda_cache_v2'
};

const PALETTES = [
  { c1: '#0066ff', c2: '#38bdf8', c3: '#6366f1', soft: 'rgba(0,102,255,.09)', wash: 'rgba(0,102,255,.12)', border: 'rgba(0,102,255,.30)' },
  { c1: '#e8470f', c2: '#fb923c', c3: '#f43f5e', soft: 'rgba(232,71,15,.09)', wash: 'rgba(232,71,15,.11)', border: 'rgba(232,71,15,.30)' },
  { c1: '#059669', c2: '#14b8a6', c3: '#0ea5e9', soft: 'rgba(5,150,105,.09)', wash: 'rgba(5,150,105,.12)', border: 'rgba(5,150,105,.30)' },
  { c1: '#6366f1', c2: '#a855f7', c3: '#38bdf8', soft: 'rgba(99,102,241,.09)', wash: 'rgba(99,102,241,.12)', border: 'rgba(99,102,241,.32)' },
  { c1: '#e11d48', c2: '#fb7185', c3: '#8b5cf6', soft: 'rgba(225,29,72,.09)', wash: 'rgba(225,29,72,.11)', border: 'rgba(225,29,72,.30)' }
];

const TEAM_PLANS = [
  { code: 'PLAN-1', team: '1 persona', title: 'Emprendedor', ideal: 'Ideal para negocios por Instagram, TikTok y WhatsApp.', price: '1,400',
    features: ['Enlace profesional para tu bio de IG y TikTok', 'Catálogo en vivo con Google Sheets y Drive', 'Botones con pedido prellenado a WhatsApp', 'Cero rentas mensuales de servidor'] },
  { code: 'PLAN-2', team: '2 a 3 integrantes', popular: true, title: 'Negocio & Equipo', ideal: 'Para equipos que comparten pedidos, stock y atención.', price: '2,400',
    features: ['Todo lo del plan Emprendedor', 'Panel privado para subir fotos y precios desde el celular', 'Hoja maestra compartida de clientes y pedidos', 'Capacitación práctica para tu equipo'] },
  { code: 'PLAN-3', team: '4 a 6 integrantes', title: 'Operación & Flujos', ideal: 'Negocios con ventas diarias que necesitan automatizar.', price: '3,900',
    features: ['Todo lo del plan Negocio + mini CRM', 'Avisos y flujos automáticos (n8n / Apps Script)', 'Tablero visual de ventas e inventario en vivo', '30 días de soporte prioritario'] },
  { code: 'PLAN-4', team: '6+ integrantes', title: 'Empresa a Medida', ideal: 'Varias áreas, alto volumen y reportes gerenciales.', price: '6,500',
    features: ['Arquitectura web y base de datos a tu medida', 'Dashboards gerenciales en Looker Studio', 'Flujos multi-área y control de inventario', 'Escalabilidad modular y acompañamiento técnico'] }
];

const ICON_SUN = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>';
const ICON_MOON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
const ICON_CHECK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';

let catalogoGlobal = [];
let catActiva = 'Todos';
let rotatorTimer = null;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const linkWhatsApp = (msg) => `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
const safeUrl = (u) => /^https?:\/\//i.test(String(u || '')) ? String(u) : '';

/* Mensajes estructurados (listos para el futuro chatbot) */
const msgPlan = (p) => `Hola Zenda Studio, quiero cotizar:\n- Paquete: ${p.code} · ${p.title}\n- Equipo: ${p.team}\n- Precio: ${CONFIG.MONEDA}${p.price}\nVengo de la web. ¿Me brindan más información?`;
const msgServicio = (i) => `Hola Zenda Studio, quiero cotizar:\n- Servicio: ${i.nombre}\n- Categoría: ${i.categoria || 'General'}\n- Precio: ${CONFIG.MONEDA}${i.precio}\nVengo del catálogo web. ¿Me dan más detalles?`;

/* Color distinto en cada página / recarga */
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

/* Saludo según hora de Guatemala */
function initGreeting() {
  const timeEl = document.getElementById('greeting-time');
  const phraseEl = document.getElementById('greeting-phrase');
  if (!timeEl || !phraseEl) return;
  let hour = new Date().getHours();
  try { hour = Number(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Guatemala', hour: 'numeric', hour12: false }).format(new Date())) % 24; } catch (e) {}
  let g, f;
  if (hour >= 5 && hour < 12) { g = 'Buenos días'; f = ['Buen momento para ordenar tus ventas.', 'Haz que tu enlace de IG y TikTok venda solo.', 'Arranca el día automatizando tu negocio.']; }
  else if (hour >= 12 && hour < 19) { g = 'Buenas tardes'; f = ['Deja de responder “precio” uno por uno.', 'Sistemas claros para negocios que crecen.', 'Tu catálogo en línea listo en días.']; }
  else if (hour >= 19) { g = 'Buenas noches'; f = ['Mientras descansas, tu página sigue captando clientes.', 'Tu catálogo disponible 24/7, sin mensualidades.', 'Buena hora para dar el siguiente salto.']; }
  else { g = '¿Trabajando de madrugada?'; f = ['Tu negocio merece un sistema que trabaje contigo 24/7.', 'Las mejores ideas nacen a esta hora.']; }
  timeEl.textContent = g;
  phraseEl.textContent = f[Math.floor(Math.random() * f.length)];
}

/* Tema claro/oscuro (respeta el del sistema la primera vez) */
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
  const wa = linkWhatsApp('Hola Zenda Studio, quiero información sobre sus sistemas web y paquetes. Vengo de la web.');
  document.querySelectorAll('.js-wa-general').forEach(el => { el.href = wa; });
}

/* Paquetes */
function renderTeamPlans() {
  const c = document.getElementById('plans-grid');
  if (!c) return;
  c.innerHTML = TEAM_PLANS.map(p => `
    <article class="plan-card ${p.popular ? 'popular' : ''}">
      <div class="plan-top"><span class="plan-team">${esc(p.team)}</span>${p.popular ? '<span class="plan-popular-tag">Recomendado</span>' : ''}</div>
      <h3>${esc(p.title)}</h3>
      <p class="plan-for">${esc(p.ideal)}</p>
      <div class="plan-price-row"><div class="plan-price">${CONFIG.MONEDA}${esc(p.price)}</div><div class="plan-note">Pago único &middot; 50% al iniciar</div></div>
      <ul class="feature-list">${p.features.map(f => `<li>${ICON_CHECK}<span>${esc(f)}</span></li>`).join('')}</ul>
      <a href="${linkWhatsApp(msgPlan(p))}" target="_blank" rel="noopener" class="btn ${p.popular ? 'btn-primary' : 'btn-secondary'} btn-full">Cotizar por WhatsApp &rarr;</a>
    </article>`).join('');
}

/* Amiguito */
const BOT_TIPS = [
  { tag: 'IG y TikTok', text: 'Un enlace claro con precios y catálogo directo a WhatsApp te ahorra mil “¿precio?”.' },
  { tag: '1 persona', text: 'Si trabajas solo, deja que tu página muestre fotos y precios mientras tú cierras ventas.' },
  { tag: '2–3 personas', text: 'Con una base compartida en Sheets tu equipo no vuelve a perder un pedido.' },
  { tag: 'Ahorro', text: 'Al vivir en tus cuentas de Google y GitHub te ahorras rentas mensuales.' },
  { tag: '50 / 50', text: 'Inicias con el 50% y pagas el resto cuando ves tu sistema funcionando.' },
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

/* Catálogo */
function renderMediaHTML(m, alt) {
  const u = m && safeUrl(m.url);
  if (!u) return '<div style="height:100%;display:grid;place-items:center;color:var(--text-muted);font-size:.84rem;">Sin vista previa</div>';
  if (m.type === 'video') return `<video src="${esc(u)}" autoplay loop muted playsinline></video>`;
  if (m.type === 'drive_video') return `<iframe src="${esc(u)}" allow="autoplay" title="${esc(alt)}"></iframe>`;
  return `<img src="${esc(u)}" alt="${esc(alt)}" loading="lazy" decoding="async" width="800" height="500" />`;
}
const galeriaDe = (item) => (item.galeria && item.galeria.length) ? item.galeria : [{ type: 'image', url: item.imagen_url }];

function renderCatalogFilters() {
  const bar = document.getElementById('filtros-categorias');
  if (!bar) return;
  const cats = ['Todos', ...new Set(catalogoGlobal.map(i => i.categoria).filter(Boolean))];
  if (!cats.includes(catActiva)) catActiva = 'Todos';
  bar.innerHTML = cats.map(c => `<button type="button" class="tag-pill ${c === catActiva ? 'active' : ''}" data-cat="${esc(c)}" aria-pressed="${c === catActiva}">${esc(c)}</button>`).join('');
  bar.querySelectorAll('.tag-pill').forEach(b => b.onclick = () => { catActiva = b.dataset.cat; renderCatalogFilters(); aplicarFiltros(); });
}

function aplicarFiltros() {
  const q = (document.getElementById('search-input')?.value || '').toLowerCase().trim();
  renderCatalog(catalogoGlobal.filter(i => {
    const okCat = catActiva === 'Todos' || i.categoria === catActiva;
    const okQ = !q || `${i.nombre} ${i.descripcion} ${i.categoria} ${i.entregables}`.toLowerCase().includes(q);
    return okCat && okQ;
  }));
}

function renderCatalog(items) {
  const grid = document.getElementById('catalogo-grid');
  if (!grid) return;
  clearInterval(rotatorTimer);
  if (!items.length) { grid.innerHTML = '<div class="empty-state">No hay servicios para mostrar.</div>'; return; }

  grid.innerHTML = items.map(item => {
    const gal = galeriaDe(item);
    const feats = String(item.entregables || '').split('|').filter(Boolean);
    const featured = String(item.destacado).toUpperCase() === 'SI';
    const dots = gal.length > 1 ? `<div class="media-dots">${gal.map((_, i) => `<span class="media-dot ${i === 0 ? 'active' : ''}"></span>`).join('')}</div>` : '';
    return `
      <article class="product-card ${featured ? 'featured' : ''}" data-id="${esc(item.id)}" data-slide="0">
        <div class="card-media" data-modal="${esc(item.id)}">
          <div class="media-slot" style="width:100%;height:100%;">${renderMediaHTML(gal[0], item.nombre)}</div>
          <div class="card-badges"><span class="badge-cat">${esc(item.categoria || 'Servicio')}</span>${featured ? '<span class="badge-star">Destacado</span>' : ''}</div>
          ${dots}
        </div>
        <div class="card-content">
          <div class="card-head"><h3 class="card-title">${esc(item.nombre)}</h3><span class="card-price">${CONFIG.MONEDA}${esc(item.precio)}</span></div>
          <p class="card-desc">${esc(item.descripcion)}</p>
          <ul class="feature-list">${feats.slice(0, 3).map(f => `<li>${ICON_CHECK}<span>${esc(f.trim())}</span></li>`).join('')}</ul>
          <div class="card-footer">
            <a href="${linkWhatsApp(msgServicio(item))}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">Pedir por WhatsApp &rarr;</a>
            <button type="button" class="btn btn-secondary btn-sm" data-modal="${esc(item.id)}">Ver</button>
          </div>
        </div>
      </article>`;
  }).join('');

  grid.querySelectorAll('[data-modal]').forEach(el => el.onclick = () => abrirModal(el.dataset.modal));

  if (reduceMotion) return;
  rotatorTimer = setInterval(() => {
    grid.querySelectorAll('.product-card').forEach(card => {
      const item = catalogoGlobal.find(i => String(i.id) === String(card.dataset.id));
      if (!item || !item.galeria || item.galeria.length <= 1) return;
      const next = (Number(card.dataset.slide || 0) + 1) % item.galeria.length;
      if (item.galeria[next].type === 'drive_video') return;
      card.dataset.slide = next;
      const slot = card.querySelector('.media-slot');
      if (slot) slot.innerHTML = renderMediaHTML(item.galeria[next], item.nombre);
      card.querySelectorAll('.media-dot').forEach((d, i) => d.classList.toggle('active', i === next));
    });
  }, 4500);
}

let lastFocus = null;
function abrirModal(id) {
  const item = catalogoGlobal.find(i => String(i.id) === String(id));
  const modal = document.getElementById('service-modal');
  if (!item || !modal) return;
  const gal = galeriaDe(item);
  const setMain = (idx) => {
    document.getElementById('modal-media').innerHTML = renderMediaHTML(gal[idx], item.nombre);
    document.querySelectorAll('.modal-thumb').forEach((t, i) => t.classList.toggle('active', i === idx));
  };
  const thumbs = document.getElementById('modal-thumbs');
  if (gal.length > 1) {
    thumbs.innerHTML = gal.map((m, i) => `<button type="button" class="modal-thumb ${i === 0 ? 'active' : ''}" data-i="${i}" aria-label="Ver archivo ${i + 1}">${m.type === 'image' ? `<img src="${esc(safeUrl(m.url))}" alt="" />` : 'VIDEO'}</button>`).join('');
    thumbs.querySelectorAll('.modal-thumb').forEach(b => b.onclick = () => setMain(Number(b.dataset.i)));
  } else thumbs.innerHTML = '';
  setMain(0);
  document.getElementById('modal-cat').textContent = item.categoria || 'Servicio';
  document.getElementById('modal-title').textContent = item.nombre;
  document.getElementById('modal-price').textContent = `${CONFIG.MONEDA}${item.precio}`;
  document.getElementById('modal-desc').textContent = item.descripcion || '';
  document.getElementById('modal-features').innerHTML = String(item.entregables || '').split('|').filter(Boolean).map(f => `<li>${ICON_CHECK}<span>${esc(f.trim())}</span></li>`).join('');
  document.getElementById('modal-wa-btn').href = linkWhatsApp(msgServicio(item));
  lastFocus = document.activeElement;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  document.getElementById('modal-close').focus();
}

function initModal() {
  const modal = document.getElementById('service-modal');
  if (!modal) return;
  const close = () => {
    modal.hidden = true; document.getElementById('modal-media').innerHTML = '';
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };
  document.getElementById('modal-close')?.addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) close(); });
}

/* Datos desde Google (con caché para carga instantánea) */
function aplicarDatos(json) {
  if (json.config) {
    const cleanWa = String(json.config.whatsapp || '').replace(/\D/g, '');
    if (cleanWa && cleanWa !== '50200000000') CONFIG.WHATSAPP_NUMBER = cleanWa;
    const promo = String(json.config.banner_promo || '').trim();
    const bar = document.getElementById('promo-bar');
    if (bar && promo) { bar.textContent = promo; bar.hidden = false; }
    updateGeneralWhatsApp(); renderTeamPlans();
  }
  catalogoGlobal = json.data || [];
  if (document.getElementById('catalogo-grid')) { renderCatalogFilters(); aplicarFiltros(); }
}

async function cargarBackend() {
  try { const c = sessionStorage.getItem(CONFIG.CACHE_KEY); if (c) aplicarDatos(JSON.parse(c)); } catch (e) {}
  try {
    const res = await fetch(CONFIG.APPS_SCRIPT_URL);
    const json = await res.json();
    if (json.status !== 'ok') throw new Error('Respuesta inválida');
    try { sessionStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify(json)); } catch (e) {}
    aplicarDatos(json);
  } catch (err) {
    console.error(err);
    const grid = document.getElementById('catalogo-grid');
    if (grid && !catalogoGlobal.length) grid.innerHTML = '<div class="empty-state">No pudimos cargar el catálogo. Recarga la página o escríbenos por WhatsApp.</div>';
  }
}

/* Acceso oculto al admin: 5 clics en el punto o Ctrl+Shift+Z */
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
  renderTeamPlans();
  initZendaBot();
  initModal();
  initSecretAccess();
  document.getElementById('search-input')?.addEventListener('input', aplicarFiltros);
  cargarBackend();
});