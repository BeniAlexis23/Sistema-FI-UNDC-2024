import { useEffect, useRef, useState } from 'react';
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AlertCircle, GalleryHorizontal, GripVertical, LayoutDashboard, LayoutGrid, RotateCcw, X } from 'lucide-react';
import ImageDropzone from '../ImageDropzone';
import { useEditorContext } from '../EditorContext';
import { uploadImages, validateImageFile } from '../uploads';
import { assetUrl } from '../../../utils/assetUrl';
import { thumbUrl } from '../../media';
import { ErrorText, OptionGroup, TextInput } from './fields';

const MAX_IMAGES = 30;

const layouts = [
  { value: 'carousel', label: 'Carrusel', icon: <GalleryHorizontal size={16} /> },
  { value: 'grid', label: 'Cuadrícula', icon: <LayoutGrid size={16} /> },
  { value: 'mosaic', label: 'Mosaico', icon: <LayoutDashboard size={16} /> },
];

const thumbButton = 'absolute inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-slate-700 shadow transition hover:bg-white hover:text-primary';

const SortableThumb = ({ image, position, selected, onSelect, onRemove }) => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: image.url });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`relative aspect-square overflow-hidden rounded-xl border-2 bg-slate-100 ${selected ? 'border-primary' : 'border-transparent'} ${isDragging ? 'z-10 shadow-xl' : ''}`}
    >
      <button type="button" onClick={onSelect} aria-pressed={selected} aria-label={`Editar la imagen ${position}`} className="block h-full w-full">
        <img src={assetUrl(thumbUrl(image.url))} alt={image.alt || `Imagen ${position}`} className="h-full w-full object-cover" />
      </button>
      <button type="button" ref={setActivatorNodeRef} {...attributes} {...listeners} aria-label={`Mover la imagen ${position}`} className={`${thumbButton} left-1.5 top-1.5 cursor-grab touch-none`}>
        <GripVertical size={15} />
      </button>
      <button type="button" onClick={onRemove} aria-label={`Quitar la imagen ${position}`} className={`${thumbButton} right-1.5 top-1.5 hover:text-red-600`}>
        <X size={15} />
      </button>
    </li>
  );
};

const GalleryBlockEditor = ({ block, onChange }) => {
  const { trackUpload } = useEditorContext();
  const [pending, setPending] = useState([]);
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [message, setMessage] = useState('');
  const previews = useRef(new Set());
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    const urls = previews.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const images = block.images ?? [];
  const selected = images.find((image) => image.url === selectedUrl);
  const inFlight = pending.filter((item) => !item.error).length;
  const remaining = Math.max(0, MAX_IMAGES - images.length - inFlight);
  const set = (changes) => onChange((current) => ({ ...current, ...changes }));

  const upload = (items) => trackUpload(uploadImages(items, {
    onProgress: (key, progress) => setPending((current) => current.map((item) => (item.key === key ? { ...item, progress } : item))),
    onResult: (key, { image, error }) => {
      if (image) {
        onChange((current) => ({ ...current, images: [...(current.images ?? []), { url: image.url, alt: '', caption: '' }] }));
        setPending((current) => current.filter((item) => item.key !== key));
      } else {
        setPending((current) => current.map((item) => (item.key === key ? { ...item, error } : item)));
      }
    },
  }));

  const handleFiles = (files) => {
    const problems = [];
    const valid = files.filter((file) => {
      const problem = validateImageFile(file);
      if (problem) problems.push(`${file.name}: ${problem}`);
      return !problem;
    });
    if (valid.length > remaining) problems.push(`Solo caben ${remaining} imágenes más (máximo ${MAX_IMAGES} por galería).`);
    setMessage(problems.join(' '));

    const items = valid.slice(0, remaining).map((file) => {
      const preview = URL.createObjectURL(file);
      previews.current.add(preview);
      return { key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, file, name: file.name, preview, progress: 0, error: '' };
    });
    if (items.length === 0) return;
    setPending((current) => [...current, ...items]);
    upload(items);
  };

  const retry = (item) => {
    setPending((current) => current.map((entry) => (entry.key === item.key ? { ...entry, error: '', progress: 0 } : entry)));
    upload([item]);
  };

  const discard = (item) => {
    URL.revokeObjectURL(item.preview);
    previews.current.delete(item.preview);
    setPending((current) => current.filter((entry) => entry.key !== item.key));
  };

  const updateSelected = (changes) => onChange((current) => ({
    ...current,
    images: current.images.map((image) => (image.url === selectedUrl ? { ...image, ...changes } : image)),
  }));

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    onChange((current) => {
      const from = current.images.findIndex((image) => image.url === active.id);
      const to = current.images.findIndex((image) => image.url === over.id);
      return { ...current, images: arrayMove(current.images, from, to) };
    });
  };

  const removeImage = (url) => {
    if (url === selectedUrl) setSelectedUrl(null);
    onChange((current) => ({ ...current, images: current.images.filter((image) => image.url !== url) }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <OptionGroup label="Presentación de la galería" value={block.layout} options={layouts} onChange={(layout) => set({ layout })} />
        <span className="text-xs font-semibold text-slate-500">{images.length} de {MAX_IMAGES} imágenes</span>
      </div>

      {images.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={images.map((image) => image.url)} strategy={rectSortingStrategy}>
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6" aria-label="Imágenes de la galería">
              {images.map((image, index) => (
                <SortableThumb
                  key={image.url}
                  image={image}
                  position={index + 1}
                  selected={image.url === selectedUrl}
                  onSelect={() => setSelectedUrl(image.url === selectedUrl ? null : image.url)}
                  onRemove={() => removeImage(image.url)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      {selected && (
        <div className="grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
          <TextInput label={`Descripción de la imagen ${images.indexOf(selected) + 1}`} value={selected.alt} maxLength={200} onChange={(alt) => updateSelected({ alt })} />
          <TextInput label="Pie de foto (opcional)" value={selected.caption} maxLength={300} onChange={(caption) => updateSelected({ caption })} />
        </div>
      )}

      {pending.length > 0 && (
        <ul className="grid gap-2 sm:grid-cols-2" aria-label="Imágenes en proceso">
          {pending.map((item) => (
            <li key={item.key} className="flex items-center gap-3 rounded-xl border border-slate-200 p-2">
              <img src={item.preview} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-700">{item.name}</p>
                {item.error ? (
                  <p className="flex items-start gap-1 text-xs text-red-600"><AlertCircle size={13} className="mt-0.5 shrink-0" /> {item.error}</p>
                ) : (
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuenow={item.progress} aria-valuemin={0} aria-valuemax={100}>
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${item.progress}%` }} />
                  </div>
                )}
              </div>
              {item.error && (
                <>
                  <button type="button" onClick={() => retry(item)} aria-label={`Reintentar ${item.name}`} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-primary"><RotateCcw size={15} /></button>
                  <button type="button" onClick={() => discard(item)} aria-label={`Descartar ${item.name}`} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-red-600"><X size={15} /></button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <ErrorText>{message}</ErrorText>

      <ImageDropzone multiple compact={images.length > 0 || pending.length > 0} disabled={remaining === 0} onFiles={handleFiles} />
    </div>
  );
};

export default GalleryBlockEditor;
