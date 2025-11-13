'use client'

import { useContext, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ConfigContext } from '@/contexts/ConfigContext'
import { useAuth } from '@/contexts/AuthContext'
import MainLayout from '@/components/layout/MainLayout'
import CloseAccountSection from './components/CloseAccountSection'
import CustomInput from '@/components/core/Inputs/CustomInput'
import CustomButton from '@/components/core/Buttons/CustomButton'
import { AlertTriangle } from 'lucide-react'

type MenuSection = 'close-account' | 'change-password'

// SVG Icon Components
const AccountCogIcon = ({ color, size = 18 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 4C8.93913 4 7.92172 4.42143 7.17157 5.17157C6.42143 5.92172 6 6.93913 6 8C6 9.06087 6.42143 10.0783 7.17157 10.8284C7.92172 11.5786 8.93913 12 10 12C11.0609 12 12.0783 11.5786 12.8284 10.8284C13.5786 10.0783 14 9.06087 14 8C14 6.93913 13.5786 5.92172 12.8284 5.17157C12.0783 4.42143 11.0609 4 10 4ZM17 12C16.9389 11.9989 16.8793 12.0193 16.8318 12.0577C16.7842 12.0961 16.7517 12.15 16.74 12.21L16.55 13.53C16.25 13.66 15.96 13.82 15.7 14L14.46 13.5C14.35 13.5 14.22 13.5 14.15 13.63L13.15 15.36C13.09 15.47 13.11 15.6 13.21 15.68L14.27 16.5C14.2302 16.8321 14.2302 17.1679 14.27 17.5L13.21 18.32C13.1651 18.3585 13.1346 18.4113 13.1237 18.4694C13.1128 18.5276 13.1221 18.5878 13.15 18.64L14.15 20.37C14.21 20.5 14.34 20.5 14.46 20.5L15.7 20C15.96 20.18 16.24 20.35 16.55 20.47L16.74 21.79C16.76 21.91 16.86 22 17 22H19C19.11 22 19.22 21.91 19.24 21.79L19.43 20.47C19.73 20.34 20 20.18 20.27 20L21.5 20.5C21.63 20.5 21.76 20.5 21.83 20.37L22.83 18.64C22.8579 18.5878 22.8672 18.5276 22.8563 18.4694C22.8454 18.4113 22.8149 18.3585 22.77 18.32L21.7 17.5C21.72 17.33 21.74 17.17 21.74 17C21.74 16.83 21.73 16.67 21.7 16.5L22.76 15.68C22.8049 15.6415 22.8354 15.5887 22.8463 15.5306C22.8572 15.4724 22.8479 15.4122 22.82 15.36L21.82 13.63C21.76 13.5 21.63 13.5 21.5 13.5L20.27 14C20 13.82 19.73 13.65 19.42 13.53L19.23 12.21C19.2237 12.153 19.1969 12.1003 19.1546 12.0617C19.1122 12.023 19.0573 12.0011 19 12H17ZM10 14C5.58 14 2 15.79 2 18V20H11.68C11.2337 19.0628 11.0014 18.038 11 17C11.002 15.9953 11.2203 15.0028 11.64 14.09C11.11 14.03 10.56 14 10 14ZM18 15.5C18.83 15.5 19.5 16.17 19.5 17C19.5 17.83 18.83 18.5 18 18.5C17.16 18.5 16.5 17.83 16.5 17C16.5 16.17 17.17 15.5 18 15.5Z" fill={color}/>
  </svg>
)

const AccountKeyIcon = ({ color, size = 18 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 10V12H9V14H7V12H5.8C5.4 13.2 4.3 14 3 14C1.3 14 0 12.7 0 11C0 9.3 1.3 8 3 8C4.3 8 5.4 8.8 5.8 10H11ZM3 10C2.4 10 2 10.4 2 11C2 11.6 2.4 12 3 12C3.6 12 4 11.6 4 11C4 10.4 3.6 10 3 10ZM16 14C18.7 14 24 15.3 24 18V20H8V18C8 15.3 13.3 14 16 14ZM16 12C13.8 12 12 10.2 12 8C12 5.8 13.8 4 16 4C18.2 4 20 5.8 20 8C20 10.2 18.2 12 16 12Z" fill={color}/>
  </svg>
)

const PreferencesIcon = ({ color, size = 18 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M18 9.75C18.5967 9.75 19.169 9.51295 19.591 9.09099C20.0129 8.66903 20.25 8.09674 20.25 7.5C20.25 6.90326 20.0129 6.33097 19.591 5.90901C19.169 5.48705 18.5967 5.25 18 5.25C17.4033 5.25 16.831 5.48705 16.409 5.90901C15.9871 6.33097 15.75 6.90326 15.75 7.5C15.75 8.09674 15.9871 8.66903 16.409 9.09099C16.831 9.51295 17.4033 9.75 18 9.75ZM18 12C18.8416 11.9999 19.6664 11.7638 20.3806 11.3185C21.0947 10.8732 21.6697 10.2365 22.0402 9.48083C22.4107 8.72512 22.5618 7.88066 22.4764 7.04337C22.391 6.20608 22.0725 5.40952 21.557 4.74417C21.0416 4.07882 20.3499 3.57135 19.5606 3.27941C18.7712 2.98746 17.9158 2.92274 17.0914 3.09259C16.2671 3.26245 15.507 3.66007 14.8973 4.2403C14.2876 4.82052 13.8529 5.56009 13.6425 6.375H2.625C2.32663 6.375 2.04048 6.49353 1.82951 6.70451C1.61853 6.91548 1.5 7.20163 1.5 7.5C1.5 7.79837 1.61853 8.08452 1.82951 8.2955C2.04048 8.50647 2.32663 8.625 2.625 8.625H13.6425C13.8919 9.59102 14.4553 10.4468 15.2441 11.0577C16.0329 11.6686 17.0023 12.0001 18 12ZM8.25 16.5C8.25 17.0967 8.01295 17.669 7.59099 18.091C7.16903 18.5129 6.59674 18.75 6 18.75C5.40326 18.75 4.83097 18.5129 4.40901 18.091C3.98705 17.669 3.75 17.0967 3.75 16.5C3.75 15.9033 3.98705 15.331 4.40901 14.909C4.83097 14.4871 5.40326 14.25 6 14.25C6.59674 14.25 7.16903 14.4871 7.59099 14.909C8.01295 15.331 8.25 15.9033 8.25 16.5ZM10.3575 17.625C10.0816 18.6835 9.42978 19.6054 8.52374 20.2183C7.6177 20.8312 6.51947 21.0933 5.43431 20.9554C4.34914 20.8176 3.35129 20.2894 2.62724 19.4694C1.90318 18.6494 1.50248 17.5939 1.5 16.5C1.49963 15.4045 1.89892 14.3464 2.623 13.5243C3.34707 12.7021 4.3462 12.1724 5.43301 12.0343C6.51981 11.8963 7.61965 12.1595 8.52626 12.7745C9.43287 13.3895 10.084 14.3142 10.3575 15.375H21.375C21.6734 15.375 21.9595 15.4935 22.1705 15.7045C22.3815 15.9155 22.5 16.2016 22.5 16.5C22.5 16.7984 22.3815 17.0845 22.1705 17.2955C21.9595 17.5065 21.6734 17.625 21.375 17.625H10.3575Z" fill={color}/>
  </svg>
)

export default function PerfilPage() {
  const { colors, texts } = useContext(ConfigContext)
  const { user, logout } = useAuth()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<MenuSection>('close-account')
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const profileTexts = texts?.profile
  const accentColor = colors?.border?.['border-primary'] || '#08CEFF'
  const bgColor = colors?.background?.['background-primary'] || '#FFFFFF'
  const textColor = colors?.colors?.['color-primary'] || '#1F2937'
  const secondaryTextColor = colors?.colors?.['color-secondary'] || '#6B7280'

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
    } catch (error) {
      setIsLoggingOut(false)
    }
  }

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  const menuItems = [
    {
      section: 'quick-access',
      label: 'Acesso Rápido',
      IconComponent: AccountCogIcon,
      items: [
        { id: 'buy', label: 'Comprar Tokens', path: '/tokens' },
        { id: 'kyc', label: 'Verificar Identidade', path: '/kyc' },
        { id: 'orders', label: 'Meus Pedidos', path: '/buy-tokens/orders' },
        { id: 'certificates', label: 'Emitir Certificado', path: '/certificate-emission' },
      ]
    },
    {
      section: 'account',
      label: 'Conta',
      IconComponent: AccountKeyIcon,
      items: [
        { id: 'change-password', label: profileTexts?.menu?.['password-update'] || 'Atualizar senha' },
        { id: 'close-account', label: profileTexts?.menu?.['close-account'] || 'Encerrar conta' },
        { id: 'logout', label: 'Sair', isLogout: true },
      ]
    },
  ]

  const renderContent = () => {
    switch (activeSection) {
      case 'change-password':
        return <ChangePasswordContent />
      case 'close-account':
        return <CloseAccountSection userEmail={user?.email || ''} />
      default:
        return <CloseAccountSection userEmail={user?.email || ''} />
    }
  }

  // Componente inline para atualizar senha
  const ChangePasswordContent = () => {
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleChangePassword = async () => {
      setError('')
      
      if (!newPassword || !confirmPassword) {
        setError('Todos os campos são obrigatórios')
        return
      }

      if (newPassword.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres')
        return
      }

      if (newPassword !== confirmPassword) {
        setError('As senhas não conferem')
        return
      }

      setLoading(true)
      
      try {
        const response = await fetch('/api/auth/change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ newPassword }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao atualizar senha')
        }

        setSuccess(true)
        setNewPassword('')
        setConfirmPassword('')
        
        setTimeout(() => {
          setSuccess(false)
        }, 3000)
      } catch (err: any) {
        setError(err.message || 'Erro ao atualizar senha. Tente novamente.')
      } finally {
        setLoading(false)
      }
    }

    if (success) {
      return (
        <div className="p-6 md:p-8 text-center">
          <div 
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: accentColor + '20' }}
          >
            <svg 
              className="w-8 h-8" 
              style={{ color: accentColor }}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold mb-2" style={{ color: textColor }}>
            Senha atualizada!
          </h2>
          
          <p style={{ color: secondaryTextColor }}>
            Sua senha foi atualizada com sucesso.
          </p>
        </div>
      )
    }

    return (
      <div className="p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: textColor }}>
          {profileTexts?.menu?.['password-update'] || 'Atualizar senha'}
        </h2>

        <div 
          className="border rounded-lg p-4 mb-6 flex gap-3"
          style={{ 
            backgroundColor: '#EFF6FF',
            borderColor: '#BFDBFE'
          }}
        >
          <AlertTriangle size={20} className="flex-shrink-0 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm text-gray-700 leading-relaxed">
              Escolha uma senha forte com pelo menos 6 caracteres.
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label 
              htmlFor="new-password" 
              className="block text-sm font-medium mb-2"
              style={{ color: textColor }}
            >
              Nova senha
            </label>
            <CustomInput
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full"
            />
          </div>

          <div>
            <label 
              htmlFor="confirm-password" 
              className="block text-sm font-medium mb-2"
              style={{ color: textColor }}
            >
              Confirmar nova senha
            </label>
            <CustomInput
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <CustomButton
            text={loading ? 'Salvando...' : 'Salvar senha'}
            onClick={handleChangePassword}
            disabled={loading}
            className="flex-1"
          />
        </div>
      </div>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen py-8 px-4" style={{ backgroundColor: bgColor }}>
        <div className="max-w-6xl mx-auto">
          {/* Título */}
          <h1 className="text-3xl md:text-4xl font-bold mb-8" style={{ color: textColor }}>
            {profileTexts?.menu?.configurations || 'Configurações'}
          </h1>

          {/* Card Branco Único */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Sidebar */}
              <aside className="w-full md:w-64 flex-shrink-0 border-r border-gray-200">
                <nav className="p-6">
                  {menuItems.map((section) => (
                    <div key={section.section} className="mb-6 last:mb-0">
                      <div className="flex items-center gap-2 mb-3 px-2">
                        <section.IconComponent color={accentColor} size={18} />
                        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: textColor }}>
                          {section.label}
                        </h3>
                      </div>
                      <ul className="space-y-1">
                        {section.items.map((item: any) => (
                          <li key={item.id}>
                            <button
                              onClick={() => {
                                if (item.isLogout) {
                                  handleLogout()
                                } else if (item.path) {
                                  handleNavigation(item.path)
                                } else {
                                  setActiveSection(item.id as MenuSection)
                                }
                              }}
                              disabled={item.isLogout && isLoggingOut}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all disabled:opacity-50 ${
                                activeSection === item.id
                                  ? 'font-semibold'
                                  : item.isLogout ? 'hover:bg-red-50' : 'hover:bg-gray-50'
                              }`}
                              style={{
                                color: item.isLogout ? '#DC2626' : (activeSection === item.id ? accentColor : secondaryTextColor),
                                backgroundColor: activeSection === item.id ? `${accentColor}10` : 'transparent',
                              }}
                            >
                              {item.isLogout && isLoggingOut ? 'Saindo...' : item.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </nav>
              </aside>

              {/* Main Content */}
              <main className="flex-1">
                {renderContent()}
              </main>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
