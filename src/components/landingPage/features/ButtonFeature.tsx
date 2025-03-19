'use client'

import { ConfigContext } from '@/contexts/ConfigContext'
import { cn } from '@/utils/cn'
import { useContext } from 'react'

interface ButtonFeatureProps {
  text?: string
  className?: string
}
function ButtonFeature({ text, className = '' }: ButtonFeatureProps) {
  const { colors } = useContext(ConfigContext)
  return (
    <div
      className={cn('flex items-center gap-4 p-2 rounded-md', {
        [className]: className,
      })}
      style={{
        backgroundColor: colors?.background['background-tertiary'],
      }}
    >
      <span className="cursor-default">{text}</span>
    </div>
  )
}

export default ButtonFeature
