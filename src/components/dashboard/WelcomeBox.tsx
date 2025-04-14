'use client'

import { useContext } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import Link from 'next/link'

export default function WelcomeBox() {
  const { colors, texts } = useContext(ConfigContext)

  const welcomeTexts = texts?.dashboard?.['welcome-box']
  const textColor = colors?.dashboard?.colors?.text ?? '#FFFFFF'
  const linkColor = colors?.dashboard?.colors?.highlight ?? '#00ffe1'
  const backgroundColor =
    colors?.dashboard?.background?.['welcome-box'] ?? '#404040'

  return (
    <div
      className="
        z-10 pt-8 pb-8 pr-8 pl-12 rounded-2xl
        w-full
        sm:pr-[320px]
        custom730:pr-0
        custom730:w-[clamp(280px,90%,500px)]
        custom730:px-4
        flex
      "
      style={{
        backgroundColor,
        color: textColor,
      }}
    >
      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-2">{welcomeTexts?.name},</h1>
        <h2 className="text-xl font-semibold mb-4">{welcomeTexts?.title}</h2>
        <div>
          <p
            className="text-base max-w-xl mb-6 whitespace-pre-line text-left"
            dangerouslySetInnerHTML={{
              __html: welcomeTexts?.description ?? '',
            }}
          />
        </div>
        <Link
          href="#"
          className="text-sm font-semibold underline"
          style={{ color: linkColor }}
        >
          {welcomeTexts?.link}
        </Link>
      </div>
      <div className="hidden sm:block">
        <div
          className="bg-white rounded-full w-48 h-48 flex flex-col items-center justify-center border-8"
          style={{ borderColor: `${linkColor}50` }}
        >
          <p className="text-[#404040] text-center font-medium">
            {welcomeTexts?.['tokens-title']}
          </p>
          {welcomeTexts?.tokens?.map((token, index) => (
            <p
              key={token + index}
              className="text-[#404040] text-center text-lg font-bold"
            >
              {token}
            </p>
          )) ?? (
            <>
              <p className="text-[#404040] text-center text-lg font-bold">
                #TBIO
              </p>
              <p className="text-[#404040] text-center text-lg font-bold">
                #TBIO2
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
