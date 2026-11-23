const CONFIG = {
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzBQgX8U0CzNe_zH8slUUAgDPMlQG3o0TidWUQ8cX2I88tEGSa6-4zsZet6Y-bqqd12GQ/exec',
  WHATSAPP_NUMBER: '50200000000', // Cambia por tu número real sin + ni espacios
  MONEDA: 'Q'
};

let catalogoGlobal = [];
const linkWhatsApp = (msg) => `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

function initWhatsAppLinks() {
  const msg = 'Hola Zenda Studio, me interesa conocer más sobre sus servicios.';
  ['nav-whatsapp', 'direct-whatsapp', 'float-whatsapp'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.href = linkWhatsApp(msg);
  });
}

async function cargarCatalogo() {
  const grid = document.getElementById('catalogo-grid');
  try {
    const res = await fetch(CONFIG.APPS_SCRIPT_URL);
    const json = await res.json();
    catalogoGlobal = json.data || [];
    renderFiltros(catalogoGlobal);
    renderCatalogo(catalogoGlobal);
    poblarSelectPaquetes(catalogoGlobal);
  } catch (err) {
    grid.innerHTML = '<div class="loading-state">No se pudo cargar el catálogo. Intenta recargar la página.</div>';
    console.error(err);
  }
}

function renderFiltros(items) {
  const container = document.getElementById('filtros-categorias');
  const categorias = ['Todos', ...new Set(items.map(i => i.categoria).filter(Boolean))];
  container.innerHTML = categorias.map((cat, idx) => `<button class="filter-btn ${idx === 0 ? 'active' : ''}" data-cat="${cat}">${cat}</button>`).join('');
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
  if (!items.length) { grid.innerHTML = '<div class="loading-state">No hay servicios disponibles.</div>'; return; }
  grid.innerHTML = items.map(item => {
    const entregables = String(item.entregables || '').split('|').filter(Boolean);
    const esDestacado = String(item.destacado).toUpperCase() === 'SI';
    const waLink = linkWhatsApp(`Hola Zenda Studio, me interesa el paquete "${item.nombre}" (${CONFIG.MONEDA}${item.precio}).`);
    const media = String(item.imagen_url).endsWith('.mp4')
      ? `<video src="${item.imagen_url}" autoplay loop muted playsinline></video>`
      : `<img src="${item.imagen_url || ''}" alt="${item.nombre}" loading="lazy" />`;

    return `
      <article class="card ${esDestacado ? 'card-featured' : ''}">
        <div class="card-img-wrap">${media}<span class="card-tag">${item.categoria || 'Servicio'}</span></div>
        <div class="card-body">
          <h3 class="card-title">${item.nombre}</h3>
          <div class="card-price">${CONFIG.MONEDA}${item.precio}</div>
          <p class="card-desc">${item.descripcion || ''}</p>
          <ul class="card-features">${entregables.map(e => `<li>${e.trim()}</li>`).join('')}</ul>
          <div class="card-actions">
            <button class="btn btn-primary btn-sm" onclick="seleccionarPaquete('${String(item.nombre).replace(/'/g, "\\'")}')">Cotizar</button>
            <a href="${waLink}" target="_blank" rel="noopener" class="btn btn-outline btn-sm">WhatsApp</a>
          </div>
        </div>
      </article>`;
  }).join('');
}

function poblarSelectPaquetes(items) {
  const select = document.getElementById('paquete');
  items.forEach(item => {
    const opt = document.createElement('option');
    opt.value = `${item.nombre} (${CONFIG.MONEDA}${item.precio})`;
    opt.textContent = `${item.nombre} — ${CONFIG.MONEDA}${item.precio}`;
    select.appendChild(opt);
  });
}

window.seleccionarPaquete = function(nombrePaquete) {
  const select = document.getElementById('paquete');
  for (let opt of select.options) { if (opt.value.startsWith(nombrePaquete)) { select.value = opt.value; break; } }
  document.getElementById('cotizar').scrollIntoView({ behavior: 'smooth' });
  document.getElementById('nombre').focus();
};

function initFormulario() {
  const form = document.getElementById('quote-form');
  const status = document.getElementById('form-status');
  const btn = document.getElementById('btn-submit');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    btn.disabled = true; btn.textContent = 'Enviando...'; status.textContent = '';
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
      const waResumen = linkWhatsApp(`Hola Zenda Studio, acabo de enviar una cotización:\n• Nombre: ${payload.nombre}\n• Servicio: ${payload.paquete}\n• Presupuesto: ${payload.presupuesto}\n• Detalle: ${payload.mensaje}`);
      status.innerHTML = `¡Cotización enviada! <a href="${waResumen}" target="_blank" style="color:var(--accent)">Clic aquí para agilizar por WhatsApp</a>.`;
      form.reset();
    } catch (err) {
      status.textContent = 'Hubo un problema al enviar. Contáctanos directo por WhatsApp.';
    } finally {
      btn.disabled = false; btn.textContent = 'Enviar Cotización';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();
  initWhatsAppLinks(); cargarCatalogo(); initFormulario();
});
