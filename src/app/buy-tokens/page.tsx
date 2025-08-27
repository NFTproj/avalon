// app/buy-tokens/page.tsx
import BuyTokens from "./components/BuyTokens"

export const metadata = { title: 'Comprar Tokens' }

export default function Page() {
  // se quiser SSR de catálogo, você pode buscar aqui e passar como prop
  return <BuyTokens />
}
