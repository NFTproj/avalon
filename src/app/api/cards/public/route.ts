import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const apiUrl = process.env.BLOXIFY_URL_BASE
    const apiKey = process.env.BLOXIFY_API_KEY
    const clientId = process.env.CLIENT_ID

    // Verificar se há token de autenticação disponível
    const accessToken = req.cookies.get('accessToken')?.value

    if (!apiUrl || !apiKey || !clientId) {
      return NextResponse.json({ error: 'Configuração da API ausente' }, { status: 500 })
    }

    let response;
    
    if (accessToken) {
        response = await fetch(`${apiUrl}/card?limit=50`, {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
          'client-id': clientId,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
    } else {
      let systemToken;
      
      try {
        const systemCredentials = { 
          email: process.env.SERVICE_USER_EMAIL || 'public@bloxify.com', 
          password: process.env.SERVICE_USER_PASSWORD || 'BloxifyPublic2024!' 
        };
        
        const loginResponse = await fetch(`${apiUrl}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
          },
          body: JSON.stringify({
            email: systemCredentials.email,
            password: systemCredentials.password,
            clientId: clientId
          }),
        });
        
        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          systemToken = loginData.accessToken;
        } else {
          const errorData = await loginResponse.json();
        }
      } catch (error) {
      }
      
      if (systemToken) {
        response = await fetch(`${apiUrl}/card?limit=50`, {
          method: 'GET',
          headers: {
            'x-api-key': apiKey,
            'client-id': clientId,
            'Authorization': `Bearer ${systemToken}`,
            'Content-Type': 'application/json',
          },
        });
      } else {
        const fallbackData = {
          data: [
            {
              id: "mock-token-1",
              name: "Fazenda El",
              description: "O TBio é um token de ativos de biodiversidade lastreados em CPR-Verde. Unindo tecnologia e sustentabilidade, oferece um mercado inovador que promove a preservação ambiental e impacto positivo globalmente.",
              logoUrl: "https://xjsqtnetbsxfzqirhrfk.supabase.co/storage/v1/object/public/cards/cards/04f8a2c9-1c60-4a26-8804-edbcc75e272b/logos/1a290d5e-c24b-447a-bd9e-ccedecd60bc0_1756746012324.png",
              ticker: "TBIO",
              launchDate: "2024-12-31",
              status: "ACTIVE",
              CardBlockchainData: {
                tokenPrice: "1000000.00"
              }
            },
            {
              id: "mock-token-2", 
              name: "Token Bio",
              description: "Token de biodiversidade focado na preservação de ecossistemas brasileiros através de tecnologia blockchain e certificados de sustentabilidade verificáveis.",
              logoUrl: "https://xjsqtnetbsxfzqirhrfk.supabase.co/storage/v1/object/public/cards/cards/04f8a2c9-1c60-4a26-8804-edbcc75e272b/logos/1a290d5e-c24b-447a-bd9e-ccedecd60bc0_1756746012324.png", 
              ticker: "TBIO2",
              launchDate: "2023-12-31",
              status: "ACTIVE",
              CardBlockchainData: {
                tokenPrice: "1000000.00"
              }
            },
            {
              id: "mock-token-3",
              name: "Verde Carbon",
              description: "Ativo digital lastreado em créditos de carbono verificados, promovendo a compensação de emissões e investimento em projetos de reflorestamento sustentável.",
              logoUrl: "https://xjsqtnetbsxfzqirhrfk.supabase.co/storage/v1/object/public/cards/cards/04f8a2c9-1c60-4a26-8804-edbcc75e272b/logos/1a290d5e-c24b-447a-bd9e-ccedecd60bc0_1756746012324.png",
              ticker: "VCRB", 
              launchDate: "2024-07-31",
              status: "ACTIVE",
              CardBlockchainData: {
                tokenPrice: "1500000.00"
              }
            }
          ],
          meta: {
            currentPage: 1,
            itemsPerPage: 50,
            totalItems: 3,
            totalPages: 1
          }
        };

        return NextResponse.json(fallbackData);
      }
    }

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ 
        error: 'Erro ao buscar dados da API', 
        details: data 
      }, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ 
      error: 'Erro ao conectar com a API Bloxify',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}