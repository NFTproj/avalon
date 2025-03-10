import clientDefaultData from '../../data/clientDefault/pt.json'

export type ClientConfig = typeof clientDefaultData;

export async function getClientConfig(): Promise<ClientConfig> {
  const client = process.env.CLIENT || 'clientDefault';
  const localesToTry = ['pt'];
  
  for (const currentLocale of localesToTry) {
    try {
      // Use a relative path from the current file
      const configModule = await import(`../../data/${client}/${currentLocale}.json`);
      // Return the imported module directly (assuming JSON is the default export)
      return configModule.default || configModule;
    } catch (error) {
      console.warn(`Config not found for ${client}/${currentLocale}`);
    }
  }
  
  // Final fallback
  return clientDefaultData;
}