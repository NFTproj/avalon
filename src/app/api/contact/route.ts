import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getClientConfig } from '@/app/lib/config'

export async function POST(req: NextRequest) {
  const TO_EMAIL = process.env.EMAIL_SEND
  const API_KEY = process.env.MAILERSEND_API_KEY

  try {
    let body
    try {
      body = await req.json()
    } catch (parseError) {
      console.error('[API Error] Erro ao fazer parse do JSON:', parseError)
      return NextResponse.json(
        { error: 'Erro ao processar dados do formulário' },
        { status: 400 },
      )
    }

    const { name, email, company, message } = body

    // Validação básica
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não preenchidos' },
        { status: 400 },
      )
    }

    if (!API_KEY) {
      console.error('❌ ERRO: MAILERSEND_API_KEY não configurada')
      console.error('💡 Solução: configure no .env.local, por exemplo:')
      console.error('   MAILERSEND_API_KEY=seu_token_aqui')
      console.error('   EMAIL_SEND=contato@blocklize.io')
      return NextResponse.json(
        {
          error:
            'Configuração de email ausente. Defina MAILERSEND_API_KEY no arquivo .env.local.',
        },
        { status: 500 },
      )
    }

    // Escapar HTML para prevenir XSS
    const escapeHtml = (text: string) => {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
    }

    const safeName = escapeHtml(name)
    const safeEmail = escapeHtml(email)
    const safePhone = company ? escapeHtml(company) : null
    const safeMessage = escapeHtml(message)

    // Busca as cores do whitelabel atual
    const config = await getClientConfig({ locale: 'pt-BR', theme: 'light' })
    const colors = config.colors

    // Função auxiliar para converter hex para rgba
    const hexToRgba = (hex: string, alpha: number = 1): string => {
      const h = hex.trim().replace('#', '')
      const r = parseInt(h.substring(0, 2), 16)
      const g = parseInt(h.substring(2, 4), 16)
      const b = parseInt(h.substring(4, 6), 16)
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }

    // Extrai cores principais do tema
    const primaryColor =
      colors?.['colors-base']?.['color-primary']?.trim() || '#1D6FD6'
    const secondaryColor =
      colors?.['colors-base']?.['color-tertiary']?.trim() || '#0284C7'
    const bgDark =
      colors?.background?.['background-sixteen']?.trim() || '#030712'
    const bgDarkSecondary =
      colors?.background?.['background-quaternary']?.trim() || '#111827'
    const textPrimary = colors?.colors?.['color-primary']?.trim() || '#1F2937'
    const textSecondary =
      colors?.colors?.['color-secondary']?.trim() || '#6B7280'

    console.log('📧 Email de destino:', TO_EMAIL)

    // Template HTML do email usando cores do whitelabel
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; background-color: ${bgDark};">
        <div style="border-radius: 14px; overflow: hidden; border: 1px solid ${hexToRgba(primaryColor, 0.18)}; box-shadow: 0 18px 45px rgba(0, 0, 0, 0.55); background: radial-gradient(circle at top left, ${hexToRgba(primaryColor, 0.13)}, transparent 55%), radial-gradient(circle at bottom right, ${hexToRgba(secondaryColor, 0.35)}, transparent 55%), ${bgDark};">
          
          <!-- Header -->
          <div style="padding: 18px 24px; border-bottom: 1px solid ${hexToRgba(primaryColor, 0.18)}; background: linear-gradient(90deg, ${hexToRgba(primaryColor, 0.08)}, ${hexToRgba(secondaryColor, 0.24)}, ${hexToRgba(primaryColor, 0.08)});">
            <p style="margin: 0; font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255,255,255,0.62);">
              Novo formulário recebido
            </p>
            <h2 style="margin: 4px 0 0 0; font-size: 20px; color: #ffffff;">
              📩 Contato pelo site TokenGrid
            </h2>
          </div>

          <!-- Dados principais -->
          <div style="padding: 22px 24px 8px 24px;">
            <p style="margin: 0 0 14px 0; font-size: 13px; color: rgba(255,255,255,0.72);">
              Você recebeu um novo contato através do formulário do site. Abaixo estão os detalhes enviados:
            </p>

            <table cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; margin-top: 6px;">
              <tbody>
                <tr>
                  <td style="padding: 8px 10px; width: 150px; font-size: 13px; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 0.08em;">
                    Nome
                  </td>
                  <td style="padding: 8px 10px; font-size: 14px; color: #ffffff; font-weight: 500; border-left: 2px solid ${hexToRgba(primaryColor, 0.4)};">
                    ${safeName}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 10px; width: 150px; font-size: 13px; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 0.08em;">
                    Email
                  </td>
                  <td style="padding: 8px 10px; font-size: 14px; color: ${primaryColor}; font-weight: 500; border-left: 2px solid ${hexToRgba(primaryColor, 0.4)};">
                    ${safeEmail}
                  </td>
                </tr>
                ${
                  safePhone
                    ? `
                <tr>
                  <td style="padding: 8px 10px; width: 150px; font-size: 13px; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 0.08em;">
                    Telefone
                  </td>
                  <td style="padding: 8px 10px; font-size: 14px; color: #ffffff; border-left: 2px solid ${hexToRgba(secondaryColor, 0.55)};">
                    ${safePhone}
                  </td>
                </tr>
                `
                    : ''
                }
              </tbody>
            </table>
          </div>

          <!-- Mensagem -->
          <div style="padding: 0 24px 22px 24px; margin-top: 10px;">
            <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: rgba(255,255,255,0.7);">
              Mensagem enviada
            </p>
            <div style="padding: 12px 14px; border-radius: 10px; background: ${hexToRgba(bgDarkSecondary, 0.9)}; border: 1px solid ${hexToRgba(secondaryColor, 0.7)};">
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.9); white-space: pre-wrap;">
                ${safeMessage}
              </p>
            </div>
          </div>

          <!-- Rodapé -->
          <div style="padding: 14px 24px 18px 24px; border-top: 1px solid rgba(255,255,255,0.06); background: ${bgDarkSecondary};">
            <p style="margin: 0 0 4px 0; font-size: 11px; color: rgba(255,255,255,0.55);">
              Este email foi enviado automaticamente através do site.
            </p>
            <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.35);">
              Caso tenha qualquer dúvida, basta responder diretamente a este email.
            </p>
          </div>
        </div>
      </div>
    `

    // Envio via MailerSend
    const response = await fetch('https://api.mailersend.com/v1/email', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: {
          email: 'contato@blocklize.io',
          name: 'Blocklize Formulário',
        },
        to: [
          {
            email: TO_EMAIL,
            name: 'Contato Blocklize',
          },
        ],
        subject: '📩 Novo Formulário de Contato',
        html: emailHtml,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        `MailerSend API error: ${response.status} - ${JSON.stringify(
          errorData,
        )}`,
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('[MailerSend Error]', error.message)
    } else {
      console.error('[MailerSend Error]', error)
    }

    return NextResponse.json(
      {
        error: 'Erro ao enviar e-mail',
      },
      { status: 500 },
    )
  }
}
