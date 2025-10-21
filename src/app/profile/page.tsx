'use client'

import { useContext, useState } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import { useAuth } from '@/contexts/AuthContext'
import MainLayout from '@/components/layout/MainLayout'
import { User, Lock, Bell, Shield, Globe } from 'lucide-react'
import CloseAccountSection from './components/CloseAccountSection'

type MenuSection = 'close-account' | 'settings' | 'password' | 'verify' | '2fa' | 'devices' | 'language' | 'notifications'

export default function PerfilPage() {
  const { colors, texts } = useContext(ConfigContext)
  const { user } = useAuth()
  const [activeSection, setActiveSection] = useState<MenuSection>('close-account')

  const profileTexts = texts?.profile
  const accentColor = colors?.border?.['border-primary'] || '#08CEFF'
  const bgColor = colors?.background?.['background-primary'] || '#FFFFFF'
  const textColor = colors?.colors?.['color-primary'] || '#1F2937'
  const secondaryTextColor = colors?.colors?.['color-secondary'] || '#6B7280'

  const menuItems = [
    {
      section: 'configurations',
      label: profileTexts?.menu?.configurations || 'Configurações',
      icon: User,
      items: [
        { id: 'settings', label: profileTexts?.menu?.settings || 'Cadastro', icon: User },
        { id: 'password', label: profileTexts?.menu?.['password-update'] || 'Atualizar senha', icon: Lock },
        { id: 'verify', label: profileTexts?.menu?.['verify-account'] || 'Verificar conta', icon: Shield },
        { id: 'close-account', label: profileTexts?.menu?.['close-account'] || 'Encerrar conta', icon: User },
      ]
    },
    {
      section: 'security',
      label: profileTexts?.menu?.security || 'Segurança',
      icon: Shield,
      items: [
        { id: '2fa', label: profileTexts?.menu?.['enable-2fa'] || 'Ativar 2FA', icon: Shield },
        { id: 'devices', label: profileTexts?.menu?.['connected-devices'] || 'Dispositivos conectados', icon: Shield },
      ]
    },
    {
      section: 'preferences',
      label: profileTexts?.menu?.preferences || 'Preferências',
      icon: Globe,
      items: [
        { id: 'language', label: profileTexts?.menu?.language || 'Idioma', icon: Globe },
        { id: 'notifications', label: profileTexts?.menu?.notifications || 'Notificações', icon: Bell },
      ]
    },
  ]

  const renderContent = () => {
    switch (activeSection) {
      case 'close-account':
        return <CloseAccountSection userEmail={user?.email || ''} />
      case 'settings':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4" style={{ color: textColor }}>
              {profileTexts?.menu?.settings || 'Cadastro'}
            </h2>
            <p style={{ color: secondaryTextColor }}>Em desenvolvimento...</p>
          </div>
        )
      case 'password':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4" style={{ color: textColor }}>
              {profileTexts?.menu?.['password-update'] || 'Atualizar senha'}
            </h2>
            <p style={{ color: secondaryTextColor }}>Em desenvolvimento...</p>
          </div>
        )
      default:
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4" style={{ color: textColor }}>
              Seção em desenvolvimento
            </h2>
            <p style={{ color: secondaryTextColor }}>Esta funcionalidade estará disponível em breve.</p>
          </div>
        )
    }
  }

  return (
    <MainLayout>
      <div className="min-h-screen py-8 px-4" style={{ backgroundColor: bgColor }}>
        <div className="max-w-6xl mx-auto">
          {/* Título */}
          <h1 className="text-3xl md:text-4xl font-bold mb-8" style={{ color: textColor }}>
            {profileTexts?.['page-title'] || 'Perfil'}
          </h1>

          {/* Layout com Sidebar e Content */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <aside className="w-full md:w-64 flex-shrink-0">
              <nav className="bg-white rounded-lg shadow-md p-4">
                {menuItems.map((section) => (
                  <div key={section.section} className="mb-6 last:mb-0">
                    <div className="flex items-center gap-2 mb-3 px-2">
                      <section.icon size={18} style={{ color: accentColor }} />
                      <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: textColor }}>
                        {section.label}
                      </h3>
                    </div>
                    <ul className="space-y-1">
                      {section.items.map((item) => (
                        <li key={item.id}>
                          <button
                            onClick={() => setActiveSection(item.id as MenuSection)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                              activeSection === item.id
                                ? 'font-semibold'
                                : 'hover:bg-gray-50'
                            }`}
                            style={{
                              color: activeSection === item.id ? accentColor : secondaryTextColor,
                              backgroundColor: activeSection === item.id ? `${accentColor}10` : 'transparent',
                            }}
                          >
                            {item.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 bg-white rounded-lg shadow-md">
              {renderContent()}
            </main>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
