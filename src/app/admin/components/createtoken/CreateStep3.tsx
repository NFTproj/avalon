'use client'

import { useContext, useState, useEffect } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import CustomButton from '@/components/core/Buttons/CustomButton'
import CustomInput from '@/components/core/Inputs/CustomInput'
import { useRouter } from 'next/navigation'
import Header from '@/components/landingPage/Header'
import Footer from '@/components/common/footer'

export default function CreateStep3() {
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

  const [formData, setFormData] = useState({
    blockchain: '',
    releaseDate: '',
    logoFile: null as File | null,
    backgroundFile: null as File | null
  })

  // Carregar dados salvos do localStorage ao montar o componente
  useEffect(() => {
    const savedData = localStorage.getItem('createToken_step3')
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

  const handleFileChange = (field: string, file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }))
  }

  const handleBack = () => {
    router.push('/admin?page=createstep2')
  }

  const handleContinue = () => {
    // Salvar no localStorage (sem os arquivos, apenas metadados)
    const dataToSave = {
      blockchain: formData.blockchain,
      releaseDate: formData.releaseDate,
      logoFileName: formData.logoFile?.name || null,
      backgroundFileName: formData.backgroundFile?.name || null
    }
    localStorage.setItem('createToken_step3', JSON.stringify(dataToSave))
    router.push('/admin?page=createstep4')
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
                {getAdminText('create-token.step-three.counter.current', '03')}
              </span>{' '}
              {getAdminText('create-token.step-three.counter.total', 'de 04')}
            </p>

            {/* Título */}
            <h1 className="text-3xl font-bold mb-8" style={{ color: colors?.colors['color-primary'] }}>
              {getAdminText('create-token.step-three.title', 'Blockchain e Imagens')}
            </h1>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              
              {/* Blockchain */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors?.colors['color-primary'] }}>
                  {getAdminText('create-token.step-three.fields.blockchain.label', 'Blockchain')}
                </label>
                <div className="relative">
                  <CustomInput
                    type="text"
                    value={formData.blockchain}
                    onChange={(e) => handleInputChange('blockchain', e.target.value)}
                    placeholder={getAdminText('create-token.step-three.fields.blockchain.placeholder', 'Selecione a Blockchain')}
                    className="w-full h-12 text-base border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Data de Lançamento */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors?.colors['color-primary'] }}>
                  {getAdminText('create-token.step-three.fields.release-date.label', 'Data de Lançamento')}
                </label>
                <CustomInput
                  type="date"
                  value={formData.releaseDate}
                  onChange={(e) => handleInputChange('releaseDate', e.target.value)}
                  placeholder={getAdminText('create-token.step-three.fields.release-date.placeholder', 'Digite a Data de Lançamento')}
                  className="w-full h-12 text-base border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Upload de Imagens */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Logotipo */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors?.colors['color-primary'] }}>
                    {getAdminText('create-token.step-three.uploads.logo.label', 'Logotipo')}
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/png,image/jpg,image/jpeg"
                      onChange={(e) => handleFileChange('logoFile', e.target.files?.[0] || null)}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mb-1 text-sm text-gray-500">
                          <span className="font-semibold">{getAdminText('create-token.step-three.uploads.logo.placeholder', 'Upload da imagem')}</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          {getAdminText('create-token.step-three.uploads.logo.file-types', 'png.jpg.jpeg')}
                        </p>
                      </div>
                    </label>
                    {formData.logoFile && (
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-sm text-green-600 truncate">Arquivo: {formData.logoFile.name}</p>
                        <button
                          type="button"
                          onClick={() => handleFileChange('logoFile', null)}
                          className="ml-2 text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          X
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Plano de fundo */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors?.colors['color-primary'] }}>
                    {getAdminText('create-token.step-three.uploads.background.label', 'Plano de fundo')}
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/png,image/jpg,image/jpeg"
                      onChange={(e) => handleFileChange('backgroundFile', e.target.files?.[0] || null)}
                      className="hidden"
                      id="background-upload"
                    />
                    <label
                      htmlFor="background-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mb-1 text-sm text-gray-500">
                          <span className="font-semibold">{getAdminText('create-token.step-three.uploads.background.placeholder', 'Upload da imagem')}</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          {getAdminText('create-token.step-three.uploads.background.file-types', 'png.jpg.jpeg')}
                        </p>
                      </div>
                    </label>
                    {formData.backgroundFile && (
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-sm text-green-600 truncate">Arquivo: {formData.backgroundFile.name}</p>
                        {/* remove arquivo anexado*/}
                        <button
                          type="button"
                          onClick={() => handleFileChange('backgroundFile', null)}
                          className="ml-2 text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          X
                        </button> 
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-4 pt-6">
                <CustomButton
                  text={getAdminText('create-token.step-three.buttons.back', 'Voltar')}
                  onClick={handleBack}
                  className="flex-1 h-12 text-base font-medium rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 bg-white border-2"
                  borderColor={colors?.border['border-primary'] || '#08CEFF'}
                  color="white"
                  textColor={colors?.border['border-primary'] || '#08CEFF'}
                />
                
                <CustomButton
                  text={getAdminText('create-token.step-three.buttons.continue', 'Continuar')}
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
