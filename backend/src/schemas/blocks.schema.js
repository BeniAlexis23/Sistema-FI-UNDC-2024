import { z } from 'zod';
import { htmlToPlainText, sanitizeBlockHtml } from '../libs/sanitize.js';
import { parseVideoUrl } from '../libs/video.js';

export const MAX_BLOCKS = 60;
export const MAX_GALLERY_IMAGES = 30;
export const MAX_CONTENT_BYTES = 400 * 1024;

export const managedImageUrlSchema = z.string().regex(
    /^\/uploads\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(?:jpg|png|webp)$/,
    'Invalid image URL'
);

const blockId = z.string().regex(/^[A-Za-z0-9_-]{6,40}$/, 'Invalid block id');
const optionalText = (max) => z.string().trim().max(max, 'Text is too long').optional();
export const safeLinkUrlSchema = z.string().trim().max(2048, 'URL is too long').refine((value) => {
    try {
        return ['http:', 'https:', 'mailto:'].includes(new URL(value).protocol);
    } catch {
        return false;
    }
}, 'URL must use HTTP, HTTPS or mailto');

const galleryImage = z.object({
    url: managedImageUrlSchema,
    alt: optionalText(200),
    caption: optionalText(300)
}).strict();

/* Forma de entrada de cada bloque; la normalización (sanitizar HTML, resolver videos) va después */
const blockSchema = z.discriminatedUnion('type', [
    z.object({ id: blockId, type: z.literal('text'), html: z.string().max(20000, 'Text block is too long') }).strict(),
    z.object({
        id: blockId, type: z.literal('image'), url: managedImageUrlSchema,
        alt: optionalText(200), caption: optionalText(300), width: z.enum(['normal', 'wide', 'full']).default('normal')
    }).strict(),
    z.object({
        id: blockId, type: z.literal('gallery'), layout: z.enum(['carousel', 'grid', 'mosaic']),
        images: z.array(galleryImage).min(1, 'A gallery needs at least one image').max(MAX_GALLERY_IMAGES, 'Too many images in a gallery')
    }).strict(),
    z.object({ id: blockId, type: z.literal('video'), url: z.string().trim().max(500, 'URL is too long'), caption: optionalText(300) }).strict(),
    z.object({
        id: blockId, type: z.literal('callout'), variant: z.enum(['info', 'success', 'warning']),
        html: z.string().max(5000, 'Callout is too long')
    }).strict(),
    z.object({
        id: blockId, type: z.literal('button'), label: z.string().trim().min(1, 'Button label is required').max(60, 'Button label is too long'),
        url: safeLinkUrlSchema, style: z.enum(['primary', 'outline']).default('primary')
    }).strict(),
    z.object({ id: blockId, type: z.literal('divider') }).strict()
]);

const fail = (message) => ({ ok: false, message });

/* Los tamaños y cantidades se revisan antes de zod: una colección enorme no debe llegar a validarse */
const readRawBlocks = (raw) => {
    let value = raw;
    if (typeof raw === 'string') {
        if (Buffer.byteLength(raw, 'utf8') > MAX_CONTENT_BYTES) return fail('Content is too large');
        try {
            value = JSON.parse(raw);
        } catch {
            return fail('Content is not valid JSON');
        }
    } else if (Buffer.byteLength(JSON.stringify(raw ?? null), 'utf8') > MAX_CONTENT_BYTES) {
        return fail('Content is too large');
    }

    if (!Array.isArray(value)) return fail('Content must be a list of blocks');
    if (value.length > MAX_BLOCKS) return fail(`Content can have at most ${MAX_BLOCKS} blocks`);
    const oversizedGallery = value.some((block) => Array.isArray(block?.images) && block.images.length > MAX_GALLERY_IMAGES);
    if (oversizedGallery) return fail('Too many images in a gallery');
    return { ok: true, value };
};

const normalizeBlock = (block, index) => {
    const label = `Block ${index + 1}`;
    if (block.type === 'text' || block.type === 'callout') {
        const html = sanitizeBlockHtml(block.html);
        // un bloque de texto sin texto no aporta nada: se descarta
        return htmlToPlainText(html) ? { ...block, html } : null;
    }
    if (block.type === 'video') {
        const video = parseVideoUrl(block.url);
        if (!video) return { error: `${label}: unsupported video URL` };
        return { id: block.id, type: 'video', ...video, ...(block.caption && { caption: block.caption }) };
    }
    return block;
};

/* Devuelve { ok: true, blocks } con los bloques ya saneados, o { ok: false, messages } */
export const parseBlocks = (raw) => {
    const read = readRawBlocks(raw);
    if (!read.ok) return { ok: false, messages: [read.message] };

    const parsed = z.array(blockSchema).safeParse(read.value);
    if (!parsed.success) {
        const messages = parsed.error.issues.slice(0, 5).map((issue) => (
            typeof issue.path[0] === 'number' ? `Block ${issue.path[0] + 1}: ${issue.message}` : issue.message
        ));
        return { ok: false, messages };
    }

    const ids = parsed.data.map((block) => block.id);
    if (new Set(ids).size !== ids.length) return { ok: false, messages: ['Block ids must be unique'] };

    const blocks = [];
    const messages = [];
    parsed.data.forEach((block, index) => {
        const normalized = normalizeBlock(block, index);
        if (normalized?.error) messages.push(normalized.error);
        else if (normalized) blocks.push(normalized);
    });
    return messages.length ? { ok: false, messages } : { ok: true, blocks };
};

/* Campo `content` de las noticias: lista de bloques (JSON) o su texto JSON (multipart) */
export const contentField = z.any().transform((raw, ctx) => {
    const result = parseBlocks(raw);
    if (result.ok) return result.blocks;
    result.messages.forEach((message) => ctx.addIssue({ code: z.ZodIssueCode.custom, message }));
    return z.NEVER;
});
