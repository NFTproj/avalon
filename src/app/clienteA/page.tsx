'use client';

import texts from '@/data/clientA/locales/pt-BR.json'
import colors from '@/data/clientA/themes/light.json'
import LandingCliente from '@/components/landingPage/LandingCliente'

export default function ClienteA() {
  const config = { texts, colors }
  return <LandingCliente config={config} />
}
