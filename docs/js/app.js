const CONFIG = {
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzBQgX8U0CzNe_zH8slUUAgDPMlQG3o0TidWUQ8cX2I88tEGSa6-4zsZet6Y-bqqd12GQ/exec',
  WHATSAPP_NUMBER: '50258798301',
  INSTAGRAM_URL: 'https://www.instagram.com/zenda.studio.gt/',
  MONEDA: 'Q'
};

// 4 prismas luminosos sobrios (cambian silenciosamente en cada visita, sin texto "Edición")
const PRISMS = [
  { c1: '#2563eb', c2: '#06b6d4', c3: '#6366f1', soft: 'rgba(37, 99, 235, 0.12)' },
  { c1: '#0284c7', c2: '#14b8a6', c3: '#3b82f6', soft: 'rgba(2, 132, 199, 0.12)' },
  { c1: '#4f46e5', c2: '#38bdf8', c3: '#8b5cf6', soft: 'rgba(79, 70, 229, 0.12)' },
  { c1: '#0891b2', c2: '#3b82f6', c3: '#6366f1', soft: 'rgba(8, 145, 178, 0.12)' }
];

// Paquetes estructurados por tamaño de negocio (1, 2-3, 4-6, 6+ integrantes) y complejidad
const TEAM_PLANS = [
  {
    key: 'solo',
    id: 'PLAN-SOLO',
    range: '1 persona',
    short: 'Solo tú',
    title: 'Plan Emprendedor',
    subtitle: 'Ideal si atiendes ventas, entregas y redes tú solo y necesitas verte profesional hoy mismo.',
    complexity: 'Nivel 1 · Esencial',
    complexityPct: 28,
    delivery: '5 a 7 días',
    priceNum: 1400,
    priceLabel: '1,400',
    features: [
      'Página web comercial optimizada para enlace de Instagram',
      'Catálogo en vivo conectado a Google Sheets y Drive',
      'Botones directos a tu WhatsApp con mensaje prellenado',
      'Formulario de cotización que guarda prospectos automáticamente',
      'Cero pagos mensuales de servidor'
    ]
  },
  {
    key: 'duo',
    id: 'PLAN-DUO',
    range: '2 a 3 integrantes',
    short: 'Equipo base',
    title: 'Plan Negocio en Crecimiento',
    subtitle: 'Pensado para equipos pequeños donde 2 o 3 personas comparten pedidos, precios e inventario.',
    complexity: 'Nivel 2 · Comercial',
    complexityPct: 54,
    delivery: '7 a 10 días',
    priceNum: 2400,
    priceLabel: '2,400',
    featured: true,
    features: [
      'Tienda online completa con carrito de compras y folios de orden',
      'Panel administrativo privado para subir fotos y editar precios en segundos',
      'Base de datos compartida en Google Sheets para todo tu equipo',
      'Alertas automáticas por correo y resumen ordenado a WhatsApp',
      'Capacitación en vivo para los integrantes del negocio'
    ]
  },
  {
    key: 'squad',
    id: 'PLAN-SQUAD',
    range: '4 a 6 integrantes',
    short: 'Operación',
    title: 'Plan Operación & Flujos',
    subtitle: 'Para negocios con ventas constantes que necesitan seguimiento de clientes, automatización y métricas.',
    complexity: 'Nivel 3 · Automatizado',
    complexityPct: 78,
    delivery: '10 a 15 días',
    priceNum: 3900,
    priceLabel: '3,900',
    features: [
      'Todo lo del Plan Negocio + CRM ligero para seguimiento de prospectos',
      'Automatizaciones de notificaciones y tareas repetitivas (Apps Script / n8n)',
      'Dashboard de ventas, estados de pedidos y rendimiento en tiempo real',
      'Separación por áreas o responsables dentro de tu hoja maestra',
      'Soporte prioritario durante 30 días después del lanzamiento'
    ]
  },
  {
    key: 'scale',
    id: 'PLAN-SCALE',
    range: '6+ integrantes',
    short: 'Empresa',
    title: 'Plan Escala a Medida',
    subtitle: 'Arquitectura diseñada para empresas o múltiples áreas que requieren integraciones y BI gerencial.',
    complexity: 'Nivel 4 · Corporativo',
    complexityPct: 100,
    delivery: '15 a 25 días',
    priceNum: 6500,
    priceLabel: '6,500',
    features: [
      'Arquitectura web y base de datos diseñada según tus procesos internos',
      'Integración con APIs, formularios avanzados y flujos multi-área',
      'Tableros gerenciales (Looker Studio / BI) con reportes programados',
      'Control de accesos, trazabilidad de órdenes e inventario multi-equipo',
      'Acompañamiento técnico y escalabilidad modular continua'
    ]
  }
];

const ICON_SUN = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>';
const ICON_MOON = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
const ICON_CHECK = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="20 6 9 17 4 12"/></svg>';

let catalogoGlobal = [];
let cart = JSON.parse(localStorage.getItem('zenda_cart') || '[]');
let activeModalItem = null;
let currentView = 'grid';
let activeTeamKey = 'duo';
let cardRotatorTimer = null;

const linkWhatsApp = (msg) => `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
const parsePrice = (val) => parseFloat(String(val || '0').replace(/,/g, '').replace(/[^\d.]/g, '')) || 0;
const formatMoney = (num) => `${CONFIG.MONEDA}${Number(num || 0).toLocaleString('en-US')}`;
const esc = (s) => String(s || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.hidden = false;
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => { t.hidden = true; }, 2400);
}

// ================= PRISMA ALEATORIO SILENCIOSO POR VISITA =================
function initRandomPrism() {
  const last = Number(sessionStorage.getItem('zenda_prism'));
  let idx = Math.floor(Math.random() * PRISMS.length);
  if (!Number.isNaN(last) && PRISMS.length > 1 && idx === last) {
    idx = (idx + 1) % PRISMS.length;
  }
  sessionStorage.setItem('zenda_prism', String(idx));
  const p = PRISMS[idx];
  const r = document.documentElement.style;
  r.setProperty('--c1', p.c1);
  r.setProperty('--c2', p.c2);
  r.setProperty('--c3', p.c3);
  r.setProperty('--accent-soft', p.soft);
}

// ================= SALUDO DINÁMICO SEGÚN HORA =================
function initGreeting() {
  let hour = new Date().getHours();
  try {
    hour = Number(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Guatemala', hour: 'numeric', hour12: false }).format(new Date()));
  } catch {}

  let greeting = 'Hola';
  let phrases = [];
  if (hour >= 5 && hour < 12) {
    greeting = 'Buenos días';
    phrases = ['Buen momento para ordenar tu negocio.', 'Haz que tu web trabaje por tu equipo hoy.', 'Sistemas claros desde el primer café.'];
  } else if (hour >= 12 && hour < 19) {
    greeting = 'Buenas tardes';
    phrases = ['Menos trabajo manual, más ventas cerradas.', 'Sistemas pensados para equipos que no se detienen.', 'Qué gusto recibirte en Zenda Studio.'];
  } else if (hour >= 19 && hour < 24) {
    greeting = 'Buenas noches';
    phrases = ['Mientras descansas, tu sistema sigue vendiendo.', 'Buena hora para planear el siguiente nivel de tu negocio.', 'Tu catálogo en línea nunca cierra.'];
  } else {
    greeting = '¿Trabajando de madrugada?';
    phrases = ['Tu negocio merece un sistema que trabaje contigo 24/7.', 'Las mejores decisiones se toman con calma.'];
  }

  document.getElementById('greeting-time').textContent = greeting;
  document.getElementById('greeting-phrase').textContent = phrases[Math.floor(Math.random() * phrases.length)];
}

// ================= NAVEGACIÓN POR SECCIONES (SPA) =================
const VALID_ROUTES = ['inicio', 'equipos', 'catalogo', 'proceso', 'cotizar'];

function navigateTo(route, updateHash = true) {
  const target = VALID_ROUTES.includes(route) ? route : 'inicio';
  document.querySelectorAll('.page-view').forEach(sec => {
    sec.hidden = sec.id !== `view-${target}`;
  });
  document.querySelectorAll('[data-route]').forEach(el => {
    if (el.classList.contains('nav-tab')) {
      el.classList.toggle('active', el.dataset.route === target);
    }
  });
  if (updateHash && window.location.hash !== `#${target}`) {
    history.replaceState(null, '', `#${target}`);
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Reacción sutil del amiguito según sección
  if (!botDismissed) {
    if (target === 'equipos') botSay('Por equipo', 'Selecciona cuántos son en tu negocio para ver complejidad, entregables y precio.', 'normal');
    else if (target === 'catalogo') botSay('Catálogo vivo', 'Puedes filtrar por categoría, cambiar a lista o abrir la galería de cada paquete.', 'normal');
    else if (target === 'cotizar') botSay('A medida', 'Al enviar el formulario tu solicitud se guarda y abre directo en nuestro WhatsApp.', 'normal');
  }
}

function initRouter() {
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-route]');
    if (!trigger) return;
    e.preventDefault();
    navigateTo(trigger.dataset.route);
  });
  window.addEventListener('hashchange', () => {
    const h = window.location.hash.replace('#', '');
    navigateTo(h || 'inicio', false);
  });
  const initial = window.location.hash.replace('#', '');
  navigateTo(VALID_ROUTES.includes(initial) ? initial : 'inicio', false);
}

// ================= SELECTOR DE PAQUETES POR EQUIPO =================
function renderHomeQuickFinder(key) {
  const plan = TEAM_PLANS.find(p => p.key === key) || TEAM_PLANS[0];
  document.querySelectorAll('#home-size-pills .size-pill').forEach(b => b.classList.toggle('active', b.dataset.tier === plan.key));
  document.getElementById('home-quick-result').innerHTML = `
    <div class="quick-result-top">
      <h4>${esc(plan.title)}</h4>
      <span class="quick-result-price">Desde ${CONFIG.MONEDA}${plan.priceLabel}</span>
    </div>
    <p>${esc(plan.subtitle)}</p>
    <div style="display:flex; gap:8px; flex-wrap:wrap;">
      <button type="button" class="btn btn-prism btn-sm" onclick="goToTeamPlan('${plan.key}')">Ver qué incluye &rarr;</button>
      <button type="button" class="btn btn-secondary btn-sm" onclick="addTeamPlanToCart('${plan.key}')">Agregar al carrito</button>
    </div>`;
}

window.goToTeamPlan = function(key) {
  activeTeamKey = key;
  renderTeamView();
  navigateTo('equipos');
};

window.addTeamPlanToCart = function(key) {
  const plan = TEAM_PLANS.find(p => p.key === key);
  if (!plan) return;
  addRawToCart({ id: plan.id, nombre: `${plan.title} (${plan.range})`, precio: plan.priceNum });
};

function renderTeamView() {
  const bar = document.getElementById('team-selector-bar');
  bar.innerHTML = TEAM_PLANS.map(p => `
    <button type="button" class="team-tab ${p.key === activeTeamKey ? 'active' : ''}" data-key="${p.key}">
      <span class="team-tab-num">${esc(p.range)}</span>
      <strong>${esc(p.title)}</strong>
      <span>${esc(p.complexity)}</span>
    </button>`).join('');

  bar.querySelectorAll('.team-tab').forEach(b => {
    b.onclick = () => { activeTeamKey = b.dataset.key; renderTeamView(); };
  });

  const plan = TEAM_PLANS.find(p => p.key === activeTeamKey) || TEAM_PLANS[0];
  const wa = linkWhatsApp(`Hola Zenda Studio, somos un negocio de ${plan.range} y nos interesa el ${plan.title} (${CONFIG.MONEDA}${plan.priceLabel}).`);

  document.getElementById('team-detail-card').innerHTML = `
    <div>
      <span class="view-kicker prism-text">${esc(plan.range)} &middot; ${esc(plan.complexity)}</span>
      <h3 style="font-size:1.65rem; font-weight:800; letter-spacing:-0.03em; margin-bottom:8px;">${esc(plan.title)}</h3>
      <p style="color:var(--text-secondary); margin-bottom:18px;">${esc(plan.subtitle)}</p>

      <div class="complexity-wrap">
        <div class="complexity-label"><span>Nivel de automatización y alcance</span><span>${plan.complexityPct}%</span></div>
        <div class="complexity-track"><div class="complexity-fill" style="width:${plan.complexityPct}%;"></div></div>
      </div>

      <ul class="feature-list" style="margin-bottom:0;">
        ${plan.features.map(f => `<li>${ICON_CHECK}<span>${esc(f)}</span></li>`).join('')}
      </ul>
    </div>

    <div class="team-side-box">
      <div>
        <div style="font-size:0.78rem; color:var(--text-muted); margin-bottom:4px;">Inversión estimada</div>
        <div class="team-price-big prism-text">${CONFIG.MONEDA}${plan.priceLabel}</div>
        <div style="font-size:0.8rem; color:var(--text-muted); margin-top:4px;">50% al iniciar · 50% al entregar</div>

        <div style="margin-top:18px;">
          <div class="team-meta-row"><span>Equipo ideal</span><strong>${esc(plan.range)}</strong></div>
          <div class="team-meta-row"><span>Tiempo de entrega</span><strong>${esc(plan.delivery)}</strong></div>
          <div class="team-meta-row" style="border:none;"><span>Mantenimiento mensual</span><strong>Q0 (en tus cuentas)</strong></div>
        </div>
      </div>

      <div style="display:grid; gap:8px;">
        <button type="button" class="btn btn-prism btn-full" onclick="addTeamPlanToCart('${plan.key}')">Agregar al carrito</button>
        <a href="${wa}" target="_blank" rel="noopener" class="btn btn-secondary btn-full">Consultar por WhatsApp</a>
      </div>
    </div>`;

  document.getElementById('team-compare-grid').innerHTML = TEAM_PLANS.map(p => `
    <div class="compare-card ${p.key === activeTeamKey ? 'highlight' : ''}">
      <span style="font-size:0.74rem; color:var(--text-muted); font-weight:700;">${esc(p.range)}</span>
      <h4>${esc(p.title)}</h4>
      <div class="c-price">${CONFIG.MONEDA}${p.priceLabel}</div>
      <p>${esc(p.subtitle)}</p>
      <button type="button" class="btn btn-secondary btn-sm btn-full" onclick="activeTeamKey='${p.key}'; renderTeamView();">Ver detalle</button>
    </div>`).join('');
}

// ================= AMIGUITO TRANSLÚCIDO MULTICOLOR =================
const BOT_TIPS = [
  { tag: 'Emprendedores (1)', text: 'Si trabajas solo, un catálogo con precios y WhatsApp automático te ahorra horas cada semana.' },
  { tag: 'Equipos (2–3)', text: 'Cuando 2 o 3 personas atienden clientes, tener pedidos en una sola hoja evita duplicados y errores.' },
  { tag: 'Equipos (4–6)', text: 'Con 4 o más personas, automatizar el seguimiento de clientes y ver métricas diarias marca la diferencia.' },
  { tag: 'Ahorro real', text: 'Al trabajar sobre tus propias cuentas de Google y GitHub no pagas alquileres mensuales por tu tienda.' },
  { tag: 'Consejo', text: 'Mostrar paquetes claros por tamaño de negocio ayuda a que tu cliente decida mucho más rápido.' },
  { tag: 'Tip de ventas', text: 'El 80% de tus prospectos llega desde Instagram en celular. Tu enlace debe cargar en menos de 2 segundos.' },
  { tag: 'Escalable', text: 'Puedes arrancar con el Plan Emprendedor hoy y sumar CRM o reportes después sin rehacer tu web.' },
  { tag: 'Confianza', text: 'Pagas 50% al iniciar y 50% cuando ya ves tu sistema funcionando en producción.' }
];

const DODGE_LINES = [
  '¡Casi! Así de ágil corre tu futura página web.',
  '¡Uy! No me atrapes a mí, atrapa más clientes.',
  'Ok, ganaste. Escríbenos por WA o IG y armamos tu sistema.'
];

let botIdx = Math.floor(Math.random() * BOT_TIPS.length);
let botDismissed = false;
let botTimer = null;

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
    setTimeout(() => mouth.setAttribute('d', 'M13 22.5 Q18 26.5 23 22.5'), 1500);
  } else if (mood === 'surprised') {
    mouth.setAttribute('d', 'M15.5 23 Q18 25.5 20.5 23');
    setTimeout(() => mouth.setAttribute('d', 'M13 22.5 Q18 26.5 23 22.5'), 650);
  }
}

function nextBotTip() {
  botIdx = (botIdx + 1) % BOT_TIPS.length;
  const item = BOT_TIPS[botIdx];
  botSay(item.tag, item.text);
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

  const first = BOT_TIPS[botIdx];
  document.getElementById('bot-tag').textContent = first.tag;
  document.getElementById('bot-msg').textContent = first.text;

  botTimer = setInterval(() => { if (!botDismissed) nextBotTip(); }, 10000);
  nextBtn.onclick = () => {
    nextBotTip();
    clearInterval(botTimer);
    botTimer = setInterval(() => { if (!botDismissed) nextBotTip(); }, 10000);
  };

  document.addEventListener('mousemove', (e) => {
    const r = orb.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const ang = Math.atan2(dy, dx);
    const d = Math.min(2.3, Math.hypot(dx, dy) / 90);
    eyeL.setAttribute('cx', (12.5 + Math.cos(ang) * d).toFixed(2));
    eyeL.setAttribute('cy', (14.5 + Math.sin(ang) * d).toFixed(2));
    eyeR.setAttribute('cx', (23.5 + Math.cos(ang) * d).toFixed(2));
    eyeR.setAttribute('cy', (14.5 + Math.sin(ang) * d).toFixed(2));
  });

  let dodges = 0, lastDodge = 0;
  const offsets = [{ x: -110, y: -38 }, { x: -24, y: -120 }, { x: 0, y: 0 }];
  orb.addEventListener('mouseenter', () => {
    if (window.innerWidth < 768) return;
    const now = Date.now();
    if (dodges < 3 && now - lastDodge > 360) {
      lastDodge = now;
      const p = offsets[dodges];
      bot.style.transform = `translate(${p.x}px, ${p.y}px)`;
      botSay('¡Ups!', DODGE_LINES[dodges], 'surprised');
      dodges++;
    }
  });

  orb.onclick = () => {
    bot.style.transform = 'translate(0, 0)';
    botSay('¡Me atrapaste!', 'Usa "Otro tip" para ideas rápidas, o escríbenos directo en WA / IG.', 'happy');
  };

  closeBtn.onclick = () => {
    bubble.hidden = true;
    botDismissed = true;
    bot.style.transform = 'translate(0, 0)';
    dodges = 0;
  };
}

// ================= TEMA Y CONTACTOS =================
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.innerHTML = theme === 'dark' ? ICON_SUN : ICON_MOON;
}

function initTheme() {
  applyTheme(localStorage.getItem('zenda_theme') || 'dark');
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    localStorage.setItem('zenda_theme', next);
    applyTheme(next);
  });
}

function updateContactLinks() {
  const waMsg = linkWhatsApp('Hola Zenda Studio, me interesa conocer los paquetes para mi negocio.');
  ['hero-whatsapp', 'direct-whatsapp', 'footer-whatsapp', 'bot-wa'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.href = waMsg;
  });
}

function aplicarConfigRemota(cfg) {
  if (!cfg) return;
  const cleanWa = String(cfg.whatsapp || '').replace(/\D/g, '');
  if (cleanWa && cleanWa !== '50200000000') CONFIG.WHATSAPP_NUMBER = cleanWa;
  if (cfg.banner_promo && cfg.banner_promo.trim()) {
    const bar = document.getElementById('promo-bar');
    bar.textContent = cfg.banner_promo;
    bar.hidden = false;
  }
  updateContactLinks();
}

// ================= CATÁLOGO GOOGLE SHEETS + DRIVE =================
function renderMediaHTML(m, alt) {
  if (!m || !m.url) return '<div style="height:100%;display:grid;place-items:center;color:var(--text-muted);font-size:0.85rem;">Sin vista previa</div>';
  if (m.type === 'video') return `<video src="${m.url}" autoplay loop muted playsinline></video>`;
  if (m.type === 'drive_video') return `<iframe src="${m.url}" allow="autoplay"></iframe>`;
  return `<img src="${m.url}" alt="${esc(alt)}" loading="lazy" />`;
}

async function cargarCatalogo() {
  const grid = document.getElementById('catalogo-grid');
  try {
    const res = await fetch(CONFIG.APPS_SCRIPT_URL);
    const json = await res.json();
    if (json.config) aplicarConfigRemota(json.config);
    catalogoGlobal = json.data || [];
    renderFiltros(catalogoGlobal);
    renderCatalogo(catalogoGlobal);
    poblarSelectPaquetes(catalogoGlobal);
  } catch (err) {
    grid.innerHTML = '<div class="empty-state">No se pudo cargar el catálogo. Recarga la página.</div>';
    console.error(err);
  }
}

function renderFiltros(items) {
  const container = document.getElementById('filtros-categorias');
  const cats = ['Todos', ...new Set(items.map(i => i.categoria).filter(Boolean))];
  container.innerHTML = cats.map((c, idx) => `<button type="button" class="tag-pill ${idx === 0 ? 'active' : ''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('');

  const filtrar = () => {
    const activeCat = container.querySelector('.tag-pill.active')?.dataset.cat || 'Todos';
    const q = (document.getElementById('search-input')?.value || '').toLowerCase().trim();
    const res = catalogoGlobal.filter(i => {
      const okCat = activeCat === 'Todos' || i.categoria === activeCat;
      const okQ = !q || `${i.nombre} ${i.descripcion} ${i.categoria} ${i.entregables}`.toLowerCase().includes(q);
      return okCat && okQ;
    });
    renderCatalogo(res);
  };

  container.querySelectorAll('.tag-pill').forEach(btn => {
    btn.onclick = () => {
      container.querySelectorAll('.tag-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filtrar();
    };
  });
  document.getElementById('search-input')?.addEventListener('input', filtrar);

  document.querySelectorAll('.view-switch button').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.view-switch button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentView = btn.dataset.view;
      document.getElementById('catalogo-grid').classList.toggle('view-list', currentView === 'list');
    };
  });
}

function renderCatalogo(items) {
  const grid = document.getElementById('catalogo-grid');
  grid.classList.toggle('view-list', currentView === 'list');
  clearInterval(cardRotatorTimer);

  if (!items.length) {
    grid.innerHTML = '<div class="empty-state">No hay servicios en esta categoría.</div>';
    return;
  }

  grid.innerHTML = items.map(item => {
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
            ${featured ? '<span class="badge-star">Recomendado</span>' : ''}
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
            ${feats.slice(0, 4).map(f => `<li>${ICON_CHECK}<span>${esc(f.trim())}</span></li>`).join('')}
          </ul>
          <div class="card-footer">
            <button type="button" class="btn btn-prism btn-sm" data-action="add" data-id="${esc(item.id)}">Agregar al carrito</button>
            <button type="button" class="btn btn-secondary btn-sm" data-action="modal" data-id="${esc(item.id)}">Ver detalle</button>
          </div>
        </div>
      </article>`;
  }).join('');

  grid.querySelectorAll('[data-action="add"]').forEach(b => b.onclick = () => addCatalogItemToCart(b.dataset.id));
  grid.querySelectorAll('[data-action="modal"]').forEach(b => b.onclick = () => abrirModal(b.dataset.id));

  cardRotatorTimer = setInterval(() => {
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

// ================= CARRITO =================
function saveCart() { localStorage.setItem('zenda_cart', JSON.stringify(cart)); renderCart(); }

function addRawToCart({ id, nombre, precio }) {
  const ex = cart.find(c => String(c.id) === String(id));
  if (ex) ex.qty += 1;
  else cart.push({ id, nombre, precio, qty: 1 });
  saveCart();
  showToast(`Agregado al carrito: ${nombre}`);
  botSay('En tu carrito', `"${nombre}" agregado. Recuerda que puedes iniciar con el 50%.`, 'happy');
  openCart();
}

function addCatalogItemToCart(id) {
  const item = catalogoGlobal.find(i => String(i.id) === String(id));
  if (!item) return;
  addRawToCart({ id: item.id, nombre: item.nombre, precio: parsePrice(item.precio) });
}

window.changeQty = function(id, delta) {
  const idx = cart.findIndex(c => String(c.id) === String(id));
  if (idx === -1) return;
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  saveCart();
};

function renderCart() {
  document.getElementById('cart-count').textContent = cart.reduce((s, i) => s + i.qty, 0);
  const list = document.getElementById('cart-items');
  const area = document.getElementById('cart-checkout-area');
  if (!cart.length) {
    list.innerHTML = '<div class="empty-state" style="padding:30px 16px;">Tu carrito está vacío. Explora los planes por equipo o el catálogo.</div>';
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
          <span style="font-size:0.82rem; color:var(--c1); font-weight:700;">${formatMoney(c.precio)}</span>
        </div>
        <div class="qty-control">
          <button type="button" class="qty-btn" onclick="changeQty('${esc(c.id)}', -1)">-</button>
          <span style="font-weight:600; min-width:18px; text-align:center;">${c.qty}</span>
          <button type="button" class="qty-btn" onclick="changeQty('${esc(c.id)}', 1)">+</button>
        </div>
      </div>`;
  }).join('');
  document.getElementById('cart-total').textContent = formatMoney(total);
}

function openCart() { document.getElementById('cart-overlay').hidden = false; renderCart(); }
function closeCart() { document.getElementById('cart-overlay').hidden = true; }

function initCart() {
  document.getElementById('cart-open-btn').onclick = openCart;
  document.getElementById('cart-close-btn').onclick = closeCart;
  document.getElementById('cart-overlay').addEventListener('click', e => { if (e.target.id === 'cart-overlay') closeCart(); });

  document.getElementById('checkout-form').addEventListener('submit', async (e) => {
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
      st.innerHTML = `Orden <strong>${esc(orderId)}</strong> registrada. <a href="${wa}" target="_blank" style="color:var(--c2)">Abrir WhatsApp &rarr;</a>`;
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

// ================= MODAL =================
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
  document.getElementById('modal-cat').textContent = item.categoria || 'Paquete';
  document.getElementById('modal-title').textContent = item.nombre;
  document.getElementById('modal-price').textContent = `${CONFIG.MONEDA}${item.precio}`;
  document.getElementById('modal-desc').textContent = item.descripcion || '';
  document.getElementById('modal-features').innerHTML = String(item.entregables || '').split('|').filter(Boolean)
    .map(f => `<li>${ICON_CHECK}<span>${esc(f.trim())}</span></li>`).join('');
  document.getElementById('modal-wa-btn').href = linkWhatsApp(`Hola Zenda Studio, quiero consultar sobre "${item.nombre}" (${CONFIG.MONEDA}${item.precio}).`);
  document.getElementById('service-modal').hidden = false;
}

function initModal() {
  const modal = document.getElementById('service-modal');
  const close = () => { modal.hidden = true; document.getElementById('modal-media').innerHTML = ''; };
  document.getElementById('modal-close').onclick = close;
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  document.getElementById('modal-add-btn').onclick = () => { if (activeModalItem) { close(); addCatalogItemToCart(activeModalItem.id); } };
}

function poblarSelectPaquetes(items) {
  const sel = document.getElementById('paquete');
  sel.innerHTML = '<option value="Proyecto a medida">Proyecto a medida</option>';
  TEAM_PLANS.forEach(p => {
    const opt = document.createElement('option');
    opt.value = `${p.title} (${p.range})`;
    opt.textContent = `${p.title} — ${p.range} (${CONFIG.MONEDA}${p.priceLabel})`;
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
  const st = document.getElementById('form-status');
  const btn = document.getElementById('btn-submit');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    btn.disabled = true; btn.textContent = 'Enviando...'; st.textContent = '';
    const equipo = document.getElementById('equipo-tamano').value;
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
      st.innerHTML = `Solicitud registrada. <a href="${wa}" target="_blank" style="color:var(--c2)">Abrir WhatsApp &rarr;</a>`;
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
  document.getElementById('year').textContent = new Date().getFullYear();
  initRandomPrism();
  initTheme();
  initGreeting();
  updateContactLinks();
  document.querySelectorAll('#home-size-pills .size-pill').forEach(b => {
    b.onclick = () => renderHomeQuickFinder(b.dataset.tier);
  });
  renderHomeQuickFinder('solo');
  renderTeamView();
  initZendaBot();
  initCart();
  initModal();
  initQuoteForm();
  initSecretAccess();
  initRouter();
  cargarCatalogo();
});