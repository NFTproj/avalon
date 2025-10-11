'use client';

import { ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useUserTokenBalances } from '@/hooks/useUserTokenBalances';
import { getAllCards } from '@/lib/api/cards';
import { Card } from '@/types/card';
import { useEffect, useState } from 'react';

interface TokenCircleProps {
  tokens: { name: string; price: number; color: string }[];
  show: boolean;
  toggleShow: () => void;
}

// Tipos fortes para itens do gráfico
type ChartItem = {
  name: string;
  price: number;
  color: string;
  balance: number;
  unitValue: number;
}

// Dados de fallback para quando não há tokens reais (visual neutro)
const fallbackData: ChartItem[] = [
  { name: 'Sem tokens', price: 1, balance: 0, color: '#e5e7eb', unitValue: 0 },
];

// Helper para suavizar cor (mistura com branco)
function lightenColor(hex: string, factor = 0.25) {
  try {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    const nr = Math.round(r + (255 - r) * factor);
    const ng = Math.round(g + (255 - g) * factor);
    const nb = Math.round(b + (255 - b) * factor);
    return `rgb(${nr}, ${ng}, ${nb})`;
  } catch {
    return hex;
  }
}

// Converter API Card para Card interno
const convertApiCardToCard = (apiCard: any): Card | null => {
  if (!apiCard.cardBlockchainData?.tokenAddress) return null;

  return {
    id: apiCard.id,
    name: apiCard.name,
    status: apiCard.status as 'ACTIVE' | 'INACTIVE',
    CardBlockchainData: {
      tokenAddress: apiCard.cardBlockchainData.tokenAddress as `0x${string}`,
      tokenNetwork: apiCard.cardBlockchainData.network || 'polygon',
      tokenChainId: getChainIdFromNetwork(apiCard.cardBlockchainData.network || 'polygon'),
      tokenPrice: '1.00',
    }
  }
}

const getChainIdFromNetwork = (network: string): number => {
  switch (network.toLowerCase()) {
    case 'ethereum': return 1;
    case 'polygon': return 137;
    case 'arbitrum': return 42161;
    case 'sepolia': return 11155111;
    default: return 137;
  }
}

export default function TokenCircle({ tokens, show, toggleShow }: TokenCircleProps) {
  const { user } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [usingFallback, setUsingFallback] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Buscar cards reais
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await getAllCards();
        if (response.data && Array.isArray(response.data)) {
          const convertedCards = response.data
            .map(convertApiCardToCard)
            .filter((card): card is Card => card !== null);

          if (convertedCards.length > 0) {
            setCards(convertedCards);
            setUsingFallback(false);
          } else {
            setUsingFallback(true);
          }
        } else {
          setUsingFallback(true);
        }
      } catch (error) {
        console.error('Erro ao buscar cards para gráfico:', error);
        setUsingFallback(true);
      }
    };

    fetchCards();
  }, []);

  // Usar hook para buscar saldos reais
  const { assets, loading } = useUserTokenBalances(
    cards,
    user?.walletAddress as `0x${string}` | undefined
  );

  // Gerar dados para o gráfico: usa dados reais da blockchain ou fallback
  const generateChartData = (): ChartItem[] => {
    const colors = ['#80ffa0', '#00ffcc', '#0080ff', '#ff8000', '#ff0080', '#aa66ff', '#66ffaa'];

    if (assets && assets.length > 0) {
      // Filtrar apenas assets com saldo > 0
      const assetsWithBalance = assets.filter(asset => {
        const balance = Number(asset.balanceRaw) / Math.pow(10, asset.decimals);
        return balance > 0;
      });

      if (assetsWithBalance.length > 0) {
        return assetsWithBalance.map((asset, index): ChartItem => {
          const balance = Number(asset.balanceRaw) / Math.pow(10, asset.decimals);
          const unitValue = parseFloat(asset.card?.CardBlockchainData?.tokenPrice || '1.00');
          const totalValue = balance * unitValue;
          return {
            name: asset.symbol || 'TKN',
            price: totalValue,
            color: colors[index % colors.length],
            balance,
            unitValue,
          };
        });
      }
    }

    // Retornar fallback apenas se não houver dados reais
    return fallbackData;
  };

  const chartData: ChartItem[] = generateChartData();
  const totalPrice: number = chartData.reduce((sum: number, item: ChartItem) => sum + item.price, 0);

  const proportionalData: (ChartItem & { value: number })[] = chartData.map((item: ChartItem) => ({
    ...item,
    value: totalPrice > 0 ? (item.price / totalPrice) * 100 : 0,
  }));

  const totalTokenBalance: number = chartData.reduce((sum: number, item: ChartItem) => sum + item.balance, 0);

  // Verificar se está mostrando dados reais ou exemplo
  const hasRealData = assets && assets.length > 0 && assets.some(asset => {
    const balance = Number(asset.balanceRaw) / Math.pow(10, asset.decimals);
    return balance > 0;
  });
  const showingExample = !hasRealData;

  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const {
      cx,
      cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      midAngle,
      payload,
    } = props;

    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 6) * cos;
    const sy = cy + (outerRadius + 6) * sin;
    const mx = cx + (outerRadius + 14) * cos;
    const my = cy + (outerRadius + 20) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 24;
    const ey = my;
    const boxPadding = 10;
    const nameText: string = String(payload.name ?? '');
    const saldoText: string = `Saldo: ${Number(payload.balance ?? 0).toLocaleString('pt-BR')}`;
    const unitText: string = `Unitário: R$ ${Number(payload.unitValue ?? 0).toFixed(2)}`;
    const totalText: string = `Total: R$ ${Number(payload.price ?? 0).toFixed(2)}`;
    const maxLen: number = Math.max(nameText.length, saldoText.length, unitText.length, totalText.length);
    const approxChar = 7; // largura média por caractere com font-size 12
    const boxWidth: number = Math.min(110, Math.max(95, maxLen * approxChar + boxPadding * 2));
    const lineHeight = 16;
    const lines = 4;
    const boxHeight: number = boxPadding * 2 + lineHeight * lines;
    const bx: number = cos >= 0 ? ex + 8 : ex - 8 - boxWidth;
    const by: number = ey - boxHeight / 2;

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={payload.color} fill="none" />
        <circle cx={ex} cy={ey} r={3} fill={payload.color} stroke="none" />
        <rect
          x={bx}
          y={by}
          width={boxWidth}
          height={boxHeight}
          rx={8}
          fill="#ffffff"
          stroke={payload.color}
        />
        <text x={bx + boxPadding} y={by + boxPadding + 12} style={{ fontSize: 12, fontWeight: 600 }} fill={payload.color}>
          {nameText}
        </text>
        <text x={bx + boxPadding} y={by + boxPadding + 12 + lineHeight} style={{ fontSize: 12 }} fill="#404040">
          {saldoText}
        </text>
        <text x={bx + boxPadding} y={by + boxPadding + 12 + 2 * lineHeight} style={{ fontSize: 12 }} fill="#404040">
          {unitText}
        </text>
        <text x={bx + boxPadding} y={by + boxPadding + 12 + 3 * lineHeight} style={{ fontSize: 12 }} fill="#404040">
          {totalText}
        </text>
      </g>
    );
  };

  const handleEnter = (_data: any, index: number) => setHoverIndex(index);
  const handleLeave = () => setHoverIndex(null);

  // Tooltip removido para evitar duplicidade; usamos container externo no label ativo.

  return (
    <div className="flex flex-col items-center justify-center w-full h-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            {proportionalData.map((entry: ChartItem & { value: number }, index: number) => (
              <linearGradient key={`grad-${index}`} id={`grad-${index}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={lightenColor(entry.color, 0.35)} />
                <stop offset="100%" stopColor={entry.color} />
              </linearGradient>
            ))}
          </defs>
          <Pie
            data={proportionalData}
            cx="50%"
            cy="50%"
            innerRadius={110}
            outerRadius={128}
            fill="#8884d8"
            dataKey="value"
            isAnimationActive
            paddingAngle={0}
            cornerRadius={0}
            activeIndex={hoverIndex === null ? undefined : hoverIndex}
            activeShape={renderActiveShape}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
          >
            {proportionalData.map((entry: ChartItem & { value: number }, index: number) => (
              <Cell
                key={`cell-${index}`}
                fill={`url(#grad-${index})`}
                stroke="none"
              />
            ))}
          </Pie>
          {/* Tooltip removido para evitar exibir duas caixas ao mesmo tempo */}
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        {showingExample ? (
          <>
            <p className="text-lg font-semibold text-gray-500 mb-2">
              Nenhum token encontrado
            </p>
            <p className="text-xs text-gray-500">
              Compre tokens para ver
            </p>
            <p className="text-xs text-gray-500">
              seu portfólio aqui
            </p>
          </>
        ) : (
          <>
            <p className="text-xl font-bold text-gray-800">
              {show ? `R$ ${totalPrice.toFixed(2)}` : 'R$ ******'}
            </p>
            <p className="text-sm text-gray-600">
              Total Investido
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Total de Tokens: {totalTokenBalance.toLocaleString('pt-BR')}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
