'use client'

import { useContext, useState } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import { hexToRgba } from '@/utils/hexToRgb'

interface FaqItem {
  id: number
  question: string
  answer: string
}

interface FaqTabsProps {
  title?: string
  questions: FaqItem[]
}

export default function FaqTabs({ title, questions }: Readonly<FaqTabsProps>) {
  const { colors } = useContext(ConfigContext)
  const [activeItem, setActiveItem] = useState<number>(questions[0]?.id || 1)

  const toggleItem = (id: number) => {
    setActiveItem(id)
  }

  const activeQuestion = questions.find((q) => q.id === activeItem)

  return (
    <section
      className="py-20 px-4 mb-40"
      style={{
        backgroundColor: colors?.background['background-primary'],
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {title && (
          <div className="text-center mb-16">
            <h2
              className="text-4xl font-bold mb-4"
              style={{
                color: colors?.colors['color-primary'],
              }}
            >
              {title}
            </h2>
          </div>
        )}

        {/* FAQ Content - Layout Lateral */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Questions Sidebar */}
          <div className="flex flex-col gap-8">
            {questions.map((item) => {
              const isActive = activeItem === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`cursor-pointer w-full text-center p-4 rounded-lg transition-all duration-300 hover:shadow-md ${
                    isActive ? 'shadow-md' : 'hover:opacity-80'
                  }`}
                  style={{
                    backgroundImage: isActive
                      ? `linear-gradient(to right,
                        ${colors?.['colors-base']['color-primary']} 20%,
                        ${colors?.['colors-base']['color-secondary']} 100%,
                        ${colors?.['colors-base']['color-primary']} 100%,
                        ${hexToRgba(colors?.['colors-base']['color-primary'], 0.38)} 100%)`
                      : 'none',
                    backgroundColor: !isActive
                      ? (colors?.token.background ?? 'transparent')
                      : undefined,
                    boxShadow: `4px 4px 0px 2px ${colors?.['colors-base']['color-tertiary']}`,
                  }}
                >
                  <span
                    className="font-semibold text-xl"
                    style={{
                      color: colors?.colors['color-primary'],
                    }}
                  >
                    {item.question}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Answer Content */}
          <div className="lg:sticky lg:top-8">
            {activeQuestion && (
              <div
                className="p-8 rounded-lg shadow-sm"
                style={{
                  backgroundColor: colors?.token.background,
                  border: `1px solid ${colors?.token.border}`,
                }}
              >
                <h3
                  className="text-2xl font-bold mb-6"
                  style={{
                    color: colors?.colors['color-primary'],
                  }}
                >
                  {activeQuestion.question}
                </h3>
                <div
                  className="text-lg leading-relaxed"
                  style={{
                    color: colors?.colors['color-secondary'],
                  }}
                >
                  {activeQuestion.answer
                    .split('. ')
                    .map((sentence, index, arr) => (
                      <p
                        key={index}
                        className={index < arr.length - 1 ? 'mb-4' : ''}
                      >
                        {sentence}
                        {index < arr.length - 1 ? '.' : ''}
                      </p>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
