'use client'

import { useContext, useState }   from 'react'
import { useRouter }              from 'next/navigation'
import ImageFromJSON              from '@/components/core/ImageFromJSON'
import { KycContainer }           from '@/components/common/FormsBackground'
import CustomButton               from '@/components/core/Buttons/CustomButton'
import { ConfigContext }          from '@/contexts/ConfigContext'
import { createKycSession }       from '@/lib/api/kyc'
import { useAuth }                from '@/contexts/AuthContext'

interface Props {
  name?: string
  cpf?:  string
  address?: string
}

export default function KycStepStartVerification (props: Props) {
  const { name, cpf, address }   = props
  const { texts, colors }        = useContext(ConfigContext)
  const { user }                 = useAuth()
  const [loading, setLoading]    = useState(false)

  const kycTexts = (texts as any)?.kyc ?? {}
  const cfg      = kycTexts['start-verification'] ?? {}
  const t        = (k: string, f: string) => cfg[k] || kycTexts[k] || f

  const router   = useRouter()

  /* ------------ botão “Continuar” ------------ */
  async function handleVerify () {
    try {
      setLoading(true)

      const userId = user?.id ?? user?.userId
      if (!userId) throw new Error('Usuário não identificado')

      // cria sessão ➜ Didit devolve { url, session_id … }
      const { url, session_id } = await createKycSession(userId)

      // (opcional) guardar o id para depois consultar decisão
      localStorage.setItem('verificationSessionId', session_id)

      // abre o fluxo Didit
      window.location.href = url
    } catch (e: any) {
      console.error(e)
      alert(e.message ?? 'Falha ao iniciar verificação')
    } finally {
      setLoading(false)
    }
  }

  /* -------------------- UI ------------------- */
  return (
    <KycContainer className="max-w-[640px] pt-6 pb-10 sm:pb-8">
      {/* logo Didit */}
      <div className="flex justify-end mb-6 sm:mb-4">
        <ImageFromJSON src={cfg.logo?.src} alt={cfg.logo?.alt} width={70} height={20}/>
      </div>

      {/* título + descrição */}
      <header className="mb-8 sm:mb-6 text-center sm:text-left">
        <h1 className="text-2xl sm:text-[28px] font-bold mb-3"
            style={{ color: colors?.colors['color-primary'] }}>
          {t('title', 'Verificação Didit')}
        </h1>
        <p className="text-gray-700 leading-snug">
          {t('description',
              'Você será redirecionado para um site externo para concluir sua verificação de identidade (KYC).')}
        </p>
      </header>

      {/* mock */}
      <div className="flex justify-center mb-8 sm:mb-6">
        <div className="rounded-xl overflow-hidden border border-gray-300 w-[220px] h-[220px]">
          <ImageFromJSON src={cfg.demo?.src} alt={cfg.demo?.alt}
                         width={220} height={220} className="object-cover w-full h-full"/>
        </div>
      </div>

      {/* dados opcionais */}
      {(name || cpf || address) && (
        <ul className="text-sm text-gray-600 mb-8 sm:mb-6 list-disc list-inside space-y-1">
          {name    && <li><strong>Nome:</strong> {name}</li>}
          {cpf     && <li><strong>CPF:</strong>  {cpf}</li>}
          {address && <li><strong>Endereço:</strong> {address}</li>}
        </ul>
      )}

      {/* botão */}
      <CustomButton
        type="button"
        disabled={loading}
        color={colors?.buttons['button-third']}
        borderColor={colors?.border['border-primary']}
        text={loading ? 'Aguarde…' : t('button-continue', 'Continuar')}
        onClick={handleVerify}
        className="w-full h-[46px] font-semibold"
        textColor={colors?.colors['color-primary']}
      />
    </KycContainer>
  )
}
