const styles = {
  primary: 'bg-primary text-white shadow-[0_10px_25px_rgba(16,129,234,0.25)] hover:bg-secondary',
  outline: 'border-2 border-primary text-primary hover:bg-sky-50',
};

const SAFE_LINK = /^(?:https?:|mailto:)/i;

const ButtonBlock = ({ block }) => {
  if (!SAFE_LINK.test(block.url ?? '')) return null;
  const isMail = block.url.toLowerCase().startsWith('mailto:');

  return (
    <div className="flex justify-center">
      <a
        href={block.url}
        target={isMail ? undefined : '_blank'}
        rel="noopener noreferrer"
        className={`inline-flex items-center justify-center rounded-full px-7 py-3.5 text-base font-semibold transition hover:scale-[1.02] ${styles[block.style] ?? styles.primary}`}
      >
        {block.label}
      </a>
    </div>
  );
};

export default ButtonBlock;
