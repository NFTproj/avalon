'use client'

import { useContext } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import Link from 'next/link'
import TokenCircle from './TokenCircle'

export default function WelcomeBox() {
  const { colors, texts } = useContext(ConfigContext)

  const welcomeTexts = texts?.dashboard?.['welcome-box']
  const textColor = colors?.dashboard?.colors?.text ?? '#FFFFFF'
  const linkColor = colors?.dashboard?.colors?.highlight ?? '#00ffe1'
  const backgroundColor = colors?.dashboard?.background?.['welcome-box'] ?? '#404040'

  return (
    <div className="relative w-full flex justify-center items-center px-4 py-8">
      <div
        className="
          relative z-10 flex flex-col lg:flex-row
          items-center lg:items-start justify-between
          w-full max-w-6xl rounded-2xl shadow-xl overflow-visible
          p-8 gap-8
          lg:pr-[52%]
          text-center lg:text-left
        "
        style={{
          backgroundColor,
          color: textColor,
        }}
      >
        <div className="flex-1 min-w-[250px] z-20 w-full">
          <h1 className="text-2xl font-bold mb-2 break-words">{welcomeTexts?.name},</h1>
          <h2 className="text-xl font-semibold mb-4 break-words">{welcomeTexts?.title}</h2>
          <p
            className="text-base mb-6 whitespace-pre-line break-words w-full"
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

        <div
          className="
            flex items-center justify-center
            w-full max-h-[650px] aspect-[4/3] mt-1 mx-auto
            bg-[#fdfcf7] rounded-2xl shadow-md z-10
            lg:absolute lg:right-6 lg:top-1/2 lg:-translate-y-1/2
            lg:w-1/2 lg:h-[120%] lg:aspect-auto lg:max-h-none lg:mt-0 lg:mx-0
            overflow-hidden
            p-2 sm:p-1
            
          "
          style={{ color: '#404040' }}
        >
          <div className="w-full h-full sm:w-[90%] sm:h-[90%] flex items-center justify-center">
            <TokenCircle 
              tokens={welcomeTexts?.tokens ?? []}
              show={true}
              toggleShow={() => {}}
            />
          </div>
        </div>

      </div>
    </div>
  )
}
