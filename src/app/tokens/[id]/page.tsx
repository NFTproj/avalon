'use client'

import React, { useContext, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import MainLayout from '@/components/layout/MainLayout'
import { ConfigContext } from '@/contexts/ConfigContext'
import ProgressBar from '@/components/common/ProgressBar'
import { AlertCircle } from 'lucide-react'

interface TokenType {
  id: number
  name: string
  subtitle: string
  price: string
  launchDate: string
  tokensAvailable: string
  identifierCode: string
  image: string
  sold: number
  total: number
  labels: { name: string }[]
}

export default function TokenDetailsPage() {
  const { colors, texts } = useContext(ConfigContext)
  const { id } = useParams() as { id: string }
  const [tab, setTab] = useState<
    'info' | 'tokenInfo' | 'documents' | 'benefits'
  >('info')

  const tokenDetails = texts?.['token-details']
  const tokenInfo = texts?.['token']

  const tokensList: TokenType[] = [
    {
      id: 1,
      name: 'TOKEN TBIO',
      subtitle: 'Fazenda Eliane Mato Grosso',
      price: '15',
      launchDate: '15/08/2025',
      tokensAvailable: '1016820.00',
      identifierCode: 'TBIO',
      image: 'icons/bloxify/man-similing.png',
      sold: 516820,
      total: 1000000,
      labels: [{ name: 'CPR' }, { name: 'CARBONO' }, { name: 'VERDE' }],
    },
  ]
  const token = tokensList.find((t) => t.id.toString() === id) || tokensList[0]
  const formattedPrice = `$ ${Number(token.price).toFixed(2).replace('.', ',')}`
  const sold = token.sold
  const total = token.total
  const labelColors = ['#8B7355', '#00D4AA', '#4CAF50']

  const tokenInfoList = [
    'Token baseado no padrão ERC-20, compatível com rede Polygon',
    'Pode ser usado para staking em jogos e recompensas dinâmicas',
    'Planejado para uso em futuras votações de governança (DAO)',
    'Launchpad integrado para novos meme tokens e projetos emergentes',
    'Tokenomics planejado com queima parcial para controle de oferta',
    'Código do contrato será aberto e auditado antes do lançamento',
  ]
  const documentsList = [
    { title: 'Documentos essenciais (Anexo E)', href: '#' },
    { title: 'Contrato de investimento', href: '#' },
    { title: 'Contrato Social', href: '#' },
  ]
  const rightsText =
    'O Meowl Token (MEWL) representa um ativo digital com utilidade no ecossistema MeowlVerse, permitindo o uso em jogos, staking e acesso a funcionalidades da plataforma. A posse do token não confere qualquer participação societária, direito de voto ou responsabilidade sobre o projeto MeowlVerse e seus fundadores.'
  const risksText =
    'Os detentores de MEWL estão cientes de que não há garantias de retorno financeiro ou valorização. O desempenho do token está sujeito a fatores de mercado, adoção do projeto, decisões de governança e demais riscos inerentes a projetos baseados em blockchain e criptomoedas.'

  return (
    <MainLayout>
      <main
        className="min-h-screen py-16 flex justify-between"
        style={{ backgroundColor: colors?.background['background-primary'] }}
      >
        <div className="max-w-3xl mx-auto space-y-12">
          {/* Seção superior */}
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <div className="flex gap-2 mb-4">
                {token.labels.map((label, idx) => (
                  <span
                    key={label.name}
                    className="text-[10px] font-bold px-3 py-1 rounded-full border-2 border-black text-black"
                    style={{
                      backgroundColor: labelColors[idx % labelColors.length],
                    }}
                  >
                    {label.name}
                  </span>
                ))}
              </div>
              <div className="mb-4">
                <h1
                  className="text-2xl font-bold"
                  style={{ color: colors?.colors['color-primary'] }}
                >
                  {token.name}
                </h1>
                <p
                  className="text-sm"
                  style={{ color: colors?.colors['color-secondary'] }}
                >
                  {token.subtitle}
                </p>
              </div>
              <div className="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center">
                <span className="text-gray-500 font-medium">Sem imagem</span>
              </div>
            </div>
          </div>

          {/* Destaques */}
          <div
            className="rounded-lg border-2 p-6"
            style={{
              backgroundColor: colors?.token['background'],
              borderColor: colors?.token['border'],
              borderWidth: '1px',
            }}
          >
            <h2
              className="text-2xl font-semibold mb-6"
              style={{ color: colors?.colors['color-primary'] }}
            >
              {tokenDetails?.highlights?.title}
            </h2>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 flex flex-col justify-between">
                <p
                  className="text-sm"
                  style={{ color: colors?.colors['color-secondary'] }}
                >
                  MeowlVerse is a groundbreaking project that combines the
                  whimsical spirit of memes with the transformative power of
                  blockchain technology. It represents more than just another
                  meme coin; it embodies creativity, innovation, and
                  community-driven collaboration. By leveraging the viral appeal
                  of memes, MeowlVerse creates an engaging and inclusive
                  platform for investors, gamers, and meme enthusiasts alike.
                </p>
                <button
                  className="mt-4 px-4 py-2 rounded-full cursor-pointer"
                  style={{
                    backgroundColor: colors?.background['background-highlight'],
                    color: colors?.colors['color-primary'],
                  }}
                >
                  {tokenDetails?.highlights?.['view-docs']}
                </button>
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <p
                  className="text-sm"
                  style={{ color: colors?.colors['color-secondary'] }}
                >
                  MeowlVerse features a token launchpad for new meme coins,
                  democratizing access to token launches and providing a
                  platform for emerging projects. It also includes an integrated
                  gaming platform with various meme-inspired games, where
                  players can stake Meowl tokens to participate and earn
                  rewards.
                </p>
                <button
                  className="mt-4 px-4 py-2 rounded-full cursor-pointer"
                  style={{
                    backgroundColor: colors?.background['background-highlight'],
                    color: colors?.colors['color-primary'],
                  }}
                >
                  {tokenDetails?.highlights?.['more-info']}
                </button>
              </div>
            </div>
          </div>

          {/* Abas */}
          <div>
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setTab('info')}
                className="px-4 py-2 -mb-px font-medium"
                style={{
                  borderBottom:
                    tab === 'info'
                      ? `2px solid ${colors?.colors['color-primary']}`
                      : 'none',
                  color:
                    tab === 'info'
                      ? colors?.colors['color-primary']
                      : colors?.colors['color-tertiary'],
                }}
              >
                {tokenDetails?.tabs?.infos?.title}
              </button>
              <button
                onClick={() => setTab('tokenInfo')}
                className="px-4 py-2 -mb-px font-medium"
                style={{
                  borderBottom:
                    tab === 'tokenInfo'
                      ? `2px solid ${colors?.colors['color-primary']}`
                      : 'none',
                  color:
                    tab === 'tokenInfo'
                      ? colors?.colors['color-primary']
                      : colors?.colors['color-tertiary'],
                }}
              >
                {tokenDetails?.tabs?.['token-info']?.title}
              </button>
              <button
                onClick={() => setTab('documents')}
                className="px-4 py-2 -mb-px font-medium"
                style={{
                  borderBottom:
                    tab === 'documents'
                      ? `2px solid ${colors?.colors['color-primary']}`
                      : 'none',
                  color:
                    tab === 'documents'
                      ? colors?.colors['color-primary']
                      : colors?.colors['color-tertiary'],
                }}
              >
                {tokenDetails?.tabs?.docs?.title}
              </button>
              <button
                onClick={() => setTab('benefits')}
                className="px-4 py-2 -mb-px font-medium"
                style={{
                  borderBottom:
                    tab === 'benefits'
                      ? `2px solid ${colors?.colors['color-primary']}`
                      : 'none',
                  color:
                    tab === 'benefits'
                      ? colors?.colors['color-primary']
                      : colors?.colors['color-tertiary'],
                }}
              >
                {tokenDetails?.tabs?.benefits?.title}
              </button>
            </div>
            <div className="mt-6 space-y-6">
              {tab === 'info' && (
                <section className="grid grid-cols-1 gap-6">
                  {/* Informações principais */}
                  <div
                    className="rounded-xl shadow-lg border p-6 "
                    style={{
                      backgroundColor: colors?.token['background'],
                      borderColor: colors?.token['border'],
                      borderWidth: '1px',
                    }}
                  >
                    <h2
                      className="text-2xl font-semibold mb-6"
                      style={{ color: colors?.colors['color-primary'] }}
                    >
                      {tokenDetails?.tabs?.infos?.title}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                      <div className="flex flex-col gap-2">
                        <span
                          className="text-sm font-medium"
                          style={{ color: colors?.colors['color-tertiary'] }}
                        >
                          {tokenDetails?.tabs?.infos?.['offer-opening']}
                        </span>
                        <p
                          className="font-semibold text-sm"
                          style={{ color: colors?.colors['color-primary'] }}
                        >
                          15/08/2025
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span
                          className="text-sm font-medium"
                          style={{ color: colors?.colors['color-tertiary'] }}
                        >
                          {tokenDetails?.tabs?.infos?.['identifier-code']}
                        </span>
                        <p
                          className="font-semibold text-sm"
                          style={{ color: colors?.colors['color-primary'] }}
                        >
                          BRBBSPPRO041
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span
                          className="text-sm font-medium"
                          style={{ color: colors?.colors['color-tertiary'] }}
                        >
                          {tokenDetails?.tabs?.infos?.['token-address']}
                        </span>
                        <Link
                          href="#"
                          className="font-semibold text-sm"
                          style={{ color: colors?.colors['color-primary'] }}
                        >
                          0xa8C09E...Ed070eAc
                        </Link>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span
                          className="text-sm font-medium"
                          style={{ color: colors?.colors['color-tertiary'] }}
                        >
                          {tokenDetails?.tabs?.infos?.['unit-value']}
                        </span>
                        <p
                          className="font-semibold text-sm"
                          style={{ color: colors?.colors['color-primary'] }}
                        >
                          $15
                        </p>
                      </div>
                      <div>
                        <span
                          className="text-sm font-medium"
                          style={{ color: colors?.colors['color-tertiary'] }}
                        >
                          {tokenDetails?.tabs?.infos?.['tons-offered']}
                        </span>
                        <p
                          className="font-semibold text-sm"
                          style={{ color: colors?.colors['color-primary'] }}
                        >
                          1.016.820,00
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span
                          className="text-sm font-medium"
                          style={{ color: colors?.colors['color-tertiary'] }}
                        >
                          {tokenDetails?.tabs?.infos?.['blockchain-link']}
                        </span>
                        <Link
                          href="#"
                          className="font-semibold text-sm"
                          style={{ color: colors?.colors['color-primary'] }}
                        >
                          Polygonscan
                        </Link>
                      </div>
                    </div>
                  </div>
                </section>
              )}
              {tab === 'tokenInfo' && (
                <div
                  className="rounded-xl shadow-lg border p-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
                  style={{
                    backgroundColor: colors?.token['background'],
                    borderColor: colors?.token['border'],
                    borderWidth: '1px',
                  }}
                >
                  {tokenInfoList.map((txt, idx) => (
                    <div
                      key={idx + txt}
                      className="flex items-start gap-2 w-full"
                    >
                      <span
                        className="w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full"
                        style={{
                          backgroundColor: colors?.colors['color-primary'],
                          color: '#FFFFFF',
                        }}
                      >
                        ✓
                      </span>
                      <p
                        className="text-base font-bold"
                        style={{ color: colors?.colors['color-primary'] }}
                      >
                        {txt}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {tab === 'documents' && (
                <div
                  className="rounded-xl shadow-lg border p-6"
                  style={{
                    backgroundColor: colors?.token['background'],
                    borderColor: colors?.token['border'],
                    borderWidth: '1px',
                  }}
                >
                  <h4
                    className="font-semibold mb-4"
                    style={{ color: colors?.colors['color-primary'] }}
                  >
                    {tokenDetails?.tabs?.docs?.title}
                  </h4>
                  <ul className="space-y-2">
                    {documentsList.map((doc, idx) => (
                      <li key={idx + doc.title}>
                        <Link
                          href={doc.href}
                          className="text-sm font-medium"
                          style={{ color: colors?.colors['color-primary'] }}
                        >
                          {doc.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {tab === 'benefits' && (
                <div
                  className="rounded-xl shadow-lg border p-6"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderColor: colors?.token['border'],
                    borderWidth: '1px',
                  }}
                >
                  <div className="space-y-4">
                    <div>
                      <h4
                        className="font-semibold"
                        style={{ color: colors?.colors['color-primary'] }}
                      >
                        {tokenDetails?.tabs?.benefits?.['rights']}
                      </h4>
                      <p
                        className="text-sm"
                        style={{ color: colors?.colors['color-secondary'] }}
                      >
                        {rightsText}
                      </p>
                    </div>
                    <div>
                      <h4
                        className="font-semibold"
                        style={{ color: colors?.colors['color-primary'] }}
                      >
                        {tokenDetails?.tabs?.benefits?.['risks']}
                      </h4>
                      <p
                        className="text-sm"
                        style={{ color: colors?.colors['color-secondary'] }}
                      >
                        {risksText}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="w-full lg:w-[25%]">
          <div
            className="rounded-xl shadow-lg p-6 flex flex-col gap-3"
            style={{
              backgroundColor: colors?.token['background'],
              border: '2px solid transparent',
              borderImage: `linear-gradient(90deg, ${colors?.border['border-primary']}, ${colors?.dashboard?.colors.highlight}) 1`,
            }}
          >
            <h3
              className="text-lg font-bold mb-4"
              style={{ color: colors?.colors['color-primary'] }}
            >
              {tokenInfo?.['sold']}
            </h3>
            <ProgressBar sold={sold} total={total} />
            <div className="flex justify-between items-center mt-4">
              <span
                className="text-sm font-medium"
                style={{ color: colors?.colors['color-tertiary'] }}
              >
                {tokenInfo?.['token-price']}
              </span>
              <span
                className="font-bold text-sm"
                style={{ color: colors?.colors['color-primary'] }}
              >
                {formattedPrice}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span
                className="text-sm font-medium"
                style={{ color: colors?.colors['color-tertiary'] }}
              >
                {tokenInfo?.['minimum-investment']}
              </span>
              <span
                className="font-bold text-sm"
                style={{ color: colors?.colors['color-primary'] }}
              >
                R$ 100
              </span>
            </div>
            <button
              className="mt-4 w-full py-2 rounded-lg"
              style={{
                backgroundColor: colors?.colors['color-primary'],
                color: '#FFFFFF',
              }}
            >
              {tokenInfo?.['buy']}
            </button>
          </div>
          <div className="flex justify-center gap-2 text-xs text-gray-500 mt-2">
            <div className="flex items-start gap-2 w-4/5">
              <AlertCircle className="w-6 h-6 flex-shrink-0 mt-1" />
              <span className="text-sm">{tokenInfo?.['disclaimer']}</span>
            </div>
          </div>
        </div>
      </main>
    </MainLayout>
  )
}
