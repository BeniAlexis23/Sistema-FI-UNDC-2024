import { useState } from 'react';
import RichTextEditor from '../RichTextEditor';
import SafeHtml from '../../SafeHtml';
import { htmlToText } from '../../readingTime';

/* El editor (TipTap) solo se monta cuando se hace clic: con muchos bloques de texto la página no se pone lenta */
const TextBlockEditor = ({ block, onChange, autoFocus }) => {
  const [state, setState] = useState({ active: autoFocus || !htmlToText(block.html), focus: autoFocus });

  if (!state.active) {
    const activate = (event) => {
      event.preventDefault(); // un enlace dentro del texto no debe abrirse al querer editar
      setState({ active: true, focus: true });
    };
    return (
      <div
        role="button"
        tabIndex={0}
        aria-label="Editar este texto"
        onClick={activate}
        onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') activate(event); }}
        className="cursor-text rounded-xl border border-transparent p-1 transition hover:border-sky-200 hover:bg-sky-50/40 focus-visible:border-sky-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
      >
        <SafeHtml html={block.html} className="prose prose-slate max-w-none prose-headings:font-extrabold prose-a:text-primary" />
      </div>
    );
  }

  return <RichTextEditor html={block.html} autoFocus={state.focus} onChange={(html) => onChange((current) => ({ ...current, html }))} />;
};

export default TextBlockEditor;
