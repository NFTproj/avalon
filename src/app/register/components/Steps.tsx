'use client'

import LoadingOverlay from '@/components/common/LoadingOverlay'
import StepZero from './StepZero'
import StepOne from './StepOne'
import StepTwo from './StepTwo'
import StepThree from './StepThree'
import StepFour from './StepFour'
import useRegister from '@/lib/hooks/useRegister'

export default function Steps() {
  const {
    step,
    loading,
    next,
    back,
    updateField,
    formData,
    registrationError,
    resend,
  } = useRegister()

  return (
    <div className="relative">
      {loading && <LoadingOverlay />}

      {step === 1 && <StepZero nextStep={next} updateField={updateField} />}
      {step === 2 && (
        <StepOne
          nextStep={next}
          updateField={updateField}
          formData={formData}
        />
      )}
      {step === 3 && (
        <StepTwo
          nextStep={next}
          prevStep={back}
          updateField={updateField}
          formData={formData}
          registrationError={registrationError} // 👈 passa o erro aqui
        />
      )}
      {step === 4 && (
        <StepThree
          nextStep={next}
          updateField={updateField}
          formData={formData}
          resend={resend}
        />
      )}
      {step === 5 && <StepFour nextStep={next} prevStep={back} />}
    </div>
  )
}
