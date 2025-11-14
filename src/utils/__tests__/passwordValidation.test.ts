import { validatePassword, passwordRequirements } from '../passwordValidation'

describe('passwordValidation', () => {
    describe('validatePassword', () => {
        it('deve rejeitar senhas fracas', () => {
            const weakPasswords = ['12345678', 'abcdefgh', 'ABCDEFGH', 'abc123', 'Abc123']

            weakPasswords.forEach(password => {
                const result = validatePassword(password)
                expect(result.isValid).toBe(false)
            })
        })

        it('deve aceitar senhas fortes', () => {
            const strongPasswords = [
                'Abc123!@#',
                'MyP@ssw0rd',
                'Str0ng!Pass',
                'Test@123Pass'
            ]

            strongPasswords.forEach(password => {
                const result = validatePassword(password)
                expect(result.isValid).toBe(true)
                expect(result.strength).toBe('strong')
            })
        })

        it('deve validar tamanho mínimo de 8 caracteres', () => {
            const result = validatePassword('Abc12!@')
            expect(result.requirements[0].met).toBe(false)
        })

        it('deve validar presença de letra maiúscula', () => {
            const result = validatePassword('abc123!@#')
            expect(result.requirements[1].met).toBe(false)
        })

        it('deve validar presença de letra minúscula', () => {
            const result = validatePassword('ABC123!@#')
            expect(result.requirements[2].met).toBe(false)
        })

        it('deve validar presença de número', () => {
            const result = validatePassword('Abcdefg!@#')
            expect(result.requirements[3].met).toBe(false)
        })

        it('deve validar presença de caractere especial', () => {
            const result = validatePassword('Abc12345')
            expect(result.requirements[4].met).toBe(false)
        })

        it('deve calcular força da senha corretamente', () => {
            expect(validatePassword('abc').strength).toBe('weak')
            expect(validatePassword('Abc123').strength).toBe('medium')
            expect(validatePassword('Abc123!@#').strength).toBe('strong')
        })
    })

    describe('passwordRequirements', () => {
        it('deve ter 5 requisitos', () => {
            expect(passwordRequirements).toHaveLength(5)
        })

        it('cada requisito deve ter label e test', () => {
            passwordRequirements.forEach(req => {
                expect(req.label).toBeDefined()
                expect(typeof req.test).toBe('function')
            })
        })
    })
})
