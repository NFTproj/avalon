import { Suspense, useEffect, useState } from 'react'
import Image from 'next/image'

type ImageProps = {
  src?: string
  alt?: string
  width?: number
  height?: number
  loading?: 'lazy' | 'eager'
  className?: string
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
  quality = 75,
}: Readonly<ImageProps>) {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null)

  useEffect(() => {
    if (src) {
      // Tenta carregar dinamicamente a imagem a partir do caminho informado
      import(`@/assets/${src}`)
        .then((module) => {
          setLoadedSrc(module.default)
        })
        .catch((error) => {
          console.error('Erro ao carregar a imagem:', error)
        })
    }
  }, [src])

  if (!loadedSrc) {
    return
  }

  return (
    <Suspense fallback={null}>
      <Image
        src={loadedSrc}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        className={className}
        quality={quality}
      />
    </Suspense>
  )
}
