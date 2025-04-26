'use client';

import { ConfigContext } from '@/contexts/ConfigContext';
import { useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageFromJSON from '../core/ImageFromJSON';
import { ChevronUp, Menu } from 'lucide-react';

function Header() {
  const { colors, texts } = useContext(ConfigContext);
  const router = useRouter();

  const textLandingPage = texts?.['landing-page'];
  const navigations = textLandingPage?.header.navigations;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header
      className="w-full grid grid-cols-3 items-center md:py-6 py-4 md:px-28 px-4 border-b-3"
      style={{
        backgroundColor: colors?.header['header-primary'],
        borderColor: colors?.border['border-primary'],
      }}
    >
      {/* Menu hambúrguer no lado esquerdo para telas menores que lg */}
      <div className="lg:hidden flex items-center">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-gray-600 focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>
        {isMenuOpen && (
          <div
            className="absolute top-16 left-0 w-64 bg-white shadow-lg z-50 p-4"
            style={{
              backgroundColor: colors?.background['background-primary'],
              color: colors?.colors['color-primary'],
            }}
          >
            <ul className="flex flex-col gap-4">
              <li className="cursor-pointer" onClick={() => router.push('/navOne')}>
                {navigations?.navOne}
              </li>
              <li className="cursor-pointer" onClick={() => router.push('/navTwo')}>
                {navigations?.navTwo}
              </li>
              <li className="cursor-pointer" onClick={() => router.push('/navThree')}>
                {navigations?.navThree}
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Logo e navegação ocupando colunas 1 e 2 */}
      <div className="col-span-2 flex items-center gap-8">
        <button onClick={() => router.push('/')}>
          <ImageFromJSON
            src={texts?.images.logos['main-logo']}
            alt={textLandingPage?.header.alts['main-logo']}
            width={120}
            height={40}
          />
        </button>
        <nav
          className="hidden lg:flex gap-6"
          style={{
            backgroundColor: colors?.background['background-primary'],
            borderColor: colors?.border['border-primary'],
            color: colors?.colors['color-primary'],
          }}
        >
          <details className="group">
            <summary className="flex items-center cursor-pointer">
              {navigations?.navOne}
              <ChevronUp
                className="w-4 h-4 ml-2 text-gray-600 transition-transform group-open:rotate-180"
                fill="currentColor"
              />
            </summary>
          </details>
          <details className="group">
            <summary className="flex items-center cursor-pointer">
              {navigations?.navTwo}
              <ChevronUp
                className="w-4 h-4 ml-2 text-gray-600 transition-transform group-open:rotate-180"
                fill="currentColor"
              />
            </summary>
          </details>
          <details className="group">
            <summary className="flex items-center cursor-pointer">
              {navigations?.navThree}
              <ChevronUp
                className="w-4 h-4 ml-2 text-gray-600 transition-transform group-open:rotate-180"
                fill="currentColor"
              />
            </summary>
          </details>
        </nav>
      </div>

      {/* Botões ocupando a coluna 3 */}
      <div className="flex justify-end items-center gap-4">
        <button
          type="button"
          onClick={() => router.push('/register')}
          className="border rounded-xl px-4 py-2 text-sm font-medium hidden lg:block"
          style={{
            backgroundColor: colors?.buttons['button-secondary'],
            borderColor: colors?.border['border-primary'],
            color: colors?.colors['color-primary'],
          }}
        >
          {texts?.['landing-page'].header.buttons.button}
        </button>
        <button
          type="button"
          onClick={() => router.push('/login')}
          className="text-sm font-medium hidden lg:block"
          style={{
            color: colors?.colors['color-primary'],
          }}
        >
          {texts?.['landing-page'].header.buttons.buttonLogin}
        </button>
      </div>
    </header>
  );
}

export default Header;
