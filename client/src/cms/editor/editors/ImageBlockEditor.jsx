import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import ImageDropzone from '../ImageDropzone';
import { useEditorContext } from '../EditorContext';
import { IMAGE_ACCEPT, uploadErrorMessage, uploadImage, validateImageFile } from '../uploads';
import { assetUrl } from '../../../utils/assetUrl';
import { ErrorText, Field, OptionGroup, ProgressBar, TextInput } from './fields';

const widths = [
  { value: 'normal', label: 'Normal' },
  { value: 'wide', label: 'Ancha' },
  { value: 'full', label: 'Completa' },
];

const ImageBlockEditor = ({ block, onChange }) => {
  const { trackUpload } = useEditorContext();
  const [upload, setUpload] = useState({ active: false, progress: 0, error: '' });
  const set = (changes) => onChange((current) => ({ ...current, ...changes }));

  const handleFiles = async ([file]) => {
    const problem = validateImageFile(file);
    if (problem) {
      setUpload({ active: false, progress: 0, error: problem });
      return;
    }
    setUpload({ active: true, progress: 0, error: '' });
    try {
      const image = await trackUpload(uploadImage(file, (progress) => setUpload((current) => ({ ...current, progress }))));
      set({ url: image.url });
      setUpload({ active: false, progress: 0, error: '' });
    } catch (error) {
      setUpload({ active: false, progress: 0, error: uploadErrorMessage(error) });
    }
  };

  return (
    <div className="space-y-4">
      {block.url ? (
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative sm:w-64 sm:shrink-0">
            <img src={assetUrl(block.url)} alt={block.alt || 'Vista previa de la imagen'} className="h-44 w-full rounded-xl bg-slate-100 object-cover" />
            <label className="absolute bottom-2 right-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow transition focus-within:ring-4 focus-within:ring-sky-100 hover:text-primary">
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
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <TextInput label="Descripción de la imagen" hint="La leen los lectores de pantalla y aparece si la imagen no carga." value={block.alt} maxLength={200} onChange={(alt) => set({ alt })} />
            <TextInput label="Pie de foto (opcional)" value={block.caption} maxLength={300} onChange={(caption) => set({ caption })} />
          </div>
        </div>
      ) : (
        <ImageDropzone onFiles={handleFiles} disabled={upload.active} />
      )}

      {upload.active && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-slate-600">Subiendo imagen… {upload.progress}%</p>
          <ProgressBar percent={upload.progress} />
        </div>
      )}
      <ErrorText>{upload.error}</ErrorText>

      {block.url && (
        <Field label="Ancho en la noticia">
          <OptionGroup label="Ancho en la noticia" value={block.width} options={widths} onChange={(width) => set({ width })} />
        </Field>
      )}
    </div>
  );
};

export default ImageBlockEditor;
