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
      className="w-full px-16 py-12"
      style={{ backgroundColor: colors?.header['header-primary'] }}
    >
      <div className="max-w-[1455px] mx-auto grid grid-cols-1 md:grid-cols-5 xl:grid-cols-5 gap-8 items-center">
        {/* LOGO */}
        <div className="col-span-1 flex justify-center md:justify-start mb-4 md:mb-0">
          <div className="w-40">
            <ImageFromJSON
              src={texts?.images?.logos?.['main-logo']}
              alt={footerData?.['alt-logo']}
              width={300}
              height={200}
            />
          </div>
        </div>

        {/* COLUNAS DE TEXTO */}
        <div className="col-span-3 grid grid-cols-2 md:grid-cols-4 gap-8">
          {columns.map((col, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 text-center md:text-left"
            >
              <h4
                className="font-semibold text-lg"
                style={{ color: colors?.colors['color-primary'] }}
              >
                {col.title}
              </h4>
              {col.items.map((item: string, idx: number) => (
                <p
                  key={idx}
                  className="text-sm"
                  style={{ color: colors?.colors['color-tertiary'] }}
                >
                  {item}
                </p>
              ))}
            </div>
          ))}
        </div>

        {/* DESENVOLVIDO POR */}
        <div className="col-span-1 flex flex-col md:flex-row items-center justify-center md:justify-end gap-10 border-t md:border-t-0 md:border-l border-black pt-4 md:pt-0 md:pl-4 h-full">
          <span
            className="text-[10px] font-bold"
            style={{ color: colors?.colors['color-tertiary'] }}
          >
            {footerData?.developedBy?.text}
          </span>
          <ImageFromJSON
            src={texts?.images?.logos?.['main-logo']}
            alt={footerData?.developedBy?.logoAlt}
            width={100}
            height={50}
            className="h-6"
          />
        </div>
      </div>
    </footer>
  );
}
