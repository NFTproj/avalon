'use client'

import { ClientConfig, getClientConfig } from '@/app/lib/config'
import React, { createContext, useState, useEffect, ReactNode } from 'react'

interface ConfigContextProps {
  config: ClientConfig | null
}

export const ConfigContext = createContext<ConfigContextProps>({
  config: null,
})

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<ClientConfig | null>(null)
  // você pode definir o idioma dinamicamente, por exemplo;
  let lang = 'pt-BR';
  if (typeof window !== 'undefined') {
    lang = document.documentElement.lang
  }

  useEffect(() => {
    const loadConfig = async () => {
      const data = await getClientConfig({locale: lang})
      setConfig(data)
    }
    loadConfig()
  }, [])

  return (
    <ConfigContext.Provider value={{ config }}>
      {children}
    </ConfigContext.Provider>
  )
}
