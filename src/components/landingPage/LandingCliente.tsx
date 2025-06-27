import { ConfigProvider, ConfigContext } from '@/contexts/ConfigContext'
import Header from './Header'
import Footer from '../common/footer'
import Hero from './Hero'
import { useContext } from 'react'
import TokenizationSteps from './TokenizationSteps'
import { ClientConfig } from '@/app/lib/config'

type LandingClienteProps = {
  config: ClientConfig | null
}

export default function LandingCliente({
  config,
}: Readonly<LandingClienteProps>) {
  return (
    <ConfigProvider config={config}>
      <Content />
    </ConfigProvider>
  )
}

function Content() {
  const { colors } = useContext(ConfigContext)

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
