'use client'

import {
  ClientConfig,
  ColorsConfig,
  getClientConfig,
  TextsConfig,
} from '@/app/lib/config'

import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from 'react'

interface ConfigContextProps {
  config: ClientConfig | null
  texts: TextsConfig | null
  colors: ColorsConfig | null
}

export const ConfigContext = createContext<ConfigContextProps>({
  config: null,
  texts: null,
  colors: null,
})

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<ClientConfig | null>(null)
  const [texts, setTexts] = useState<TextsConfig | null>(null)
  const [colors, setColors] = useState<ColorsConfig | null>(null)
  // você pode definir o idioma dinamicamente, por exemplo;
  let lang = 'pt-BR'
  if (typeof window !== 'undefined') {
    lang = document.documentElement.lang
  }

  useEffect(() => {
    const loadConfig = async () => {
      const data = await getClientConfig({ locale: lang })
      setConfig(data)
      setTexts(data.texts);
      console.log('Data recebida do getClientConfig:', data.texts); // <--- ADICIONE ESTE LOG
      setColors(data.colors)
    }
    loadConfig()
  }, [])

  const value = useMemo(
    () => ({
      config,
      setConfig,
      texts,
      setTexts,
      colors,
      setColors,
    }),
    [config, texts, colors],
  )

  return (
    <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
  )
}
