const CORREO_NOTIFICACION = 'SOLUCIONES.ZENDA.STUDIO@GMAIL.COM'; // Cambia por tu correo real
const ADMIN_PIN = '1234'; // Cambia por tu PIN secreto
const CARPETA_RAIZ_NOMBRE = 'AGENCIA';
const CARPETA_PUBLICA_NOMBRE = '01_WEB_CATALOGO_PUBLICO';

function respuestaJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Convierte uno o varios links separados por | en objetos listos para el frontend
function procesarMultimedia(raw) {
  if (!raw) return [];
  return String(raw).split('|').map(u => u.trim()).filter(Boolean).map(url => {
    const esVideoDrive = url.includes('#video');
    const cleanUrl = url.replace('#video', '');
    const match = cleanUrl.match(/[-\w]{25,}/);

    if (cleanUrl.includes('drive.google.com') && match) {
      const id = match[0];
      if (esVideoDrive) {
        return { type: 'drive_video', url: `https://drive.google.com/file/d/${id}/preview`, raw: url };
      }
      return { type: 'image', url: `https://drive.google.com/thumbnail?id=${id}&sz=w1200`, raw: url };
    }
    if (/\.(mp4|webm|mov)(\?|$)/i.test(cleanUrl)) {
      return { type: 'video', url: cleanUrl, raw: url };
    }
    return { type: 'image', url: cleanUrl, raw: url };
  });
}

function obtenerCarpetaPublica() {
  const raices = DriveApp.getFoldersByName(CARPETA_RAIZ_NOMBRE);
  const raiz = raices.hasNext() ? raices.next() : DriveApp.createFolder(CARPETA_RAIZ_NOMBRE);
  const subs = raiz.getFoldersByName(CARPETA_PUBLICA_NOMBRE);
  const pub = subs.hasNext() ? subs.next() : raiz.createFolder(CARPETA_PUBLICA_NOMBRE);
  pub.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return pub;
}

function obtenerOCrearConfig(ss) {
  let sheet = ss.getSheetByName('Config');
  if (!sheet) {
    sheet = ss.insertSheet('Config');
    sheet.getRange(1, 1, 1, 2).setValues([['clave', 'valor']]).setFontWeight('bold');
    const defaults = [
      ['hero_titulo', 'Construimos sistemas que trabajan por tu negocio'],
      ['hero_subtitulo', 'Tienda de soluciones digitales, desarrollo web y automatización a medida con entrega transparente.'],
      ['banner_promo', ''],
      ['tema_default', 'dark'],
      ['color_acento', '#007bff'],
      ['whatsapp', '50200000000'],
      ['correo', CORREO_NOTIFICACION],
      ['mostrar_proceso', 'SI']
    ];
    sheet.getRange(2, 1, defaults.length, 2).setValues(defaults);
  }
  return sheet;
}

function obtenerOCrearPedidos(ss) {
  let sheet = ss.getSheetByName('Pedidos');
  if (!sheet) {
    sheet = ss.insertSheet('Pedidos');
    sheet.getRange(1, 1, 1, 10)
      .setValues([['orden_id', 'fecha', 'cliente', 'telefono', 'correo', 'items', 'total', 'metodo_pago', 'notas', 'estado']])
      .setFontWeight('bold').setBackground('#111315').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function leerCatalogo(ss, soloActivos) {
  const sheet = ss.getSheetByName('Catalogo');
  const data = sheet.getDataRange().getDisplayValues();
  if (data.length < 2) return [];
  const headers = data.shift().map(h => String(h).trim().toLowerCase());

  const items = data.map((row, idx) => {
    let item = { _row: idx + 2 };
    headers.forEach((h, i) => item[h] = row[i] || '');
    const media = procesarMultimedia(item.imagen_drive);
    item.galeria = media;
    item.imagen_url = media.length ? media[0].url : '';
    return item;
  });

  return soloActivos ? items.filter(i => String(i.activo).toUpperCase() === 'SI') : items;
}

function leerConfig(ss) {
  const cfgSheet = obtenerOCrearConfig(ss);
  const rows = cfgSheet.getDataRange().getDisplayValues().slice(1);
  const cfg = {};
  rows.forEach(r => { if (r[0]) cfg[r[0].trim()] = r[1]; });
  return cfg;
}

// GET público: devuelve catálogo activo y configuración de interfaz
function doGet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return respuestaJSON({
    status: 'ok',
    data: leerCatalogo(ss, true),
    config: leerConfig(ss)
  });
}

// POST: maneja subida a Drive, CRUD de inventario, pedidos, cotizaciones y config
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const action = body.action || 'quote';

    // Acciones protegidas con PIN
    const adminActions = ['get_admin_data', 'upload_file', 'save_service', 'toggle_service', 'delete_service', 'save_config', 'seed_5_examples', 'update_order_status'];
    if (adminActions.includes(action) && String(body.pin) !== ADMIN_PIN) {
      return respuestaJSON({ status: 'error', message: 'PIN incorrecto' });
    }

    // 1. OBTENER TODO PARA EL ADMIN (incluye inactivos y pedidos)
    if (action === 'get_admin_data') {
      const pedSheet = obtenerOCrearPedidos(ss);
      const pedRows = pedSheet.getDataRange().getDisplayValues();
      const pedHeaders = pedRows.shift() || [];
      const pedidos = pedRows.map(r => {
        let obj = {};
        pedHeaders.forEach((h, i) => obj[h] = r[i] || '');
        return obj;
      }).reverse();

      return respuestaJSON({
        status: 'ok',
        catalog: leerCatalogo(ss, false),
        orders: pedidos,
        config: leerConfig(ss)
      });
    }

    // 2. SUBIR IMAGEN / GIF / VIDEO DIRECTO A GOOGLE DRIVE
    if (action === 'upload_file') {
      const folder = obtenerCarpetaPublica();
      const bytes = Utilities.base64Decode(body.base64);
      const safeName = `${Date.now()}_${(body.fileName || 'archivo').replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const blob = Utilities.newBlob(bytes, body.mimeType || 'application/octet-stream', safeName);
      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      const esVideo = String(body.mimeType || '').startsWith('video/');
      const driveLink = `https://drive.google.com/file/d/${file.getId()}/view${esVideo ? '#video' : ''}`;
      const previewUrl = esVideo
        ? `https://drive.google.com/file/d/${file.getId()}/preview`
        : `https://drive.google.com/thumbnail?id=${file.getId()}&sz=w1200`;

      return respuestaJSON({ status: 'ok', url: driveLink, previewUrl, isVideo: esVideo, fileName: safeName });
    }

    // 3. CREAR O EDITAR SERVICIO EN INVENTARIO
    if (action === 'save_service') {
      const sheetCat = ss.getSheetByName('Catalogo');
      const data = sheetCat.getDataRange().getDisplayValues();
      const rowValues = [
        body.id || String(Date.now()).slice(-5),
        body.categoria || 'Sistemas',
        body.nombre || '',
        body.descripcion || '',
        String(body.precio || '0'),
        body.entregables || '',
        body.imagen_drive || '',
        body.destacado ? 'SI' : 'NO',
        body.activo === false ? 'NO' : 'SI'
      ];

      if (body.id) {
        for (let i = 1; i < data.length; i++) {
          if (String(data[i][0]) === String(body.id)) {
            sheetCat.getRange(i + 1, 5).setNumberFormat('@');
            sheetCat.getRange(i + 1, 1, 1, 9).setValues([rowValues]);
            return respuestaJSON({ status: 'ok', message: 'Servicio actualizado' });
          }
        }
      }
      const nextRow = sheetCat.getLastRow() + 1;
      sheetCat.getRange(nextRow, 5).setNumberFormat('@');
      sheetCat.getRange(nextRow, 1, 1, 9).setValues([rowValues]);
      return respuestaJSON({ status: 'ok', message: 'Servicio creado' });
    }

    // 4. ACTIVAR / OCULTAR SERVICIO
    if (action === 'toggle_service') {
      const sheetCat = ss.getSheetByName('Catalogo');
      const data = sheetCat.getDataRange().getDisplayValues();
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(body.id)) {
          const nuevo = String(data[i][8]).toUpperCase() === 'SI' ? 'NO' : 'SI';
          sheetCat.getRange(i + 1, 9).setValue(nuevo);
          return respuestaJSON({ status: 'ok', activo: nuevo });
        }
      }
      return respuestaJSON({ status: 'error', message: 'ID no encontrado' });
    }

    // 5. ELIMINAR SERVICIO
    if (action === 'delete_service') {
      const sheetCat = ss.getSheetByName('Catalogo');
      const data = sheetCat.getDataRange().getDisplayValues();
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(body.id)) {
          sheetCat.deleteRow(i + 1);
          return respuestaJSON({ status: 'ok' });
        }
      }
      return respuestaJSON({ status: 'error', message: 'ID no encontrado' });
    }

    // 6. GUARDAR CONFIGURACIÓN DE INTERFAZ
    if (action === 'save_config') {
      const cfgSheet = obtenerOCrearConfig(ss);
      const entries = Object.entries(body.config || {});
      cfgSheet.clearContents();
      cfgSheet.getRange(1, 1, 1, 2).setValues([['clave', 'valor']]).setFontWeight('bold');
      if (entries.length) cfgSheet.getRange(2, 1, entries.length, 2).setValues(entries);
      return respuestaJSON({ status: 'ok' });
    }

    // 7. ACTUALIZAR ESTADO DE PEDIDO
    if (action === 'update_order_status') {
      const pedSheet = obtenerOCrearPedidos(ss);
      const data = pedSheet.getDataRange().getDisplayValues();
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(body.orden_id)) {
          pedSheet.getRange(i + 1, 10).setValue(body.estado || 'Procesado');
          return respuestaJSON({ status: 'ok' });
        }
      }
      return respuestaJSON({ status: 'error', message: 'Pedido no encontrado' });
    }

    // 8. CARGAR 5 EJEMPLOS PRO CON MÚLTIPLES IMÁGENES
    if (action === 'seed_5_examples') {
      const sheetCat = ss.getSheetByName('Catalogo');
      const ejemplos = [
        ['101', 'Sistemas Web', 'Tienda & Catálogo Dinámico', 'Plataforma comercial conectada a Google Sheets y Drive con panel administrativo y carrito.', '2,800', 'Diseño Dark/Light a medida|Carrito de compras y pedidos|Panel admin con subida a Drive|Hosting sin mensualidad', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80|https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80', 'SI', 'SI'],
        ['102', 'Automatización', 'Flujo de Ventas y CRM Automático', 'Captura prospectos desde web o WhatsApp, regístralos y dispara alertas automáticas.', '2,200', 'Integración n8n / Apps Script|Registro automático en base de datos|Notificaciones por correo y WhatsApp|Capacitación incluida', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80|https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80', 'NO', 'SI'],
        ['103', 'Datos & BI', 'Dashboard Gerencial en Tiempo Real', 'Centraliza ventas, gastos e inventario en tableros claros que se actualizan solos.', '1,900', 'Tablero interactivo Looker Studio|Conexión a hojas o bases de datos|Reportes programados al correo|Filtros por fecha y producto', 'https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&w=1000&q=80|https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80', 'NO', 'SI'],
        ['104', 'Sistemas Web', 'Landing Page de Alta Conversión', 'Sitio veloz enfocado en captar clientes desde Instagram y anuncios pagados.', '1,400', 'Diseño pensado para móvil|Velocidad optimizada|Formulario a Sheets + WhatsApp|Dominio configurado', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1000&q=80|https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=80', 'NO', 'SI'],
        ['105', 'Branding', 'Identidad Digital para Empresas Tech', 'Sistema visual limpio y escalable para lanzar tu marca con presencia seria.', '1,200', 'Logo vectorial SVG y PNG|Paleta Dark & Light|Plantillas base para Instagram|Mini guía de uso', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80|https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1000&q=80', 'NO', 'SI']
      ];
      const startRow = sheetCat.getLastRow() + 1;
      sheetCat.getRange(startRow, 5, ejemplos.length, 1).setNumberFormat('@');
      sheetCat.getRange(startRow, 1, ejemplos.length, 9).setValues(ejemplos);
      return respuestaJSON({ status: 'ok' });
    }

    // 9. CREAR PEDIDO DESDE LA TIENDA (CHECKOUT)
    if (action === 'create_order') {
      const pedSheet = obtenerOCrearPedidos(ss);
      const orderId = 'ZS-' + (1000 + pedSheet.getLastRow());
      pedSheet.appendRow([
        orderId,
        new Date(),
        body.cliente || '',
        body.telefono || '',
        body.correo || '',
        body.items_resumen || '',
        body.total || '',
        body.metodo_pago || 'Transferencia',
        body.notas || '',
        'Nuevo'
      ]);
      if (CORREO_NOTIFICACION && CORREO_NOTIFICACION.includes('@')) {
        MailApp.sendEmail({
          to: CORREO_NOTIFICACION,
          subject: `Nuevo Pedido ${orderId} - Zenda Studio (${body.total})`,
          body: `Pedido: ${orderId}\nCliente: ${body.cliente}\nWhatsApp: ${body.telefono}\nCorreo: ${body.correo}\nMétodo de pago: ${body.metodo_pago}\nTotal: ${body.total}\n\nPaquetes:\n${body.items_resumen}\n\nNotas:\n${body.notas}`
        });
      }
      return respuestaJSON({ status: 'ok', orderId });
    }

    // 10. COTIZACIÓN A MEDIDA
    const sheetCot = ss.getSheetByName('Cotizaciones');
    sheetCot.appendRow([
      new Date(), body.nombre || '', body.correo || '', body.telefono || '',
      body.paquete || 'Sistema a medida', body.presupuesto || '', body.mensaje || '', 'Nuevo'
    ]);
    if (CORREO_NOTIFICACION && CORREO_NOTIFICACION.includes('@')) {
      MailApp.sendEmail({
        to: CORREO_NOTIFICACION,
        subject: `Nueva cotización Zenda Studio: ${body.paquete || 'General'}`,
        body: `Nombre: ${body.nombre}\nCorreo: ${body.correo}\nWhatsApp: ${body.telefono}\nSolución: ${body.paquete}\nInversión: ${body.presupuesto}\n\nMensaje:\n${body.mensaje}`
      });
    }
    return respuestaJSON({ status: 'ok' });
  } catch (err) {
    return respuestaJSON({ status: 'error', message: err.toString() });
  }
}