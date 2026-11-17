import { useState } from 'react';
import { RefreshCw, Trash2, Upload } from 'lucide-react';
import { IMAGE_ACCEPT, MAX_IMAGE_MB, uploadErrorMessage, uploadImage, validateImageFile } from '../../editor/uploads';
import { ErrorText, ProgressBar } from '../../editor/editors/fields';
import { assetUrl } from '../../../utils/assetUrl';

/* Logo de una serie de eventos: se sube al elegirlo (POST /media) y se guarda con la serie */
const LogoField = ({ url, onChange, onBusyChange, label = 'Logo' }) => {
  const [upload, setUpload] = useState({ active: false, progress: 0, error: '' });

  const handleFile = async (file) => {
    if (!file) return;
    const problem = validateImageFile(file);
    if (problem) {
      setUpload({ active: false, progress: 0, error: problem });
      return;
    }
    setUpload({ active: true, progress: 0, error: '' });
    onBusyChange?.(true);
    try {
      const image = await uploadImage(file, (progress) => setUpload((current) => ({ ...current, progress })));
      onChange(image.url);
      setUpload({ active: false, progress: 0, error: '' });
    } catch (error) {
      setUpload({ active: false, progress: 0, error: uploadErrorMessage(error) });
    } finally {
      onBusyChange?.(false);
    }
  };

  const picker = (text, Icon) => (
    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition focus-within:ring-4 focus-within:ring-sky-100 hover:border-sky-200 hover:text-primary">
      <Icon size={14} aria-hidden="true" /> {text}
      <input
        type="file"
        accept={IMAGE_ACCEPT}
        className="sr-only"
        disabled={upload.active}
        aria-label={`${text} ${label.toLowerCase()}`}
        onChange={(event) => {
          handleFile(event.target.files[0]);
          event.target.value = '';
        }}
      />
    </label>
  );

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-1.5">
          {url ? <img src={assetUrl(url)} alt="Vista previa del logo" className="h-full w-full object-contain" /> : <span className="text-[0.7rem] text-slate-400">Sin logo</span>}
        </span>
        <div className="flex flex-wrap gap-2">
          {url ? picker('Cambiar', RefreshCw) : picker('Subir', Upload)}
          {url && (
            <button type="button" onClick={() => onChange('')} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50">
              <Trash2 size={14} aria-hidden="true" /> Quitar
            </button>
          )}
        </div>
      </div>
      <p className="text-[0.7rem] text-slate-400">Cuadrado y con fondo transparente o blanco. JPG, PNG o WebP, hasta {MAX_IMAGE_MB} MB. Sin logo se muestra la sigla sobre el color de la serie.</p>
      {upload.active && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-slate-600">Subiendo logo… {upload.progress}%</p>
          <ProgressBar percent={upload.progress} />
        </div>
      )}
      <ErrorText>{upload.error}</ErrorText>
    </div>
  );
};

export default LogoField;
