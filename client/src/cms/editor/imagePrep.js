/* Reduce las fotos pesadas en el navegador antes de subirlas.
   Delante de la aplicación hay un Apache que corta las peticiones de unos 10 MB (403) y de unos 14 MB (413) sin que lleguen
   al servidor, y el servidor igualmente las convierte a WebP de 2560 px: una foto de cámara de 12 MB solo servía para fallar. */

const MEGABYTE = 1024 * 1024;

// Hasta este peso la foto se sube tal cual, sin perder calidad por recodificarla
export const SKIP_PREPARATION_BYTES = 4 * MEGABYTE;
// Peso que se busca al reducir: muy por debajo de lo que corta Apache y de cualquier límite antiguo de 5 MB
export const PREPARED_TARGET_BYTES = 3 * MEGABYTE;
// Lado mayor, igual que el servidor
export const MAX_EDGE = 2560;
const FALLBACK_EDGE = 2048;

const ATTEMPTS = [
  ...[0.9, 0.82, 0.74, 0.66].map((quality) => ({ edge: MAX_EDGE, quality })),
  ...[0.8, 0.7].map((quality) => ({ edge: FALLBACK_EDGE, quality })),
];

export const planSize = (width, height, maxEdge) => {
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
};

const EXTENSIONS = { 'image/jpeg': 'jpg', 'image/webp': 'webp' };

export const outputName = (name, type) => `${name.replace(/\.[^./\\]+$/, '') || 'foto'}.${EXTENSIONS[type]}`;

/* Intenta caber en PREPARED_TARGET_BYTES bajando primero la calidad y, si no basta, el tamaño.
   Devuelve null si no se logra una versión más liviana que el original o si el navegador no sabe codificar el formato. */
const shrink = async (source, file) => {
  // los PNG y WebP conservan la transparencia; el JPEG no la tiene, así que solo se usa para fotos JPEG
  const type = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/webp';
  let smallest = null;

  for (const { edge, quality } of ATTEMPTS) {
    const { width, height } = planSize(source.width, source.height, edge);
    const blob = await source.render(width, height, type, quality);
    if (!blob) return null;
    if (!smallest || blob.size < smallest.size) smallest = blob;
    if (blob.size <= PREPARED_TARGET_BYTES) break;
  }

  // nunca se sube algo más pesado que el original
  if (!smallest || smallest.size >= file.size) return null;
  return new File([smallest], outputName(file.name, type), { type, lastModified: file.lastModified });
};

/* El motor decodifica y recodifica de verdad; se separa para poder probar el algoritmo sin navegador */
const decodeWithImageElement = (file) => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
  image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('No se pudo leer la imagen')); };
  image.src = url;
});

const decode = async (file) => {
  if (typeof createImageBitmap === 'function') {
    try {
      // aplica la orientación EXIF: las fotos de móvil guardan los píxeles girados
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      // algunos navegadores no aceptan la opción
    }
    try {
      return await createImageBitmap(file);
    } catch {
      // se prueba con un <img>
    }
  }
  return decodeWithImageElement(file);
};

const renderToBlob = async (image, width, height, type, quality) => {
  const canvas = typeof OffscreenCanvas === 'function'
    ? new OffscreenCanvas(width, height)
    : Object.assign(document.createElement('canvas'), { width, height });
  const context = canvas.getContext('2d');
  if (!context) return null;

  if (type === 'image/jpeg') {
    // el JPEG no tiene transparencia: se pinta sobre blanco para que no quede negro
    context.fillStyle = '#fff';
    context.fillRect(0, 0, width, height);
  }
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, 0, 0, width, height);

  const blob = typeof canvas.convertToBlob === 'function'
    ? await canvas.convertToBlob({ type, quality })
    : await new Promise((resolve) => canvas.toBlob(resolve, type, quality));
  // un navegador que no sabe codificar el formato pedido entrega un PNG
  return blob?.type === type ? blob : null;
};

export const browserEngine = {
  async load(file) {
    const image = await decode(file);
    return {
      width: image.naturalWidth ?? image.width,
      height: image.naturalHeight ?? image.height,
      render: (width, height, type, quality) => renderToBlob(image, width, height, type, quality),
      release: () => image.close?.(),
    };
  },
};

/* Devuelve el archivo que conviene enviar: el mismo si ya es liviano o no se pudo reducir, o una copia más pequeña.
   Reducir también elimina los metadatos (ubicación GPS, cámara) que traen las fotos. */
export const prepareImageForUpload = async (file, engine = browserEngine) => {
  if (file.size <= SKIP_PREPARATION_BYTES) return file;

  let source;
  try {
    source = await engine.load(file);
    return (await shrink(source, file)) ?? file;
  } catch {
    // sin poder reducirla se sube como está y el servidor decide
    return file;
  } finally {
    source?.release();
  }
};
