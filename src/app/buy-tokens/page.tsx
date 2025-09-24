// app/buy-tokens/page.tsx
import BuyTokens from "./buytokens/index"

export const metadata = { title: 'Comprar Tokens' }

export default function Page() {
  // se quiser SSR de catálogo, você pode buscar aqui e passar como prop
  return <BuyTokens />
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