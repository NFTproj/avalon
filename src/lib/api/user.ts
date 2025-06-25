export interface UpdateDetailsPayload {
  type: 'individual' | 'business'
  name: string
  cpf?: string
  cnpj?: string
  address: string
  city: string
  state: string
  country: string
  zipCode: string
  contractFile?: File
  proofOfAddressFile?: File
}

export async function updateUserDetails(payload: UpdateDetailsPayload) {
  const formData = new FormData()
  

  // Campos string normais
  formData.append('clientId', process.env.NEXT_PUBLIC_CLIENT_ID as string);
  formData.append('type', payload.type)
  formData.append('name', payload.name)
  formData.append('address', payload.address)
  formData.append('city', payload.city)
  formData.append('state', payload.state)
  formData.append('country', payload.country)
  formData.append('zipCode', payload.zipCode)

  if (payload.type === 'individual' && payload.cpf) {
    formData.append('cpf', payload.cpf)
  }

  if (payload.type === 'business' && payload.cnpj) {
    formData.append('cnpj', payload.cnpj)
    if (payload.contractFile) {
      formData.append('contractFile', payload.contractFile)
    }
    if (payload.proofOfAddressFile) {
      formData.append('proofOfAddressFile', payload.proofOfAddressFile)
    }
  }

  const res = await fetch('/api/user/update-details', {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error?.error || 'Erro ao atualizar dados do usuário')
  }

  return await res.json()
}
