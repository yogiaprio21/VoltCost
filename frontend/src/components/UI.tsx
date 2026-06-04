import { useEffect, useId, useState } from 'react'
import Icon, { IconName } from './Icon'

type Tone = 'primary' | 'neutral' | 'danger' | 'success' | 'ghost'

const toneClasses: Record<Tone, string> = {
  primary: 'bg-sky-600 text-white hover:bg-sky-700 focus-visible:ring-sky-200 shadow-sm shadow-sky-100',
  neutral: 'bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-200 shadow-sm',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-200 shadow-sm shadow-red-100',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-200 shadow-sm shadow-emerald-100',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-200 shadow-none'
}

export function Field({
  label,
  hint,
  error,
  children
}: {
  label: string
  hint?: string
  error?: string | null
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <label className="block text-sm font-semibold text-slate-800">{label}</label>
        {hint && <span className="text-xs text-slate-500">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  )
}

export function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 ${className}`}
    />
  )
}

export function PasswordInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <Input {...props} type={show ? 'text' : 'password'} className={`pr-11 ${props.className || ''}`} />
      <button
        type="button"
        aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}
        onClick={() => setShow(!show)}
        className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
      >
        <Icon name={show ? 'eyeOff' : 'eye'} className="h-4 w-4" />
      </button>
    </div>
  )
}

export function Select({ className = '', ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100 ${className}`}
    />
  )
}

export function Button({
  className = '',
  tone = 'primary',
  icon,
  loading,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone; icon?: IconName; loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={`${toneClasses[tone]} inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-55 ${className}`}
    >
      {loading ? <Icon name="loader" className="h-4 w-4 animate-spin" /> : icon ? <Icon name={icon} className="h-4 w-4" /> : null}
      {children}
    </button>
  )
}

export function IconButton({
  label,
  icon,
  className = '',
  tone = 'ghost',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string; icon: IconName; tone?: Tone }) {
  return (
    <button
      {...props}
      aria-label={label}
      title={label}
      className={`${toneClasses[tone]} inline-grid h-10 w-10 place-items-center rounded-lg transition focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-55 ${className}`}
    >
      <Icon name={icon} className="h-5 w-5" />
    </button>
  )
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}>{children}</section>
}

export function PageHeader({
  title,
  description,
  action
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
        {description && <p className="max-w-2xl text-sm leading-6 text-slate-600">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function StatCard({
  label,
  value,
  icon,
  tone = 'primary',
  subtext
}: {
  label: string
  value: React.ReactNode
  icon: IconName
  tone?: Tone
  subtext?: string
}) {
  const accent = tone === 'danger' ? 'text-red-600 bg-red-50' : tone === 'success' ? 'text-emerald-600 bg-emerald-50' : tone === 'neutral' ? 'text-slate-700 bg-slate-100' : 'text-sky-600 bg-sky-50'
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <div className="mt-2 text-2xl font-bold text-slate-950">{value}</div>
          {subtext && <p className="mt-1 text-xs text-slate-500">{subtext}</p>}
        </div>
        <div className={`grid h-10 w-10 place-items-center rounded-lg ${accent}`}>
          <Icon name={icon} className="h-5 w-5" />
        </div>
      </div>
    </Card>
  )
}

export function EmptyState({
  icon = 'info',
  title,
  description,
  action
}: {
  icon?: IconName
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-slate-100 text-slate-500">
        <Icon name={icon} className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-slate-950">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

let toastFn: (msg: string, type?: 'success' | 'error') => void = () => { }

export const toast = {
  success: (msg: string) => toastFn(msg, 'success'),
  error: (msg: string) => toastFn(msg, 'error')
}

export function Toaster() {
  const [notif, setNotif] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    toastFn = (msg, type = 'success') => {
      setNotif({ msg, type })
      window.setTimeout(() => setNotif(null), 3200)
    }
  }, [])

  if (!notif) return null

  return (
    <div className="fixed right-4 top-4 z-[200] w-[calc(100%-2rem)] max-w-sm">
      <div className={`flex items-start gap-3 rounded-lg border p-4 shadow-lg ${notif.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-red-200 bg-red-50 text-red-900'}`}>
        <Icon name={notif.type === 'success' ? 'check' : 'alert'} className="mt-0.5 h-5 w-5 flex-none" />
        <p className="text-sm font-semibold">{notif.msg}</p>
      </div>
    </div>
  )
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children
}: {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
}) {
  const titleId = useId()
  const descriptionId = useId()
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined}>
      <button className="absolute inset-0 cursor-default bg-slate-950/50 backdrop-blur-sm" onClick={onClose} aria-label="Tutup dialog" />
      <div className="relative w-full max-w-md overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-slate-950">{title}</h2>
            {description && <p id={descriptionId} className="mt-1 text-sm text-slate-600">{description}</p>}
          </div>
          <IconButton label="Tutup" icon="x" onClick={onClose} />
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export function Loader() {
  return <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm font-medium text-slate-600">Memuat data...</div>
}

export function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <Icon name="alert" className="mt-0.5 h-5 w-5 flex-none" />
      <span>{message}</span>
    </div>
  )
}
