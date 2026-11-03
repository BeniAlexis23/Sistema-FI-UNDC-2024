import { useState } from 'react';
import Lightbox from '../Lightbox';
import { assetUrl } from '../../utils/assetUrl';

const widths = { normal: 'max-w-3xl', wide: 'max-w-5xl', full: 'max-w-none' };

const ImageBlock = ({ block }) => {
  const [open, setOpen] = useState(false);

  return (
    <figure className={`mx-auto ${widths[block.width] ?? widths.normal}`}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ampliar imagen"
        className="block w-full overflow-hidden rounded-2xl bg-slate-100 shadow-[0_18px_45px_rgba(15,23,42,0.1)] outline-none focus-visible:ring-4 focus-visible:ring-sky-200"
      >
        <img
          src={assetUrl(block.url)}
          alt={block.alt || ''}
          loading="lazy"
          decoding="async"
          className="h-auto w-full object-cover"
        />
      </button>
      {block.caption && <figcaption className="mt-3 text-center text-sm text-slate-500">{block.caption}</figcaption>}
      {open && <Lightbox images={[block]} index={0} onIndexChange={() => {}} onClose={() => setOpen(false)} />}
    </figure>
  );
};

export default ImageBlock;
