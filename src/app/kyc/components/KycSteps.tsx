'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import KycStepStart from './KycStepStart'
import KycStepPersonalInfo from './KycStepPersonalInfo'
import KycStepAddress from './KycStepAddress'
import KycStepStartVerification from './KycStepStartVerification'

interface Props {
  onFinish: () => void
}

export default function KycSteps({ onFinish }: Props) {
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [cpf, setCpf] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [address, setAddress] = useState('')

  if (step === 1) {
    return <KycStepStart onNext={() => setStep(2)} />
  }

  if (step === 2) {
    return (
      <KycStepPersonalInfo
        onNext={({ name, cpf, cnpj }) => {
          setName(name)
          setCpf(cpf)
          setCnpj(cnpj || '')
          setStep(3)
        }}
        onBack={() => setStep(1)} // <-- Aqui o botão de voltar volta para a etapa 1
      />
    )
  }

  if (step === 3) {
    return (
      <KycStepAddress
        cnpj={cnpj}
        onNext={(addr) => {
          setAddress(addr)
          setStep(4)
        }}
        onBack={() => setStep(2)} // <-- Se quiser também permitir voltar para etapa anterior
      />
    )
  }

  if (step === 4) {
    return (
      <KycStepStartVerification
        name={name}
        cpf={cpf}
        address={address}
        onVerify={() => {
          onFinish()
        }}
      />
    )
  }

  return null
}
