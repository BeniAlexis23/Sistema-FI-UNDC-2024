import { uploadMediaRequest } from '../../api/media';
import { getApiErrors } from '../../api/errors';
import { prepareImageForUpload } from './imagePrep';

/* Debe coincidir con MAX_UPLOAD_SIZE_MB del backend: el servidor reduce a WebP cualquier foto que acepte.
   Además el navegador reduce las pesadas antes de enviarlas (ver imagePrep.js). */
export const MAX_IMAGE_MB = 25;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const IMAGE_ACCEPT = ACCEPTED_TYPES.join(',');

/* Devuelve el motivo por el que no se puede subir el archivo, o null si es válido */
export const validateImageFile = (file) => {
  if (!ACCEPTED_TYPES.includes(file.type)) return 'Solo se aceptan imágenes JPG, PNG o WebP.';
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) return `La imagen supera los ${MAX_IMAGE_MB} MB.`;
  return null;
};

const SESSION_MESSAGE = 'Tu sesión terminó. Inicia sesión de nuevo en otra pestaña (así no pierdes lo que escribiste) y vuelve a intentarlo.';
const BLOCKED_MESSAGE = 'Un filtro del servidor bloqueó la subida; suele pasar con archivos muy pesados. Prueba con una foto más liviana o avisa al administrador.';
const OFFLINE_MESSAGE = 'No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo.';
const UNAVAILABLE_MESSAGE = 'El servidor no respondió. Inténtalo de nuevo en unos minutos.';
const NETWORK_CODES = ['ERR_NETWORK', 'ECONNABORTED', 'ETIMEDOUT'];

const UPLOAD_ERRORS = {
  413: 'El servidor no aceptó la imagen por su peso. Prueba con una más liviana.',
  415: 'No se pudo leer la imagen. Usa un archivo JPG, PNG o WebP válido.',
  429: 'Se subieron demasiadas imágenes seguidas. Espera unos minutos e inténtalo de nuevo.',
  502: UNAVAILABLE_MESSAGE,
  503: UNAVAILABLE_MESSAGE,
  504: UNAVAILABLE_MESSAGE,
};

// Las respuestas de la propia aplicación traen un mensaje en JSON; las de un proxy o un cortafuegos son HTML o vienen vacías
const hasApiMessage = (data) => Array.isArray(data) || typeof data?.message === 'string';

export const uploadErrorMessage = (error) => {
  const status = error.response?.status;
  const data = error.response?.data;

  if (UPLOAD_ERRORS[status]) return UPLOAD_ERRORS[status];
  if (status === 401 || (status === 403 && data?.message === 'Invalid token')) return SESSION_MESSAGE;
  if (status === 403 && !hasApiMessage(data)) return BLOCKED_MESSAGE;
  if (!error.response && NETWORK_CODES.includes(error.code)) return OFFLINE_MESSAGE;
  return getApiErrors(error, 'No se pudo subir la imagen')[0];
};

/* Sube una imagen y devuelve { url, thumbUrl, width, height }. Las fotos pesadas se reducen antes de enviarlas */
export const uploadImage = async (file, onProgress) => {
  const { data } = await uploadMediaRequest(await prepareImageForUpload(file), (event) => {
    if (event.total) onProgress?.(Math.round((event.loaded / event.total) * 100));
  });
  return data;
};

/* Sube varias imágenes de a pocas a la vez; cada una avisa su resultado por separado */
export const uploadImages = async (items, { onProgress, onResult, concurrency = 3 }) => {
  const queue = [...items];
  const worker = async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      try {
        const image = await uploadImage(item.file, (percent) => onProgress?.(item.key, percent));
        onResult(item.key, { image });
      } catch (error) {
        onResult(item.key, { error: uploadErrorMessage(error) });
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
};
