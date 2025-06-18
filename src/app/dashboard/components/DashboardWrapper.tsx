'use client'

import WelcomeBox from './WelcomeBox'
import ChartBox from './ChartBox'
import AssetList from './AssetList'

export default function DashboardWrapper() {
  return (
    <div className="relative flex justify-center items-start pt-24">
      <div
        className="
          relative
          w-full
          max-w-[1610px]
          custom730:flex
          custom730:flex-col
          custom730:items-center
        "
        style={{
          minHeight: 'clamp(280px, 37vw, 599px)', // para o pai acomodar os dois
        }}
      >
        <WelcomeBox />
        <ChartBox />
        <AssetList />
      </div>
    </div>
  )
}
