import { ArrowDown, ArrowUp, Copy, Trash2 } from 'lucide-react';
import { blockTypeOf } from './blockTypes';

const actionButton = 'inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30';

/* Marco de cada bloque: título, mover, duplicar y eliminar */
const BlockShell = ({ type, index, total, innerRef, style, dragging, dragHandle, onMoveUp, onMoveDown, onDuplicate, onDelete, children }) => {
  const info = blockTypeOf(type);
  const Icon = info?.icon;

  return (
    <section
      ref={innerRef}
      style={style}
      aria-label={`Bloque ${index + 1}: ${info?.label ?? type}`}
      className={`rounded-2xl border bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)] ${dragging ? 'relative z-10 border-primary shadow-xl' : 'border-slate-200'}`}
    >
      <header className="flex items-center gap-1 border-b border-slate-100 px-2 py-1.5">
        {dragHandle}
        <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-700">
          {Icon && <Icon size={16} className="text-primary" aria-hidden="true" />}
          {info?.label ?? type}
        </span>
        <span className="ml-1 text-xs text-slate-400">#{index + 1}</span>
        <div className="ml-auto flex items-center gap-0.5">
          <button type="button" onClick={onMoveUp} disabled={index === 0} aria-label={`Subir el bloque ${index + 1}`} title="Subir" className={actionButton}><ArrowUp size={16} /></button>
          <button type="button" onClick={onMoveDown} disabled={index === total - 1} aria-label={`Bajar el bloque ${index + 1}`} title="Bajar" className={actionButton}><ArrowDown size={16} /></button>
          <button type="button" onClick={onDuplicate} aria-label={`Duplicar el bloque ${index + 1}`} title="Duplicar" className={actionButton}><Copy size={15} /></button>
          <button type="button" onClick={onDelete} aria-label={`Eliminar el bloque ${index + 1}`} title="Eliminar" className={`${actionButton} hover:text-red-600`}><Trash2 size={15} /></button>
        </div>
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
};

export default BlockShell;
