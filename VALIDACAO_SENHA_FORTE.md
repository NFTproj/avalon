# Validação de Senha Forte

## Resumo das Mudanças

Implementado sistema completo de validação de senha forte em todo o fluxo de autenticação da aplicação.

## Requisitos de Senha

As senhas agora devem atender aos seguintes critérios:

- ✅ Mínimo de 8 caracteres
- ✅ Pelo menos uma letra maiúscula (A-Z)
- ✅ Pelo menos uma letra minúscula (a-z)
- ✅ Pelo menos um número (0-9)
- ✅ Pelo menos um caractere especial (!@#$%^&*(),.?":{}|<>)

## Arquivos Criados

### 1. `src/utils/passwordValidation.ts`
Utilitário de validação com:
- Função `validatePassword()` que retorna se a senha é válida, lista de requisitos e força
- Array `passwordRequirements` com todos os critérios
- Cálculo de força da senha (fraca, média, forte)

### 2. `src/components/auth/PasswordStrengthIndicator.tsx`
Componente visual que mostra:
- Barra de progresso colorida indicando força da senha
- Lista de requisitos com checkmarks (✓) ou X (✗)
- Feedback em tempo real enquanto o usuário digita

### 3. `src/app/api/auth/change-password/route.ts`
Nova rota de API para mudança de senha no perfil com validação backend

### 4. `src/app/api/auth/verify-reset-password/route.ts`
Nova rota de API para verificação e redefinição de senha com validação backend

### 5. `src/utils/__tests__/passwordValidation.test.ts`
Testes unitários para a validação de senha

## Arquivos Modificados

### Frontend

1. **`src/app/register/components/StepTwo.tsx`**
   - Adicionado indicador de força da senha
   - Validação antes de permitir continuar
   - Mensagem de erro específica para senha fraca

2. **`src/app/login/components/ResetPasswordModal.tsx`**
   - Adicionado indicador de força da senha
   - Validação ao redefinir senha
   - minLength atualizado de 6 para 8

3. **`src/app/profile/page.tsx`**
   - Adicionado indicador de força da senha
   - Validação ao mudar senha no perfil
   - Mensagem atualizada

### Backend

4. **`src/app/api/auth/register/route.ts`**
   - Validação de senha forte com regex
   - Mensagem de erro descritiva

## Como Funciona

### Validação Frontend
1. Usuário digita a senha
2. Componente `PasswordStrengthIndicator` mostra em tempo real:
   - Barra de força (vermelha/amarela/verde)
   - Lista de requisitos com status
3. Ao submeter, função `validatePassword()` verifica todos os critérios
4. Se inválida, mostra erro e impede envio

### Validação Backend
1. API recebe a senha
2. Regex valida todos os requisitos: `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/`
3. Se inválida, retorna erro 400 com mensagem descritiva
4. Dupla camada de segurança (frontend + backend)

## Locais com Validação

✅ **Cadastro** (`/register`) - StepTwo
✅ **Reset de Senha** (Modal no login)
✅ **Mudança de Senha** (`/profile`)
✅ **APIs Backend** (register, change-password, verify-reset-password)

## Exemplos

### Senhas Rejeitadas ❌
- `12345678` - Sem letras maiúsculas, minúsculas ou caracteres especiais
- `abcdefgh` - Sem letras maiúsculas, números ou caracteres especiais
- `Abc12345` - Sem caracteres especiais
- `Abc123!` - Menos de 8 caracteres

### Senhas Aceitas ✅
- `Abc123!@#`
- `MyP@ssw0rd`
- `Str0ng!Pass`
- `Test@123Pass`

## Testes

Execute os testes com:
```bash
npm test passwordValidation
```

## Melhorias Futuras (Opcional)

- [ ] Verificar senha contra lista de senhas comuns
- [ ] Impedir uso de informações pessoais (nome, email)
- [ ] Histórico de senhas (não permitir reutilização)
- [ ] Força mínima configurável por ambiente
- [ ] Integração com serviços como Have I Been Pwned
