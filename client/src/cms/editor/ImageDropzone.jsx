import { useId, useRef, useState } from 'react';
import { ImagePlus } from 'lucide-react';
import { IMAGE_ACCEPT, MAX_IMAGE_MB } from './uploads';

/* Zona para elegir o arrastrar imágenes; entrega los archivos tal como se eligieron */
const ImageDropzone = ({ onFiles, multiple = false, disabled = false, title, hint, compact = false }) => {
  const inputId = useId();
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (fileList) => {
    const files = [...fileList];
    if (files.length > 0 && !disabled) onFiles(multiple ? files : files.slice(0, 1));
  };

  return (
    <label
      htmlFor={inputId}
      onDragOver={(event) => { event.preventDefault(); if (!disabled) setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => { event.preventDefault(); setDragging(false); handleFiles(event.dataTransfer.files); }}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed text-center transition focus-within:ring-4 focus-within:ring-sky-100 ${compact ? 'gap-1 px-4 py-5' : 'gap-2 px-6 py-8'} ${dragging ? 'border-primary bg-sky-50' : 'border-slate-300 bg-slate-50 hover:border-sky-300 hover:bg-sky-50/50'} ${disabled ? 'pointer-events-none opacity-60' : ''}`}
    >
      <ImagePlus size={compact ? 22 : 28} className="text-primary" aria-hidden="true" />
      <span className="text-sm font-semibold text-slate-700">{title ?? (multiple ? 'Arrastra tus fotos aquí o haz clic para elegirlas' : 'Arrastra una imagen aquí o haz clic para elegirla')}</span>
      <span className="text-xs text-slate-500">{hint ?? `JPG, PNG o WebP, hasta ${MAX_IMAGE_MB} MB${multiple ? ' cada una' : ''}. Las fotos se optimizan solas al subirlas.`}</span>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        onChange={(event) => { handleFiles(event.target.files); event.target.value = ''; }}
      />
    </label>
  );
};

export default ImageDropzone;
