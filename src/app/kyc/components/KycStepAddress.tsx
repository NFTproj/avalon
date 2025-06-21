'use client'

import { useState } from 'react'
import { KycContainer } from "@/components/common/FormsBackground"
import CustomButton from '@/components/core/Buttons/CustomButton'
import { ConfigContext } from '@/contexts/ConfigContext'
import { useContext } from 'react'

interface KycStepAddressProps {
  cnpj: string
  onNext: (address: string) => void
  onBack: () => void
}

export default function KycStepAddress({ cnpj, onNext, onBack }: KycStepAddressProps) {
  const [address, setAddress] = useState('')
  const { colors, texts } = useContext(ConfigContext)

  return (
    <KycContainer>
      <h1 className="text-3xl font-bold mb-4" style={{ color: colors?.colors['color-primary'] }}>Infrome seu endereço</h1>
      <input
        type="text"
        value={address}
        placeholder="Endereço completo"
        onChange={(e) => setAddress(e.target.value)}
        className="mb-6 w-full border rounded px-4 py-2"
      />

      <div className="flex flex-col sm:flex-row gap-4">
        <CustomButton
          type="button"
          text="Voltar"
          onClick={onBack}
          className="w-full font-semibold py-2 px-6 h-[48px]"
          color="#ffffff"
          textColor="#00CFFF"
          borderColor="#00CFFF"
        />

        <CustomButton
          type="button"
          text="Continuar"
          onClick={() => onNext(address)}
          className="w-full font-semibold py-2 px-6 h-[48px]"
          color="#00CFFF"
          textColor="#ffffff"
        />
      </div>
    </KycContainer>
  )
}
