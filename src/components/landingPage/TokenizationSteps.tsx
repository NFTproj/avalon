'use client'

import { ConfigContext } from '@/contexts/ConfigContext'
import { useContext } from 'react'
import ImageFromJSON from '../core/ImageFromJSON'
import hexToRgb from '@/utils/hexToRgb'

export default function TokenizationSteps() {
  const { colors, texts } = useContext(ConfigContext)
  const textSteps = texts?.['landing-page']['tokenization-steps']
  const steps = textSteps?.steps ?? []

  return (
    <section className="bg-black text-white py-6 px-4 md:px-4 text-center">
      <div className="w-full flex flex-col items-center">
        <div
          className="w-1/2 md:w-1/4 h-1.5 rounded-2xl mt-10 md:mt-20"
          style={{
            backgroundColor: colors?.border['border-primary'],
          }}
        ></div>
        <h2 className="text-3xl md:text-5xl font-bold m-10 md:m-20">
          {textSteps?.title}
        </h2>
        <div className="flex flex-col gap-11 md:gap-0 md:flex-row md:justify-between lg:justify-evenly w-full mb-10 md:mb-20 items-center md:items-start">
          {steps.map((step) => (
            <section
              key={step.step}
              className="mx-0 md:mx-4 px-4 py-4 pt-12 rounded-lg shadow-lg w-[80%] md:w-[35%] lg:w-[25%] flex flex-col items-start justify-start"
              style={{
                backgroundColor: `rgba(${hexToRgb(colors?.background['background-secondary'])}, 0.05)`,
              }}
            >
              <div className="flex flex-col items-start gap-6 w-full p-4 sm:p-8">
                <div className="w-1/2 md:w-2/3 self-center">
                  <ImageFromJSON
                    src={step.icon}
                    alt={step.title}
                    width={100}
                    height={100}
                    className="w-full h-auto"
                  />
                </div>
                <div className="flex flex-col w-full gap-2 items-center">
                  <span
                    className="text-sm font-bold self-start"
                    style={{ color: colors?.border['border-primary'] }}
                  >
                    {step.step}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold w-full text-center">
                    {step.title}
                  </h3>
                </div>
                <p className="text-base sm:text-xl md:text-lg font-poppins text-center">
                  {step.description}
                </p>
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  )
}
