// KycStepAddress.tsx
'use client'

import { useState, useEffect, useContext } from 'react'
import { KycContainer } from '@/components/common/FormsBackground'
import { ConfigContext } from '@/contexts/ConfigContext'
import CustomButton from '@/components/core/Buttons/CustomButton'
import CustomInput from '@/components/core/Inputs/CustomInput'
import UploadCard from './UploadCard'
import { updateUserDetails } from '@/lib/api/user'
import LoadingOverlay from '@/components/common/LoadingOverlay'
import CepInput from '@/components/core/kyc/CepInput'

type AddressDefaults = {
  country?: string
  cep?: string
  street?: string
  number?: string
  city?: string
  state?: string
  contractFile?: File | null
  proofOfAddressFile?: File | null
}

interface KycStepAddressProps {
  name: string
  cpf: string
  cnpj: string
  defaultValues?: AddressDefaults
  onNext: (data: any) => void
  onBack: () => void
}

export default function KycStepAddress({
  name, cpf, cnpj, defaultValues, onNext, onBack
}: KycStepAddressProps) {
  const { colors, texts } = useContext(ConfigContext)
  const kycTexts = (texts as any)?.kyc
  const getText = (key: string, fallback: string) => kycTexts?.[key] || fallback

  // ===== estados com defaults =====
  const [country, setCountry]   = useState(defaultValues?.country ?? '')
  const [cep, setCep]           = useState(defaultValues?.cep ?? '')
  const [street, setStreet]     = useState(defaultValues?.street ?? '')
  const [number, setNumber]     = useState(defaultValues?.number ?? '')
  const [city, setCity]         = useState(defaultValues?.city ?? '')
  const [state, setState]       = useState(defaultValues?.state ?? '')
  const [contractFile, setContractFile] = useState<File | null>(defaultValues?.contractFile ?? null)
  const [proofFile, setProofFile]       = useState<File | null>(defaultValues?.proofOfAddressFile ?? null)
 

  // flags: só sobrescreve por CEP se o usuário ainda não editou manualmente
  const [autoFill, setAutoFill] = useState(() => ({
    street: !defaultValues?.street,
    city:   !defaultValues?.city,
    state:  !defaultValues?.state,
  }))
  const [lastCepSuggestion, setLastCepSuggestion] = useState<{cep?: string; street?: string; city?: string; state?: string} | null>(null)

  // loading do submit
  const [loading, setLoading] = useState(false)
  const loadingMsg =
    (texts as any)?.common?.loadingOverlay?.message ||
    kycTexts?.['button-loading'] ||
    'Aguarde…'

  // reidrata se defaultValues mudar (ex: ao voltar de outro step)
  useEffect(() => {
    if (!defaultValues) return
    if (defaultValues.country !== undefined) setCountry(defaultValues.country)
    if (defaultValues.cep !== undefined) setCep(defaultValues.cep)
    if (defaultValues.street !== undefined) setStreet(defaultValues.street)
    if (defaultValues.number !== undefined) setNumber(defaultValues.number)
    if (defaultValues.city !== undefined) setCity(defaultValues.city)
    if (defaultValues.state !== undefined) setState(defaultValues.state)
    if (defaultValues.contractFile !== undefined) setContractFile(defaultValues.contractFile ?? null)
    if (defaultValues.proofOfAddressFile !== undefined) setProofFile(defaultValues.proofOfAddressFile ?? null)

    setAutoFill({
      street: !defaultValues.street,
      city:   !defaultValues.city,
      state:  !defaultValues.state,
    })
  }, [defaultValues])

  // marca edição manual (desliga autofill daquele campo)
  const onChangeStreet = (v: string) => {
    setStreet(v)
    if (autoFill.street) setAutoFill(s => ({ ...s, street: false }))
  }
  const onChangeCity = (v: string) => {
    setCity(v)
    if (autoFill.city) setAutoFill(s => ({ ...s, city: false }))
  }
  const onChangeStateUF = (v: string) => {
    setState(v)
    if (autoFill.state) setAutoFill(s => ({ ...s, state: false }))
  }

  // reaplica a última sugestão do CEP e religa autofill
  const reapplyCepSuggestion = () => {
    if (!lastCepSuggestion) return
    setAutoFill({ street: true, city: true, state: true })
    if (lastCepSuggestion.street) setStreet(lastCepSuggestion.street)
    if (lastCepSuggestion.city)   setCity(lastCepSuggestion.city)
    if (lastCepSuggestion.state)  setState(lastCepSuggestion.state)
    if (lastCepSuggestion.cep)    setCep(lastCepSuggestion.cep)
  }

  const handleSubmit = async () => {
  // 👇 aqui entra a constante condicional
  const zip = country === 'Brasil' ? cep.replace(/\D/g, '') : cep.trim()

  const address = `${street}, ${number} - ${city} - ${state}, ${zip}, ${country}`
  const isBusiness = !!cnpj

  let navigated = false
  try {
    setLoading(true)
    await new Promise<void>((r) => requestAnimationFrame(() => r()))

    await updateUserDetails({
      type: isBusiness ? 'business' : 'individual',
      name,
      address,
      city,
      state,
      country,
      // 👇 use o zip aqui
      zipCode: zip,
      ...(isBusiness
        ? {
            cnpj,
            contractFile: contractFile || undefined,
            proofOfAddressFile: proofFile || undefined,
          }
        : {
            cpf,
          }),
    })

    navigated = true
    onNext({
      type: isBusiness ? 'business' : 'individual',
      name,
      cpf,
      cnpj,
      address,
      city,
      state,
      // 👇 e aqui também
      zipCode: zip,
      country,
      street,
      number,
      contractFile,
      proofOfAddressFile: proofFile,
    })
  } catch (err) {
    console.error('Erro ao enviar dados de KYC:', err)
    alert('Falha ao salvar seus dados. Tente novamente.')
  } finally {
    if (!navigated) setLoading(false)
  }
}

  return (
    <KycContainer className="relative">
      {loading && <LoadingOverlay />}

      <h1 className="text-2xl font-bold mb-4" style={{ color: colors?.colors['color-primary'] }}>
        {getText('kyc-step-three-title', 'Informe seu endereço')}
      </h1>

      <div className={loading ? 'opacity-60 select-none pointer-events-none' : ''}>
        {/* País */}
        <div className="mb-4">
          <label className="text-sm text-gray-700 mb-1 block">
            {getText('label-country', 'Selecione seu país')}
          </label>
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
            <div className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* CEP (controle dentro do CepInput) */}
        <div className="mb-2">
          <label className="text-sm text-gray-700 mb-1 block">
            {getText('label-cep', 'Digite seu CEP')}
          </label>
          <CepInput
            country={country}
            value={cep}
            onChange={setCep}
            onResolved={(addr) => {
              // guarda sugestão para possível re-aplicação
              setLastCepSuggestion(addr)
              // preenche apenas se ainda permitido (não sobrescreve edição manual)
              if (addr.cep && addr.cep !== cep.replace(/\D/g, '')) setCep(addr.cep)
              if (addr.street && autoFill.street) setStreet(addr.street)
              if (addr.city   && autoFill.city)   setCity(addr.city)
              if (addr.state  && autoFill.state)  setState(addr.state)
            }}
            disabled={loading}
            placeholder={getText('placeholder-cep', 'Ex: 12345-678')}
          />

          {lastCepSuggestion && (
            <button
              type="button"
              onClick={reapplyCepSuggestion}
              className="mt-1 text-xs underline text-gray-600 hover:text-gray-800"
            >
            
            </button>
          )}
        </div>

        {/* Rua e Número */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="text-sm text-gray-700 mb-1 block">{getText('label-street', 'Rua')}</label>
            <CustomInput
              id="street"
              type="text"
              value={street}
              onChange={(e) => onChangeStreet(e.target.value)}
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
              onChange={(e) => onChangeCity(e.target.value)}
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
              onChange={(e) => onChangeStateUF(e.target.value)}
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
      </div>

      {/* Botões */}
      <div className="flex flex-col sm:flex-row gap-4">
        <CustomButton
          type="button"
          text={getText('button-back', 'Voltar')}
          onClick={onBack}
          className="w-full font-semibold py-2 px-6 h-[48px]"
          textColor={colors?.colors['color-primary']}
          disabled={loading}
        />

        <CustomButton
          type="button"
          color={colors?.buttons['button-third']}
          text={loading ? loadingMsg : getText('button-next', 'Continuar')}
          onClick={handleSubmit}
          className="w-full font-semibold py-2 px-6 h-[48px]"
          textColor={colors?.colors['color-primary']}
          borderColor={colors?.border['border-primary']}
          disabled={loading}
        />
      </div>
    </KycContainer>
  )
}
