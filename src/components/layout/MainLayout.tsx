'use client'

import React, { useContext } from 'react'
import Header from '../landingPage/Header'
import Footer from '../common/footer'
import { ConfigContext } from '@/contexts/ConfigContext'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: Readonly<MainLayoutProps>) {
  const { colors } = useContext(ConfigContext)

  const pageBgColor = colors?.background['background-primary']

  return (
    <>
      <Header />
      <div
        className="px-4 md:px-28 py-6"
        style={{
          backgroundColor: pageBgColor,
        }}
      >
        {children}
      </div>
      <Footer />
    </>
  )
}
