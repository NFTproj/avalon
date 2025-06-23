'use client'

import { useState, useContext } from 'react'
import { KycContainer } from '@/components/common/FormsBackground'
import { ConfigContext } from '@/contexts/ConfigContext'
import CustomButton from '@/components/core/Buttons/CustomButton'
import CustomInput from '@/components/core/Inputs/CustomInput'
import UploadCard from './UploadCard'
import { updateUserDetails } from '@/lib/api/user'

interface KycStepAddressProps {
    name: string
    cpf: string
    cnpj: string
    onNext: (data: any) => void
    onBack: () => void
  }

export default function KycStepAddress({ name, cpf, cnpj, onNext, onBack }: KycStepAddressProps) {
  const { colors, texts } = useContext(ConfigContext)
  const kycTexts = (texts as any)?.kyc
  const getText = (key: string, fallback: string) => kycTexts?.[key] || fallback

  const [country, setCountry] = useState('')
  const [cep, setCep] = useState('')
  const [street, setStreet] = useState('')
  const [number, setNumber] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [contractFile, setContractFile] = useState<File | null>(null)
  const [proofFile, setProofFile] = useState<File | null>(null)

  const handleSubmit = async () => {
    const address = `${street}, ${number} - ${city} - ${state}, ${cep}, ${country}`
  
    const isBusiness = !!cnpj
  
    try {
      await updateUserDetails({
        type: isBusiness ? 'business' : 'individual',
        name,
        address,
        city,
        state,
        country,
        zipCode: cep,
        ...(isBusiness
          ? {
              cnpj,
              contractFile: contractFile || undefined,
              proofOfAddressFile: proofFile || undefined,
            }
          : {
              cpf, // obrigatório se for individual
            }),
      })
  
      onNext({
        type: isBusiness ? 'business' : 'individual',
        name,
        cpf,
        cnpj,
        address,
        city,
        state,
        zipCode: cep,
        country,
        contractFile,
        proofOfAddressFile: proofFile,
      })
    } catch (err) {
      console.error('Erro ao enviar dados de KYC:', err)
    }
  }

  return (
    <KycContainer>
      <h1 className="text-2xl font-bold mb-4" style={{ color: colors?.colors['color-primary'] }}>
        {getText('kyc-step-three-title', 'Informe seu endereço')}
      </h1>

      {/* País */}
      <div className="mb-4">
        <label className="text-sm text-gray-700 mb-1 block">{getText('label-country', 'Selecione seu país')}</label>
        <div className="relative">
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full border rounded px-4 py-2 appearance-none bg-white text-gray-800"
          >
            <option value="">{getText('placeholder-country', 'Informe seu país de origem')}</option>
            <option value="Brasil">Brasil</option>
            <option value="Portugal">Portugal</option>
            <option value="EUA">Estados Unidos</option>
          </select>
          <div className="pointer-events-none absolute top-1/2 right-4 transform -translate-y-1/2">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* CEP */}
      <div className="mb-4">
        <label className="text-sm text-gray-700 mb-1 block">{getText('label-cep', 'Digite seu CEP')}</label>
        <CustomInput
          id="cep"
          type="text"
          value={cep}
          onChange={(e) => setCep(e.target.value)}
          label=""
          placeholder={getText('placeholder-cep', 'Ex: 12345-678')}
        />
      </div>

      {/* Rua e Número */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <label className="text-sm text-gray-700 mb-1 block">{getText('label-street', 'Rua')}</label>
          <CustomInput
            id="street"
            type="text"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            label=""
            placeholder={getText('placeholder-street', 'Nome da rua')}
          />
        </div>
        <div className="w-1/3">
          <label className="text-sm text-gray-700 mb-1 block">{getText('label-number', 'Número')}</label>
          <CustomInput
            id="number"
            type="text"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            label=""
            placeholder="123"
          />
        </div>
      </div>

      {/* Cidade e Estado */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <label className="text-sm text-gray-700 mb-1 block">{getText('label-city', 'Cidade')}</label>
          <CustomInput
            id="city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            label=""
            placeholder={getText('placeholder-city', 'Informe a cidade')}
          />
        </div>
        <div className="w-1/2">
          <label className="text-sm text-gray-700 mb-1 block">{getText('label-state', 'Estado')}</label>
          <CustomInput
            id="state"
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            label=""
            placeholder={getText('placeholder-state', 'UF')}
          />
        </div>
      </div>

      {/* Uploads (somente para business) */}
      {cnpj && (
        <div>
          <h2 className="text-lg font-semibold mb-2 text-gray-800">
            {getText('upload-instructions', 'Faça o upload dos documentos abaixo:')}
          </h2>

          <div className="mb-6 flex gap-4 flex-wrap">
            <UploadCard
              label={getText('label-contract-file', 'Contrato Social (PDF)')}
              uploadedFile={contractFile}
              onFileChange={setContractFile}
            />
            <UploadCard
              label={getText('label-proof-file', 'Comprovante de Endereço (PDF)')}
              uploadedFile={proofFile}
              onFileChange={setProofFile}
            />
          </div>
        </div>
      )}

      {/* Botões */}
      <div className="flex flex-col sm:flex-row gap-4">
        <CustomButton
          type="button"
          text={getText('button-back', 'Voltar')}
          onClick={onBack}
          className="w-full font-semibold py-2 px-6 h-[48px]"
          textColor={colors?.colors['color-primary']}
        />

        <CustomButton
          type="button"
          color={colors?.buttons['button-third']}
          text={getText('button-next', 'Continuar')}
          onClick={handleSubmit}
          className="w-full font-semibold py-2 px-6 h-[48px]"
          textColor={colors?.colors['color-primary']}
          borderColor={colors?.border['border-primary']}
        />
      </div>
    </KycContainer>
  )
}
