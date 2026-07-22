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
