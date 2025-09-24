// app/providers.tsx
'use client'

import React from 'react'
import { BannerProvider } from '@/components/common/GlobalBanner'

export default function Providers({ children }: { children: React.ReactNode }) {
  return <BannerProvider>{children}</BannerProvider>
}
