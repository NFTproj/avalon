'use client'

import { useContext } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import Carousel from './Carousel'

export default function WelcomeBox() {
  const { colors, texts } = useContext(ConfigContext)
  const { user } = useAuth()

  const welcomeTexts = texts?.dashboard?.['welcome-box']
  const textColor = colors?.dashboard?.colors?.text ?? '#FFFFFF'
  const linkColor = colors?.dashboard?.colors?.highlight ?? '#00ffe1'
  const backgroundColor =
    colors?.dashboard?.background?.['welcome-box'] ?? '#404040'

  // Usar nome real do usuário ou fallback
  const userName = user?.name || user?.email?.split('@')[0] || welcomeTexts?.name || 'Usuário'

  return (
    <div className="relative w-full mt-8 mb-18 flex justify-center items-center">
      <div
        className="
          relative z-10 flex flex-col lg:flex-row
          items-center lg:items-start justify-between
          w-full max-w-[1610px] rounded-2xl shadow-xl overflow-visible
          p-8 pb-9 gap-8
          lg:pr-[52%]
          text-center lg:text-left
        "
        style={{
          backgroundColor,
          color: textColor,
        }}
      >
        <div className="flex-1 min-w-[250px] z-20 w-full">
          <h1 className="text-2xl font-bold mb-2 break-words">
            {userName},
          </h1>
          <h2 className="text-xl font-semibold mb-4 break-words">
            {welcomeTexts?.title}
          </h2>
          <p
            className="text-base mb-6 whitespace-pre-line break-words lg:w-[400px] text-left"
            dangerouslySetInnerHTML={{
              __html: welcomeTexts?.description ?? '',
            }}
          />
          <Link
            href="#"
            className="text-sm font-semibold underline break-words"
            style={{ color: linkColor }}
          >
            {welcomeTexts?.link}
          </Link>
        </div>

        <Carousel />
      </div>
    </div>
  )
}
