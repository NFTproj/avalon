'use client'

import { useContext } from 'react'
import { useRouter } from 'next/navigation'
import { ConfigContext } from '@/contexts/ConfigContext'
import { MdShoppingCart } from 'react-icons/md'
import {
  AiFillFileText,
  AiFillWallet,
  AiFillProfile,
  AiFillCheckCircle,
} from 'react-icons/ai'

export default function ChartBox() {
  const { texts, colors } = useContext(ConfigContext)
  const borderColor = colors?.dashboard?.buttons?.['action-border'] || '#00ffe1'
  const iconColor = '#00838F'
  const router = useRouter()

  const actionButtons = [
    { id: 1, name: 'Buy', icon: <MdShoppingCart size={22} color={iconColor} /> },
    { id: 2, name: 'Earnings', icon: <AiFillFileText size={22} color={iconColor} /> },
    { id: 3, name: 'Withdraw', icon: <AiFillWallet size={22} color={iconColor} /> },
    { id: 4, name: 'Statements', icon: <AiFillProfile size={22} color={iconColor} /> },
    { id: 5, name: 'Verify Identity', icon: <AiFillCheckCircle size={22} color={iconColor} /> },
  ]

  const handleClick = (id: number) => {
    switch (id) {
      case 1:
        router.push('/tokens')
        break
      case 5:
        router.push('/kyc')
        break
      // você pode adicionar outras rotas conforme necessário
    }
  }

  return (
    <div className="mt-6 w-full">
      <div className="flex lg:hidden overflow-x-auto gap-3 px-2 scrollbar-hide">
        {actionButtons.map((button) => (
          <div
            key={button.id}
            onClick={() => handleClick(button.id)}
            className="shrink-0 w-[7rem] sm:w-[8rem] md:w-[8.5rem] h-20 bg-white rounded-md cursor-pointer hover:bg-gray-50 transition-colors px-2 py-2"
            style={{ border: `2px solid ${borderColor}` }}
          >
            <div className="flex flex-col items-start justify-center h-full">
              <div className="mb-1">{button.icon}</div>
              <p className="text-[#404040] text-xs leading-tight">{button.name}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden lg:flex lg:justify-center lg:gap-4">
        {actionButtons.map((button) => (
          <div
            key={button.id}
            onClick={() => handleClick(button.id)}
            className="w-48 h-24 bg-white rounded-md cursor-pointer hover:bg-gray-50 transition-colors px-4 py-3"
            style={{ border: `2px solid ${borderColor}` }}
          >
            <div className="flex flex-col items-start justify-center h-full">
              <div className="mb-1">
                {(() => {
                  switch (button.id) {
                    case 1: return <MdShoppingCart size={30} color={iconColor} />
                    case 2: return <AiFillFileText size={30} color={iconColor} />
                    case 3: return <AiFillWallet size={30} color={iconColor} />
                    case 4: return <AiFillProfile size={30} color={iconColor} />
                    case 5: return <AiFillCheckCircle size={30} color={iconColor} />
                  }
                })()}
              </div>
              <p className="text-[#404040] text-sm">{button.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
