import { Pie, PieChart, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function CostPie({ subtotal, labor, premium }: { subtotal: number; labor: number; premium: number }) {
  const data = [
    { name: 'Materials', value: subtotal },
    { name: 'Labor', value: labor },
    { name: 'Premium', value: premium }
  ].filter(d => d.value > 0)
  const colors = ['#3b82f6', '#10b981', '#f59e0b']
  return (
    <div className="w-full h-80">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={100}>
            {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
