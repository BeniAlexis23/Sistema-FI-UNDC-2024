import { stat } from 'fs/promises';
import path from 'path';
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

/* Los documentos legados no tienen mediaRefs: se compara también con su portada */
export const isUploadReferenced = (url, excludeNoticeId) => Notice.exists({
    ...(excludeNoticeId && { _id: { $ne: excludeNoticeId } }),
    $or: [{ mediaRefs: url }, { imageUrl: url }]
});

/* Solo se borran las URLs que esta noticia dejó de usar y que ninguna otra referencia.
   Las subidas que aún no se guardaron las barre scripts/gc-uploads.js. Un fallo al borrar solo se registra. */
export const removeUnreferencedUploads = async (urls, excludeNoticeId) => {
    await Promise.all(urls.map(async (url) => {
        try {
            if (await isUploadReferenced(url, excludeNoticeId)) return;
            await removeUploadByUrl(url);
        } catch (error) {
            console.error('Unable to remove upload', { name: error.name });
        }
    }));
};
