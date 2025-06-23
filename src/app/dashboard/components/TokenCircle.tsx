'use client';

import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface TokenCircleProps {
  tokens: { name: string; price: number; color: string }[];
  show: boolean; 
  toggleShow: () => void; 
}

const data = [
  { name: '#TBIO', price: 500, color: '#80ffa0' },
  { name: '#TBIO2', price: 500, color: '#00ffcc' },
  { name: '#TBIO3', price: 600, color: '#008cff' },
];

const totalPrice = data.reduce((sum, item) => sum + item.price, 0);

const proportionalData = data.map((item) => ({
  ...item,
  value: (item.price / totalPrice) * 100,
}));

export default function TokenCircle({ tokens, show, toggleShow }: TokenCircleProps) {
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
        <p className="text-sm text-gray-600">Total Investido</p>
      </div>
    </div>
  );
}
