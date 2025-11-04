'use client'

import { useContext, useState, useEffect } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import CustomButton from '@/components/core/Buttons/CustomButton'
import CustomInput from '@/components/core/Inputs/CustomInput'
import { useRouter } from 'next/navigation'
import Header from '@/components/landingPage/Header'
import Footer from '@/components/common/footer'

export default function CreateStep1() {
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

  // Estados do formulário
  const [formData, setFormData] = useState({
    cardName: '',
    shortDescription: '',
    longDescription: ''
  })

  // Carregar dados salvos do localStorage ao montar o componente
  useEffect(() => {
    const savedData = localStorage.getItem('createToken_step1')
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        setFormData(prev => ({ ...prev, ...parsed }))
      } catch (error) {
        console.error('Erro ao carregar dados do step 1:', error)
      }
    }
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleBack = () => {
    router.push('/admin?page=criartokens')
  }

  const handleContinue = () => {
    // Aqui você pode adicionar validação se necessário
    console.log('Dados do formulário:', formData)
    // Salvar no localStorage
    localStorage.setItem('createToken_step1', JSON.stringify(formData))
    // Navegar para o próximo passo
    router.push('/admin?page=createstep2')
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-blue-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            
            {/* Indicador de progresso */}
            <p className="mb-2 text-sm" style={{ color: colors?.colors['color-secondary'] }}>
              Etapa{' '}
              <span style={{ color: colors?.colors['color-primary'], fontWeight: 'bold' }}>
                {getAdminText('create-token.step-one.counter.current', '01')}
              </span>{' '}
              {getAdminText('create-token.step-one.counter.total', 'de 04')}
            </p>

            {/* Título */}
            <h1 className="text-3xl font-bold mb-8" style={{ color: colors?.colors['color-primary'] }}>
              {getAdminText('create-token.step-one.title', 'Dados Principais')}
            </h1>

            {/* Formulário */}
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              {/* Nome do Card */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors?.colors['color-primary'] }}>
                  {getAdminText('create-token.step-one.fields.card-name.label', 'Nome do Card')}
                </label>
                <CustomInput
                  type="text"
                  value={formData.cardName}
                  onChange={(e) => handleInputChange('cardName', e.target.value)}
                  placeholder={getAdminText('create-token.step-one.fields.card-name.placeholder', 'Ex: Bloxify Token')}
                  className="w-full h-12 text-base border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Descrição Curta */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors?.colors['color-primary'] }}>
                  {getAdminText('create-token.step-one.fields.short-description.label', 'Descrição Curta')}
                </label>
                <CustomInput
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                  placeholder={getAdminText('create-token.step-one.fields.short-description.placeholder', 'Ex: Token utilitário da Bloxify')}
                  className="w-full h-12 text-base border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Descrição Longa */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors?.colors['color-primary'] }}>
                  {getAdminText('create-token.step-one.fields.long-description.label', 'Descrição Longa')}
                </label>
                <textarea
                  value={formData.longDescription}
                  onChange={(e) => handleInputChange('longDescription', e.target.value)}
                  placeholder={getAdminText('create-token.step-one.fields.long-description.placeholder', 'Adicione uma descrição detalhada do token')}
                  className="w-full h-32 p-3 text-base text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  style={{ color: '#111827' }} // Garantir que o texto seja visível
                />
              </div>

              {/* Botões */}
              <div className="flex gap-4 pt-6">
                <CustomButton
                  text={getAdminText('create-token.step-one.buttons.back', 'Voltar')}
                  onClick={handleBack}
                  className="flex-1 h-12 text-base font-medium rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 bg-white border-2"
                  borderColor={colors?.border['border-primary'] || '#08CEFF'}
                  color="white"
                  textColor={colors?.border['border-primary'] || '#08CEFF'}
                />
                
                <CustomButton
                  text={getAdminText('create-token.step-one.buttons.continue', 'Continuar')}
                  onClick={handleContinue}
                  className="flex-1 h-12 text-base font-medium rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                  color={colors?.buttons['button-primary'] || '#08CEFF'}
                  textColor="white"
                />
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
