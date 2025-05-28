'use client'

import { useContext } from 'react'
import ButtonFeature from './ButtonFeature'
import { ConfigContext } from '@/contexts/ConfigContext'
import ImageFromJSON from '@/components/core/ImageFromJSON'

interface WhiteLabelFeatureProps {
  index: number
}

function WhiteLabelFeature({ index }: Readonly<WhiteLabelFeatureProps>) {
  const { texts } = useContext(ConfigContext)
  const textSingInFeature =
    texts?.['landing-page']['features-showcase'].features[index]

  return (
    <div className="flex flex-col items-center mt-4 p-6 pt-12 gap-14">
      <ButtonFeature
        text={textSingInFeature?.attributes?.title}
        className="p-4 text-2xl"
      />

      <div className="w-[60%]">
        <ImageFromJSON
          src={textSingInFeature?.attributes?.image}
          alt={textSingInFeature?.attributes?.alt}
        />
      </div>
    </div>
  )
}

export default WhiteLabelFeature
