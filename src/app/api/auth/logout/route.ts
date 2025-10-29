// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const apiUrl = process.env.BLOXIFY_URL_BASE
    const accessToken = req.cookies.get('accessToken')?.value

    // Chamar o endpoint de logout do servidor externo se houver token
    if (apiUrl && accessToken) {
      try {
        await fetch(`${apiUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        })
      } catch (error) {
        console.error('[LOGOUT] Erro ao chamar servidor externo:', error)
        // Continua mesmo se falhar no servidor externo
      }
    }

    // Limpar cookies
    const res = NextResponse.json({ 
      success: true,
      message: 'Logout realizado com sucesso'
    })
    res.cookies.set('accessToken', '', { path: '/', maxAge: 0 })
    res.cookies.set('refreshToken', '', { path: '/', maxAge: 0 })
    return res
  } catch (error) {
    console.error('[LOGOUT ERROR]', error)
    // Mesmo com erro, limpa os cookies
    const res = NextResponse.json({ 
      success: true,
      message: 'Logout realizado com sucesso'
    })
    res.cookies.set('accessToken', '', { path: '/', maxAge: 0 })
    res.cookies.set('refreshToken', '', { path: '/', maxAge: 0 })
    return res
  }
}
