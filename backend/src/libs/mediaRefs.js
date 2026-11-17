import { stat } from 'fs/promises';
import path from 'path';
import EventEdition from '../models/eventEdition.model.js';
import EventSeries from '../models/eventSeries.model.js';
import HeroSlide from '../models/heroSlide.model.js';
import Notice from '../models/notice.model.js';
import { removeUploadByUrl, uploadsDirectory } from '../multer.js';

export { collectMediaUrls } from './mediaUrls.js';

export const findMissingUploads = async (urls) => {
    const checks = await Promise.all(urls.map(async (url) => {
        const target = path.join(uploadsDirectory, path.basename(url));
        const exists = await stat(target).then((file) => file.isFile(), () => false);
        return exists ? null : url;
    }));
    return checks.filter(Boolean);
};

/* Una subida puede estar en uso por una noticia (portada o bloques), por una diapositiva de la portada,
   por el logo de una serie de eventos o por la portada de una edición.
   Los documentos legados no tienen mediaRefs: se compara también con su portada.
   `exclude` deja fuera al propio documento que se está cambiando. */
export const isUploadReferenced = async (url, { excludeNoticeId, excludeSlideId, excludeSeriesId, excludeEditionId } = {}) => {
    const [inNotice, inSlide, inSeries, inEdition] = await Promise.all([
        Notice.exists({
            ...(excludeNoticeId && { _id: { $ne: excludeNoticeId } }),
            $or: [{ mediaRefs: url }, { imageUrl: url }]
        }),
        HeroSlide.exists({
            ...(excludeSlideId && { _id: { $ne: excludeSlideId } }),
            $or: [{ image: url }, { imageMobile: url }]
        }),
        EventSeries.exists({
            ...(excludeSeriesId && { _id: { $ne: excludeSeriesId } }),
            logo: url
        }),
        EventEdition.exists({
            ...(excludeEditionId && { _id: { $ne: excludeEditionId } }),
            portada: url
        })
    ]);
    return Boolean(inNotice || inSlide || inSeries || inEdition);
};

/* Solo se borran las URLs que el documento dejó de usar y que nadie más referencia.
   Las subidas que aún no se guardaron las barre scripts/gc-uploads.js. Un fallo al borrar solo se registra. */
export const removeUnreferencedUploads = async (urls, exclude = {}) => {
    await Promise.all(urls.map(async (url) => {
        try {
            if (await isUploadReferenced(url, exclude)) return;
            await removeUploadByUrl(url);
        } catch (error) {
            console.error('Unable to remove upload', { name: error.name });
        }
    }));
};
