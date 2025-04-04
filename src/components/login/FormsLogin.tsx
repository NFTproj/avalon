// src/components/register/LoginForm.tsx
'use client'

import { FormEvent, useContext, useState } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import CustomButton from '../core/Buttons/CustomButton'
import CustomInput from '../core/Inputs/CustomInput'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

export default function LoginForm() {
  const { colors, texts } = useContext(ConfigContext)
  const loginTexts = texts?.register?.['step-four']

  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    // Lógica de login aqui
    console.log('Login realizado!')
  }

  return (
    <div className="w-full max-w-md">
      <h1
        className="text-3xl font-bold mb-4"
        style={{ color: colors?.colors['color-primary'] }}
      >
        {loginTexts?.title || 'Acesse a sua conta'}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
        <p className="text-sm text-gray-600">
          {loginTexts?.paragraphEmail || 'Seu e-mail'}
        </p>

        <CustomInput
          type="email"
          placeholder={loginTexts?.placeholders?.email || 'email@email.com'}
          label={loginTexts?.labels?.email || ''}
          className="border-gray-300 rounded-xl focus:outline-none focus:ring-2"
        />

        <p className="text-sm text-gray-600">
          {loginTexts?.paragraphPassword || 'Digite a sua senha'}
        </p>

        <CustomInput
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder={loginTexts?.placeholders?.password || '••••••••'}
          label={loginTexts?.labels?.password || ''}
          className="border-gray-300 rounded-xl focus:outline-none focus:ring-2 pr-10"
          iconRight={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          }
        />

        <div className="w-full mt-4">
          <CustomButton
            text={loginTexts?.['button-login'] || 'Entrar'}
            className="w-full h-[52px] font-bold"
            borderColor={colors?.border['border-primary']}
            textColor={colors?.colors['color-primary']}
            type="submit"
          />
        </div>
      </form>
    </div>
  )
}
