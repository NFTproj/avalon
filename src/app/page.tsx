
import Header from '@/components/landingPage/Header'
import { getClientConfig } from './lib/config'

export default async function Home() {
  const config = await getClientConfig()
  return (
    <div>
      <Header />
    </div>
  )
}
