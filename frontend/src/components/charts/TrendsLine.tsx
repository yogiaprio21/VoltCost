import { Line, LineChart, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@utils/format'

export default function TrendsLine({ data }: { data: { month: string; count: number; averageCost?: number }[] }) {
  if (!data.length) {
    return <div className="grid h-full place-items-center text-sm text-slate-500">Belum ada data tren.</div>
  }

  return (
    <div className="h-full w-full" role="img" aria-label="Grafik tren estimasi bulanan">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 8, right: 16, top: 10, bottom: 8 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
          <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
          <Tooltip
            formatter={(value: number, name: string) => name === 'averageCost' ? [formatCurrency(value), 'Rata-rata biaya'] : [value, 'Jumlah estimasi']}
            labelFormatter={(label: string | number) => `Bulan ${label}`}
          />
          <Line type="monotone" name="count" dataKey="count" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
