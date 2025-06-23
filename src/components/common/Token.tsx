'use client'

import { useContext } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import ImageFromJSON from '../core/ImageFromJSON'
import ProgressBar from './ProgressBar'

interface TokenProps {
  name: string
  subtitle: string
  price: string
  launchDate?: string
  tokensAvailable?: string
  identifierCode?: string
  image?: string
  labels?: {
    name: string
  }[]
  sold: number
  total: number
}

function Token({
  name,
  subtitle,
  price,
  launchDate,
  tokensAvailable,
  identifierCode,
  image,
  labels,
  sold,
  total,
}: Readonly<TokenProps>) {
  const { colors, texts } = useContext(ConfigContext)
  const formattedPrice = `$ ${Number(price).toFixed(2).replace('.', ',')}`
  const labelColors = ['#8B7355', '#00D4AA', '#4CAF50']
  const token = texts?.['token']

  return (
    <div
      className={`rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] h-full`}
      style={{
        backgroundColor: colors?.token['background'] ?? '#FFFFFF',
        borderColor: colors?.token['border'] ?? '#E5E5E5',
        borderWidth: '1px',
      }}
    >
      {/* Header do Card */}
      <div
        className="flex items-start justify-between w-full border-b border-gray-200 p-6 rounded-t-xl"
        style={{
          backgroundColor: colors?.token['header'] ?? '#FBFBFB',
        }}
      >
        <div className="flex justify-between gap-3 w-full">
          <div className="flex flex-col justify-end gap-2">
            <h3
              className="font-bold text-lg leading-tight"
              style={{ color: colors?.token['text'] ?? '#000000' }}
            >
              {name}
            </h3>
            <p
              className="font-bold text-sm leading-relaxed "
              style={{ color: colors?.token['text'] ?? '#000000' }}
            >
              {subtitle}
            </p>

            {labels && (
              <div className="flex gap-2">
                {labels.map((label, index) => (
                  <span
                    key={label.name}
                    className="text-[10px] font-bold px-2 py-1 rounded-full border-2 border-black text-black"
                    style={{
                      backgroundColor: labelColors[index % labelColors.length],
                    }}
                  >
                    {label.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="w-20">
            <ImageFromJSON
              src={image}
              alt={name}
              width={10800}
              height={10800}
              className="rounded-full w-full"
            />
          </div>
        </div>
      </div>

      {/* Informações do Token */}
      <div className="flex flex-col gap-6 p-6">
        <div className="flex justify-between items-center">
          <span
            className="text-sm font-medium"
            style={{ color: colors?.colors?.['color-tertiary'] ?? '#555859' }}
          >
            {token?.['token-price']}
          </span>
          <span
            className="font-bold text-sm"
            style={{ color: colors?.colors?.['color-primary'] ?? '#202020' }}
          >
            {formattedPrice}
          </span>
        </div>

        {launchDate && (
          <div className="flex justify-between items-center">
            <span
              className="text-sm font-medium"
              style={{ color: colors?.colors?.['color-tertiary'] ?? '#555859' }}
            >
              {token?.['launch-date']}
            </span>
            <span
              className="font-semibold text-sm"
              style={{ color: colors?.colors?.['color-primary'] ?? '#202020' }}
            >
              {launchDate}
            </span>
          </div>
        )}

        {tokensAvailable && (
          <div className="flex justify-between items-center">
            <span
              className="text-sm font-medium"
              style={{ color: colors?.colors?.['color-tertiary'] ?? '#555859' }}
            >
              {token?.['sold']}
            </span>
            <span
              className="font-semibold text-sm"
              style={{ color: colors?.colors?.['color-primary'] ?? '#202020' }}
            >
              {Intl.NumberFormat('pt-BR', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              }).format(Number(tokensAvailable))}
            </span>
          </div>
        )}

        {identifierCode && (
          <div className="flex justify-between items-center">
            <span
              className="text-sm font-medium"
              style={{ color: colors?.colors?.['color-tertiary'] ?? '#555859' }}
            >
              {token?.['available']}
            </span>
            <span
              className="font-bold text-sm"
              style={{ color: colors?.colors?.['color-primary'] ?? '#202020' }}
            >
              {identifierCode}
            </span>
          </div>
        )}
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
              color: colors?.colors?.['color-tertiary'] ?? '#555859',
            }}
          >
            <span className="font-bold ">
              {token?.['progress-bar']['sold']}:
            </span>{' '}
            <span className="font-bold text-sm text-black">{sold}</span>
          </span>
        </div>
        <ProgressBar sold={sold} total={total} />
        <div className="flex justify-between items-center">
          <span
            className="text-sm font-bold"
            style={{
              color: colors?.colors?.['color-tertiary'] ?? '#555859',
            }}
          >
            {token?.['progress-bar']['available']}:{' '}
            <span className="font-bold text-sm text-black">{total - sold}</span>
          </span>
        </div>
      </div>
    </div>
  )
}

export default Token
