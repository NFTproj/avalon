'use client'

import React, { useContext, useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import MainLayout from '@/components/layout/MainLayout'
import { ConfigContext } from '@/contexts/ConfigContext'
import { useAuth } from '@/contexts/AuthContext'
import { useTokenMetrics } from '@/hooks/useTokenMetrics'
import { getAllCards, getPublicCards, Card as ApiCard } from '@/lib/api/cards'
import ProgressBar from '@/components/common/ProgressBar'
import LoadingOverlay from '@/components/common/LoadingOverlay'
import ImageFromJSON from '@/components/core/ImageFromJSON'
import { AlertCircle, ArrowLeft, ExternalLink } from 'lucide-react'

interface TokenType {
  id: number
  name: string
  subtitle: string
  price: string
  launchDate: string
  tokensAvailable: string
  identifierCode: string
  image: string
  sold: number
  total: number
  labels: { name: string }[]
}

export default function TokenDetailsPage() {
  const { colors, texts } = useContext(ConfigContext)
  const { user } = useAuth()
  const router = useRouter()
  const { id } = useParams() as { id: string }
  const [tab, setTab] = useState<'info' | 'tokenInfo' | 'documents' | 'benefits' | 'metrics'>('info')
  const [token, setToken] = useState<ApiCard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const tokenDetails = texts?.['token-details']
  const tokenInfo = texts?.['token']

  // Hook para métricas do token
  const { 
    stats, 
    loading: metricsLoading, 
    error: metricsError,
    refresh: refreshMetrics 
  } = useTokenMetrics({
    userId: user?.id,
    walletAddress: user?.walletAddress,
    timeframe: '24h',
    enableConversion: false
  })

  // Buscar dados do token da API
  useEffect(() => {
    const fetchToken = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('TokenDetailsPage: Buscando token com ID:', id)
        
        // Primeiro tenta usar cards públicos, depois autenticados se falhar
        let response
        try {
          response = await getPublicCards()
          console.log('📡 TokenDetailsPage: Usando dados públicos')
        } catch (publicError) {
          console.log('TokenDetailsPage: Fallback para API autenticada')
          response = await getAllCards()
        }
        
        if (response.data && Array.isArray(response.data)) {
          const foundToken = response.data.find(card => card.id === id)
          
          if (foundToken) {
            console.log('TokenDetailsPage: Token encontrado:', foundToken.name)
            setToken(foundToken)
          } else {
            console.log('TokenDetailsPage: Token não encontrado na API')
            throw new Error(`Token com ID ${id} não foi encontrado na API`)
          }
        } else {
          throw new Error('Não foi possível carregar os dados do token')
        }
      } catch (err) {
        console.error('TokenDetailsPage: Erro ao buscar token:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    fetchToken()
  }, [id])

  // Estados auxiliares
  const formattedPrice = '$ 15.00'
  const sold = 516820
  const total = 1000000
  const labelColors = ['#8B7355', '#00D4AA', '#4CAF50']
  const labels = [{ name: 'CPR' }, { name: 'CARBONO' }, { name: 'VERDE' }]

  const tokenInfoList = [
    'Token baseado no padrão ERC-20, compatível com rede Polygon',
    'Pode ser usado para staking em jogos e recompensas dinâmicas',
    'Planejado para uso em futuras votações de governança (DAO)',
    'Launchpad integrado para novos meme tokens e projetos emergentes',
    'Tokenomics planejado com queima parcial para controle de oferta',
    'Código do contrato será aberto e auditado antes do lançamento',
  ]
  const documentsList = [
    { title: 'Documentos essenciais (Anexo E)', href: '#' },
    { title: 'Contrato de investimento', href: '#' },
    { title: 'Contrato Social', href: '#' },
  ]
  const rightsText =
    'O Meowl Token (MEWL) representa um ativo digital com utilidade no ecossistema MeowlVerse, permitindo o uso em jogos, staking e acesso a funcionalidades da plataforma. A posse do token não confere qualquer participação societária, direito de voto ou responsabilidade sobre o projeto MeowlVerse e seus fundadores.'
  const risksText =
    'Os detentores de MEWL estão cientes de que não há garantias de retorno financeiro ou valorização. O desempenho do token está sujeito a fatores de mercado, adoção do projeto, decisões de governança e demais riscos inerentes a projetos baseados em blockchain e criptomoedas.'

  // Estados de loading e erro
  if (loading) {
    return <LoadingOverlay />
  }

  if (error) {
    return (
      <MainLayout>
        <main
          className="min-h-screen py-16 flex items-center justify-center"
          style={{ backgroundColor: colors?.background['background-primary'] }}
        >
          <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Erro ao Carregar Token</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Voltar
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        </main>
      </MainLayout>
    )
  }

  if (!token) {
    return (
      <MainLayout>
        <main
          className="min-h-screen py-16 flex items-center justify-center"
          style={{ backgroundColor: colors?.background['background-primary'] }}
        >
          <div className="text-center">
            <p className="text-gray-600">Token não encontrado</p>
          </div>
        </main>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <main
        className="min-h-screen py-16"
        style={{ backgroundColor: colors?.background['background-primary'] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8">
          {/* Coluna principal - conteúdo */}
          <div className="flex-1 max-w-3xl space-y-12">
            {/* Botão de volta */}
            <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
            style={{ color: colors?.colors['color-primary'] }}
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para tokens
          </button>

          {/* Seção superior */}
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <div className="flex gap-2 mb-4">
                {labels.map((label, idx) => (
                  <span
                    key={label.name}
                    className="text-[10px] font-bold px-3 py-1 rounded-full border-2 border-black text-black"
                    style={{
                      backgroundColor: labelColors[idx % labelColors.length],
                    }}
                  >
                    {label.name}
                  </span>
                ))}
              </div>
              <div className="mb-4">
                <h1
                  className="text-2xl font-bold"
                  style={{ color: colors?.colors['color-primary'] }}
                >
                  {token.name}
                </h1>
                <p
                  className="text-sm"
                  style={{ color: colors?.colors['color-secondary'] }}
                >
                  {token.description || 'Token de investimento digital'}
                </p>
              </div>
              <div className="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                {token.image ? (
                  <ImageFromJSON 
                    src={token.image} 
                    alt={token.name}
                    width={400}
                    height={256}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <span className="text-gray-500 font-medium">Sem imagem</span>
                )}
              </div>
            </div>
          </div>

          {/* Destaques */}
          <div
            className="rounded-lg border-2 p-6"
            style={{
              backgroundColor: colors?.token['background'],
              borderColor: colors?.token['border'],
              borderWidth: '1px',
            }}
          >
            <h2
              className="text-2xl font-semibold mb-6"
              style={{ color: colors?.colors['color-primary'] }}
            >
              {tokenDetails?.highlights?.title}
            </h2>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 flex flex-col justify-between">
                <p
                  className="text-sm"
                  style={{ color: colors?.colors['color-secondary'] }}
                >
                  MeowlVerse is a groundbreaking project that combines the
                  whimsical spirit of memes with the transformative power of
                  blockchain technology. It represents more than just another
                  meme coin; it embodies creativity, innovation, and
                  community-driven collaboration. By leveraging the viral appeal
                  of memes, MeowlVerse creates an engaging and inclusive
                  platform for investors, gamers, and meme enthusiasts alike.
                </p>
                <button
                  className="mt-4 px-4 py-2 rounded-full cursor-pointer"
                  style={{
                    backgroundColor: colors?.background['background-highlight'],
                    color: colors?.colors['color-primary'],
                  }}
                >
                  {tokenDetails?.highlights?.['view-docs']}
                </button>
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <p
                  className="text-sm"
                  style={{ color: colors?.colors['color-secondary'] }}
                >
                  MeowlVerse features a token launchpad for new meme coins,
                  democratizing access to token launches and providing a
                  platform for emerging projects. It also includes an integrated
                  gaming platform with various meme-inspired games, where
                  players can stake Meowl tokens to participate and earn
                  rewards.
                </p>
                <button
                  className="mt-4 px-4 py-2 rounded-full cursor-pointer"
                  style={{
                    backgroundColor: colors?.background['background-highlight'],
                    color: colors?.colors['color-primary'],
                  }}
                >
                  {tokenDetails?.highlights?.['more-info']}
                </button>
              </div>
            </div>
          </div>

          {/* Abas */}
          <div>
            <div className="flex border-b border-gray-200 overflow-x-auto">
              <button
                onClick={() => setTab('info')}
                className="px-4 py-2 -mb-px font-medium whitespace-nowrap"
                style={{
                  borderBottom:
                    tab === 'info'
                      ? `2px solid ${colors?.colors['color-primary']}`
                      : 'none',
                  color:
                    tab === 'info'
                      ? colors?.colors['color-primary']
                      : colors?.colors['color-tertiary'],
                }}
              >
                {tokenDetails?.tabs?.infos?.title || 'Informações'}
              </button>
              <button
                onClick={() => setTab('tokenInfo')}
                className="px-4 py-2 -mb-px font-medium whitespace-nowrap"
                style={{
                  borderBottom:
                    tab === 'tokenInfo'
                      ? `2px solid ${colors?.colors['color-primary']}`
                      : 'none',
                  color:
                    tab === 'tokenInfo'
                      ? colors?.colors['color-primary']
                      : colors?.colors['color-tertiary'],
                }}
              >
                {tokenDetails?.tabs?.['token-info']?.title || 'Detalhes do Token'}
              </button>
              <button
                onClick={() => setTab('metrics')}
                className="px-4 py-2 -mb-px font-medium whitespace-nowrap"
                style={{
                  borderBottom:
                    tab === 'metrics'
                      ? `2px solid ${colors?.colors['color-primary']}`
                      : 'none',
                  color:
                    tab === 'metrics'
                      ? colors?.colors['color-primary']
                      : colors?.colors['color-tertiary'],
                }}
              >
                Métricas
              </button>
              <button
                onClick={() => setTab('documents')}
                className="px-4 py-2 -mb-px font-medium whitespace-nowrap"
                style={{
                  borderBottom:
                    tab === 'documents'
                      ? `2px solid ${colors?.colors['color-primary']}`
                      : 'none',
                  color:
                    tab === 'documents'
                      ? colors?.colors['color-primary']
                      : colors?.colors['color-tertiary'],
                }}
              >
                {tokenDetails?.tabs?.docs?.title || 'Documentos'}
              </button>
              <button
                onClick={() => setTab('benefits')}
                className="px-4 py-2 -mb-px font-medium whitespace-nowrap"
                style={{
                  borderBottom:
                    tab === 'benefits'
                      ? `2px solid ${colors?.colors['color-primary']}`
                      : 'none',
                  color:
                    tab === 'benefits'
                      ? colors?.colors['color-primary']
                      : colors?.colors['color-tertiary'],
                }}
              >
                {tokenDetails?.tabs?.benefits?.title || 'Benefícios'}
              </button>
            </div>
            <div className="mt-6 space-y-6">
              {tab === 'info' && (
                <section className="grid grid-cols-1 gap-6">
                  {/* Informações principais */}
                  <div
                    className="rounded-xl shadow-lg border p-6 "
                    style={{
                      backgroundColor: colors?.token['background'],
                      borderColor: colors?.token['border'],
                      borderWidth: '1px',
                    }}
                  >
                    <h2
                      className="text-2xl font-semibold mb-6"
                      style={{ color: colors?.colors['color-primary'] }}
                    >
                      {tokenDetails?.tabs?.infos?.title}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                      <div className="flex flex-col gap-2">
                        <span
                          className="text-sm font-medium"
                          style={{ color: colors?.colors['color-tertiary'] }}
                        >
                          {tokenDetails?.tabs?.infos?.['offer-opening']}
                        </span>
                        <p
                          className="font-semibold text-sm"
                          style={{ color: colors?.colors['color-primary'] }}
                        >
                          15/08/2025
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span
                          className="text-sm font-medium"
                          style={{ color: colors?.colors['color-tertiary'] }}
                        >
                          {tokenDetails?.tabs?.infos?.['identifier-code']}
                        </span>
                        <p
                          className="font-semibold text-sm"
                          style={{ color: colors?.colors['color-primary'] }}
                        >
                          BRBBSPPRO041
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span
                          className="text-sm font-medium"
                          style={{ color: colors?.colors['color-tertiary'] }}
                        >
                          {tokenDetails?.tabs?.infos?.['token-address'] || 'Endereço do Token'}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className="font-semibold text-sm font-mono"
                            style={{ color: colors?.colors['color-primary'] }}
                          >
                            {token.CardBlockchainData?.tokenAddress ? 
                              `${token.CardBlockchainData.tokenAddress.slice(0, 8)}...${token.CardBlockchainData.tokenAddress.slice(-6)}` :
                              'N/A'
                            }
                          </span>
                          {token.CardBlockchainData?.tokenAddress && (
                            <button
                              onClick={() => navigator.clipboard.writeText(token.CardBlockchainData?.tokenAddress || '')}
                              className="p-1 hover:bg-gray-100 rounded"
                              title="Copiar endereço"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span
                          className="text-sm font-medium"
                          style={{ color: colors?.colors['color-tertiary'] }}
                        >
                          {tokenDetails?.tabs?.infos?.['unit-value']}
                        </span>
                        <p
                          className="font-semibold text-sm"
                          style={{ color: colors?.colors['color-primary'] }}
                        >
                          $15
                        </p>
                      </div>
                      <div>
                        <span
                          className="text-sm font-medium"
                          style={{ color: colors?.colors['color-tertiary'] }}
                        >
                          {tokenDetails?.tabs?.infos?.['tons-offered']}
                        </span>
                        <p
                          className="font-semibold text-sm"
                          style={{ color: colors?.colors['color-primary'] }}
                        >
                          1.016.820,00
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span
                          className="text-sm font-medium"
                          style={{ color: colors?.colors['color-tertiary'] }}
                        >
                          {tokenDetails?.tabs?.infos?.['blockchain-link']}
                        </span>
                        <Link
                          href="#"
                          className="font-semibold text-sm"
                          style={{ color: colors?.colors['color-primary'] }}
                        >
                          Polygonscan
                        </Link>
                      </div>
                    </div>
                  </div>
                </section>
              )}
              {tab === 'tokenInfo' && (
                <div
                  className="rounded-xl shadow-lg border p-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
                  style={{
                    backgroundColor: colors?.token['background'],
                    borderColor: colors?.token['border'],
                    borderWidth: '1px',
                  }}
                >
                  {tokenInfoList.map((txt, idx) => (
                    <div
                      key={idx + txt}
                      className="flex items-start gap-2 w-full"
                    >
                      <span
                        className="w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full"
                        style={{
                          backgroundColor: colors?.colors['color-primary'],
                          color: '#FFFFFF',
                        }}
                      >
                        ✓
                      </span>
                      <p
                        className="text-base font-bold"
                        style={{ color: colors?.colors['color-primary'] }}
                      >
                        {txt}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {tab === 'metrics' && (
                <div className="space-y-6">
                  {/* Métricas em tempo real */}
                  <div
                    className="rounded-xl shadow-lg border p-6"
                    style={{
                      backgroundColor: colors?.token['background'],
                      borderColor: colors?.token['border'],
                      borderWidth: '1px',
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3
                        className="text-lg font-semibold"
                        style={{ color: colors?.colors['color-primary'] }}
                      >
                        Métricas do Token (24h)
                      </h3>
                      <button
                        onClick={refreshMetrics}
                        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                        disabled={metricsLoading}
                        title="Atualizar métricas"
                      >
                        <svg
                          className={`w-4 h-4 ${metricsLoading ? 'animate-spin' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      </button>
                    </div>

                    {metricsLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">Carregando métricas...</p>
                      </div>
                    ) : metricsError ? (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center">
                          <AlertCircle className="w-6 h-6 text-yellow-600" />
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Métricas não disponíveis</p>
                        <p className="text-xs text-gray-500">{metricsError}</p>
                      </div>
                    ) : stats ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg bg-gray-50 text-center">
                          <p className="text-sm text-gray-600 mb-1">Total de Tokens</p>
                          <p className="text-xl font-bold" style={{ color: colors?.colors['color-primary'] }}>
                            {stats.totalTokenTypes}
                          </p>
                        </div>
                        
                        <div className="p-4 rounded-lg bg-gray-50 text-center">
                          <p className="text-sm text-gray-600 mb-1">Valor Total</p>
                          <p className="text-xl font-bold" style={{ color: colors?.colors['color-primary'] }}>
                            {stats.totalValue}
                          </p>
                        </div>
                        
                        <div className="p-4 rounded-lg bg-gray-50 text-center">
                          <p className="text-sm text-gray-600 mb-1">Crescimento/Hora</p>
                          <p 
                            className="text-xl font-bold"
                            style={{ 
                              color: stats.hasPositiveGrowth ? '#10B981' : '#EF4444' 
                            }}
                          >
                            {stats.hasPositiveGrowth ? '+' : ''}{stats.averageGrowth?.toFixed(6) || '0'} 
                            <span className="text-sm ml-1">tokens/h</span>
                          </p>
                        </div>
                        
                        {stats.bestPerforming && (
                          <div className="sm:col-span-2 lg:col-span-3">
                            <div className="flex justify-between items-center p-4 rounded-lg bg-green-50 border border-green-200">
                              <span className="text-sm">Melhor Performance:</span>
                              <span className="font-semibold text-green-700">{stats.bestPerforming}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-sm text-gray-600">
                          Nenhuma métrica disponível para este token ainda.
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          As métricas começarão a ser coletadas após você adquirir o token.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Informações da blockchain */}
                  <div
                    className="rounded-xl shadow-lg border p-6"
                    style={{
                      backgroundColor: colors?.token['background'],
                      borderColor: colors?.token['border'],
                      borderWidth: '1px',
                    }}
                  >
                    <h3
                      className="text-lg font-semibold mb-4"
                      style={{ color: colors?.colors['color-primary'] }}
                    >
                      Informações da Blockchain
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Rede:</p>
                        <p className="font-medium">{token.CardBlockchainData?.tokenNetwork || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Símbolo:</p>
                        <p className="font-medium">{token.ticker || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Status:</p>
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: token.status === 'ACTIVE' ? '#10B98120' : '#EF444420',
                            color: token.status === 'ACTIVE' ? '#10B981' : '#EF4444',
                          }}
                        >
                          {token.status}
                        </span>
                      </div>
                      {token.CardBlockchainData?.tokenAddress && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Explorador:</p>
                          <Link
                            href={`https://${token.CardBlockchainData.tokenNetwork === 'matic' ? 'polygonscan' : 'etherscan'}.io/token/${token.CardBlockchainData.tokenAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm font-medium hover:opacity-80"
                            style={{ color: colors?.colors['color-primary'] }}
                          >
                            Ver no Explorer
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {tab === 'documents' && (
                <div
                  className="rounded-xl shadow-lg border p-6"
                  style={{
                    backgroundColor: colors?.token['background'],
                    borderColor: colors?.token['border'],
                    borderWidth: '1px',
                  }}
                >
                  <h4
                    className="font-semibold mb-4"
                    style={{ color: colors?.colors['color-primary'] }}
                  >
                    {tokenDetails?.tabs?.docs?.title}
                  </h4>
                  <ul className="space-y-2">
                    {documentsList.map((doc, idx) => (
                      <li key={idx + doc.title}>
                        <Link
                          href={doc.href}
                          className="text-sm font-medium"
                          style={{ color: colors?.colors['color-primary'] }}
                        >
                          {doc.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {tab === 'benefits' && (
                <div
                  className="rounded-xl shadow-lg border p-6"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderColor: colors?.token['border'],
                    borderWidth: '1px',
                  }}
                >
                  <div className="space-y-4">
                    <div>
                      <h4
                        className="font-semibold"
                        style={{ color: colors?.colors['color-primary'] }}
                      >
                        {tokenDetails?.tabs?.benefits?.['rights']}
                      </h4>
                      <p
                        className="text-sm"
                        style={{ color: colors?.colors['color-secondary'] }}
                      >
                        {rightsText}
                      </p>
                    </div>
                    <div>
                      <h4
                        className="font-semibold"
                        style={{ color: colors?.colors['color-primary'] }}
                      >
                        {tokenDetails?.tabs?.benefits?.['risks']}
                      </h4>
                      <p
                        className="text-sm"
                        style={{ color: colors?.colors['color-secondary'] }}
                      >
                        {risksText}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>
          
          {/* Coluna lateral - Tokens disponíveis (sticky) */}
          <div className="w-full lg:w-80 xl:w-96">
            <div className="lg:sticky lg:top-24">
              <div
                className="rounded-xl shadow-lg p-6 flex flex-col gap-3"
                style={{
                  backgroundColor: colors?.token['background'],
                  border: '2px solid transparent',
                  borderImage: `linear-gradient(90deg, ${colors?.border['border-primary']}, ${colors?.dashboard?.colors.highlight}) 1`,
                }}
              >
                <h3
                  className="text-lg font-bold mb-4"
                  style={{ color: colors?.colors['color-primary'] }}
                >
                  {tokenInfo?.['sold']}
                </h3>
            <ProgressBar sold={sold} total={total} />
            <div className="flex justify-between items-center mt-4">
              <span
                className="text-sm font-medium"
                style={{ color: colors?.colors['color-tertiary'] }}
              >
                {tokenInfo?.['token-price']}
              </span>
              <span
                className="font-bold text-sm"
                style={{ color: colors?.colors['color-primary'] }}
              >
                {formattedPrice}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span
                className="text-sm font-medium"
                style={{ color: colors?.colors['color-tertiary'] }}
              >
                {tokenInfo?.['minimum-investment']}
              </span>
              <span
                className="font-bold text-sm"
                style={{ color: colors?.colors['color-primary'] }}
              >
                R$ 100
              </span>
            </div>
            <button
              className="mt-4 w-full py-2 rounded-lg"
              style={{
                backgroundColor: colors?.colors['color-primary'],
                color: '#FFFFFF',
              }}
            >
              {tokenInfo?.['buy']}
            </button>
          </div>
          <div className="flex justify-center gap-2 text-xs text-gray-500 mt-2">
            <div className="flex items-start gap-2 w-4/5">
              <AlertCircle className="w-6 h-6 flex-shrink-0 mt-1" />
              <span className="text-sm">{tokenInfo?.['disclaimer']}</span>
            </div>
          </div>
            </div>
          </div>
        </div>
      </main>
    </MainLayout>
  )
}
