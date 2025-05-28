'use client'

import { FormEvent, useContext, useState } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import CustomButton  from '../../components/core/Buttons/CustomButton'
import CustomInput   from '../../components/core/Inputs/CustomInput'
import LoadingOverlay from '../../components/commom/LoadingOverlay'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { loginUser } from '@/lib/api/auth'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const { colors, texts }   = useContext(ConfigContext)
  const loginTexts          = texts?.register?.['step-four']

  const [email, setEmail]   = useState('')
  const [password, setPass] = useState('')
  const [showPwd, setShow]  = useState(false)
  const [loading, setLoad]  = useState(false)
  const [error, setError]   = useState<string | null>(null)

  const router = useRouter()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoad(true)

    try {
      await loginUser({ email, password })   // 👈 só credenciais
      router.push('/dashboard')
    } catch (err) {
      console.error('[LOGIN ERROR]', err)
      setError('E-mail ou senha inválidos. Tente novamente.')
      setLoad(false)
    }
  }

  const borderErr = error ? 'border-red-500' : ''

  return (
    <div className="relative w-full max-w-md">
      {loading && <LoadingOverlay />}

      <h1 className="text-3xl font-bold mb-4" style={{ color: colors?.colors['color-primary'] }}>
        {loginTexts?.title || 'Acesse a sua conta'}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
        {/* E-mail */}
        <p className="text-sm text-gray-600">{loginTexts?.paragraphEmail || 'Seu e-mail'}</p>
        <CustomInput
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={loginTexts?.placeholders?.email || 'email@email.com'}
          label={loginTexts?.labels?.email || ''}
          className={`border-gray-300 rounded-xl focus:outline-none focus:ring-2 ${borderErr}`}
        />

        {/* Senha */}
        <p className="text-sm text-gray-600">{loginTexts?.paragraphPassword || 'Digite a sua senha'}</p>
        <CustomInput
          type={showPwd ? 'text' : 'password'}
          value={password}
          onChange={e => setPass(e.target.value)}
          autoComplete="current-password"
          placeholder={loginTexts?.placeholders?.password || '••••••••'}
          label={loginTexts?.labels?.password || ''}
          className={`border-gray-300 rounded-xl focus:outline-none focus:ring-2 pr-10 ${borderErr}`}
          iconRight={
            <button type="button" onClick={() => setShow(!showPwd)}>
              {showPwd ? <FaEyeSlash /> : <FaEye />}
            </button>
          }
        />

        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}

        {/* Botão */}
        <div className="w-full mt-4">
          <CustomButton
            text={loading ? 'Entrando...' : loginTexts?.['button-login'] || 'Entrar'}
            type="submit"
            disabled={loading}
            className="w-full h-[52px] font-bold"
            borderColor={colors?.border['border-primary']}
            textColor={colors?.colors['color-primary']}
          />
        </div>
      </form>
    </div>
  )
}
