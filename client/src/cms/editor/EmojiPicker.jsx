import { useEffect, useRef, useState } from 'react';
import { Smile } from 'lucide-react';

/* Selección rápida sin dependencias; para el resto, el selector del sistema funciona dentro del editor
   (Windows: tecla Windows + punto; Mac: Control + Comando + Espacio) */
const groups = [
  { label: 'Caras y gestos', emojis: ['😀', '😃', '😊', '😍', '🥳', '🤩', '😎', '🤔', '😮', '😢', '🙏', '👏', '👍', '🙌', '💪', '🤝'] },
  { label: 'Educación', emojis: ['🎓', '📚', '📖', '✏️', '📝', '🧪', '🔬', '💻', '🖥️', '📱', '🔧', '⚙️', '🏆', '🥇', '📊', '💡'] },
  { label: 'Avisos y lugares', emojis: ['📢', '📣', '🔔', '⚠️', '✅', '❌', 'ℹ️', '❗', '⏰', '📅', '📍', '🔗', '📧', '☎️', '🏛️', '🌎'] },
  { label: 'Símbolos', emojis: ['⭐', '🌟', '✨', '❤️', '💙', '🔥', '🚀', '🎯', '🎉', '🎊', '➡️', '▶️', '👉', '🆕', '💯', '🔝'] },
];

const EmojiPicker = ({ onSelect }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Insertar emoji"
        title="Insertar emoji"
        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-slate-100 ${open ? 'bg-slate-100 text-primary' : 'text-slate-600'}`}
      >
        <Smile size={17} />
      </button>
      {open && (
        <div role="group" aria-label="Emojis" className="absolute left-0 top-full z-30 mt-2 max-h-72 w-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-3xl">
          {groups.map((group) => (
            <div key={group.label} className="mb-2 last:mb-0">
              <p className="mb-1 text-[0.7rem] font-bold uppercase tracking-wide text-slate-400">{group.label}</p>
              <div className="grid grid-cols-8 gap-0.5">
                {group.emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => { onSelect(emoji); setOpen(false); }}
                    className="rounded-lg p-1 text-xl transition hover:bg-sky-50"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmojiPicker;
