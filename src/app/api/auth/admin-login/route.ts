// app/api/auth/admin-login/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    // Verificar credenciais admin
    if (email === 'admin@admin' && password === 'admin') {
      // Criar cookies HTTP-only com token admin especial
      const res = NextResponse.json({ success: true }, { status: 200 })

      // Token admin especial que será reconhecido pela rota /api/auth/me
      res.cookies.set('accessToken', 'admin-token-special', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 dias
      })

      res.cookies.set('refreshToken', 'admin-refresh-token-special', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 dias
      })

      return res
    }

    // Se as credenciais não forem admin, retornar erro
    return NextResponse.json(
      { error: 'Credenciais inválidas' },
      { status: 401 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro no servidor de login admin' },
      { status: 500 }
    )
  }
}
