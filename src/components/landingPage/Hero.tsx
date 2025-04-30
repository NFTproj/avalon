'use client'

import { useContext } from 'react'
import ImageFromJSON from '../core/ImageFromJSON'
import { ConfigContext } from '@/contexts/ConfigContext'

function Hero() {
  const { colors, texts } = useContext(ConfigContext)
  const textHero = texts?.['landing-page'].hero

  return (
    <section className="flex flex-col md:flex-row justify-center items-end lg:items-start mt-12 md:mt-24 w-full px-4 md:px-8 gap-8 md:gap-0"   >
      <div className="flex flex-col gap-4 w-full md:w-2/5 text-center md:text-left">
        <div
          className="w-1/3 h-1 rounded-2xl mx-auto md:mx-0"
          style={{
            backgroundColor: colors?.border['border-primary'],
          }}
        ></div>
        <h1
          className="text-4xl md:text-6xl font-extrabold"
          style={{ color: colors?.colors['color-secondary'] }}
        >
          {texts?.['landing-page'].hero.title}
        </h1>
        <h3
          className="text-xl md:text-2xl w-full md:w-[90%] font-normal"
          style={{
            color: colors?.colors['color-tertiary'],
            textShadow: '4px 4px 4px #00000040',
          }}
        >
          {texts?.['landing-page'].hero.subtitle}
        </h3>
      </div>
      <div className="w-full md:w-auto">
        <div className="w-full lg:w-[600px] md:w-[400px]">
          <ImageFromJSON
            src={texts?.['landing-page'].hero.image}
            alt={textHero?.alt}
            width={500}
            height={600}
            className="w-full h-auto"
          />
        </div>
      </div>
    </section>
  )
}

export default Hero
