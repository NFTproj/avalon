// app/buy-tokens/page.tsx
'use client'

import { useSearchParams } from 'next/navigation'
import BuyTokens from "./buytokens/index"

export default function Page() {
  const searchParams = useSearchParams()
  const tokenParam = searchParams.get('token') || ''
  
  // Usar o parâmetro token como key para forçar remontagem quando muda
  return <BuyTokens key={tokenParam} />
}


/*
app/
  buy-tokens/
    page.tsx
    BuyTokens/                 ← módulo da feature (entrypoint)
      index.tsx                ← container 
      ui/                      ← componentes “presentational” da feature
        BuyPanel.tsx
        TokenList.tsx
        TabsBar.tsx
        ProgressBar.tsx
        pix/
          PixPaymentSheet.tsx
          PixPaymentStatement.tsx
          types.ts
          index.ts             ← barrel do PIX
      index.ts                 ← barrel do módulo (reexporta o default)
*/