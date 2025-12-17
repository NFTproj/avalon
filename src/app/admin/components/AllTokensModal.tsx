'use client'

import { useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ConfigContext } from '@/contexts/ConfigContext'
import CustomInput from '@/components/core/Inputs/CustomInput'
import { FaSync, FaTimes, FaSearch, FaEdit } from 'react-icons/fa'
import { getAllCards, Card } from '@/lib/api/cards'
import LoadingOverlay from '@/components/common/LoadingOverlay'

//

interface AllTokensModalProps {
  isOpen: boolean // Se o modal está aberto
  onClose: () => void // Função para fechar o modal
}

// ============================================================================
// COMPONENTE
// ============================================================================

export default function AllTokensModal({
  isOpen,
  onClose,
}: AllTokensModalProps) {
  // Contextos e hooks
  const { colors, texts } = useContext(ConfigContext)
  const router = useRouter()

  // Helper para buscar textos de tradução
  const adminTexts = (texts as any)?.admin
  const getAdminText = (key: string, fallback: string) => {
    if (!adminTexts) return fallback
    const keys = key.split('.')
    let value = adminTexts
    for (const k of keys) {
      value = value?.[k]
      if (value === undefined || value === null) {
        return fallback
      }
    }
    return value || fallback
  }

  // Estados do componente
  const [tokens, setTokens] = useState<Card[]>([]) // Lista completa de tokens
  const [filteredTokens, setFilteredTokens] = useState<Card[]>([]) // Lista filtrada pela pesquisa
  const [loading, setLoading] = useState(true) // Estado de carregamento
  const [searchTerm, setSearchTerm] = useState('') // Termo de pesquisa atual

  // ============================================================================
  // FUNÇÕES
  // ============================================================================

  /**
   * Busca todos os tokens da API
   * Ordena por data de criação (mais recentes primeiro)
   */
  const fetchTokens = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getAllCards()

      if (response.data && Array.isArray(response.data)) {
        // Ordenar por data de criação (mais recentes primeiro)
        const sortedTokens = [...response.data].sort((a, b) => {
          const dateA = new Date(a.createdAt || a.updatedAt || 0).getTime()
          const dateB = new Date(b.createdAt || b.updatedAt || 0).getTime()
          return dateB - dateA
        })

        setTokens(sortedTokens)
        setFilteredTokens(sortedTokens)
      }
    } catch (error) {
      console.error('Erro ao buscar tokens:', error)
      setTokens([])
      setFilteredTokens([])
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Redireciona para a página de edição do token
   * @param tokenId - ID do token a ser editado
   */
  const handleEdit = (tokenId: string) => {
    // Fecha o modal
    onClose()

    // Navega para a página de edição com o ID do token
    router.push(`/admin?page=edittoken&id=${tokenId}`)
  }

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Busca tokens quando o modal é aberto
   * Limpa o termo de pesquisa ao abrir
   */
  useEffect(() => {
    if (isOpen) {
      fetchTokens()
      setSearchTerm('')
    }
  }, [isOpen, fetchTokens])

  /**
   * Filtra tokens em tempo real baseado no termo de pesquisa
   * Busca por: nome, ticker ou descrição
   */
  useEffect(() => {
    if (!searchTerm.trim()) {
      // Se não há busca, mostra todos os tokens
      setFilteredTokens(tokens)
    } else {
      // Filtra tokens que contém o termo de pesquisa
      const filtered = tokens.filter((token) => {
        const searchLower = searchTerm.toLowerCase()
        return (
          token.name?.toLowerCase().includes(searchLower) ||
          token.ticker?.toLowerCase().includes(searchLower) ||
          token.description?.toLowerCase().includes(searchLower)
        )
      })
      setFilteredTokens(filtered)
    }
  }, [searchTerm, tokens])

  /**
   * Gerencia eventos do modal
   * - Fecha ao pressionar ESC
   * - Bloqueia scroll do body quando aberto
   */
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      // Adiciona listener de ESC
      window.addEventListener('keydown', handleEsc)
      // Bloqueia scroll do body
      document.body.style.overflow = 'hidden'
    }

    // Cleanup: remove listener e restaura scroll
    return () => {
      window.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // Se modal não está aberto, não renderiza nada
  if (!isOpen) return null

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop - Fundo escuro semitransparente */}
      <div
        className="fixed inset-0 bg-black transition-opacity"
        style={{ opacity: 0.5 }}
        onClick={onClose}
      />

      {/* Container do Modal */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="flex items-center justify-center min-h-full p-4">
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()} // Previne fechar ao clicar no modal
          >
            {/* ============================================================
                HEADER - Título, botão atualizar e fechar
            ============================================================ */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-black">
                  {getAdminText('all-tokens.title', 'Todos os Tokens')}
                </h2>
                <button
                  onClick={() => fetchTokens()}
                  disabled={loading}
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors duration-200 disabled:opacity-50 cursor-pointer"
                  title={getAdminText(
                    'all-tokens.refresh-button',
                    'Atualizar lista',
                  )}
                >
                  <FaSync
                    className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                  />
                </button>
              </div>

              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 cursor-pointer"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>

            {/* ============================================================
                BARRA DE PESQUISA - Input para filtrar tokens
            ============================================================ */}
            <div className="px-6 pt-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <FaSearch className="w-5 h-5 text-gray-400" />
                </div>
                <CustomInput
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={getAdminText(
                    'all-tokens.search-placeholder',
                    'Pesquisar por nome, ticker ou descrição...',
                  )}
                  className="w-full h-12 pl-12 pr-4 text-base border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                />
              </div>
            </div>

            {/* ============================================================
                CONTADOR - Mostra quantos tokens estão sendo exibidos
            ============================================================ */}
            <div className="px-6 pt-4">
              <p className="text-sm text-gray-600">
                {loading ? (
                  getAdminText('all-tokens.loading-count', 'Carregando...')
                ) : (
                  <>
                    {getAdminText('all-tokens.showing', 'Exibindo')}{' '}
                    <span className="font-bold">{filteredTokens.length}</span>{' '}
                    {getAdminText('all-tokens.of', 'de')}{' '}
                    <span className="font-bold">{tokens.length}</span>{' '}
                    {getAdminText('all-tokens.tokens', 'tokens')}
                  </>
                )}
              </p>
            </div>

            {/* ============================================================
                LISTA DE TOKENS - Área scrollável com todos os tokens
            ============================================================ */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-3 relative">
                {/* Estado: Carregando */}
                {loading ? (
                  <div className="relative min-h-[300px]">
                    <LoadingOverlay
                      overrideMessage={getAdminText(
                        'all-tokens.loading',
                        'Carregando tokens...',
                      )}
                      showMessage={true}
                    />
                  </div>
                ) : /* Estado: Nenhum token encontrado */ filteredTokens.length ===
                  0 ? (
                  <div className="text-center py-12 text-gray-500">
                    {searchTerm ? (
                      /* Mensagem quando a pesquisa não retorna resultados */
                      <>
                        <p className="text-lg font-medium mb-2">
                          {getAdminText(
                            'all-tokens.no-results',
                            'Nenhum token encontrado',
                          )}
                        </p>
                        <p className="text-sm">
                          {getAdminText(
                            'all-tokens.no-results-description',
                            'Tente usar termos de pesquisa diferentes',
                          )}
                        </p>
                      </>
                    ) : (
                      /* Mensagem quando não há tokens criados */
                      <p>
                        {getAdminText(
                          'all-tokens.no-tokens',
                          'Nenhum token criado ainda',
                        )}
                      </p>
                    )}
                  </div>
                ) : (
                  /* Lista de tokens */
                  filteredTokens.map((token) => (
                    <div
                      key={token.id}
                      className="flex justify-between items-center p-5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 border border-gray-200"
                    >
                      {/* Informações do token */}
                      <div className="flex-1 min-w-0">
                        {/* Nome e ticker */}
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-base font-bold text-gray-900 truncate">
                            {token.name}
                          </span>
                          {token.ticker && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                              {token.ticker}
                            </span>
                          )}
                        </div>

                        {/* Descrição */}
                        {token.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {token.description}
                          </p>
                        )}

                        {/* Metadata: data de criação e blockchain */}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {token.createdAt && (
                            <span>
                              {getAdminText(
                                'all-tokens.created-at',
                                'Criado em',
                              )}
                              :{' '}
                              {new Date(token.createdAt).toLocaleDateString(
                                'pt-BR',
                              )}
                            </span>
                          )}
                          {token.cardBlockchainData?.network && (
                            <span>
                              Blockchain: {token.cardBlockchainData.network}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Ações: Status e botão de editar */}
                      <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                        {/* Badge de status */}
                        <span className="px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {getAdminText('all-tokens.status.active', 'Ativo')}
                        </span>

                        {/* Botão de editar */}
                        <button
                          onClick={() => handleEdit(token.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors duration-200 cursor-pointer"
                          title={getAdminText(
                            'all-tokens.edit-button',
                            'Editar token',
                          )}
                        >
                          <FaEdit className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {getAdminText('all-tokens.edit', 'Editar')}
                          </span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ============================================================
                FOOTER - Botão de fechar modal
            ============================================================ */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors duration-200 cursor-pointer"
              >
                {getAdminText('all-tokens.close-button', 'Fechar')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
