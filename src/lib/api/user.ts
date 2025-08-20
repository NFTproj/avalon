// lib/api/user.ts
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
  const form = new FormData()

  form.append('type', payload.type)
  form.append('name', payload.name)
  form.append('address', payload.address)
  form.append('city', payload.city)
  form.append('state', payload.state)
  form.append('country', payload.country)
  form.append('zipCode', (payload.zipCode || '').replace(/\D/g, ''))

  if (payload.type === 'individual') {
    if (payload.cpf) form.append('cpf', payload.cpf.replace(/\D/g, ''))
  } else {
    if (payload.cnpj) form.append('cnpj', payload.cnpj.replace(/\D/g, ''))
    if (payload.contractFile) form.append('contractFile', payload.contractFile, payload.contractFile.name)
    if (payload.proofOfAddressFile) form.append('proofOfAddressFile', payload.proofOfAddressFile, payload.proofOfAddressFile.name)
  }

  // continua chamando seu API route local
  const res = await fetch('/api/user/update-details', {
    method: 'POST',
    body: form, // NÃO defina content-type manualmente
  })

  let data: any = null
  try { data = await res.json() } catch {}

  if (!res.ok) {
    throw new Error(data?.error || 'Erro ao atualizar dados do usuário')
  }
  return data
}
