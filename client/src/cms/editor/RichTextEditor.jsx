import { useMemo } from 'react';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extensions';
import {
  Bold, Heading2, Heading3, Italic, Link2, List, ListOrdered, Quote, Redo2, Strikethrough, Underline as UnderlineIcon, Undo2,
} from 'lucide-react';
import Swal from 'sweetalert2';
import EmojiPicker from './EmojiPicker';
import { shouldAutoLink } from './autolink';

const SAFE_LINK = /^(?:https?:\/\/|mailto:)\S+$/i;

/* Solo lo que el servidor conserva (backend/src/libs/sanitize.js): negrita, cursiva, subrayado, tachado,
   títulos 2 y 3, listas, cita y enlaces. Lo que se ve aquí es lo que se guarda. */
const buildExtensions = (placeholder, compact) => [
  StarterKit.configure({
    heading: compact ? false : { levels: [2, 3] },
    blockquote: compact ? false : {},
    code: false,
    codeBlock: false,
    horizontalRule: false,
    trailingNode: false,
    link: {
      openOnClick: false,
      autolink: true,
      shouldAutoLink,
      defaultProtocol: 'https',
      HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
    },
  }),
  Placeholder.configure({ placeholder }),
];

const ToolbarButton = ({ label, active, disabled, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    aria-pressed={active}
    title={label}
    className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-40 ${active ? 'bg-sky-100 text-primary' : 'text-slate-600 hover:bg-slate-100'}`}
  >
    {children}
  </button>
);

const Separator = () => <span aria-hidden="true" className="mx-1 h-5 w-px bg-slate-200" />;

const askForLink = async (previous) => {
  const { isConfirmed, isDenied, value } = await Swal.fire({
    title: 'Enlace',
    input: 'text',
    inputValue: previous,
    inputPlaceholder: 'https://… o mailto:correo@undc.edu.pe',
    showCancelButton: true,
    showDenyButton: Boolean(previous),
    confirmButtonText: 'Aplicar',
    denyButtonText: 'Quitar enlace',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#1081ea',
    inputValidator: (text) => (SAFE_LINK.test(text.trim()) ? undefined : 'Escribe un enlace que empiece con https://, http:// o mailto:'),
  });
  if (isDenied) return null;
  return isConfirmed ? value.trim() : undefined;
};

/* Editor de texto enriquecido (TipTap). `compact` ofrece solo formato en línea y listas, para avisos. */
const RichTextEditor = ({ html, onChange, placeholder = 'Escribe aquí…', compact = false, autoFocus = false, label }) => {
  const extensions = useMemo(() => buildExtensions(placeholder, compact), [placeholder, compact]);

  const editor = useEditor({
    extensions,
    content: html,
    autofocus: autoFocus ? 'end' : false,
    editorProps: {
      attributes: {
        'aria-label': label ?? 'Contenido del bloque',
        class: 'prose prose-slate max-w-none min-h-[7rem] px-4 py-3 text-base outline-none focus:outline-none prose-headings:font-extrabold prose-a:text-primary',
      },
    },
    onUpdate: ({ editor: current }) => onChange(current.isEmpty ? '' : current.getHTML()),
  });

  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => (current ? {
      bold: current.isActive('bold'),
      italic: current.isActive('italic'),
      underline: current.isActive('underline'),
      strike: current.isActive('strike'),
      h2: current.isActive('heading', { level: 2 }),
      h3: current.isActive('heading', { level: 3 }),
      bulletList: current.isActive('bulletList'),
      orderedList: current.isActive('orderedList'),
      blockquote: current.isActive('blockquote'),
      link: current.isActive('link'),
      canUndo: current.can().undo(),
      canRedo: current.can().redo(),
    } : null),
  });

  if (!editor || !state) return <div className="min-h-[9rem] animate-pulse rounded-xl bg-slate-100" aria-hidden="true" />;

  const run = (command) => () => command(editor.chain().focus()).run();

  const handleLink = async () => {
    const previous = editor.getAttributes('link').href ?? '';
    const result = await askForLink(previous);
    if (result === undefined) return;
    if (result === null) editor.chain().focus().extendMarkRange('link').unsetLink().run();
    else editor.chain().focus().extendMarkRange('link').setLink({ href: result }).run();
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white transition focus-within:border-sky-300 focus-within:ring-4 focus-within:ring-sky-100">
      <div role="toolbar" aria-label="Formato del texto" className="flex flex-wrap items-center gap-0.5 border-b border-slate-100 px-2 py-1.5">
        <ToolbarButton label="Negrita" active={state.bold} onClick={run((chain) => chain.toggleBold())}><Bold size={16} /></ToolbarButton>
        <ToolbarButton label="Cursiva" active={state.italic} onClick={run((chain) => chain.toggleItalic())}><Italic size={16} /></ToolbarButton>
        <ToolbarButton label="Subrayado" active={state.underline} onClick={run((chain) => chain.toggleUnderline())}><UnderlineIcon size={16} /></ToolbarButton>
        <ToolbarButton label="Tachado" active={state.strike} onClick={run((chain) => chain.toggleStrike())}><Strikethrough size={16} /></ToolbarButton>
        {!compact && (
          <>
            <Separator />
            <ToolbarButton label="Título" active={state.h2} onClick={run((chain) => chain.toggleHeading({ level: 2 }))}><Heading2 size={17} /></ToolbarButton>
            <ToolbarButton label="Subtítulo" active={state.h3} onClick={run((chain) => chain.toggleHeading({ level: 3 }))}><Heading3 size={17} /></ToolbarButton>
          </>
        )}
        <Separator />
        <ToolbarButton label="Lista con viñetas" active={state.bulletList} onClick={run((chain) => chain.toggleBulletList())}><List size={17} /></ToolbarButton>
        <ToolbarButton label="Lista numerada" active={state.orderedList} onClick={run((chain) => chain.toggleOrderedList())}><ListOrdered size={17} /></ToolbarButton>
        {!compact && <ToolbarButton label="Cita" active={state.blockquote} onClick={run((chain) => chain.toggleBlockquote())}><Quote size={16} /></ToolbarButton>}
        <ToolbarButton label="Enlace" active={state.link} onClick={handleLink}><Link2 size={16} /></ToolbarButton>
        <EmojiPicker onSelect={(emoji) => editor.chain().focus().insertContent(emoji).run()} />
        <Separator />
        <ToolbarButton label="Deshacer" disabled={!state.canUndo} onClick={run((chain) => chain.undo())}><Undo2 size={16} /></ToolbarButton>
        <ToolbarButton label="Rehacer" disabled={!state.canRedo} onClick={run((chain) => chain.redo())}><Redo2 size={16} /></ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
