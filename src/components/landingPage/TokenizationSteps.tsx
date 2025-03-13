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
    <section className="bg-black text-white py-6 px-16 text-center">
      <div className="w-full flex flex-col items-center">
        <div
          className="w-1/4 h-1.5 rounded-2xl mt-20"
          style={{
            backgroundColor: colors?.border['border-primary'],
          }}
        ></div>
        <h2 className="text-5xl font-bold m-20">{textSteps?.title}</h2>
        <div className="flex justify-between gap-4 w-full">
          {steps.map((step) => (
            <section
              key={step.step}
              className="px-4 py-8 rounded-lg shadow-lg w-[30%] flex items-center justify-center"
              style={{
                backgroundColor: `rgba(${hexToRgb(colors?.background['background-secondary'])}, 0.05)`,
              }}
            >
              <div className="flex flex-col items-center gap-4 w-full mt-10">
                <div className="flex flex-col w-3/4 gap-8 items-center">
                  <div className="w-5/6">
                    <ImageFromJSON
                      src={step.icon}
                      alt={step.title}
                      width={100}
                      height={100}
                      className="w-full"
                    />
                  </div>

                  <div className="flex flex-col w-ful">
                    <span
                      className="ml-4 text-left"
                      style={{ color: colors?.border['border-primary'] }}
                    >
                      {step.step}
                    </span>
                    <h3 className="text-3xl font-semibold w-full text-center">
                      {step.title}
                    </h3>
                  </div>
                </div>

                <p className="text-xl">{step.description}</p>
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  )
}
