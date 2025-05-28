import { ConfigContext } from '@/contexts/ConfigContext'
import { useContext } from 'react'
import ButtonFeature from './ButtonFeature'
import ImageFromJSON from '../../core/ImageFromJSON'

interface CheckoutFeatureProps {
  index: number
}

const CheckoutFeature = ({ index }: CheckoutFeatureProps) => {
  const { colors, texts } = useContext(ConfigContext)
  const textSingInFeature =
    texts?.['landing-page']['features-showcase'].features[index]

  return (
    <div className="flex flex-col items-center p-6 pt-6 pb-4 gap-10">
      <div className="flex flex-col gap-8">
        <h4
          className="font-semibold p-4 text-2xl"
          style={{ color: colors?.colors['color-quaternary'] }}
        >
          {textSingInFeature?.attributes?.title}
        </h4>
        <div className="flex flex-col gap-4">
          <ButtonFeature
            text={textSingInFeature?.attributes?.['text-pix']}
            className="p-4"
          />
          <ButtonFeature
            text={textSingInFeature?.attributes?.['text-credit-card']}
            className="p-4"
          />
        </div>
      </div>

      <div className="flex justify-between gap-12 items-center">
        <div className="w-3/6">
          <ImageFromJSON
            alt={textSingInFeature?.attributes?.['alt-pix']}
            src={textSingInFeature?.attributes?.['image-pix']}
          />
        </div>
        <div className="w-3/6">
          <ImageFromJSON
            alt={textSingInFeature?.attributes?.['alt-credit-card']}
            src={textSingInFeature?.attributes?.['image-credit-card']}
          />
        </div>
      </div>
    </div>
  )
}

export default CheckoutFeature
