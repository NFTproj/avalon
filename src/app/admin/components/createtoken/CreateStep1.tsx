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
    longDescription: '',
  })

  // Estados de erro
  const [errors, setErrors] = useState({
    cardName: '',
    shortDescription: '',
    longDescription: '',
  })

  // Estado de "touched" (campos que foram tocados pelo usuário)
  const [touched, setTouched] = useState({
    cardName: false,
    shortDescription: false,
    longDescription: false,
  })

  // Carregar dados salvos do localStorage ao montar o componente
  useEffect(() => {
    const savedData = localStorage.getItem('createToken_step1')
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        setFormData((prev) => ({ ...prev, ...parsed }))
      } catch (error) {}
    }
  }, [])

  // Validar campo específico
  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'cardName':
        if (!value.trim()) {
          return 'Nome do card é obrigatório'
        }
        if (value.trim().length < 3) {
          return 'Nome deve ter pelo menos 3 caracteres'
        }
        if (value.trim().length > 50) {
          return 'Nome deve ter no máximo 50 caracteres'
        }
        return ''

      case 'shortDescription':
        if (!value.trim()) {
          return 'Descrição curta é obrigatória'
        }
        if (value.trim().length < 10) {
          return 'Descrição deve ter pelo menos 10 caracteres'
        }
        if (value.trim().length > 150) {
          return 'Descrição deve ter no máximo 150 caracteres'
        }
        return ''

      case 'longDescription':
        if (!value.trim()) {
          return 'Descrição longa é obrigatória'
        }
        if (value.trim().length < 50) {
          return 'Descrição deve ter pelo menos 50 caracteres'
        }
        if (value.trim().length > 1000) {
          return 'Descrição deve ter no máximo 1000 caracteres'
        }
        return ''

      default:
        return ''
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Validar apenas se o campo já foi tocado
    if (touched[field as keyof typeof touched]) {
      const error = validateField(field, value)
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

    const error = validateField(field, formData[field as keyof typeof formData])
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }))
  }

  const handleBack = () => {
    router.push('/admin?page=criartokens')
  }

  const handleContinue = () => {
    // Marcar todos os campos como tocados
    setTouched({
      cardName: true,
      shortDescription: true,
      longDescription: true,
    })

    // Validar todos os campos
    const newErrors = {
      cardName: validateField('cardName', formData.cardName),
      shortDescription: validateField('shortDescription', formData.shortDescription),
      longDescription: validateField('longDescription', formData.longDescription),
    }

    setErrors(newErrors)

    // Se houver algum erro, não continuar
    if (Object.values(newErrors).some((error) => error !== '')) {
      return
    }

    // Salvar no localStorage
    localStorage.setItem('createToken_step1', JSON.stringify(formData))
    // Navegar para o próximo passo
    router.push('/admin?page=createstep2')
  }

  // Verificar se o formulário é válido
  const isFormValid = () => {
    return (
      formData.cardName.trim() !== '' &&
      formData.shortDescription.trim() !== '' &&
      formData.longDescription.trim() !== '' &&
      errors.cardName === '' &&
      errors.shortDescription === '' &&
      errors.longDescription === ''
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
                {getAdminText('create-token.step-one.counter.current', '01')}
              </span>{' '}
              {getAdminText('create-token.step-one.counter.total', 'de 04')}
            </p>

            {/* Título */}
            <h1
              className="text-3xl font-bold mb-8"
              style={{ color: colors?.colors['color-primary'] }}
            >
              {getAdminText('create-token.step-one.title', 'Dados Principais')}
            </h1>

            {/* Formulário */}
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              {/* Nome do Card */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors?.colors['color-primary'] }}
                >
                  {getAdminText(
                    'create-token.step-one.fields.card-name.label',
                    'Nome do Card',
                  )}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <CustomInput
                  type="text"
                  value={formData.cardName}
                  onChange={(e) =>
                    handleInputChange('cardName', e.target.value)
                  }
                  onBlur={() => handleBlur('cardName')}
                  placeholder={getAdminText(
                    'create-token.step-one.fields.card-name.placeholder',
                    'Ex: Bloxify Token',
                  )}
                  className={`w-full h-12 text-base rounded-lg focus:outline-none focus:ring-2 ${
                    errors.cardName && touched.cardName
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.cardName && touched.cardName && (
                  <p className="text-red-500 text-sm mt-1">{errors.cardName}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  {formData.cardName.length}/50 caracteres
                </p>
              </div>

              {/* Descrição Curta */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors?.colors['color-primary'] }}
                >
                  {getAdminText(
                    'create-token.step-one.fields.short-description.label',
                    'Descrição Curta',
                  )}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <CustomInput
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) =>
                    handleInputChange('shortDescription', e.target.value)
                  }
                  onBlur={() => handleBlur('shortDescription')}
                  placeholder={getAdminText(
                    'create-token.step-one.fields.short-description.placeholder',
                    'Ex: Token utilitário da Bloxify',
                  )}
                  className={`w-full h-12 text-base rounded-lg focus:outline-none focus:ring-2 ${
                    errors.shortDescription && touched.shortDescription
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.shortDescription && touched.shortDescription && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.shortDescription}
                  </p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  {formData.shortDescription.length}/150 caracteres
                </p>
              </div>

              {/* Descrição Longa */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors?.colors['color-primary'] }}
                >
                  {getAdminText(
                    'create-token.step-one.fields.long-description.label',
                    'Descrição Longa',
                  )}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  value={formData.longDescription}
                  onChange={(e) =>
                    handleInputChange('longDescription', e.target.value)
                  }
                  onBlur={() => handleBlur('longDescription')}
                  placeholder={getAdminText(
                    'create-token.step-one.fields.long-description.placeholder',
                    'Adicione uma descrição detalhada do token',
                  )}
                  className={`w-full h-32 p-3 text-base text-gray-900 border rounded-lg focus:outline-none focus:ring-2 resize-none ${
                    errors.longDescription && touched.longDescription
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  style={{ color: '#111827' }}
                />
                {errors.longDescription && touched.longDescription && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.longDescription}
                  </p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  {formData.longDescription.length}/1000 caracteres
                </p>
              </div>

              {/* Botões */}
              <div className="flex gap-4 pt-6">
                <CustomButton
                  text={getAdminText(
                    'create-token.step-one.buttons.back',
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
                    'create-token.step-one.buttons.continue',
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
