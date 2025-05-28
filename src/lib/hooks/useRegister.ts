import { useState } from 'react'
import { registerUser, RegisterPayload, resendCode } from '@/lib/api/auth'

// tipo estendido para incluir otp_code
type FullRegisterPayload = RegisterPayload & {
  otp_code?: string
}

export default function useRegister() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<FullRegisterPayload>>({})
  const [registrationError, setRegistrationError] = useState<string | null>(null)

  function updateField<K extends keyof FullRegisterPayload>(field: K, value: FullRegisterPayload[K]) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  async function next() {
    if (step === 3) {
      setLoading(true)
      setRegistrationError(null)

      try {
        const result = await registerUser(formData as RegisterPayload)
        console.log('[useRegister] Registro OK:', result)
        setStep(prev => prev + 1)
      } catch (err: any) {
        const msg = err?.response?.data?.message || 'Erro ao registrar usuário'
        console.error('[useRegister] Erro ao registrar:', msg)

        setRegistrationError(msg)

        // 🔁 volta para StepTwo (step 3) se for erro de usuário existente
        if (msg.toLowerCase().includes('user already exists')) {
          setStep(3)
        }
      } finally {
        setLoading(false)
      }
    } else {
      setRegistrationError(null)
      setStep(prev => prev + 1)
    }
  }

  function back() {
    setStep(prev => prev - 1)
  }

  async function resend() {
    if (!formData.email) return
    try {
      await resendCode({
        email: formData.email,
      })
      return { success: true }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erro ao reenviar código'
      console.error('[useRegister] Erro ao reenviar código:', msg)
      return { success: false, message: msg }
    }
  }

  return {
    step,
    loading,
    next,
    back,
    updateField,
    formData,
    registrationError,
    resend,
  }
}
