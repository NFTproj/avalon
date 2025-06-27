'use client'

import React, { useContext } from 'react'
import Header from '../landingPage/Header'
import Footer from '../common/footer'
import { ConfigContext } from '@/contexts/ConfigContext'
import { cn } from '@/utils/cn'

interface MainLayoutProps {
  children: React.ReactNode
  disablePadding?: boolean
}

export default function MainLayout({
  children,
  disablePadding = false,
}: Readonly<MainLayoutProps>) {
  const { colors } = useContext(ConfigContext)

  const pageBgColor = colors?.background['background-primary']

  return (
    <>
      <Header />
      <div
        className={cn('', {
          'px-4 md:px-28 py-6': !disablePadding,
        })}
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
