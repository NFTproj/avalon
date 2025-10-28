'use client'

import { useContext } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/landingPage/Header'
import Footer from '@/components/common/footer'
import { ConfigContext } from '@/contexts/ConfigContext'

export default function UnderDevelopmentPage() {
  const { colors, texts } = useContext(ConfigContext)
  const router = useRouter()

  const pageBg = colors?.background?.['background-primary'] || '#f0fcff'
  const accentColor = colors?.colors?.['color-primary'] || '#19C3F0'
  const underDev = texts?.['under-development']

  return (
    <div className="min-h-dvh flex flex-col" style={{ backgroundColor: pageBg }}>
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Ícone de desenvolvimento */}
          <div className="mb-8">
            <div 
              className="w-24 h-24 mx-auto rounded-full flex items-center justify-center shadow-lg"
              style={{ backgroundColor: accentColor + '20', borderColor: accentColor }}
            >
              <svg 
                className="w-12 h-12" 
                style={{ color: accentColor }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                />
              </svg>
            </div>
          </div>

          {/* Título principal */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {underDev?.title || 'Funcionalidade em Desenvolvimento'}
          </h1>

          {/* Subtítulo */}
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            {underDev?.subtitle || 'Estamos trabalhando duro para trazer esta funcionalidade para você!'}
          </p>

          {/* Descrição */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 mb-8" style={{ borderColor: accentColor + '30' }}>
            <div className="flex items-center justify-center mb-4">
              <svg 
                className="w-8 h-8 mr-3" 
                style={{ color: accentColor }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <h2 className="text-2xl font-semibold text-gray-900">
                {underDev?.['coming-soon'] || 'Em Breve!'}
              </h2>
            </div>
            
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              {underDev?.description || 'Nossa equipe está desenvolvendo esta funcionalidade com muito cuidado para oferecer a melhor experiência possível. Em breve você terá acesso a recursos incríveis!'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {underDev?.features?.['intuitive-interface'] || 'Interface Intuitiva'}
              </div>
              <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {underDev?.features?.['maximum-security'] || 'Segurança Máxima'}
              </div>
              <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {underDev?.features?.['optimized-performance'] || 'Performance Otimizada'}
              </div>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.back()}
              className="px-8 py-3 bg-white border-2 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 shadow-md"
              style={{ borderColor: accentColor }}
            >
              {underDev?.buttons?.['go-back'] || '← Voltar'}
            </button>
            
            <button
              onClick={() => router.push('/dashboard')}
              className="px-8 py-3 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-200 shadow-md"
              style={{ backgroundColor: accentColor }}
            >
              {underDev?.buttons?.['go-to-dashboard'] || 'Ir para Dashboard'}
            </button>
          </div>

          {/* Informação adicional */}
          <div className="mt-12 p-6 bg-gray-50 rounded-xl">
            <p className="text-gray-600 text-sm">
              <strong>{underDev?.tip?.title || 'Dica:'}</strong> {underDev?.tip?.message || 'Fique atento às atualizações! Notificaremos você assim que esta funcionalidade estiver disponível.'}
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}