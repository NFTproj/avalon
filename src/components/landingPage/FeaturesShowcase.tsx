'use client'

import { ConfigContext } from '@/contexts/ConfigContext'
import React, { useContext, useState } from 'react'
import { Accordion } from '../core/Accordion/Accordion'
import { cn } from '@/utils/cn'
import SingInFeature from './features/SingInFeature'
import AdminPainel from './features/AdminPainel'
import CheckoutFeature from './features/CheckoutFeature'
import KycFeature from './features/KycFeature'
import TokenizationFeature from './features/TokenizationFeature'
import WhiteLabelFeature from './features/WhiteLabelFeature'
import ApiFeature from './features/ApiFeature'

export default function FeaturesShowcase() {
  const { colors, texts } = useContext(ConfigContext)
  const showcase = texts?.['landing-page']['features-showcase']
  const features = showcase?.features ?? []
  const [selectedFeature, setSelectedFeature] = useState<number>(0)
  const colorBackgroundAccordion = colors?.background['background-tertiary'] + 'bf'

  // Array de componentes: cada posição corresponde a um componente específico
  const featureComponents = [
    <SingInFeature index={0} key="singin" />,
    <AdminPainel index={1} key="admin" />,
    <CheckoutFeature index={2} key="checkout" />,
    <KycFeature index={3} key="kyc" />,
    <TokenizationFeature index={4} key="tokenization" />,
    <ApiFeature index={5} key="api-feature" />,
    <WhiteLabelFeature index={6} key="white-label" />,
  ]

  const handleToggle = (isOpen: boolean, index: number) => {
    setSelectedFeature(isOpen ? index : 0)
  }

  return (
    <section className="w-full mb-60 justify-center items-center">
      <div className=" justify-center items-center w-full relative">
        <h2
          className="text-center text-2xl md:text-3xl font-bold mb-10 md:mb-20 text-center"
          style={{ color: colors?.colors['color-primary'] }}
        >
          {showcase?.title}
        </h2>

        <div className="w-full flex justify-center mx-auto items-center gap-20 rounded-xl sm:w-[90%]  md:w-[80%] lg:w-[70%] p-4"
          style={{
            background: `linear-gradient(to bottom, 
              ${colors?.background['background-quintenary']} 30%,
              ${colors?.background['background-tertiary']} 120%
            )`,
          }}
        >
          <div
            style={{ backgroundColor: colorBackgroundAccordion }}
            className="hidden md:block text-white p-4 md:p-6 pb-12 md:pb-24 rounded-md w-full md:w-[45%] lg:w-[45%] order-2 md:order-1 my-[-40px] h-[120%] relative"
          >
            <h3
              className="text-center text-lg md:text-xl font-semibold"
              style={{ color: colors?.colors['color-quaternary'] }}
            >
              {features[selectedFeature]?.subtitle}
            </h3>
            <div
              className="w-full h-full rounded-md overflow-y-auto"
              style={{
                maxHeight: 'calc(100vh - 200px)',
                minHeight: '500px'
              }}
            >
              {featureComponents[selectedFeature]}
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full md:w-[45%] lg:w-[45%] order-1 md:order-2">
            {features.map((feature, index) => (
              <Accordion
                key={feature.id}
                title={feature.title}
                isOpen={selectedFeature === index}
                onToggle={(isOpen: boolean) => handleToggle(isOpen, index)}
                titleClassName="font-semibold text-base md:text-lg"
                accordionClassName="rounded-md p-2"
                accordionStyle={{ backgroundColor: colorBackgroundAccordion }}
                contentStyle={{
                  backgroundColor: colorBackgroundAccordion,
                  color: colors?.colors['color-quaternary'],
                }}
                contentClassName="rounded-md p-2 pb-4 font-semibold text-sm md:text-base"
                emptyIcon={true}
              >
                {feature.description}
              </Accordion>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
