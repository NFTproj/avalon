# Fix: Botão Metamask Desconfigurado em Inglês

## Problema Identificado

O botão "Sign up with Metamask" ficava desconfigurado quando o idioma estava em inglês porque:

1. **Largura fixa**: Os botões tinham `w-[210px]` (largura fixa de 210px)
2. **Texto mais longo**: "Sign up with Metamask" (22 caracteres) é mais longo que "Criar com Metamask" (19 caracteres)
3. **Overflow**: O texto não cabia dentro da largura fixa, causando quebra ou corte

## Solução Aplicada

### Arquivo: `src/app/register/components/StepZero.tsx`

**Antes:**
```tsx
<div className="flex flex-wrap gap-4 mb-6">
  <CustomButton
    className="shrink-0 w-[210px] h-[52px] font-bold"
    // ...
  />
  <CustomButton
    className="shrink-0 w-[210px] h-[52px] font-bold"
    // ...
  />
</div>
```

**Depois:**
```tsx
<div className="flex flex-col sm:flex-row gap-4 mb-6">
  <CustomButton
    className="w-full sm:w-auto sm:min-w-[210px] h-[52px] font-bold px-6"
    // ...
  />
  <CustomButton
    className="w-full sm:w-auto sm:min-w-[210px] h-[52px] font-bold px-6"
    // ...
  />
</div>
```

## Mudanças Implementadas

### 1. Container Responsivo
- **Antes**: `flex flex-wrap` - quebrava linha de forma imprevisível
- **Depois**: `flex flex-col sm:flex-row` - empilha verticalmente em mobile, horizontal em desktop

### 2. Botões Adaptáveis
- **Antes**: `w-[210px]` - largura fixa que não acomodava textos longos
- **Depois**: 
  - `w-full` - largura total em mobile
  - `sm:w-auto` - largura automática (ajusta ao conteúdo) em desktop
  - `sm:min-w-[210px]` - largura mínima de 210px em desktop
  - `px-6` - padding horizontal para espaçamento interno

### 3. Removido shrink-0
- Não é mais necessário com a nova abordagem responsiva

## Benefícios

✅ **Responsivo**: Funciona bem em mobile e desktop
✅ **Adaptável**: Acomoda textos de qualquer tamanho
✅ **Consistente**: Mantém aparência profissional em todos os idiomas
✅ **Acessível**: Melhor experiência em telas pequenas

## Idiomas Suportados

Testado com os seguintes textos:

| Idioma | Botão Email | Botão Metamask |
|--------|-------------|----------------|
| 🇧🇷 PT-BR | "Criar com E-mail" | "Criar com Metamask" |
| 🇺🇸 EN-US | "Sign up with Email" | "Sign up with Metamask" |

## Comportamento

### Mobile (< 640px)
- Botões empilhados verticalmente
- Cada botão ocupa 100% da largura
- Fácil de tocar

### Desktop (≥ 640px)
- Botões lado a lado
- Largura se ajusta ao conteúdo
- Mínimo de 210px cada
- Padding interno de 24px (px-6)

## Verificação

Para testar:
1. Acesse `/register`
2. Mude o idioma para inglês
3. Verifique que ambos os botões estão bem formatados
4. Teste em diferentes tamanhos de tela
