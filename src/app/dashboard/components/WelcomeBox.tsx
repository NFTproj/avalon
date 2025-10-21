'use client'

import { useContext, useMemo } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import Carousel from './Carousel'
import { KycStatusCode, getKycStatusInfo } from '@/types/kyc'

export default function WelcomeBox() {
  const { colors, texts } = useContext(ConfigContext)
  const { user } = useAuth()

  const welcomeTexts = (texts?.dashboard as any)?.['welcome-box']
  const textColor = '#FFFFFF'
  const linkColor = '#08CEFF'
  const backgroundColor = 'linear-gradient(135deg, #1F2937 0%, #374151 100%)'

  // Usar nome real do usuário ou fallback
  const userName = user?.name || user?.email?.split('@')[0] || welcomeTexts?.name || 'Usuário'
  
  // Formatar endereço da wallet
  const formatWalletAddress = (address: string) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Obter informações do status KYC usando o enum
  const kycInfo = useMemo(() => {
    const status = user?.kycStatusCode ?? user?.kycStatus;
    if (typeof status === 'number') {
      return getKycStatusInfo(status);
    }
    if (typeof status === 'string') {
      return getKycStatusInfo(Number(status) || KycStatusCode.NOT_STARTED);
    }
    return null;
  }, [user]);

  return (
    <div className="relative w-full flex justify-center items-center">
      <div
        className="
          relative z-10 flex flex-col lg:flex-row
          items-center lg:items-start justify-between
          w-full max-w-7xl rounded-2xl shadow-xl overflow-visible
          p-6 md:p-8 gap-6 lg:gap-8
          lg:pr-[52%]
          text-center lg:text-left
        "
        style={{
          background: backgroundColor,
          color: textColor,
        }}
      >
        <div className="flex-1 min-w-[300px] z-20 w-full">
          <div className="mb-4">
            <h1 className="text-2xl font-bold mb-2 break-words">
              {welcomeTexts?.title?.replace('Slab', 'Bloxify') || `Bem-vindo(a) à Bloxify, ${userName}!`}
            </h1>
            <h2 className="text-xl font-semibold mb-2 break-words whitespace-pre-line">
              {welcomeTexts?.subtitle || 'Conheça os projetos que foram tokenizados, invista com segurança e tenha o controle total do seu patrimônio.'}
            </h2>
            
            {/* Informações do usuário */}
            <div className="space-y-2 text-sm opacity-90 mb-4">
              {user?.email && (
                <p className="flex items-center gap-2">
                  <span className="opacity-70">Email:</span>
                  <span>{user.email}</span>
                </p>
              )}
              
              {user?.walletAddress && (
                <p className="flex items-center gap-2">
                  <span className="opacity-70">Wallet:</span>
                  <span className="font-mono">{formatWalletAddress(user.walletAddress)}</span>
                </p>
              )}
              
              {kycInfo && (
                <p className="flex items-center gap-2">
                  <span className="opacity-70">Status:</span>
                  <span 
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: `${kycInfo.color}20`,
                      color: kycInfo.color,
                      border: `1px solid ${kycInfo.color}40`
                    }}
                  >
                    {kycInfo.label}
                  </span>
                </p>
              )}
            </div>
          </div>
          
          <p className="text-base mb-6 whitespace-pre-line break-words lg:w-[400px] text-left opacity-90">
            {welcomeTexts?.description || 'Gerencie seus investimentos em tokens de forma fácil e segura.'}
          </p>
          
          {/* Links de ação baseados no status do usuário */}
          <div className="flex flex-col gap-3">
            {kycInfo && kycInfo.code !== KycStatusCode.APPROVED && (
              <Link
                href="/kyc"
                className="inline-block text-sm font-semibold underline break-words hover:opacity-80 transition-opacity"
                style={{ color: linkColor }}
              >
                {kycInfo.code === KycStatusCode.IN_PROGRESS || kycInfo.code === KycStatusCode.REVIEW
                  ? welcomeTexts?.buttons?.['check-kyc'] || 'Verificar Status do KYC'
                  : welcomeTexts?.buttons?.['complete-kyc'] || 'Complete sua Verificação KYC'}
              </Link>
            )}
            
            <Link
              href="/tokens"
              className="inline-block text-sm font-semibold underline break-words hover:opacity-80 transition-opacity"
              style={{ color: linkColor }}
            >
              {welcomeTexts?.buttons?.['explore-tokens'] || 'Explorar Tokens Disponíveis'}
            </Link>
          </div>
        </div>

        <Carousel />
      </div>
    </div>
  )
}
