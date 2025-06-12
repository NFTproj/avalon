'use client'

import { useContext, useState } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import MainLayout from '@/components/layout/MainLayout'
import Token from '@/components/common/Token'

export default function TokensPage() {
  const { colors } = useContext(ConfigContext)
  const [filter, setFilter] = useState<'all' | 'available'>('all')

  // Mock inline de lista de tokens
  const tokensList = [
    {
      id: 1,
      name: 'TOKEN TBIO',
      subtitle: 'Fazenda Eliane Mato Grosso',
      price: '15',
      launchDate: 'July 31, 2024',
      tokensAvailable: '1019820.10',
      identifierCode: 'TBIO',
      image: 'icons/bloxify/man-similing.png',
      sold: 516820,
      total: 1000000,
      labels: [{ name: 'CPR' }, { name: 'CARBONO' }, { name: 'VERDE' }],
    },
    {
      id: 2,
      name: 'TOKEN TBIO',
      subtitle: 'Fazenda Eliane Mato Grosso',
      price: '15',
      launchDate: 'July 31, 2024',
      tokensAvailable: '1019820.00',
      identifierCode: 'TBIO',
      image: 'icons/bloxify/man-similing.png',
      sold: 516820,
      total: 1000000,
      labels: [{ name: 'CPR' }, { name: 'CARBONO' }, { name: 'VERDE' }],
    },
    {
      id: 3,
      name: 'TOKEN TBIO',
      subtitle: 'Fazenda Eliane Mato Grosso',
      price: '15',
      launchDate: 'July 31, 2024',
      tokensAvailable: '1019820.00',
      identifierCode: 'TBIO',
      image: 'icons/bloxify/man-similing.png',
      sold: 1000000,
      total: 1000000,
      labels: [{ name: 'CPR' }, { name: 'CARBONO' }, { name: 'VERDE' }],
    },
  ]

  // Mock inline de textos da página
  const pageTexts = {
    title: 'Descubra hoje as melhores oportunidades de tokens digitais',
    subtitle:
      'Os tokens que você já conhece, as melhores oportunidades, na palma da sua mão!',
    filters: { all: 'Todos', available: 'Disponíveis' },
    viewDetails: 'Ver detalhes',
  }

  const filteredTokens =
    filter === 'available'
      ? tokensList.filter((token: any) => token.total - token.sold > 0)
      : tokensList

  // Exibir todos os tokens e completar apenas a primeira linha com placeholders, se necessário
  const tokensToShow = filteredTokens
  const placeholdersCount =
    tokensToShow.length < 4 ? 4 - tokensToShow.length : 0

  return (
    <MainLayout>
      <main
        className="min-h-screen py-16"
        style={{ backgroundColor: colors?.background['background-primary'] }}
      >
        <div className="max-w-5xl mx-auto text-center mb-12">
          <h1
            className="text-6xl font-bold mb-4"
            style={{ color: colors?.colors['color-primary'] }}
          >
            {pageTexts.title}
          </h1>
          <p
            className="text-3xl px-24"
            style={{ color: colors?.colors['color-secondary'] }}
          >
            {pageTexts.subtitle}
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
            {pageTexts.filters.all}
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
            {pageTexts.filters.available}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
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
                    Novos tokens em breve
                  </p>
                </div>
              </div>
            ))}
        </div>
      </main>
    </MainLayout>
  )
}
