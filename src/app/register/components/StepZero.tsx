'use client'

//user chose the auth method
import { useContext } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import CustomButton from '@/components/core/Buttons/CustomButton'
import { RegisterPayload } from '@/lib/api/auth'
import { useRouter }            from 'next/navigation'

interface StepZeroProps {
  nextStep: () => void
  updateField: <K extends keyof RegisterPayload>(field: K, value: RegisterPayload[K]) => void
}

export default function StepZero({ nextStep, updateField }: StepZeroProps) {
  const { colors, texts } = useContext(ConfigContext)
  const stepOneTexts = texts?.['register']?.['step-zero']
  const router = useRouter()


 
  return (
    <div className="w-full max-w-md">
      <h1 className="text-3xl font-bold mb-4" style={{ color: colors?.colors['color-primary'] }}>
        {stepOneTexts?.title}
      </h1>

      <p className="mb-6 text-gray-600">{stepOneTexts?.description}</p>

      <div className="flex flex-col sm:flex-row gap-4 mb-6 w-full">
        <CustomButton
          text={stepOneTexts?.['button-email'] || 'Criar com E-mail'}
          onClick={() => {

            nextStep()
          }}
          textColor={colors?.colors['color-primary']}
          borderColor={colors?.border['border-primary']}
          className="w-full sm:flex-1 h-[52px] font-bold text-sm sm:text-base px-4"
        />

        <CustomButton
          text={stepOneTexts?.['button-metamask'] || 'Criar com MetaMask'}
          color={colors?.buttons['button-third']}
          textColor={colors?.colors['color-primary']}
          borderColor={colors?.border['border-primary']}
          className="w-full sm:flex-1 h-[52px] font-bold text-sm sm:text-base px-4"
          onClick={() => router.push('/register-metamask')} 
        /> 
      </div>
       {/* Já possui uma conta? Login*/}
      <p className="text-sm text-left" style={{ color: colors?.colors['color-secondary'] }}>
        {stepOneTexts?.['already-have-account']}{' '}
        <a href="/login" className="underline">
          {stepOneTexts?.['login-link']}
        </a>
      </p>
    </div>
  )
}
