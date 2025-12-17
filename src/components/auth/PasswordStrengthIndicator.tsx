'use client'

import { validatePassword, PasswordRequirement } from '@/utils/passwordValidation'
import { FaCheck, FaTimes } from 'react-icons/fa'

interface PasswordStrengthIndicatorProps {
    password: string
    showRequirements?: boolean
}

export default function PasswordStrengthIndicator({
    password,
    showRequirements = true,
}: PasswordStrengthIndicatorProps) {
    const { requirements, strength } = validatePassword(password)

    const strengthColors = {
        weak: 'bg-red-500',
        medium: 'bg-yellow-500',
        strong: 'bg-green-500',
    }

    const strengthLabels = {
        weak: 'Fraca',
        medium: 'Média',
        strong: 'Forte',
    }

    const strengthWidth = {
        weak: 'w-1/3',
        medium: 'w-2/3',
        strong: 'w-full',
    }

    if (!password) return null

    return (
        <div className="space-y-3">
            {/* Barra de força */}
            <div className="space-y-1">
                <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-600">
                        Força da senha:
                    </span>
                    <span className={`text-xs font-semibold ${strength === 'strong' ? 'text-green-600' :
                            strength === 'medium' ? 'text-yellow-600' :
                                'text-red-600'
                        }`}>
                        {strengthLabels[strength]}
                    </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-300 ${strengthColors[strength]} ${strengthWidth[strength]}`}
                    />
                </div>
            </div>

            {/* Lista de requisitos */}
            {showRequirements && (
                <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-600">
                        Sua senha deve conter:
                    </p>
                    <ul className="space-y-1">
                        {requirements.map((req: PasswordRequirement, index: number) => (
                            <li
                                key={index}
                                className={`flex items-center gap-2 text-xs ${req.met ? 'text-green-600' : 'text-gray-500'
                                    }`}
                            >
                                {req.met ? (
                                    <FaCheck className="w-3 h-3 flex-shrink-0" />
                                ) : (
                                    <FaTimes className="w-3 h-3 flex-shrink-0" />
                                )}
                                <span>{req.label}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
