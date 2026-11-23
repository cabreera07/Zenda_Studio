const CONFIG = {
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzBQgX8U0CzNe_zH8slUUAgDPMlQG3o0TidWUQ8cX2I88tEGSa6-4zsZet6Y-bqqd12GQ/exec',
  WHATSAPP_NUMBER: '50200000000',
  STUDIO_EMAIL: 'hola@zendastudio.com',
  MONEDA: 'Q'
};

let catalogoGlobal = [];
let cart = JSON.parse(localStorage.getItem('zenda_cart') || '[]');
let activeModalItem = null;
let showcaseSlides = [];
let showcaseIdx = 0;
let showcaseTimer = null;
let cardRotatorTimer = null;

const linkWhatsApp = (msg) => `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
const parsePrice = (val) => parseFloat(String(val || '0').replace(/,/g, '').replace(/[^\d.]/g, '')) || 0;
const formatMoney = (num) => `${CONFIG.MONEDA}${Number(num || 0).toLocaleString('en-US')}`;

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.hidden = false;
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
}

function renderMediaObject(mediaObj, alt) {
  if (!mediaObj || !mediaObj.url) return `<div class="loading-state mono-xs">SIN VISTA PREVIA</div>`;
  if (mediaObj.type === 'video') return `<video src="${mediaObj.url}" autoplay loop muted playsinline></video>`;
  if (mediaObj.type === 'drive_video') return `<iframe src="${mediaObj.url}" allow="autoplay"></iframe>`;
  return `<img src="${mediaObj.url}" alt="${alt || 'Zenda Studio'}" loading="lazy" />`;
}

// Reloj Guatemala + Tema
function startLiveClock() {
  const el = document.getElementById('live-clock');
  const update = () => {
    try { el.textContent = 'GUA ' + new Intl.DateTimeFormat('es-GT', { timeZone: 'America/Guatemala', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date()); }
    catch { el.textContent = 'ONLINE'; }
  };
  update(); setInterval(update, 15000);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const icon = document.getElementById('theme-icon');
  if (icon) icon.textContent = theme === 'dark' ? '☀' : '☾';
}

function initTheme(def = 'dark') {
  applyTheme(localStorage.getItem('zenda_theme') || def);
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    localStorage.setItem('zenda_theme', next);
    applyTheme(next);
    showToast(next === 'dark' ? 'Modo oscuro' : 'Modo claro');
  });
}

function aplicarConfigRemota(cfg) {
  if (!cfg) return;
  if (cfg.whatsapp) CONFIG.WHATSAPP_NUMBER = String(cfg.whatsapp).replace(/\D/g, '');
  if (cfg.correo) CONFIG.STUDIO_EMAIL = cfg.correo;
  if (cfg.color_acento) document.documentElement.style.setProperty('--accent', cfg.color_acento);
  if (cfg.hero_titulo) document.getElementById('hero-title').innerHTML = `${cfg.hero_titulo}<span class="text-accent">.</span>`;
  if (cfg.hero_subtitulo) document.getElementById('hero-subtitle').textContent = cfg.hero_subtitulo;
  if (cfg.banner_promo && cfg.banner_promo.trim()) {
    document.getElementById('promo-text').textContent = cfg.banner_promo;
    document.getElementById('promo-bar').hidden = false;
  }
  if (String(cfg.mostrar_proceso).toUpperCase() === 'NO') document.getElementById('proceso').style.display = 'none';
  if (cfg.tema_default && !localStorage.getItem('zenda_theme')) applyTheme(cfg.tema_default === 'light' ? 'light' : 'dark');
  document.getElementById('direct-whatsapp').href = linkWhatsApp('Hola Zenda Studio, me gustaría cotizar un proyecto.');
}

// ================= VITRINA TRANSLÚCIDA ROTATIVA (DEMOS) =================
function initShowcase(items) {
  showcaseSlides = [];
  items.forEach(item => {
    const gal = item.galeria && item.galeria.length ? item.galeria : [{ type: 'image', url: item.imagen_url }];
    gal.forEach(m => showcaseSlides.push({ item, media: m }));
  });
  if (!showcaseSlides.length) return;
  showcaseIdx = 0;
  renderShowcaseSlide();
  startShowcaseTimer();

  document.getElementById('showcase-prev').onclick = () => { showcaseIdx = (showcaseIdx - 1 + showcaseSlides.length) % showcaseSlides.length; renderShowcaseSlide(); startShowcaseTimer(); };
  document.getElementById('showcase-next').onclick = () => { showcaseIdx = (showcaseIdx + 1) % showcaseSlides.length; renderShowcaseSlide(); startShowcaseTimer(); };
}

function renderShowcaseSlide() {
  const s = showcaseSlides[showcaseIdx];
  if (!s) return;
  document.getElementById('showcase-counter').textContent = `${String(showcaseIdx + 1).padStart(2, '0')} / ${String(showcaseSlides.length).padStart(2, '0')}`;
  document.getElementById('showcase-media').innerHTML = renderMediaObject(s.media, s.item.nombre);
  if (s.media.type === 'image') document.getElementById('showcase-bg').style.backgroundImage = `url('${s.media.url}')`;
  document.getElementById('showcase-cat').textContent = `// ${s.item.categoria || 'DEMO'}`;
  document.getElementById('showcase-title').textContent = s.item.nombre;
  document.getElementById('showcase-desc').textContent = s.item.descripcion;
  document.getElementById('showcase-price').textContent = `${CONFIG.MONEDA}${s.item.precio}`;
  document.getElementById('showcase-add-btn').onclick = () => addToCart(s.item.id);
  document.getElementById('showcase-detail-btn').onclick = () => abrirModal(s.item.id);
}

function startShowcaseTimer() {
  clearInterval(showcaseTimer);
  const bar = document.getElementById('showcase-bar');
  let pct = 0;
  showcaseTimer = setInterval(() => {
    pct += 2;
    bar.style.width = pct + '%';
    if (pct >= 100) {
      pct = 0;
      showcaseIdx = (showcaseIdx + 1) % showcaseSlides.length;
      renderShowcaseSlide();
    }
  }, 100); // Rota cada 5 segundos
}

// ================= CATÁLOGO / TIENDA =================
async function cargarCatalogo() {
  const grid = document.getElementById('catalogo-grid');
  try {
    const res = await fetch(CONFIG.APPS_SCRIPT_URL);
    const json = await res.json();
    if (json.config) aplicarConfigRemota(json.config);
    catalogoGlobal = json.data || [];
    initShowcase(catalogoGlobal);
    renderFiltros(catalogoGlobal);
    renderCatalogo(catalogoGlobal);
    poblarSelectPaquetes(catalogoGlobal);
  } catch (err) {
    grid.innerHTML = '<div class="loading-state mono-xs">ERROR AL CONECTAR CON SHEETS</div>';
    console.error(err);
  }
}

function renderFiltros(items) {
  const container = document.getElementById('filtros-categorias');
  const cats = ['Todos', ...new Set(items.map(i => i.categoria).filter(Boolean))];
  container.innerHTML = cats.map((c, idx) => `<button class="filter-btn ${idx === 0 ? 'active' : ''}" data-cat="${c}">${c}</button>`).join('');

  const applyFilter = () => {
    const activeCat = container.querySelector('.filter-btn.active')?.dataset.cat || 'Todos';
    const q = (document.getElementById('search-input')?.value || '').toLowerCase().trim();
    const filtrados = catalogoGlobal.filter(i => {
      const matchCat = activeCat === 'Todos' || i.categoria === activeCat;
      const matchQ = !q || `${i.nombre} ${i.descripcion} ${i.categoria}`.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
    renderCatalogo(filtrados);
  };

  container.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilter();
    });
  });
  document.getElementById('search-input')?.addEventListener('input', applyFilter);
}

function renderCatalogo(items) {
  const grid = document.getElementById('catalogo-grid');
  clearInterval(cardRotatorTimer);
  if (!items.length) { grid.innerHTML = '<div class="loading-state mono-xs">NO SE ENCONTRARON SERVICIOS</div>'; return; }

  const useWideLead = items.length >= 3 && items.length % 2 === 1;

  grid.innerHTML = items.map((item, idx) => {
    const entregables = String(item.entregables || '').split('|').filter(Boolean);
    const esDestacado = String(item.destacado).toUpperCase() === 'SI';
    const isWide = useWideLead && idx === 0;
    const gal = item.galeria && item.galeria.length ? item.galeria : [{ type: 'image', url: item.imagen_url }];
    const dotsHTML = gal.length > 1 ? `<div class="media-dots">${gal.map((_, i) => `<span class="media-dot ${i === 0 ? 'active' : ''}"></span>`).join('')}</div>` : '';

    return `
      <article class="bento-card ${esDestacado ? 'card-featured' : ''} ${isWide ? 'card-wide' : ''}" data-id="${item.id}" data-slide="0">
        <div class="card-media" onclick="abrirModal('${String(item.id).replace(/'/g, "\\'")}')">
          <div class="card-media-slot" style="width:100%;height:100%;">${renderMediaObject(gal[0], item.nombre)}</div>
          <span class="card-cat-badge mono-xs">${item.categoria || 'Sistema'}</span>
          ${esDestacado ? '<span class="card-star mono-xs">RECOMENDADO</span>' : ''}
          ${dotsHTML}
        </div>
        <div class="card-body">
          <div class="card-top">
            <h3 class="card-title">${item.nombre}</h3>
            <span class="card-price">${CONFIG.MONEDA}${item.precio}</span>
          </div>
          <p class="card-desc">${item.descripcion || ''}</p>
          <ul class="card-features">${entregables.slice(0, 4).map(e => `<li>${e.trim()}</li>`).join('')}</ul>
          <div class="card-actions">
            <button class="btn btn-primary btn-sm" onclick="addToCart('${String(item.id).replace(/'/g, "\\'")}')">+ Agregar a bolsa</button>
            <button class="btn btn-ghost btn-sm" onclick="abrirModal('${String(item.id).replace(/'/g, "\\'")}')">Galería (${gal.length})</button>
          </div>
        </div>
      </article>`;
  }).join('');

  // Spotlight del cursor + Rotación automática de tarjetas con varias imágenes
  grid.querySelectorAll('.bento-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  cardRotatorTimer = setInterval(() => {
    grid.querySelectorAll('.bento-card').forEach(card => {
      const item = catalogoGlobal.find(i => String(i.id) === String(card.dataset.id));
      if (!item || !item.galeria || item.galeria.length <= 1) return;
      const nextIdx = (Number(card.dataset.slide || 0) + 1) % item.galeria.length;
      if (item.galeria[nextIdx].type === 'drive_video') return; // No interrumpir iframes de video
      card.dataset.slide = nextIdx;
      const slot = card.querySelector('.card-media-slot');
      if (slot) slot.innerHTML = renderMediaObject(item.galeria[nextIdx], item.nombre);
      card.querySelectorAll('.media-dot').forEach((d, i) => d.classList.toggle('active', i === nextIdx));
    });
  }, 4500);
}

// ================= CARRITO DE COMPRAS =================
function saveCart() {
  localStorage.setItem('zenda_cart', JSON.stringify(cart));
  renderCart();
}

window.addToCart = function(id) {
  const item = catalogoGlobal.find(i => String(i.id) === String(id));
  if (!item) return;
  const existing = cart.find(c => String(c.id) === String(id));
  if (existing) existing.qty += 1;
  else cart.push({ id: item.id, nombre: item.nombre, precio: parsePrice(item.precio), precioLabel: item.precio, qty: 1 });
  saveCart();
  showToast(`Agregado: ${item.nombre}`);
  openCart();
};

window.changeQty = function(id, delta) {
  const idx = cart.findIndex(c => String(c.id) === String(id));
  if (idx === -1) return;
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  saveCart();
};

function renderCart() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById('cart-count').textContent = count;
  const list = document.getElementById('cart-items');
  const checkoutArea = document.getElementById('cart-checkout-area');

  if (!cart.length) {
    list.innerHTML = '<p style="color:var(--text-muted); padding:24px 0; text-align:center;">Tu bolsa está vacía. Selecciona algún paquete de la tienda.</p>';
    checkoutArea.hidden = true;
    return;
  }

  checkoutArea.hidden = false;
  let total = 0;
  list.innerHTML = cart.map(c => {
    total += c.precio * c.qty;
    return `
      <div class="cart-item">
        <div>
          <strong style="font-size:0.93rem;">${c.nombre}</strong>
          <div class="mono-xs text-accent">${formatMoney(c.precio)} c/u</div>
        </div>
        <div class="cart-qty">
          <button class="qty-btn" onclick="changeQty('${c.id}', -1)">-</button>
          <span class="mono-val">${c.qty}</span>
          <button class="qty-btn" onclick="changeQty('${c.id}', 1)">+</button>
        </div>
      </div>`;
  }).join('');
  document.getElementById('cart-total').textContent = formatMoney(total);
}

function openCart() { document.getElementById('cart-drawer-backdrop').hidden = false; renderCart(); }
function closeCart() { document.getElementById('cart-drawer-backdrop').hidden = true; }

function initCartDrawer() {
  document.getElementById('cart-open-btn').addEventListener('click', openCart);
  document.getElementById('cart-close-btn').addEventListener('click', closeCart);
  document.getElementById('cart-drawer-backdrop').addEventListener('click', e => { if (e.target.id === 'cart-drawer-backdrop') closeCart(); });

  document.getElementById('checkout-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!cart.length) return;
    const btn = document.getElementById('btn-checkout');
    const st = document.getElementById('chk-status');
    btn.disabled = true; btn.textContent = 'Procesando orden...'; st.textContent = '';

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
      st.innerHTML = `Pedido <strong>${orderId}</strong> confirmado. <a href="${wa}" target="_blank" style="color:var(--accent)">Coordinar pago por WhatsApp &nearr;</a>`;
      cart = []; saveCart(); e.target.reset();
      showToast(`Pedido ${orderId} registrado`);
    } catch {
      st.textContent = 'Error al registrar pedido. Escríbenos directo por WhatsApp.';
    } finally {
      btn.disabled = false; btn.textContent = 'Confirmar pedido →';
    }
  });
  renderCart();
}

// ================= MODAL GALERÍA =================
window.abrirModal = function(id) {
  const item = catalogoGlobal.find(i => String(i.id) === String(id));
  if (!item) return;
  activeModalItem = item;
  const gal = item.galeria && item.galeria.length ? item.galeria : [{ type: 'image', url: item.imagen_url }];

  const setMain = (idx) => {
    document.getElementById('modal-media').innerHTML = renderMediaObject(gal[idx], item.nombre);
    document.querySelectorAll('.modal-thumb').forEach((t, i) => t.classList.toggle('active', i === idx));
  };

  const thumbs = document.getElementById('modal-thumbs');
  if (gal.length > 1) {
    thumbs.innerHTML = gal.map((m, i) => `
      <button type="button" class="modal-thumb ${i === 0 ? 'active' : ''}" data-i="${i}">
        ${m.type === 'image' ? `<img src="${m.url}" alt="" />` : '<span class="mono-xs">VIDEO</span>'}
      </button>`).join('');
    thumbs.querySelectorAll('.modal-thumb').forEach(b => b.addEventListener('click', () => setMain(Number(b.dataset.i))));
  } else { thumbs.innerHTML = ''; }

  setMain(0);
  document.getElementById('modal-cat').textContent = `// ${item.categoria || 'PAQUETE'}`;
  document.getElementById('modal-title').textContent = item.nombre;
  document.getElementById('modal-price').textContent = `${CONFIG.MONEDA}${item.precio}`;
  document.getElementById('modal-desc').textContent = item.descripcion || '';
  document.getElementById('modal-features').innerHTML = String(item.entregables || '').split('|').filter(Boolean).map(e => `<li>${e.trim()}</li>`).join('');
  document.getElementById('modal-wa-btn').href = linkWhatsApp(`Hola Zenda Studio, quiero consultar sobre "${item.nombre}" (${CONFIG.MONEDA}${item.precio}).`);
  document.getElementById('service-modal').hidden = false;
};

function initModal() {
  const modal = document.getElementById('service-modal');
  const close = () => { modal.hidden = true; document.getElementById('modal-media').innerHTML = ''; };
  document.getElementById('modal-close').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  document.getElementById('modal-add-btn').addEventListener('click', () => { if (activeModalItem) { close(); addToCart(activeModalItem.id); } });
  document.getElementById('modal-quote-btn').addEventListener('click', () => {
    close();
    if (!activeModalItem) return;
    const select = document.getElementById('paquete');
    for (let opt of select.options) { if (opt.value.startsWith(activeModalItem.nombre)) { select.value = opt.value; break; } }
    document.getElementById('cotizar').scrollIntoView({ behavior: 'smooth' });
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
      const wa = linkWhatsApp(`Hola Zenda Studio, envié una cotización:\n• Nombre: ${payload.nombre}\n• Solución: ${payload.paquete}\n• Detalle: ${payload.mensaje}`);
      st.innerHTML = `Solicitud registrada. <a href="${wa}" target="_blank" style="color:var(--accent)">Agilizar por WhatsApp &nearr;</a>`;
      form.reset(); showToast('Cotización enviada');
    } catch { st.textContent = 'Error al enviar. Contáctanos por WhatsApp.'; }
    finally { btn.disabled = false; btn.textContent = 'Enviar solicitud →'; }
  });
}

function initGestures() {
  document.getElementById('copy-email-btn')?.addEventListener('click', () => {
    navigator.clipboard?.writeText(CONFIG.STUDIO_EMAIL);
    showToast(`Copiado: ${CONFIG.STUDIO_EMAIL}`);
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
  initTheme('dark'); startLiveClock(); initCartDrawer(); initModal(); initQuoteForm(); initGestures(); cargarCatalogo();
});
