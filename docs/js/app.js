'use strict';
/* zenda studio. — app.js v4 */
const CONFIG = {
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzBQgX8U0CzNe_zH8slUUAgDPMlQG3o0TidWUQ8cX2I88tEGSa6-4zsZet6Y-bqqd12GQ/exec',
  WHATSAPP_NUMBER: '50258798301',
  MONEDA: 'Q',
  MOSTRAR_PRECIOS: false,
  CACHE_KEY: 'zenda_cache_v4'
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
    features: ['Página de enlace profesional para tu bio de Instagram y TikTok', 'Tus productos o servicios con fotos y descripción', 'Botón de pedido a WhatsApp con el mensaje ya armado', 'Diseño pensado primero para celular', 'Publicada en tus propias cuentas'] },
  { code: 'PLAN-2', num: '02', team: '2 a 3 personas', popular: true, title: 'Negocio & Equipo', ideal: 'Para equipos que comparten pedidos, inventario y atención.',
    features: ['Todo lo del paquete Emprendedor', 'Panel privado para cambiar fotos y textos desde el celular', 'Hoja compartida de clientes y pedidos', 'Capacitación práctica para tu equipo'] },
  { code: 'PLAN-3', num: '03', team: '4 a 6 personas', title: 'Operación & Flujos', ideal: 'Para negocios con ventas diarias que necesitan automatizar.',
    features: ['Todo lo del paquete Negocio & Equipo', 'Mini CRM para dar seguimiento a cada cliente', 'Avisos automáticos de nuevos pedidos', 'Tablero de ventas e inventario', '30 días de soporte prioritario'] },
  { code: 'PLAN-4', num: '04', team: '6+ personas', title: 'Empresa a Medida', ideal: 'Para varias áreas, alto volumen y reportes gerenciales.',
    features: ['Todo lo del paquete Operación & Flujos', 'Análisis de tu operación y sistema diseñado a tu medida', 'Base de datos y flujos entre áreas', 'Tableros gerenciales con reportes automáticos', 'Acompañamiento técnico continuo'] }
];

const ICON_SUN = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>';
const ICON_MOON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
const ICON_CHECK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';

const $ = (id) => document.getElementById(id);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
const safeUrl = (u) => /^https?:\/\//i.test(String(u || '')) ? String(u) : '';
const linkWhatsApp = (msg) => `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
const msgPlan = (p) => `Hola Zenda Studio, me interesa un paquete:\n- Paquete: ${p.code} · ${p.title}\n- Equipo: ${p.team}\nVengo de la web. ¿Me brindan información y el costo?`;
const msgServicio = (i) => `Hola Zenda Studio, me interesa un servicio:\n- Servicio: ${i.nombre}\n- Categoría: ${i.categoria || 'General'}\nVengo de la web. ¿Me brindan información?`;
const precioVisible = (i) => CONFIG.MOSTRAR_PRECIOS && String(i.precio || '').trim() !== '' && String(i.precio).trim() !== '0';

let catalogoGlobal = [];
let catActiva = 'Todos';
let rotatorTimer = null;
let lastSig = '';
let io = null;
let spy = null;
let lastFocus = null;

/* ---------- Color distinto en cada página / recarga ---------- */
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

/* ---------- Saludo según hora de Guatemala ---------- */
function initGreeting() {
  const timeEl = $('greeting-time'), phraseEl = $('greeting-phrase');
  if (!timeEl || !phraseEl) return;
  let hour = new Date().getHours();
  try { hour = Number(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Guatemala', hour: 'numeric', hour12: false }).format(new Date())) % 24; } catch (e) {}
  let g, f;
  if (hour >= 5 && hour < 12) { g = 'Buenos días'; f = ['Buen momento para ordenar tus ventas.', 'Haz que tu enlace de IG y TikTok venda solo.', 'Arranca el día automatizando tu negocio.']; }
  else if (hour >= 12 && hour < 19) { g = 'Buenas tardes'; f = ['Deja de responder “precio” uno por uno.', 'Sistemas claros para negocios que crecen.', 'Tu negocio en línea, listo en días.']; }
  else if (hour >= 19) { g = 'Buenas noches'; f = ['Mientras descansas, tu página sigue atendiendo.', 'Disponible las 24 horas, a la medida de tu negocio.', 'Buena hora para dar el siguiente salto.']; }
  else { g = '¿Trabajando de madrugada?'; f = ['Tu negocio merece un sistema que trabaje contigo.', 'Las mejores ideas nacen a esta hora.']; }
  timeEl.textContent = g;
  phraseEl.textContent = f[Math.floor(Math.random() * f.length)];
}

/* ---------- Tema ---------- */
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  const b = $('theme-toggle'); if (b) b.innerHTML = t === 'dark' ? ICON_SUN : ICON_MOON;
}
function initTheme() {
  let t = null;
  try { t = localStorage.getItem('zenda_theme'); } catch (e) {}
  if (!t) t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  applyTheme(t);
  $('theme-toggle')?.addEventListener('click', () => {
    const n = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('zenda_theme', n); } catch (e) {}
    applyTheme(n);
  });
}

/* ---------- Animaciones sutiles ---------- */
function observeReveals(root) {
  const els = (root || document).querySelectorAll('.reveal:not(.in)');
  if (!('IntersectionObserver' in window) || reduceMotion) { els.forEach(e => e.classList.add('in')); return; }
  if (!io) io = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  els.forEach(e => io.observe(e));
}

function initScrollFx() {
  const nav = document.querySelector('.navbar'), root = document.documentElement;
  let tick = false;
  const upd = () => {
    const max = root.scrollHeight - root.clientHeight, y = window.scrollY || 0;
    root.style.setProperty('--scroll', max > 0 ? Math.min(1, y / max).toFixed(4) : 0);
    if (nav) nav.classList.toggle('scrolled', y > 8);
    tick = false;
  };
  window.addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
  upd();
}

function initScrollSpy() {
  if (spy) spy.disconnect();
  if (!('IntersectionObserver' in window)) return;
  const links = [...document.querySelectorAll('.nav-link[href^="#"]')];
  const map = new Map();
  links.forEach(l => { const s = document.querySelector(l.getAttribute('href')); if (s) map.set(s, l); });
  if (!map.size) return;
  spy = new IntersectionObserver((es) => {
    es.forEach(e => {
      if (e.isIntersecting) { links.forEach(l => l.classList.remove('active')); const l = map.get(e.target); if (l) l.classList.add('active'); }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  map.forEach((_, s) => spy.observe(s));
}

/* ---------- Enlaces a WhatsApp ---------- */
function updateLinks() {
  const g = linkWhatsApp('Hola Zenda Studio, quiero información sobre sus paquetes. Vengo de la web.');
  document.querySelectorAll('.js-wa-general').forEach(el => { el.href = g; });
  document.querySelectorAll('a[data-plan]').forEach(el => { el.href = linkWhatsApp(msgPlan(PLANS[Number(el.dataset.plan)])); });
  document.querySelectorAll('a[data-svc]').forEach(el => {
    const it = catalogoGlobal.find(x => String(x.id) === String(el.dataset.svc));
    if (it) el.href = linkWhatsApp(msgServicio(it));
  });
}

/* ---------- Paquetes ---------- */
function renderPlans() {
  const c = $('plans-grid');
  if (!c) return;
  c.innerHTML = PLANS.map((p, i) => `
    <div class="reveal" style="--d:${i * 80}ms">
      <article class="plan-card ${p.popular ? 'popular' : ''}">
        <div class="plan-top"><span class="plan-num">${esc(p.num)}</span>${p.popular ? '<span class="plan-popular-tag">Recomendado</span>' : ''}</div>
        <span class="plan-team">${esc(p.team)}</span>
        <h3>${esc(p.title)}</h3>
        <p class="plan-for">${esc(p.ideal)}</p>
        <div class="plan-includes">Incluye</div>
        <ul class="feature-list">${p.features.map(f => `<li>${ICON_CHECK}<span>${esc(f)}</span></li>`).join('')}</ul>
        <a href="#" data-plan="${i}" target="_blank" rel="noopener" class="btn ${p.popular ? 'btn-primary' : 'btn-secondary'} btn-full"><span>Quiero este paquete</span><span class="arr" aria-hidden="true">&rarr;</span></a>
      </article>
    </div>`).join('');
  updateLinks();
  observeReveals(c);
}

/* ---------- Catálogo ---------- */
function renderMediaHTML(m, alt) {
  const u = m && safeUrl(m.url);
  if (!u) return '<div style="height:100%;display:grid;place-items:center;color:var(--text-muted);font-size:.84rem;">Sin vista previa</div>';
  if (m.type === 'video') return `<video src="${esc(u)}" autoplay loop muted playsinline></video>`;
  if (m.type === 'drive_video') return `<iframe src="${esc(u)}" allow="autoplay" title="${esc(alt)}"></iframe>`;
  return `<img src="${esc(u)}" alt="${esc(alt)}" loading="lazy" decoding="async" />`;
}
const galeriaDe = (item) => (item.galeria && item.galeria.length) ? item.galeria : [{ type: 'image', url: item.imagen_url }];

function renderFilters() {
  const bar = $('filtros-categorias');
  if (!bar) return;
  const cats = [...new Set(catalogoGlobal.map(i => i.categoria).filter(Boolean))];
  if (cats.length < 2) { bar.hidden = true; catActiva = 'Todos'; return; }
  bar.hidden = false;
  const all = ['Todos', ...cats];
  if (!all.includes(catActiva)) catActiva = 'Todos';
  bar.innerHTML = all.map(c => `<button type="button" class="tag-pill ${c === catActiva ? 'active' : ''}" data-cat="${esc(c)}" aria-pressed="${c === catActiva}">${esc(c)}</button>`).join('');
  bar.querySelectorAll('.tag-pill').forEach(b => b.onclick = () => { catActiva = b.dataset.cat; renderFilters(); renderCatalog(); });
}

function renderCatalog() {
  const grid = $('catalogo-grid');
  if (!grid) return;
  clearInterval(rotatorTimer);
  const items = catalogoGlobal.filter(i => catActiva === 'Todos' || i.categoria === catActiva);
  if (!items.length) { grid.innerHTML = '<div class="empty-state">No hay servicios en esta categoría.</div>'; return; }

  grid.innerHTML = items.map((item, idx) => {
    const gal = galeriaDe(item);
    const feats = String(item.entregables || '').split('|').filter(Boolean);
    const featured = String(item.destacado).toUpperCase() === 'SI';
    const dots = gal.length > 1 ? `<div class="media-dots">${gal.map((_, i) => `<span class="media-dot ${i === 0 ? 'active' : ''}"></span>`).join('')}</div>` : '';
    return `
      <div class="reveal" style="--d:${Math.min(idx, 5) * 70}ms">
        <article class="product-card ${featured ? 'featured' : ''}" data-id="${esc(item.id)}" data-slide="0">
          <div class="card-media" data-modal="${esc(item.id)}">
            <div class="media-slot" style="width:100%;height:100%;">${renderMediaHTML(gal[0], item.nombre)}</div>
            <div class="card-badges"><span class="badge-cat">${esc(item.categoria || 'Servicio')}</span>${featured ? '<span class="badge-star">Destacado</span>' : ''}</div>
            ${dots}
          </div>
          <div class="card-content">
            <div class="card-head"><h3 class="card-title">${esc(item.nombre)}</h3>${precioVisible(item) ? `<span class="card-price">${CONFIG.MONEDA}${esc(item.precio)}</span>` : ''}</div>
            <p class="card-desc">${esc(item.descripcion)}</p>
            <ul class="feature-list">${feats.slice(0, 3).map(f => `<li>${ICON_CHECK}<span>${esc(f.trim())}</span></li>`).join('')}</ul>
            <div class="card-footer">
              <a href="#" data-svc="${esc(item.id)}" target="_blank" rel="noopener" class="btn btn-primary btn-sm"><span>Pedir por WhatsApp</span><span class="arr" aria-hidden="true">&rarr;</span></a>
              <button type="button" class="btn btn-secondary btn-sm" data-modal="${esc(item.id)}">Ver</button>
            </div>
          </div>
        </article>
      </div>`;
  }).join('');

  grid.querySelectorAll('img').forEach(im => { if (im.complete) im.classList.add('loaded'); });
  grid.querySelectorAll('[data-modal]').forEach(el => el.onclick = () => abrirModal(el.dataset.modal));
  updateLinks();
  observeReveals(grid);

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

function abrirModal(id) {
  const item = catalogoGlobal.find(i => String(i.id) === String(id));
  const modal = $('service-modal');
  if (!item || !modal) return;
  const gal = galeriaDe(item);
  const setMain = (idx) => {
    $('modal-media').innerHTML = renderMediaHTML(gal[idx], item.nombre);
    document.querySelectorAll('.modal-thumb').forEach((t, i) => t.classList.toggle('active', i === idx));
  };
  const thumbs = $('modal-thumbs');
  if (gal.length > 1) {
    thumbs.innerHTML = gal.map((m, i) => `<button type="button" class="modal-thumb ${i === 0 ? 'active' : ''}" data-i="${i}" aria-label="Ver archivo ${i + 1}">${m.type === 'image' ? `<img src="${esc(safeUrl(m.url))}" alt="" />` : 'VIDEO'}</button>`).join('');
    thumbs.querySelectorAll('.modal-thumb').forEach(b => b.onclick = () => setMain(Number(b.dataset.i)));
  } else thumbs.innerHTML = '';
  setMain(0);
  $('modal-cat').textContent = item.categoria || 'Servicio';
  $('modal-title').textContent = item.nombre;
  $('modal-price').textContent = precioVisible(item) ? `${CONFIG.MONEDA}${item.precio}` : '';
  $('modal-desc').textContent = item.descripcion || '';
  $('modal-features').innerHTML = String(item.entregables || '').split('|').filter(Boolean).map(f => `<li>${ICON_CHECK}<span>${esc(f.trim())}</span></li>`).join('');
  const wa = $('modal-wa-btn'); wa.dataset.svc = String(item.id); wa.href = linkWhatsApp(msgServicio(item));
  lastFocus = document.activeElement;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  $('modal-close').focus();
}

function initModal() {
  const modal = $('service-modal');
  if (!modal) return;
  const close = () => {
    modal.hidden = true; $('modal-media').innerHTML = '';
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };
  $('modal-close')?.addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  document.addEventListener('keydown', e => {
    if (modal.hidden) return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'Tab') {
      const f = [...modal.querySelectorAll('a[href],button:not([disabled])')].filter(x => x.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
}

/* ---------- Datos del backend (con caché) ---------- */
function aplicarDatos(json) {
  const sig = JSON.stringify(json.config || {}) + JSON.stringify(json.data || []);
  if (sig === lastSig) return;
  lastSig = sig;
  const cfg = json.config || {};
  const wa = String(cfg.whatsapp || '').replace(/\D/g, '');
  if (wa && wa !== '50200000000') CONFIG.WHATSAPP_NUMBER = wa;
  CONFIG.MOSTRAR_PRECIOS = String(cfg.mostrar_precios || '').toUpperCase() === 'SI';
  const promo = String(cfg.banner_promo || '').trim();
  const bar = $('promo-bar');
  if (bar) { bar.textContent = promo; bar.hidden = !promo; }

  catalogoGlobal = json.data || [];
  const hay = catalogoGlobal.length > 0;
  if ($('catalogo')) $('catalogo').hidden = !hay;
  if ($('nav-catalogo')) $('nav-catalogo').hidden = !hay;
  if (hay) { renderFilters(); renderCatalog(); }
  updateLinks();
  initScrollSpy();
}

async function cargarBackend() {
  try { const c = sessionStorage.getItem(CONFIG.CACHE_KEY); if (c) aplicarDatos(JSON.parse(c)); } catch (e) {}
  try {
    const res = await fetch(CONFIG.APPS_SCRIPT_URL);
    const json = await res.json();
    if (json.status !== 'ok') throw new Error('Respuesta inválida');
    try { sessionStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify(json)); } catch (e) {}
    aplicarDatos(json);
  } catch (err) { console.warn('No se pudo leer el catálogo; se usan los valores por defecto.', err); }
}

/* ---------- Amiguito ---------- */
const BOT_TIPS = [
  { tag: 'IG y TikTok', text: 'Un enlace claro con tus productos y botón a WhatsApp te ahorra muchos “¿precio?”.' },
  { tag: '1 persona', text: 'Si trabajas solo, deja que tu página muestre todo mientras tú cierras ventas.' },
  { tag: '2–3 personas', text: 'Con una hoja compartida tu equipo no vuelve a perder un pedido.' },
  { tag: 'Tuyo', text: 'Tu sistema se publica en tus propias cuentas: tú lo controlas.' },
  { tag: 'Escalable', text: 'Empieza simple hoy y suma automatizaciones o chatbot cuando crezcas.' }
];
const DODGE_LINES = ['¡Casi! Así de rápida carga tu futura web.', '¡Uy! No me atrapes a mí, atrapa más clientes.'];

function initZendaBot() {
  const bot = $('zenda-bot'), orb = $('bot-orb'), bubble = $('bot-bubble');
  if (!bot || !orb || !bubble) return;
  const tagEl = $('bot-tag'), msgEl = $('bot-msg'), eyeL = $('eye-l'), eyeR = $('eye-r'), mouth = $('bot-mouth');
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
  $('bot-next').onclick = () => { nextTip(); startTimer(); };
  $('bot-close').onclick = () => { bubble.hidden = true; dismissed = true; bot.style.transform = ''; dodges = 0; };

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

/* ---------- Acceso oculto al panel: 5 clics en el punto o Ctrl+Shift+Z ---------- */
function initSecretAccess() {
  let clicks = 0, t;
  $('secret-dot')?.addEventListener('click', () => {
    clicks++; clearTimeout(t); t = setTimeout(() => { clicks = 0; }, 2200);
    if (clicks >= 5) { clicks = 0; window.location.href = 'admin.html'; }
  });
  document.addEventListener('keydown', e => { if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'z') window.location.href = 'admin.html'; });
}

document.addEventListener('DOMContentLoaded', () => {
  window.__zendaReady = true;
  const y = $('year'); if (y) y.textContent = new Date().getFullYear();
  initDynamicPalette();
  initTheme();
  initGreeting();
  renderPlans();
  updateLinks();
  initZendaBot();
  initModal();
  initSecretAccess();
  initScrollFx();
  observeReveals(document);
  initScrollSpy();
  cargarBackend();
});