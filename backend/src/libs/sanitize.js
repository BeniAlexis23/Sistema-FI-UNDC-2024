import sanitizeHtml from 'sanitize-html';

const options = {
    allowedTags: [
        'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'blockquote',
        'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'a', 'span'
    ],
    allowedAttributes: {
        a: ['href', 'target', 'rel'],
        p: ['class'],
        span: ['class'],
        li: ['class']
    },
    allowedClasses: {
        p: ['ql-align-center', 'ql-align-right', 'ql-align-justify'],
        span: ['ql-size-small', 'ql-size-large', 'ql-size-huge'],
        li: ['ql-indent-1', 'ql-indent-2', 'ql-indent-3']
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
        a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }, true)
    }
};

export const sanitizeRichText = (value) => sanitizeHtml(value, options).trim();

const basicEntities = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&#x27;': "'" };

export const decodeBasicEntities = (value = '') => (
    value.replace(/&(?:amp|lt|gt|quot|#39|#x27);/g, (entity) => basicEntities[entity])
);

/* Texto plano: sin etiquetas y sin entidades, para resúmenes y metadatos */
export const toPlainText = (value = '') => (
    decodeBasicEntities(sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} })).trim()
);

/* Igual que toPlainText pero separa párrafos y elementos de lista con espacios (conteo de palabras, resúmenes) */
export const htmlToPlainText = (html = '') => toPlainText(
    html.replace(/<\/(?:p|h[1-6]|li|blockquote|ul|ol)>|<br\s*\/?>/gi, ' ')
).replace(/\s+/g, ' ').trim();

/* HTML de los bloques de texto: lista única y cerrada, la misma que mantiene el editor del panel.
   Sin estilos ni clases; los enlaces salen siempre con target y rel fijos. */
const blockHtmlOptions = {
    allowedTags: ['p', 'br', 'strong', 'em', 'u', 's', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote', 'a'],
    allowedAttributes: { a: ['href', 'target', 'rel'] },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowProtocolRelative: false,
    transformTags: {
        h1: 'h2',
        h4: 'h3',
        h5: 'h3',
        h6: 'h3',
        a: (tagName, attribs) => ({
            tagName: 'a',
            attribs: { ...(attribs.href && { href: attribs.href }), target: '_blank', rel: 'noopener noreferrer' }
        })
    }
};

export const sanitizeBlockHtml = (value = '') => sanitizeHtml(value, blockHtmlOptions).trim();
