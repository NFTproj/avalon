'use client'

import ImageFromJSON from '@/components/core/ImageFromJSON'
import { ConfigContext } from '@/contexts/ConfigContext'
import { useContext } from 'react'

interface AdminPainelProps {
  index: number
}
function AdminPainel({ index }: Readonly<AdminPainelProps>) {
  const { colors, texts } = useContext(ConfigContext)

  const textSingInFeature =
    texts?.['landing-page']['features-showcase'].features[index]
  return (
    <div className="flex flex-col items-center p-6 pt-12 gap-12">
      <h4
        className="font-semibold text-xl text-center"
        style={{ color: colors?.colors['color-quaternary'] }}
      >
        {textSingInFeature?.attributes?.title}
      </h4>

      <div className="flex flex-col gap-6">
        {textSingInFeature?.attributes?.cryptos?.map((crypto) => (
          <div
            className="flex items-center gap-4 p-2 rounded-md"
            style={{
              backgroundColor: colors?.background['background-tertiary'],
            }}
            key={crypto.id}
          >
            <div className="w-1/6">
              <ImageFromJSON src={crypto.icon} alt={crypto.alt} />
            </div>
            <span>{crypto.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminPainel
