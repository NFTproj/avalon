import { Suspense, useEffect, useState } from 'react'
import Image from 'next/image'

type ImageProps = {
  src?: string
  alt?: string
  width?: number
  height?: number
  loading?: 'lazy' | 'eager'
  className?: string
  colorClassName?: string
  fillColor?: string
  quality?: number
  responsive?: boolean
}

export default function ImageFromJSON({
  src = '',
  alt = '',
  width = 256,
  height = 256,
  loading = 'eager',
  className = '',
  colorClassName = '',
  fillColor,
  quality = 75,
}: Readonly<ImageProps>) {
  const [processedSrc, setProcessedSrc] = useState<string | null>(null)

  useEffect(() => {
    if (src) {
      // Tenta carregar dinamicamente a imagem a partir do caminho informado
      import(`@/assets/${src}`)
        .then((module) => {
          // Lida com diferentes formas de importação de SVG
          const originalSrc = module.default?.src || module.default

          // Se for um SVG e tiver fillColor definido, tenta substituir a cor
          if (typeof originalSrc === 'string' && fillColor) {
            // Faz uma requisição para buscar o conteúdo do SVG
            fetch(originalSrc)
              .then((response) => response.text())
              .then((svgContent) => {
                // Substitui as cores no conteúdo do SVG
                const processedSvgContent = svgContent
                  .replace(/fill="#08CEFF"/g, `fill="${fillColor}"`)
                  .replace(/#08CEFF/g, fillColor)
                  .replace(/stop-color="#08CEFF"/g, `stop-color="${fillColor}"`)

                // Converte o SVG processado para um Blob
                const blob = new Blob([processedSvgContent], {
                  type: 'image/svg+xml',
                })
                const processedSvgUrl = URL.createObjectURL(blob)

                setProcessedSrc(processedSvgUrl)
              })
              .catch((error) => {
                setProcessedSrc(originalSrc)
              })
          } else {
            setProcessedSrc(originalSrc)
          }
        })
        .catch((error) => {
        })
    }
  }, [src, fillColor])

  if (!processedSrc) {
    return null
  }

  return (
    <Suspense fallback={null}>
      <Image
        src={processedSrc}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        className={`${className} ${colorClassName}`}
        quality={quality}
      />
    </Suspense>
  )
}
