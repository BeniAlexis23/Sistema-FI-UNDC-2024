import { embedSrc, providerLabel } from '../video';

/* El iframe se arma aquí a partir de proveedor + identificador: nunca se inserta HTML guardado */
const VideoBlock = ({ block }) => {
  const src = embedSrc(block);
  if (!src) return null;

  const title = block.caption || `Video de ${providerLabel[block.provider]}`;

  return (
    <figure className="mx-auto max-w-4xl">
      <div className="aspect-video overflow-hidden rounded-2xl bg-slate-900 shadow-[0_18px_45px_rgba(15,23,42,0.18)]">
        <iframe
          src={src}
          title={title}
          loading="lazy"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          className="h-full w-full"
        />
      </div>
      {block.caption && <figcaption className="mt-3 text-center text-sm text-slate-500">{block.caption}</figcaption>}
    </figure>
  );
};

export default VideoBlock;
