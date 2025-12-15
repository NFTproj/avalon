'use client'

import { useContext } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import CustomButton from '@/components/core/Buttons/CustomButton'
import { useRouter } from 'next/navigation'
import ImageFromJSON from '@/components/core/ImageFromJSON'
import Header from '@/components/landingPage/Header'
import Footer from '@/components/common/footer'
import Button from '@/components/core/Buttons/Button'

export default function CriarTokensPage() {
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

  const handleVoltar = () => {
    router.push('/admin?page=dashboard')
  }

  const handleComecar = () => {
    router.push('/admin?page=createstep1')
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-blue-50 py-8 px-4 flex items-center justify-center">
        <div className="max-w-4xl w-full mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-12">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              {/* Lado esquerdo - Ilustração */}
              <div className="flex-1 flex justify-center">
                <div className="relative w-96 h-96">
                  <ImageFromJSON
                    src="images/admin/ilustrator_token 1.png"
                    alt="Ilustração de criação de token"
                    width={384}
                    height={384}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Lado direito - Conteúdo */}
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-4xl font-bold text-black mb-8">
                  {getAdminText('create-token.title', 'Criar Token')}
                </h1>

                <p className="text-gray-600 text-xl mb-12 leading-relaxed">
                  {getAdminText(
                    'create-token.description',
                    'Aqui você poderá criar um novo token para representar ativos ou direitos, facilitando a tokenização e a gestão dos mesmos.',
                  )}
                </p>

                <div className="flex flex-row gap-10 justify-center lg:justify-start">
                  <CustomButton
                    text={getAdminText('create-token.back-button', 'Voltar')}
                    onClick={handleVoltar}
                    className=" px-12 py-3 text-base font-medium rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 bg-white s- border-2"
                    borderColor={colors?.border['border-primary']}
                    color="white"
                    textColor={colors?.border['border-primary']}
                  />

                  <CustomButton
                    text={getAdminText('create-token.start-button', 'Começar')}
                    onClick={handleComecar}
                    className=" px-12 py-3 text-base font-medium rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
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
