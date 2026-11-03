import DOMPurify from 'dompurify';

/* Misma lista cerrada que backend/src/libs/sanitize.js (sanitizeBlockHtml): el servidor ya sanea al guardar
   y aquí se vuelve a sanear al mostrar, por si la base de datos tuviera contenido anterior o alterado. */
const ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'u', 's', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote', 'a'];
const ALLOWED_ATTR = ['href', 'target', 'rel'];
const ALLOWED_LINKS = /^(?:https?:|mailto:)/i;

let hookReady = false;
const ensureLinkHook = () => {
  if (hookReady) return;
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A') {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });
  hookReady = true;
};

export const sanitizeHtml = (html) => {
  ensureLinkHook();
  return DOMPurify.sanitize(html ?? '', { ALLOWED_TAGS, ALLOWED_ATTR, ALLOWED_URI_REGEXP: ALLOWED_LINKS });
};

/* Único lugar del cliente donde se inserta HTML */
const SafeHtml = ({ html, className }) => (
  // eslint-disable-next-line react/no-danger
  <div className={className} dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />
);

export default SafeHtml;
