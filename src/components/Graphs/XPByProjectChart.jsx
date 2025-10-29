import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';

function XPByProjectChart({ projects }) {
  const chartData = projects.map((p) => ({
    name: p.object?.name || 'Unknown Project',
    xp: Number((p.amount / 1024).toFixed(2)),
  }));

  return (
    <ResponsiveContainer width="100%" height={500}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 50, bottom: 92 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-45} textAnchor="end" />
        <YAxis label={{ value: 'XP (KB)', angle: -90, position: 'insideLeft', textAnchor: 'middle', style: { fontSize: 14 } }} />
        <Tooltip
    contentStyle={{
    backgroundColor: '#ffffff',
    color: '#000000',
    borderRadius: '8px',
    border: '1px solid rgba(0,0,0,0.1)',
    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
  }}
  itemStyle={{ color: '#000000' }}
  labelStyle={{ color: '#000000', fontWeight: 600 }}
/>

        <Legend />
        <Bar dataKey="xp" fill="url(#colorXp)" />
        <defs>
          <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#4f46e5" stopOpacity={0.9} />  {/* brand-600 */}
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.25} /> {/* accent-500 */}
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
}
export default XPByProjectChart;
