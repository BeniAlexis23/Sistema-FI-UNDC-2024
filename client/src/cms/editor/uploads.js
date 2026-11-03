import { uploadMediaRequest } from '../../api/media';
import { getApiErrors } from '../../api/errors';

/* Debe coincidir con MAX_UPLOAD_SIZE_MB del backend: el servidor reduce a WebP cualquier foto que acepte */
export const MAX_IMAGE_MB = 25;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const IMAGE_ACCEPT = ACCEPTED_TYPES.join(',');

/* Devuelve el motivo por el que no se puede subir el archivo, o null si es válido */
export const validateImageFile = (file) => {
  if (!ACCEPTED_TYPES.includes(file.type)) return 'Solo se aceptan imágenes JPG, PNG o WebP.';
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) return `La imagen supera los ${MAX_IMAGE_MB} MB.`;
  return null;
};

const UPLOAD_ERRORS = {
  413: 'El servidor no aceptó la imagen por su peso. Prueba con una más liviana.',
  415: 'No se pudo leer la imagen. Usa un archivo JPG, PNG o WebP válido.',
  429: 'Se subieron demasiadas imágenes seguidas. Espera unos minutos e inténtalo de nuevo.',
};

export const uploadErrorMessage = (error) => (
  UPLOAD_ERRORS[error.response?.status] ?? getApiErrors(error, 'No se pudo subir la imagen')[0]
);

/* Sube una imagen y devuelve { url, thumbUrl, width, height } */
export const uploadImage = async (file, onProgress) => {
  const { data } = await uploadMediaRequest(file, (event) => {
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
