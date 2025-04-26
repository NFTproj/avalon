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
      className="w-full flex  justify-between md:py-6 py-4 md:px-28 px-4 md:gap-0 items-center border-b-3"
      style={{
        backgroundColor: colors?.header['header-primary'],
        borderColor: colors?.border['border-primary'],
      }}
    >
      <section className="flex gap-1 items-center justify-center">
        <button className="w-30 md:w-60" onClick={() => router.push('/')}>
          <ImageFromJSON
            src={texts?.images.logos['main-logo']}
            alt={textLandingPage?.header.alts['main-logo']}
            width={180}
            height={600}
          />
        </button>
        <nav
          className="flex gap-6 mt-1.5"
          style={{
            backgroundColor: colors?.background['background-primary'],
            borderColor: colors?.border['border-primary'],
            color: colors?.colors['color-primary'],
          }}
        >
          <details className="hidden md:block group">
            <summary className="flex items-center cursor-pointer">
              {navigations?.navOne}
              <svg
                className="w-4 h-4 ml-2 text-gray-600 transition-transform group-open:rotate-0 rotate-180"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 14l-6-6h12l-6 6z" />
              </svg>
            </summary>
          </details>
          <details className="hidden md:block group">
            <summary className="flex items-center cursor-pointer">
              {navigations?.navTwo}
              <svg
                className="w-4 h-4 ml-2 text-gray-600 transition-transform group-open:rotate-0 rotate-180"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 14l-6-6h12l-6 6z" />
              </svg>
            </summary>
          </details>
          <details className="hidden md:block group">
            <summary className="flex items-center cursor-pointer">
              {navigations?.navThree}
              <svg
                className="w-4 h-4 ml-2 text-gray-600 transition-transform group-open:rotate-0 rotate-180"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 14l-6-6h12l-6 6z" />
              </svg>
            </summary>
          </details>
        </nav>
      </section>

      <section className="flex gap-4 items-center justify-center cursor-pointer">
        <button
          type="button"
          onClick={() => router.push('/register')}
          className="border rounded-xl px-12 p-4 text-sm leading-1 font-medium ml-auto"
          style={{
            backgroundColor: colors?.buttons['button-secondary'],
            borderColor: colors?.border['border-primary'],
            color: colors?.colors['color-primary'],
          }}
        >
          {texts?.['landing-page'].header.buttons.button}
        </button>
        <button
          type="button"
          onClick={() => router.push('/login')}
          className="text-sm leading-2 font-medium p-4 cursor-pointer"
          style={{  
            color: colors?.colors['color-primary'],
          }}
        >
          {texts?.['landing-page'].header.buttons.buttonLogin}
        </button>
      </section>
    </header>
  )
}

export default Header
