'use client'
import { KycContainer } from "@/components/common/FormsBackground"

export default function KycStepStartVerification({
  name,
  cpf,
  address,
  onVerify,
}: {
  name: string
  cpf: string
  address: string
  onVerify: () => void
}) {
  return (
    <KycContainer>
      <h2 className="text-lg font-semibold mb-4">Verificação com documento</h2>
      <p className="text-gray-700 mb-6">Você será redirecionado para concluir a verificação de identidade.</p>

      <ul className="text-sm text-gray-600 mb-6 list-disc list-inside">
        <li><strong>Nome:</strong> {name}</li>
        <li><strong>CPF:</strong> {cpf}</li>
        <li><strong>Endereço:</strong> {address}</li>
      </ul>

      <button
        onClick={onVerify}
        className="bg-[#00CFFF] text-white font-semibold py-2 px-6 rounded-lg w-full"
      >
        Iniciar verificação via Didit
      </button>
    </KycContainer>
  )
}
