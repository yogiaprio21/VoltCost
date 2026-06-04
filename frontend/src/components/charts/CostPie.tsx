import { Pie, PieChart, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@utils/format'

export default function CostPie({ subtotal, labor, premium }: { subtotal: number; labor: number; premium: number }) {
  const total = subtotal + labor + premium
  const data = [
    {
      name: 'Material',
      value: subtotal,
      color: '#0284c7',
      formula: 'Jumlah qty x harga satuan',
      description: 'Biaya kebutuhan material dari katalog harga.'
    },
    {
      name: 'Jasa',
      value: labor,
      color: '#059669',
      formula: '15% x subtotal material',
      description: 'Estimasi jasa pemasangan standar.'
    },
    {
      name: 'Premium',
      value: premium,
      color: '#d97706',
      formula: '20% x (material + jasa)',
      description: 'Tambahan hanya untuk tipe instalasi premium.'
    }
  ].filter(d => d.value > 0)

  if (data.length === 0) {
    return <div className="grid h-full place-items-center text-sm text-slate-500">Belum ada data biaya.</div>
  }

  return (
    <div className="grid h-full w-full gap-5 xl:grid-cols-[minmax(220px,0.9fr)_1.1fr]" role="img" aria-label="Grafik komposisi biaya estimasi">
      <div className="min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={54} outerRadius={92} paddingAngle={3}>
              {data.map((item) => <Cell key={item.name} fill={item.color} />)}
            </Pie>
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-3 self-center">
        {data.map((item) => {
          const percentage = total > 0 ? Math.round((item.value / total) * 1000) / 10 : 0
          return (
            <li key={item.name} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 flex-none rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-semibold text-slate-950">{item.name}</span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{item.description}</p>
                  <p className="mt-1 text-xs font-medium text-slate-600">Rumus: {item.formula}</p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-sm font-bold text-slate-950">{formatCurrency(item.value)}</div>
                  <div className="mt-1 text-xs font-semibold text-slate-500">{percentage}%</div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
