'use client'

import { ButtonHTMLAttributes, useContext } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'

interface CustomButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  color?: string        // sobrescreve o background
  textColor?: string    // sobrescreve a cor do texto
  borderColor?: string  // sobrescreve a cor da borda
}

const sizeMap = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

export default function CustomButton({
  text,
  size = 'md',
  fullWidth = false,
  color,
  textColor,
  borderColor,
  className = '',
  ...props
}: CustomButtonProps) {
  const { colors } = useContext(ConfigContext)

  const sizeClasses = sizeMap[size]
  const backgroundColor = color || colors?.buttons['button-primary']
  const finalTextColor = textColor || colors?.colors['color-primary'] || '#000000'
  const finalBorderColor = borderColor || colors?.border['border-primary'] || '#08CEFF'

  return (
    <button
    {...props}
    className={`
      rounded-xl border transition-all duration-200 ease-in-out
      hover:opacity-90 hover:scale-105 hover:brightness-110 hover:shadow-md cursor-pointer
      ${sizeClasses} 
      ${fullWidth ? 'w-full' : ''}
      ${className}
    `}
      style={{
        backgroundColor,
        color: finalTextColor,
        borderColor: finalBorderColor,
        ...props.style,
      }}
    >
      {text}
    </button>
  )
}
