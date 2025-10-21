// app/api/me/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  // Gera 15 itens de balances mockados para testar paginação
  const balances = Array.from({ length: 15 }, (_, i) => {
    const idx = i + 1
    return {
      id: `mock-card-${idx}`,
      name: `Example Card #${idx}`,
      description: 'Example card description',
      longDescription: 'Example long description',
      ticker: `EX${idx}`,
      tags: ['example', 'card'],
      socialLinks: { twitter: 'https://twitter.com/example' },
      blockchainPlatform: 'Ethereum',
      launchDate: '2023-12-31T23:59:59Z',
        cardBackgroundUrl: 'https://picsum.photos/480',
        logoUrl: 'https://picsum.photos/480',
      cardBackgroundPublicId: 'background_public_id',
      logoPublicId: 'logo_public_id',
      userId: '316f0b05-bbed-46df-a599-2047f515fb5e',
      status: 'ACTIVE',
      clientId: '9dc9c038-e760-4447-be9b-211fa75b3e7d',
      createdAt: '2023-12-31T23:59:59Z',
      updatedAt: '2023-12-31T23:59:59Z',
      metadata: [
        { field: 'isin', value: `BR12345678${String(idx).padStart(2, '0')}` },
        { field: 'customField', value: `value-${idx}` },
      ],
      CardBlockchainData: {
        id: `mock-cbd-${idx}`,
        cardId: `mock-card-${idx}`,
        tokenAddress: `0xabc1234567890abcde${idx.toString(16)}`,
        tokenTxHash: `0x1234567890abcdef${idx.toString(16)}`,
        tokenNetwork: 'polygon',
        tokenChainId: 137,
        intermediaryContractAddress: `0x1234567890abcdef${idx.toString(16)}`,
        intermediaryContractTxHash: `0x1234567890abcdef${idx.toString(16)}`,
        tokenPrice: (1 + i * 0.1).toFixed(2),
        signedBy: `0x1234567890abcdef${idx.toString(16)}`,
        initialSupply: String(1000000 + i * 10000),
        purchasedQuantity: String(500000 + i * 5000),
        createdAt: '2023-12-31T23:59:59Z',
        updatedAt: '2023-12-31T23:59:59Z',
      },
      balance: 100 + i * 10,
    }
  })

  const mockUser = {
    id: '316f0b05-bbed-46df-a599-2047f515fb5e',
    clientId: '9dc9c038-e760-4447-be9b-211fa75b3e7d',
    name: 'John Doe',
    email: 'john@example.com',
    walletAddress: '0xabc1234567890abcdef',
    kycStatusId: 100,
    permissions: ['user'],
    deleted: false,
    createdAt: '2023-12-31T23:59:59Z',
    updatedAt: '2023-12-31T23:59:59Z',
    deleted_at: null,
    balances,
  }

  return NextResponse.json({ user: mockUser }, { status: 200 })
}