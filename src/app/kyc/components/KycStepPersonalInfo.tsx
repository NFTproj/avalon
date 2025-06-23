'use client'

import { useState, useContext } from 'react'
import { KycContainer } from '@/components/common/FormsBackground'
import { ConfigContext } from '@/contexts/ConfigContext'
import CustomInput from '@/components/core/Inputs/CustomInput'
import CustomButton from '@/components/core/Buttons/CustomButton'

interface KycStepPersonalInfoProps {
  onNext: (data: { name: string; cpf: string; cnpj?: string }) => void
  onBack: () => void
}

function formatCPF(value: string) {
  const digits = value.replace(/\D/g, '')
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14)
}

function formatCNPJ(value: string) {
  const digits = value.replace(/\D/g, '')
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18)
}

export default function KycStepPersonalInfo({ onNext, onBack }: KycStepPersonalInfoProps) {
  const [name, setName] = useState('')
  const [cpf, setCpf] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [isLegalPerson, setIsLegalPerson] = useState(false)
  const [errors, setErrors] = useState<{ name?: string; cpf?: string }>({})

  const { colors, texts } = useContext(ConfigContext)
  const kycTexts = (texts as any)?.kyc
  const getKycText = (key: string, fallback: string) => kycTexts?.[key] || fallback

  const handleContinue = () => {
    const newErrors: typeof errors = {}
    if (!name.trim()) newErrors.name = getKycText('error-name-required', 'O nome é obrigatório.')
    if (!cpf.trim()) newErrors.cpf = getKycText('error-cpf-required', 'O CPF é obrigatório.')

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      onNext({ name, cpf, cnpj: isLegalPerson ? cnpj : undefined })
    }
  }

  return (
    <KycContainer>
      <h1
        className="text-2xl font-bold mb-4"
        style={{ color: colors?.colors['color-primary'] }}
      >
        {getKycText('kyc-step-two-title', 'Informe seus dados')}
      </h1>

      <div className="flex flex-col gap-4 mb-6">
        <div>
          <p className="text-sm mb-1 text-gray-700">{getKycText('label-name', 'Digite seu nome:')}</p>
          <CustomInput
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            label={getKycText('label-name', 'Nome completo')}
            placeholder={getKycText('placeholder-name', 'Informe seu nome completo')}
          />
          {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
        </div>

        <div>
          <p className="text-sm mb-1 text-gray-700">{getKycText('label-cpf', 'Digite seu CPF:')}</p>
          <CustomInput
            id="cpf"
            type="text"
            value={cpf}
            onChange={(e) => setCpf(formatCPF(e.target.value))}
            label={getKycText('label-cpf', 'CPF')}
            placeholder={getKycText('placeholder-cpf', 'Ex: 000.000.000-00')}
          />
          {errors.cpf && <p className="text-sm text-red-500 mt-1">{errors.cpf}</p>}
        </div>

        <div className="mt-2">
          <p className="text-sm text-gray-700 mb-2">{getKycText('label-is-legal-person', 'Você representa uma pessoa jurídica?')}</p>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={isLegalPerson}
              onChange={() => setIsLegalPerson(!isLegalPerson)}
              className="accent-blue-500 w-4 h-4"
            />
            {getKycText('checkbox-is-legal-person', 'Sim')}
          </label>
        </div>

        {isLegalPerson && (
          <div className="mt-2">
            <p className="text-sm mb-1 text-gray-700">{getKycText('label-cnpj', 'Digite o CNPJ da empresa:')}</p>
            <CustomInput
              id="cnpj"
              type="text"
              value={cnpj}
              onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
              label={getKycText('label-cnpj', 'CNPJ')}
              placeholder={getKycText('placeholder-cnpj', '00.000.000/0001-00')}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <CustomButton
          type="button"
          text={getKycText('button-back', 'Voltar')}
          onClick={onBack}
          className="w-full font-semibold py-2 px-6 h-[48px]"
          textColor={colors?.colors['color-primary']}
        />

        <CustomButton
          type="button"
          color={colors?.buttons['button-third']}
          text={getKycText('button-next', 'Continuar')}
          className="w-full font-semibold py-2 px-6 h-[48px]"
          textColor={colors?.colors['color-primary']}
          borderColor={colors?.border['border-primary']}
          onClick={handleContinue}
        />
      </div>
    </KycContainer>
  )
}
