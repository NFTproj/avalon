'use client'

import { ConfigContext } from "@/contexts/ConfigContext"
import { useContext } from "react"

function Header() {
  const { config } = useContext(ConfigContext)
  
  // Use uma cor padrão caso config.colors não exista
  const color = config?.colors?.["header-primary"] || '#002D3121'

  return (
    // Duas soluções possíveis:

    // 1. Usar style inline para cores dinâmicas
    
    // 2. Se preferir usar Tailwind, garanta que o valor seja completo na classe
    <header className={`w-full p-4 ${color}`}>
    
      <div></div>
      <div>
        <details>
          <summary>A Bloxify</summary>
        </details>
      </div>
    </header>
  )
}

export default Header