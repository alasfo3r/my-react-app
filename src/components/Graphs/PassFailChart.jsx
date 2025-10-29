import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

function PassFailChart({ passCount, failCount }) {
  const data = [
    { name: 'PASS', value: passCount },
    { name: 'FAIL', value: failCount },
  ];

  // Aurora theme colors
  const COLORS = ['#10b981', '#fb7185'];

  return (
    <PieChart width={500} height={400}>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        outerRadius={150}
        label={(entry) => `${entry.name}: ${entry.value}`}
        dataKey="value"
      >
        {data.map((entry, i) => (
          <Cell key={i} fill={COLORS[i]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  );
}

export default PassFailChart;
