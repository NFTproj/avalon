'use client';

import { ConfigContext } from '@/contexts/ConfigContext';
import { useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageFromJSON from '../core/ImageFromJSON';
import { Menu, X, ChevronDown, ChevronRight } from 'lucide-react';

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
          onClick={() => setIsMenuOpen(true)}
          className="text-gray-600 focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Modal de menu toggle */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex flex-col justify-between"
          style={{
            backgroundColor: colors?.background['background-primary'],
            color: colors?.colors['color-primary'],
          }}
        >

          {/* Logo centralizada */}
          <div className="flex justify-center p-4">
            <button onClick={() => router.push('/')}>
              <ImageFromJSON
                src={texts?.images.logos['main-logo']}
                alt={textLandingPage?.header.alts['main-logo']}
                width={120}
                height={40}
              />
            </button>
          </div>

          {/* Botão de fechar */}
          <button
            onClick={() => setIsMenuOpen(false)}
            className="absolute top-4 right-4 text-white"
          > 
            <X className="w-6 h-6 bg-gray-400" />
          </button>
          {/* Navegação no menu */}
          <nav className="flex flex-col items-center gap-4 mt-16 w-full">
            <details className="group w-full">
              <summary className="flex items-center justify-center cursor-pointer px-4 py-2">
                <span className="flex items-center">
                  <ChevronRight className="w-4 h-4 mr-2 transition-transform duration-200 group-open:rotate-90" />
                  {navigations?.navOne}
                </span>
              </summary>
            </details>
            <details className="group w-full">
              <summary className="flex items-center justify-center cursor-pointer px-4 py-2">
                <span className="flex items-center">
                  <ChevronRight className="w-4 h-4 mr-2 transition-transform duration-200 group-open:rotate-90" />
                  {navigations?.navTwo[0].title}
                </span>
              </summary>
              <ul className="flex flex-col p-2 space-y-2 w-full justify-center items-center ml-7">
                <li className="flex items-center gap-2 hover:bg-gray-200 px-2 py-1 rounded">             
                  {navigations?.navTwo[0].items[0].title}
                </li>
              </ul>
            </details>
            <details className="group w-full">
              <summary className="flex items-center justify-center cursor-pointer px-4 py-2 mr-5">
                <span className="flex items-center">
                  <ChevronRight className="w-4 h-4 mr-2 transition-transform duration-200 group-open:rotate-90" />
                  {navigations?.navThree[0].title}
                </span>
              </summary>
              <ul className="flex flex-col p-2 space-y-2 w-full justify-center items-center ml-6">
                <li className="flex items-center gap-2 hover:bg-gray-200 px-2 py-1 rounded">  
                  <ImageFromJSON
                    src={navigations?.navThree[0].items[0].image}
                    alt={navigations?.navThree[0].items[0].alt}
                    width={20}
                    height={20}
                    className="w-4 h-4 rounded-full"
                  />
                  {navigations?.navThree[0].items[0].title}
                </li>
                <li className="flex items-start gap-2 mr-[32px] hover:bg-gray-200 px-2 py-1 rounded"> 
                  <ImageFromJSON
                    src={navigations?.navThree[0].items[1].image}
                    alt={navigations?.navThree[0].items[1].alt}
                    width={20}
                    height={20}
                    className="w-4 h-4 rounded-full"
                  />
                  {navigations?.navThree[0].items[1].title}
                </li>
              </ul>
            </details>
          </nav>

          {/* Botões na parte inferior */}
          <div className="flex flex-col items-center gap-4 p-4">
            <button
              type="button"
              onClick={() => {
                router.push('/register');
                setIsMenuOpen(false);
              }}
              className="w-full bg-blue-500 text-white py-2 rounded-lg"
            >
              {texts?.['landing-page'].header.buttons.button}
            </button>
            <button
              type="button"
              onClick={() => {
                router.push('/login');
                setIsMenuOpen(false);
              }}
              className="w-full text-blue-500 py-2 rounded-lg border border-blue-500"
            >
              {texts?.['landing-page'].header.buttons.buttonLogin}
            </button>
          </div>
        </div>
      )}

      {/* Logo e navegação ocupando colunas 1 e 2 */}
      <div className="col-span-2 flex items-center gap-10">
        <button onClick={() => router.push('/')}>
          <ImageFromJSON
            src={texts?.images.logos['main-logo']}
            alt={textLandingPage?.header.alts['main-logo']}
            width={120}
            height={40}
          />
        </button>
        <nav
          className="hidden lg:flex gap-8"
          style={{
            backgroundColor: colors?.background['background-primary'],
            borderColor: colors?.border['border-primary'],
            color: colors?.colors['color-primary'],
          }}
        >
          <details className="group">
            <summary className="flex items-center cursor-pointer">
              <a href="#hero">{navigations?.navOne}</a>
              <ChevronDown className="w-4 h-4 ml-2 transition-transform duration-200 group-open:rotate-180" />
            </summary>
          </details>
          <details className="group">
            <summary className="flex items-center cursor-pointer">
              {navigations?.navTwo[0].title}
              <ChevronDown className="w-4 h-4 ml-2 transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <div className="absolute mt-8 w-30 bg-white-100 shadow-md z-50 rounded-b-lg">
                <ul className="flex flex-col p-2 space-y-2">
                  <li className="flex items-center gap-2 hover:bg-gray-200 px-2 py-1 rounded">             
                    {navigations?.navTwo[0].items[0].title}
                  </li>
                </ul>
              </div>
          </details>
          <details className="group">
            <summary className="flex items-center cursor-pointer">
              {navigations?.navThree[0].title}
              <ChevronDown className="w-4 h-4 ml-2 transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <div className="absolute mt-8 w-30 bg-white-100 shadow-md z-50 rounded-b-lg">
              <ul className="flex flex-col p-2 space-y-2">
                <li className="flex items-center gap-2 hover:bg-gray-200 px-2 py-1 rounded">             
                  <ImageFromJSON
                    src={navigations?.navThree[0].items[0].image}
                    alt={navigations?.navThree[0].items[0].alt}
                    width={20}
                    height={20}
                    className="w-4 h-4 rounded-full"
                  /> 
                  {navigations?.navThree[0].items[0].title}
                </li>
                <li className="flex items-center gap-2 hover:bg-gray-200 px-2 py-1 rounded">
                  <ImageFromJSON
                    src={navigations?.navThree[0].items[1].image}
                    alt={navigations?.navThree[0].items[1].alt}
                    width={20}
                    height={20}
                    className="w-4 h-4 rounded-full"
                  />
                  {navigations?.navThree[0].items[1].title}
                </li>
              </ul>
            </div>
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
