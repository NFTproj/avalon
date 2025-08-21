'use client';

import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
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

// Dados de fallback para quando não há tokens reais
const fallbackData = [
  { name: '#TBIO', price: 500, color: '#80ffa0' },
  { name: '#TBIO2', price: 500, color: '#00ffcc' },
];

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

  // Gerar dados reais para o gráfico
  const generateChartData = () => {
    if (usingFallback || assets.length === 0) {
      return fallbackData;
    }

    // Criar dados baseados nos tokens reais da carteira
    const colors = ['#80ffa0', '#00ffcc', '#0080ff', '#ff8000', '#ff0080'];
    
    return assets.map((asset, index) => {
      const balance = Number(asset.balanceRaw) / Math.pow(10, asset.decimals);
      const unitValue = parseFloat(asset.card?.CardBlockchainData?.tokenPrice || '1.00');
      const totalValue = balance * unitValue;
      
      return {
        name: asset.symbol || 'TKN',
        price: totalValue,
        color: colors[index % colors.length],
        balance: balance,
        unitValue: unitValue
      };
    });
  };

  const chartData = generateChartData();
  const totalPrice = chartData.reduce((sum, item) => sum + item.price, 0);

  const proportionalData = chartData.map((item) => ({
    ...item,
    value: totalPrice > 0 ? (item.price / totalPrice) * 100 : 0,
  }));

  return (
    <div className="flex flex-col items-center justify-center w-full h-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={proportionalData}
            cx="50%"
            cy="50%"
            innerRadius={110}
            outerRadius={128}
            fill="#8884d8"
            dataKey="value"
            isAnimationActive
          >
            {proportionalData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke="none"
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <p className="text-xl font-bold text-gray-800">
          {show ? `R$ ${totalPrice.toFixed(2)}` : 'R$ ******'}
        </p>
        <p className="text-sm text-gray-600">
          {usingFallback ? 'Total Investido (Exemplo)' : 'Total Investido'}
        </p>
        {usingFallback && (
          <p className="text-xs text-yellow-600 mt-1">
            Dados de exemplo
          </p>
        )}
      </div>
    </div>
  );
}
