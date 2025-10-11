"use client"

import { useMemo, useContext, useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { ConfigContext } from "@/contexts/ConfigContext"
import { useUserTokenBalances } from "@/hooks/useUserTokenBalances"
import { getAllCards } from "@/lib/api/cards"
import { Card } from "@/types/card"

interface BalanceItem {
  id: string
  name: string
  ticker?: string
  logoUrl?: string
  CardBlockchainData?: {
    tokenAddress?: string
    tokenNetwork?: string
    tokenChainId?: number
    tokenPrice?: string
  }
  balance: number
}

export default function BalancesTable({ className = "" }: { className?: string }) {
  const { colors } = useContext(ConfigContext)
  const { user } = useAuth()
  const [cards, setCards] = useState<Card[]>([])
  const [loadingCards, setLoadingCards] = useState(true)

  // Buscar cards da API
  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoadingCards(true)
        const response = await getAllCards()
        if (response.data && Array.isArray(response.data)) {
          const validCards = response.data
            .filter((card: any) => card.cardBlockchainData?.tokenAddress)
            .map((card: any) => ({
              id: card.id,
              name: card.name,
              status: card.status as 'ACTIVE' | 'INACTIVE',
              CardBlockchainData: {
                tokenAddress: card.cardBlockchainData.tokenAddress as `0x${string}`,
                tokenNetwork: card.cardBlockchainData.network || 'polygon',
                tokenChainId: card.cardBlockchainData.tokenChainId || 137,
                tokenPrice: String(card.cardBlockchainData.tokenPrice || '1.00'),
              }
            }))
          setCards(validCards)
        }
      } catch (error) {
        console.error('Erro ao buscar cards:', error)
      } finally {
        setLoadingCards(false)
      }
    }

    fetchCards()
  }, [])

  // Buscar saldos reais da blockchain
  const { assets, loading: loadingBalances } = useUserTokenBalances(
    cards,
    user?.walletAddress as `0x${string}` | undefined
  )

  // Converter assets para o formato esperado pela tabela
  const balances = useMemo<BalanceItem[]>(() => {
    if (!assets || assets.length === 0) return []
    
    return assets
      .filter(asset => {
        const balance = Number(asset.balanceRaw) / Math.pow(10, asset.decimals)
        return balance > 0 // Mostrar apenas tokens com saldo
      })
      .map(asset => {
        const balance = Number(asset.balanceRaw) / Math.pow(10, asset.decimals)
        
        // Buscar informações adicionais do card original
        const apiCard = cards.find(c => c.id === asset.card.id)
        
        return {
          id: asset.card.id,
          name: asset.card.name,
          ticker: asset.symbol,
          logoUrl: (apiCard as any)?.logoUrl,
          CardBlockchainData: asset.card.CardBlockchainData,
          balance: balance
        }
      })
  }, [assets, cards])

  // Paginação simples client-side
  const [page, setPage] = useState(1)
  const pageSize = 5
  const totalPages = Math.max(1, Math.ceil(balances.length / pageSize))
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return balances.slice(start, start + pageSize)
  }, [balances, page])

  const headerBgColor = colors?.dashboard?.background?.['table-header'] ?? '#f8f7e9'
  const tableBodyBgColor = colors?.dashboard?.background?.['table-body'] ?? '#fdfcf7'
  const headerTextColor = colors?.dashboard?.colors?.text ?? '#404040'
  const tableTextColor = colors?.dashboard?.colors?.['table-text'] ?? '#404040'
  const highlightColor = colors?.dashboard?.colors?.highlight ?? '#00ffe1'

  // Estilos solicitados
  const slabHeaderBg = 'rgba(64, 64, 64, 0.8)' // #404040 com 80% de opacidade
  const slabHeaderTextColor = '#FFFFFF'
  const tableHeaderBg = 'rgba(64, 64, 64, 0.15)' // mesma cor com ~15%
  const tableBodyBg = '#FFFFF2'

  const isLoading = loadingCards || loadingBalances

  if (!user) {
    return (
      <div className={`w-full ${className}`}>
        <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200 text-center">
          <p className="text-sm text-gray-600">Faça login para ver seus balances.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200 text-center">
          <p className="text-sm text-gray-600">Carregando seus tokens...</p>
        </div>
      </div>
    )
  }

  if (!balances || balances.length === 0) {
    return (
      <div className={`w-full ${className}`}>
        <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200 text-center">
          <p className="text-sm text-gray-600">Você ainda não possui tokens na sua carteira.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full mt-8 ${className}`}>
      {/* Cabeçalho "Sua carteira Slab" */}
      <div className="mb-0">
        <div
          className="rounded-t-[15px] h-[100px] flex items-center px-6"
          style={{ background: slabHeaderBg, color: slabHeaderTextColor }}
        >
          <h2 className="text-xl sm:text-2xl font-bold">
            Sua carteira <span style={{ color: highlightColor }}>Slab</span>
          </h2>
        </div>
      </div>

      {/* Wrapper com rolagem horizontal para evitar quebra/overlay em telas pequenas */}
      <div className="w-full overflow-x-auto rounded-b-[15px] border-x border-b border-gray-200">
        <table className="min-w-[720px] w-full table-fixed">
          <thead style={{ background: tableHeaderBg, color: headerTextColor }}>
            <tr>
              <th className="w-[45%] pl-0 pr-6 py-3 text-left font-semibold">Projeto</th>
              <th className="w-[20%] px-6 py-3 text-left font-semibold">Valor unitário</th>
              <th className="w-[25%] px-6 py-3 text-left font-semibold">Valor Total</th>
              <th className="w-[10%] px-6 py-3 text-right font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody style={{ color: tableTextColor, background: tableBodyBg }}>
            {paginated.map((b, idx) => {
              const price = parseFloat(b.CardBlockchainData?.tokenPrice ?? '0') || 0
              const total = price > 0 ? b.balance * price : b.balance

              const formatBRL = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)

              return (
                <tr key={`${b.id}-${idx}`} className="border-t border-gray-200 align-middle">
                  {/* Projeto */}
                  <td className="pl-0 pr-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-[173px] h-[114px] bg-gray-200 rounded-tr-[15px] rounded-br-[15px] overflow-hidden flex-shrink-0">
                        {b.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={b.logoUrl} alt={b.name} className="w-full h-full object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{b.name}</div>
                        <div className="text-xs text-gray-500 truncate">#{b.ticker ?? '—'}</div>
                      </div>
                    </div>
                  </td>

                  {/* Valor unitário */}
                  <td className="px-6 py-4 text-gray-700 whitespace-nowrap">{formatBRL(price)}</td>

                  {/* Valor Total */}
                  <td className="px-6 py-4 text-gray-700 whitespace-nowrap">{formatBRL(total)}</td>

                  {/* Ações */}
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-3 whitespace-nowrap">
                      <button className="text-sm hover:underline" style={{ color: tableTextColor }}>Comprar</button>
                      <button className="text-sm hover:underline" style={{ color: tableTextColor }}>Vender</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Paginação */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-300" style={{ color: tableTextColor }}>
          <div className="text-sm">Página {page} de {totalPages}</div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Anterior
            </button>
            <button
              className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              Próximo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}