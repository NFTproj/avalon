# Fix: Setas de Navegação dos Cards de Tokens

## Problema Identificado

As setas de navegação do carousel de tokens na home (rota `/`) não estavam sendo exibidas corretamente. Possíveis causas:
- Setas posicionadas fora do container sem espaço adequado
- Overflow cortando as setas
- Z-index incorreto
- Estilos não sendo aplicados corretamente

## Solução Aplicada

### 1. Ajuste no Container do Swiper

**Arquivo:** `src/components/landingPage/TokenShowcase.tsx`

**Antes:**
```tsx
<div className="mb-16">
  <Swiper ... />
</div>
```

**Depois:**
```tsx
<div className="mb-16 relative px-8 md:px-12 lg:px-16">
  <Swiper ... />
</div>
```

**Mudanças:**
- ✅ `relative` - Contexto de posicionamento para as setas absolutas
- ✅ `px-8 md:px-12 lg:px-16` - Padding horizontal responsivo para dar espaço às setas

### 2. Melhorias nos Estilos CSS

**Arquivo:** `src/app/globals.css`

#### A. Overflow Forçado
```css
.tokens-swiper {
  overflow: visible !important;
}
```

#### B. Posicionamento Responsivo das Setas
```css
/* Mobile */
.tokens-swiper .swiper-button-next { right: -12px !important; }
.tokens-swiper .swiper-button-prev { left: -12px !important; }

/* Tablet (≥640px) */
@media (min-width: 640px) {
  .tokens-swiper .swiper-button-next { right: -16px !important; }
  .tokens-swiper .swiper-button-prev { left: -16px !important; }
}

/* Desktop médio (≥768px) */
@media (min-width: 768px) {
  .tokens-swiper .swiper-button-next { right: -20px !important; }
  .tokens-swiper .swiper-button-prev { left: -20px !important; }
}

/* Desktop grande (≥1024px) */
@media (min-width: 1024px) {
  .tokens-swiper .swiper-button-next { right: -24px !important; }
  .tokens-swiper .swiper-button-prev { left: -24px !important; }
}
```

#### C. Garantir Visibilidade
```css
.swiper-button-next,
.swiper-button-prev {
  z-index: 10 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}
```

#### D. Estado Desabilitado
```css
.swiper-button-disabled {
  opacity: 0.35 !important;
  cursor: not-allowed !important;
  pointer-events: none !important;
}
```

## Estilos Mantidos

Os estilos base do Swiper foram mantidos:

```css
.swiper-button-next,
.swiper-button-prev {
  color: #08CEFF !important;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  width: 44px !important;
  height: 44px !important;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  transition: all 0.3s ease;
}

.swiper-button-next:hover,
.swiper-button-prev:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.1);
}

.swiper-button-next::after,
.swiper-button-prev::after {
  font-size: 18px !important;
  font-weight: bold;
}
```

## Comportamento Esperado

### Desktop (≥1024px)
- ✅ Setas posicionadas 24px fora do carousel
- ✅ Padding de 64px (lg:px-16) no container
- ✅ Setas totalmente visíveis e clicáveis

### Tablet (640px - 1023px)
- ✅ Setas posicionadas 16-20px fora do carousel
- ✅ Padding de 48px (md:px-12) no container
- ✅ Setas visíveis sem cortes

### Mobile (<640px)
- ✅ Setas posicionadas 12px fora do carousel
- ✅ Padding de 32px (px-8) no container
- ✅ Setas acessíveis em telas pequenas

## Estados das Setas

### Ativa
- Cor: #08CEFF (azul primário)
- Background: rgba(255, 255, 255, 0.9)
- Opacidade: 100%
- Cursor: pointer
- Hover: scale(1.1)

### Desabilitada
- Opacidade: 35%
- Cursor: not-allowed
- Sem interação (pointer-events: none)

## Testes Recomendados

1. ✅ Verificar setas em diferentes tamanhos de tela
2. ✅ Testar navegação (próximo/anterior)
3. ✅ Verificar estado desabilitado no início/fim
4. ✅ Testar hover das setas
5. ✅ Verificar em diferentes navegadores
6. ✅ Testar com 4, 5, 6+ tokens

## Observações

- As setas só aparecem quando há mais de 3 tokens (quando o carousel é ativado)
- Com 3 ou menos tokens, usa layout em grid sem carousel
- O `!important` é necessário para sobrescrever estilos padrão do Swiper
- O padding responsivo garante espaço adequado em todas as telas
