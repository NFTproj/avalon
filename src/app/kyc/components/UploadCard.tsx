'use client'

import { useContext, useRef, useState } from 'react'
import { FiUploadCloud, FiCheckCircle, FiX } from 'react-icons/fi'
import { ConfigContext } from '@/contexts/ConfigContext'

interface UploadCardProps {
  label: string
  onFileChange: (file: File | null) => void
  uploadedFile?: File | null
}

export default function UploadCard({ label, onFileChange, uploadedFile }: UploadCardProps) {
  const { colors, texts } = useContext(ConfigContext)
  const inputRef = useRef<HTMLInputElement>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [filename, setFilename] = useState<string | null>(uploadedFile?.name || null)

  const getText = (key: string, fallback: string) =>
    (texts as any)?.kyc?.[key] || fallback

  const handleClick = () => inputRef.current?.click()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFilename(file.name)
      setProgress(0)
      simulateUpload(file)
    }
  }

  const simulateUpload = (file: File) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setProgress(progress)
      if (progress >= 100) {
        clearInterval(interval)
        setProgress(null)
        onFileChange(file)
      }
    }, 100)
  }

  const handleRemove = () => {
  setFilename(null)
  setProgress(null)
  if (inputRef.current) {
    inputRef.current.value = '' 
  }
  onFileChange(null)
}

  return (
    <div className="flex flex-col items-center w-full sm:w-[calc(50%-0.5rem)]">
      <div
        className="flex flex-col items-center justify-between border border-gray-400 rounded-xl w-full h-[220px] p-4 cursor-pointer hover:shadow-md transition"
        onClick={handleClick}
      >
        <p className="text-sm text-gray-500 mb-2 text-center">{label}</p>

        <div className="flex-1 flex items-center justify-center">
          {uploadedFile ? (
            <FiCheckCircle size={40} className="text-green-500" />
          ) : (
            <FiUploadCloud
              size={40}
              className="text-[color:var(--tw-text-opacity)]"
              style={{ color: colors?.colors['color-secondary'] || '#60a5fa' }}
            />
          )}
        </div>

        <p className="text-sm text-gray-700 mt-2">
          {uploadedFile
            ? getText('upload-complete', 'Upload completo')
            : getText('upload-file', 'Fazer upload PDF')}
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {filename && (
        <div className="relative mt-2 w-full text-sm text-gray-700">
          <span className="block truncate">{filename}</span>
          {progress !== null ? (
            <div className="w-full bg-gray-200 rounded h-2 mt-1">
              <div
                className="bg-blue-500 h-2 rounded"
                style={{ width: `${progress}%` }}
              />
            </div>
          ) : (
            <button
              onClick={handleRemove}
              className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full p-1 text-gray-600 hover:text-red-500"
              title={getText('remove-file', 'Remover arquivo')}
            >
              <FiX size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
