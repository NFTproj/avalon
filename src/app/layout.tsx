// app/layout.tsx   (Server Component)
import type { Metadata } from 'next'
import { Geist, Geist_Mono, Poppins } from 'next/font/google'
import './globals.css'
import { headers } from 'next/headers'

import ContextProvider from '@/contexts/WagmiContext' //  ← o que criámos p/ Web3Modal
import { ConfigProvider } from '@/contexts/ConfigContext'
import { AuthProvider } from '@/contexts/AuthContext'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})
const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: '400',
})

export const metadata: Metadata = {
  title: 'Seu Projeto',
  description: 'Powered by Reown / Web3Modal + Next.js',
}

interface RootLayoutProps {
  children: React.ReactNode
}

// ⚠️  NÃO use "use client" aqui.
//     Como RootLayout é Server Component, podemos chamar headers()
export default async function RootLayout({
  children,
}: Readonly<RootLayoutProps>) {
  const hdr = await headers()
  const cookies = hdr.get('cookie') ?? null

  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable}`}
    >
      <body className="antialiased">
        {/* ⇩  Contexto do Web3Modal/Wagmi */}
        <ContextProvider cookies={cookies}>
          {/* ⇩  seus contextos anteriores continuam funcionando normalmente */}
          <ConfigProvider config={null}>
            <AuthProvider>{children}</AuthProvider>
          </ConfigProvider>
        </ContextProvider>
      </body>
    </html>
  )
}
