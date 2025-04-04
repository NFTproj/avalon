'use client';

import { useContext } from 'react';
import { ConfigContext } from '@/contexts/ConfigContext';

export default function WelcomeBox() {
  const { colors, texts } = useContext(ConfigContext);

  const welcomeTexts = texts?.['dashboard']?.['welcome-box'];
  const textColor = colors?.dashboard?.colors?.['text'] || '#FFFFFF';
  const linkColor = colors?.dashboard?.colors?.['link'] || '#08CEFF';
  const backgroundColor = colors?.dashboard?.background?.['welcome-box'] || '#353535';
  console.log('welcomeTexts:', welcomeTexts);

  //const testTitle = "Teste com<br/>quebra";

  const descriptionWithBreaks = welcomeTexts?.description?.replace(/\n/g, '<br/>') || '';

  return (
    <div
      className="
        z-10 pt-8 pb-8 pr-8 pl-12 rounded-2xl
        w-full
        sm:pr-[320px]
        custom730:pr-0
        custom730:w-[clamp(280px,90%,500px)]
        custom730:px-4
      "
      style={{
        height: 'clamp(200px, 30vw, 492px)',
        backgroundColor,
        color: textColor,
      }}
    >
      <div className="ml-8 mt-10">
        <h1 className="text-4xl font-bold mb-2">{welcomeTexts?.name || 'Usuário,'}</h1>
        <h2
          className="text-2xl font-semibold mb-4"
          dangerouslySetInnerHTML={{ __html: welcomeTexts?.title || 'Bem-vindo(a)!' }}
        />
        {/* Limita o parágrafo sem centralizá-lo */}
        <div >
        <p
            className="text-base max-w-xl mb-6 whitespace-pre-line text-left"
            dangerouslySetInnerHTML={{ __html: descriptionWithBreaks }}
        />
        </div>
        <a
          href="#"
          className="text-sm font-semibold underline"
          style={{ color: linkColor }}
        >
          {welcomeTexts?.link || 'Ver detalhes'}
        </a>
      </div>
    </div>
  );
}
