import { useState } from 'react';
import { RefreshCw, Trash2 } from 'lucide-react';
import ImageDropzone from './ImageDropzone';
import { IMAGE_ACCEPT, MAX_IMAGE_MB, uploadErrorMessage, uploadImage, validateImageFile } from './uploads';
import { assetUrl } from '../../utils/assetUrl';
import { ErrorText, ProgressBar, TextInput } from './editors/fields';

/* Imagen de portada: se sube al elegirla y se guarda con la noticia */
const CoverField = ({ url, alt, onUrlChange, onAltChange, onBusyChange }) => {
  const [upload, setUpload] = useState({ active: false, progress: 0, error: '' });

  const handleFiles = async ([file]) => {
    const problem = validateImageFile(file);
    if (problem) {
      setUpload({ active: false, progress: 0, error: problem });
      return;
    }
    setUpload({ active: true, progress: 0, error: '' });
    onBusyChange(true);
    try {
      const image = await uploadImage(file, (progress) => setUpload((current) => ({ ...current, progress })));
      onUrlChange(image.url);
      setUpload({ active: false, progress: 0, error: '' });
    } catch (error) {
      setUpload({ active: false, progress: 0, error: uploadErrorMessage(error) });
    } finally {
      onBusyChange(false);
    }
  };

  return (
    <div className="space-y-4">
      {url ? (
        <div className="grid gap-4 sm:grid-cols-[minmax(0,18rem)_1fr]">
          <div className="relative">
            <img src={assetUrl(url)} alt={alt || 'Vista previa de la portada'} className="aspect-video w-full rounded-xl bg-slate-100 object-cover" />
            <div className="absolute bottom-2 right-2 flex gap-2">
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow transition focus-within:ring-4 focus-within:ring-sky-100 hover:text-primary">
                <RefreshCw size={13} /> Cambiar
                <input
                  type="file"
                  accept={IMAGE_ACCEPT}
                  className="sr-only"
                  disabled={upload.active}
                  onChange={(event) => {
                    if (event.target.files[0]) handleFiles([event.target.files[0]]);
                    event.target.value = '';
                  }}
                />
              </label>
              <button type="button" onClick={() => { onUrlChange(''); onAltChange(''); }} className="inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-red-600 shadow transition hover:bg-red-50">
                <Trash2 size={13} /> Quitar
              </button>
            </div>
          </div>
          <TextInput label="Descripción de la portada" hint="La leen los lectores de pantalla y aparece si la imagen no carga." value={alt} maxLength={200} onChange={onAltChange} />
        </div>
      ) : (
        <ImageDropzone onFiles={handleFiles} disabled={upload.active} hint={`Mejor si es horizontal y mide al menos 1200 px de ancho. JPG, PNG o WebP, hasta ${MAX_IMAGE_MB} MB. La foto se optimiza sola al subirla.`} />
      )}

      {upload.active && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-slate-600">Subiendo portada… {upload.progress}%</p>
          <ProgressBar percent={upload.progress} />
        </div>
      )}
      <ErrorText>{upload.error}</ErrorText>
    </div>
  );
};

export default CoverField;
