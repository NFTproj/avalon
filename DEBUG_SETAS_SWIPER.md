# Debug: Setas do Swiper Não Aparecem

## Verificações para Fazer

### 1. Abra o Console do Navegador (F12)

Verifique se aparecem as seguintes mensagens:
```
TokenShowcase mounted, tokens count: X
Swiper initialized with navigation
```

Se não aparecer "Swiper initialized", o Swiper não está sendo renderizado.

### 2. Inspecione o HTML

No DevTools, procure por:
```html
<div class="swiper tokens-swiper">
  <div class="swiper-button-next"></div>
  <div class="swiper-button-prev"></div>
</div>
```

**Perguntas:**
- As divs `.swiper-button-next` e `.swiper-button-prev` existem?
- Elas têm a classe `.swiper-button-disabled`?
- Qual é o estilo computado delas (display, opacity, visibility)?

### 3. Verifique Quantos Tokens Existem

O carousel só aparece se `tokens.length > 3`.

**No console, digite:**
```javascript
// Verificar quantos tokens há
document.querySelectorAll('.swiper-slide').length
```

Se retornar 3 ou menos, o carousel não será usado (usa grid estático).

### 4. Verifique os Estilos CSS

**No console, digite:**
```javascript
// Verificar se as setas existem
const next = document.querySelector('.swiper-button-next')
const prev = document.querySelector('.swiper-button-prev')

console.log('Next button:', next)
console.log('Prev button:', prev)

if (next) {
  const styles = window.getComputedStyle(next)
  console.log('Display:', styles.display)
  console.log('Opacity:', styles.opacity)
  console.log('Visibility:', styles.visibility)
  console.log('Z-index:', styles.zIndex)
  console.log('Position:', styles.position)
  console.log('Right:', styles.right)
}
```

### 5. Verifique se o CSS do Swiper foi Carregado

**No console, digite:**
```javascript
// Verificar se os estilos do Swiper foram carregados
const stylesheets = Array.from(document.styleSheets)
const swiperStyles = stylesheets.filter(sheet => {
  try {
    return sheet.href && sheet.href.includes('swiper')
  } catch(e) {
    return false
  }
})

console.log('Swiper stylesheets:', swiperStyles.length)
```

## Possíveis Causas e Soluções

### Causa 1: Menos de 4 Tokens
**Sintoma:** Não vê o carousel, apenas cards em grid
**Solução:** Adicione mais tokens no banco de dados

### Causa 2: CSS do Swiper Não Carregado
**Sintoma:** Setas não têm estilo, aparecem como texto
**Solução:** Verificar se os imports estão corretos:
```typescript
import 'swiper/css'
import 'swiper/css/navigation'
```

### Causa 3: Módulo Navigation Não Registrado
**Sintoma:** Setas não aparecem no DOM
**Solução:** Verificar se está passando o módulo:
```typescript
modules={[Navigation, A11y]}
```

### Causa 4: Overflow Cortando as Setas
**Sintoma:** Setas existem mas não são visíveis
**Solução:** Já aplicado - container com padding e overflow visible

### Causa 5: Z-index Baixo
**Sintoma:** Setas ficam atrás dos cards
**Solução:** Já aplicado - z-index: 10 !important

## Teste Manual Rápido

Adicione este código temporariamente no `TokenShowcase.tsx` após o Swiper:

```tsx
{!isLoading && tokens.length > 3 && isMounted && (
  <div className="mb-16 relative px-8 md:px-12 lg:px-16">
    {/* Botões de teste visíveis */}
    <button 
      className="absolute left-0 top-1/2 -translate-y-1/2 z-50 bg-red-500 text-white p-4 rounded-full"
      onClick={() => console.log('Test button clicked')}
    >
      ← TEST
    </button>
    <button 
      className="absolute right-0 top-1/2 -translate-y-1/2 z-50 bg-red-500 text-white p-4 rounded-full"
      onClick={() => console.log('Test button clicked')}
    >
      TEST →
    </button>
    
    <Swiper ...>
      ...
    </Swiper>
  </div>
)}
```

Se os botões de teste aparecem mas as setas do Swiper não, o problema é específico do Swiper.

## Informações Necessárias

Por favor, me informe:

1. ✅ Quantos tokens aparecem na home? (console.log mostra)
2. ✅ As divs `.swiper-button-next` e `.swiper-button-prev` existem no HTML?
3. ✅ Qual é o `display` computado das setas?
4. ✅ Há algum erro no console?
5. ✅ O carousel funciona (consegue arrastar os cards)?
6. ✅ Está testando em qual navegador e tamanho de tela?

## Solução Alternativa: Botões Customizados

Se o problema persistir, posso criar botões customizados fora do Swiper:

```tsx
const [swiperInstance, setSwiperInstance] = useState(null)

<button onClick={() => swiperInstance?.slidePrev()}>←</button>
<Swiper onSwiper={setSwiperInstance} ...>
<button onClick={() => swiperInstance?.slideNext()}>→</button>
```
