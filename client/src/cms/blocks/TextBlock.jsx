import SafeHtml from '../SafeHtml';

const TextBlock = ({ block }) => (
  <div className="mx-auto max-w-3xl">
    <SafeHtml
      html={block.html}
      className="prose prose-lg prose-slate max-w-none prose-headings:font-extrabold prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-blockquote:border-primary"
    />
  </div>
);

export default TextBlock;
