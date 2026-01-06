'use client'

import { useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ConfigContext } from '@/contexts/ConfigContext'
import CustomButton from '@/components/core/Buttons/CustomButton'
import CustomInput from '@/components/core/Inputs/CustomInput'
import Header from '@/components/landingPage/Header'
import Footer from '@/components/common/footer'
import LoadingOverlay from '@/components/common/LoadingOverlay'
import { getCardById, updateCard, Card } from '@/lib/api/cards'

// ============================================================================
// COMPONENTE
// ============================================================================

export default function EditToken() {
  // Contextos e hooks
  const { colors, texts } = useContext(ConfigContext)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Pega o ID do token da URL
  const tokenId = searchParams.get('id')

  // Helper para buscar textos de tradução
  const adminTexts = useMemo(() => (texts as any)?.admin, [texts])
  const getAdminText = useCallback(
    (key: string, fallback: string) => {
      const keys = key.split('.')
      let value = adminTexts
      for (const k of keys) {
        value = value?.[k]
      }
      return value || fallback
    },
    [adminTexts],
  )

  // Estados do componente
  const [loading, setLoading] = useState(true) // Carregando dados do token
  const [saving, setSaving] = useState(false) // Salvando alterações
  const [error, setError] = useState<string | null>(null) // Mensagem de erro
  const [token, setToken] = useState<Card | null>(null) // Dados originais do token

  // Dados do formulário
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    longDescription: '',
    ticker: '',
  })

  // ============================================================================
  // EFEITOS
  // ============================================================================

  /**
   * Carrega dados do token ao montar o componente
   */
  useEffect(() => {
    // Se não tem ID, volta para o dashboard
    if (!tokenId) {
      router.push('/admin?page=dashboard')
      return
    }

    // Busca dados do token
    const loadToken = async () => {
      try {
        setLoading(true)
        setError(null)

        const tokenData = await getCardById(tokenId)
        setToken(tokenData)

        // Preenche o formulário com os dados existentes
        setFormData({
          name: tokenData.name || '',
          description: tokenData.description || '',
          longDescription: tokenData.longDescription || '',
          ticker: tokenData.ticker || '',
        })
      } catch (err: any) {
        console.error('Erro ao carregar token:', err)
        setError(err?.message || 'Erro ao carregar dados do token')
      } finally {
        setLoading(false)
      }
    }

    loadToken()
  }, [tokenId, router])

  // ============================================================================
  // FUNÇÕES
  // ============================================================================

  /**
   * Atualiza um campo do formulário
   */
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  /**
   * Volta para o dashboard sem salvar
   */
  const handleCancel = () => {
    router.push('/admin?page=dashboard')
  }

  /**
   * Salva as alterações do token
   */
  const handleSave = async () => {
    if (!tokenId) return

    try {
      setSaving(true)
      setError(null)

      // Envia apenas os campos que foram alterados
      await updateCard(tokenId, {
        name: formData.name,
        description: formData.description,
        longDescription: formData.longDescription,
        ticker: formData.ticker,
      })

      // Sucesso - volta para o dashboard
      alert(getAdminText('edit-token.success', 'Token atualizado com sucesso!'))
      router.push('/admin?page=dashboard')
    } catch (err: any) {
      console.error('Erro ao salvar token:', err)
      setError(err?.message || 'Erro ao salvar alterações')
    } finally {
      setSaving(false)
    }
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 bg-blue-50 py-8 px-4">
        <div className="max-w-2xl mx-auto w-full">
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Título */}
            <h1
              className="text-3xl font-bold mb-8"
              style={{ color: colors?.colors['color-primary'] }}
            >
              {getAdminText('edit-token.title', 'Editar Token')}
            </h1>

            {/* Estado: Carregando */}
            {loading ? (
              <div className="relative min-h-[400px]">
                <LoadingOverlay
                  overrideMessage={getAdminText(
                    'edit-token.loading',
                    'Carregando dados...',
                  )}
                  showMessage={true}
                />
              </div>
            ) : /* Estado: Erro ao carregar */ error && !token ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <CustomButton
                  text={getAdminText('edit-token.back', 'Voltar')}
                  onClick={handleCancel}
                  className="px-6 py-2"
                  color={colors?.buttons['button-primary'] || '#08CEFF'}
                  textColor="white"
                />
              </div>
            ) : (
              /* Formulário de edição */
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                {/* Nome do Token */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: colors?.colors['color-primary'] }}
                  >
                    {getAdminText(
                      'edit-token.fields.name.label',
                      'Nome do Token',
                    )}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <CustomInput
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder={getAdminText(
                      'edit-token.fields.name.placeholder',
                      'Ex: Bloxify Token',
                    )}
                    className="w-full h-12 text-base border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Ticker */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: colors?.colors['color-primary'] }}
                  >
                    {getAdminText(
                      'edit-token.fields.ticker.label',
                      'Ticker (Símbolo)',
                    )}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <CustomInput
                    type="text"
                    value={formData.ticker}
                    onChange={(e) =>
                      handleInputChange('ticker', e.target.value.toUpperCase())
                    }
                    placeholder={getAdminText(
                      'edit-token.fields.ticker.placeholder',
                      'Ex: BLX',
                    )}
                    className="w-full h-12 text-base border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Descrição Curta */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: colors?.colors['color-primary'] }}
                  >
                    {getAdminText(
                      'edit-token.fields.description.label',
                      'Descrição Curta',
                    )}
                  </label>
                  <CustomInput
                    type="text"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange('description', e.target.value)
                    }
                    placeholder={getAdminText(
                      'edit-token.fields.description.placeholder',
                      'Ex: Token utilitário da Bloxify',
                    )}
                    className="w-full h-12 text-base border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Descrição Longa */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: colors?.colors['color-primary'] }}
                  >
                    {getAdminText(
                      'edit-token.fields.long-description.label',
                      'Descrição Longa',
                    )}
                  </label>
                  <textarea
                    value={formData.longDescription}
                    onChange={(e) =>
                      handleInputChange('longDescription', e.target.value)
                    }
                    placeholder={getAdminText(
                      'edit-token.fields.long-description.placeholder',
                      'Adicione uma descrição detalhada do token',
                    )}
                    className="w-full h-32 p-3 text-base text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                {/* Mensagem de erro */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                {/* Informação sobre campos não editáveis */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    <strong>
                      {getAdminText('edit-token.info.label', 'Nota')}:
                    </strong>{' '}
                    {getAdminText(
                      'edit-token.info.message',
                      'Alguns campos não podem ser editados após a criação do token na blockchain (quantidade, preço, rede, etc).',
                    )}
                  </p>
                </div>

                {/* Botões de ação */}
                <div className="flex gap-4 pt-6">
                  <CustomButton
                    text={getAdminText('edit-token.buttons.cancel', 'Cancelar')}
                    onClick={handleCancel}
                    disabled={saving}
                    className="flex-1 h-12 text-base font-medium rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 bg-white border-2"
                    borderColor={colors?.border['border-primary'] || '#08CEFF'}
                    color="white"
                    textColor={colors?.border['border-primary'] || '#08CEFF'}
                  />

                  <CustomButton
                    text={
                      saving
                        ? getAdminText(
                            'edit-token.buttons.saving',
                            'Salvando...',
                          )
                        : getAdminText(
                            'edit-token.buttons.save',
                            'Salvar Alterações',
                          )
                    }
                    onClick={handleSave}
                    disabled={saving || !formData.name || !formData.ticker}
                    className="flex-1 h-12 text-base font-medium rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                    color={colors?.buttons['button-primary'] || '#08CEFF'}
                    textColor="white"
                  />
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
