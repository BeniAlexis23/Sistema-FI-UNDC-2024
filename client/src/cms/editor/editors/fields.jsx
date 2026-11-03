/* Piezas de formulario compartidas por los editores de bloques */

export const fieldClass = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100';

export const Field = ({ label, hint, children }) => (
  <label className="block text-xs font-semibold text-slate-600">
    {label}
    <div className="mt-1.5">{children}</div>
    {hint && <span className="mt-1 block text-[0.7rem] font-normal text-slate-400">{hint}</span>}
  </label>
);

export const TextInput = ({ label, hint, value, onChange, maxLength, placeholder, type = 'text' }) => (
  <Field label={label} hint={hint}>
    <input type={type} value={value ?? ''} maxLength={maxLength} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className={fieldClass} />
  </Field>
);

/* Grupo de opciones excluyentes con aspecto de botones */
export const OptionGroup = ({ label, value, options, onChange }) => (
  <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        role="radio"
        aria-checked={value === option.value}
        onClick={() => onChange(option.value)}
        className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition ${value === option.value ? 'border-primary bg-sky-50 text-primary' : 'border-slate-200 text-slate-600 hover:border-sky-200'}`}
      >
        {option.icon}{option.label}
      </button>
    ))}
  </div>
);

export const ProgressBar = ({ percent }) => (
  <div className="h-2 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
  </div>
);

export const ErrorText = ({ children }) => (children ? <p role="alert" className="text-sm font-medium text-red-600">{children}</p> : null);
