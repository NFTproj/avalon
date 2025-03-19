'use client'

import { useContext } from 'react'
import ButtonFeature from './ButtonFeature'
import { ConfigContext } from '@/contexts/ConfigContext'
import ImageFromJSON from '@/components/core/ImageFromJSON'

interface TokenizationFeatureProps {
  index: number
}

function TokenizationFeature({ index }: TokenizationFeatureProps) {
  const { texts, colors } = useContext(ConfigContext)
  const textSingInFeature =
    texts?.['landing-page']['features-showcase'].features[index]

  return (
    <div className="flex flex-col items-center mt-4 p-6 pt-12 gap-14">
      <ButtonFeature
        text={textSingInFeature?.attributes?.title}
        className="p-4 text-2xl"
      />

      <div className="flex gap-8 items-center">
        <div className="w-1/3">
          <ImageFromJSON
            src={textSingInFeature?.attributes?.image}
            alt={textSingInFeature?.attributes?.alt}
          />
        </div>
        <div className="flex flex-col gap-6 w-3/5">
          {textSingInFeature?.attributes?.cryptos?.map((crypto) => (
            <div
              className="flex items-center gap-4 p-2 rounded-md"
              style={{
                backgroundColor: colors?.background['background-tertiary'],
              }}
              key={crypto.id}
            >
              <div className="w-1/4">
                <ImageFromJSON src={crypto.icon} alt={crypto.alt} />
              </div>
              <span>{crypto.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TokenizationFeature
