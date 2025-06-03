'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import StepConnectWallet from './StepConnectWallet '
import StepSignMessage from './StepSignMessage'

export default function MetamaskSteps() {
  const [step, setStep] = useState<1 | 2>(1)
  const { isConnected } = useAccount()

  // Quando a carteira conecta no passo 1, avança automaticamente
  useEffect(() => {
    if (step === 1 && isConnected) {
      setStep(2)
    }
  }, [isConnected, step])

  return (
    <>
      {step === 1 && <StepConnectWallet />}
      {step === 2 && <StepSignMessage />}
    </>
  )
}
