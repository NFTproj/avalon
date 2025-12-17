'use client'

import { useContext, useState, useEffect } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import CustomButton from '@/components/core/Buttons/CustomButton'
import { useRouter } from 'next/navigation'
import Header from '@/components/landingPage/Header'
import Footer from '@/components/common/footer'
import {
  createCard,
  deployTokenContract,
  deploySaleContract,
} from '@/lib/api/cards'
import { USDC_ADDRESS } from '@/lib/contracts/registry/stablecoins'

interface TokenFormData {
  // Step 1
  cardName?: string
  shortDescription?: string
  longDescription?: string
  // Step 2
  ticker?: string
  initialQuantity?: string
  tokenPrice?: string
  tags?: string[]
  twitter?: string
  discord?: string
  officialWebsite?: string
  // Step 3
  blockchain?: string
  releaseDate?: string
  logoFile?: File | null
  backgroundFile?: File | null
}

export default function CreateStep4() {
  const { colors, texts } = useContext(ConfigContext)
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const adminTexts = (texts as any)?.admin
  const getAdminText = (key: string, fallback: string) => {
    const keys = key.split('.')
    let value = adminTexts
    for (const k of keys) {
      value = value?.[k]
    }
    return value || fallback
  }

  const [formData, setFormData] = useState<TokenFormData>({})

  // Carregar dados dos steps anteriores do localStorage
  useEffect(() => {
    const step1Data = localStorage.getItem('createToken_step1')
    const step2Data = localStorage.getItem('createToken_step2')
    const step3Data = localStorage.getItem('createToken_step3')

    const data: TokenFormData = {
      ...(step1Data ? JSON.parse(step1Data) : {}),
      ...(step2Data ? JSON.parse(step2Data) : {}),
      ...(step3Data ? JSON.parse(step3Data) : {}),
    }

    setFormData(data)
  }, [])

  const handleBack = () => {
    router.push('/admin?page=createstep3')
  }

  const handleEdit = () => {
    router.push('/admin?page=createstep1')
  }

  const handleCreateToken = async () => {
    setLoading(true)
    try {
      // ========== PASSO 1: CRIAR O CARD ==========
      console.log('📝 Passo 1: Criando card...')

      // Montar socialLinks
      const socialLinks: Record<string, string> = {}
      if (formData.officialWebsite)
        socialLinks.website = formData.officialWebsite
      if (formData.twitter) socialLinks.twitter = formData.twitter
      if (formData.discord) socialLinks.discord = formData.discord

      const cardResponse = await createCard({
        name: formData.cardName || 'Token',
        description: formData.shortDescription,
        longDescription: formData.longDescription,
        ticker: formData.ticker,
        tags: formData.tags,
        socialLinks:
          Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
        blockchainPlatform: formData.blockchain || 'Polygon',
        launchDate: formData.releaseDate,
        logoFile: formData.logoFile || undefined,
        cardBackgroundFile: formData.backgroundFile || undefined,
      })

      const cardId = cardResponse.id || cardResponse.data?.id

      if (!cardId) {
        throw new Error('Card criado mas ID não retornado')
      }

      console.log('✅ Card criado com sucesso! ID:', cardId)

      // ========== PASSO 2: FAZER DEPLOY DO TOKEN NA BLOCKCHAIN ==========
      console.log('⛓️ Passo 2: Fazendo deploy do token na blockchain...')

      const network = (formData.blockchain || 'polygon').toLowerCase()

      const tokenDeployResponse = await deployTokenContract({
        cardId,
        tokenName: formData.cardName || 'Token',
        tokenSymbol: formData.ticker || 'TKN',
        initialSupply: formData.initialQuantity || '1000000',
        burnable: true,
        network,
      })

      const tokenAddress =
        tokenDeployResponse.tokenAddress ||
        tokenDeployResponse.data?.tokenAddress

      if (!tokenAddress) {
        throw new Error(
          'Deploy do token feito com sucesso, mas endereço do token não retornado',
        )
      }

      console.log(
        '✅ Deploy do token feito com sucesso! Endereço:',
        tokenAddress,
      )

      // ========== PASSO 3: FAZER DEPLOY DO CONTRATO INTERMEDIÁRIO ==========
      console.log('🔄 Passo 3: Fazendo deploy do contrato intermediário...')

      // Obter endereço da stablecoin (USDC) baseado na rede
      const chainId = network === 'polygon' ? 137 : 137 // Default polygon
      const stablecoinAddress = USDC_ADDRESS[chainId]

      if (!stablecoinAddress) {
        throw new Error(`USDC não configurado para a rede ${network}`)
      }

      const intermediaryResponse = await deploySaleContract({
        cardId,
        tokenAddress,
        stablecoinAddress,
        tokenPrice: parseFloat(formData.tokenPrice || '1.0'), // Usa o preço definido pelo usuário ou 1.0 como padrão
        network,
      })

      console.log('✅ Contrato intermediário deployed com sucesso!')
      console.log(
        'Endereço intermediário:',
        intermediaryResponse.intermediaryAddress ||
          intermediaryResponse.data?.intermediaryAddress,
      )

      // ========== SUCESSO ==========
      // Limpar localStorage após sucesso
      localStorage.removeItem('createToken_step1')
      localStorage.removeItem('createToken_step2')
      localStorage.removeItem('createToken_step3')

      // Redirecionar para página de sucesso
      router.push('/admin?page=success')
    } catch (error: any) {
      console.error('❌ Erro ao criar token:', error)
      console.error('Detalhes:', error?.message || error)
      // Redirecionar para página de erro
      router.push('/admin?page=error')
    } finally {
      setLoading(false)
    }
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
                {getAdminText('create-token.step-four.counter.current', '04')}
              </span>{' '}
              {getAdminText('create-token.step-four.counter.total', 'de 04')}
            </p>

            {/* Título */}
            <h1
              className="text-3xl font-bold mb-8"
              style={{ color: colors?.colors['color-primary'] }}
            >
              {getAdminText(
                'create-token.step-four.title',
                'Revisão e Criação',
              )}
            </h1>

            {/* Resumo dos dados */}
            <div
              className="rounded-lg p-6 mb-6"
              style={{
                backgroundColor:
                  colors?.['colors-base']?.['color-secondary'] || '#F2FCFF',
                border: `1px solid ${colors?.border?.['border-primary'] || '#08CEFF'}`,
              }}
            >
              <h2
                className="text-xl font-bold mb-4"
                style={{ color: colors?.colors['color-primary'] }}
              >
                {formData.cardName || 'Token Fazenda Eliane'}
              </h2>

              <div className="space-y-3">
                {/* Ticker */}
                {formData.ticker && (
                  <div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: colors?.colors['color-secondary'] }}
                    >
                      {getAdminText(
                        'create-token.step-four.fields.ticker',
                        'Ticker',
                      )}
                      :{' '}
                    </span>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: colors?.colors['color-primary'] }}
                    >
                      {formData.ticker}
                    </span>
                  </div>
                )}

                {/* Descrição Curta */}
                {formData.shortDescription && (
                  <div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: colors?.colors['color-secondary'] }}
                    >
                      {getAdminText(
                        'create-token.step-four.fields.short-description',
                        'Descrição Curta',
                      )}
                      :{' '}
                    </span>
                    <span
                      className="text-sm"
                      style={{ color: colors?.colors['color-primary'] }}
                    >
                      {formData.shortDescription}
                    </span>
                  </div>
                )}

                {/* Descrição Longa */}
                {formData.longDescription && (
                  <div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: colors?.colors['color-secondary'] }}
                    >
                      {getAdminText(
                        'create-token.step-four.fields.long-description',
                        'Descrição Longa',
                      )}
                      :{' '}
                    </span>
                    <span
                      className="text-sm"
                      style={{ color: colors?.colors['color-primary'] }}
                    >
                      {formData.longDescription}
                    </span>
                  </div>
                )}

                {/* Quantidade Inicial */}
                {formData.initialQuantity && (
                  <div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: colors?.colors['color-secondary'] }}
                    >
                      {getAdminText(
                        'create-token.step-four.fields.initial-quantity',
                        'Quantidade inicial',
                      )}
                      :{' '}
                    </span>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: colors?.colors['color-primary'] }}
                    >
                      {formData.initialQuantity}
                    </span>
                  </div>
                )}

                {/* Preço Unitário */}
                {formData.tokenPrice && (
                  <div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: colors?.colors['color-secondary'] }}
                    >
                      {getAdminText(
                        'create-token.step-four.fields.token-price',
                        'Preço Unitário',
                      )}
                      :{' '}
                    </span>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: colors?.colors['color-primary'] }}
                    >
                      {formData.tokenPrice} USDC
                    </span>
                  </div>
                )}

                {/* Tags */}
                {formData.tags && formData.tags.length > 0 && (
                  <div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: colors?.colors['color-secondary'] }}
                    >
                      {getAdminText(
                        'create-token.step-four.fields.tags',
                        'Tags',
                      )}
                      :{' '}
                    </span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{
                            backgroundColor:
                              colors?.['colors-base']?.['color-tertiary'] ||
                              '#08CEFF',
                            color: '#FFFFFF',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Site */}
                {formData.officialWebsite && (
                  <div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: colors?.colors['color-secondary'] }}
                    >
                      {getAdminText(
                        'create-token.step-four.fields.site',
                        'Site',
                      )}
                      :{' '}
                    </span>
                    <a
                      href={formData.officialWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm underline"
                      style={{
                        color: colors?.border?.['border-primary'] || '#08CEFF',
                      }}
                    >
                      {formData.officialWebsite}
                    </a>
                  </div>
                )}

                {/* Discord */}
                {formData.discord && (
                  <div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: colors?.colors['color-secondary'] }}
                    >
                      {getAdminText(
                        'create-token.step-four.fields.discord',
                        'Discord',
                      )}
                      :{' '}
                    </span>
                    <a
                      href={formData.discord}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm underline"
                      style={{
                        color: colors?.border?.['border-primary'] || '#08CEFF',
                      }}
                    >
                      {formData.discord}
                    </a>
                  </div>
                )}

                {/* Twitter */}
                {formData.twitter && (
                  <div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: colors?.colors['color-secondary'] }}
                    >
                      {getAdminText(
                        'create-token.step-four.fields.twitter',
                        'Twitter',
                      )}
                      :{' '}
                    </span>
                    <a
                      href={formData.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm underline"
                      style={{
                        color: colors?.border?.['border-primary'] || '#08CEFF',
                      }}
                    >
                      {formData.twitter}
                    </a>
                  </div>
                )}

                {/* Blockchain */}
                {formData.blockchain && (
                  <div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: colors?.colors['color-secondary'] }}
                    >
                      {getAdminText(
                        'create-token.step-four.fields.blockchain',
                        'Blockchain',
                      )}
                      :{' '}
                    </span>
                    <span
                      className="text-sm"
                      style={{ color: colors?.colors['color-primary'] }}
                    >
                      {formData.blockchain}
                    </span>
                  </div>
                )}

                {/* Data de Lançamento */}
                {formData.releaseDate && (
                  <div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: colors?.colors['color-secondary'] }}
                    >
                      {getAdminText(
                        'create-token.step-four.fields.release-date',
                        'Data de Lançamento',
                      )}
                      :{' '}
                    </span>
                    <span
                      className="text-sm"
                      style={{ color: colors?.colors['color-primary'] }}
                    >
                      {new Date(formData.releaseDate).toLocaleDateString(
                        'pt-BR',
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-6">
              <CustomButton
                text={getAdminText(
                  'create-token.step-four.buttons.edit',
                  'Editar Dados',
                )}
                onClick={handleEdit}
                className="flex-1 h-12 text-base font-medium rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 bg-white border-2"
                borderColor={colors?.border['border-primary'] || '#08CEFF'}
                color="white"
                textColor={colors?.border['border-primary'] || '#08CEFF'}
              />

              <CustomButton
                text={
                  loading
                    ? getAdminText(
                        'create-token.step-four.buttons.creating',
                        'Criando...',
                      )
                    : getAdminText(
                        'create-token.step-four.buttons.create',
                        'Criar Token',
                      )
                }
                onClick={handleCreateToken}
                disabled={loading}
                className="flex-1 h-12 text-base font-medium rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                color={colors?.buttons['button-primary'] || '#08CEFF'}
                textColor="white"
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
