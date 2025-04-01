'use client'

import { useState } from 'react'
import StepZero from './StepZero'
import StepOne from './StepOne'
import StepTwo from './StepTwo'
import LoadingOverlay from '../commom/LoadingOverlay'
import StepThree from './StepThree'
import StepFour from './StepFour'

export default function Steps() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Avançar step (com loading simulado de 1s)
  const nextStep = async () => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
    setStep(prev => prev + 1)
  }

  // Retroceder step (para o botão "Voltar")
  const prevStep = () => {
    setStep(prev => prev - 1)
  }

  return (
    <div className="relative">
      {/* Overlay de carregamento */}
      {loading && <LoadingOverlay />}

      {step === 1 && <StepZero nextStep={nextStep} />}
      {step === 2 && <StepOne nextStep={nextStep} />}
      {step === 3 && <StepTwo nextStep={nextStep} prevStep={prevStep} />}
      {step === 4 && <StepThree nextStep={nextStep} />}
      {step === 5 && <StepFour nextStep={nextStep} prevStep={prevStep} />}
    </div>
  )
}
