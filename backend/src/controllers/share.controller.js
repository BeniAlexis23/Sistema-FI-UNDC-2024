import { readFile } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import Notice from '../models/notice.model.js';
import { APP_ORIGIN } from '../config.js';
import { uploadsDirectory } from '../multer.js';
import { toPlainText } from '../libs/sanitize.js';
import { publicNoticeFilter } from '../libs/noticeVisibility.js';
import { truncate } from '../libs/text.js';

const OBJECT_ID = /^[a-f\d]{24}$/i;
const SITE_NAME = 'FI - UNDC';
const DEFAULT_IMAGE = `${APP_ORIGIN}/og-default.png`;
const PREVIEW_WIDTH = 1200;
const PREVIEW_HEIGHT = 630;
const DESCRIPTION_MAX_CHARS = 200;

const escapeAttribute = (value) => String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

/* Las páginas de /compartir son para los rastreadores de redes sociales: solo meta etiquetas, sin scripts
   (el navegador de una persona sigue la redirección y llega al portal) */
const sendHtml = (res, status, html) => {
    res.status(status);
    res.set({
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Security-Policy': "default-src 'none'",
        'Cache-Control': 'no-cache',
        'X-Robots-Tag': 'noindex'
    });
    return res.send(html);
};

const findVisibleNotice = (id, fields) => (
    OBJECT_ID.test(id) ? Notice.findOne({ _id: id, ...publicNoticeFilter() }).select(fields).lean() : null
);

const notAvailable = (res) => sendHtml(res, 404, `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Noticia no disponible | ${SITE_NAME}</title>
<meta http-equiv="refresh" content="3;url=${escapeAttribute(`${APP_ORIGIN}/#/noticias`)}">
</head>
<body><p>Esta noticia no está disponible. <a href="${escapeAttribute(`${APP_ORIGIN}/#/noticias`)}">Ver las noticias</a></p></body>
</html>`);

export const shareNotice = async (req, res) => {
    const notice = await findVisibleNotice(req.params.id, 'title description imageUrl imageAlt');
    if (!notice) return notAvailable(res);

    const id = req.params.id;
    const title = notice.title;
    const description = truncate(toPlainText(notice.description).replace(/\s+/g, ' '), DESCRIPTION_MAX_CHARS);
    const shareUrl = `${APP_ORIGIN}/compartir/noticias/${id}`;
    const portalUrl = `${APP_ORIGIN}/#/noticias/${id}`;
    const image = notice.imageUrl ? `${shareUrl}/portada.jpg` : DEFAULT_IMAGE;
    const imageAlt = notice.imageAlt || title;

    const meta = [
        ['name', 'description', description],
        ['property', 'og:type', 'article'],
        ['property', 'og:site_name', SITE_NAME],
        ['property', 'og:locale', 'es_PE'],
        ['property', 'og:title', title],
        ['property', 'og:description', description],
        ['property', 'og:url', shareUrl],
        ['property', 'og:image', image],
        ['property', 'og:image:alt', imageAlt],
        ['name', 'twitter:card', 'summary_large_image'],
        ['name', 'twitter:title', title],
        ['name', 'twitter:description', description],
        ['name', 'twitter:image', image]
    ].map(([attribute, key, value]) => `<meta ${attribute}="${key}" content="${escapeAttribute(value)}">`).join('\n');

    return sendHtml(res, 200, `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>${escapeAttribute(title)} | ${SITE_NAME}</title>
<link rel="canonical" href="${escapeAttribute(portalUrl)}">
${meta}
<meta http-equiv="refresh" content="0;url=${escapeAttribute(portalUrl)}">
</head>
<body><p><a href="${escapeAttribute(portalUrl)}">${escapeAttribute(title)}</a></p></body>
</html>`);
};

/* Portada en JPEG de 1200x630: WhatsApp y Facebook no siempre muestran bien las imágenes WebP */
export const shareNoticeCover = async (req, res) => {
    const notice = await findVisibleNotice(req.params.id, 'imageUrl');
    if (!notice?.imageUrl) return res.sendStatus(404);

    const source = path.join(uploadsDirectory, path.basename(notice.imageUrl));
    try {
        // se lee a memoria: sharp mantendría el archivo abierto (en Windows impide borrarlo después)
        const image = await sharp(await readFile(source))
            .resize(PREVIEW_WIDTH, PREVIEW_HEIGHT, { fit: 'cover' })
            .jpeg({ quality: 82 })
            .toBuffer();
        res.set({ 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=3600' });
        return res.send(image);
    } catch {
        return res.sendStatus(404);
    }
};
