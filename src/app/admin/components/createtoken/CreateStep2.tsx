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
    tokenPrice: '',
    tags: [] as string[],
    twitter: '',
    discord: '',
    officialWebsite: '',
  })

  const [tagInput, setTagInput] = useState('')

  // Estados de erro
  const [errors, setErrors] = useState({
    ticker: '',
    initialQuantity: '',
    tokenPrice: '',
    twitter: '',
    discord: '',
    officialWebsite: '',
  })

  // Estado de "touched"
  const [touched, setTouched] = useState({
    ticker: false,
    initialQuantity: false,
    tokenPrice: false,
    twitter: false,
    discord: false,
    officialWebsite: false,
  })

  // Carregar dados salvos do localStorage ao montar o componente
  useEffect(() => {
    const savedData = localStorage.getItem('createToken_step2')
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        setFormData((prev) => ({ ...prev, ...parsed }))
      } catch (error) {}
    }
  }, [])

  // Validar URL
  const isValidURL = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // Validar campo específico
  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'ticker':
        if (!value.trim()) {
          return 'Ticker é obrigatório'
        }
        if (value.trim().length < 2) {
          return 'Ticker deve ter pelo menos 2 caracteres'
        }
        if (value.trim().length > 10) {
          return 'Ticker deve ter no máximo 10 caracteres'
        }
        if (!/^[A-Z0-9]+$/.test(value.trim())) {
          return 'Ticker deve conter apenas letras maiúsculas e números'
        }
        return ''

      case 'initialQuantity':
        if (!value.trim()) {
          return 'Quantidade inicial é obrigatória'
        }
        const quantity = parseFloat(value.replace(/[^\d.]/g, ''))
        if (isNaN(quantity) || quantity <= 0) {
          return 'Quantidade deve ser maior que zero'
        }
        if (quantity > 1000000000000) {
          return 'Quantidade muito grande (máximo: 1 trilhão)'
        }
        return ''

      case 'tokenPrice':
        if (!value.trim()) {
          return 'Preço unitário é obrigatório'
        }
        const price = parseFloat(value)
        if (isNaN(price) || price < 0.01) {
          return 'Preço deve ser no mínimo 0.01 USDC'
        }
        if (price > 1000000) {
          return 'Preço muito alto (máximo: 1.000.000 USDC)'
        }
        return ''

      case 'twitter':
        if (value.trim() && !isValidURL(value.trim())) {
          return 'URL inválida (deve começar com http:// ou https://)'
        }
        return ''

      case 'discord':
        if (value.trim() && !isValidURL(value.trim())) {
          return 'URL inválida (deve começar com http:// ou https://)'
        }
        return ''

      case 'officialWebsite':
        if (value.trim() && !isValidURL(value.trim())) {
          return 'URL inválida (deve começar com http:// ou https://)'
        }
        return ''

      default:
        return ''
    }
  }

  const handleInputChange = (field: string, value: string) => {
    // Para ticker, converter automaticamente para maiúsculas
    const finalValue = field === 'ticker' ? value.toUpperCase() : value

    setFormData((prev) => ({
      ...prev,
      [field]: finalValue,
    }))

    // Validar apenas se o campo já foi tocado
    if (touched[field as keyof typeof touched]) {
      const error = validateField(field, finalValue)
      setErrors((prev) => ({
        ...prev,
        [field]: error,
      }))
    }
  }

  const handleBlur = (field: string) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }))

    const error = validateField(field, formData[field as keyof typeof formData] as string)
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }))
  }

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      
      if (formData.tags.length >= 10) {
        alert('Máximo de 10 tags permitidas')
        return
      }

      if (tagInput.trim().length > 20) {
        alert('Tag deve ter no máximo 20 caracteres')
        return
      }

      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }))
  }

  const handleBack = () => {
    router.push('/admin?page=createstep1')
  }

  const handleContinue = () => {
    // Marcar todos os campos como tocados
    setTouched({
      ticker: true,
      initialQuantity: true,
      tokenPrice: true,
      twitter: true,
      discord: true,
      officialWebsite: true,
    })

    // Validar todos os campos obrigatórios
    const newErrors = {
      ticker: validateField('ticker', formData.ticker),
      initialQuantity: validateField('initialQuantity', formData.initialQuantity),
      tokenPrice: validateField('tokenPrice', formData.tokenPrice),
      twitter: validateField('twitter', formData.twitter),
      discord: validateField('discord', formData.discord),
      officialWebsite: validateField('officialWebsite', formData.officialWebsite),
    }

    setErrors(newErrors)

    // Se houver algum erro, não continuar
    if (Object.values(newErrors).some((error) => error !== '')) {
      return
    }

    // Salvar no localStorage
    localStorage.setItem('createToken_step2', JSON.stringify(formData))
    // Navegar para o próximo passo
    router.push('/admin?page=createstep3')
  }

  // Verificar se o formulário é válido
  const isFormValid = () => {
    return (
      formData.ticker.trim() !== '' &&
      formData.initialQuantity.trim() !== '' &&
      formData.tokenPrice.trim() !== '' &&
      errors.ticker === '' &&
      errors.initialQuantity === '' &&
      errors.tokenPrice === '' &&
      errors.twitter === '' &&
      errors.discord === '' &&
      errors.officialWebsite === ''
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-blue-50 py-8 px-4">
        <div className="max-w-xl mx-auto w-full">
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Indicador de progresso */}
            <p
              className="mb-2 text-sm"
              style={{ color: colors?.colors['color-secondary'] }}
            >
              Etapa{' '}
              <span
                style={{
                  color: colors?.colors['color-primary'],
                  fontWeight: 'bold',
                }}
              >
                {getAdminText('create-token.step-two.counter.current', '02')}
              </span>{' '}
              {getAdminText('create-token.step-two.counter.total', 'de 04')}
            </p>

            {/* Título */}
            <h1
              className="text-3xl font-bold mb-8"
              style={{ color: colors?.colors['color-primary'] }}
            >
              {getAdminText(
                'create-token.step-two.title',
                'Configurações Avançadas',
              )}
            </h1>

            {/* Formulário */}
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              {/* Ticker */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors?.colors['color-primary'] }}
                >
                  {getAdminText(
                    'create-token.step-two.fields.ticker.label',
                    'Ticker (Símbolo)',
                  )}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <CustomInput
                  type="text"
                  value={formData.ticker}
                  onChange={(e) => handleInputChange('ticker', e.target.value)}
                  onBlur={() => handleBlur('ticker')}
                  placeholder={getAdminText(
                    'create-token.step-two.fields.ticker.placeholder',
                    'Ex: BLX',
                  )}
                  className={`w-full h-12 text-base rounded-lg focus:outline-none focus:ring-2 ${
                    errors.ticker && touched.ticker
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.ticker && touched.ticker && (
                  <p className="text-red-500 text-sm mt-1">{errors.ticker}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  {formData.ticker.length}/10 caracteres (apenas letras maiúsculas)
                </p>
              </div>

              {/* Quantidade Inicial */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors?.colors['color-primary'] }}
                >
                  {getAdminText(
                    'create-token.step-two.fields.initial-quantity.label',
                    'Quantidade Inicial',
                  )}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <CustomInput
                  type="text"
                  value={formData.initialQuantity}
                  onChange={(e) =>
                    handleInputChange('initialQuantity', e.target.value)
                  }
                  onBlur={() => handleBlur('initialQuantity')}
                  placeholder={getAdminText(
                    'create-token.step-two.fields.initial-quantity.placeholder',
                    'Ex: 1000000',
                  )}
                  className={`w-full h-12 text-base rounded-lg focus:outline-none focus:ring-2 ${
                    errors.initialQuantity && touched.initialQuantity
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.initialQuantity && touched.initialQuantity && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.initialQuantity}
                  </p>
                )}
              </div>

              {/* Preço Unitário */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors?.colors['color-primary'] }}
                >
                  {getAdminText(
                    'create-token.step-two.fields.token-price.label',
                    'Preço Unitário (USDC)',
                  )}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <CustomInput
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.tokenPrice}
                  onChange={(e) =>
                    handleInputChange('tokenPrice', e.target.value)
                  }
                  onBlur={() => handleBlur('tokenPrice')}
                  placeholder={getAdminText(
                    'create-token.step-two.fields.token-price.placeholder',
                    'Ex: 1.00',
                  )}
                  className={`w-full h-12 text-base rounded-lg focus:outline-none focus:ring-2 ${
                    errors.tokenPrice && touched.tokenPrice
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.tokenPrice && touched.tokenPrice && (
                  <p className="text-red-500 text-sm mt-1">{errors.tokenPrice}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {getAdminText(
                    'create-token.step-two.fields.token-price.helper',
                    'Quanto custará 1 token em USDC (ex: 1.50 significa que o usuário pagará 1.50 USDC por cada token)',
                  )}
                </p>
              </div>

              {/* Tags */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors?.colors['color-primary'] }}
                >
                  {getAdminText(
                    'create-token.step-two.fields.tags.label',
                    'Tags',
                  )}
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
                  placeholder={getAdminText(
                    'create-token.step-two.fields.tags.placeholder',
                    'Adicione a tag e pressione Enter',
                  )}
                  className="w-full h-12 text-base border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Twitter */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors?.colors['color-primary'] }}
                >
                  {getAdminText(
                    'create-token.step-two.fields.twitter.label',
                    'Twitter',
                  )}
                  <span className="text-gray-400 text-xs ml-1">(opcional)</span>
                </label>
                <CustomInput
                  type="url"
                  value={formData.twitter}
                  onChange={(e) => handleInputChange('twitter', e.target.value)}
                  onBlur={() => handleBlur('twitter')}
                  placeholder={getAdminText(
                    'create-token.step-two.fields.twitter.placeholder',
                    'Ex: https://twitter.com/seu_token',
                  )}
                  className={`w-full h-12 text-base rounded-lg focus:outline-none focus:ring-2 ${
                    errors.twitter && touched.twitter
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.twitter && touched.twitter && (
                  <p className="text-red-500 text-sm mt-1">{errors.twitter}</p>
                )}
              </div>

              {/* Discord */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors?.colors['color-primary'] }}
                >
                  {getAdminText(
                    'create-token.step-two.fields.discord.label',
                    'Discord',
                  )}
                  <span className="text-gray-400 text-xs ml-1">(opcional)</span>
                </label>
                <CustomInput
                  type="url"
                  value={formData.discord}
                  onChange={(e) => handleInputChange('discord', e.target.value)}
                  onBlur={() => handleBlur('discord')}
                  placeholder={getAdminText(
                    'create-token.step-two.fields.discord.placeholder',
                    'Ex: https://discord.gg/seu_servidor',
                  )}
                  className={`w-full h-12 text-base rounded-lg focus:outline-none focus:ring-2 ${
                    errors.discord && touched.discord
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.discord && touched.discord && (
                  <p className="text-red-500 text-sm mt-1">{errors.discord}</p>
                )}
              </div>

              {/* Site Oficial */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors?.colors['color-primary'] }}
                >
                  {getAdminText(
                    'create-token.step-two.fields.official-website.label',
                    'Site Oficial',
                  )}
                  <span className="text-gray-400 text-xs ml-1">(opcional)</span>
                </label>
                <CustomInput
                  type="url"
                  value={formData.officialWebsite}
                  onChange={(e) =>
                    handleInputChange('officialWebsite', e.target.value)
                  }
                  onBlur={() => handleBlur('officialWebsite')}
                  placeholder={getAdminText(
                    'create-token.step-two.fields.official-website.placeholder',
                    'Ex: https://seutoken.com',
                  )}
                  className={`w-full h-12 text-base rounded-lg focus:outline-none focus:ring-2 ${
                    errors.officialWebsite && touched.officialWebsite
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.officialWebsite && touched.officialWebsite && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.officialWebsite}
                  </p>
                )}
              </div>

              {/* Botões */}
              <div className="flex gap-4 pt-6">
                <CustomButton
                  text={getAdminText(
                    'create-token.step-two.buttons.back',
                    'Voltar',
                  )}
                  onClick={handleBack}
                  className="flex-1 h-12 text-base font-medium rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 bg-white border-2"
                  borderColor={colors?.border['border-primary'] || '#08CEFF'}
                  color="white"
                  textColor={colors?.border['border-primary'] || '#08CEFF'}
                />

                <CustomButton
                  text={getAdminText(
                    'create-token.step-two.buttons.continue',
                    'Continuar',
                  )}
                  onClick={handleContinue}
                  disabled={!isFormValid()}
                  className="flex-1 h-12 text-base font-medium rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
