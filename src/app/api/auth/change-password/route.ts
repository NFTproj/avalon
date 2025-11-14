import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    try {
        const { newPassword } = await req.json()

        if (!newPassword) {
            return NextResponse.json(
                { error: 'Nova senha é obrigatória' },
                { status: 400 },
            )
        }

        /* ---------- validação de senha forte ---------- */
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/
        if (!passwordRegex.test(newPassword)) {
            return NextResponse.json(
                {
                    error: 'A senha deve ter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais'
                },
                { status: 400 },
            )
        }

        const apiUrl = process.env.BLOXIFY_URL_BASE
        const apiKey = process.env.BLOXIFY_API_KEY
        const accessToken = req.cookies.get('accessToken')?.value

        if (!apiUrl || !apiKey) {
            return NextResponse.json(
                { error: 'Configuração inválida' },
                { status: 500 },
            )
        }

        if (!accessToken) {
            return NextResponse.json(
                { error: 'Não autenticado' },
                { status: 401 },
            )
        }

        const response = await fetch(`${apiUrl}/user/password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ password: newPassword }),
        })

        const data = await response.json()

        if (!response.ok) {
            return NextResponse.json(
                { error: data.message || 'Erro ao atualizar senha' },
                { status: response.status },
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json(
            { error: 'Erro no servidor ao atualizar senha' },
            { status: 500 },
        )
    }
}
