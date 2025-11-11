'use client'

import { useContext, useState, useEffect } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import CustomButton from '@/components/core/Buttons/CustomButton'
import CustomInput from '@/components/core/Inputs/CustomInput'
import { useRouter } from 'next/navigation'
import Header from '@/components/landingPage/Header'
import Footer from '@/components/common/footer'

export default function CreateStep2() {
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
    ticker: '',
    initialQuantity: '',
    tags: [] as string[],
    twitter: '',
    discord: '',
    officialWebsite: ''
  })

  const [tagInput, setTagInput] = useState('')

  // Carregar dados salvos do localStorage ao montar o componente
  useEffect(() => {
    const savedData = localStorage.getItem('createToken_step2')
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        setFormData(prev => ({ ...prev, ...parsed }))
      } catch (error) {
      }
    }
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }))
  }

  const handleBack = () => {
    router.push('/admin?page=createstep1')
  }

  const handleContinue = () => {
    // Aqui você pode adicionar validação se necessário
    // Salvar no localStorage
    localStorage.setItem('createToken_step2', JSON.stringify(formData))
    // Navegar para o próximo passo
    router.push('/admin?page=createstep3')
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
                {getAdminText('create-token.step-two.counter.current', '02')}
              </span>{' '}
              {getAdminText('create-token.step-two.counter.total', 'de 04')}
            </p>

            {/* Título */}
            <h1 className="text-3xl font-bold mb-8" style={{ color: colors?.colors['color-primary'] }}>
              {getAdminText('create-token.step-two.title', 'Configurações Avançadas')}
            </h1>

            {/* Formulário */}
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              {/* Ticker */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors?.colors['color-primary'] }}>
                  {getAdminText('create-token.step-two.fields.ticker.label', 'Ticker (Símbolo)')}
                </label>
                <CustomInput
                  type="text"
                  value={formData.ticker}
                  onChange={(e) => handleInputChange('ticker', e.target.value)}
                  placeholder={getAdminText('create-token.step-two.fields.ticker.placeholder', 'Ex: Bloxify Token')}
                  className="w-full h-12 text-base border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Quantidade Inicial */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors?.colors['color-primary'] }}>
                  {getAdminText('create-token.step-two.fields.initial-quantity.label', 'Quantidade Inicial')}
                </label>
                <CustomInput
                  type="text"
                  value={formData.initialQuantity}
                  onChange={(e) => handleInputChange('initialQuantity', e.target.value)}
                  placeholder={getAdminText('create-token.step-two.fields.initial-quantity.placeholder', 'Ex: 120.550,000')}
                  className="w-full h-12 text-base border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors?.colors['color-primary'] }}>
                  {getAdminText('create-token.step-two.fields.tags.label', 'Tags')}
                </label>
                
                {/* Tags existentes */}
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(index)}
                          className="text-blue-600 hover:text-blue-800 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                
                <CustomInput
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder={getAdminText('create-token.step-two.fields.tags.placeholder', 'Adicione a tag e pressione Enter')}
                  className="w-full h-12 text-base border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Twitter */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors?.colors['color-primary'] }}>
                  {getAdminText('create-token.step-two.fields.twitter.label', 'Twitter')}
                </label>
                <CustomInput
                  type="url"
                  value={formData.twitter}
                  onChange={(e) => handleInputChange('twitter', e.target.value)}
                  placeholder={getAdminText('create-token.step-two.fields.twitter.placeholder', 'Ex: https://twitter.com')}
                  className="w-full h-12 text-base border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Discord */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors?.colors['color-primary'] }}>
                  {getAdminText('create-token.step-two.fields.discord.label', 'Discord')}
                </label>
                <CustomInput
                  type="url"
                  value={formData.discord}
                  onChange={(e) => handleInputChange('discord', e.target.value)}
                  placeholder={getAdminText('create-token.step-two.fields.discord.placeholder', 'Ex: https://discord.com')}
                  className="w-full h-12 text-base border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Site Oficial */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors?.colors['color-primary'] }}>
                  {getAdminText('create-token.step-two.fields.official-website.label', 'Site Oficial')}
                </label>
                <CustomInput
                  type="url"
                  value={formData.officialWebsite}
                  onChange={(e) => handleInputChange('officialWebsite', e.target.value)}
                  placeholder={getAdminText('create-token.step-two.fields.official-website.placeholder', 'Ex: https://exemplo.com')}
                  className="w-full h-12 text-base border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Botões */}
              <div className="flex gap-4 pt-6">
                <CustomButton
                  text={getAdminText('create-token.step-two.buttons.back', 'Voltar')}
                  onClick={handleBack}
                  className="flex-1 h-12 text-base font-medium rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 bg-white border-2"
                  borderColor={colors?.border['border-primary'] || '#08CEFF'}
                  color="white"
                  textColor={colors?.border['border-primary'] || '#08CEFF'}
                />
                
                <CustomButton
                  text={getAdminText('create-token.step-two.buttons.continue', 'Continuar')}
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
