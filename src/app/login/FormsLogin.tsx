'use client'

import { FormEvent, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { useAppKit } from '@reown/appkit/react'
import { useAccount, useDisconnect, useSignMessage } from 'wagmi'

import { ConfigContext } from '@/contexts/ConfigContext'
import CustomButton from '../../components/core/Buttons/CustomButton'
import CustomInput from '../../components/core/Inputs/CustomInput'
import LoadingOverlay from '../../components/common/LoadingOverlay'
import { loginUser, registerWithMetamask } from '@/lib/api/auth'
import { mutateUser } from '@/contexts/AuthContext'
import metamaskLogo from '@/assets/icons/common/metamask-logo.png'

export default function LoginForm() {
  const { colors, texts } = useContext(ConfigContext)
  const loginTexts = texts?.register?.['step-four'] as any

  // Wallet
  const { open } = useAppKit()
  const { address, status, isConnecting } = useAccount() // status: 'disconnected' | 'connected' | 'reconnecting'
  const { disconnect } = useDisconnect()
  const { signMessageAsync } = useSignMessage()

  // Form / estados
  const [email, setEmail] = useState('')
  const [password, setPass] = useState('')
  const [showPwd, setShow] = useState(false)
  const [loading, setLoad] = useState(false)
  const [wLoading, setWLoad] = useState(false)
  const [sLoading, setSLoad] = useState(false)
  const [pendingSign, setPendingSign] = useState(false) // assinar após conectar
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoad(true)
    try {
      await loginUser({ email, password })
      await mutateUser()
      router.push('/dashboard')
    } catch (err) {
      console.error('[LOGIN ERROR]', err)
      setError('E-mail ou senha inválidos. Tente novamente.')
      setLoad(false)
    }
  }

  // Assinar e logar (reuso)
  const signAndLogin = async () => {
    if (!address) return
    try {
      setSLoad(true)
      const message = `Sign this message to verify ownership of ${address}`
      const signature = await signMessageAsync({ message })
      await registerWithMetamask({ walletAddress: address, signature })
      await mutateUser()
      router.push('/dashboard')
    } catch (err: any) {
      console.error('[SIGN & LOGIN ERROR]', err)
      setError(err?.message ?? 'Erro ao autenticar com a carteira.')
    } finally {
      setSLoad(false)
      setPendingSign(false)
    }
  }

  // Botão: abre modal e marca intenção; se já conectado, assina na hora
  const handleWalletButton = async () => {
    setError(null)
    try {
      if (status !== 'connected') {
        setPendingSign(true)
        setWLoad(true)
        await open() // usuário escolhe a carteira
        return       // assinatura dispara no useEffect
      }
      await signAndLogin()
    } catch (err: any) {
      console.error('[WALLET BUTTON ERROR]', err)
      setError(err?.message ?? 'Erro ao autenticar com a carteira.')
      setPendingSign(false)
    } finally {
      setWLoad(false)
    }
  }

  // Assim que conectar e houver intenção, assina automaticamente
  useEffect(() => {
    if (pendingSign && status === 'connected' && address && !sLoading) {
      signAndLogin()
    }
  }, [pendingSign, status, address, sLoading]) // observa status/address

  const borderErr = error ? 'border-red-500' : ''

  // Textos do botão via JSON
  const wb = loginTexts?.walletButton ?? {}
  const walletLabel =
    sLoading
      ? (wb.signing ?? 'Assinando...')
      : (wLoading || isConnecting || status === 'reconnecting')
        ? (wb.connecting ?? 'Conectando...')
        : (status === 'connected')
          ? (wb.connected ?? 'Assinar e entrar')
          : (wb.disconnected ?? 'Escolher carteira')

  return (
    <div className="relative w-full max-w-md">
      {(loading || wLoading || sLoading) && (
        <LoadingOverlay
          overrideMessage={
            sLoading ? 'Assinando...' :
            wLoading ? 'Conectando carteira...' :
            undefined
          }
        />
      )}

      <h1 className="text-3xl font-bold mb-4" style={{ color: colors?.colors['color-primary'] }}>
        {loginTexts?.title ?? 'Acesse a sua conta'}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
        {/* E-mail */}
        <p className="text-sm text-gray-600">{loginTexts?.paragraphEmail ?? 'Seu e-mail'}</p>
        <CustomInput
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={loginTexts?.placeholders?.email ?? 'email@email.com'}
          label={loginTexts?.labels?.email ?? ''}
          className={`border-gray-300 rounded-xl focus:outline-none focus:ring-2 ${borderErr}`}
        />

        {/* Senha */}
        <p className="text-sm text-gray-600">{loginTexts?.paragraphPassword ?? 'Digite a sua senha'}</p>
        <CustomInput
          type={showPwd ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPass(e.target.value)}
          autoComplete="current-password"
          placeholder={loginTexts?.placeholders?.password ?? '••••••••'}
          label={loginTexts?.labels?.password ?? ''}
          className={`border-gray-300 rounded-xl focus:outline-none focus:ring-2 pr-10 ${borderErr}`}
          iconRight={
            <button type="button" onClick={() => setShow(!showPwd)}>
              {showPwd ? <FaEyeSlash /> : <FaEye />}
            </button>
          }
        />

        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}

        {/* Botão login tradicional */}
        <div className="w-full mt-4">
          <CustomButton
            text={loading ? 'Entrando...' : (loginTexts?.['button-login'] ?? 'Entrar')}
            type="submit"
            disabled={loading || wLoading || sLoading}
            className="w-full h-[52px] font-bold"
            borderColor={colors?.border['border-primary']}
            textColor={colors?.colors['color-primary']}
          />
        </div>

         <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-gray-600">{loginTexts?.['login-option'] ?? 'Ou acesse com'}</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Botão ÚNICO: conectar OU assinar+entrar */}
        <button
          type="button"
          onClick={handleWalletButton}
          disabled={wLoading || sLoading}
          className="
            group inline-flex items-center gap-3
            rounded-2xl border-2 bg-white
            px-5 py-4
            shadow-[0_6px_20px_rgba(0,0,0,0.08)]
            hover:shadow-[0_10px_30px_rgba(0,0,0,0.12)]
            transition-all focus-visible:outline-none
            active:scale-[0.99]
            disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
          "
          style={{ borderColor: colors?.border['border-primary'] }}
        >
          <Image
            src={metamaskLogo}
            alt={loginTexts?.walletAlt ?? 'MetaMask'}
            width={28}
            height={28}
            className="shrink-0"
          />
          <span className="text-left leading-tight text-gray-800">
            <span className="block text-base">{walletLabel}</span>
          </span>
        </button>
      </form>
    </div>
  )
}
