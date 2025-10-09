'use client'

import { useContext } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { ConfigContext } from '@/contexts/ConfigContext'

type Label = { name: string }

// Tipagem mínima: tudo opcional e sem `null` pra não tretar com TS
export type UiToken = {
  name?: string
  description?: string
  image?: string   // URL remota (ex.: Supabase)
}

type TokenHeaderProps = {
  token: UiToken
  labels: Label[]
  labelColors?: string[]
}

const DEFAULT_LABEL_COLORS = ['#8B7355', '#00D4AA', '#4CAF50']

export default function TokenHeader({
  token,
  labels,
  labelColors = DEFAULT_LABEL_COLORS,
}: TokenHeaderProps) {
  const router = useRouter()
  const { colors } = useContext(ConfigContext)

  const safeName = token?.name ?? 'TOKEN'
  const safeDesc = token?.description ?? 'Token de investimento digital'
  const img = token?.image // já vem pronto da page

  return (
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
          {!!labels.length && (
            <div className="flex gap-2 mb-4">
              {labels.map((label: Label, idx: number) => (
                <span
                  key={`${label.name}-${idx}`}
                  className="text-[10px] font-bold px-3 py-1 rounded-full border-2 border-black text-black"
                  style={{ backgroundColor: labelColors[idx % labelColors.length] }}
                >
                  {label.name}
                </span>
              ))}
            </div>
          )}

          <div className="mb-4">
            <h1
              className="text-2xl font-bold"
              style={{ color: colors?.colors['color-primary'] }}
            >
              {safeName}
            </h1>
            <p className="text-sm" style={{ color: colors?.colors['color-secondary'] }}>
              {safeDesc}
            </p>
          </div>

          <div className="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
            {img ? (
              <img
                src={img}
                alt={safeName}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <span className="text-gray-500 font-medium">Sem imagem</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
