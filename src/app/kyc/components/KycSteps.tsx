// KycSteps.tsx
'use client'
import { useState } from 'react'
import KycStepStart from './KycStepStart'
import KycStepPersonalInfo from './KycStepPersonalInfo'
import KycStepAddress from './KycStepAddress'
import KycStepStartVerification from './KycStepStartVerification'
import { updateUserDetails } from '@/lib/api/user'

interface Props { onFinish: () => void }

export default function KycSteps({ onFinish }: Props) {
  const [step, setStep] = useState(1)

  // Dados pessoais
  const [name, setName] = useState('')
  const [cpf, setCpf] = useState('')
  const [cnpj, setCnpj] = useState('')

  // Endereço e arquivos
  const [country, setCountry] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [street, setStreet] = useState('')   // ⬅️ manter no pai
  const [number, setNumber] = useState('')   // ⬅️ manter no pai
  const [city, setCity] = useState('')
  const [state, setStateUF] = useState('')
  const [address, setAddress] = useState('')
  const [contractFile, setContractFile] = useState<File | null>(null)
  const [proofOfAddressFile, setProofOfAddressFile] = useState<File | null>(null)

  // (opcional) enviar tudo no final
  const handleSubmitAll = async () => {
    try {
      await updateUserDetails({
        name, cpf, cnpj,
        address,
        city, state: state, country, zipCode,
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

  if (step === 1) return <KycStepStart onNext={() => setStep(2)} />

  if (step === 2) {
    return (
      <KycStepPersonalInfo
        // ✅ reidrata quando voltar
        defaultName={name}
        defaultCpf={cpf}
        defaultCnpj={cnpj}
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
        // ✅ reidrata endereço ao voltar do 4→3 ou 3→2→3
        defaultValues={{
          country,
          cep: zipCode,
          street,
          number,
          city,
          state: state,
          contractFile,
          proofOfAddressFile,
        }}
        onNext={(addr) => {
          // salva tudo no pai para reidratar depois
          setCountry(addr.country)
          setZipCode(addr.zipCode)
          setStreet(addr.street)           // ⬅️ importante
          setNumber(addr.number)           // ⬅️ importante
          setCity(addr.city)
          setStateUF(addr.state)
          setAddress(addr.address)
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
        onVerify={onFinish}
        onBack={() => setStep(3)} 
      />
    )
  }

  return null
}
