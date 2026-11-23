const SHEET_CATALOGO = 'Catalogo';
const SHEET_COTIZACIONES = 'Cotizaciones';
const CORREO_NOTIFICACION = 'tu-correo@zendastudio.com'; // Cambia por tu correo real

function formatearImagenDrive(url) {
  if (!url) return '';
  const match = url.match(/[-\w]{25,}/);
  if (match && url.includes('drive.google.com')) {
    return `https://drive.google.com/thumbnail?id=${match[0]}&sz=w1000`;
  }
  return url;
}

function doGet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_CATALOGO);
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();

  const catalogo = data
    .map(row => {
      let item = {};
      headers.forEach((h, i) => item[h.trim().toLowerCase()] = row[i]);
      item.imagen_url = formatearImagenDrive(item.imagen_drive);
      return item;
    })
    .filter(item => String(item.activo).toUpperCase() === 'SI');

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', data: catalogo }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_COTIZACIONES);

    sheet.appendRow([
      new Date(),
      body.nombre || '',
      body.correo || '',
      body.telefono || '',
      body.paquete || 'Consulta general',
      body.presupuesto || '',
      body.mensaje || '',
      'Nuevo'
    ]);

    if (CORREO_NOTIFICACION && CORREO_NOTIFICACION.includes('@')) {
      MailApp.sendEmail({
        to: CORREO_NOTIFICACION,
        subject: `Nueva cotización Zenda Studio: ${body.paquete || 'General'}`,
        body: `Nombre: ${body.nombre}\nCorreo: ${body.correo}\nWhatsApp: ${body.telefono}\nPaquete: ${body.paquete}\nPresupuesto: ${body.presupuesto}\n\nMensaje:\n${body.mensaje}`
      });
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
