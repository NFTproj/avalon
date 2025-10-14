import clientDefaultData from '../../data/bloxify/locales/pt-BR.json'
import themaDefaultData from '../../data/bloxify/themes/light.json'

// Importa LOCALES e THEMES estaticamente para garantir inclusão no bundle
// Bloxify
import bloxifyPtBR from '../../data/bloxify/locales/pt-BR.json'
import bloxifyEnUS from '../../data/bloxify/locales/en-US.json'
import bloxifyLight from '../../data/bloxify/themes/light.json'

// Slab
import slabPtBR from '../../data/slab/locales/pt-BR.json'
import slabEnUS from '../../data/slab/locales/en-US.json'
import slabLight from '../../data/slab/themes/light.json'

// PowerAssetX
import powerassetxPtBR from '../../data/powerassetx/locales/pt-BR.json'
import powerassetxEnUS from '../../data/powerassetx/locales/en-US.json'
import powerassetxLight from '../../data/powerassetx/themes/light.json'

export type TextsConfig = typeof clientDefaultData
export type ColorsConfig = typeof themaDefaultData
export interface ClientConfig {
  texts: TextsConfig
  colors: ColorsConfig
  client: string
  isBloxify: boolean
}

export type ThemeMode = 'light' | 'dark'

export async function getClientConfig({
  locale = 'pt-BR',
  theme = 'light',
}: {
  locale?: string
  theme?: ThemeMode
} = {}): Promise<ClientConfig> {
  const client = process.env.CLIENT ?? process.env.NEXT_PUBLIC_CLIENT ?? 'bloxify'
  const isBloxify = client === 'bloxify'

  // Normaliza variantes comuns
  const norm = (l: string): string => {
    const s = (l || '').toLowerCase()
    if (s === 'en' || s === 'en-us' || s === 'en_us') return 'en-US'
    if (s === 'pt' || s === 'pt-br' || s === 'pt_br') return 'pt-BR'
    return l
  }
  const localeNormalized = norm(locale)

  const localesMap: Record<string, Record<string, any>> = {
    bloxify: {
      'pt-BR': bloxifyPtBR,
      'en-US': bloxifyEnUS,
    },
    slab: {
      'pt-BR': slabPtBR,
      'en-US': slabEnUS,
    },
    powerassetx: {
      'pt-BR': powerassetxPtBR,
      'en-US': powerassetxEnUS,
    },
  }

  const themesMap: Record<string, Record<ThemeMode, any>> = {
    bloxify: {
      light: bloxifyLight,
    },
    slab: {
      light: slabLight,
    },
    powerassetx: {
      light: powerassetxLight,
    },
  }

  const clientLocales = localesMap[client]
  const clientThemes = themesMap[client]

  const texts = clientLocales?.[localeNormalized] ?? clientLocales?.['pt-BR'] ?? clientDefaultData
  const colors = clientThemes?.[theme] ?? themaDefaultData

  return {
    texts,
    colors,
    client,
    isBloxify,
  }
}
