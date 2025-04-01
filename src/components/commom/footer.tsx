'use client'

import { useContext } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import ImageFromJSON from '../core/ImageFromJSON'

export default function Footer() {
  const { colors, texts } = useContext(ConfigContext)
  const footerData = texts?.footer
  const columns = footerData?.columns || []

  return (
    <footer
      className="w-full px-16 py-12"
      style={{ backgroundColor: colors?.header['header-primary'] }}
    >
      <div className="max-w-[1455px] mx-auto grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* LOGO */}
        <div className="col-span-1">
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
        {columns.map((col, index) => (
          <div key={index} className="flex flex-col gap-2">
            <h4
              className="font-semibold text-lg"
              style={{ color: colors?.colors['color-secondary'] }}
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
    </footer>
  )
}
