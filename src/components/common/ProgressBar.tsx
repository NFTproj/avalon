import { ConfigContext } from '@/contexts/ConfigContext'
import { useContext } from 'react'

interface ProgressBarProps {
  sold: number
  total: number
}

export default function ProgressBar({
  sold,
  total,
}: Readonly<ProgressBarProps>) {
  const { colors } = useContext(ConfigContext)
  const progressBarColor = colors?.['progress-bar']?.['foreground'] ?? '#08CEFF'

  let soldPercentage = total > 0 ? Math.round((sold / total) * 100) : 0
  
  // Se tem tokens vendidos, garantir no mínimo 5% de preenchimento
  if (sold > 0 && soldPercentage < 5) {
    soldPercentage = 5
  }

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className="h-2.5 rounded-full"
        style={{
          width: `${soldPercentage}%`,
          backgroundColor: progressBarColor,
        }}
      />
    </div>
  )
}
