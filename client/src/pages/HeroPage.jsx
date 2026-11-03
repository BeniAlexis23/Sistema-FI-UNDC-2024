import { useCallback, useEffect, useRef, useState } from 'react';
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowDown, ArrowUp, Download, Eye, EyeOff, GripVertical, Images, Info, Pencil, Plus, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import AdminLayout from '../components/AdminLayout';
import {
  createHeroSlideRequest, deleteHeroSlideRequest, getHeroSlidesRequest, reorderHeroSlidesRequest,
  updateHeroSettingsRequest, updateHeroSlideRequest
} from '../api/hero';
import { getApiErrors } from '../api/errors';
import { assetUrl } from '../utils/assetUrl';
import { thumbUrl } from '../cms/media';
import { uploadErrorMessage, uploadImage, validateImageFile } from '../cms/editor/uploads';
import SlideEditorModal from '../cms/hero/admin/SlideEditorModal';
import { fallbackSlides } from '../cms/hero/fallbackSlides';
import { MAX_SLIDES } from '../cms/hero/heroForm';
import { STATUS, describeLink, describeSchedule } from '../cms/hero/heroStatus';
import { importBanners } from '../cms/hero/importBanners';

const INTERVAL_OPTIONS = [3, 4, 5, 6, 8, 10, 12, 15, 20];
const fieldClass = 'rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100';
const iconButton = 'inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40';
const primaryButton = 'inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(16,129,234,0.22)] transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60';

const confirmDelete = (text) => Swal.fire({ title: '¿Eliminar esta diapositiva?', text, icon: 'warning', showCancelButton: true, confirmButtonText: 'Eliminar', confirmButtonColor: '#dc2626', cancelButtonText: 'Cancelar', cancelButtonColor: '#475569', reverseButtons: true, focusCancel: true });

const instructions = {
  draggable: 'Para mover una diapositiva, presiona la barra espaciadora y usa las flechas arriba y abajo. Vuelve a presionar la barra espaciadora para soltarla o Escape para cancelar.',
};

const SlideRow = ({ slide, index, total, busy, locked, onEdit, onToggle, onDelete, onMove }) => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: slide._id, disabled: locked });
  const status = STATUS[slide.status] ?? STATUS.active;
  const details = [slide.status === 'inactive' ? '' : describeSchedule(slide) && `Se muestra ${describeSchedule(slide)}`, describeLink(slide)].filter(Boolean).join(' · ');

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex flex-col gap-3 rounded-2xl border bg-white p-3 shadow-sm sm:flex-row sm:items-center ${isDragging ? 'relative z-10 border-sky-300 shadow-lg' : 'border-slate-200'}`}
    >
      <div className="flex items-center gap-3">
        <button type="button" ref={setActivatorNodeRef} {...attributes} {...listeners} disabled={locked} aria-label={`Mover la diapositiva ${index + 1}`} title="Arrastrar para mover" className={`${iconButton} w-8 cursor-grab touch-none`}>
          <GripVertical size={18} aria-hidden="true" />
        </button>
        <span className="w-5 text-center text-sm font-bold text-slate-400" aria-hidden="true">{index + 1}</span>
        <img
          src={assetUrl(thumbUrl(slide.image))}
          alt=""
          className={`h-16 w-28 shrink-0 rounded-xl border border-slate-200 object-cover ${slide.status === 'inactive' ? 'opacity-60' : ''}`}
          style={{ objectPosition: `${slide.focusX}% ${slide.focusY}%` }}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-bold text-slate-900">{slide.title || slide.alt || 'Sin título'}</p>
          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${status.className}`}>{status.label}</span>
        </div>
        {slide.subtitle && <p className="mt-0.5 truncate text-sm text-slate-500">{slide.subtitle}</p>}
        {details && <p className="mt-1 text-xs text-slate-500">{details}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        <button type="button" disabled={locked || index === 0} onClick={() => onMove(index, index - 1)} aria-label={`Subir la diapositiva ${index + 1}`} className={iconButton}><ArrowUp size={17} aria-hidden="true" /></button>
        <button type="button" disabled={locked || index === total - 1} onClick={() => onMove(index, index + 1)} aria-label={`Bajar la diapositiva ${index + 1}`} className={iconButton}><ArrowDown size={17} aria-hidden="true" /></button>
        <button type="button" disabled={busy || locked} onClick={() => onToggle(slide)} aria-label={slide.active ? `Apagar la diapositiva ${index + 1}` : `Encender la diapositiva ${index + 1}`} title={slide.active ? 'Apagar (deja de verse)' : 'Encender'} className={iconButton}>
          {slide.active ? <Eye size={17} aria-hidden="true" /> : <EyeOff size={17} aria-hidden="true" />}
        </button>
        <button type="button" disabled={busy || locked} onClick={() => onEdit(slide)} aria-label={`Editar la diapositiva ${index + 1}`} title="Editar" className={iconButton}><Pencil size={16} aria-hidden="true" /></button>
        <button type="button" disabled={busy || locked} onClick={() => onDelete(slide)} aria-label={`Eliminar la diapositiva ${index + 1}`} title="Eliminar" className={`${iconButton} hover:text-red-600`}><Trash2 size={16} aria-hidden="true" /></button>
      </div>
    </li>
  );
};

/* Administración del carrusel de la portada (administradores y editores) */
const HeroPage = () => {
  const [slides, setSlides] = useState([]);
  const [settings, setSettings] = useState({ includeFeatured: false, intervalSeconds: 6 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editor, setEditor] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [reordering, setReordering] = useState(false);
  const [importing, setImporting] = useState(null);
  const messageTimer = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const flash = useCallback((text) => {
    setMessage(text);
    clearTimeout(messageTimer.current);
    messageTimer.current = setTimeout(() => setMessage(''), 5000);
  }, []);
  useEffect(() => () => clearTimeout(messageTimer.current), []);

  const load = useCallback(async () => {
    try {
      const { data } = await getHeroSlidesRequest();
      setSlides(data.slides);
      setSettings(data.settings);
      setError('');
    } catch (requestError) {
      setError(getApiErrors(requestError, 'No se pudo cargar la portada')[0]);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const locked = reordering || Boolean(importing);
  const visibleCount = slides.filter((slide) => slide.status === 'active').length;

  const applyOrder = async (next) => {
    const previous = slides;
    setSlides(next);
    setReordering(true);
    setError('');
    try {
      const { data } = await reorderHeroSlidesRequest(next.map((slide) => slide._id));
      setSlides(data.slides);
    } catch (requestError) {
      setSlides(previous);
      if (requestError.response?.status === 409) {
        setError('La lista cambió desde otra sesión. Se cargó de nuevo; vuelve a intentarlo.');
        load();
      } else {
        setError(getApiErrors(requestError, 'No se pudo cambiar el orden')[0]);
      }
    } finally {
      setReordering(false);
    }
  };

  const moveSlide = (from, to) => {
    if (to < 0 || to >= slides.length) return;
    applyOrder(arrayMove(slides, from, to));
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    applyOrder(arrayMove(slides, slides.findIndex((slide) => slide._id === active.id), slides.findIndex((slide) => slide._id === over.id)));
  };

  const positionOf = (id) => slides.findIndex((slide) => slide._id === id) + 1;
  const announcements = {
    onDragStart: ({ active }) => `Tomaste la diapositiva ${positionOf(active.id)}.`,
    onDragOver: ({ over }) => (over ? `Está sobre la posición ${positionOf(over.id)}.` : undefined),
    onDragEnd: ({ over }) => (over ? `Soltaste la diapositiva en la posición ${positionOf(over.id)}.` : 'Soltaste la diapositiva en su lugar.'),
    onDragCancel: () => 'Se canceló el movimiento.',
  };

  const toggleSlide = async (slide) => {
    setBusyId(slide._id);
    setError('');
    try {
      const { data } = await updateHeroSlideRequest(slide._id, { active: !slide.active });
      setSlides((current) => current.map((item) => (item._id === data._id ? data : item)));
    } catch (requestError) {
      setError(getApiErrors(requestError, 'No se pudo cambiar la diapositiva')[0]);
    } finally {
      setBusyId(null);
    }
  };

  const deleteSlide = async (slide) => {
    const othersVisible = slides.some((item) => item._id !== slide._id && item.status === 'active');
    const lastOne = !othersVisible && !settings.includeFeatured;
    const result = await confirmDelete(lastOne
      ? 'Es la última diapositiva visible: el sitio volverá a mostrar los banners institucionales por defecto.'
      : 'Se quitará del carrusel y se borrará su imagen.');
    if (!result.isConfirmed) return;

    setBusyId(slide._id);
    setError('');
    try {
      await deleteHeroSlideRequest(slide._id);
      setSlides((current) => current.filter((item) => item._id !== slide._id));
    } catch (requestError) {
      setError(getApiErrors(requestError, 'No se pudo eliminar la diapositiva')[0]);
    } finally {
      setBusyId(null);
    }
  };

  const changeSettings = async (changes) => {
    const previous = settings;
    setSettings({ ...settings, ...changes });
    setError('');
    try {
      const { data } = await updateHeroSettingsRequest(changes);
      setSettings(data);
      flash('Ajustes guardados.');
    } catch (requestError) {
      setSettings(previous);
      setError(getApiErrors(requestError, 'No se pudieron guardar los ajustes')[0]);
    }
  };

  const handleSaved = (saved) => {
    setSlides((current) => (current.some((item) => item._id === saved._id)
      ? current.map((item) => (item._id === saved._id ? saved : item))
      : [...current, saved]));
    flash(editor?.slide ? 'Diapositiva actualizada.' : 'Diapositiva creada.');
    setEditor(null);
  };

  const handleImport = async () => {
    setError('');
    setImporting({ done: 0, total: fallbackSlides.length });
    try {
      await importBanners(fallbackSlides, {
        loadFile: async (banner) => {
          const response = await fetch(banner.image);
          if (!response.ok) throw new Error('No se pudo leer uno de los banners del sitio.');
          const blob = await response.blob();
          return new File([blob], `${banner.id}.webp`, { type: blob.type || 'image/webp' });
        },
        upload: async (file) => {
          const invalid = validateImageFile(file);
          if (invalid) throw new Error(invalid);
          return uploadImage(file);
        },
        create: async (slide) => (await createHeroSlideRequest(slide)).data,
        remove: (id) => deleteHeroSlideRequest(id),
        onProgress: (done, total) => setImporting({ done, total }),
      });
      await load();
      flash('Se importaron los banners actuales. Ya puedes editarlos, reordenarlos o apagarlos.');
    } catch (importError) {
      setError(importError.response ? uploadErrorMessage(importError) : (importError.message || 'No se pudieron importar los banners.'));
    } finally {
      setImporting(null);
    }
  };

  const intervalOptions = INTERVAL_OPTIONS.includes(settings.intervalSeconds)
    ? INTERVAL_OPTIONS
    : [...INTERVAL_OPTIONS, settings.intervalSeconds].sort((first, second) => first - second);

  return (
    <AdminLayout
      title="Portada"
      description="Administra las diapositivas del carrusel principal del sitio: su orden, textos, botones y cuándo se muestran."
      action={(
        <button type="button" onClick={() => setEditor({ slide: null })} disabled={locked || slides.length >= MAX_SLIDES} className={primaryButton}>
          <Plus size={18} aria-hidden="true" /> Nueva diapositiva
        </button>
      )}
    >
      <div aria-live="polite" className="mb-4 empty:hidden">
        {message && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{message}</p>}
      </div>
      {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

      <section aria-labelledby="hero-settings-title" className="mb-6 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
        <h2 id="hero-settings-title" className="text-base font-bold text-slate-900">Ajustes del carrusel</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" checked={settings.includeFeatured} onChange={(event) => changeSettings({ includeFeatured: event.target.checked })} className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-sky-200" />
            <span>
              <span className="font-semibold text-slate-800">Incluir noticias destacadas</span>
              <span className="block text-slate-500">Suma al final del carrusel hasta 3 noticias destacadas que tengan foto de portada.</span>
            </span>
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            Tiempo de cada diapositiva
            <select value={settings.intervalSeconds} onChange={(event) => changeSettings({ intervalSeconds: Number(event.target.value) })} className={`${fieldClass} mt-1.5 block w-full sm:w-48`}>
              {intervalOptions.map((seconds) => <option key={seconds} value={seconds}>{seconds} segundos</option>)}
            </select>
          </label>
        </div>
      </section>

      {!loading && (
        <p className="mb-4 flex items-start gap-2 text-sm text-slate-600">
          <Info size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
          {visibleCount === 0 && !settings.includeFeatured
            ? 'No hay diapositivas activas: el sitio muestra los banners institucionales por defecto.'
            : `En el sitio se muestran ${visibleCount} ${visibleCount === 1 ? 'diapositiva activa' : 'diapositivas activas'}${settings.includeFeatured ? ', más las noticias destacadas' : ''}.`}
          <span className="text-slate-400">({slides.length}/{MAX_SLIDES})</span>
        </p>
      )}

      {loading ? (
        <div className="space-y-3" aria-hidden="true">
          {[0, 1, 2].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl bg-slate-200" />)}
        </div>
      ) : slides.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-8 text-center">
          <Images size={34} className="mx-auto text-primary" aria-hidden="true" />
          <h2 className="mt-3 text-base font-bold text-slate-900">Aún no hay diapositivas</h2>
          <p className="mx-auto mt-1 max-w-xl text-sm text-slate-600">
            Mientras tanto el sitio muestra los {fallbackSlides.length} banners institucionales que vienen incluidos. Puedes importarlos para editarlos, reordenarlos o apagarlos, o empezar con una diapositiva nueva.
          </p>
          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <button type="button" onClick={handleImport} disabled={locked} className={primaryButton}>
              <Download size={18} aria-hidden="true" />
              {importing ? `Importando ${Math.min(importing.done + 1, importing.total)} de ${importing.total}…` : 'Importar los banners actuales'}
            </button>
            <button type="button" onClick={() => setEditor({ slide: null })} disabled={locked} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:text-primary disabled:opacity-60">
              <Plus size={18} aria-hidden="true" /> Crear una diapositiva
            </button>
          </div>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} accessibility={{ announcements, screenReaderInstructions: instructions }}>
          <SortableContext items={slides.map((slide) => slide._id)} strategy={verticalListSortingStrategy}>
            <ol className="space-y-3">
              {slides.map((slide, index) => (
                <SlideRow
                  key={slide._id}
                  slide={slide}
                  index={index}
                  total={slides.length}
                  busy={busyId === slide._id}
                  locked={locked}
                  onEdit={(item) => setEditor({ slide: item })}
                  onToggle={toggleSlide}
                  onDelete={deleteSlide}
                  onMove={moveSlide}
                />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      )}

      {editor && <SlideEditorModal slide={editor.slide} onClose={() => setEditor(null)} onSaved={handleSaved} />}
    </AdminLayout>
  );
};

export default HeroPage;
