'use client'

import { useContext } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import Token from '@/components/common/Token'

export default function TokenShowcase() {
  const { colors, texts } = useContext(ConfigContext)
  const tokens = texts?.['landing-page'].tokens ?? []

  return (
    <section
      className="py-20 px-4 md:px-8"
      style={{
        backgroundColor: colors?.background['background-primary'] ?? '#F2FCFF',
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Título da Seção */}
        <div className="text-center mb-16">
          <div
            className="w-32 h-1.5 rounded-full mx-auto mb-10"
            style={{
              backgroundColor: colors?.border['border-primary'] ?? '#08CEFF',
            }}
          />
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            style={{
              color: colors?.colors?.['color-primary'] ?? '#202020',
            }}
          >
            As melhores oportunidades de tokens para você
          </h2>
          <p
            className="text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed"
            style={{ color: colors?.colors?.['color-secondary'] ?? '#6b6f70' }}
          >
            Explore nossa seleção cuidadosamente curada de tokens de alta
            qualidade, oferecendo oportunidades únicas de investimento em ativos
            tokenizados.
          </p>
        </div>

        {/* Grid de Cards com Flexbox */}
        <div className="flex flex-wrap justify-center gap-8 lg:gap-10 mb-16">
          {tokens.map((token) => (
            <div
              key={token.id}
              className="w-full sm:w-[calc(50%-16px)] lg:w-[calc(33.333%-27px)] max-w-sm"
            >
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
        </div>
      </div>
    </section>
  )
}
