'use client'

import { useContext, useEffect, useState } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import MainLayout from '@/components/layout/MainLayout'
import Token from '@/components/common/Token'

export default function TokensPage() {
  const { colors, texts } = useContext(ConfigContext)
  const [filter, setFilter] = useState<'all' | 'available'>('all')
  const tokensPage = texts?.['tokensPage']

  const tokensList = [
    { id: 1, name: 'TOKEN TBIO', subtitle: 'Fazenda Eliane Mato Grosso', price: '15', launchDate: 'July 31, 2024', tokensAvailable: '1019820.10', identifierCode: 'TBIO', image: 'icons/bloxify/man-similing.png', sold: 516820, total: 1000000, labels: [{ name: 'CPR' }, { name: 'CARBONO' }, { name: 'VERDE' }] },
    { id: 2, name: 'TOKEN TBIO', subtitle: 'Fazenda Eliane Mato Grosso', price: '15', launchDate: 'July 31, 2024', tokensAvailable: '1019820.00', identifierCode: 'TBIO', image: 'icons/bloxify/man-similing.png', sold: 516820, total: 1000000, labels: [{ name: 'CPR' }, { name: 'CARBONO' }, { name: 'VERDE' }] },
    { id: 3, name: 'TOKEN TBIO', subtitle: 'Fazenda Eliane Mato Grosso', price: '15', launchDate: 'July 31, 2024', tokensAvailable: '1019820.00', identifierCode: 'TBIO', image: 'icons/bloxify/man-similing.png', sold: 1000000, total: 1000000, labels: [{ name: 'CPR' }, { name: 'CARBONO' }, { name: 'VERDE' }] },
  ]

  const filteredTokens =
    filter === 'available'
      ? tokensList.filter((t: any) => t.total - t.sold > 0)
      : tokensList

  // nº de colunas atuais (para placeholders)
  const [cols, setCols] = useState(1)
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth
      if (w >= 1536) setCols(4)      // 2xl → 4 col
      else if (w >= 1280) setCols(3) // xl  → 3 col  (1440px cai aqui)
      else if (w >= 640)  setCols(2) // sm  → 2 col
      else                setCols(1) // base → 1 col
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])

  const tokensToShow = filteredTokens
  const placeholdersCount = tokensToShow.length < cols ? cols - tokensToShow.length : 0

  return (
    <MainLayout>
      <main
        className="min-h-screen py-16"
        style={{ backgroundColor: colors?.background['background-primary'] }}
      >
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4"
            style={{ color: colors?.colors['color-primary'] }}
          >
            {tokensPage?.title}
          </h1>
          <p
            className="text-xl sm:text-2xl lg:text-3xl px-0 lg:px-24"
            style={{ color: colors?.colors['color-secondary'] }}
          >
            {tokensPage?.subtitle}
          </p>
        </div>

        <div className="flex justify-start gap-4 mb-8 ">
          <button
            onClick={() => setFilter('all')}
            className="px-4 py-2 rounded-lg cursor-pointer shadow-md"
            style={{
              backgroundColor:
                filter === 'all' ? colors?.colors['color-primary'] : 'white',
              color:
                filter === 'all' ? '#FFFFFF' : colors?.colors['color-primary'],
            }}
          >
            {tokensPage?.filters?.all}
          </button>
          <button
            onClick={() => setFilter('available')}
            className="px-4 py-2 rounded-lg cursor-pointer shadow-md"
            style={{
              backgroundColor:
                filter === 'available'
                  ? colors?.colors['color-primary']
                  : 'white',
              color:
                filter === 'available'
                  ? '#FFFFFF'
                  : colors?.colors['color-primary'],
            }}
          >
            {tokensPage?.filters?.available}
          </button>
        </div>

        {/* 1 col (mobile), 2 (tablet), 3 (desktop ≥1280), 4 (superwide ≥1536) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
          {tokensToShow.map((token: any) => (
            <div key={token.id} className="h-full">
              <Token
                name={token.name}
                subtitle={token.subtitle}
                price={token.price}
                launchDate={token.launchDate}
                tokensAvailable={token.tokensAvailable}
                identifierCode={token.identifierCode}
                image={token.image}
                labels={token.labels}
                sold={token.sold}
                total={token.total}
              />
            </div>
          ))}

          {placeholdersCount > 0 &&
            Array.from({ length: placeholdersCount }).map((_, idx) => (
              <div key={`placeholder-${idx}`} className="h-full">
                <div
                  className="rounded-xl shadow-lg border h-full flex flex-col items-center justify-center p-6 transition-all duration-300"
                  style={{
                    backgroundColor: colors?.token['background'],
                    borderColor: colors?.token['border'],
                    borderWidth: '1px',
                  }}
                >
                  <p className="text-lg font-medium text-gray-500 text-center">
                    {tokensPage?.newTokens}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </main>
    </MainLayout>
  )
}
