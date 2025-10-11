'use client'

import WelcomeBox from './WelcomeBox'
import ChartBox from './ChartBox'
import AssetList from './AssetList'
import WalletInfo from './WalletInfo'
import TokenMetrics from './TokenMetrics'
import BalancesTable from './BalancesTable'

export default function DashboardWrapper() {
  return (
    <div className="relative flex justify-center items-start pt-16 sm:pt-20 lg:pt-24 px-4 sm:px-6 lg:px-8">
      <div
        className="
          relative
          w-full
          max-w-7xl
          mx-auto
          flex
          flex-col
          items-center
          space-y-6
        "
      >
        <WelcomeBox />
        <ChartBox />
        <BalancesTable />
        
        {/* Grid de informações da carteira e tokens */}
        <div className="w-full space-y-6">
          {/* Primeira linha - Wallet e Métricas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <WalletInfo showDetails={true} />
            <TokenMetrics />
          </div>
          
          {/* Segunda linha - Lista de Assets */}
          <div className="w-full">
            <AssetList />
          </div>
        </div>
      </div>
    </div>
  )
}
