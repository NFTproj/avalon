// src/hooks/useLogin.ts
import { useState } from 'react'
import { loginUser, LoginPayload } from '@/lib/api/auth'

export default function useLogin() {
  const [loading, setLoading] = useState(false)

  // 👉 sem clientId
  const [formData, setFormData] = useState<LoginPayload>({
    email: '',
    password: '',
  })

  function updateField<K extends keyof LoginPayload>(
    field: K,
    value: LoginPayload[K],
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  async function submit() {
    setLoading(true)
    try {
      await loginUser(formData) // cookies HTTP-only são setados aqui
      console.log('[useLogin] Login OK')
      // redirecione ou faça get /api/me se precisar de dados do usuário
    } catch (err) {
      console.error('[useLogin] Erro no login:', err)
      alert('Falha ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return { formData, updateField, submit, loading }
}
