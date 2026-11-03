import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowDown, ArrowUp, Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import Swal from 'sweetalert2';
import {
  createCategoryRequest, deleteCategoryRequest, getCategoriesRequest, updateCategoryRequest
} from '../api/categories';
import { getApiErrors } from '../api/errors';

const smallButton = 'inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40';

/* Gestión de categorías (solo administradores): crear, renombrar, ordenar y eliminar las que no se usan.
   Quien edita una noticia también puede crear una desde el propio formulario (CategoryField). */
const CategoriesModal = ({ onClose, onChanged }) => {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState('');
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const closeRef = useRef(null);

  const load = useCallback(async () => {
    try {
      setCategories((await getCategoriesRequest()).data);
    } catch (requestError) {
      setError(getApiErrors(requestError, 'No se pudieron cargar las categorías')[0]);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    closeRef.current?.focus();
    const onKeyDown = (event) => { if (event.key === 'Escape' && !Swal.isVisible()) onClose(); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const run = async (action, fallback) => {
    setBusy(true);
    setError('');
    try {
      await action();
      await load();
      onChanged?.();
    } catch (requestError) {
      setError(requestError.response?.status === 409
        ? 'Ya existe una categoría con ese nombre o se está usando.'
        : getApiErrors(requestError, fallback)[0]);
    } finally {
      setBusy(false);
    }
  };

  const handleCreate = (event) => {
    event.preventDefault();
    if (!newName.trim()) return;
    run(async () => { await createCategoryRequest(newName.trim()); setNewName(''); }, 'No se pudo crear la categoría');
  };

  const handleRename = (category) => {
    const name = editing.name.trim();
    setEditing(null);
    if (!name || name === category.name) return;
    run(() => updateCategoryRequest(category._id, { name }), 'No se pudo renombrar la categoría');
  };

  const handleMove = (index, step) => {
    const first = categories[index];
    const second = categories[index + step];
    // se intercambian las posiciones de las dos categorías vecinas
    run(async () => {
      await updateCategoryRequest(first._id, { order: second.order === first.order ? second.order + step : second.order });
      await updateCategoryRequest(second._id, { order: first.order });
    }, 'No se pudo reordenar');
  };

  const handleDelete = async (category) => {
    const result = await Swal.fire({ title: `¿Eliminar «${category.name}»?`, text: 'Las noticias ya no podrán usarla.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Eliminar', confirmButtonColor: '#dc2626', cancelButtonText: 'Cancelar', cancelButtonColor: '#475569', reverseButtons: true, focusCancel: true });
    if (result.isConfirmed) run(() => deleteCategoryRequest(category._id), 'No se pudo eliminar la categoría');
  };

  return createPortal(
    <div role="dialog" aria-modal="true" aria-labelledby="categories-title" className="fixed inset-0 z-[10010] flex items-end justify-center bg-slate-950/50 p-4 sm:items-center" onClick={onClose}>
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-3xl bg-white p-6 shadow-3xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="categories-title" className="text-lg font-bold text-slate-900">Categorías</h2>
            <p className="mt-1 text-sm text-slate-500">Se muestran en el portal y sirven para filtrar las noticias.</p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Cerrar" className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"><X size={20} /></button>
        </div>

        <form onSubmit={handleCreate} className="mt-5 flex gap-2">
          <input value={newName} onChange={(event) => setNewName(event.target.value)} maxLength={40} placeholder="Nueva categoría (por ejemplo, Avisos)" aria-label="Nombre de la nueva categoría" className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100" />
          <button type="submit" disabled={busy || !newName.trim()} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"><Plus size={16} /> Agregar</button>
        </form>

        {error && <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <ul className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
          {categories.length === 0 && <li className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">Aún no hay categorías.</li>}
          {categories.map((category, index) => (
            <li key={category._id} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
              {editing?._id === category._id ? (
                <form onSubmit={(event) => { event.preventDefault(); handleRename(category); }} className="flex min-w-0 flex-1 items-center gap-2">
                  <input autoFocus value={editing.name} maxLength={40} onChange={(event) => setEditing({ ...editing, name: event.target.value })} aria-label="Nuevo nombre" className="min-w-0 flex-1 rounded-lg border border-sky-300 px-3 py-1.5 text-sm outline-none ring-4 ring-sky-100" />
                  <button type="submit" aria-label="Guardar nombre" className={smallButton}><Check size={16} /></button>
                  <button type="button" onClick={() => setEditing(null)} aria-label="Cancelar" className={smallButton}><X size={16} /></button>
                </form>
              ) : (
                <>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">{category.name}</span>
                  <span className="shrink-0 text-xs text-slate-400">{category.count} {category.count === 1 ? 'noticia' : 'noticias'}</span>
                  <button type="button" disabled={busy || index === 0} onClick={() => handleMove(index, -1)} aria-label={`Subir ${category.name}`} className={smallButton}><ArrowUp size={16} /></button>
                  <button type="button" disabled={busy || index === categories.length - 1} onClick={() => handleMove(index, 1)} aria-label={`Bajar ${category.name}`} className={smallButton}><ArrowDown size={16} /></button>
                  <button type="button" disabled={busy} onClick={() => setEditing({ _id: category._id, name: category.name })} aria-label={`Renombrar ${category.name}`} className={smallButton}><Pencil size={15} /></button>
                  <button type="button" disabled={busy || category.count > 0} onClick={() => handleDelete(category)} title={category.count > 0 ? 'No se puede eliminar: tiene noticias' : 'Eliminar'} aria-label={`Eliminar ${category.name}`} className={`${smallButton} hover:text-red-600`}><Trash2 size={15} /></button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>,
    document.body,
  );
};

export default CategoriesModal;
