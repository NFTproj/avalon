// src/contexts/ConfigContext.tsx
'use client'

import {
  ClientConfig,
  getClientConfig, // já existente
} from '@/app/lib/config'

import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from 'react'

interface ConfigContextProps {
  config: ClientConfig | null // permanece igual
  texts: ClientConfig['texts'] | null
  colors: ClientConfig['colors'] | null
  locale: string // ← idioma atual
  setLocale: (loc: string) => void // ← troca idioma
  client: string
  isBloxify: boolean
}

export const ConfigContext = createContext<ConfigContextProps>({
  config: null,
  texts: null,
  colors: null,
  locale: 'pt-BR',
  client: '',
  isBloxify: false,
  setLocale: () => {},
})

export const ConfigProvider = ({
  config,
  children,
}: {
  config: ClientConfig | null
  children: ReactNode
}) => {
  /* ---------- idioma salvo no localStorage ou default pt-BR ---------- */
  const [locale, setLocale] = useState<string>('en')
  const [mounted, setMounted] = useState(false)
  const [client, setClient] = useState<string>('')
  const [isBloxify, setIsBloxify] = useState<boolean>(false)

  useEffect(() => {
    const stored = localStorage.getItem('locale')
    setLocale(stored ?? 'en')
    setMounted(true)
  }, [])

  /* ---------- estados que você já tinha ---------- */
  const [texts, setTexts] = useState(config?.texts ?? null)
  const [colors, setColors] = useState(config?.colors ?? null)

  /* ---------- carrega/recarga quando locale muda ---------- */
  useEffect(() => {
    ;(async () => {
      const data = await getClientConfig({ locale })
      setTexts(data.texts)
      setColors(data.colors)
      setClient(data.client)
      setIsBloxify(data.isBloxify)
      /* opcional: atualiza <html lang="…"> */
      if (typeof document !== 'undefined') {
        document.documentElement.lang = locale
        localStorage.setItem('locale', locale)
      }
    })()
  }, [locale])

  /* ---------- memo ---------- */
  const value = useMemo(
    () => ({
      config,
      texts,
      colors,
      locale,
      setLocale, // expõe a função
      setClient,
      client,
      setIsBloxify,
      isBloxify,
    }),
    [config, texts, colors, locale, client, isBloxify],
  )
  if (!mounted) return null

  return (
    <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
  )
}
