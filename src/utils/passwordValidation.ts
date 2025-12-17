export interface PasswordRequirement {
    label: string
    test: (password: string) => boolean
    met?: boolean
}

export const passwordRequirements: PasswordRequirement[] = [
    {
        label: 'Mínimo de 8 caracteres',
        test: (password: string) => password.length >= 8,
    },
    {
        label: 'Pelo menos uma letra maiúscula',
        test: (password: string) => /[A-Z]/.test(password),
    },
    {
        label: 'Pelo menos uma letra minúscula',
        test: (password: string) => /[a-z]/.test(password),
    },
    {
        label: 'Pelo menos um número',
        test: (password: string) => /\d/.test(password),
    },
    {
        label: 'Pelo menos um caractere especial (!@#$%^&*)',
        test: (password: string) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
]

export function validatePassword(password: string): {
    isValid: boolean
    requirements: PasswordRequirement[]
    strength: 'weak' | 'medium' | 'strong'
} {
    const requirements = passwordRequirements.map((req) => ({
        ...req,
        met: req.test(password),
    }))

    const metCount = requirements.filter((req) => req.met).length
    const isValid = metCount === requirements.length

    let strength: 'weak' | 'medium' | 'strong' = 'weak'
    if (metCount >= 5) strength = 'strong'
    else if (metCount >= 3) strength = 'medium'

    return { isValid, requirements, strength }
}
