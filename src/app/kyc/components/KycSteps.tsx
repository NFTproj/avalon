'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import KycStepStart from './KycStepStart'
import KycStepPersonalInfo from './KycStepPersonalInfo'
import KycStepAddress from './KycStepAddress'
import KycStepStartVerification from './KycStepStartVerification'
import { updateUserDetails } from '@/lib/api/user'

interface Props {
  onFinish: () => void
}

export default function KycSteps({ onFinish }: Props) {
  const router = useRouter()

  const [step, setStep] = useState(1)

  // Dados pessoais
  const [name, setName] = useState('')
  const [cpf, setCpf] = useState('')
  const [cnpj, setCnpj] = useState('')

  // Endereço e arquivos
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [country, setCountry] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [contractFile, setContractFile] = useState<File | null>(null)
  const [proofOfAddressFile, setProofOfAddressFile] = useState<File | null>(null)

  const handleSubmitAll = async () => {
    try {
      await updateUserDetails({
        name,
        cpf,
        cnpj,
        address,
        city,
        state,
        country,
        zipCode,
        type: cnpj ? 'business' : 'individual',
        contractFile: cnpj ? contractFile || undefined : undefined,
        proofOfAddressFile: cnpj ? proofOfAddressFile || undefined : undefined,
      })

      setStep(4)
    } catch (err: any) {
      console.error('Erro ao enviar dados KYC:', err)
      alert(err.message || 'Erro ao atualizar seus dados')
    }
  }

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
        onBack={() => setStep(1)}
      />
    )
  }

  if (step === 3) {
    return (
      <KycStepAddress
        name={name}
        cpf={cpf}
        cnpj={cnpj}
        onNext={(addr) => {
        setAddress(addr.address)
        setCity(addr.city)
        setState(addr.state)
        setCountry(addr.country)
        setZipCode(addr.zipCode)
        setContractFile(addr.contractFile)
        setProofOfAddressFile(addr.proofOfAddressFile)
        setStep(4)
      }}
      onBack={() => setStep(2)}
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
