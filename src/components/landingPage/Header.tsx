'use client'

import { ConfigContext } from '@/contexts/ConfigContext'
import { useContext } from 'react'
import { useRouter } from 'next/navigation'
import ImageFromJSON from '../core/ImageFromJSON'

function Header() {
  const { colors, texts } = useContext(ConfigContext)

  const router = useRouter()

  const textLandingPage = texts?.['landing-page']
  const navigations = textLandingPage?.header.navigations

  return (
    <header
      className="w-full flex  justify-between md:py-6 py-4 md:px-16 px-4 md:gap-0 items-center border-b-3"
      style={{
        backgroundColor: colors?.header['header-primary'],
        borderColor: colors?.border['border-primary'],
      }}
    >
      <section className="flex gap-8 items-center justify-center">
        <button className="w-30 md:w-60" onClick={() => router.push('/')}>
          <ImageFromJSON
            src={texts?.images.logos['main-logo']}
            alt={textLandingPage?.header.alts['main-logo']}
            width={500}
            height={600}
          />
        </button>
        <nav
          className="flex gap-2 mt-1.5"
          style={{
            backgroundColor: colors?.background['background-primary'],
            borderColor: colors?.border['border-primary'],
            color: colors?.colors['color-primary'],
          }}
        >
          <details className="hidden md:block">
            <summary>{navigations?.navOne}</summary>
          </details>
          <details className="hidden md:block">
            <summary>{navigations?.navTwo}</summary>
          </details>
          <details className="hidden md:block">
            <summary>{navigations?.navThree}</summary>
          </details>
        </nav>
      </section>

      <button
        type="button"
        onClick={() => router.push('/register')}
        className="border rounded-xl p-4 px-2 text-sm leading-1 font-medium"
        style={{
          backgroundColor: colors?.buttons['button-secondary'],
          borderColor: colors?.border['border-primary'],
          color: colors?.colors['color-primary'],
        }}
      >
        {texts?.['landing-page'].header.buttons.button}
      </button>
    </header>
  )
}

export default Header
