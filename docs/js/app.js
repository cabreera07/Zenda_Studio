const CONFIG = {
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzBQgX8U0CzNe_zH8slUUAgDPMlQG3o0TidWUQ8cX2I88tEGSa6-4zsZet6Y-bqqd12GQ/exec',
  WHATSAPP_NUMBER: '50200000000',
  STUDIO_EMAIL: 'hola@zendastudio.com',
  MONEDA: 'Q'
};

let catalogoGlobal = [];
let activeModalItem = null;

const linkWhatsApp = (msg) => `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
}

// Reloj en vivo de Guatemala
function startLiveClock() {
  const el = document.getElementById('live-clock');
  if (!el) return;
  const update = () => {
    try {
      const time = new Intl.DateTimeFormat('es-GT', {
        timeZone: 'America/Guatemala', hour: '2-digit', minute: '2-digit', hour12: false
      }).format(new Date());
      el.textContent = `GUA ${time}`;
    } catch { el.textContent = 'ONLINE'; }
  };
  update();
  setInterval(update, 15000);
}

// Modo Oscuro / Claro
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const icon = document.getElementById('theme-icon');
  if (icon) icon.textContent = theme === 'dark' ? '☀' : '☾';
}

function initTheme(defaultTheme = 'dark') {
  const saved = localStorage.getItem('zenda_theme');
  applyTheme(saved || defaultTheme);
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('zenda_theme', next);
    applyTheme(next);
    showToast(next === 'dark' ? 'Modo oscuro activado' : 'Modo claro activado');
  });
}

// Aplica configuración dinámica desde la pestaña Config de Google Sheets
function aplicarConfigRemota(cfg) {
  if (!cfg || typeof cfg !== 'object') return;
  if (cfg.whatsapp) CONFIG.WHATSAPP_NUMBER = String(cfg.whatsapp).replace(/\D/g, '');
  if (cfg.correo) CONFIG.STUDIO_EMAIL = cfg.correo;
  if (cfg.moneda) CONFIG.MONEDA = cfg.moneda;
  if (cfg.color_acento) document.documentElement.style.setProperty('--accent', cfg.color_acento);
  if (cfg.hero_titulo) {
    document.getElementById('hero-title').innerHTML = `${cfg.hero_titulo}<span class="text-accent">.</span>`;
  }
  if (cfg.hero_subtitulo) {
    document.getElementById('hero-subtitle').textContent = cfg.hero_subtitulo;
  }
  if (cfg.banner_promo && String(cfg.banner_promo).trim() !== '') {
    document.getElementById('promo-text').textContent = cfg.banner_promo;
    document.getElementById('promo-bar').hidden = false;
  }
  if (String(cfg.mostrar_proceso).toUpperCase() === 'NO') {
    document.getElementById('proceso').style.display = 'none';
  }
  if (cfg.tema_default && !localStorage.getItem('zenda_theme')) {
    applyTheme(cfg.tema_default === 'light' ? 'light' : 'dark');
  }
  initWhatsAppLinks();
}

function initWhatsAppLinks() {
  const msg = 'Hola Zenda Studio, me interesa conversar sobre una solución digital.';
  ['nav-whatsapp', 'direct-whatsapp'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.href = linkWhatsApp(msg);
  });
}

function renderMediaHTML(url, alt) {
  const clean = String(url || '').trim();
  if (clean.endsWith('.mp4') || clean.endsWith('.webm')) {
    return `<video src="${clean}" autoplay loop muted playsinline></video>`;
  }
  return `<img src="${clean}" alt="${alt}" loading="lazy" />`;
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
    grid.innerHTML = '<div class="loading-state mono-xs">ERROR AL CONECTAR CON SHEETS — RECARGA LA PÁGINA</div>';
    console.error(err);
  }
}

function renderFiltros(items) {
  const container = document.getElementById('filtros-categorias');
  const categorias = ['Todos', ...new Set(items.map(i => i.categoria).filter(Boolean))];
  container.innerHTML = categorias.map((cat, idx) =>
    `<button class="filter-btn ${idx === 0 ? 'active' : ''}" data-cat="${cat}">${cat}</button>`
  ).join('');
  container.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      renderCatalogo(cat === 'Todos' ? catalogoGlobal : catalogoGlobal.filter(i => i.categoria === cat));
    });
  });
}

function renderCatalogo(items) {
  const grid = document.getElementById('catalogo-grid');
  if (!items.length) {
    grid.innerHTML = '<div class="loading-state mono-xs">NO HAY SERVICIOS EN ESTA CATEGORÍA</div>';
    return;
  }

  // Si hay número impar >= 3 (ej. 5 ejemplos), la primera tarjeta abarca 2 columnas (Bento perfecto)
  const useWideLead = items.length >= 3 && items.length % 2 === 1;

  grid.innerHTML = items.map((item, idx) => {
    const entregables = String(item.entregables || '').split('|').filter(Boolean);
    const esDestacado = String(item.destacado).toUpperCase() === 'SI';
    const isWide = useWideLead && idx === 0;
    const waLink = linkWhatsApp(`Hola Zenda Studio, me interesa "${item.nombre}" (${CONFIG.MONEDA}${item.precio}).`);

    return `
      <article class="bento-card ${esDestacado ? 'card-featured' : ''} ${isWide ? 'card-wide' : ''}" data-idx="${idx}">
        <div class="card-media" onclick="abrirModal('${String(item.id).replace(/'/g, "\\'")}')">
          ${renderMediaHTML(item.imagen_url, item.nombre)}
          <span class="card-cat-badge mono-xs">${item.categoria || 'Sistema'}</span>
          ${esDestacado ? '<span class="card-star mono-xs">RECOMENDADO</span>' : ''}
        </div>
        <div class="card-body">
          <div class="card-top">
            <h3 class="card-title">${item.nombre}</h3>
            <span class="card-price">${CONFIG.MONEDA}${item.precio}</span>
          </div>
          <p class="card-desc">${item.descripcion || ''}</p>
          <ul class="card-features">
            ${entregables.slice(0, 4).map(e => `<li>${e.trim()}</li>`).join('')}
          </ul>
          <div class="card-actions">
            <button class="btn btn-primary btn-sm" onclick="seleccionarPaquete('${String(item.nombre).replace(/'/g, "\\'")}')">Cotizar</button>
            <button class="btn btn-ghost btn-sm btn-details" onclick="abrirModal('${String(item.id).replace(/'/g, "\\'")}')">Detalles</button>
            <a href="${waLink}" target="_blank" rel="noopener" class="btn btn-outline btn-sm">WA &nearr;</a>
          </div>
        </div>
      </article>`;
  }).join('');

  // Efecto spotlight que sigue el cursor
  grid.querySelectorAll('.bento-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}

// Modal de especificaciones
window.abrirModal = function(id) {
  const item = catalogoGlobal.find(i => String(i.id) === String(id));
  if (!item) return;
  activeModalItem = item;
  document.getElementById('modal-media').innerHTML = renderMediaHTML(item.imagen_url, item.nombre);
  document.getElementById('modal-cat').textContent = `// ${item.categoria || 'SERVICIO'}`;
  document.getElementById('modal-title').textContent = item.nombre;
  document.getElementById('modal-price').textContent = `${CONFIG.MONEDA}${item.precio}`;
  document.getElementById('modal-desc').textContent = item.descripcion || '';
  const entregables = String(item.entregables || '').split('|').filter(Boolean);
  document.getElementById('modal-features').innerHTML = entregables.map(e => `<li>${e.trim()}</li>`).join('');
  document.getElementById('modal-wa-btn').href = linkWhatsApp(`Hola Zenda Studio, quiero detalles sobre "${item.nombre}" (${CONFIG.MONEDA}${item.precio}).`);
  document.getElementById('service-modal').hidden = false;
};

function initModal() {
  const modal = document.getElementById('service-modal');
  const close = () => { modal.hidden = true; };
  document.getElementById('modal-close')?.addEventListener('click', close);
  modal?.addEventListener('click', e => { if (e.target === modal) close(); });
  document.getElementById('modal-quote-btn')?.addEventListener('click', () => {
    close();
    if (activeModalItem) seleccionarPaquete(activeModalItem.nombre);
  });
}

function poblarSelectPaquetes(items) {
  const select = document.getElementById('paquete');
  select.innerHTML = '<option value="Sistema a medida">Sistema a medida</option>';
  items.forEach(item => {
    const opt = document.createElement('option');
    opt.value = `${item.nombre} (${CONFIG.MONEDA}${item.precio})`;
    opt.textContent = `${item.nombre} — ${CONFIG.MONEDA}${item.precio}`;
    select.appendChild(opt);
  });
}

window.seleccionarPaquete = function(nombrePaquete) {
  const select = document.getElementById('paquete');
  for (let opt of select.options) {
    if (opt.value.startsWith(nombrePaquete)) { select.value = opt.value; break; }
  }
  document.getElementById('cotizar').scrollIntoView({ behavior: 'smooth' });
  document.getElementById('nombre').focus();
};

function initFormulario() {
  const form = document.getElementById('quote-form');
  const status = document.getElementById('form-status');
  const btn = document.getElementById('btn-submit');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    btn.disabled = true; btn.textContent = 'Enviando solicitud...'; status.textContent = '';
    const payload = {
      nombre: document.getElementById('nombre').value.trim(),
      telefono: document.getElementById('telefono').value.trim(),
      correo: document.getElementById('correo').value.trim(),
      paquete: document.getElementById('paquete').value,
      presupuesto: document.getElementById('presupuesto').value,
      mensaje: document.getElementById('mensaje').value.trim()
    };
    try {
      await fetch(CONFIG.APPS_SCRIPT_URL, { method: 'POST', body: JSON.stringify(payload) });
      const waResumen = linkWhatsApp(`Hola Zenda Studio, acabo de enviar una cotización:\n• Nombre: ${payload.nombre}\n• Solución: ${payload.paquete}\n• Inversión: ${payload.presupuesto}\n• Detalle: ${payload.mensaje}`);
      status.innerHTML = `Solicitud registrada. <a href="${waResumen}" target="_blank" style="color:var(--accent)">Agilizar por WhatsApp &nearr;</a>`;
      showToast('Cotización enviada con éxito');
      form.reset();
    } catch {
      status.textContent = 'Error de conexión. Escríbenos directo por WhatsApp.';
    } finally {
      btn.disabled = false; btn.textContent = 'Enviar solicitud →';
    }
  });
}

// Micro-gesto: Copiar correo + Acceso secreto (5 clics en el punto azul o Ctrl+Shift+Z)
function initGestures() {
  document.getElementById('copy-email-btn')?.addEventListener('click', () => {
    navigator.clipboard?.writeText(CONFIG.STUDIO_EMAIL);
    showToast(`Copiado: ${CONFIG.STUDIO_EMAIL}`);
  });

  let clicks = 0, timer;
  document.getElementById('secret-dot')?.addEventListener('click', () => {
    clicks++;
    clearTimeout(timer);
    timer = setTimeout(() => { clicks = 0; }, 2200);
    if (clicks >= 5) {
      clicks = 0;
      showToast('Abriendo panel de estudio...');
      setTimeout(() => { window.location.href = 'admin.html'; }, 500);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'z') {
      window.location.href = 'admin.html';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();
  initTheme('dark');
  startLiveClock();
  initWhatsAppLinks();
  initModal();
  initFormulario();
  initGestures();
  cargarCatalogo();
});
