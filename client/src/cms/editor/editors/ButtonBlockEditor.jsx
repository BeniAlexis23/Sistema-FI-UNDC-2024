import ButtonBlock from '../../blocks/ButtonBlock';
import { ErrorText, OptionGroup, TextInput } from './fields';

const styles = [
  { value: 'primary', label: 'Principal' },
  { value: 'outline', label: 'Contorno' },
];

const SAFE_LINK = /^(?:https?:\/\/|mailto:)\S+$/i;

const ButtonBlockEditor = ({ block, onChange }) => {
  const set = (changes) => onChange((current) => ({ ...current, ...changes }));
  const url = block.url.trim();
  const invalidUrl = url !== '' && !SAFE_LINK.test(url);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <TextInput label="Texto del botón" value={block.label} maxLength={60} placeholder="Inscríbete aquí" onChange={(label) => set({ label })} />
        <TextInput label="Enlace" value={block.url} placeholder="https://…" hint="También puede ser un correo: mailto:decanato@undc.edu.pe" onChange={(next) => set({ url: next })} />
      </div>
      <ErrorText>{invalidUrl && 'El enlace debe empezar con https://, http:// o mailto:.'}</ErrorText>
      <OptionGroup label="Estilo del botón" value={block.style} options={styles} onChange={(style) => set({ style })} />
      {block.label.trim() && !invalidUrl && url && (
        <div className="pointer-events-none rounded-xl bg-slate-50 p-4" aria-hidden="true">
          <ButtonBlock block={block} />
        </div>
      )}
    </div>
  );
};

export default ButtonBlockEditor;
