// src/lib/env/serverEnv.ts
export function getServerEnv() {
    return {
      apiBaseUrl: process.env.BLOXIFY_URL_BASE!,
      clientId: process.env.CLIENT_ID!,
      apiKey: process.env.BLOXIFY_API_KEY!,
      permissions: process.env.CLIENT_PERMISSIONS?.split(',') || [],
    };
  }
  