import VideoBlock from '../../blocks/VideoBlock';
import { parseVideoUrl, providerLabel } from '../../video';
import { TextInput } from './fields';

const VideoBlockEditor = ({ block, onChange }) => {
  const set = (changes) => onChange((current) => ({ ...current, ...changes }));
  const url = block.url ?? '';
  const parsed = parseVideoUrl(url);
  const unrecognized = url.trim() !== '' && !parsed;

  return (
    <div className="space-y-3">
      <TextInput
        label="Enlace del video"
        value={url}
        placeholder="https://www.youtube.com/watch?v=…"
        hint="Pega el enlace de YouTube, Vimeo o Facebook. Los enlaces cortos fb.watch no funcionan: abre el video en Facebook y copia la dirección."
        onChange={(next) => set({ url: next })}
      />
      {unrecognized && <p role="alert" className="text-sm font-medium text-red-600">No reconocemos este enlace. Debe ser un video de YouTube, Vimeo o Facebook.</p>}
      {parsed && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-emerald-700">Video de {providerLabel[parsed.provider]} reconocido</p>
          <div className="mx-auto max-w-xl">
            <VideoBlock block={{ ...parsed, caption: block.caption }} />
          </div>
          {parsed.provider === 'facebook' && <p className="text-xs text-slate-500">Facebook solo muestra videos públicos; si el video es privado no se verá en el portal.</p>}
        </div>
      )}
      <TextInput label="Pie del video (opcional)" value={block.caption} maxLength={300} onChange={(caption) => set({ caption })} />
    </div>
  );
};

export default VideoBlockEditor;
