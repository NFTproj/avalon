'use client'

import { ClientConfig, getClientConfig } from '@/app/lib/config';
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import defaultClient from '../data/clientDefault/pt.json'

interface ConfigContextProps {
  config: ClientConfig | null;
}

export const ConfigContext = createContext<ConfigContextProps>({
  config: null,
});

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<ClientConfig>(defaultClient);

  useEffect(() => {
    const loadConfig = async () => {
      const data = await getClientConfig();
      setConfig(data);
    };
    loadConfig();
  }, []);

  return (
    <ConfigContext.Provider value={{ config }}>
      {children}
    </ConfigContext.Provider>
  );
};
