import { ConfigProvider } from '@/contexts/ConfigContext'
import Header from './Header'
import Footer from '../common/footer'
import Hero from './Hero'
import { useContext, useState } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import { ColorsConfig } from '@/app/lib/config'
import TokenizationSteps from './TokenizationSteps'

type LandingClienteProps = {
  config: {
    texts: any
    colors: any
  }
}

export default function LandingCliente({ config }: LandingClienteProps) {
  const [colors, setColors] = useState<ColorsConfig | null>(
    config?.colors || null,
  )
  return (
    <ConfigProvider config={config}>
      <Content />
    </ConfigProvider>
  )
}

function Content() {
  const { colors } = useContext(ConfigContext)
  console.log('colors do contexto:', colors)
  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: colors?.background?.['background-primary'] ?? '#fff',
      }}
    >
      <Header />
      <main>
        <Hero />
        <TokenizationSteps />
      </main>
      <Footer />
    </div>
  )
}
