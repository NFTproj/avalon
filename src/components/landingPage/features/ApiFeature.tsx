'use client'

import ImageFromJSON from '@/components/core/ImageFromJSON'
import ButtonFeature from './ButtonFeature'
import { useContext } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'

interface ApiFeatureProps {
  index: number
}

function ApiFeature({ index }: Readonly<ApiFeatureProps>) {
  const { texts } = useContext(ConfigContext)

  const textSingInFeature =
    texts?.['landing-page']['features-showcase'].features[index]

  return (
    <div className="flex flex-col items-center p-6 pt-6 pb-4 gap-10">
      <ButtonFeature
        text={textSingInFeature?.attributes?.title}
        className="p-4 text-2xl"
      />

      <div className="flex flex-col gap-6">
        <div className="flex gap-6">
          {textSingInFeature?.attributes.languages?.map((language) => (
            <div key={language.image + language.alt} className="w-12">
              <ImageFromJSON src={language.image} alt={language.alt} />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-6">
          <div className="">
            <ImageFromJSON
              src={textSingInFeature?.attributes.image}
              alt={textSingInFeature?.attributes.alt}
              className="min-w-full"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApiFeature
