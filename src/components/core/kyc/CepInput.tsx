// components/core/kyc/CepInput.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import CustomInput from '@/components/core/Inputs/CustomInput'

type ResolvedAddr = {
  cep?: string
  street?: string
  city?: string
  state?: string
}

type Props = {
  country: string
  value: string
  onChange: (v: string) => void
  onResolved?: (addr: ResolvedAddr) => void
  placeholder?: string
  disabled?: boolean
  debounceMs?: number
  className?: string
}

export default function CepInput({
  country,
  value,
  onChange,
  onResolved,
  placeholder,
  disabled = false,
  debounceMs = 600,
  className,
}: Props) {
  const isBR = country === 'Brasil'

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFetchedCep, setLastFetchedCep] = useState<string | null>(null)
  const debId = useRef<number | null>(null)

  const digits = (v: string) => v.replace(/\D/g, '')
  const formatCEP = (v: string) => {
    const d = digits(v).slice(0, 8)
    if (!d) return ''
    if (d.length <= 5) return d
    return `${d.slice(0, 5)}-${d.slice(5)}`
  }

  // valor exibido: com máscara no BR, livre fora
  const displayValue = isBR ? formatCEP(value) : value

  async function fetchFromApis(cepDigits: string) {
    setError(null)
    setBusy(true)
    try {
      // BrasilAPI primeiro
      const r1 = await fetch(`https://brasilapi.com.br/api/cep/v2/${cepDigits}`)
      if (r1.ok) {
        const j = await r1.json()
        onResolved?.({
          cep: cepDigits,
          street: j.street || j.logradouro || '',
          city: j.city || j.localidade || '',
          state: j.state || j.uf || '',
        })
        setLastFetchedCep(cepDigits)
        return
      }

      // ViaCEP fallback
      const r2 = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`)
      if (r2.ok) {
        const j2 = await r2.json()
        if (!j2?.erro) {
          onResolved?.({
            cep: cepDigits,
            street: j2.logradouro || '',
            city: j2.localidade || '',
            state: j2.uf || '',
          })
          setLastFetchedCep(cepDigits)
          return
        }
      }

      setError('CEP não encontrado.')
    } catch {
      setError('Falha ao consultar CEP. Tente novamente.')
    } finally {
      setBusy(false)
    }
  }

  // Dispara busca somente no BR com 8 dígitos
  useEffect(() => {
    // se não é BR: nunca bloqueia, nunca busca
    if (!isBR) {
      setBusy(false)
      setError(null)
      if (debId.current) window.clearTimeout(debId.current)
      return
    }

    const d = digits(value)
    if (debId.current) window.clearTimeout(debId.current)

    if (d.length === 8 && d !== lastFetchedCep) {
      debId.current = window.setTimeout(() => {
        if (!busy) fetchFromApis(d)
      }, debounceMs)
    }
    return () => {
      if (debId.current) window.clearTimeout(debId.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, isBR])

  return (
    <div className={className}>
      <div className="relative">
        <CustomInput
          id="cep"
          type="text"
          value={displayValue}
          onChange={(e) => {
            // BR: aplica máscara e mantém só números internamente
            // Fora do BR: livre (pode conter letras, hífen, espaço, etc.)
            const next = isBR ? formatCEP(e.target.value) : e.target.value
            onChange(next)
            if (!isBR) {
              setError(null)
              setBusy(false)
            }
          }}
          placeholder={placeholder}
          autoComplete="postal-code"
          aria-busy={busy}
          disabled={disabled} // ❗️nunca desabilita por país aqui
        />

        {/* mini loader à direita do input */}
        {busy && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg
              className="animate-spin h-4 w-4 text-gray-500"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          </div>
        )}
      </div>

      {error && <p className="text-xs mt-1 text-red-500">{error}</p>}

      {/* dica quando não-BR */}
      {!isBR && (
        <p className="text-xs mt-1 text-gray-500">
          Informe o código postal/endereço conforme o padrão do país selecionado.
        </p>
      )}
    </div>
  )
}
