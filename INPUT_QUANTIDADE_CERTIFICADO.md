# Input de Quantidade com Sugestões - Certificate Emission

## Mudança Implementada

Substituído o `<select>` por um `<input type="number">` com `<datalist>` para sugestões, permitindo que o usuário:
- ✅ Digite qualquer valor manualmente
- ✅ Veja sugestões ao clicar no campo
- ✅ Selecione uma sugestão se quiser

## Código Anterior (Select)

```tsx
<select value={quantity} onChange={...}>
  <option value={0}>0 - 3000</option>
  <option value={500}>500</option>
  <option value={1000}>1000</option>
  ...
</select>
```

**Limitações:**
- ❌ Usuário só podia escolher valores pré-definidos
- ❌ Se quisesse 750, não tinha como
- ❌ Menos flexível

## Código Novo (Input + Datalist)

```tsx
<input
  type="number"
  value={quantity || ''}
  onChange={(e) => {
    const value = e.target.value === '' ? 0 : Number(e.target.value)
    setQuantity(value)
  }}
  onBlur={(e) => {
    // Validar ao sair do campo
    const value = Number(e.target.value)
    if (value > maxQuantity) {
      setQuantity(maxQuantity)
    } else if (value < 0) {
      setQuantity(0)
    }
  }}
  min={0}
  max={maxQuantity}
  step="any"
  list="quantity-suggestions"
  placeholder="Digite a quantidade"
/>
<datalist id="quantity-suggestions">
  {quantityOptions.map((value) => (
    <option key={value} value={value} />
  ))}
</datalist>
```

**Vantagens:**
- ✅ Usuário pode digitar qualquer valor (ex: 750, 1234, 2999)
- ✅ Sugestões aparecem ao clicar (500, 1000, 1500, etc)
- ✅ Validação automática no `onBlur`:
  - Se digitar mais que o máximo → ajusta para o máximo
  - Se digitar negativo → ajusta para 0
- ✅ Mais flexível e intuitivo

## Comportamento

### 1. Digitação Livre
Usuário pode digitar qualquer número:
- `750` ✅
- `1234` ✅
- `2999` ✅
- `3000` ✅ (máximo)

### 2. Sugestões
Ao clicar no campo ou começar a digitar, aparecem sugestões:
- 500
- 1000
- 1500
- 2000
- 2500
- 3000

### 3. Validação Automática
Ao sair do campo (`onBlur`):
- Se digitar `5000` (mais que 3000) → ajusta para `3000`
- Se digitar `-100` → ajusta para `0`

### 4. Placeholder
- Com saldo: "Digite a quantidade"
- Sem saldo: "Sem saldo disponível" (campo desabilitado)

## Lógica de Sugestões

As sugestões são geradas baseadas no saldo total:

```typescript
const step =
  maxQuantity <= 10 ? 1
  : maxQuantity <= 100 ? 10
  : maxQuantity <= 1000 ? 100
  : maxQuantity <= 10000 ? 500
  : Math.ceil(maxQuantity / 20)
```

**Exemplos:**

| Saldo | Step | Sugestões |
|-------|------|-----------|
| 50 | 10 | 10, 20, 30, 40, 50 |
| 500 | 100 | 100, 200, 300, 400, 500 |
| 3000 | 500 | 500, 1000, 1500, 2000, 2500, 3000 |
| 25000 | 1250 | 1250, 2500, 3750, ..., 25000 |

## Traduções

### PT-BR
```json
"quantity-placeholder": "Digite a quantidade",
"quantity-available": "Saldo disponível: {balance}",
"quantity-unavailable": "Sem saldo disponível",
"quantity-no-balance": "Você não possui saldo disponível para emissão deste certificado."
```

### EN-US (a adicionar)
```json
"quantity-placeholder": "Enter quantity",
"quantity-available": "Available balance: {balance}",
"quantity-unavailable": "No balance available",
"quantity-no-balance": "You don't have available balance to issue this certificate."
```

## Arquivos Modificados

1. ✅ `src/app/certificate-emission/components/EmissionCard.tsx`
   - Substituído `<select>` por `<input type="number">`
   - Adicionado `<datalist>` para sugestões
   - Validação no `onBlur`
   - Placeholder dinâmico

2. ✅ `src/data/slab/locales/pt-BR.json`
   - Atualizado `quantity-placeholder`
   - Adicionadas chaves de tradução

## Compatibilidade

O `<datalist>` é suportado em:
- ✅ Chrome/Edge (todos)
- ✅ Firefox (todos)
- ✅ Safari 12.1+
- ✅ Mobile (iOS Safari, Chrome Mobile)

## Testes Recomendados

1. ✅ Digitar valor manualmente (ex: 750)
2. ✅ Clicar e ver sugestões
3. ✅ Selecionar uma sugestão
4. ✅ Digitar valor maior que o máximo → deve ajustar
5. ✅ Digitar valor negativo → deve ajustar para 0
6. ✅ Campo desabilitado quando sem saldo
7. ✅ Emitir certificado com valor digitado
8. ✅ Testar em mobile

## Observações

- O `step="any"` permite decimais se necessário
- O `min` e `max` são informativos (validação real no `onBlur`)
- O console.log pode ser removido após confirmar funcionamento
- Sugestões não são obrigatórias, usuário pode ignorá-las
