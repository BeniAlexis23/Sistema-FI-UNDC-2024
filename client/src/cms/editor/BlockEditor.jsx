import { useCallback, useEffect, useMemo, useState } from 'react';
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus } from 'lucide-react';
import Swal from 'sweetalert2';
import BlockShell from './BlockShell';
import { EditorContext } from './EditorContext';
import { blockTypes, newBlockId } from './blockTypes';
import { isEmptyBlock } from './noticeForm';
import TextBlockEditor from './editors/TextBlockEditor';
import ImageBlockEditor from './editors/ImageBlockEditor';
import GalleryBlockEditor from './editors/GalleryBlockEditor';
import VideoBlockEditor from './editors/VideoBlockEditor';
import CalloutBlockEditor from './editors/CalloutBlockEditor';
import ButtonBlockEditor from './editors/ButtonBlockEditor';
import DividerBlockEditor from './editors/DividerBlockEditor';

const editors = {
  text: TextBlockEditor,
  image: ImageBlockEditor,
  gallery: GalleryBlockEditor,
  video: VideoBlockEditor,
  callout: CalloutBlockEditor,
  button: ButtonBlockEditor,
  divider: DividerBlockEditor,
};

const AddBlockMenu = ({ onAdd }) => (
  <div role="menu" aria-label="Tipo de bloque" className="grid gap-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg sm:grid-cols-2 lg:grid-cols-4">
    {blockTypes.map(({ type, label, hint, icon: Icon }) => (
      <button key={type} type="button" role="menuitem" onClick={() => onAdd(type)} className="flex items-start gap-3 rounded-xl p-3 text-left transition hover:bg-sky-50 focus-visible:bg-sky-50 focus-visible:outline-none">
        <Icon size={20} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
        <span>
          <span className="block text-sm font-semibold text-slate-800">{label}</span>
          <span className="block text-xs text-slate-500">{hint}</span>
        </span>
      </button>
    ))}
  </div>
);

/* Punto para insertar un bloque entre otros (o al final, con un botón más visible) */
const InsertPoint = ({ onAdd, prominent = false }) => {
  const [open, setOpen] = useState(false);

  if (open) return <AddBlockMenu onAdd={(type) => { onAdd(type); setOpen(false); }} />;

  return (
    <div className="group flex items-center gap-3 py-1">
      <span className="h-px flex-1 bg-slate-200 transition group-hover:bg-sky-300" />
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Agregar un bloque aquí"
        className={`inline-flex items-center gap-2 rounded-full border font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-100 ${prominent ? 'border-primary bg-sky-50 px-5 py-2.5 text-sm text-primary hover:bg-sky-100' : 'border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-500 hover:border-primary hover:text-primary'}`}
      >
        <Plus size={prominent ? 16 : 14} /> {prominent && 'Agregar bloque'}
      </button>
      <span className="h-px flex-1 bg-slate-200 transition group-hover:bg-sky-300" />
    </div>
  );
};

const SortableBlock = ({ block, index, total, autoFocus, onChange, onMove, onDuplicate, onDelete }) => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const Editor = editors[block.type];
  if (!Editor) return null;

  return (
    <BlockShell
      type={block.type}
      index={index}
      total={total}
      innerRef={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      dragging={isDragging}
      dragHandle={(
        <button type="button" ref={setActivatorNodeRef} {...attributes} {...listeners} aria-label={`Mover el bloque ${index + 1}`} title="Arrastrar para mover" className="inline-flex h-8 w-8 cursor-grab touch-none items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-primary">
          <GripVertical size={17} />
        </button>
      )}
      onMoveUp={() => onMove(index, index - 1)}
      onMoveDown={() => onMove(index, index + 1)}
      onDuplicate={() => onDuplicate(block)}
      onDelete={() => onDelete(block)}
    >
      <Editor block={block} autoFocus={autoFocus} onChange={(next) => onChange(block.id, next)} />
    </BlockShell>
  );
};

const instructions = {
  draggable: 'Para mover un bloque, presiona la barra espaciadora y usa las flechas arriba y abajo. Vuelve a presionar la barra espaciadora para soltarlo o Escape para cancelar.',
};

/* Editor de contenido por bloques: texto, imagen, galería, video, aviso, botón y separador */
const BlockEditor = ({ blocks, onBlocksChange, onBusyChange }) => {
  const [busyCount, setBusyCount] = useState(0);
  const [lastAddedId, setLastAddedId] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const trackUpload = useCallback((promise) => {
    setBusyCount((count) => count + 1);
    return promise.finally(() => setBusyCount((count) => count - 1));
  }, []);
  const context = useMemo(() => ({ trackUpload }), [trackUpload]);

  useEffect(() => { onBusyChange?.(busyCount > 0); }, [busyCount, onBusyChange]);

  const positionOf = (id) => blocks.findIndex((block) => block.id === id) + 1;
  const announcements = {
    onDragStart: ({ active }) => `Tomaste el bloque ${positionOf(active.id)}.`,
    onDragOver: ({ over }) => (over ? `Está sobre la posición ${positionOf(over.id)}.` : undefined),
    onDragEnd: ({ over }) => (over ? `Soltaste el bloque en la posición ${positionOf(over.id)}.` : 'Soltaste el bloque en su lugar.'),
    onDragCancel: () => 'Se canceló el movimiento.',
  };

  const addBlock = (type, position) => {
    const block = blockTypes.find((item) => item.type === type).create();
    onBlocksChange((current) => [...current.slice(0, position), block, ...current.slice(position)]);
    setLastAddedId(block.id);
  };

  // la actualización puede ser un bloque nuevo o una función: las subidas terminan en momentos distintos
  const updateBlock = useCallback((id, next) => onBlocksChange((current) => current.map((block) => (
    block.id === id ? (typeof next === 'function' ? next(block) : next) : block
  ))), [onBlocksChange]);

  const moveBlock = (from, to) => onBlocksChange((current) => (to < 0 || to >= current.length ? current : arrayMove(current, from, to)));

  const duplicateBlock = (block) => {
    const copy = { ...structuredClone(block), id: newBlockId() };
    onBlocksChange((current) => {
      const index = current.findIndex((item) => item.id === block.id);
      return [...current.slice(0, index + 1), copy, ...current.slice(index + 1)];
    });
    setLastAddedId(copy.id);
  };

  const deleteBlock = async (block) => {
    if (!isEmptyBlock(block)) {
      const result = await Swal.fire({ title: '¿Eliminar este bloque?', text: 'Se perderá su contenido.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Eliminar', confirmButtonColor: '#dc2626', cancelButtonText: 'Cancelar', cancelButtonColor: '#475569', reverseButtons: true, focusCancel: true });
      if (!result.isConfirmed) return;
    }
    onBlocksChange((current) => current.filter((item) => item.id !== block.id));
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    onBlocksChange((current) => {
      const from = current.findIndex((block) => block.id === active.id);
      const to = current.findIndex((block) => block.id === over.id);
      return arrayMove(current, from, to);
    });
  };

  return (
    <EditorContext.Provider value={context}>
      {blocks.length === 0 ? (
        <div className="space-y-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-5 text-center">
          <p className="text-sm text-slate-600">Arma la noticia agregando bloques: texto, fotos, galerías, videos y más.</p>
          <AddBlockMenu onAdd={(type) => addBlock(type, 0)} />
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} accessibility={{ announcements, screenReaderInstructions: instructions }}>
          <SortableContext items={blocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              <InsertPoint onAdd={(type) => addBlock(type, 0)} />
              {blocks.map((block, index) => (
                <div key={block.id} className="space-y-2">
                  <SortableBlock
                    block={block}
                    index={index}
                    total={blocks.length}
                    autoFocus={block.id === lastAddedId}
                    onChange={updateBlock}
                    onMove={moveBlock}
                    onDuplicate={duplicateBlock}
                    onDelete={deleteBlock}
                  />
                  <InsertPoint prominent={index === blocks.length - 1} onAdd={(type) => addBlock(type, index + 1)} />
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </EditorContext.Provider>
  );
};

export default BlockEditor;
