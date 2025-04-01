'use client'

import { InputHTMLAttributes, FC, ReactNode } from 'react'

interface CustomInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  iconRight?: ReactNode
  iconLeft?: ReactNode
}

const CustomInput: FC<CustomInputProps> = ({
  label,
  error,
  iconRight,
  iconLeft,
  className = '',
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-semibold">{label}</label>}

      <div className="relative">
        {iconLeft && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            {iconLeft}
          </div>
        )}

        <input
          {...props}
          className={`
            w-full p-2 pr-10 pl-${iconLeft ? '10' : '3'}
            border focus:outline-none focus:ring-2
            rounded-xl text-gray-800 placeholder:text-gray-400
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${className}
          `}
        />

        {iconRight && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer">
            {iconRight}
          </div>
        )}
      </div>

      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}

export default CustomInput
