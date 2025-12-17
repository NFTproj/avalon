import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    try {
        const { email, otpCode, newPassword } = await req.json()

        if (!email || !otpCode || !newPassword) {
            return NextResponse.json(
                { error: 'E-mail, código e nova senha são obrigatórios' },
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
        const clientId = process.env.CLIENT_ID

        if (!apiUrl || !clientId) {
            return NextResponse.json(
                { error: 'Configuração do servidor ausente' },
                { status: 500 },
            )
        }

        const payload = {
            clientId,
            email,
            otpCode,
            newPassword,
        }

        const response = await fetch(`${apiUrl}/auth/verify-reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })

        const data = await response.json()

        if (!response.ok) {
            let errorMessage = 'Erro ao redefinir senha'

            if (data.message === 'Invalid OTP code' || data.error === 'BadRequestError') {
                errorMessage = 'Código de verificação inválido ou expirado'
            } else if (data.message) {
                errorMessage = data.message
            } else if (data.error && typeof data.error === 'string') {
                errorMessage = data.error
            }

            return NextResponse.json({ error: errorMessage }, { status: response.status })
        }

        return NextResponse.json({
            success: true,
            message: 'Senha redefinida com sucesso',
            ...data
        })
    } catch (error: any) {
        let errorMessage = 'Erro interno do servidor'

        if (error.code === 'UND_ERR_CONNECT_TIMEOUT' || error.message?.includes('timeout')) {
            errorMessage = 'Tempo de conexão esgotado. Tente novamente em alguns instantes.'
        } else if (error.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
            errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão.'
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        )
    }
}
