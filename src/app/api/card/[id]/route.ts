/**
 * ============================================================================
 * API ROUTE - OPERAÇÕES POR ID DE CARD
 * ============================================================================
 * 
 * Gerencia operações específicas de um card por seu ID:
 * - GET: Buscar detalhes de um card
 * - PUT: Atualizar um card existente
 * 
 * ENDPOINTS:
 * - GET  /api/card/[id] - Busca card por ID
 * - PUT  /api/card/[id] - Atualiza card por ID
 */

import { NextRequest, NextResponse } from 'next/server'

// ============================================================================
// GET - BUSCAR CARD POR ID
// ============================================================================

/**
 * Busca um card específico por ID
 * @param id - ID do card (vem da URL)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const apiUrl = process.env.BLOXIFY_URL_BASE
    const apiKey = process.env.BLOXIFY_API_KEY
    const clientId = process.env.CLIENT_ID

    if (!apiUrl || !apiKey || !clientId) {
      return NextResponse.json(
        {
          error:
            'Configuração ausente (BLOXIFY_URL_BASE, BLOXIFY_API_KEY ou CLIENT_ID)',
        },
        { status: 500 },
      )
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'ID do card é obrigatório' },
        { status: 400 },
      )
    }

    // Obter accessToken do cookie
    const accessToken = req.cookies.get('accessToken')?.value

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Token de autenticação ausente. Faça login novamente.' },
        { status: 401 },
      )
    }

    // Fazer chamada para API externa
    const url = `${apiUrl}/card/${id}?clientId=${encodeURIComponent(clientId)}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        Authorization: `Bearer ${accessToken}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.message || data?.error || 'Erro ao buscar card' },
        { status: response.status },
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error('Erro ao buscar card:', error)
    return NextResponse.json(
      { error: error?.message || 'Erro ao buscar card' },
      { status: 500 },
    )
  }
}

// ============================================================================
// PUT - ATUALIZAR CARD
// ============================================================================

/**
 * Atualiza um card existente
 * @param id - ID do card (vem da URL)
 * @param FormData - Dados a serem atualizados
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const apiUrl = process.env.BLOXIFY_URL_BASE
    const apiKey = process.env.BLOXIFY_API_KEY
    const clientId = process.env.CLIENT_ID

    if (!apiUrl || !apiKey || !clientId) {
      return NextResponse.json(
        {
          error:
            'Configuração ausente (BLOXIFY_URL_BASE, BLOXIFY_API_KEY ou CLIENT_ID)',
        },
        { status: 500 },
      )
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'ID do card é obrigatório' },
        { status: 400 },
      )
    }

    // Obter accessToken do cookie
    const accessToken = req.cookies.get('accessToken')?.value

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Token de autenticação ausente. Faça login novamente.' },
        { status: 401 },
      )
    }

    // Obter FormData do request
    const formData = await req.formData()

    // Adicionar clientId automaticamente ao FormData
    formData.append('clientId', clientId)

    // Fazer chamada para API externa
    const url = `${apiUrl}/card/${id}`

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'x-api-key': apiKey,
        'client-id': clientId,
        Authorization: `Bearer ${accessToken}`,
        // NÃO definir Content-Type - deixar o fetch definir automaticamente com boundary para FormData
      },
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.message || data?.error || 'Erro ao atualizar card' },
        { status: response.status },
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error('Erro ao atualizar card:', error)
    return NextResponse.json(
      { error: error?.message || 'Erro ao atualizar card' },
      { status: 500 },
    )
  }
}

