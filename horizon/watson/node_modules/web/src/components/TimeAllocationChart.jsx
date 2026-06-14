
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = [
  'hsl(255, 73%, 57%)', // Primary
  'hsl(255, 85%, 65%)', // Primary lighter
  'hsl(255, 92%, 76%)', // Primary lightest
  'hsl(215, 20%, 65%)', // Muted
  'hsl(217, 33%, 17%)', // Dark
  'hsl(210, 40%, 96%)', // Light
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const hours = Math.floor(data.value / 60);
    const minutes = data.value % 60;
    const timeString = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    return (
      <div className="bg-popover text-popover-foreground border border-border p-3 rounded-lg shadow-lg">
        <p className="font-semibold mb-1">{data.name}</p>
        <p className="text-sm text-muted-foreground">
          Tempo Alocado: <span className="font-medium text-foreground">{timeString}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Peso (Rank): <span className="font-medium text-foreground">{data.rank}</span>
        </p>
      </div>
    );
  }
  return null;
};

const TimeAllocationChart = ({ disciplines = [] }) => {
  // Filter out disciplines with 0 time to avoid rendering empty slices
  const data = disciplines
    .filter(d => d.allocated_time > 0)
    .map(d => ({
      name: d.name,
      value: d.allocated_time,
      rank: d.rank
    }))
    .sort((a, b) => b.rank - a.rank); // Sort by rank for consistent coloring

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border">
        Nenhum tempo alocado
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
            formatter={(value, entry) => (
              <span className="text-sm font-medium text-foreground ml-1">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TimeAllocationChart;
