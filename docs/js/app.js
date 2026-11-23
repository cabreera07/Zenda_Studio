const CONFIG = {
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzBQgX8U0CzNe_zH8slUUAgDPMlQG3o0TidWUQ8cX2I88tEGSa6-4zsZet6Y-bqqd12GQ/exec',
  WHATSAPP_NUMBER: '50258798301',
  INSTAGRAM_URL: 'https://www.instagram.com/zenda.studio.gt/',
  MONEDA: 'Q'
};

// Paletas limpias que rotan visiblemente al cambiar de página o recargar
const PALETTES = [
  { c1: '#0066ff', c2: '#38bdf8', c3: '#6366f1', soft: 'rgba(0, 102, 255, 0.09)',  wash: 'rgba(0, 102, 255, 0.12)',  border: 'rgba(0, 102, 255, 0.30)' },
  { c1: '#ff4d00', c2: '#fb923c', c3: '#f43f5e', soft: 'rgba(255, 77, 0, 0.09)',   wash: 'rgba(255, 77, 0, 0.11)',   border: 'rgba(255, 77, 0, 0.30)' },
  { c1: '#059669', c2: '#14b8a6', c3: '#0ea5e9', soft: 'rgba(5, 150, 105, 0.09)',  wash: 'rgba(5, 150, 105, 0.12)',  border: 'rgba(5, 150, 105, 0.30)' },
  { c1: '#6366f1', c2: '#a855f7', c3: '#38bdf8', soft: 'rgba(99, 102, 241, 0.09)', wash: 'rgba(99, 102, 241, 0.12)', border: 'rgba(99, 102, 241, 0.32)' },
  { c1: '#e11d48', c2: '#fb7185', c3: '#8b5cf6', soft: 'rgba(225, 29, 72, 0.09)',  wash: 'rgba(225, 29, 72, 0.11)',  border: 'rgba(225, 29, 72, 0.30)' }
];

// 4 Paquetes enfocados en captación directa a WhatsApp (listos para Chatbot)
const TEAM_PLANS = [
  {
    code: 'PLAN-1',
    team: '1 persona',
    title: 'Emprendedor',
    ideal: 'Ideal para negocios por Instagram, TikTok y WhatsApp.',
    price: '1,400',
    features: [
      'Enlace profesional para bio de IG y TikTok',
      'Catálogo en vivo con Google Sheets y Drive',
      'Botones con pedido prellenado a WhatsApp',
      'Cero rentas mensuales de servidor'
    ]
  },
  {
    code: 'PLAN-2',
    team: '2 a 3 integrantes',
    popular: true,
    title: 'Negocio & Equipo',
    ideal: 'Para equipos que comparten pedidos, stock y atención.',
    price: '2,400',
    features: [
      'Todo lo del Plan Emprendedor',
      'Panel privado para subir fotos y precios desde celular',
      'Hoja maestra compartida de clientes y pedidos',
      'Capacitación práctica para tu equipo'
    ]
  },
  {
    code: 'PLAN-3',
    team: '4 a 6 integrantes',
    title: 'Operación & Flujos',
    ideal: 'Negocios con ventas diarias que necesitan automatización.',
    price: '3,900',
    features: [
      'Todo lo del Plan Negocio + mini CRM',
      'Automatizaciones de avisos y flujos (n8n / Apps Script)',
      'Tablero visual de ventas e inventario en vivo',
      '30 días de soporte prioritario'
    ]
  },
  {
    code: 'PLAN-4',
    team: '6+ integrantes',
    title: 'Empresa a Medida',
    ideal: 'Múltiples áreas, alto volumen y reportes gerenciales.',
    price: '6,500',
    features: [
      'Arquitectura web y base de datos a tu medida',
      'Dashboards gerenciales en Looker Studio / BI',
      'Flujos multi-área y control de inventario',
      'Escalabilidad modular y acompañamiento técnico'
    ]
  }
];

const ICON_SUN = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>';
const ICON_MOON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
const ICON_CHECK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';

let catalogoGlobal = [];
let cardRotatorTimer = null;

const linkWhatsApp = (msg) => `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
const esc = (s) => String(s || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

// ================= CAMBIO DE COLOR ENTRE PÁGINAS =================
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

// ================= SALUDO SEGÚN LA HORA =================
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
    phrases = ['Buen momento para ordenar tus ventas.', 'Haz que tu enlace de IG y TikTok venda solo.', 'Arranca el día automatizando tu negocio.'];
  } else if (hour >= 12 && hour < 19) {
    greeting = 'Buenas tardes';
    phrases = ['Deja de responder “precio” uno por uno.', 'Sistemas claros para negocios que crecen.', 'Tu catálogo en línea listo en días.'];
  } else if (hour >= 19 && hour < 24) {
    greeting = 'Buenas noches';
    phrases = ['Mientras descansas, tu página sigue captando clientes.', 'Buena hora para dar el siguiente salto con tu negocio.', 'Tu catálogo disponible 24/7 sin mensualidades.'];
  } else {
    greeting = '¿Trabajando de madrugada?';
    phrases = ['Tu negocio merece un sistema que trabaje contigo 24/7.', 'Las mejores ideas nacen a esta hora.'];
  }
  timeEl.textContent = greeting;
  phraseEl.textContent = phrases[Math.floor(Math.random() * phrases.length)];
}

// ================= TEMA Y WHATSAPP =================
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.innerHTML = theme === 'dark' ? ICON_SUN : ICON_MOON;
}

function initTheme() {
  applyTheme(localStorage.getItem('zenda_theme') || 'light');
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    localStorage.setItem('zenda_theme', next);
    applyTheme(next);
  });
}

function updateGeneralWhatsApp() {
  const wa = linkWhatsApp('Hola Zenda Studio, quiero información sobre sus sistemas web y paquetes.');
  document.querySelectorAll('.js-wa-general').forEach(el => { el.href = wa; });
}

// ================= 4 PAQUETES -> DIRECTO A WHATSAPP =================
function renderTeamPlans() {
  const container = document.getElementById('plans-grid');
  if (!container) return;

  container.innerHTML = TEAM_PLANS.map(p => {
    const msg = `Hola Zenda Studio, me interesa el [${p.code}: ${p.title} · ${p.team} | ${CONFIG.MONEDA}${p.price}]. ¿Me brindan más información?`;
    const waUrl = linkWhatsApp(msg);
    return `
      <article class="plan-card ${p.popular ? 'popular' : ''}">
        <div class="plan-top">
          <span class="plan-team">${esc(p.team)}</span>
          ${p.popular ? '<span class="plan-popular-tag">Recomendado</span>' : ''}
        </div>
        <h3>${esc(p.title)}</h3>
        <p class="plan-for">${esc(p.ideal)}</p>
        <div class="plan-price-row">
          <div class="plan-price">${CONFIG.MONEDA}${esc(p.price)}</div>
          <div class="plan-note">Pago único · 50% al iniciar</div>
        </div>
        <ul class="feature-list">
          ${p.features.map(f => `<li>${ICON_CHECK}<span>${esc(f)}</span></li>`).join('')}
        </ul>
        <a href="${waUrl}" target="_blank" rel="noopener" class="btn ${p.popular ? 'btn-primary' : 'btn-secondary'} btn-full">
          Cotizar por WhatsApp &rarr;
        </a>
      </article>`;
  }).join('');
}

// ================= AMIGUITO TRANSLÚCIDO INTERACTIVO =================
const BOT_TIPS = [
  { tag: 'IG y TikTok', text: 'Un enlace claro con precios y catálogo directo a WhatsApp duplica tus cierres de venta.' },
  { tag: '1 Persona', text: 'Si trabajas solo, deja que tu página muestre fotos y precios mientras tú cierras ventas.' },
  { tag: '2–3 Personas', text: 'Con una base en Sheets compartida tu equipo nunca vuelve a perder un pedido.' },
  { tag: 'Ahorro', text: 'Al vivir en tus cuentas de Google y GitHub te ahorras rentas mensuales de servidores.' },
  { tag: '50 / 50', text: 'Inicias con el 50% y liquidas el resto cuando ves tu sistema funcionando en vivo.' },
  { tag: 'Escalable', text: 'Empieza simple hoy y conecta automatizaciones o chatbots cuando tu volumen crezca.' }
];

const DODGE_LINES = [
  '¡Casi! Así de rápida carga tu futura web.',
  '¡Uy! No me atrapes a mí, atrapa más clientes.'
];

function initZendaBot() {
  const bot = document.getElementById('zenda-bot');
  const orb = document.getElementById('bot-orb');
  const bubble = document.getElementById('bot-bubble');
  const closeBtn = document.getElementById('bot-close');
  const nextBtn = document.getElementById('bot-next');
  const eyeL = document.getElementById('eye-l');
  const eyeR = document.getElementById('eye-r');
  const mouth = document.getElementById('bot-mouth');
  if (!bot || !orb) return;

  let idx = Math.floor(Math.random() * BOT_TIPS.length);
  let dismissed = false;

  const say = (tag, text, mood = 'normal') => {
    bubble.hidden = false; dismissed = false;
    document.getElementById('bot-tag').textContent = tag;
    document.getElementById('bot-msg').textContent = text;
    if (mood === 'happy') {
      mouth.setAttribute('d', 'M12 21 Q18 28 24 21');
      orb.classList.remove('excited'); void orb.offsetWidth; orb.classList.add('excited');
      setTimeout(() => mouth.setAttribute('d', 'M13 22.5 Q18 26.5 23 22.5'), 1300);
    } else if (mood === 'surprised') {
      mouth.setAttribute('d', 'M15.5 23 Q18 25.5 20.5 23');
      setTimeout(() => mouth.setAttribute('d', 'M13 22.5 Q18 26.5 23 22.5'), 650);
    }
  };

  // En móvil aparece suave a los 3s para no tapar el título
  if (window.innerWidth <= 640) {
    bubble.hidden = true;
    setTimeout(() => { if (!dismissed) bubble.hidden = false; }, 3000);
  }
  document.getElementById('bot-tag').textContent = BOT_TIPS[idx].tag;
  document.getElementById('bot-msg').textContent = BOT_TIPS[idx].text;

  const nextTip = () => { idx = (idx + 1) % BOT_TIPS.length; say(BOT_TIPS[idx].tag, BOT_TIPS[idx].text); };
  let timer = setInterval(() => { if (!dismissed && !bubble.hidden) nextTip(); }, 9500);
  nextBtn.onclick = () => { nextTip(); clearInterval(timer); timer = setInterval(() => { if (!dismissed && !bubble.hidden) nextTip(); }, 9500); };

  const lookAt = (x, y) => {
    const r = orb.getBoundingClientRect();
    const ang = Math.atan2(y - (r.top + r.height / 2), x - (r.left + r.width / 2));
    const d = Math.min(2.2, Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2)) / 90);
    eyeL.setAttribute('cx', (12.5 + Math.cos(ang) * d).toFixed(2));
    eyeL.setAttribute('cy', (14.5 + Math.sin(ang) * d).toFixed(2));
    eyeR.setAttribute('cx', (23.5 + Math.cos(ang) * d).toFixed(2));
    eyeR.setAttribute('cy', (14.5 + Math.sin(ang) * d).toFixed(2));
  };
  document.addEventListener('mousemove', e => lookAt(e.clientX, e.clientY));
  document.addEventListener('touchmove', e => { if (e.touches[0]) lookAt(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });

  let dodges = 0, lastMove = 0;
  const isTouch = window.matchMedia('(hover: none)').matches;
  const moves = isTouch ? [{ x: -54, y: -26 }, { x: -14, y: -70 }] : [{ x: -100, y: -32 }, { x: -20, y: -104 }];

  const dodge = () => {
    const now = Date.now();
    if (now - lastMove < 350) return;
    lastMove = now;
    bot.style.transform = `translate(${moves[dodges].x}px, ${moves[dodges].y}px)`;
    say('¡Ups!', DODGE_LINES[dodges], 'surprised');
    dodges++;
  };

  orb.addEventListener('mouseenter', () => { if (!isTouch && dodges < 2) dodge(); });
  orb.addEventListener('click', () => {
    if (isTouch && dodges < 2) { dodge(); return; }
    bot.style.transform = 'translate(0, 0)';
    dodges = 2;
    say('¡Me atrapaste!', 'Escríbenos directo en WhatsApp o Instagram y armamos tu proyecto.', 'happy');
  });
  closeBtn.onclick = () => { bubble.hidden = true; dismissed = true; bot.style.transform = 'translate(0, 0)'; dodges = 0; };
}

// ================= CATÁLOGO DESDE GOOGLE SHEETS -> WHATSAPP =================
function renderMediaHTML(m, alt) {
  if (!m || !m.url) return '<div style="height:100%;display:grid;place-items:center;color:var(--text-muted);font-size:0.84rem;">Sin vista previa</div>';
  if (m.type === 'video') return `<video src="${m.url}" autoplay loop muted playsinline></video>`;
  if (m.type === 'drive_video') return `<iframe src="${m.url}" allow="autoplay"></iframe>`;
  return `<img src="${m.url}" alt="${esc(alt)}" loading="lazy" />`;
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
      updateGeneralWhatsApp();
      renderTeamPlans();
    }
    catalogoGlobal = json.data || [];
    if (document.getElementById('catalogo-grid')) {
      renderCatalogFilters(catalogoGlobal);
      renderCatalog(catalogoGlobal);
    }
  } catch (err) {
    console.error(err);
    const grid = document.getElementById('catalogo-grid');
    if (grid) grid.innerHTML = '<div class="empty-state">No se pudo conectar con Google Sheets. Recarga la página.</div>';
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
    renderCatalog(res);
  };
  bar.querySelectorAll('.tag-pill').forEach(b => {
    b.onclick = () => { bar.querySelectorAll('.tag-pill').forEach(x => x.classList.remove('active')); b.classList.add('active'); filtrar(); };
  });
  document.getElementById('search-input')?.addEventListener('input', filtrar);
}

function renderCatalog(items) {
  const grid = document.getElementById('catalogo-grid');
  if (!grid) return;
  clearInterval(cardRotatorTimer);
  if (!items.length) { grid.innerHTML = '<div class="empty-state">No hay servicios en esta categoría.</div>'; return; }

  grid.innerHTML = items.map(item => {
    const gal = item.galeria && item.galeria.length ? item.galeria : [{ type: 'image', url: item.imagen_url }];
    const feats = String(item.entregables || '').split('|').filter(Boolean);
    const featured = String(item.destacado).toUpperCase() === 'SI';
    const dots = gal.length > 1 ? `<div class="media-dots">${gal.map((_, i) => `<span class="media-dot ${i === 0 ? 'active' : ''}"></span>`).join('')}</div>` : '';
    const waUrl = linkWhatsApp(`Hola Zenda Studio, me interesa el servicio [${item.nombre} | ${CONFIG.MONEDA}${item.precio}]. ¿Me dan más detalles?`);

    return `
      <article class="product-card ${featured ? 'featured' : ''}" data-id="${esc(item.id)}" data-slide="0">
        <div class="card-media" data-modal="${esc(item.id)}">
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
            <a href="${waUrl}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">Pedir por WhatsApp &rarr;</a>
            <button type="button" class="btn btn-secondary btn-sm" data-modal="${esc(item.id)}">Ver</button>
          </div>
        </div>
      </article>`;
  }).join('');

  grid.querySelectorAll('[data-modal]').forEach(el => el.onclick = () => abrirModal(el.dataset.modal));

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

function abrirModal(id) {
  const item = catalogoGlobal.find(i => String(i.id) === String(id));
  const modal = document.getElementById('service-modal');
  if (!item || !modal) return;
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
  document.getElementById('modal-wa-btn').href = linkWhatsApp(`Hola Zenda Studio, me interesa el servicio [${item.nombre} | ${CONFIG.MONEDA}${item.precio}]. ¿Me dan más detalles?`);
  modal.hidden = false;
}

function initModal() {
  const modal = document.getElementById('service-modal');
  if (!modal) return;
  const close = () => { modal.hidden = true; document.getElementById('modal-media').innerHTML = ''; };
  document.getElementById('modal-close')?.addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
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
  initTheme();
  initGreeting();
  updateGeneralWhatsApp();
  renderTeamPlans();
  initZendaBot();
  initModal();
  initSecretAccess();
  cargarBackend();
});