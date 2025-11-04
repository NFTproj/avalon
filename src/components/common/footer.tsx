'use client';

import { useContext } from 'react';
import { ConfigContext } from '@/contexts/ConfigContext';
import ImageFromJSON from '../core/ImageFromJSON';

export default function Footer() {
  const { colors, texts } = useContext(ConfigContext);
  const footerData = texts?.footer;
  const columns = footerData?.columns || [];

  return (
    <footer
      className="w-full px-6 md:px-16 py-8 md:py-12"
      style={{ backgroundColor: colors?.header['header-primary'] }}
    >
      <div className="max-w-[1455px] mx-auto grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
        {/* LOGO */}
        <div className="col-span-1 flex justify-center md:justify-start mb-6 md:mb-0">
          <div className="w-40 md:w-48">
            <ImageFromJSON
              src={texts?.images?.logos?.['main-logo']}
              alt={footerData?.['alt-logo']}
              width={350}
              height={220}
            />
          </div>
        </div>

        {/* COLUNAS DE TEXTO */}
        <div className="col-span-1 md:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {columns.map((col, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 text-center md:text-left"
            >
              <h4
                className="font-semibold text-base md:text-lg"
                style={{ color: colors?.colors['color-primary'] }}
              >
                {col.title}
              </h4>
              {col.items.map((item: string, idx: number) => (
                <p
                  key={idx}
                  className="text-sm md:text-base"
                  style={{ color: colors?.colors['color-tertiary'] }}
                >
                  {item}
                </p>
              ))}
            </div>
          ))}
        </div>

        {/* DESENVOLVIDO POR */}
        <div className="col-span-1 flex flex-col items-center justify-center gap-4 border-t md:border-t-0 md:border-l border-gray-300 pt-4 md:pt-0 md:pl-4">
          <span
            className="text-xs md:text-sm font-bold"
            style={{ color: colors?.colors['color-tertiary'] }}
          >
            {footerData?.developedBy?.text}
          </span>
          <ImageFromJSON
            src={texts?.images?.logos?.['main-logo']}
            alt={footerData?.['alt-logo']}
            width={120}
            height={60}
            className="h-6 md:h-8"
          />
        </div>
      </div>
    </footer>
  );
}
