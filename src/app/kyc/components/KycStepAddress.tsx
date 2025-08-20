'use client'

import { useState, useEffect, useContext, useRef } from 'react'
import { KycContainer } from '@/components/common/FormsBackground'
import { ConfigContext } from '@/contexts/ConfigContext'
import CustomButton from '@/components/core/Buttons/CustomButton'
import CustomInput from '@/components/core/Inputs/CustomInput'
import UploadCard from './UploadCard'
import { updateUserDetails } from '@/lib/api/user'
import LoadingOverlay from '@/components/common/LoadingOverlay'

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

  // ===== estados inicializados com defaults =====
  const [country, setCountry]   = useState(defaultValues?.country ?? '')
  const [cep, setCep]           = useState(defaultValues?.cep ?? '')
  const [street, setStreet]     = useState(defaultValues?.street ?? '')
  const [number, setNumber]     = useState(defaultValues?.number ?? '')
  const [city, setCity]         = useState(defaultValues?.city ?? '')
  const [state, setState]       = useState(defaultValues?.state ?? '')
  const [contractFile, setContractFile] = useState<File | null>(defaultValues?.contractFile ?? null)
  const [proofFile, setProofFile]       = useState<File | null>(defaultValues?.proofOfAddressFile ?? null)

  // loading global do submit
  const [loading, setLoading] = useState(false)
  const loadingMsg =
    (texts as any)?.common?.loadingOverlay?.message ||
    kycTexts?.['button-loading'] ||
    'Aguarde…'

  // loading/erro da busca de CEP
  const [cepLoading, setCepLoading] = useState(false)
  const [cepError, setCepError] = useState<string | null>(null)
  const [lastFetchedCep, setLastFetchedCep] = useState<string | null>(null)
  const debounceId = useRef<number | null>(null)

  // sincroniza defaults se mudar
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
  }, [defaultValues])

  // helpers CEP
  const digits = (v: string) => v.replace(/\D/g, '')
  const formatCEP = (v: string) => {
    const d = digits(v).slice(0, 8)
    if (d.length <= 5) return d
    return `${d.slice(0,5)}-${d.slice(5)}`
  }

  async function fetchAddressFromCep(cepDigits: string) {
    setCepError(null)
    setCepLoading(true)
    try {
      // BrasilAPI
      const r1 = await fetch(`https://brasilapi.com.br/api/cep/v2/${cepDigits}`)
      if (r1.ok) {
        const j = await r1.json()
        if (!street) setStreet(j.street || j.logradouro || '')
        if (!city)   setCity(j.city || j.localidade || '')
        if (!state)  setState(j.state || j.uf || '')
        setLastFetchedCep(cepDigits)
        return
      }
      // ViaCEP (fallback)
      const r2 = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`)
      if (r2.ok) {
        const j2 = await r2.json()
        if (!j2.erro) {
          if (!street) setStreet(j2.logradouro || '')
          if (!city)   setCity(j2.localidade || '')
          if (!state)  setState(j2.uf || '')
          setLastFetchedCep(cepDigits)
          return
        }
      }
      setCepError('CEP não encontrado.')
    } catch {
      setCepError('Falha ao consultar CEP. Tente novamente.')
    } finally {
      setCepLoading(false)
    }
  }

  // dispara busca quando o usuário termina de digitar (debounce)
  useEffect(() => {
    if (debounceId.current) window.clearTimeout(debounceId.current)
    if (country !== 'Brasil') return
    const d = digits(cep)
    if (d.length !== 8 || d === lastFetchedCep) return
    debounceId.current = window.setTimeout(() => {
      // se já estiver buscando, não dispara de novo
      if (!cepLoading) fetchAddressFromCep(d)
    }, 600) // 600ms de debounce
    return () => {
      if (debounceId.current) window.clearTimeout(debounceId.current)
    }
  }, [cep, country]) // eslint-disable-line

  // garante busca quando “clica no input de baixo”
  const ensureCepResolved = () => {
    if (country !== 'Brasil') return
    const d = digits(cep)
    if (d.length === 8 && d !== lastFetchedCep && !cepLoading) {
      fetchAddressFromCep(d)
    }
  }

  const handleSubmit = async () => {
    const address = `${street}, ${number} - ${city} - ${state}, ${digits(cep)}, ${country}`
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
        zipCode: digits(cep),
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
        zipCode: digits(cep),
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

      <div className={`${loading ? 'opacity-60 select-none pointer-events-none' : ''}`}>
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
            <div className="pointer-events-none absolute top-1/2 right-4 transform -translate-y-1/2">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* CEP (sem botão) */}
        <div className="mb-4">
          <label className="text-sm text-gray-700 mb-1 block">
            {getText('label-cep', 'Digite seu CEP')}
          </label>
          <CustomInput
            id="cep"
            type="text"
            value={formatCEP(cep)}
            onChange={(e) => setCep(e.target.value)}
            onBlur={ensureCepResolved}            // busca ao sair do campo
            label=""
            placeholder={getText('placeholder-cep', 'Ex: 12345-678')}
            disabled={cepLoading || loading || country !== 'Brasil'}
          />
          {cepError && <p className="text-sm text-red-500 mt-1">{cepError}</p>}
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
              onFocus={ensureCepResolved}         // “clicou no de baixo” ➜ tenta buscar
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
              onFocus={ensureCepResolved}
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
              onFocus={ensureCepResolved}
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
              onFocus={ensureCepResolved}
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
