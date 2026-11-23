const CONFIG = {
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzBQgX8U0CzNe_zH8slUUAgDPMlQG3o0TidWUQ8cX2I88tEGSa6-4zsZet6Y-bqqd12GQ/exec',
  WHATSAPP_NUMBER: '50258798301',
  INSTAGRAM_URL: 'https://www.instagram.com/zenda.studio.gt/',
  MONEDA: 'Q'
};

// 5 atmósferas de marca notorias: cambian cada vez que visitas otra página o recargas
const PALETTES = [
  { c1: '#0066ff', c2: '#38bdf8', c3: '#6366f1', soft: 'rgba(0, 102, 255, 0.10)',  wash: 'rgba(0, 102, 255, 0.15)',  border: 'rgba(0, 102, 255, 0.34)' },
  { c1: '#ff5500', c2: '#fb923c', c3: '#f43f5e', soft: 'rgba(255, 85, 0, 0.10)',   wash: 'rgba(255, 85, 0, 0.14)',   border: 'rgba(255, 85, 0, 0.34)' },
  { c1: '#059669', c2: '#14b8a6', c3: '#0ea5e9', soft: 'rgba(5, 150, 105, 0.10)',  wash: 'rgba(5, 150, 105, 0.15)',  border: 'rgba(5, 150, 105, 0.34)' },
  { c1: '#6366f1', c2: '#a855f7', c3: '#38bdf8', soft: 'rgba(99, 102, 241, 0.11)', wash: 'rgba(99, 102, 241, 0.15)', border: 'rgba(99, 102, 241, 0.36)' },
  { c1: '#e11d48', c2: '#fb7185', c3: '#8b5cf6', soft: 'rgba(225, 29, 72, 0.10)',  wash: 'rgba(225, 29, 72, 0.14)',  border: 'rgba(225, 29, 72, 0.34)' }
];

// 4 Paquetes comerciales enfocados en tamaño de equipo (IG / TikTok / WA -> Empresa)
const TEAM_PLANS = [
  {
    id: 'PLAN-1-PERSONA',
    badge: '1 Integrante',
    title: 'Plan Emprendedor Social',
    ideal: 'Ideal para negocios de IG, TikTok y WhatsApp',
    priceNum: 1400,
    priceLabel: '1,400',
    desc: 'Para ti si atiendes solo y quieres dejar de mandar fotos y precios uno por uno.',
    features: [
      'Enlace profesional para tu bio de Instagram y TikTok',
      'Catálogo en vivo conectado a tu Google Sheets y Drive',
      'Botón directo a WhatsApp con el producto ya escrito',
      'Formulario que guarda a tus clientes automáticamente',
      'Cero rentas mensuales de servidor'
    ]
  },
  {
    id: 'PLAN-2-3-EQUIPO',
    badge: 'Más elegido · 2 a 3 Integrantes',
    popular: true,
    title: 'Plan Tienda & Equipo',
    ideal: 'Ideal cuando ya son 2 o 3 vendiendo y despachando',
    priceNum: 2400,
    priceLabel: '2,400',
    desc: 'Centraliza pedidos, stock y precios para que nadie venda algo agotado ni pierda un chat.',
    features: [
      'Tienda completa con carrito de compras y número de orden',
      'Panel privado para subir fotos y precios desde celular',
      'Hoja maestra de pedidos compartida en tiempo real',
      'Notificaciones automáticas y resumen ordenado a WhatsApp',
      'Capacitación práctica para tu equipo'
    ]
  },
  {
    id: 'PLAN-4-6-OPERACION',
    badge: '4 a 6 Integrantes',
    title: 'Plan Operación & Flujos',
    ideal: 'Para negocios con ventas diarias constantes',
    priceNum: 3900,
    priceLabel: '3,900',
    desc: 'Ordena el seguimiento de prospectos, automatiza avisos y controla tus números al día.',
    features: [
      'Todo lo del Plan Tienda + mini CRM de seguimiento',
      'Automatizaciones con Apps Script / n8n sin tareas repetitivas',
      'Tablero visual de ventas, estados e inventario',
      'Control por responsables o sucursales en Sheets',
      '30 días de acompañamiento prioritario'
    ]
  },
  {
    id: 'PLAN-6-MAS-EMPRESA',
    badge: '6+ Integrantes',
    title: 'Plan Empresa a Medida',
    ideal: 'Múltiples áreas, volumen alto y analítica BI',
    priceNum: 6500,
    priceLabel: '6,500',
    desc: 'Arquitectura diseñada a la medida de tu operación con integraciones y reportes gerenciales.',
    features: [
      'Sistema web y base de datos diseñados según tus procesos',
      'Dashboards gerenciales en Looker Studio / BI programados',
      'Integración con formularios avanzados y flujos multi-área',
      'Trazabilidad completa de órdenes, clientes e inventario',
      'Escalabilidad modular y soporte dedicado'
    ]
  }
];

const ICON_SUN = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>';
const ICON_MOON = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
const ICON_CHECK = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';

let catalogoGlobal = [];
let cart = JSON.parse(localStorage.getItem('zenda_cart') || '[]');
let activeModalItem = null;
let cardRotatorTimer = null;

const linkWhatsApp = (msg) => `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
const parsePrice = (val) => parseFloat(String(val || '0').replace(/,/g, '').replace(/[^\d.]/g, '')) || 0;
const formatMoney = (num) => `${CONFIG.MONEDA}${Number(num || 0).toLocaleString('en-US')}`;
const esc = (s) => String(s || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg; t.hidden = false;
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => { t.hidden = true; }, 2500);
}

// ================= CAMBIO DE COLOR NOTORIO EN CADA PÁGINA / VISITA =================
function initDynamicPalette() {
  const lastRaw = sessionStorage.getItem('zenda_palette_idx');
  const last = lastRaw !== null ? Number(lastRaw) : -1;
  let idx = Math.floor(Math.random() * PALETTES.length);
  if (idx === last) idx = (idx + 1 + Math.floor(Math.random() * (PALETTES.length - 1))) % PALETTES.length;
  sessionStorage.setItem('zenda_palette_idx', String(idx));

  const p = PALETTES[idx];
  const r = document.documentElement.style;
  r.setProperty('--c1', p.c1);
  r.setProperty('--c2', p.c2);
  r.setProperty('--c3', p.c3);
  r.setProperty('--accent', p.c1);
  r.setProperty('--accent-soft', p.soft);
  r.setProperty('--accent-wash', p.wash);
  r.setProperty('--accent-border', p.border);
}

// ================= SALUDO SEGÚN LA HORA (GUATEMALA) =================
function initGreeting() {
  const timeEl = document.getElementById('greeting-time');
  const phraseEl = document.getElementById('greeting-phrase');
  if (!timeEl || !phraseEl) return;

  let hour = new Date().getHours();
  try {
    hour = Number(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Guatemala', hour: 'numeric', hour12: false }).format(new Date()));
  } catch {}

  let greeting = 'Hola';
  let phrases = [];
  if (hour >= 5 && hour < 12) {
    greeting = 'Buenos días';
    phrases = ['Buen momento para automatizar tus ventas.', 'Haz que tu enlace de IG y TikTok venda solo hoy.', 'Menos tiempo en chats, más pedidos cerrados.'];
  } else if (hour >= 12 && hour < 19) {
    greeting = 'Buenas tardes';
    phrases = ['¿Cansado de responder “precio” todo el día?', 'Sistemas claros para equipos que quieren crecer.', 'Tu tienda lista para vender 24/7 sin mensualidades.'];
  } else if (hour >= 19 && hour < 24) {
    greeting = 'Buenas noches';
    phrases = ['Mientras descansas, tu tienda sigue recibiendo pedidos.', 'Buena hora para dar el salto profesional con tu marca.', 'Tu negocio no debería cerrar cuando apagas el teléfono.'];
  } else {
    greeting = '¿Trabajando de madrugada?';
    phrases = ['Las mejores marcas nacen así. Automatiza tus ventas hoy.', 'A esta hora tu web debería estar captando clientes sola.'];
  }
  timeEl.textContent = greeting;
  phraseEl.textContent = phrases[Math.floor(Math.random() * phrases.length)];
}

// ================= TEMA, MENÚ MÓVIL Y CONTACTOS =================
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.innerHTML = theme === 'dark' ? ICON_SUN : ICON_MOON;
}

function initThemeAndNav() {
  applyTheme(localStorage.getItem('zenda_theme') || 'light');
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    localStorage.setItem('zenda_theme', next);
    applyTheme(next);
  });

  const drawer = document.getElementById('mobile-drawer');
  document.getElementById('menu-open-btn')?.addEventListener('click', () => { if (drawer) drawer.hidden = false; });
  document.getElementById('menu-close-btn')?.addEventListener('click', () => { if (drawer) drawer.hidden = true; });
  drawer?.addEventListener('click', e => { if (e.target === drawer) drawer.hidden = true; });
}

function updateContactLinks() {
  const waMsg = linkWhatsApp('Hola Zenda Studio, quiero conocer sus paquetes para mi negocio.');
  document.querySelectorAll('.js-wa-general').forEach(el => { el.href = waMsg; });
}

// ================= RENDER DE LOS 4 PAQUETES POR EQUIPO =================
function renderTeamPlans() {
  const container = document.getElementById('plans-grid');
  if (!container) return;

  container.innerHTML = TEAM_PLANS.map(p => {
    const wa = linkWhatsApp(`Hola Zenda Studio, me interesa el ${p.title} (${p.badge} - ${CONFIG.MONEDA}${p.priceLabel}).`);
    return `
      <article class="plan-card ${p.popular ? 'popular' : ''}">
        <span class="plan-badge">${esc(p.badge)}</span>
        <h3>${esc(p.title)}</h3>
        <div class="plan-ideal">${esc(p.ideal)}</div>
        <div class="plan-price">${CONFIG.MONEDA}${p.priceLabel}</div>
        <div class="plan-price-note">Pago único · 50% al iniciar</div>
        <p class="plan-desc">${esc(p.desc)}</p>
        <ul class="feature-list">
          ${p.features.map(f => `<li>${ICON_CHECK}<span>${esc(f)}</span></li>`).join('')}
        </ul>
        <div class="plan-actions">
          <button type="button" class="btn ${p.popular ? 'btn-primary' : 'btn-secondary'} btn-full" onclick="addTeamPlan('${p.id}')">Agregar al carrito</button>
          <a href="${wa}" target="_blank" rel="noopener" class="btn btn-ghost btn-sm btn-full">Consultar por WhatsApp</a>
        </div>
      </article>`;
  }).join('');
}

window.addTeamPlan = function(planId) {
  const p = TEAM_PLANS.find(x => x.id === planId);
  if (!p) return;
  addRawToCart({ id: p.id, nombre: `${p.title} (${p.badge})`, precio: p.priceNum });
};

// ================= AMIGUITO INTERACTIVO EN CEL, IPAD Y PC =================
const BOT_TIPS = [
  { tag: 'IG y TikTok', text: 'Si te piden “precio” en comentarios, mandar tu enlace con catálogo cierra el doble de ventas.' },
  { tag: '1 Persona', text: 'Emprendiendo solo, un sistema que arme el pedido a WhatsApp te devuelve horas cada semana.' },
  { tag: '2–3 Personas', text: 'Con una hoja maestra de pedidos compartida, nadie vuelve a vender un producto agotado.' },
  { tag: '4–6 Personas', text: 'Automatizar seguimiento y ver ventas en tiempo real te quita el caos diario de encima.' },
  { tag: 'Ahorro', text: '¿Sabías que al conectar tu tienda a Google Sheets y Drive te ahorras pagos mensuales fijos?' },
  { tag: 'Detalle Zenda', text: '¿Notaste que al entrar a otra página cambia el color? Así de cuidada puede verse tu marca.' },
  { tag: '50 / 50', text: 'Arrancas con el 50% y liquidas el resto cuando ya ves tu tienda funcionando en tu celular.' },
  { tag: 'Escalable', text: 'Puedes empezar con el Plan Emprendedor hoy y subir de nivel cuando tu equipo crezca.' }
];

const DODGE_LINES = [
  '¡Casi! Así de rápida carga tu futura tienda.',
  '¡Uy! No me atrapes a mí, atrapa más clientes en TikTok e IG.'
];

let botIdx = Math.floor(Math.random() * BOT_TIPS.length);
let botDismissed = false;

function botSay(tag, text, mood = 'normal') {
  const bubble = document.getElementById('bot-bubble');
  const orb = document.getElementById('bot-orb');
  const mouth = document.getElementById('bot-mouth');
  if (!bubble || !orb) return;

  bubble.hidden = false;
  botDismissed = false;
  document.getElementById('bot-tag').textContent = tag;
  document.getElementById('bot-msg').textContent = text;

  if (mood === 'happy') {
    mouth.setAttribute('d', 'M12 21 Q18 28 24 21');
    orb.classList.remove('excited'); void orb.offsetWidth; orb.classList.add('excited');
    setTimeout(() => mouth.setAttribute('d', 'M13 22.5 Q18 26.5 23 22.5'), 1400);
  } else if (mood === 'surprised') {
    mouth.setAttribute('d', 'M15.5 23 Q18 25.5 20.5 23');
    setTimeout(() => mouth.setAttribute('d', 'M13 22.5 Q18 26.5 23 22.5'), 650);
  }
}

function initZendaBot() {
  const bot = document.getElementById('zenda-bot');
  const orb = document.getElementById('bot-orb');
  const bubble = document.getElementById('bot-bubble');
  const closeBtn = document.getElementById('bot-close');
  const nextBtn = document.getElementById('bot-next');
  const eyeL = document.getElementById('eye-l');
  const eyeR = document.getElementById('eye-r');
  if (!bot || !orb) return;

  // En celular inicia con la burbuja cerrada los primeros 2.5s para no tapar el Hero
  if (window.innerWidth <= 640) {
    bubble.hidden = true;
    setTimeout(() => { if (!botDismissed) bubble.hidden = false; }, 2600);
  }

  const first = BOT_TIPS[botIdx];
  document.getElementById('bot-tag').textContent = first.tag;
  document.getElementById('bot-msg').textContent = first.text;

  const rotate = () => {
    botIdx = (botIdx + 1) % BOT_TIPS.length;
    botSay(BOT_TIPS[botIdx].tag, BOT_TIPS[botIdx].text);
  };

  let timer = setInterval(() => { if (!botDismissed && !bubble.hidden) rotate(); }, 9500);
  nextBtn.onclick = () => {
    rotate();
    clearInterval(timer);
    timer = setInterval(() => { if (!botDismissed && !bubble.hidden) rotate(); }, 9500);
  };

  // Ojos siguen el cursor (PC) o el dedo al deslizar (Cel/iPad)
  const lookAt = (x, y) => {
    const r = orb.getBoundingClientRect();
    const dx = x - (r.left + r.width / 2);
    const dy = y - (r.top + r.height / 2);
    const ang = Math.atan2(dy, dx);
    const d = Math.min(2.3, Math.hypot(dx, dy) / 85);
    eyeL.setAttribute('cx', (12.5 + Math.cos(ang) * d).toFixed(2));
    eyeL.setAttribute('cy', (14.5 + Math.sin(ang) * d).toFixed(2));
    eyeR.setAttribute('cx', (23.5 + Math.cos(ang) * d).toFixed(2));
    eyeR.setAttribute('cy', (14.5 + Math.sin(ang) * d).toFixed(2));
  };
  document.addEventListener('mousemove', e => lookAt(e.clientX, e.clientY));
  document.addEventListener('touchmove', e => { if (e.touches[0]) lookAt(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });

  // Esquive interactivo tanto en PC (hover) como en Celular / iPad (toque)
  let dodges = 0;
  let lastMove = 0;
  const isTouch = window.matchMedia('(hover: none)').matches;
  const moves = isTouch
    ? [{ x: -58, y: -28 }, { x: -16, y: -76 }]
    : [{ x: -105, y: -36 }, { x: -24, y: -112 }];

  function doDodge() {
    const now = Date.now();
    if (now - lastMove < 350) return false;
    lastMove = now;
    const pos = moves[dodges];
    bot.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
    botSay('¡Ups!', DODGE_LINES[dodges], 'surprised');
    dodges++;
    return true;
  }

  orb.addEventListener('mouseenter', () => {
    if (isTouch) return;
    if (dodges < 2) doDodge();
  });

  orb.addEventListener('click', () => {
    if (isTouch && dodges < 2) {
      doDodge();
      return;
    }
    bot.style.transform = 'translate(0, 0)';
    dodges = 2;
    botSay('¡Me atrapaste!', 'Toca "Otro tip" para más ideas o escríbenos directo por WA / IG.', 'happy');
  });

  closeBtn.onclick = () => {
    bubble.hidden = true;
    botDismissed = true;
    bot.style.transform = 'translate(0, 0)';
    dodges = 0;
  };
}

// ================= CATÁLOGO (GOOGLE SHEETS + DRIVE) =================
function renderMediaHTML(m, alt) {
  if (!m || !m.url) return '<div style="height:100%;display:grid;place-items:center;color:var(--text-muted);font-size:0.84rem;">Sin vista previa</div>';
  if (m.type === 'video') return `<video src="${m.url}" autoplay loop muted playsinline></video>`;
  if (m.type === 'drive_video') return `<iframe src="${m.url}" allow="autoplay"></iframe>`;
  return `<img src="${m.url}" alt="${esc(alt)}" loading="lazy" />`;
}

function buildProductCard(item) {
  const gal = item.galeria && item.galeria.length ? item.galeria : [{ type: 'image', url: item.imagen_url }];
  const feats = String(item.entregables || '').split('|').filter(Boolean);
  const featured = String(item.destacado).toUpperCase() === 'SI';
  const dots = gal.length > 1 ? `<div class="media-dots">${gal.map((_, i) => `<span class="media-dot ${i === 0 ? 'active' : ''}"></span>`).join('')}</div>` : '';

  return `
    <article class="product-card ${featured ? 'featured' : ''}" data-id="${esc(item.id)}" data-slide="0">
      <div class="card-media" data-action="modal" data-id="${esc(item.id)}">
        <div class="media-slot" style="width:100%;height:100%;">${renderMediaHTML(gal[0], item.nombre)}</div>
        <div class="card-badges">
          <span class="badge-cat">${esc(item.categoria || 'Servicio')}</span>
          ${featured ? '<span class="badge-star">Destacado</span>' : ''}
        </div>
        ${dots}
      </div>
      <div class="card-content">
        <div class="card-head">
          <h3 class="card-title">${esc(item.nombre)}</h3>
          <span class="card-price">${CONFIG.MONEDA}${esc(item.precio)}</span>
        </div>
        <p class="card-desc">${esc(item.descripcion)}</p>
        <ul class="feature-list">
          ${feats.slice(0, 3).map(f => `<li>${ICON_CHECK}<span>${esc(f.trim())}</span></li>`).join('')}
        </ul>
        <div class="card-footer">
          <button type="button" class="btn btn-primary btn-sm" data-action="add" data-id="${esc(item.id)}">Agregar</button>
          <button type="button" class="btn btn-secondary btn-sm" data-action="modal" data-id="${esc(item.id)}">Ver más</button>
        </div>
      </div>
    </article>`;
}

function wireCatalogCards(container) {
  container.querySelectorAll('[data-action="add"]').forEach(b => b.onclick = () => {
    const item = catalogoGlobal.find(i => String(i.id) === String(b.dataset.id));
    if (item) addRawToCart({ id: item.id, nombre: item.nombre, precio: parsePrice(item.precio) });
  });
  container.querySelectorAll('[data-action="modal"]').forEach(b => b.onclick = () => abrirModal(b.dataset.id));

  clearInterval(cardRotatorTimer);
  cardRotatorTimer = setInterval(() => {
    container.querySelectorAll('.product-card').forEach(card => {
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

async function cargarBackend() {
  try {
    const res = await fetch(CONFIG.APPS_SCRIPT_URL);
    const json = await res.json();
    if (json.config) {
      const cleanWa = String(json.config.whatsapp || '').replace(/\D/g, '');
      if (cleanWa && cleanWa !== '50200000000') CONFIG.WHATSAPP_NUMBER = cleanWa;
      if (json.config.banner_promo && json.config.banner_promo.trim()) {
        const bar = document.getElementById('promo-bar');
        if (bar) { bar.textContent = json.config.banner_promo; bar.hidden = false; }
      }
      updateContactLinks();
    }
    catalogoGlobal = json.data || [];

    // Adelanto en Inicio (máximo 3)
    const homePreview = document.getElementById('home-catalog-preview');
    if (homePreview) {
      const subset = catalogoGlobal.slice(0, 3);
      homePreview.innerHTML = subset.length
        ? subset.map(buildProductCard).join('')
        : '<div class="empty-state">Próximamente nuevos servicios en el catálogo.</div>';
      wireCatalogCards(homePreview);
    }

    // Página Catálogo completo
    const fullGrid = document.getElementById('catalogo-grid');
    if (fullGrid) {
      renderCatalogFilters(catalogoGlobal);
      renderFullCatalog(catalogoGlobal);
    }

    // Select de Cotizar
    poblarSelectPaquetes(catalogoGlobal);
  } catch (err) {
    console.error(err);
    const el = document.getElementById('catalogo-grid') || document.getElementById('home-catalog-preview');
    if (el) el.innerHTML = '<div class="empty-state">No se pudo conectar con Google Sheets. Recarga la página.</div>';
  }
}

function renderCatalogFilters(items) {
  const bar = document.getElementById('filtros-categorias');
  if (!bar) return;
  const cats = ['Todos', ...new Set(items.map(i => i.categoria).filter(Boolean))];
  bar.innerHTML = cats.map((c, i) => `<button type="button" class="tag-pill ${i === 0 ? 'active' : ''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('');

  const filtrar = () => {
    const cat = bar.querySelector('.tag-pill.active')?.dataset.cat || 'Todos';
    const q = (document.getElementById('search-input')?.value || '').toLowerCase().trim();
    const res = catalogoGlobal.filter(i => {
      const okCat = cat === 'Todos' || i.categoria === cat;
      const okQ = !q || `${i.nombre} ${i.descripcion} ${i.categoria} ${i.entregables}`.toLowerCase().includes(q);
      return okCat && okQ;
    });
    renderFullCatalog(res);
  };
  bar.querySelectorAll('.tag-pill').forEach(b => {
    b.onclick = () => { bar.querySelectorAll('.tag-pill').forEach(x => x.classList.remove('active')); b.classList.add('active'); filtrar(); };
  });
  document.getElementById('search-input')?.addEventListener('input', filtrar);
}

function renderFullCatalog(items) {
  const grid = document.getElementById('catalogo-grid');
  if (!grid) return;
  if (!items.length) { grid.innerHTML = '<div class="empty-state">No se encontraron servicios con ese filtro.</div>'; return; }
  grid.innerHTML = items.map(buildProductCard).join('');
  wireCatalogCards(grid);
}

// ================= CARRITO =================
function saveCart() { localStorage.setItem('zenda_cart', JSON.stringify(cart)); renderCart(); }

function addRawToCart({ id, nombre, precio }) {
  const ex = cart.find(c => String(c.id) === String(id));
  if (ex) ex.qty += 1;
  else cart.push({ id, nombre, precio, qty: 1 });
  saveCart();
  showToast(`Agregado: ${nombre}`);
  botSay('¡En tu carrito!', `"${nombre}" listo. Puedes confirmar con el 50% de anticipo.`, 'happy');
  openCart();
}

window.changeQty = function(id, delta) {
  const idx = cart.findIndex(c => String(c.id) === String(id));
  if (idx === -1) return;
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  saveCart();
};

function renderCart() {
  const countEl = document.getElementById('cart-count');
  if (countEl) countEl.textContent = cart.reduce((s, i) => s + i.qty, 0);
  const list = document.getElementById('cart-items');
  const area = document.getElementById('cart-checkout-area');
  if (!list || !area) return;

  if (!cart.length) {
    list.innerHTML = '<div class="empty-state" style="padding:30px 16px;">Tu carrito está vacío. Agrega un paquete o servicio.</div>';
    area.hidden = true;
    return;
  }
  area.hidden = false;
  let total = 0;
  list.innerHTML = cart.map(c => {
    total += c.precio * c.qty;
    return `
      <div class="cart-row">
        <div>
          <strong style="font-size:0.9rem; display:block;">${esc(c.nombre)}</strong>
          <span style="font-size:0.82rem; color:var(--accent); font-weight:700;">${formatMoney(c.precio)}</span>
        </div>
        <div class="qty-control">
          <button type="button" class="qty-btn" onclick="changeQty('${esc(c.id)}', -1)">-</button>
          <span style="font-weight:700; min-width:18px; text-align:center;">${c.qty}</span>
          <button type="button" class="qty-btn" onclick="changeQty('${esc(c.id)}', 1)">+</button>
        </div>
      </div>`;
  }).join('');
  document.getElementById('cart-total').textContent = formatMoney(total);
}

function openCart() { const el = document.getElementById('cart-overlay'); if (el) { el.hidden = false; renderCart(); } }
function closeCart() { const el = document.getElementById('cart-overlay'); if (el) el.hidden = true; }

function initCart() {
  document.getElementById('cart-open-btn')?.addEventListener('click', openCart);
  document.getElementById('cart-close-btn')?.addEventListener('click', closeCart);
  document.getElementById('cart-overlay')?.addEventListener('click', e => { if (e.target.id === 'cart-overlay') closeCart(); });

  document.getElementById('checkout-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!cart.length) return;
    const btn = document.getElementById('btn-checkout');
    const st = document.getElementById('chk-status');
    btn.disabled = true; btn.textContent = 'Confirmando...'; st.textContent = '';

    const totalNum = cart.reduce((s, c) => s + c.precio * c.qty, 0);
    const resumen = cart.map(c => `${c.qty}x ${c.nombre} (${formatMoney(c.precio * c.qty)})`).join(' | ');
    const payload = {
      action: 'create_order',
      cliente: document.getElementById('chk-nombre').value.trim(),
      telefono: document.getElementById('chk-tel').value.trim(),
      correo: document.getElementById('chk-correo').value.trim(),
      metodo_pago: document.getElementById('chk-pago').value,
      notas: document.getElementById('chk-notas').value.trim(),
      items_resumen: resumen,
      total: formatMoney(totalNum)
    };
    try {
      const res = await fetch(CONFIG.APPS_SCRIPT_URL, { method: 'POST', body: JSON.stringify(payload) });
      const json = await res.json();
      const orderId = json.orderId || 'ZS-OK';
      const wa = linkWhatsApp(`Hola Zenda Studio, confirmé mi pedido *${orderId}*:\n• Cliente: ${payload.cliente}\n• Paquetes: ${resumen}\n• Total: ${payload.total}\n• Pago: ${payload.metodo_pago}`);
      st.innerHTML = `Orden <strong>${esc(orderId)}</strong> registrada. <a href="${wa}" target="_blank" style="color:var(--accent)">Abrir WhatsApp &rarr;</a>`;
      cart = []; saveCart(); e.target.reset();
      showToast(`Pedido ${orderId} confirmado`);
      window.open(wa, '_blank', 'noopener');
    } catch {
      st.textContent = 'Error de conexión. Escríbenos por WhatsApp o Instagram.';
    } finally {
      btn.disabled = false; btn.textContent = 'Confirmar pedido →';
    }
  });
  renderCart();
}

// ================= MODAL GALERÍA =================
function abrirModal(id) {
  const item = catalogoGlobal.find(i => String(i.id) === String(id));
  if (!item) return;
  activeModalItem = item;
  const gal = item.galeria && item.galeria.length ? item.galeria : [{ type: 'image', url: item.imagen_url }];

  const setMain = (idx) => {
    document.getElementById('modal-media').innerHTML = renderMediaHTML(gal[idx], item.nombre);
    document.querySelectorAll('.modal-thumb').forEach((t, i) => t.classList.toggle('active', i === idx));
  };

  const thumbs = document.getElementById('modal-thumbs');
  if (gal.length > 1) {
    thumbs.innerHTML = gal.map((m, i) => `
      <button type="button" class="modal-thumb ${i === 0 ? 'active' : ''}" data-i="${i}">
        ${m.type === 'image' ? `<img src="${m.url}" alt="" />` : 'VIDEO'}
      </button>`).join('');
    thumbs.querySelectorAll('.modal-thumb').forEach(b => b.onclick = () => setMain(Number(b.dataset.i)));
  } else thumbs.innerHTML = '';

  setMain(0);
  document.getElementById('modal-cat').textContent = item.categoria || 'Servicio';
  document.getElementById('modal-title').textContent = item.nombre;
  document.getElementById('modal-price').textContent = `${CONFIG.MONEDA}${item.precio}`;
  document.getElementById('modal-desc').textContent = item.descripcion || '';
  document.getElementById('modal-features').innerHTML = String(item.entregables || '').split('|').filter(Boolean)
    .map(f => `<li>${ICON_CHECK}<span>${esc(f.trim())}</span></li>`).join('');
  document.getElementById('modal-wa-btn').href = linkWhatsApp(`Hola Zenda Studio, quiero detalles sobre "${item.nombre}" (${CONFIG.MONEDA}${item.precio}).`);
  document.getElementById('service-modal').hidden = false;
}

function initModal() {
  const modal = document.getElementById('service-modal');
  if (!modal) return;
  const close = () => { modal.hidden = true; document.getElementById('modal-media').innerHTML = ''; };
  document.getElementById('modal-close')?.addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  document.getElementById('modal-add-btn')?.addEventListener('click', () => {
    if (activeModalItem) { close(); addRawToCart({ id: activeModalItem.id, nombre: activeModalItem.nombre, precio: parsePrice(activeModalItem.precio) }); }
  });
}

// ================= COTIZADOR =================
function poblarSelectPaquetes(items) {
  const sel = document.getElementById('paquete');
  if (!sel) return;
  sel.innerHTML = '<option value="Proyecto a medida">Proyecto a medida</option>';
  TEAM_PLANS.forEach(p => {
    const opt = document.createElement('option');
    opt.value = `${p.title} (${p.badge})`;
    opt.textContent = `${p.title} — ${p.badge} (${CONFIG.MONEDA}${p.priceLabel})`;
    sel.appendChild(opt);
  });
  items.forEach(item => {
    const opt = document.createElement('option');
    opt.value = `${item.nombre} (${CONFIG.MONEDA}${item.precio})`;
    opt.textContent = `${item.nombre} — ${CONFIG.MONEDA}${item.precio}`;
    sel.appendChild(opt);
  });
}

function initQuoteForm() {
  const form = document.getElementById('quote-form');
  if (!form) return;
  const st = document.getElementById('form-status');
  const btn = document.getElementById('btn-submit');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    btn.disabled = true; btn.textContent = 'Enviando...'; st.textContent = '';
    const equipo = document.getElementById('equipo-tamano')?.value || '';
    const payload = {
      action: 'quote',
      nombre: document.getElementById('nombre').value.trim(),
      telefono: document.getElementById('telefono').value.trim(),
      correo: document.getElementById('correo').value.trim(),
      paquete: `${document.getElementById('paquete').value} [${equipo}]`,
      presupuesto: document.getElementById('presupuesto').value,
      mensaje: document.getElementById('mensaje').value.trim()
    };
    try {
      await fetch(CONFIG.APPS_SCRIPT_URL, { method: 'POST', body: JSON.stringify(payload) });
      const wa = linkWhatsApp(`Hola Zenda Studio, envié una cotización:\n• Nombre: ${payload.nombre}\n• Equipo: ${equipo}\n• Solución: ${payload.paquete}\n• Presupuesto: ${payload.presupuesto}\n• Detalle: ${payload.mensaje}`);
      st.innerHTML = `Solicitud guardada. <a href="${wa}" target="_blank" style="color:var(--accent)">Abrir WhatsApp &rarr;</a>`;
      form.reset(); showToast('Solicitud enviada');
      window.open(wa, '_blank', 'noopener');
    } catch { st.textContent = 'Error al enviar. Escríbenos directo por WhatsApp o Instagram.'; }
    finally { btn.disabled = false; btn.textContent = 'Enviar y abrir WhatsApp →'; }
  });
}

function initSecretAccess() {
  let clicks = 0, timer;
  document.getElementById('secret-dot')?.addEventListener('click', () => {
    clicks++; clearTimeout(timer); timer = setTimeout(() => { clicks = 0; }, 2200);
    if (clicks >= 5) { clicks = 0; window.location.href = 'admin.html'; }
  });
  document.addEventListener('keydown', e => { if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'z') window.location.href = 'admin.html'; });
}

document.addEventListener('DOMContentLoaded', () => {
  const y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
  initDynamicPalette();
  initThemeAndNav();
  initGreeting();
  updateContactLinks();
  renderTeamPlans();
  initZendaBot();
  initCart();
  initModal();
  initQuoteForm();
  initSecretAccess();
  cargarBackend();
});