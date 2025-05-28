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
  const colorBackgroundAccordion = colors?.background['background-tertiary']

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
    <section className="text-gray-800 pb-20 sm:pb-2 md:pb-80">
      <div className="mt-12 md:mt-24 w-full px-4 md:px-16">
        <h2
          className={`text-2xl md:text-3xl font-bold mb-10 md:mb-20 text-center`}
        >
          {showcase?.title}
        </h2>

        <div className="flex flex-col md:flex-row justify-between gap-8 lg:justify-evenly sm:gap-4">
          <div
            style={{ backgroundColor: colorBackgroundAccordion }}
            className="hidden md:block text-white p-4  md:p-6 pb-12 md:pb-24 rounded-md w-full md:w-[45%] lg:w-[35%] order-2 md:order-1"
          >
            <h3
              className="text-center text-lg md:text-xl font-semibold"
              style={{ color: colors?.colors['color-quaternary'] }}
            >
              {features[selectedFeature]?.subtitle}
            </h3>
            <div
              className="w-full h-full rounded-md"
              style={{
                backgroundColor: colors?.background['background-quaternary'],
              }}
            >
              {featureComponents[selectedFeature]}
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full md:w-[50%] lg:w-[40%] order-1 md:order-2">
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
