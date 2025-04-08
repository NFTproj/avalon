import Footer from '@/components/commom/footer'
import FeaturesShowcase from '@/components/landingPage/FeaturesShowcase'
import FormsContact from '@/components/landingPage/FormsContact'
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
        <FeaturesShowcase />
        <FormsContact />
      </main>
      <Footer />
    </div>
  )
}
