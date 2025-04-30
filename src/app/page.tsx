'use client';

import Footer from '@/components/commom/footer';
import FeaturesShowcase from '@/components/landingPage/FeaturesShowcase';
import FormsContact from '@/components/landingPage/FormsContact';
import Header from '@/components/landingPage/Header';
import Hero from '@/components/landingPage/Hero';
import TokenizationSteps from '@/components/landingPage/TokenizationSteps';
import { useContext } from 'react';
import { ConfigContext } from '@/contexts/ConfigContext';

export default function Home() {
  const { colors } = useContext(ConfigContext);

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
        <FeaturesShowcase />
        <FormsContact />
      </main>
      <Footer />
    </div>
  );
}
