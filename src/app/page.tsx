import Header from '@/components/landingPage/Header'
import Hero from '@/components/landingPage/Hero'
import TokenizationSteps from '@/components/landingPage/TokenizationSteps'

export default function Home() {
  return (
    <div>
      <Header />
      <main>
        <Hero />
        <TokenizationSteps />
      </main>
    </div>
  )
}
