'use client'

import { FormEvent, useContext, useState } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import CustomButton from '@/components/core/Buttons/CustomButton'
import CustomInput from '@/components/core/Inputs/CustomInput'
import LoadingOverlay from '@/components/common/LoadingOverlay'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { loginUser } from '@/lib/api/auth'
import { mutateUser } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import ImageFromJSON from '@/components/core/ImageFromJSON'
import Header from '@/components/landingPage/Header'
import Footer from '@/components/common/footer'


export default function LoginComponent() {
  const { colors, texts } = useContext(ConfigContext)
  const adminTexts = (texts as any)?.admin
  const getAdminText = (key: string, fallback: string) => {
    const keys = key.split('.')
    let value = adminTexts
    for (const k of keys) {
      value = value?.[k]
    }
    return value || fallback
  }

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Verificação especial para credenciais admin
      if (email === 'admin@admin' && password === 'admin') {
        // CÓDIGO ANTIGO (removido - causava loading infinito):
        // await new Promise(resolve => setTimeout(resolve, 1000)) // Delay artificial removido
        // sessionStorage.setItem('adminUser', JSON.stringify(adminUser)) // Não funcionava com AuthContext
        // sessionStorage.setItem('accessToken', 'admin-token') // Cookie não era criado
        
        // NOVA IMPLEMENTAÇÃO: Chamar API para criar cookies HTTP-only do admin
        const res = await fetch('/api/auth/admin-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // garante envio/recebimento de cookies
          body: JSON.stringify({ email, password }),
        })

        if (!res.ok) {
          throw new Error('Falha ao fazer login admin')
        }

        // Atualizar o contexto de autenticação (busca /api/auth/me que agora reconhece admin-token)
        await mutateUser()
        
        // IMPORTANTE: Desabilitar loading antes do redirect para evitar loading infinito
        setLoading(false)
        
        // Redirecionar para admin dashboard
        router.push('/admin?page=dashboard')
        return
      }

      // Tentar login normal se não for admin
      await loginUser({ email, password })
      await mutateUser()
      
      // Desabilitar loading antes do redirect
      setLoading(false)
      
      router.push('/admin?page=dashboard')
    } catch (err) {
      console.error('[LOGIN ERROR]', err)
      setError(getAdminText('login.error-invalid-credentials', 'Credenciais inválidas. Verifique seus dados e tente novamente.'))
      setLoading(false)
    }
  }



  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex flex-1">
        {/* Formulário centralizado */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-8 md:px-12 pt-12 pb-8">
          <div
            className="
                max-w-md w-full
              "
          >
            <div className="bg-white rounded-xl shadow-md w-full p-6 md:p-8">


              {/* Título */}
              <h1
                className="text-3xl font-bold text-center mb-10"
                style={{ color: colors?.colors['color-primary'] }}
              >
                {getAdminText('login.title', 'Acesse a sua conta')}
              </h1>

              {/* Formulário */}
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Campo de email */}
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-3">
                    {getAdminText('login.email-label', 'Seu e-mail:')}
                  </label>
                  <CustomInput
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={getAdminText('login.email-placeholder', 'Digite seu e-mail')}
                    className="w-full h-12 text-base"
                    required
                  />
                </div>

                {/* Campo de senha */}
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-3">
                    {getAdminText('login.password-label', 'Digite sua senha:')}
                  </label>
                  <CustomInput
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={getAdminText('login.password-placeholder', 'Digite sua senha')}
                    className="w-full h-12 text-base pr-12"
                    iconRight={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                      </button>
                    }
                    required
                  />
                </div>

                {/* Botão de login */}
                <CustomButton
                  text={loading ? 'Entrando...' : getAdminText('login.login-button', 'Entrar')}
                  type="submit"
                  disabled={loading}
                  fullWidth
                  size="lg"
                  className="mt-10 h-14 text-lg font-semibold"
                  color={colors?.buttons['button-primary']}
                  textColor="white"
                />
              </form>

              {/* Loading overlay */}
              {loading && <LoadingOverlay />}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
