const CONFIG = {
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzBQgX8U0CzNe_zH8slUUAgDPMlQG3o0TidWUQ8cX2I88tEGSa6-4zsZet6Y-bqqd12GQ/exec',
  WHATSAPP_NUMBER: '50258798301',
  INSTAGRAM_URL: 'https://www.instagram.com/zenda.studio.gt/',
  MONEDA: 'Q'
};

// Paletas curadas: cada persona que entra recibe un acento diferente
const PALETTES = [
  { name: 'Cobalto',   hex: '#0066ff', soft: 'rgba(0, 102, 255, 0.12)',  glow: 'rgba(0, 102, 255, 0.36)' },
  { name: 'Bermellón', hex: '#ff4d00', soft: 'rgba(255, 77, 0, 0.12)',   glow: 'rgba(255, 77, 0, 0.36)' },
  { name: 'Esmeralda', hex: '#059669', soft: 'rgba(5, 150, 105, 0.12)',  glow: 'rgba(5, 150, 105, 0.36)' },
  { name: 'Violeta',   hex: '#7c3aed', soft: 'rgba(124, 58, 237, 0.12)', glow: 'rgba(124, 58, 237, 0.36)' },
  { name: 'Carmesí',   hex: '#e11d48', soft: 'rgba(225, 29, 72, 0.12)',  glow: 'rgba(225, 29, 72, 0.36)' },
  { name: 'Cian',      hex: '#0891b2', soft: 'rgba(8, 145, 178, 0.12)',  glow: 'rgba(8, 145, 178, 0.36)' },
  { name: 'Ámbar',     hex: '#d97706', soft: 'rgba(217, 119, 6, 0.12)',  glow: 'rgba(217, 119, 6, 0.36)' }
];

const ICON_SUN = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>';
const ICON_MOON = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
const ICON_CHECK = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';

let catalogoGlobal = [];
let cart = JSON.parse(localStorage.getItem('zenda_cart') || '[]');
let activeModalItem = null;
let currentView = 'grid';
let cardRotatorTimer = null;
let currentPaletteIdx = 0;

const linkWhatsApp = (msg) => `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
const parsePrice = (val) => parseFloat(String(val || '0').replace(/,/g, '').replace(/[^\d.]/g, '')) || 0;
const formatMoney = (num) => `${CONFIG.MONEDA}${Number(num || 0).toLocaleString('en-US')}`;
const esc = (s) => String(s || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.hidden = false;
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => { t.hidden = true; }, 2500);
}

// ================= COLOR ALEATORIO POR VISITA =================
function applyPalette(idx) {
  currentPaletteIdx = idx;
  const p = PALETTES[idx];
  const root = document.documentElement.style;
  root.setProperty('--accent', p.hex);
  root.setProperty('--accent-soft', p.soft);
  root.setProperty('--accent-glow', p.glow);
  sessionStorage.setItem('zenda_last_palette', String(idx));
  const label = document.getElementById('palette-name');
  if (label) label.textContent = `Edición ${p.name}`;
}

function initRandomPalette() {
  const last = Number(sessionStorage.getItem('zenda_last_palette'));
  let next = Math.floor(Math.random() * PALETTES.length);
  if (!Number.isNaN(last) && PALETTES.length > 1 && next === last) {
    next = (next + 1 + Math.floor(Math.random() * (PALETTES.length - 1))) % PALETTES.length;
  }
  applyPalette(next);

  document.getElementById('palette-chip')?.addEventListener('click', () => {
    applyPalette((currentPaletteIdx + 1) % PALETTES.length);
    botSay('ESTILO', `¡Nuevo color activado: ${PALETTES[currentPaletteIdx].name}! Cada visitante vive una edición distinta.`, 'happy');
  });
}

// ================= SALUDO DINÁMICO + RELOJ GUATEMALA =================
function initGreeting() {
  let hour = new Date().getHours();
  try {
    const gtHour = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Guatemala', hour: 'numeric', hour12: false }).format(new Date());
    hour = Number(gtHour);
  } catch {}

  let greeting = 'Hola';
  let phrases = [];

  if (hour >= 5 && hour < 12) {
    greeting = 'Buenos días';
    phrases = [
      'Buen momento para dejar de llevar todo en libretas.',
      'Hoy es un gran día para automatizar tu negocio.',
      'Arranquemos el día haciendo que tu web trabaje por ti.',
      'Café listo. ¿Qué sistema construimos hoy?'
    ];
  } else if (hour >= 12 && hour < 19) {
    greeting = 'Buenas tardes';
    phrases = [
      'Si pasas la tarde respondiendo precios a mano, te urge un sistema.',
      'Qué bueno verte por aquí — explora lo que podemos armar para tu marca.',
      'Menos caos operativo, más tiempo para cerrar ventas.',
      'Cada visita aquí cambia de color. Tu sistema también puede destacar así.'
    ];
  } else if (hour >= 19 && hour < 24) {
    greeting = 'Buenas noches';
    phrases = [
      'Mientras otros cierran, una buena tienda en línea sigue vendiendo.',
      'Buena hora para planear el siguiente salto de tu negocio.',
      'Qué gusto recibirte. Mira lo que un sistema ordenado hace por ti.',
      'Tu negocio no debería detenerse cuando apagas el teléfono.'
    ];
  } else {
    greeting = '¿Trasnochando con una idea?';
    phrases = [
      'Las mejores empresas nacen a esta hora. Hagámosla realidad.',
      'A esta hora tu web debería estar captando clientes sola.'
    ];
  }

  document.getElementById('greeting-time').textContent = greeting;
  document.getElementById('greeting-phrase').textContent = phrases[Math.floor(Math.random() * phrases.length)];

  const clockEl = document.getElementById('hero-clock');
  const updateClock = () => {
    try {
      const t = new Intl.DateTimeFormat('es-GT', { timeZone: 'America/Guatemala', hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date());
      clockEl.textContent = `GUATEMALA · ${t}`;
    } catch { clockEl.textContent = 'GUATEMALA'; }
  };
  updateClock();
  setInterval(updateClock, 20000);
}

// ================= EL AMIGUITO SÚPER INTERACTIVO =================
const BOT_TIPS = [
  { tag: 'BENEFICIO', text: 'Un buen sistema vende, cotiza y ordena tus pedidos 24/7 sin que tengas que responder todo manual.' },
  { tag: 'CONSEJO',   text: 'El 80% de tus clientes entra desde Instagram en celular. Si tu enlace tarda o confunde, se van con la competencia.' },
  { tag: 'AHORRO',    text: 'Con Sheets + GitHub + Drive evitas pagar Q300–Q800 mensuales en plataformas que ni aprovechas al 100%.' },
  { tag: 'CONSEJO',   text: 'Mostrar precios y entregables claros filtra a los curiosos y te trae clientes ya listos para comprar.' },
  { tag: 'BENEFICIO', text: '¿Tienes varios productos o servicios? Con un panel privado subes fotos y cambias precios en 15 segundos.' },
  { tag: 'TIP PRO',   text: 'Conectar tu formulario directo a WhatsApp y una hoja de cálculo evita que pierdas un solo prospecto.' },
  { tag: 'BENEFICIO', text: 'Un tablero de datos en tiempo real te dice qué servicio te deja más ganancia sin hacer cuentas a mano.' },
  { tag: 'CONSEJO',   text: 'No necesitas un sitio gigante de 20 páginas; necesitas una tienda rápida, clara y enfocada en cerrar ventas.' },
  { tag: 'DATO',      text: 'En Zenda inicias con el 50% y liquidas el resto cuando ya ves tu sistema funcionando en vivo.' },
  { tag: 'CONSEJO',   text: 'Si ya vendes por WhatsApp, un carrito que arme el pedido ordenado reduce los errores y acelera el pago.' },
  { tag: 'SECRETO',   text: 'Cada persona que entra a esta página ve un color distinto. Imagina ese nivel de detalle en tu propia marca.' },
  { tag: 'BENEFICIO', text: 'Automatizar confirmaciones y registros te devuelve horas cada semana para enfocarte en crecer.' },
  { tag: 'TIP PRO',   text: 'Haz clic en cualquier paquete del catálogo para abrir su galería completa y ver todos los entregables.' },
  { tag: 'CONSEJO',   text: 'Una imagen limpia y seria te permite cobrar lo que realmente vale tu trabajo.' },
  { tag: 'CONTACTO',  text: '¿Dudas sobre qué paquete elegir? Escríbenos por WA o IG y te asesoramos sin compromiso.' }
];

const DODGE_LINES = [
  '¡Casi! Así de rápida carga tu futura página web.',
  '¡Uy! No me atrapes a mí, atrapa más clientes.',
  '¡Tercera y última! Ok, me rindo... dale clic o pide otro consejo.'
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
    mouth.setAttribute('d', 'M11.5 21 Q18 28.5 24.5 21');
    orb.classList.remove('excited');
    void orb.offsetWidth;
    orb.classList.add('excited');
    setTimeout(() => mouth.setAttribute('d', 'M12.5 22.5 Q18 26.8 23.5 22.5'), 1600);
  } else if (mood === 'surprised') {
    mouth.setAttribute('d', 'M15.5 23 Q18 25.5 20.5 23');
    setTimeout(() => mouth.setAttribute('d', 'M12.5 22.5 Q18 26.8 23.5 22.5'), 700);
  } else if (mood === 'wink') {
    mouth.setAttribute('d', 'M13 22 Q18.5 26 24 21.5');
  }
}

function nextBotTip() {
  botIdx = (botIdx + 1) % BOT_TIPS.length;
  const item = BOT_TIPS[botIdx];
  botSay(item.tag, item.text, 'normal');
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

  // Primer mensaje aleatorio
  const first = BOT_TIPS[botIdx];
  document.getElementById('bot-tag').textContent = first.tag;
  document.getElementById('bot-msg').textContent = first.text;

  // Rotación automática cada 9 segundos
  botTimer = setInterval(() => {
    if (!botDismissed) nextBotTip();
  }, 9000);

  nextBtn.addEventListener('click', () => {
    nextBotTip();
    clearInterval(botTimer);
    botTimer = setInterval(() => { if (!botDismissed) nextBotTip(); }, 9000);
  });

  // Ojos que siguen el cursor
  document.addEventListener('mousemove', (e) => {
    const r = orb.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const angle = Math.atan2(dy, dx);
    const dist = Math.min(2.4, Math.hypot(dx, dy) / 85);
    const ox = Math.cos(angle) * dist;
    const oy = Math.sin(angle) * dist;
    eyeL.setAttribute('cx', (12.5 + ox).toFixed(2));
    eyeL.setAttribute('cy', (14.5 + oy).toFixed(2));
    eyeR.setAttribute('cx', (23.5 + ox).toFixed(2));
    eyeR.setAttribute('cy', (14.5 + oy).toFixed(2));
  });

  // Esquive juguetón (3 veces) en escritorio
  let dodgeCount = 0;
  let lastDodge = 0;
  const offsets = [{ x: -120, y: -42 }, { x: -30, y: -135 }, { x: 0, y: 0 }];

  orb.addEventListener('mouseenter', () => {
    if (window.innerWidth < 768) return;
    const now = Date.now();
    if (dodgeCount < 3 && now - lastDodge > 360) {
      lastDodge = now;
      const pos = offsets[dodgeCount];
      bot.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
      botSay('¡UPS!', DODGE_LINES[dodgeCount], 'surprised');
      dodgeCount++;
    }
  });

  orb.addEventListener('click', () => {
    bot.style.transform = 'translate(0, 0)';
    botSay('¡ME ATRAPASTE!', 'Dale a "Otro consejo" para más tips, o escríbenos directo en WA / IG.', 'happy');
  });

  closeBtn.addEventListener('click', () => {
    bubble.hidden = true;
    botDismissed = true;
    bot.style.transform = 'translate(0, 0)';
    dodgeCount = 0;
  });

  // Reacciones contextuales al hacer scroll por secciones
  const seen = new Set();
  if ('IntersectionObserver' in window) {
    const secIO = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting || botDismissed || seen.has(e.target.id)) return;
        seen.add(e.target.id);
        if (e.target.id === 'catalogo') {
          botSay('CATÁLOGO', 'Puedes cambiar entre vista de cuadrícula o lista, y abrir cada paquete para ver su galería.', 'wink');
        } else if (e.target.id === 'cotizar') {
          botSay('A MEDIDA', '¿Tu proyecto tiene requisitos especiales? Llena este formulario y se abre directo en nuestro WhatsApp.', 'wink');
        }
      });
    }, { threshold: 0.3 });
    ['catalogo', 'cotizar'].forEach(id => {
      const el = document.getElementById(id);
      if (el) secIO.observe(el);
    });
  }
}

// ================= TEMA, CONTACTOS Y REVEAL =================
function renderMediaHTML(m, alt) {
  if (!m || !m.url) return '<div style="height:100%;display:grid;place-items:center;color:var(--text-muted);font-size:0.85rem;">Sin imagen</div>';
  if (m.type === 'video') return `<video src="${m.url}" autoplay loop muted playsinline></video>`;
  if (m.type === 'drive_video') return `<iframe src="${m.url}" allow="autoplay"></iframe>`;
  return `<img src="${m.url}" alt="${esc(alt)}" loading="lazy" />`;
}

function updateContactLinks() {
  const waMsg = linkWhatsApp('Hola Zenda Studio, me interesa conocer sus paquetes y soluciones digitales.');
  ['hero-whatsapp', 'direct-whatsapp', 'footer-whatsapp', 'bot-wa'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.href = waMsg;
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.innerHTML = theme === 'dark' ? ICON_SUN : ICON_MOON;
}

function initTheme(def = 'light') {
  applyTheme(localStorage.getItem('zenda_theme') || def);
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    localStorage.setItem('zenda_theme', next);
    applyTheme(next);
    botSay('MODO ' + (next === 'dark' ? 'OSCURO' : 'CLARO'), next === 'dark' ? 'Modo oscuro activado. Tus ojos lo agradecen.' : 'Modo claro activado. Limpio y nítido.', 'happy');
  });
}

function aplicarConfigRemota(cfg) {
  if (!cfg) return;
  const cleanWa = String(cfg.whatsapp || '').replace(/\D/g, '');
  if (cleanWa && cleanWa !== '50200000000') CONFIG.WHATSAPP_NUMBER = cleanWa;
  // Nota: el color NO se sobrescribe desde Config porque es aleatorio para cada visitante
  if (cfg.hero_titulo) document.getElementById('hero-title').innerHTML = `${esc(cfg.hero_titulo)}<span class="text-accent">.</span>`;
  if (cfg.hero_subtitulo) document.getElementById('hero-subtitle').textContent = cfg.hero_subtitulo;
  if (cfg.banner_promo && cfg.banner_promo.trim()) {
    const bar = document.getElementById('promo-bar');
    bar.textContent = cfg.banner_promo;
    bar.hidden = false;
  }
  if (cfg.tema_default && !localStorage.getItem('zenda_theme')) applyTheme(cfg.tema_default === 'dark' ? 'dark' : 'light');
  updateContactLinks();
}

function initReveal() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in-view'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); } });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

// ================= CATÁLOGO =================
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
    grid.innerHTML = '<div class="empty-state">No se pudo conectar con el catálogo. Recarga la página.</div>';
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
    btn.addEventListener('click', () => {
      container.querySelectorAll('.tag-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filtrar();
    });
  });
  document.getElementById('search-input')?.addEventListener('input', filtrar);

  document.querySelectorAll('.view-switch button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.view-switch button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentView = btn.dataset.view;
      document.getElementById('catalogo-grid').classList.toggle('view-list', currentView === 'list');
    });
  });
}

function renderCatalogo(items) {
  const grid = document.getElementById('catalogo-grid');
  grid.classList.toggle('view-list', currentView === 'list');
  clearInterval(cardRotatorTimer);

  if (!items.length) {
    grid.innerHTML = '<div class="empty-state">No hay paquetes que coincidan con tu búsqueda.</div>';
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
            <button type="button" class="btn btn-primary btn-sm" data-action="add" data-id="${esc(item.id)}">Agregar al carrito</button>
            <button type="button" class="btn btn-secondary btn-sm" data-action="modal" data-id="${esc(item.id)}">Ver detalle</button>
          </div>
        </div>
      </article>`;
  }).join('');

  grid.querySelectorAll('[data-action="add"]').forEach(b => b.addEventListener('click', () => addToCart(b.dataset.id)));
  grid.querySelectorAll('[data-action="modal"]').forEach(b => b.addEventListener('click', () => abrirModal(b.dataset.id)));

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

function addToCart(id) {
  const item = catalogoGlobal.find(i => String(i.id) === String(id));
  if (!item) return;
  const ex = cart.find(c => String(c.id) === String(id));
  if (ex) ex.qty += 1;
  else cart.push({ id: item.id, nombre: item.nombre, precio: parsePrice(item.precio), qty: 1 });
  saveCart();
  showToast(`Agregado al carrito: ${item.nombre}`);
  botSay('¡BUENA ELECCIÓN!', `"${item.nombre}" ya está en tu carrito. Puedes iniciar con 50% de anticipo.`, 'happy');
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
  document.getElementById('cart-count').textContent = cart.reduce((s, i) => s + i.qty, 0);
  const list = document.getElementById('cart-items');
  const area = document.getElementById('cart-checkout-area');
  if (!cart.length) {
    list.innerHTML = '<div class="empty-state" style="padding:32px 16px;">Tu carrito está vacío.</div>';
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
          <strong style="font-size:0.92rem; display:block;">${esc(c.nombre)}</strong>
          <span style="font-size:0.82rem; color:var(--accent); font-weight:600;">${formatMoney(c.precio)}</span>
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
  document.getElementById('cart-open-btn').addEventListener('click', openCart);
  document.getElementById('cart-close-btn').addEventListener('click', closeCart);
  document.getElementById('cart-overlay').addEventListener('click', e => { if (e.target.id === 'cart-overlay') closeCart(); });

  document.getElementById('checkout-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!cart.length) return;
    const btn = document.getElementById('btn-checkout');
    const st = document.getElementById('chk-status');
    btn.disabled = true; btn.textContent = 'Confirmando orden...'; st.textContent = '';

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
      st.innerHTML = `Orden <strong>${esc(orderId)}</strong> registrada. <a href="${wa}" target="_blank" style="color:var(--accent)">Abrir WhatsApp &rarr;</a> · <a href="${CONFIG.INSTAGRAM_URL}" target="_blank" style="color:var(--accent)">Instagram &nearr;</a>`;
      cart = []; saveCart(); e.target.reset();
      showToast(`Pedido ${orderId} confirmado`);
      window.open(wa, '_blank', 'noopener');
    } catch {
      st.textContent = 'Error de conexión. Escríbenos directo por WhatsApp o Instagram.';
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
    thumbs.querySelectorAll('.modal-thumb').forEach(b => b.addEventListener('click', () => setMain(Number(b.dataset.i))));
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
  document.getElementById('modal-close').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  document.getElementById('modal-add-btn').addEventListener('click', () => { if (activeModalItem) { close(); addToCart(activeModalItem.id); } });
}

function poblarSelectPaquetes(items) {
  const sel = document.getElementById('paquete');
  sel.innerHTML = '<option value="Proyecto a medida">Proyecto a medida</option>';
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
    const payload = {
      action: 'quote',
      nombre: document.getElementById('nombre').value.trim(),
      telefono: document.getElementById('telefono').value.trim(),
      correo: document.getElementById('correo').value.trim(),
      paquete: document.getElementById('paquete').value,
      presupuesto: document.getElementById('presupuesto').value,
      mensaje: document.getElementById('mensaje').value.trim()
    };
    try {
      await fetch(CONFIG.APPS_SCRIPT_URL, { method: 'POST', body: JSON.stringify(payload) });
      const wa = linkWhatsApp(`Hola Zenda Studio, envié una cotización:\n• Nombre: ${payload.nombre}\n• Servicio: ${payload.paquete}\n• Presupuesto: ${payload.presupuesto}\n• Detalle: ${payload.mensaje}`);
      st.innerHTML = `Solicitud registrada. <a href="${wa}" target="_blank" style="color:var(--accent)">Abrir WhatsApp &rarr;</a> · <a href="${CONFIG.INSTAGRAM_URL}" target="_blank" style="color:var(--accent)">Instagram &nearr;</a>`;
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
  initRandomPalette();
  initGreeting();
  initTheme('light');
  updateContactLinks();
  initReveal();
  initZendaBot();
  initCart();
  initModal();
  initQuoteForm();
  initSecretAccess();
  cargarCatalogo();
});