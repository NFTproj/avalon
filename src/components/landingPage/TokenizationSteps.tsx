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
        <div className="flex flex-col md:flex-row justify-between lg:justify-evenly w-full mb-10 md:mb-20">
          {steps.map((step) => (
            <section
              key={step.step}
              className="mx-0 md:mx-4 px-4 py-8 rounded-lg shadow-lg w-full md:w-[35%] lg:w-[25%] flex items-center justify-center"
              style={{
                backgroundColor: `rgba(${hexToRgb(colors?.background['background-secondary'])}, 0.05)`,
              }}
            >
              <div className="flex flex-col items-center gap-4 w-full mt-6 md:mt-10">
                <div className="flex flex-col w-full gap-4 md:gap-8 items-center">
                  <div className="w-1/2 md:w-3/5">
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
                      className="text-center md:text-left text-sm font-bold"
                      style={{ color: colors?.border['border-primary'] }}
                    >
                      {step.step}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-bold w-full text-center">
                      {step.title}
                    </h3>
                  </div>
                </div>

                <p className="text-base md:text-lg font-poppins text-center">
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
