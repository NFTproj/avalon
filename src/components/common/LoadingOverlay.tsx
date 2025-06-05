'use client'

import { FC, useContext } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'

interface LoadingOverlayProps {
  overrideMessage?: string
}

const LoadingOverlay: FC<LoadingOverlayProps> = ({ overrideMessage }) => {
  const { colors, texts } = useContext(ConfigContext)

  // Spinner color (por ex., cor de borda do JSON)
  const spinnerColor = colors?.border?.['border-primary'] || '#08CEFF'

  // Texto do JSON
  const defaultMessage = texts?.common?.loadingOverlay?.message || 'Carregando...'
  const finalMessage = overrideMessage || defaultMessage

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center"
      style={{ backgroundColor: 'transparent' }} // fundo transparente
    >
      {/* Spinner pintado com spinnerColor */}
      <div
        className="w-12 h-12 border-4 rounded-full animate-spin mb-4"
        style={{
          borderColor: spinnerColor,      // cor da borda em geral
          borderTopColor: 'transparent',  // deixa o topo transparente
        }}
      />
      {/* Texto com cor do JSON (ex.: color-primary) */}
     
    </div>
  )
}

export default LoadingOverlay
