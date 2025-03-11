'use client'

import { ConfigContext } from '@/contexts/ConfigContext'
import Image from 'next/image'
import { useContext } from 'react'
import ImageFromJSON from '../core/ImageFromJSON'

function Header() {
  const { colors, texts } = useContext(ConfigContext)
  const textLandingPage = texts?.['landing-page']
  const navigations = textLandingPage?.header.navigations

  return (
    <header
      className="w-full flex justify-between py-6 px-16"
      style={{ backgroundColor: colors?.['header-primary'] }}
    >
      <section className="flex gap-8 items-center justify-center">
        <div className="w-40">
          <ImageFromJSON
            src={texts?.images.logos['main-logo']}
            alt={textLandingPage?.header.alts['main-logo']}
            width={500}
            height={600}
          />
        </div>
        <nav className="flex gap-2 mt-1.5">
          <details>
            <summary>{navigations?.navOne}</summary>
          </details>
          <details>
            <summary>{navigations?.navTwo}</summary>
          </details>
          <details>
            <summary>{navigations?.navThree}</summary>
          </details>
        </nav>
      </section>

      <button type="button">
        {texts?.['landing-page'].header.buttons.button}
      </button>
    </header>
  )
}

export default Header
