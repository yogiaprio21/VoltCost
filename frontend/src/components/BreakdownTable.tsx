import type { CostLine } from '@app-types/index'
import { formatCurrency } from '@utils/format'
import { Input } from './UI'
import Icon from './Icon'

interface BreakdownTableProps {
  lines: CostLine[]
  isEditable?: boolean
  onEdit?: (index: number, newQty: number) => void
}

export default function BreakdownTable({ lines, isEditable, onEdit }: BreakdownTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-[760px] w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="border-b border-slate-200 px-4 py-3">Material / jasa</th>
              <th className="w-28 border-b border-slate-200 px-4 py-3 text-right">Qty</th>
              <th className="w-24 border-b border-slate-200 px-4 py-3">Satuan</th>
              <th className="w-40 border-b border-slate-200 px-4 py-3 text-right">Harga satuan</th>
              <th className="w-40 border-b border-slate-200 px-4 py-3 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lines.map((line, index) => (
              <tr key={`${line.name}-${index}`} className="transition hover:bg-slate-50">
                <td className="px-4 py-3 text-sm font-semibold text-slate-800">{line.name}</td>
                <td className="px-4 py-3 text-right">
                  {isEditable ? (
                    <Input
                      type="number"
                      min={0}
                      value={line.quantity}
                      className="ml-auto h-9 w-24 text-right"
                      onChange={(e) => onEdit?.(index, Math.max(0, Number(e.target.value) || 0))}
                    />
                  ) : (
                    <span className="text-sm font-semibold text-slate-700">{line.quantity}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-slate-500">{line.unit}</td>
                <td className="px-4 py-3 text-right text-sm text-slate-600">{formatCurrency(line.unitPrice)}</td>
                <td className="px-4 py-3 text-right text-sm font-bold text-slate-950">{formatCurrency(line.quantity * line.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-center gap-2 border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-500 md:hidden">
        <Icon name="arrowRight" className="h-3.5 w-3.5" />
        Geser tabel untuk melihat semua kolom
      </div>
    </div>
  )
}
