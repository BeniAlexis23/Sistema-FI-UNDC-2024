import SafeHtml from './SafeHtml';
import { looksLikeHtml } from './legacyToBlocks';
import TextBlock from './blocks/TextBlock';
import ImageBlock from './blocks/ImageBlock';
import GalleryBlock from './blocks/GalleryBlock';
import VideoBlock from './blocks/VideoBlock';
import CalloutBlock from './blocks/CalloutBlock';
import ButtonBlock from './blocks/ButtonBlock';
import DividerBlock from './blocks/DividerBlock';

const blockViews = {
  text: TextBlock,
  image: ImageBlock,
  gallery: GalleryBlock,
  video: VideoBlock,
  callout: CalloutBlock,
  button: ButtonBlock,
  divider: DividerBlock,
};

/* Noticias anteriores al editor por bloques: el cuerpo es el texto de `description` */
const LegacyBody = ({ text }) => {
  if (!text) return null;
  if (looksLikeHtml(text)) {
    return <SafeHtml html={text} className="prose prose-lg prose-slate mx-auto max-w-3xl prose-a:text-primary" />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 text-lg leading-8 text-slate-700">
      {text.split(/\n+/).filter((line) => line.trim()).map((line, index) => <p key={index}>{line}</p>)}
    </div>
  );
};

/* Renderiza el cuerpo de una noticia, tanto en el portal como en la vista previa del panel */
const NoticeContent = ({ notice }) => {
  const blocks = notice?.content ?? [];
  if (blocks.length === 0) return <LegacyBody text={notice?.description} />;

  return (
    <div className="space-y-8">
      {blocks.map((block) => {
        const View = blockViews[block.type];
        return View ? <View key={block.id} block={block} /> : null;
      })}
    </div>
  );
};

export default NoticeContent;
