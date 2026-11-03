import { useEffect, useRef, useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { createCategoryRequest, getCategoriesRequest } from '../../api/categories';
import { getApiErrors } from '../../api/errors';
import { ErrorText, Field, fieldClass } from './editors/fields';
import { CATEGORY_NAME_MAX, categoryNameError, cleanCategoryName, findCategoryByName, withCategory } from './categories';

/* Selector de categoría con alta rápida: quien edita una noticia crea la categoría sin salir del formulario.
   Renombrar, ordenar y eliminar siguen siendo de administradores (Noticias → Categorías). */
const CategoryField = ({ categories, value, onSelect, onCategoriesChange }) => {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  const open = () => {
    setNotice('');
    setAdding(true);
  };

  const close = () => {
    setAdding(false);
    setName('');
    setError('');
  };

  const choose = (category, message) => {
    onSelect(category._id);
    setNotice(message);
    close();
  };

  // otra persona la creó después de abrir esta noticia: se recarga la lista y se elige la que ya existe
  const chooseExisting = async (clean) => {
    try {
      const { data } = await getCategoriesRequest();
      onCategoriesChange(data);
      const existing = findCategoryByName(data, clean);
      if (existing) {
        choose(existing, `«${existing.name}» ya existía y quedó elegida.`);
        return;
      }
    } catch {
      // se muestra el aviso de abajo
    }
    setError('Ya existe una categoría con ese nombre.');
  };

  const create = async () => {
    const problem = categoryNameError(name);
    if (problem) {
      setError(problem);
      return;
    }
    const clean = cleanCategoryName(name);

    const known = findCategoryByName(categories, clean);
    if (known) {
      choose(known, `«${known.name}» ya existía y quedó elegida.`);
      return;
    }

    setBusy(true);
    setError('');
    try {
      const { data } = await createCategoryRequest(clean);
      onCategoriesChange(withCategory(categories, data));
      choose(data, `«${data.name}» creada y elegida.`);
    } catch (requestError) {
      if (requestError.response?.status === 409) await chooseExisting(clean);
      else setError(getApiErrors(requestError, 'No se pudo crear la categoría')[0]);
    } finally {
      setBusy(false);
    }
  };

  const handleKeyDown = (event) => {
    // Enter crea la categoría; sin esto enviaría toda la noticia
    if (event.key === 'Enter') {
      event.preventDefault();
      create();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      close();
    }
  };

  return (
    <div>
      <Field label="Categoría">
        <select value={value} onChange={(event) => { setNotice(''); onSelect(event.target.value); }} className={fieldClass}>
          <option value="">Sin categoría</option>
          {categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
        </select>
      </Field>

      {adding ? (
        <div className="mt-3 space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex flex-wrap gap-2">
            <input
              ref={inputRef}
              type="text"
              value={name}
              maxLength={CATEGORY_NAME_MAX}
              placeholder="Por ejemplo, Eventos"
              aria-label="Nombre de la nueva categoría"
              onChange={(event) => { setName(event.target.value); setError(''); }}
              onKeyDown={handleKeyDown}
              className={`${fieldClass} min-w-[10rem] flex-1 bg-white`}
            />
            <button type="button" onClick={create} disabled={busy || !name.trim()} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50">
              {busy ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} Crear
            </button>
            <button type="button" onClick={close} disabled={busy} className="shrink-0 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-white disabled:opacity-50">Cancelar</button>
          </div>
          <ErrorText>{error}</ErrorText>
        </div>
      ) : (
        <button type="button" onClick={open} className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition hover:text-secondary">
          <Plus size={14} /> Nueva categoría
        </button>
      )}

      {notice && <p role="status" className="mt-2 text-xs font-medium text-emerald-700">{notice}</p>}
    </div>
  );
};

export default CategoryField;
