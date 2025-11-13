import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'E-mail é obrigatório' }, { status: 400 })
    }

    const apiUrl = process.env.BLOXIFY_URL_BASE
    const clientId = process.env.CLIENT_ID

    if (!apiUrl || !clientId) {
      return NextResponse.json({ error: 'Configuração do servidor ausente' }, { status: 500 })
    }

    const payload = {
      clientId,
      email,
    }

    const response = await fetch(`${apiUrl}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      // Traduzir mensagens de erro do servidor para mensagens amigáveis
      let errorMessage = 'Erro ao enviar e-mail de recuperação'
      
      if (data.message === 'User not found.' || data.error === 'BadRequestError') {
        errorMessage = 'E-mail não encontrado. Verifique se o e-mail está correto.'
      } else if (data.message) {
        errorMessage = data.message
      } else if (data.error && typeof data.error === 'string') {
        errorMessage = data.error
      }
      
      return NextResponse.json({ error: errorMessage }, { status: response.status })
    }

    return NextResponse.json({
      success: true,
      message: 'E-mail de recuperação enviado com sucesso',
      ...data
    })
  } catch (error: any) {
    
    // Tratar erros de timeout e conexão
    let errorMessage = 'Erro interno do servidor'
    
    if (error.code === 'UND_ERR_CONNECT_TIMEOUT' || error.message?.includes('timeout')) {
      errorMessage = 'Tempo de conexão esgotado. O servidor pode estar temporariamente indisponível. Tente novamente em alguns instantes.'
    } else if (error.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
      errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.'
    } else if (error.cause?.code === 'UND_ERR_CONNECT_TIMEOUT') {
      errorMessage = 'Tempo de conexão esgotado. O servidor pode estar temporariamente indisponível. Tente novamente em alguns instantes.'
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}