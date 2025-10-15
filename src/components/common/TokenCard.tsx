import React, { useContext, useCallback, useMemo } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import ImageFromJSON from '../core/ImageFromJSON'
import ProgressBar from './ProgressBar'
import { Card as APICard } from '@/lib/api/cards'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface TokenCardProps {
  card: APICard
  price?: string
  launchDate?: string
  tokensAvailable?: string
  identifierCode?: string
  labels?: Array<{ name: string; color?: string }>
  sold?: number
  total?: number
  unitValue?: number
  totalValue?: number
  userBalance?: number
  profitability?: number
  lastPayDate?: string
  onBuy?: () => void
  onSell?: () => void
  onClick?: () => void
  buyText?: string
  sellText?: string
  showActions?: boolean
}

export default function TokenCard({
  card,
  price,
  launchDate,
  tokensAvailable,
  identifierCode,
  labels = [],
  sold = 0,
  total = 0,
  unitValue,
  totalValue,
  userBalance = 0,
  profitability,
  lastPayDate,
  onBuy,
  onSell,
  onClick,
  buyText = 'Comprar',
  sellText = 'Vender',
  showActions = false,
}: TokenCardProps) {
  const { colors, texts } = useContext(ConfigContext)
  const router = useRouter()

  const cardBgColor = colors?.token?.background ?? '#FFFFFF'
  const headerBgColor = colors?.token?.header ?? '#FBFBFB'
  const textColor = colors?.token?.text ?? '#000000'
  const secondaryTextColor = colors?.colors?.['color-tertiary'] ?? '#555859'
  const borderColor = colors?.token?.border ?? '#E5E5E5'

  const defaultLabelColors = ['#8B7355', '#00D4AA', '#4CAF50']

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    
    if (onClick) {
      onClick()
    } else {
      router.push(`/tokens/${card.id}`)
    }
  }, [onClick, router, card.id])

  const handleActionClick = useCallback((action: () => void) => (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    action()
  }, [])

  const progressPercentage = useMemo(() => 
    total > 0 ? (sold / total) * 100 : 0
  , [sold, total])

  const formattedPrice = useMemo(() => {
    if (price) return price.includes('$') ? price : `$ ${price}`
    if (unitValue && unitValue > 0) return `$ ${unitValue.toFixed(2)}`
    // Usar a estrutura correta da API que pode ter tanto CardBlockchainData quanto cardBlockchainData
    const blockchainData = (card as any).CardBlockchainData || (card as any).cardBlockchainData
    if (blockchainData?.tokenPrice) return `$ ${parseFloat(blockchainData.tokenPrice).toFixed(2)}`
    return 'Indisponível'
  }, [price, unitValue, card])

  const tokenTexts = texts?.token

  return (
    <div
      className="rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] h-full cursor-pointer"
      style={{
        backgroundColor: cardBgColor,
        borderColor: borderColor,
        borderWidth: '1px',
      }}
      onClick={handleCardClick}
    >
      {/* Header do Card */}
      <div
        className="flex items-start justify-between w-full border-b border-gray-200 p-6 rounded-t-xl"
        style={{
          backgroundColor: headerBgColor,
        }}
      >


        <div className="flex justify-between gap-3 w-full">
          <div className="flex flex-col justify-end  gap-2">
            <h3
              className="font-bold text-lg leading-tight"
              style={{ color: textColor }}
            >
              {card.name || 'TOKEN TBIO'}
            </h3>
            <p
              className="font-light text-sm leading-relaxed"
              style={{ color: textColor }}
            >
              {card.description || `Descrição do token ${card.name}`}
            </p>

            {labels && labels.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {labels.map((label, index) => (
                  <span
                    key={`${label.name}-${index}`}
                    className="text-[10px] font-bold px-2 py-1 rounded-full border-2 border-black text-black uppercase"
                    style={{
                      backgroundColor: label.color || defaultLabelColors[index % defaultLabelColors.length],
                    }}
                  >
                    {label.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="w-full h-full flex items-center justify-center">
            {/* Prioridade: logoUrl -> cardBackgroundUrl -> image -> fallback */}
            {(card as any).logoUrl ? (
              <img
                src={(card as any).logoUrl}
                alt={card.name}
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                  if (fallback) {
                    fallback.classList.remove('hidden');
                  }
                }}
              />
            ) : (card as any).cardBackgroundUrl ? (
              <img
                src={(card as any).cardBackgroundUrl}
                alt={card.name}
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                  if (fallback) {
                    fallback.classList.remove('hidden');
                  }
                }}
              />
            ) : null}
            
            <div className={`fallback-icon w-full h-full rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center ${((card as any).logoUrl || (card as any).cardBackgroundUrl || (card as any).image) ? 'hidden' : ''}`}>
              <ImageFromJSON
                src="icons/bloxify/tokenization.svg"
                alt="Token"
                width={80}
                height={80}
                className="text-white"
                fillColor="#FFFFFF"
              />
            </div>
          </div>
        </div>


      </div>

      {/* Informações do Token */}
      <div className="flex flex-col gap-6 p-6">
        <div className="flex justify-between items-center">
          <span
            className="text-sm font-medium"
            style={{ color: secondaryTextColor }}
          >
            {tokenTexts?.['token-price'] || 'Preço do Token'}
          </span>
          <span
            className="font-bold text-sm"
            style={{ color: textColor }}
          >
            {formattedPrice}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span
            className="text-sm font-medium"
            style={{ color: secondaryTextColor }}
          >
            {tokenTexts?.['launch-date'] || 'Data de lançamento'}
          </span>
          <span
            className="font-semibold text-sm"
            style={{ color: textColor }}
          >
            {launchDate || ((card as any).launchDate ? new Date((card as any).launchDate).toLocaleDateString('pt-BR') : 'A definir')}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span
            className="text-sm font-medium"
            style={{ color: secondaryTextColor }}
          >
            {tokenTexts?.['available'] || 'Tokens disponíveis'}
          </span>
          <span
            className="font-semibold text-sm"
            style={{ color: textColor }}
          >
            {tokensAvailable || (total > 0 ? 
              Intl.NumberFormat('pt-BR', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 0,
              }).format(total - sold) : 'A definir')
            }
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span
            className="text-sm font-medium"
            style={{ color: secondaryTextColor }}
          >
            {'Código identificador'}
          </span>
          <span
            className="font-bold text-sm"
            style={{ color: textColor }}
          >
            {identifierCode || (card as any).ticker || card.id.substring(0, 8).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Linha divisória */}
      <div
        className="w-full h-px"
        style={{
          backgroundColor: colors?.colors?.['color-quintenary'] ?? '#e5e3e3',
        }}
      />

      <div className="flex flex-col gap-2 p-6 text-black">
        {/* Barra de Progresso */}
        <div className="flex justify-between items-center">
          <span
            className="text-sm font-black"
            style={{
              color: secondaryTextColor,
            }}
          >
            <span className="font-bold">
              {tokenTexts?.['progress-bar']?.['sold'] || 'Vendidos'}:
            </span>{' '}
            <span className="font-bold text-sm text-black">
              {sold > 0 ? Intl.NumberFormat('pt-BR').format(sold) : '0'}
            </span>
          </span>
        </div>
        <ProgressBar sold={sold} total={total} />
        <div className="flex justify-between items-center">
          <span
            className="text-sm font-bold"
            style={{
              color: secondaryTextColor,
            }}
          >
            {tokenTexts?.['progress-bar']?.['available'] || 'Disponíveis'}:{' '}
            <span className="font-bold text-sm text-black">
              {total > 0 ? Intl.NumberFormat('pt-BR').format(total - sold) : '0'}
            </span>
          </span>
        </div>
        
        {/* Link Ver detalhes */}
        <Link
          href={`/tokens/${card.id}`}
          className="text-sm font-medium text-gray-500 hover:text-blue-800 underline transition-colors flex justify-end cursor-pointer mt-3 "
          onClick={(e) => e.stopPropagation()}
        >
          Ver detalhes
        </Link>
      </div>
    </div>
  )
}