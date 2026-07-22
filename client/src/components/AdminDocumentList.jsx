import { Download, FileText, Pencil, Search, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDocumentList = ({ items, resourcePath, searchTerm, onSearch, selectedYear, onYearChange, years, onDelete, emptyLabel }) => (
  <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
    <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <label className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-sky-300 focus-within:bg-white sm:max-w-md">
        <Search size={18} className="text-slate-400" />
        <input value={searchTerm} onChange={onSearch} className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400" placeholder="Buscar por título o descripción" />
      </label>
      <select value={selectedYear} onChange={onYearChange} aria-label="Filtrar por año" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-sky-300">
        <option value="">Todos los años</option>
        {years.map((year) => <option key={year} value={year}>{year}</option>)}
      </select>
    </div>

    {items.length === 0 ? (
      <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
        <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-primary"><FileText size={27} /></span>
        <h2 className="text-lg font-bold text-slate-900">{emptyLabel}</h2>
        <p className="mt-2 text-sm text-slate-500">Prueba cambiando los filtros o registra un nuevo documento.</p>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50 text-left text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500">
            <tr><th className="px-5 py-4">Documento</th><th className="px-5 py-4">Descripción</th><th className="px-5 py-4 text-center">Archivo</th><th className="px-5 py-4 text-right">Acciones</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item._id} className="transition hover:bg-sky-50/40">
                <td className="max-w-xs px-5 py-4 text-sm font-semibold text-slate-900">{item.title}</td>
                <td className="max-w-md px-5 py-4 text-sm leading-6 text-slate-500">{item.description}</td>
                <td className="px-5 py-4 text-center"><a href={item.url} target="_blank" rel="noreferrer" className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-primary transition hover:bg-primary hover:text-white" aria-label="Abrir documento"><Download size={18} /></a></td>
                <td className="px-5 py-4"><div className="flex justify-end gap-2"><Link to={`/${resourcePath}/${item._id}`} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:text-primary"><Pencil size={16} /> Editar</Link><button type="button" onClick={() => onDelete(item._id)} className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"><Trash2 size={16} /><span className="hidden xl:inline">Eliminar</span></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export default AdminDocumentList;
