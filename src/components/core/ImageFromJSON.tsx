import { Suspense, useEffect, useState } from 'react'
import Image from 'next/image'

type ImageProps = {
  src?: string
  alt?: string
  width: number
  height: number
  loading?: 'lazy' | 'eager'
  placeholder?: 'empty' | 'blur'
}

export default function ImageFromJSON({
  src,
  alt,
  width,
  height,
  placeholder = 'blur',
  loading = 'eager',
}: ImageProps) {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null)

  useEffect(() => {
    if (src) {
      // Tenta carregar dinamicamente a imagem a partir do caminho informado
      import(`@/assets/logos/${src}`)
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
        alt={alt as string}
        width={width}
        height={height}
        placeholder={placeholder}
        loading={loading}
      />
    </Suspense>
  )
}
