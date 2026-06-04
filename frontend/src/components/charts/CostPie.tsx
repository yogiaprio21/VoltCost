import { Pie, PieChart, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@utils/format'

export default function CostPie({ subtotal, labor, premium }: { subtotal: number; labor: number; premium: number }) {
  const data = [
    { name: 'Material', value: subtotal },
    { name: 'Jasa', value: labor },
    { name: 'Premium', value: premium }
  ].filter(d => d.value > 0)
  const colors = ['#0284c7', '#059669', '#d97706']

  if (data.length === 0) {
    return <div className="grid h-full place-items-center text-sm text-slate-500">Belum ada data biaya.</div>
  }

  return (
    <div className="h-full w-full" role="img" aria-label="Grafik komposisi biaya estimasi">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={56} outerRadius={96} paddingAngle={3}>
            {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
          </Pie>
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Legend iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
