/**
 * ZENDA STUDIO — Generador de Plantillas Operativas con Branding (v3)
 * Paleta y tema parametrizables. Pensado para conectarse luego a Google Sheets.
 * Destino: Mi unidad > AGENCIA > ...
 */

const REEMPLAZAR_SI_EXISTE = false // true = manda a Papelera un archivo previo con el mismo nombre
const PASOS_PRISMA = 20;           // segmentos de la barra prismática (si Docs se queja, baja a 12)

/* ======================== CONFIGURACIÓN (EDITA AQUÍ) ======================== */

const CONFIG = {
  paleta: 'azulElectrico',   // azulElectrico | naranjaPulso | verdeEsmeralda | indigoPrisma | carmesiVivo
  tema: 'claro',             // claro | oscuro
  colores: null,             // opcional: ['#c1', '#c2', '#c3'] para un color propio de cliente
  cliente: '',               // si lo llenas, crea AGENCIA/06_CLIENTES/<cliente>/
  proyecto: '',              // opcional, crea subcarpeta del proyecto y rellena [Nombre del proyecto]
  plantillas: null,          // null = todas, o ['cotizacion', 'contrato', ...] (ver lista PLANTILLAS)
  estructura: false          // true = usa las 5 subcarpetas dentro de 05_PLANTILLAS_AGENCIA
};

/* ======================== TOKENS DE MARCA (MANUAL ZENDA) ======================== */

// Orden c1 · c2 · c3 exactamente como en el manual. Agrega aquí más paletas.
const PALETAS = {
  azulElectrico:  ['#0066ff', '#38bdf8', '#6366f1'],
  naranjaPulso:   ['#e8470f', '#fb923c', '#f43f5e'],
  verdeEsmeralda: ['#059669', '#14b8a6', '#0ea5e9'],
  indigoPrisma:   ['#6366f1', '#a855f7', '#38bdf8'],
  carmesiVivo:    ['#e11d48', '#fb7185', '#8b5cf6']
};

// Temas: base neutra 90%. Agrega aquí otros (ej. "premium").
const TEMAS = {
  claro: {
    bg: '#ffffff',
    superficie: '#f8f9fb',
    superficieSec: '#f2f4f7',
    textoPrincipal: '#0f1115',
    textoSecundario: '#525866',
    borde: '#eaecf0',
    okTexto: '#15803d',
    pendienteTexto: '#b45309',
    alertaTexto: '#b91c1c'
  },
  oscuro: {
    bg: '#0b0c10',
    superficie: '#14171f',
    superficieSec: '#1b1f2a',
    textoPrincipal: '#f5f7fa',
    textoSecundario: '#a3abba',
    borde: '#252a35',       // equivalente sólido de rgba(255,255,255,.09) sobre #0b0c10
    okTexto: '#4ade80',
    pendienteTexto: '#fbbf24',
    alertaTexto: '#f87171'
  }
};

const MARCA_FIJA = {
  // Semánticos (barras y fondos de estado)
  ok: '#16a34a',
  pendiente: '#f59e0b',
  alerta: '#ef4444',

  // Tipografías
  fuenteUI: 'Plus Jakarta Sans',
  fuenteMono: 'JetBrains Mono',

  // Dimensiones Carta (612 x 792 pt, márgenes 48pt -> 516pt útiles)
  anchoPagina: 612,
  altoPagina: 792,
  margenH: 48,
  margenTop: 36,
  margenBottom: 42,
  anchoUtil: 516,

  // Datos oficiales
  firma: 'zenda studio.',
  monograma: 'zs.',
  descriptor: 'Agencia de sistemas y soluciones digitales',
  promesa: 'Construimos sistemas que trabajan por tu negocio.',
  cierre: 'Todo se publica a tu nombre y tú lo controlas.',
  contacto: 'IG @zenda.studio.gt   ·   WhatsApp +502 5879-8301'
};

function construirMarca(paletaKey, temaKey, coloresCustom) {
  const prisma = (coloresCustom && coloresCustom.length === 3) ? coloresCustom : PALETAS[paletaKey];
  const tema = TEMAS[temaKey];
  if (!prisma) throw new Error('Paleta no existe: "' + paletaKey + '". Opciones: ' + Object.keys(PALETAS).join(', '));
  if (!tema) throw new Error('Tema no existe: "' + temaKey + '". Opciones: ' + Object.keys(TEMAS).join(', '));
  return Object.assign({}, MARCA_FIJA, tema, { acento: prisma[0], prisma: prisma, temaKey: temaKey });
}

// BRAND se reasigna en cada generación según paleta y tema
let BRAND = construirMarca('azulElectrico', 'claro');

/* ======================== REGISTRO DE PLANTILLAS ======================== */

const PLANTILLAS = [
  { id: 'cotizacion', base: 'PLANTILLA_01_Cotizacion_Zenda_Studio',            sub: '01_COMERCIAL_Y_COTIZACIONES',  fn: construirCotizacion },
  { id: 'contrato',   base: 'PLANTILLA_02_Acuerdo_de_Alcance_y_Contrato',      sub: '02_CONTRATOS_Y_ONBOARDING',    fn: construirContrato },
  { id: 'onboarding', base: 'PLANTILLA_03_Solicitud_de_Insumos_Onboarding',    sub: '02_CONTRATOS_Y_ONBOARDING',    fn: construirOnboarding },
  { id: 'acta_fase',  base: 'PLANTILLA_04_Acta_Aprobacion_de_Fase_Demo',       sub: '03_DEMOS_Y_APROBACIONES',      fn: construirActaFase },
  { id: 'entrega',    base: 'PLANTILLA_05_Acta_de_Entrega_Final_y_Accesos',    sub: '04_CIERRE_Y_ENTREGA',          fn: construirEntregaFinal },
  { id: 'mensajes',   base: 'PLANTILLA_06_Guiones_WhatsApp_y_Cobros_ACH_Zigi', sub: '05_MENSAJES_WHATSAPP_Y_PAGOS', fn: construirMensajes }
];

/* ======================== PUNTOS DE ENTRADA ======================== */

/* ======================== UNA PALETA POR CARPETA ======================== */

// true = toda la plantilla usa solo el color de su paleta (sin ámbar/verde de estado)
const MONOCROMO = true;

const COLOR_POR_CARPETA = {
  '01_COMERCIAL_Y_COTIZACIONES':  'azulElectrico',
  '02_CONTRATOS_Y_ONBOARDING':    'naranjaPulso',
  '03_DEMOS_Y_APROBACIONES':      'verdeEsmeralda',
  '04_CIERRE_Y_ENTREGA':          'indigoPrisma',
  '05_MENSAJES_WHATSAPP_Y_PAGOS': 'carmesiVivo'
};

// Las 6 plantillas, cada una con la paleta de su carpeta (tema claro)
function generarBasePorCarpeta() {
  generarPorCarpeta('claro');
}

// Lo mismo en tema oscuro (se guarda con sufijo _oscuro)
function generarBasePorCarpetaOscuro() {
  generarPorCarpeta('oscuro');
}

function generarPorCarpeta(tema) {
  const agencia = obtenerCarpetaRaiz('AGENCIA');
  const raiz = obtenerOCrearCarpeta(agencia, '05_PLANTILLAS_AGENCIA');

  PLANTILLAS.forEach(function (p) {
    const paleta = COLOR_POR_CARPETA[p.sub];
    if (!paleta) throw new Error('Falta paleta para la carpeta: ' + p.sub);

    BRAND = construirMarca(paleta, tema);
    const carpeta = obtenerOCrearCarpeta(raiz, p.sub);
    const nombre = p.base + (tema === 'oscuro' ? '_oscuro' : '');
    crearDocConBranding(carpeta, nombre, p.fn, {});
  });

  Logger.log('✅ Plantillas creadas, una paleta por carpeta (' + tema + ').');
}

// Genera con lo que pusiste en CONFIG
function generarDesdeConfig() {
  generarPaquete(CONFIG);
}

// Plantillas maestras: Azul Eléctrico, claro, en las 5 subcarpetas
function generarBase() {
  generarPaquete({ paleta: 'azulElectrico', tema: 'claro', estructura: true, cliente: '', proyecto: '' });
}

// La cotización en todas las paletas y temas, para elegir estilo (10 documentos)
function generarMuestrarioCotizacion() {
  Object.keys(PALETAS).forEach(function (p) {
    Object.keys(TEMAS).forEach(function (t) {
      generarPaquete({ paleta: p, tema: t, plantillas: ['cotizacion'], estructura: false, cliente: '', proyecto: '' });
    });
  });
}

/**
 * Función principal. Recibe un objeto de opciones (el mismo formato que CONFIG),
 * así luego una fila de Google Sheets puede mapearse directo a esto.
 */
function generarPaquete(opciones) {
  const opts = Object.assign({}, CONFIG, opciones || {});
  BRAND = construirMarca(opts.paleta, opts.tema, opts.colores);

  const agencia = obtenerCarpetaRaiz('AGENCIA');
  const raizPlantillas = obtenerOCrearCarpeta(agencia, '05_PLANTILLAS_AGENCIA');

  let destino;
  if (opts.estructura) {
    destino = raizPlantillas;
  } else if (opts.cliente) {
    destino = obtenerOCrearCarpeta(obtenerOCrearCarpeta(agencia, '06_CLIENTES'), limpiarNombre(opts.cliente));
    if (opts.proyecto) destino = obtenerOCrearCarpeta(destino, limpiarNombre(opts.proyecto));
  } else {
    destino = obtenerOCrearCarpeta(obtenerOCrearCarpeta(raizPlantillas, 'VARIANTES'), opts.paleta + '_' + opts.tema);
  }

  const lista = PLANTILLAS.filter(function (p) {
    return !opts.plantillas || opts.plantillas.indexOf(p.id) !== -1;
  });

  lista.forEach(function (p) {
    const carpeta = opts.estructura ? obtenerOCrearCarpeta(destino, p.sub) : destino;
    let nombre;
    if (opts.estructura) {
      nombre = p.base;
    } else if (opts.cliente) {
      nombre = p.base.replace('PLANTILLA_', 'DOC_') + '_' + limpiarNombre(opts.cliente);
    } else {
      nombre = p.base + '_' + opts.paleta + '_' + opts.tema;
    }
    crearDocConBranding(carpeta, nombre, p.fn, opts);
  });

  Logger.log('✅ Paquete listo (' + opts.paleta + ' · ' + opts.tema + ') en: ' + destino.getUrl());

  /* ======================== 5 PALETAS EN CADA CARPETA ======================== */

// Orden y numeración idénticos al Manual de Marca
const ORDEN_PALETAS = ['azulElectrico', 'naranjaPulso', 'verdeEsmeralda', 'indigoPrisma', 'carmesiVivo'];
const NOMBRES_PALETAS = {
  azulElectrico:  'Azul_Electrico',
  naranjaPulso:   'Naranja_Pulso',
  verdeEsmeralda: 'Verde_Esmeralda',
  indigoPrisma:   'Indigo_Prisma',
  carmesiVivo:    'Carmesi_Vivo'
};

// Tema claro: 30 documentos
function generarBaseCincoPaletas() {
  generarCincoPaletas('claro');
}

// Tema oscuro: otros 30 documentos (con sufijo _oscuro)
function generarBaseCincoPaletasOscuro() {
  generarCincoPaletas('oscuro');
}

/**
 * Crea cada plantilla en las 5 paletas dentro de su subcarpeta.
 * - Omite lo que ya existe, así que si Apps Script corta por tiempo (límite ~6 min),
 *   solo vuelve a ejecutar la misma función y continúa donde se quedó.
 */
function generarCincoPaletas(tema) {
  const inicio = Date.now();
  const LIMITE_MS = 4.5 * 60 * 1000;

  const agencia = obtenerCarpetaRaiz('AGENCIA');
  const raiz = obtenerOCrearCarpeta(agencia, '05_PLANTILLAS_AGENCIA');

  let creados = 0;
  let omitidos = 0;

  for (let i = 0; i < ORDEN_PALETAS.length; i++) {
    const paletaKey = ORDEN_PALETAS[i];
    BRAND = construirMarca(paletaKey, tema);

    for (let j = 0; j < PLANTILLAS.length; j++) {
      const p = PLANTILLAS[j];
      const carpeta = obtenerOCrearCarpeta(raiz, p.sub);
      const nombre = p.base + '_P' + (i + 1) + '_' + NOMBRES_PALETAS[paletaKey] +
                     (tema === 'oscuro' ? '_oscuro' : '');

      if (carpeta.getFilesByName(nombre).hasNext()) {
        omitidos++;
        continue;
      }

      if (Date.now() - inicio > LIMITE_MS) {
        Logger.log('⏸️ Pausa por límite de tiempo. Creados: ' + creados + ' · Ya existían: ' + omitidos +
                   '. Vuelve a ejecutar esta función para continuar.');
        return;
      }

      crearDocConBranding(carpeta, nombre, p.fn, {});
      creados++;
    }
  }

  Logger.log('✅ Listo (' + tema + '). Creados: ' + creados + ' · Ya existían: ' + omitidos);
}
}

/* ======================== MOTOR DE ARCHIVOS ======================== */

function obtenerCarpetaRaiz(nombre) {
  const it = DriveApp.getFoldersByName(nombre);
  return it.hasNext() ? it.next() : DriveApp.getRootFolder().createFolder(nombre);
}

function obtenerOCrearCarpeta(padre, nombre) {
  const it = padre.getFoldersByName(nombre);
  return it.hasNext() ? it.next() : padre.createFolder(nombre);
}

function limpiarNombre(txt) {
  return String(txt).replace(/[\\\/:*?"<>|]/g, '-').trim();
}

function crearDocConBranding(carpeta, nombre, constructorFn, opts) {
  const existentes = carpeta.getFilesByName(nombre);
  if (existentes.hasNext()) {
    if (!REEMPLAZAR_SI_EXISTE) {
      Logger.log('⏭️ Ya existe: ' + nombre);
      return existentes.next();
    }
    while (existentes.hasNext()) {
      existentes.next().setTrashed(true);
    }
  }

  const doc = DocumentApp.create(nombre);
  const body = doc.getBody();
  configurarDocumentoBase(doc, body);

  constructorFn(doc, body);
  limpiarPrimerParrafoVacio(body);
  ajustarUltimoParrafo(body);
  rellenarDatos(body, opts);

  doc.saveAndClose();

  const file = DriveApp.getFileById(doc.getId());
  file.moveTo(carpeta);
  Logger.log('📄 Creado: ' + nombre);
  return file;
}

// Rellena los placeholders básicos si hay cliente / proyecto
function rellenarDatos(body, opts) {
  const seguro = function (s) { return String(s).replace(/\$/g, '$$$$'); };
  if (opts.cliente) {
    body.replaceText('\\[Nombre del cliente\\]', seguro(opts.cliente));
    body.replaceText('\\[Nombre completo / Empresa\\]', seguro(opts.cliente));
  }
  if (opts.proyecto) {
    body.replaceText('\\[Nombre del proyecto\\]', seguro(opts.proyecto));
    body.replaceText('\\[Proyecto\\]', seguro(opts.proyecto));
  }
}

/* ======================== UTILIDADES DE COLOR ======================== */

function hexARgb(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
}

function rgbAHex(rgb) {
  return '#' + rgb.map(function (v) { return ('0' + Math.round(v).toString(16)).slice(-2); }).join('');
}

function mezclarColores(a, b, t) {
  const A = hexARgb(a), B = hexARgb(b);
  return rgbAHex(A.map(function (v, i) { return v + (B[i] - v) * t; }));
}

// Degradado c1 -> c2 -> c3 en N pasos
function generarGradiente(colores, pasos) {
  const salida = [];
  for (let i = 0; i < pasos; i++) {
    const t = pasos === 1 ? 0 : i / (pasos - 1);
    salida.push(t <= 0.5
      ? mezclarColores(colores[0], colores[1], t * 2)
      : mezclarColores(colores[1], colores[2], (t - 0.5) * 2));
  }
  return salida;
}

// Los colores semánticos no siempre se leen como texto: usa la variante del tema
function colorTexto(c) {
  const m = {};
  m[MARCA_FIJA.ok] = BRAND.okTexto;
  m[MARCA_FIJA.pendiente] = BRAND.pendienteTexto;
  m[MARCA_FIJA.alerta] = BRAND.alertaTexto;
  return m[c] || c;
}

/* ======================== SISTEMA DE COMPONENTES VISUALES ======================== */

function configurarDocumentoBase(doc, body) {
  body.setPageWidth(BRAND.anchoPagina);
  body.setPageHeight(BRAND.altoPagina);
  body.setMarginTop(BRAND.margenTop);
  body.setMarginBottom(BRAND.margenBottom);
  body.setMarginLeft(BRAND.margenH);
  body.setMarginRight(BRAND.margenH);

  // Color de página (clave para el tema oscuro). Si tu cuenta no lo permite, no rompe el script.
  try {
    body.setBackgroundColor(BRAND.bg);
  } catch (e) {
    Logger.log('⚠️ No se pudo aplicar el color de página (' + e.message + '). El documento queda con fondo blanco.');
  }

  // Pie de página oficial en todas las páginas
  const footer = doc.getFooter() || doc.addFooter();
  const parrafosFooter = footer.getParagraphs();
  if (parrafosFooter.length > 0) {
    const p0 = parrafosFooter[0];
    p0.setSpacingBefore(0);
    p0.setSpacingAfter(0);
    p0.editAsText().setFontSize(1);
  }

  const tblFooter = footer.appendTable([['', '']]);
  tblFooter.setBorderWidth(0);
  tblFooter.setBorderColor(BRAND.bg);
  tblFooter.setColumnWidth(0, 260);
  tblFooter.setColumnWidth(1, BRAND.anchoUtil - 260);

  // Celda izquierda: monograma zs. + promesa corta
  const cIzq = tblFooter.getCell(0, 0);
  estilizarCelda(cIzq, BRAND.bg, 6, 0, 0, 4);
  const pIzq = cIzq.getChild(0).asParagraph();
  pIzq.setText(BRAND.monograma + '   ' + BRAND.promesa);
  pIzq.setSpacingBefore(0);
  pIzq.setSpacingAfter(0);

  const tIzq = pIzq.editAsText();
  tIzq.setFontFamily(BRAND.fuenteUI);
  tIzq.setFontSize(8);
  tIzq.setForegroundColor(BRAND.textoSecundario);
  tIzq.setBold(0, 2, true);
  tIzq.setForegroundColor(0, 1, BRAND.textoPrincipal);
  tIzq.setForegroundColor(2, 2, BRAND.acento); // punto de acento en zs.

  // Celda derecha: contacto
  const cDer = tblFooter.getCell(0, 1);
  estilizarCelda(cDer, BRAND.bg, 6, 0, 4, 0);
  const pDer = cDer.getChild(0).asParagraph();
  pDer.setText(BRAND.contacto);
  pDer.setAlignment(DocumentApp.HorizontalAlignment.RIGHT);
  pDer.setSpacingBefore(0);
  pDer.setSpacingAfter(0);

  const tDer = pDer.editAsText();
  tDer.setFontFamily(BRAND.fuenteMono);
  tDer.setFontSize(7.5);
  tDer.setForegroundColor(BRAND.textoSecundario);
}

function limpiarPrimerParrafoVacio(body) {
  if (body.getNumChildren() > 1) {
    const primero = body.getChild(0);
    if (primero.getType() === DocumentApp.ElementType.PARAGRAPH && primero.asParagraph().getText() === '') {
      body.removeChild(primero);
    }
  }
}

// Evita que el párrafo vacío final empuje una página en blanco
function ajustarUltimoParrafo(body) {
  const ultimo = body.getChild(body.getNumChildren() - 1);
  if (ultimo.getType() === DocumentApp.ElementType.PARAGRAPH && ultimo.asParagraph().getText() === '') {
    const p = ultimo.asParagraph();
    p.setSpacingBefore(0);
    p.setSpacingAfter(0);
    p.editAsText().setFontSize(1);
  }
}

function agregarEspacio(body, tamano) {
  const p = body.appendParagraph('');
  p.setSpacingBefore(0);
  p.setSpacingAfter(0);
  p.editAsText().setFontSize(tamano || 6);
}

function estilizarCelda(cell, bg, padTop, padBottom, padLeft, padRight) {
  cell.setBackgroundColor(bg);
  cell.setPaddingTop(padTop);
  cell.setPaddingBottom(padBottom);
  cell.setPaddingLeft(padLeft);
  cell.setPaddingRight(padRight);
  cell.setVerticalAlignment(DocumentApp.VerticalAlignment.CENTER);
}

/**
 * Barra Prismática Superior: degradado real c1 -> c2 -> c3 en PASOS_PRISMA segmentos
 */
function agregarBarraPrismatica(body, paleta) {
  const colores = generarGradiente(paleta || BRAND.prisma, PASOS_PRISMA);
  const tbl = body.appendTable([colores.map(function () { return ''; })]);
  tbl.setBorderWidth(0);
  tbl.setBorderColor(BRAND.bg);

  const anchoCol = BRAND.anchoUtil / colores.length;
  colores.forEach(function (color, i) {
    tbl.setColumnWidth(i, anchoCol);
    const cell = tbl.getCell(0, i);
    estilizarCelda(cell, color, 0, 0, 0, 0);
    const p = cell.getChild(0).asParagraph();
    p.setSpacingBefore(0);
    p.setSpacingAfter(0);
    p.setLineSpacing(1);
    p.editAsText().setFontSize(3);
  });
}

/**
 * Cabecera oficial: logotipo + descriptor, badge técnico y título
 */
function agregarCabeceraDocumento(body, opts) {
  agregarBarraPrismatica(body, BRAND.prisma);
  agregarEspacio(body, 6);

  const tblHead = body.appendTable([['', '']]);
  tblHead.setBorderWidth(0);
  tblHead.setBorderColor(BRAND.bg);
  tblHead.setColumnWidth(0, 316);
  tblHead.setColumnWidth(1, 200);

  // Logo zenda studio. + descriptor
  const cLogo = tblHead.getCell(0, 0);
  estilizarCelda(cLogo, BRAND.bg, 2, 2, 0, 6);
  const pLogo = cLogo.getChild(0).asParagraph();
  const textoLogo = BRAND.firma + '\n' + BRAND.descriptor;
  pLogo.setText(textoLogo);
  pLogo.setSpacingBefore(0);
  pLogo.setSpacingAfter(0);
  pLogo.setLineSpacing(1.1);

  const tLogo = pLogo.editAsText();
  const finLogo = BRAND.firma.length - 1;
  tLogo.setFontFamily(0, finLogo, BRAND.fuenteUI);
  tLogo.setFontSize(0, finLogo, 18);
  tLogo.setBold(0, finLogo, true);
  tLogo.setForegroundColor(0, finLogo, BRAND.textoPrincipal);
  tLogo.setForegroundColor(finLogo, finLogo, BRAND.acento); // punto de acento

  tLogo.setFontFamily(finLogo + 2, textoLogo.length - 1, BRAND.fuenteUI);
  tLogo.setFontSize(finLogo + 2, textoLogo.length - 1, 8);
  tLogo.setBold(finLogo + 2, textoLogo.length - 1, false);
  tLogo.setForegroundColor(finLogo + 2, textoLogo.length - 1, BRAND.textoSecundario);

  // Etiqueta de tipo de documento (derecha)
  const cTag = tblHead.getCell(0, 1);
  estilizarCelda(cTag, BRAND.superficieSec, 6, 6, 10, 10);
  const pTag = cTag.getChild(0).asParagraph();
  pTag.setText(opts.codigo);
  pTag.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  pTag.setSpacingBefore(0);
  pTag.setSpacingAfter(0);

  const tTag = pTag.editAsText();
  tTag.setFontFamily(BRAND.fuenteMono);
  tTag.setFontSize(8.5);
  tTag.setBold(true);
  tTag.setForegroundColor(BRAND.acento);

  // Título principal del documento
  const pTitulo = body.appendParagraph(opts.titulo);
  pTitulo.setSpacingBefore(12);
  pTitulo.setSpacingAfter(3);
  pTitulo.setLineSpacing(1.1);

  const tTitulo = pTitulo.editAsText();
  tTitulo.setFontFamily(BRAND.fuenteUI);
  tTitulo.setFontSize(20);
  tTitulo.setBold(true);
  tTitulo.setForegroundColor(BRAND.textoPrincipal);

  // Subtítulo contextual
  if (opts.subtitulo) {
    const pSub = body.appendParagraph(opts.subtitulo);
    pSub.setSpacingBefore(0);
    pSub.setSpacingAfter(10);
    pSub.setLineSpacing(1.4);

    const tSub = pSub.editAsText();
    tSub.setFontFamily(BRAND.fuenteUI);
    tSub.setFontSize(9.5);
    tSub.setBold(false);
    tSub.setForegroundColor(BRAND.textoSecundario);
  }
}

/**
 * Tarjeta de Metadatos en grilla de 2 columnas
 */
function agregarTarjetaMeta(body, filas) {
  const matriz = filas.map(function () { return ['', '']; });
  const tbl = body.appendTable(matriz);
  tbl.setBorderWidth(0.75);
  tbl.setBorderColor(BRAND.borde);
  tbl.setColumnWidth(0, 258);
  tbl.setColumnWidth(1, 258);

  filas.forEach(function (par, r) {
    par.forEach(function (item, c) {
      const cell = tbl.getCell(r, c);
      estilizarCelda(cell, BRAND.superficie, 7, 7, 10, 10);
      const p = cell.getChild(0).asParagraph();
      const full = item.etiqueta.toUpperCase() + '\n' + item.valor;
      p.setText(full);
      p.setSpacingBefore(0);
      p.setSpacingAfter(0);
      p.setLineSpacing(1.25);

      const t = p.editAsText();
      const corte = item.etiqueta.length;
      if (corte > 0) {
        t.setFontFamily(0, corte - 1, BRAND.fuenteMono);
        t.setFontSize(0, corte - 1, 7.5);
        t.setBold(0, corte - 1, true);
        t.setForegroundColor(0, corte - 1, BRAND.textoSecundario);
      }
      if (full.length > corte + 1) {
        t.setFontFamily(corte + 1, full.length - 1, item.mono ? BRAND.fuenteMono : BRAND.fuenteUI);
        t.setFontSize(corte + 1, full.length - 1, 9.5);
        t.setBold(corte + 1, full.length - 1, Boolean(item.destacado));
        t.setForegroundColor(corte + 1, full.length - 1, item.destacado ? BRAND.acento : BRAND.textoPrincipal);
      }
    });
  });
}

/**
 * Encabezado de Sección numerado: 01   TÍTULO DE SECCIÓN
 */
function agregarSeccion(body, numero, titulo) {
  const texto = numero + '   ' + titulo.toUpperCase();
  const p = body.appendParagraph(texto);
  p.setSpacingBefore(14);
  p.setSpacingAfter(6);
  p.setLineSpacing(1.2);

  const t = p.editAsText();
  t.setFontFamily(0, numero.length - 1, BRAND.fuenteMono);
  t.setFontSize(0, numero.length - 1, 9.5);
  t.setBold(0, numero.length - 1, true);
  t.setForegroundColor(0, numero.length - 1, BRAND.acento);

  t.setFontFamily(numero.length, texto.length - 1, BRAND.fuenteUI);
  t.setFontSize(numero.length, texto.length - 1, 10.5);
  t.setBold(numero.length, texto.length - 1, true);
  t.setForegroundColor(numero.length, texto.length - 1, BRAND.textoPrincipal);
}

/**
 * Tabla estilizada con cabecera de superficie secundaria
 */
function agregarTablaEstilizada(body, encabezados, filas, anchos) {
  const datos = [encabezados].concat(filas);
  const tbl = body.appendTable(datos);
  tbl.setBorderWidth(0.75);
  tbl.setBorderColor(BRAND.borde);

  anchos.forEach(function (w, i) { tbl.setColumnWidth(i, w); });

  // Cabecera
  for (let c = 0; c < encabezados.length; c++) {
    const cell = tbl.getCell(0, c);
    estilizarCelda(cell, BRAND.superficieSec, 7, 7, 9, 9);
    const p = cell.getChild(0).asParagraph();
    p.setSpacingBefore(0);
    p.setSpacingAfter(0);
    if (encabezados[c].length > 0) {
      const t = p.editAsText();
      t.setFontFamily(BRAND.fuenteMono);
      t.setFontSize(8);
      t.setBold(true);
      t.setForegroundColor(BRAND.textoSecundario);
    }
  }

  // Filas de datos
  for (let r = 1; r < datos.length; r++) {
    const bgFila = r % 2 === 0 ? BRAND.superficie : BRAND.bg;
    for (let c = 0; c < encabezados.length; c++) {
      const cell = tbl.getCell(r, c);
      estilizarCelda(cell, bgFila, 7, 7, 9, 9);
      const p = cell.getChild(0).asParagraph();
      p.setSpacingBefore(0);
      p.setSpacingAfter(0);
      p.setLineSpacing(1.3);
      const txt = datos[r][c];
      if (txt && txt.length > 0) {
        const t = p.editAsText();
        t.setFontFamily(c === 0 && txt.length <= 10 ? BRAND.fuenteMono : BRAND.fuenteUI);
        t.setFontSize(9);
        t.setBold(c === 0);
        t.setForegroundColor(BRAND.textoPrincipal);
      }
    }
  }
  return tbl;
}

/**
 * Checklist estructurado en tabla limpia
 */
function agregarChecklist(body, items) {
  const matriz = items.map(function () { return ['', '']; });
  const tbl = body.appendTable(matriz);
  tbl.setBorderWidth(0.75);
  tbl.setBorderColor(BRAND.borde);
  tbl.setColumnWidth(0, 28);
  tbl.setColumnWidth(1, BRAND.anchoUtil - 28);

  items.forEach(function (item, i) {
    const bg = i % 2 === 0 ? BRAND.bg : BRAND.superficie;

    // Columna checkbox
    const cCheck = tbl.getCell(i, 0);
    estilizarCelda(cCheck, bg, 6, 6, 4, 4);
    const pCheck = cCheck.getChild(0).asParagraph();
    pCheck.setText('☐');
    pCheck.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    pCheck.setSpacingBefore(0);
    pCheck.setSpacingAfter(0);

    const tCheck = pCheck.editAsText();
    tCheck.setFontFamily(BRAND.fuenteUI);
    tCheck.setFontSize(11);
    tCheck.setForegroundColor(BRAND.acento);

    // Columna contenido
    const cTxt = tbl.getCell(i, 1);
    estilizarCelda(cTxt, bg, 6, 6, 8, 10);
    const pTxt = cTxt.getChild(0).asParagraph();
    const prefijo = item.codigo ? item.codigo + '  ' : '';
    const sufijo = item.detalle ? ' — ' + item.detalle : '';
    const full = prefijo + item.titulo + sufijo;

    pTxt.setText(full);
    pTxt.setSpacingBefore(0);
    pTxt.setSpacingAfter(0);
    pTxt.setLineSpacing(1.3);

    const t = pTxt.editAsText();
    t.setFontFamily(BRAND.fuenteUI);
    t.setFontSize(9.2);
    t.setForegroundColor(BRAND.textoPrincipal);

    let offset = 0;
    if (prefijo.length > 0) {
      t.setFontFamily(0, item.codigo.length - 1, BRAND.fuenteMono);
      t.setFontSize(0, item.codigo.length - 1, 8);
      t.setBold(0, item.codigo.length - 1, true);
      t.setForegroundColor(0, item.codigo.length - 1, BRAND.acento);
      offset = prefijo.length;
    }

    t.setBold(offset, offset + item.titulo.length - 1, true);

    if (sufijo.length > 0) {
      const inicioDetalle = offset + item.titulo.length;
      t.setBold(inicioDetalle, full.length - 1, false);
      t.setForegroundColor(inicioDetalle, full.length - 1, BRAND.textoSecundario);
    }
  });
}

/**
 * Pasos 01 · 02 · 03 en tarjetas separadas (mismo patrón que "Cómo trabajamos" de la web)
 */
function agregarPasos(body, pasos) {
  const tbl = body.appendTable([pasos.map(function () { return ''; })]);
  tbl.setBorderWidth(3);          // borde del color de fondo = separación entre tarjetas
  tbl.setBorderColor(BRAND.bg);

  const ancho = BRAND.anchoUtil / pasos.length;
  pasos.forEach(function (paso, i) {
    tbl.setColumnWidth(i, ancho);
    const cell = tbl.getCell(0, i);
    estilizarCelda(cell, BRAND.superficie, 10, 10, 12, 12);
    cell.setVerticalAlignment(DocumentApp.VerticalAlignment.TOP);

    const p = cell.getChild(0).asParagraph();
    const full = paso.numero + '\n' + paso.titulo + '\n' + paso.detalle;
    p.setText(full);
    p.setSpacingBefore(0);
    p.setSpacingAfter(0);
    p.setLineSpacing(1.3);

    const t = p.editAsText();
    t.setFontFamily(BRAND.fuenteUI);
    t.setFontSize(8.5);
    t.setBold(false);
    t.setForegroundColor(BRAND.textoSecundario);

    const n = paso.numero.length;
    const tt = paso.titulo.length;

    t.setFontFamily(0, n - 1, BRAND.fuenteMono);
    t.setFontSize(0, n - 1, 15);
    t.setBold(0, n - 1, true);
    t.setForegroundColor(0, n - 1, BRAND.acento);

    t.setFontSize(n + 1, n + tt, 10);
    t.setBold(n + 1, n + tt, true);
    t.setForegroundColor(n + 1, n + tt, BRAND.textoPrincipal);
  });
}

/**
 * Callout con barra lateral izquierda de 4pt
 */
function agregarCallout(body, etiqueta, texto, colorAcento) {
  const color = MONOCROMO ? BRAND.acento : (colorAcento || BRAND.acento);
  agregarEspacio(body, 4);

  const tbl = body.appendTable([['', '']]);
  tbl.setBorderWidth(0);
  tbl.setBorderColor(BRAND.bg);
  tbl.setColumnWidth(0, 4);
  tbl.setColumnWidth(1, BRAND.anchoUtil - 4);

  const cBarra = tbl.getCell(0, 0);
  estilizarCelda(cBarra, color, 0, 0, 0, 0);
  const pBarra = cBarra.getChild(0).asParagraph();
  pBarra.setSpacingBefore(0);
  pBarra.setSpacingAfter(0);
  pBarra.editAsText().setFontSize(2);

  const cBody = tbl.getCell(0, 1);
  estilizarCelda(cBody, BRAND.superficie, 9, 9, 12, 12);
  const p = cBody.getChild(0).asParagraph();
  const full = etiqueta.toUpperCase() + '\n' + texto;
  p.setText(full);
  p.setSpacingBefore(0);
  p.setSpacingAfter(0);
  p.setLineSpacing(1.35);

  const t = p.editAsText();
  const corte = etiqueta.length;
  t.setFontFamily(0, corte - 1, BRAND.fuenteMono);
  t.setFontSize(0, corte - 1, 8);
  t.setBold(0, corte - 1, true);
  t.setForegroundColor(0, corte - 1, colorTexto(color));

  t.setFontFamily(corte + 1, full.length - 1, BRAND.fuenteUI);
  t.setFontSize(corte + 1, full.length - 1, 9);
  t.setBold(corte + 1, full.length - 1, false);
  t.setForegroundColor(corte + 1, full.length - 1, BRAND.textoPrincipal);
}

/**
 * Bloque de firmas limpio al cierre de contratos y actas
 */
function agregarBloqueFirmas(body, tituloIzq, tituloDer) {
  agregarEspacio(body, 10);

  const tbl = body.appendTable([['', '']]);
  tbl.setBorderWidth(0.75);
  tbl.setBorderColor(BRAND.borde);
  tbl.setColumnWidth(0, 258);
  tbl.setColumnWidth(1, 258);

  [tituloIzq, tituloDer].forEach(function (label, idx) {
    const cell = tbl.getCell(0, idx);
    estilizarCelda(cell, BRAND.superficie, 10, 10, 12, 12);
    const p = cell.getChild(0).asParagraph();
    const full = label.toUpperCase() + '\n\n______________________________\nNombre / Fecha / Confirmación';
    p.setText(full);
    p.setSpacingBefore(0);
    p.setSpacingAfter(0);
    p.setLineSpacing(1.3);

    const t = p.editAsText();
    t.setFontFamily(0, label.length - 1, BRAND.fuenteMono);
    t.setFontSize(0, label.length - 1, 8);
    t.setBold(0, label.length - 1, true);
    t.setForegroundColor(0, label.length - 1, BRAND.acento);

    t.setFontFamily(label.length, full.length - 1, BRAND.fuenteUI);
    t.setFontSize(label.length, full.length - 1, 8.5);
    t.setBold(label.length, full.length - 1, false);
    t.setForegroundColor(label.length, full.length - 1, BRAND.textoSecundario);
  });
}

/**
 * Cierre de marca: frase final centrada con punto de acento (firma visual)
 */
function agregarCierreMarca(body, frase) {
  agregarEspacio(body, 10);
  const texto = frase || BRAND.cierre;
  const p = body.appendParagraph(texto);
  p.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  p.setSpacingBefore(8);
  p.setSpacingAfter(0);

  const t = p.editAsText();
  t.setFontFamily(BRAND.fuenteUI);
  t.setFontSize(9.5);
  t.setBold(true);
  t.setForegroundColor(BRAND.textoPrincipal);
  t.setForegroundColor(texto.length - 1, texto.length - 1, BRAND.acento);
}

/**
 * Tarjeta de guion de WhatsApp lista para copiar/pegar
 */
function agregarBloqueGuion(body, codigo, titulo, momento, mensaje, colorBarra) {
  agregarEspacio(body, 6);
  const color = colorBarra || BRAND.acento;

  const textoHead = codigo + '   ' + titulo + '  ·  ' + momento;
  const pHead = body.appendParagraph(textoHead);
  pHead.setSpacingBefore(4);
  pHead.setSpacingAfter(4);

  const tHead = pHead.editAsText();
  tHead.setFontFamily(0, codigo.length - 1, BRAND.fuenteMono);
  tHead.setFontSize(0, codigo.length - 1, 8.5);
  tHead.setBold(0, codigo.length - 1, true);
  tHead.setForegroundColor(0, codigo.length - 1, colorTexto(color));

  const inicioTitulo = codigo.length + 3;
  const finTitulo = inicioTitulo + titulo.length - 1;
  tHead.setFontFamily(inicioTitulo, finTitulo, BRAND.fuenteUI);
  tHead.setFontSize(inicioTitulo, finTitulo, 10);
  tHead.setBold(inicioTitulo, finTitulo, true);
  tHead.setForegroundColor(inicioTitulo, finTitulo, BRAND.textoPrincipal);

  tHead.setFontFamily(finTitulo + 1, textoHead.length - 1, BRAND.fuenteUI);
  tHead.setFontSize(finTitulo + 1, textoHead.length - 1, 8.5);
  tHead.setBold(finTitulo + 1, textoHead.length - 1, false);
  tHead.setForegroundColor(finTitulo + 1, textoHead.length - 1, BRAND.textoSecundario);

  const tbl = body.appendTable([['', '']]);
  tbl.setBorderWidth(0);
  tbl.setBorderColor(BRAND.bg);
  tbl.setColumnWidth(0, 4);
  tbl.setColumnWidth(1, BRAND.anchoUtil - 4);

  const cBarra = tbl.getCell(0, 0);
  estilizarCelda(cBarra, color, 0, 0, 0, 0);
  const pBarra = cBarra.getChild(0).asParagraph();
  pBarra.setSpacingBefore(0);
  pBarra.setSpacingAfter(0);
  pBarra.editAsText().setFontSize(2);

  const cMsg = tbl.getCell(0, 1);
  estilizarCelda(cMsg, BRAND.superficie, 10, 10, 14, 14);
  const pMsg = cMsg.getChild(0).asParagraph();
  pMsg.setText(mensaje);
  pMsg.setSpacingBefore(0);
  pMsg.setSpacingAfter(0);
  pMsg.setLineSpacing(1.4);

  const tMsg = pMsg.editAsText();
  tMsg.setFontFamily(BRAND.fuenteUI);
  tMsg.setFontSize(9.5);
  tMsg.setBold(false);
  tMsg.setForegroundColor(BRAND.textoPrincipal);
}

/* ======================== PLANTILLA 01: COTIZACIÓN ======================== */

function construirCotizacion(doc, body) {
  agregarCabeceraDocumento(body, {
    codigo: 'ZS-COT-[001]',
    titulo: 'Cotización de Servicios Digitales',
    subtitulo: 'Propuesta formal de alcance, cronograma e inversión. Todo se publica a tu nombre y bajo tu control.'
  });

  agregarTarjetaMeta(body, [
    [
      { etiqueta: 'Cliente / Empresa', valor: '[Nombre del cliente]' },
      { etiqueta: 'Fecha de emisión', valor: '[DD/MM/AAAA]', mono: true }
    ],
    [
      { etiqueta: 'WhatsApp / Teléfono', valor: '[+502 0000-0000]' },
      { etiqueta: 'Vigencia de cotización', valor: '10 días calendario', destacado: true }
    ],
    [
      { etiqueta: 'Correo electrónico', valor: '[correo@cliente.com]' },
      { etiqueta: 'Referencia interna', valor: 'DOC-01 · COMERCIAL', mono: true }
    ]
  ]);

  agregarSeccion(body, '01', 'Paquete seleccionado');
  agregarChecklist(body, [
    { codigo: 'IND-01', titulo: 'Individual — Consultoría / Soporte Digital', detalle: '1 persona' },
    { codigo: 'IND-02', titulo: 'Individual — Proyecto Personal', detalle: '1 persona' },
    { codigo: 'EMP-01', titulo: 'Emprendimiento — Primeros Pasos', detalle: '1 persona' },
    { codigo: 'EMP-02', titulo: 'Emprendimiento — Mi Tienda', detalle: '2 a 3 personas' },
    { codigo: 'EMP-03', titulo: 'Emprendimiento — Mi Negocio', detalle: '4 a 8 personas' },
    { codigo: 'EMP-04', titulo: 'Emprendimiento — PyME', detalle: '9+ personas' }
  ]);

  agregarSeccion(body, '02', 'Alcance y entregables incluidos');
  agregarTablaEstilizada(
    body,
    ['ITEM', 'ENTREGABLE', 'DETALLE OPERATIVO'],
    [
      ['01', '[Entregable 1]', '[Descripción clara de lo que recibe el cliente]'],
      ['02', '[Entregable 2]', '[Descripción clara de lo que recibe el cliente]'],
      ['03', '[Entregable 3]', '[Descripción clara de lo que recibe el cliente]']
    ],
    [52, 164, 300]
  );

  agregarSeccion(body, '03', 'Cómo trabajamos');
  agregarPasos(body, [
    { numero: '01', titulo: 'Eliges tu paquete',      detalle: 'Nos escribes por WhatsApp, confirmamos qué necesitas y te damos el costo.' },
    { numero: '02', titulo: 'Revisas avances reales', detalle: 'Te damos un enlace privado para probar desde tu celular y pedir cambios.' },
    { numero: '03', titulo: 'Queda en tus cuentas',   detalle: 'Todo se publica a tu nombre, para que tú lo controles.' }
  ]);

  agregarSeccion(body, '04', 'Fases y tiempo estimado');
  agregarTablaEstilizada(
    body,
    ['FASE', 'DESCRIPCIÓN DEL AVANCE', 'TIEMPO EST.'],
    [
      ['FASE 01', '[Diseño base, estructura e integración inicial]', '[X días]'],
      ['FASE 02', '[Pruebas técnicas, demo y ajustes finales]', '[X días]'],
      ['TOTAL', 'Tiempo total estimado (a partir de anticipo e insumos acreditados)', '[X días hábiles]']
    ],
    [76, 336, 104]
  );

  agregarSeccion(body, '05', 'Exclusiones (no incluido)');
  agregarCallout(
    body,
    'Claridad de alcance',
    '• Funciones, módulos o integraciones adicionales fuera del alcance descrito se cotizan aparte como extra o fase adicional.\n• Costos de dominio propio, licencias o servicios externos de pago (si aplican) corren por cuenta del cliente.',
    MARCA_FIJA.pendiente
  );

  agregarSeccion(body, '06', 'Inversión y plan de pagos');
  agregarTarjetaMeta(body, [
    [
      { etiqueta: 'Inversión total del proyecto', valor: 'Q [0,000.00]', mono: true, destacado: true },
      { etiqueta: 'Moneda / Condición', valor: 'Quetzales (GTQ) · Sin costos ocultos' }
    ],
    [
      { etiqueta: 'Impuestos y factura', valor: '[IVA incluido / no incluido · Tipo de factura]' },
      { etiqueta: 'Anticipo para iniciar', valor: '[%] · Q [0,000.00]', mono: true }
    ]
  ]);

  agregarEspacio(body, 4);

  agregarChecklist(body, [
    { codigo: '1 PAGO',  titulo: '100% adelantado', detalle: 'Consultoría / Soporte Digital' },
    { codigo: '2 PAGOS', titulo: '50% inicio / 50% al aprobar demo final', detalle: 'Proyectos estándar' },
    { codigo: '3 PAGOS', titulo: '40% inicio / 30% demo intermedia / 30% antes de entrega final', detalle: 'Sistemas por fases' }
  ]);

  agregarSeccion(body, '07', 'Métodos de pago aceptados');
  agregarTablaEstilizada(
    body,
    ['MÉTODO', 'DETALLES PARA TRANSFERENCIA O PAGO'],
    [
      ['ACH',  'Banco: [Banco] · Tipo: [Monetaria/Ahorro] · Cuenta: [No. de cuenta] · Titular: [Nombre]'],
      ['ZIGI', 'Zigi Link directo con acreditación inmediata (se envía al confirmar aceptación).']
    ],
    [80, 436]
  );

  agregarCallout(
    body,
    'Nota de arranque',
    'En transferencias ACH, el tiempo de entrega inicia en el momento en que el pago queda acreditado en cuenta y se reciben los insumos iniciales.',
    BRAND.acento
  );

  agregarCierreMarca(body);
}

/* ======================== PLANTILLA 02: CONTRATO / ACUERDO ======================== */

function construirContrato(doc, body) {
  agregarCabeceraDocumento(body, {
    codigo: 'DOC-02 · ACUERDO',
    titulo: 'Acuerdo de Alcance y Servicios',
    subtitulo: 'Términos claros y directos para proteger tu inversión, tus tiempos y el control total de tu sistema.'
  });

  agregarTarjetaMeta(body, [
    [
      { etiqueta: 'Proyecto', valor: '[Nombre del proyecto]' },
      { etiqueta: 'Fecha', valor: '[DD/MM/AAAA]', mono: true }
    ],
    [
      { etiqueta: 'Cliente', valor: '[Nombre completo / Empresa]' },
      { etiqueta: 'Cotización base', valor: 'ZS-COT-[001]', mono: true, destacado: true }
    ],
    [
      { etiqueta: 'Proveedor', valor: 'Zenda Studio' },
      { etiqueta: 'Canal oficial', valor: 'WhatsApp +502 5879-8301', mono: true }
    ]
  ]);

  agregarSeccion(body, '01', 'Cláusulas principales');
  agregarTablaEstilizada(
    body,
    ['NO.', 'CLÁUSULA', 'CONDICIÓN ACORDADA'],
    [
      ['01', 'Alcance', 'Zenda Studio desarrollará únicamente lo detallado en la Cotización No. ZS-COT-[001].'],
      ['02', 'Inicio del proyecto', 'El cronograma inicia únicamente cuando el Cliente haya acreditado el Pago 1 y entregado los insumos iniciales solicitados.'],
      ['03', 'Revisiones y demos', 'Cada fase se presenta mediante demo en vivo o video de pruebas. El Cliente cuenta con [2] días hábiles para confirmar aprobación o solicitar correcciones dentro del alcance.'],
      ['04', 'Cambios fuera de alcance', 'Toda función o módulo nuevo no contemplado en la cotización inicial se cotizará como extra o fase adicional antes de desarrollarse.'],
      ['05', 'Pagos y liberación', 'Los pagos se realizan por Transferencia ACH o Zigi Link según el plan acordado. La entrega de accesos finales y documentación queda sujeta a la acreditación del saldo final.'],
      ['06', 'Propiedad total', 'Una vez liquidado el 100% del proyecto, los accesos, archivos y entregables pasan a control total del Cliente.'],
      ['07', 'Confidencialidad y datos', 'Zenda Studio trata la información y los datos del Cliente como confidenciales y los usa únicamente para ejecutar este proyecto.'],
      ['08', 'Terminación y ley aplicable', '[Define aquí cancelación, tratamiento del anticipo y la jurisdicción aplicable en Guatemala. Revisar con tu asesor legal.]']
    ],
    [42, 130, 344]
  );

  agregarCallout(
    body,
    'Aceptación ágil',
    'Este acuerdo puede confirmarse mediante firma abajo o mediante confirmación escrita por WhatsApp o correo electrónico indicando conformidad con la Cotización No. ZS-COT-[001].',
    MARCA_FIJA.ok
  );

  agregarBloqueFirmas(body, 'Aceptación del Cliente', 'Por Zenda Studio');
}

/* ======================== PLANTILLA 03: ONBOARDING ======================== */

function construirOnboarding(doc, body) {
  agregarCabeceraDocumento(body, {
    codigo: 'DOC-03 · ONBOARDING',
    titulo: 'Checklist de Insumos Iniciales',
    subtitulo: '¡Bienvenido a Zenda Studio! Compártenos estos elementos para arrancar tu proyecto sin retrasos.'
  });

  agregarTarjetaMeta(body, [
    [
      { etiqueta: 'Cliente / Negocio', valor: '[Nombre del cliente]' },
      { etiqueta: 'Proyecto', valor: '[Nombre del proyecto]' }
    ],
    [
      { etiqueta: 'Fecha de envío', valor: '[DD/MM/AAAA]', mono: true },
      { etiqueta: 'Envío de archivos', valor: 'Carpeta Drive compartida o WhatsApp' }
    ]
  ]);

  agregarSeccion(body, '01', 'Qué necesitamos para comenzar');
  agregarChecklist(body, [
    { codigo: '01', titulo: 'Logo en buena calidad', detalle: 'Formato PNG sin fondo o vector SVG.' },
    { codigo: '02', titulo: 'Identidad visual o referencias', detalle: 'Colores de marca o ejemplos de páginas/estilos que te gusten.' },
    { codigo: '03', titulo: 'Información base del negocio', detalle: 'Nombre comercial, descripción breve, horarios y ubicación.' },
    { codigo: '04', titulo: 'Catálogo de productos o servicios', detalle: 'Nombre, precio, descripción corta y fotografías limpias.' },
    { codigo: '05', titulo: 'Canales de contacto y redes', detalle: 'Número de WhatsApp y enlaces de Instagram, TikTok o Facebook.' },
    { codigo: '06', titulo: 'Cuenta de correo Gmail', detalle: 'Necesaria para transferir y entregarte tus accesos finales a tu nombre.' },
    { codigo: '07', titulo: 'Comprobante de Pago 1', detalle: 'Captura de Transferencia ACH o confirmación de Zigi Link.' }
  ]);

  agregarCallout(
    body,
    'Importante para tu fecha de entrega',
    'El conteo de días hábiles del cronograma inicia el día en que recibimos estos insumos completos y queda acreditado el Pago 1. Si te falta algún material (como fotos o textos), avísanos y te ayudamos a definirlo.',
    BRAND.acento
  );

  agregarCierreMarca(body);
}

/* ======================== PLANTILLA 04: ACTA DEMO / FASE ======================== */

function construirActaFase(doc, body) {
  agregarCabeceraDocumento(body, {
    codigo: 'DOC-04 · DEMO Y QA',
    titulo: 'Confirmación de Demo y Aprobación de Fase',
    subtitulo: 'Registro oficial de revisión de avances para avanzar con claridad hacia la siguiente etapa o cierre.'
  });

  agregarTarjetaMeta(body, [
    [
      { etiqueta: 'Proyecto', valor: '[Nombre del proyecto]' },
      { etiqueta: 'Fecha de presentación', valor: '[DD/MM/AAAA]', mono: true }
    ],
    [
      { etiqueta: 'Fase presentada', valor: 'Fase [X] — [Nombre de la fase]', destacado: true },
      { etiqueta: 'Modalidad de demo', valor: '☐ En vivo (llamada)   ☐ Video + enlace temporal' }
    ]
  ]);

  agregarSeccion(body, '01', 'Resultado de revisión del cliente');
  agregarChecklist(body, [
    { codigo: 'OK',     titulo: 'Aprobada sin cambios', detalle: 'Listo para avanzar a la siguiente fase o pasar a cierre y entrega.' },
    { codigo: 'AJUSTE', titulo: 'Requiere correcciones dentro del alcance', detalle: 'Detalles incluidos en la cotización inicial (sin costo extra).' },
    { codigo: 'EXTRA',  titulo: 'Solicita extras fuera de alcance', detalle: 'Nuevas funciones a cotizar aparte o como fase adicional.' }
  ]);

  agregarSeccion(body, '02', 'Detalle de observaciones o solicitudes');
  agregarTablaEstilizada(
    body,
    ['TIPO', 'DESCRIPCIÓN DEL PUNTO REVISADO', 'ACCIÓN'],
    [
      ['ALCANCE', '1. [Corrección dentro de lo cotizado]', 'Se corrige sin costo'],
      ['ALCANCE', '2. [Corrección dentro de lo cotizado]', 'Se corrige sin costo'],
      ['EXTRA',   '1. [Nueva función solicitada por el cliente]', 'Se cotiza aparte']
    ],
    [76, 300, 140]
  );

  agregarCallout(
    body,
    'Criterio de revisión',
    'Las correcciones técnicas o detalles ya contemplados en la cotización se resuelven sin costo. Cualquier módulo nuevo fuera del acuerdo original se presupuesta por separado para no retrasar tu lanzamiento.',
    MARCA_FIJA.pendiente
  );

  agregarBloqueFirmas(body, 'Confirmación del Cliente', 'Registro Zenda Studio');
}

/* ======================== PLANTILLA 05: ENTREGA FINAL ======================== */

function construirEntregaFinal(doc, body) {
  agregarCabeceraDocumento(body, {
    codigo: 'DOC-05 · ENTREGA FINAL',
    titulo: 'Acta de Entrega Final y Accesos',
    subtitulo: 'Tu sistema queda oficialmente entregado, publicado a tu nombre y bajo tu control total.'
  });

  agregarTarjetaMeta(body, [
    [
      { etiqueta: 'Proyecto', valor: '[Nombre del proyecto]' },
      { etiqueta: 'Fecha de entrega', valor: '[DD/MM/AAAA]', mono: true }
    ],
    [
      { etiqueta: 'Cliente', valor: '[Nombre del cliente]' },
      { etiqueta: 'Estado de pago', valor: '☐ 100% Liquidado y acreditado', destacado: true }
    ]
  ]);

  agregarSeccion(body, '01', 'Entregables y enlaces oficiales');
  agregarTablaEstilizada(
    body,
    ['RECURSO', 'ENLACE OFICIAL / UBICACIÓN'],
    [
      ['Sitio Web / Sistema',         '[https://...]'],
      ['Panel Administrador',         '[https://...]'],
      ['Base de Datos / Drive',       '[https://drive.google.com/...]'],
      ['Manual / Video capacitación', '[https://...]']
    ],
    [168, 348]
  );

  agregarSeccion(body, '02', 'Credenciales de acceso inicial');
  agregarTarjetaMeta(body, [
    [
      { etiqueta: 'Usuario / Correo administrativo', valor: '[correo@cliente.com]', mono: true },
      { etiqueta: 'PIN / Contraseña inicial', valor: '[dato — cambiar al recibir]', mono: true }
    ]
  ]);

  agregarSeccion(body, '03', 'Post-entrega y garantía');
  agregarCallout(
    body,
    'Garantía técnica incluida · 15 días calendario',
    '• Incluye soporte sin costo por errores técnicos sobre lo entregado durante [15] días calendario a partir de esta fecha.\n• Opción disponible de póliza mensual de mantenimiento, respaldo y evolución para sumar nuevas automatizaciones cuando tu negocio crezca.',
    MARCA_FIJA.ok
  );

  agregarBloqueFirmas(body, 'Recibido conforme (Cliente)', 'Entregado por Zenda Studio');
  agregarCierreMarca(body);
}

/* ======================== PLANTILLA 06: GUIONES WHATSAPP ======================== */

function construirMensajes(doc, body) {
  agregarCabeceraDocumento(body, {
    codigo: 'DOC-06 · GUIONES WA',
    titulo: 'Guiones de WhatsApp y Cobros (ACH / Zigi)',
    subtitulo: 'Mensajes listos para copiar y pegar. Tono directo, humano y sin tecnicismos innecesarios.'
  });

  agregarBloqueGuion(
    body,
    'MSG-01',
    'Envío de Cotización',
    'Fase 1 · Comercial',
    'Hola [Nombre], ¡un gusto saludarte! Te comparto la cotización formal para [Proyecto] en Zenda Studio. Incluye alcance claro, tiempos y plan de pagos. Quedo atento a cualquier duda o ajuste para que arranquemos.',
    BRAND.acento
  );

  agregarBloqueGuion(
    body,
    'MSG-02',
    'Solicitud de Pago Inicial',
    'Fase 2 · Arranque',
    '¡Excelente [Nombre]! Para reservar tu espacio en agenda e iniciar la Fase 1, te comparto las opciones para el Pago 1 ([% / Monto]):\n\n• Zigi Link (acreditación inmediata): [PEGA TU LINK]\n• Transferencia ACH: [Banco, Tipo de cuenta, No. de cuenta, Titular]\n\n* Recuerda enviarme tu comprobante y tus insumos iniciales para arrancar el cronograma.',
    MARCA_FIJA.pendiente
  );

  agregarBloqueGuion(
    body,
    'MSG-03',
    'Envío de Demo (Video o En Vivo)',
    'Fase 3 · Producción',
    'Hola [Nombre], ya terminamos la Fase [X] de tu proyecto. Te comparto [el video de pruebas / el enlace de nuestra llamada] para que lo revises con calma. Cuando me confirmes por aquí que está aprobado, pasamos al siguiente paso.',
    BRAND.acento
  );

  agregarBloqueGuion(
    body,
    'MSG-04',
    'Solicitud de Pago Intermedio o Saldo Final',
    'Fase 4 · Cierre y Entrega',
    '¡Qué alegría que te haya gustado la demo, [Nombre]! Ya tenemos todo listo para [continuar con la fase final / entregarte accesos y documentación final]. Te comparto los datos para el pago de Q[Monto]:\n\n• Zigi Link: [PEGA TU LINK]\n• Transferencia ACH: [Banco, Tipo de cuenta, No. de cuenta, Titular]\n\nEn cuanto quede acreditado en cuenta, te libero el paquete completo de entrega.',
    MARCA_FIJA.ok
  );
}