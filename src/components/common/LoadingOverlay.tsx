'use client'

import { FC, useContext } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'

interface LoadingOverlayProps {
  /** Mensagem opcional (se não passar, o texto é omitido por padrão) */
  overrideMessage?: string
  /** Mostra o texto? default: false (mantém retrocompatibilidade) */
  showMessage?: boolean
  /** Opcional: classes extras no container */
  className?: string
}

const LoadingOverlay: FC<LoadingOverlayProps> = ({
  overrideMessage,
  showMessage = false,
  className,
}) => {
  const { colors, texts } = useContext(ConfigContext)

  const spinnerColor =
    colors?.border?.['border-primary'] || '#08CEFF'
  const textColor =
    colors?.colors?.['color-primary'] || '#0b1a2b'

  // Só usamos a mensagem default SE showMessage for true
  const defaultMessage = texts?.common?.loadingOverlay?.message || 'Carregando...'
  const finalMessage = overrideMessage ?? defaultMessage

  return (
    <div
      className={`absolute inset-0 z-50 flex flex-col items-center justify-center ${className || ''}`}
      style={{ backgroundColor: 'transparent' }}
      aria-busy="true"
      role="status"
    >
      <div
        className="w-12 h-12 border-4 rounded-full animate-spin mb-4"
        style={{
          borderTopColor: 'transparent',
          borderRightColor: spinnerColor,
          borderBottomColor: spinnerColor,
          borderLeftColor: spinnerColor,
        }}
      />
      {showMessage && (
        <p className="text-sm font-medium" style={{ color: textColor }}>
          {finalMessage}
        </p>
      )}
    </div>
  )
}

export default LoadingOverlay
