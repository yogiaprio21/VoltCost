import type { CostLine } from '@app-types/index'
import { formatCurrency } from '@utils/format'
import { Input } from './UI'

interface BreakdownTableProps {
  lines: CostLine[]
  isEditable?: boolean
  onEdit?: (index: number, newQty: number) => void
}

export default function BreakdownTable({ lines, isEditable, onEdit }: BreakdownTableProps) {
  return (
    <div className="bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto scrollbar-hide">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-slate-100/50">
              <th className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">Material / Jasa</th>
              <th className="px-5 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 w-20">Qty</th>
              <th className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">Satuan</th>
              <th className="px-5 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">Harga Satuan</th>
              <th className="px-5 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lines.map((l, i) => (
              <tr key={i} className="hover:bg-white transition-colors">
                <td className="px-5 py-4 text-sm font-bold text-slate-700 whitespace-nowrap">{l.name}</td>
                <td className="px-5 py-4 text-right">
                  {isEditable ? (
                    <Input
                      type="number"
                      value={l.quantity}
                      className="w-20 ml-auto text-right text-sm border-slate-200 focus:border-blue-500 h-8"
                      onChange={(e) => onEdit?.(i, Number(e.target.value))}
                    />
                  ) : <span className="text-sm font-black text-slate-600">{l.quantity}</span>}
                </td>
                <td className="px-5 py-4 text-xs font-medium text-slate-400">{l.unit}</td>
                <td className="px-5 py-4 text-right text-xs font-semibold text-slate-500 whitespace-nowrap">{formatCurrency(l.unitPrice)}</td>
                <td className="px-5 py-4 text-right text-sm font-black text-blue-600 whitespace-nowrap">{formatCurrency(l.quantity * l.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Scroll indicator for mobile */}
      <div className="md:hidden bg-blue-50 py-1.5 text-center">
        <div className="text-[9px] font-black text-blue-400 tracking-tighter flex items-center justify-center gap-1 animate-pulse">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
          GESER UNTUK MELIHAT TABEL
        </div>
      </div>
    </div>
  )
}
