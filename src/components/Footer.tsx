import { useContext } from 'react';
import { ConfigContext } from '@/contexts/ConfigContext';

function Footer() {
  const { texts, colors } = useContext(ConfigContext);
  const footerTexts = texts?.footer;

  return (
    <footer
      className="flex flex-col items-center justify-between w-full px-4 py-6 md:flex-row"
      style={{
        backgroundColor: colors?.background?.['background-primary'] || '#fff',
        color: colors?.colors?.['color-primary'] || '#000',
      }}
    >
      <div className="flex flex-col items-start gap-2">
        <h3 className="font-bold">{footerTexts?.columns[3]?.title}</h3>
        <p>{footerTexts?.columns[3]?.items[0]}</p>
      </div>
      <div className="flex items-center gap-2">
        <span>{footerTexts?.developedBy?.text}</span>
        <img
          src="logos/bloxify/bloxify-logo.png"
          alt={footerTexts?.['alt-logo']}
          className="h-6"
        />
      </div>
    </footer>
  );
}

export default Footer;