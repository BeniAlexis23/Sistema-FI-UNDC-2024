import { CircleCheck, Info, TriangleAlert } from 'lucide-react';
import SafeHtml from '../SafeHtml';

const variants = {
  info: { icon: Info, box: 'border-sky-200 bg-sky-50', accent: 'text-sky-600' },
  success: { icon: CircleCheck, box: 'border-emerald-200 bg-emerald-50', accent: 'text-emerald-600' },
  warning: { icon: TriangleAlert, box: 'border-amber-200 bg-amber-50', accent: 'text-amber-600' },
};

const CalloutBlock = ({ block }) => {
  const { icon: Icon, box, accent } = variants[block.variant] ?? variants.info;

  return (
    <aside className={`mx-auto flex max-w-3xl gap-4 rounded-2xl border p-5 sm:p-6 ${box}`}>
      <Icon className={`mt-1 shrink-0 ${accent}`} size={22} aria-hidden="true" />
      <SafeHtml
        html={block.html}
        className="prose prose-slate max-w-none prose-p:my-2 prose-a:text-primary"
      />
    </aside>
  );
};

export default CalloutBlock;
