'use client'

import ImageFromJSON from '@/components/core/ImageFromJSON'
import { ConfigContext } from '@/contexts/ConfigContext'
import { useContext } from 'react'

interface SingInFeatureProps {
  index: number
}

function SingInFeature({ index }: SingInFeatureProps) {
  const { colors, texts } = useContext(ConfigContext)
  const textSingInFeature =
    texts?.['landing-page']['features-showcase'].features[index]

  return (
    <div className="flex flex-col items-center p-10 gap-16 mt-4">
      <div className="flex flex-col items-center gap-4">
        <h4
          className="font-semibold text-2xl"
          style={{ color: colors?.colors['color-quaternary'] }}
        >
          {textSingInFeature?.attributes?.title}
        </h4>
        <div className="w-52">
          <ImageFromJSON
            src={textSingInFeature?.attributes?.image!}
            alt={textSingInFeature?.attributes?.alt!}
          />
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 w-full">
        <span
          className="font-semibold text-2xl"
          style={{ color: colors?.colors['color-quaternary'] }}
        >
          {textSingInFeature?.attributes?.span}
        </span>
        <div
          className="p-2 rounded-md w-full text-center"
          style={{
            backgroundColor: colors?.background['background-quintenary'],
            color: colors?.colors['color-quintenary'],
          }}
        >
          <span className="font-semibold cursor-default">
            {textSingInFeature?.attributes?.email}
          </span>
        </div>
        <div
          className="p-2 rounded-md w-full text-center"
          style={{
            backgroundColor: colors?.background['background-quintenary'],
            color: colors?.colors['color-quintenary'],
          }}
        >
          <span className="font-semibold cursor-default">
            {textSingInFeature?.attributes?.['continue-email']}
          </span>
        </div>
      </div>
    </div>
  )
}

export default SingInFeature
