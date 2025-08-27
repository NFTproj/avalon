// app/layout.tsx   (Server Component)
import type { Metadata } from 'next'
import { Geist, Geist_Mono, Poppins } from 'next/font/google'
import './globals.css'
import { headers } from 'next/headers'

import ContextProvider from '@/contexts/WagmiContext'
import { ConfigProvider } from '@/contexts/ConfigContext'
import { AuthProvider } from '@/contexts/AuthContext'
import ClientSWRProvider from './ClientSWRProvider'   // ⬅️ novo

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })
const poppins   = Poppins({ variable: '--font-poppins', subsets: ['latin'], weight: '400' })

export const metadata: Metadata = {
  title: 'Bloxify',
  description: 'Powered by Blocklize',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const hdr = await headers()
  const cookies = hdr.get('cookie') ?? null

  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable}`}
    >
      <body className="antialiased">
        <ContextProvider cookies={cookies}>
          <ConfigProvider config={null}>
            <AuthProvider>
              <ClientSWRProvider>
                {children}
              </ClientSWRProvider>
            </AuthProvider>
          </ConfigProvider>
        </ContextProvider>
      </body>
    </html>
  )
}
