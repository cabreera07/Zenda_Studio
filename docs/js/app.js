const CONFIG = {
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzBQgX8U0CzNe_zH8slUUAgDPMlQG3o0TidWUQ8cX2I88tEGSa6-4zsZet6Y-bqqd12GQ/exec',
  WHATSAPP_NUMBER: '50200000000',
  STUDIO_EMAIL: 'hola@zendastudio.com',
  MONEDA: 'Q'
};

const ICON_SUN = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>';
const ICON_MOON = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
const ICON_CHECK = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';

let catalogoGlobal = [];
let cart = JSON.parse(localStorage.getItem('zenda_cart') || '[]');
let activeModalItem = null;
let currentView = 'grid';
let cardRotatorTimer = null;

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

function renderMediaHTML(m, alt) {
  if (!m || !m.url) return '<div style="height:100%;display:grid;place-items:center;color:var(--text-muted);font-size:0.85rem;">Sin imagen</div>';
  if (m.type === 'video') return `<video src="${m.url}" autoplay loop muted playsinline></video>`;
  if (m.type === 'drive_video') return `<iframe src="${m.url}" allow="autoplay"></iframe>`;
  return `<img src="${m.url}" alt="${esc(alt)}" loading="lazy" />`;
}

// Tema Oscuro / Claro
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
  });
}

function aplicarConfigRemota(cfg) {
  if (!cfg) return;
  if (cfg.whatsapp) CONFIG.WHATSAPP_NUMBER = String(cfg.whatsapp).replace(/\D/g, '');
  if (cfg.correo) CONFIG.STUDIO_EMAIL = cfg.correo;
  if (cfg.color_acento) document.documentElement.style.setProperty('--accent', cfg.color_acento);
  if (cfg.hero_titulo) document.getElementById('hero-title').innerHTML = `${esc(cfg.hero_titulo)}<span class="text-accent">.</span>`;
  if (cfg.hero_subtitulo) document.getElementById('hero-subtitle').textContent = cfg.hero_subtitulo;
  if (cfg.banner_promo && cfg.banner_promo.trim()) {
    const bar = document.getElementById('promo-bar');
    bar.textContent = cfg.banner_promo;
    bar.hidden = false;
  }
  if (String(cfg.mostrar_proceso).toUpperCase() === 'NO') document.getElementById('proceso').hidden = true;
  if (cfg.tema_default && !localStorage.getItem('zenda_theme')) applyTheme(cfg.tema_default === 'dark' ? 'dark' : 'light');
  const waMsg = linkWhatsApp('Hola Zenda Studio, me interesa conversar sobre un proyecto.');
  document.getElementById('hero-whatsapp').href = waMsg;
  document.getElementById('direct-whatsapp').href = waMsg;
}

// Catálogo
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
            ${feats.slice(0, 4).map(f => `<li>${ICON_CHECK}<span>${esc(f.trim())}</span></li>`).join('')}
          </ul>
          <div class="card-footer">
            <button type="button" class="btn btn-primary btn-sm" data-action="add" data-id="${esc(item.id)}">Agregar a bolsa</button>
            <button type="button" class="btn btn-secondary btn-sm" data-action="modal" data-id="${esc(item.id)}">Ver detalle</button>
          </div>
        </div>
      </article>`;
  }).join('');

  // Delegación limpia de eventos
  grid.querySelectorAll('[data-action="add"]').forEach(b => b.addEventListener('click', () => addToCart(b.dataset.id)));
  grid.querySelectorAll('[data-action="modal"]').forEach(b => b.addEventListener('click', () => abrirModal(b.dataset.id)));

  // Rotación automática de imágenes múltiples
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

// Carrito
function saveCart() {
  localStorage.setItem('zenda_cart', JSON.stringify(cart));
  renderCart();
}

function addToCart(id) {
  const item = catalogoGlobal.find(i => String(i.id) === String(id));
  if (!item) return;
  const ex = cart.find(c => String(c.id) === String(id));
  if (ex) ex.qty += 1;
  else cart.push({ id: item.id, nombre: item.nombre, precio: parsePrice(item.precio), qty: 1 });
  saveCart();
  showToast(`Agregado: ${item.nombre}`);
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
    list.innerHTML = '<div class="empty-state" style="padding:32px 16px;">Tu bolsa está vacía.</div>';
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
      st.innerHTML = `Orden <strong>${esc(orderId)}</strong> registrada. <a href="${wa}" target="_blank" style="color:var(--accent)">Coordinar pago por WhatsApp &rarr;</a>`;
      cart = []; saveCart(); e.target.reset();
      showToast(`Pedido ${orderId} confirmado`);
    } catch {
      st.textContent = 'Error de conexión. Escríbenos por WhatsApp.';
    } finally {
      btn.disabled = false; btn.textContent = 'Confirmar pedido';
    }
  });
  renderCart();
}

// Modal detalle
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
  document.getElementById('modal-quote-btn').addEventListener('click', () => {
    close();
    if (!activeModalItem) return;
    const sel = document.getElementById('paquete');
    for (let opt of sel.options) { if (opt.value.startsWith(activeModalItem.nombre)) { sel.value = opt.value; break; } }
    document.getElementById('cotizar').scrollIntoView({ behavior: 'smooth' });
  });
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
      const wa = linkWhatsApp(`Hola Zenda Studio, envié una cotización:\n• Nombre: ${payload.nombre}\n• Servicio: ${payload.paquete}\n• Detalle: ${payload.mensaje}`);
      st.innerHTML = `Solicitud enviada. <a href="${wa}" target="_blank" style="color:var(--accent)">Agilizar por WhatsApp &rarr;</a>`;
      form.reset(); showToast('Solicitud enviada');
    } catch { st.textContent = 'Error al enviar. Escríbenos por WhatsApp.'; }
    finally { btn.disabled = false; btn.textContent = 'Enviar solicitud'; }
  });
}

function initGestures() {
  document.getElementById('copy-email-btn')?.addEventListener('click', () => {
    navigator.clipboard?.writeText(CONFIG.STUDIO_EMAIL);
    showToast(`Correo copiado: ${CONFIG.STUDIO_EMAIL}`);
  });
  let clicks = 0, timer;
  document.getElementById('secret-dot')?.addEventListener('click', () => {
    clicks++; clearTimeout(timer); timer = setTimeout(() => { clicks = 0; }, 2200);
    if (clicks >= 5) { clicks = 0; window.location.href = 'admin.html'; }
  });
  document.addEventListener('keydown', e => { if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'z') window.location.href = 'admin.html'; });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();
  initTheme('light'); initCart(); initModal(); initQuoteForm(); initGestures(); cargarCatalogo();
});