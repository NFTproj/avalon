'use client'

import Footer from '@/components/common/footer'
import FeaturesShowcase from '@/components/landingPage/FeaturesShowcase'
import FaqTabs from '@/components/landingPage/FaqTabs'
import FormsContact from '@/components/landingPage/FormsContact'
import Header from '@/components/landingPage/Header'
import Hero from '@/components/landingPage/Hero'
import TokenizationSteps from '@/components/landingPage/TokenizationSteps'
import TokensCarousel from '@/components/landingPage/TokensCarousel'
import { useContext } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'

export default function Home() {
  const { colors, isBloxify, texts } = useContext(ConfigContext)

  return (
    <div
      style={{
        backgroundColor: colors?.background['background-primary'],
      }}
    >
      <Header />
      <main>
        <Hero />
        <TokenizationSteps />
        {!isBloxify && (
          <>
            <TokensCarousel />
            <FaqTabs
              title={texts?.['landing-page']?.faq?.title}
              questions={texts?.['landing-page']?.faq?.questions || []}
            />
          </>
        )}
        {isBloxify && (
          <>
            <TokensCarousel />
            <FeaturesShowcase />
            <FormsContact />
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
