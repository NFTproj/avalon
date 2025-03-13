'use client'

import { useContext } from 'react'
import ImageFromJSON from '../core/ImageFromJSON'
import { ConfigContext } from '@/contexts/ConfigContext'

function Hero() {
  const { colors, texts } = useContext(ConfigContext)
  const textHero = texts?.['landing-page'].hero

  return (
    <section className="flex justify-center mt-24 w-full px-16">
      <div className="flex flex-col gap-4 w-2/5 ">
        <div
          className="w-1/3 h-1 rounded-2xl"
          style={{
            backgroundColor: colors?.border['border-primary'],
          }}
        ></div>
        <h1
          className="text-7xl font-bold"
          style={{ color: colors?.colors['color-secondary'] }}
        >
          {texts?.['landing-page'].hero.title}
        </h1>
        <h3
          className="text-4xl w-[90%] font-normal"
          style={{
            color: colors?.colors['color-tertiary'],
            textShadow: '4px 4px 4px #00000040',
          }}
        >
          {texts?.['landing-page'].hero.subtitle}
        </h3>
      </div>
      <div>
        <div className="w-[600px]">
          <ImageFromJSON
            src={texts?.['landing-page'].hero.image}
            alt={textHero?.alt}
            width={500}
            height={600}
            className="w-full"
          />
        </div>
      </div>
    </section>
  )
}

export default Hero
