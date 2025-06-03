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

  const soldPercentage = total > 0 ? Math.round((sold / total) * 100) : 0

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
