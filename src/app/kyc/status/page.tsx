'use client'

import { useEffect, useState, useContext } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { KycContainer }  from '@/components/common/FormsBackground'
import CustomButton      from '@/components/core/Buttons/CustomButton'
import { ConfigContext } from '@/contexts/ConfigContext'
import { Loader2 }       from 'lucide-react'

/* opcional: enum para quando a API estiver pronta */
export type KycStatus = 'approved' | 'rejected' | 'pending'

export default function KycStatusPage () {
  const { colors } = useContext(ConfigContext)
  const params     = useSearchParams()
  const router     = useRouter()

  /* quando integrar: mude o tipo para `KycStatus | null` */
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // ─────────────── pegar status da API ───────────────
  useEffect(() => {
    // Ex.: você já salva `sessionId` no localStorage:
    const sessionId = localStorage.getItem('verificationSessionId')
    if (!sessionId) return

    ;(async () => {
      try {
        /* TODO ..............................
           1) chame sua rota: `/api/user/session/decision?sessionId=${sessionId}`
           2) parseie a resposta -> { status: 'approved' | 'rejected' | 'pending' }
        */
        // ------------- EXEMPLO fake ---------------
        await new Promise(r => setTimeout(r, 1200))
        const apiStatus: KycStatus = 'pending' // <-- troque pelo retorno real
        // ------------------------------------------
        setStatus(apiStatus)
      } catch (e) {
        console.error('[KYC STATUS] erro ao consultar', e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // ─────────────── renderização ───────────────
  return (
    <KycContainer className="max-w-[480px] text-center space-y-6">
      {loading ? (
        <Loader2 className="h-16 w-16 mx-auto animate-spin text-gray-400" />
      ) : (
        <>
          {/* enquanto não há lógica de status, mostramos só um título genérico */}
          <h1 className="text-2xl font-semibold">Status de verificação</h1>

          {status ? (
            <p>Resultado: <strong>{status}</strong></p>
          ) : (
            <p className="text-gray-600">
              Não foi possível obter o status. Tente novamente mais tarde.
            </p>
          )}

          <CustomButton
            text="Voltar ao início"
            onClick={() => router.push('/')}
            className="mx-auto"
            color={colors?.buttons['button-third']}
            textColor={colors?.colors['color-primary']}
            borderColor={colors?.border['border-primary']}
          />
        </>
      )}
    </KycContainer>
  )
}
