import { CircleCheck, Info, TriangleAlert } from 'lucide-react';
import RichTextEditor from '../RichTextEditor';
import { OptionGroup } from './fields';

const variants = [
  { value: 'info', label: 'Información', icon: <Info size={16} className="text-sky-600" /> },
  { value: 'success', label: 'Éxito', icon: <CircleCheck size={16} className="text-emerald-600" /> },
  { value: 'warning', label: 'Atención', icon: <TriangleAlert size={16} className="text-amber-600" /> },
];

const CalloutBlockEditor = ({ block, onChange, autoFocus }) => (
  <div className="space-y-3">
    <OptionGroup label="Tipo de aviso" value={block.variant} options={variants} onChange={(variant) => onChange((current) => ({ ...current, variant }))} />
    <RichTextEditor
      compact
      html={block.html}
      autoFocus={autoFocus}
      placeholder="Escribe el aviso…"
      label="Texto del aviso"
      onChange={(html) => onChange((current) => ({ ...current, html }))}
    />
  </div>
);

export default CalloutBlockEditor;
