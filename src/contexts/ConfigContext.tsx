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

export const ConfigProvider = ({ config, children }: { config: ClientConfig | null, children: ReactNode }) => {
  const [texts, setTexts] = useState<TextsConfig | null>(config?.texts || null)
  const [colors, setColors] = useState<ColorsConfig | null>(config?.colors || null)
  let lang = 'pt-BR'
  if (typeof window !== 'undefined') {
    lang = document.documentElement.lang
  }

  useEffect(() => {
    if (!config?.texts || !config?.colors) {
      const loadConfig = async () => {
        const data = await getClientConfig({ locale: lang })
        setTexts(data.texts)
        setColors(data.colors)
      }
      loadConfig()
    }
  }, [config, lang])

  const value = useMemo(
    () => ({
      config,
      texts,
      colors,
    }),
    [config, texts, colors],
  )

  return (
    <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
  )
}
