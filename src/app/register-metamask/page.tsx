'use client'

import Header from '@/components/landingPage/Header'
import MetamaskSteps from './MetamaskSteps'
import { useContext } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import ImageFromJSON from '@/components/core/ImageFromJSON'
import Footer from '@/components/commom/footer'

export default function RegisteMetamask() {
  const { texts } = useContext(ConfigContext)
  const loginData = texts?.['register']

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex flex-1">
        {/* Lado da imagem */}
        <div
          className="
            hidden md:block
            w-[300px]
            sm:w-[350px]
            md:w-[400px]
            lg:w-[500px]
            xl:w-[550px]
            2xl:w-[600px]
            h-auto
            relative
            image-large-override
          "
        >
          <ImageFromJSON
            src={loginData?.image}
            alt={loginData?.alt}
            className="w-full h-auto object-contain"
            width={653}
            height={800}
          />
        </div>

        {/* Lado dos steps */}
        <div className="flex-1 flex items-start justify-start px-4 sm:px-8 md:px-12 pt-12 pb-8">
          <div
            className="
              mt-4
              ml-6 sm:ml-10 md:ml-14 lg:ml-20
              max-w-md w-full
            "
          >
            <MetamaskSteps />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
