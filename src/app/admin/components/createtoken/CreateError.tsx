'use client'

import { useContext } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import CustomButton from '@/components/core/Buttons/CustomButton'
import { useRouter } from 'next/navigation'
import ImageFromJSON from '@/components/core/ImageFromJSON'
import Header from '@/components/landingPage/Header'
import Footer from '@/components/common/footer'

export default function CreateError() {
  const { colors, texts } = useContext(ConfigContext)
  const router = useRouter()

  const adminTexts = (texts as any)?.admin
  const getAdminText = (key: string, fallback: string) => {
    const keys = key.split('.')
    let value = adminTexts
    for (const k of keys) {
      value = value?.[k]
    }
    return value || fallback
  }

  const handleTentarNovamente = () => {
    // Volta para o último passo (step4) para tentar criar novamente
    router.push('/admin?page=createstep4')
  }

  const handleVoltar = () => {
    // Volta para o dashboard
    router.push('/admin?page=dashboard')
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-blue-50 py-8 px-4 flex items-center justify-center">
        <div className="max-w-4xl w-full mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-12 relative">
            {/* Mensagem de erro no topo direito */}
            <div className="absolute top-4 right-4">
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 shadow-sm"
                style={{
                  backgroundColor: '#FEF2F2',
                  borderColor: '#EF4444',
                }}
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {getAdminText(
                    'create-token.error.message',
                    'Erro ao criar o token',
                  )}
                </span>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-12">
              {/* Lado esquerdo - Ilustração */}
              <div className="flex-1 flex justify-center">
                <div className="relative w-96 h-96">
                  <ImageFromJSON
                    src="images/admin/token_error.png"
                    alt="Erro ao criar token"
                    width={384}
                    height={384}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Lado direito - Conteúdo */}
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-4xl font-bold text-black mb-8">
                  {getAdminText('create-token.error.title', 'Erro ao Criar Token')}
                </h1>

                <p className="text-gray-600 text-xl mb-12 leading-relaxed">
                  {getAdminText(
                    'create-token.error.description',
                    'Infelizmente ocorreu um erro ao criar seu token. Por favor, tente novamente mais tarde ou entre em contato com o suporte se o problema persistir.',
                  )}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <CustomButton
                    text={getAdminText(
                      'create-token.error.back-button',
                      'Voltar ao Dashboard',
                    )}
                    onClick={handleVoltar}
                    className="px-8 py-3 text-base font-medium rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 bg-white border-2"
                    borderColor={colors?.border['border-primary']}
                    color="white"
                    textColor={colors?.border['border-primary']}
                  />

                  <CustomButton
                    text={getAdminText(
                      'create-token.error.retry-button',
                      'Tentar Novamente',
                    )}
                    onClick={handleTentarNovamente}
                    className="px-8 py-3 text-base font-medium rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                    color={colors?.buttons['button-primary']}
                    textColor="white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

