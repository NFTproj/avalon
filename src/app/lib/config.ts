import clientDefaultData from '../../data/bloxify/locales/pt-BR.json'
import themaDefaultData from '../../data/bloxify/themes/light.json'

export type TextsConfig = typeof clientDefaultData
export type ColorsConfig = typeof themaDefaultData
export interface ClientConfig {
  texts: TextsConfig
  colors: ColorsConfig
}

export type ThemeMode = 'light' | 'dark'

export async function getClientConfig({
  locale = 'pt-BR',
  theme = 'light',
}: {
  locale?: string
  theme?: ThemeMode
} = {}): Promise<ClientConfig> {
  const client = process.env.CLIENT || 'bloxify'
  console.log( client);
  console.log(process.env.CLIENT)
  const localesToTry = [
    'pt-BR',
    'en-US',
    'es-ES',
    'fr-FR',
    'de-DE',
    'it-IT',
    'ja-JP',
  ]

  for (const _currentLocale of localesToTry) {
    try {
      // Use a relative path from the current file
      const configModule = await import(
        `../../data/${client}/locales/${locale}.json`
      )
      const themeModule = await import(
        `../../data/${client}/themes/${theme}.json`
      )
      // Return the imported module directly (assuming JSON is the default export)
      return {
        texts: configModule.default || configModule,
        colors: themeModule.default || themeModule,
      }
    } catch (error) {
      console.warn(`Config not found for ${client}/${locale}`)
    }
  }

  // Final fallback
  return {
    texts: clientDefaultData,
    colors: themaDefaultData,
  }
}
