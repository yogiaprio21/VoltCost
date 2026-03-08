import { useState, useEffect } from 'react'

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`border rounded-xl px-4 py-2 w-full focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none border-slate-200 ${props.className || ''}`} />
}

export function PasswordInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative w-full">
      <input
        {...props}
        type={show ? 'text' : 'password'}
        className={`border rounded-xl px-4 py-2 w-full pr-12 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none border-slate-200 ${props.className || ''}`}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
      >
        {show ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
        )}
      </button>
    </div>
  )
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`border border-slate-200 rounded-xl px-4 py-2 w-full focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none bg-white ${props.className || ''}`} />
}

export function Button({ className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const hasBg = className.includes('bg-')
  return (
    <button
      {...props}
      className={`
        ${!hasBg ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100' : ''}
        rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${className}
      `.replace(/\s+/g, ' ').trim()}
    />
  )
}

export function Card({ children, className = '' }: { children: any, className?: string }) {
  return <div className={`bg-white border border-slate-100 rounded-3xl p-4 shadow-xl shadow-slate-200/50 ${className}`}>{children}</div>
}

// Custom Toast System
let toastFn: (msg: string, type?: 'success' | 'error') => void = () => { }

export const toast = {
  success: (msg: string) => toastFn(msg, 'success'),
  error: (msg: string) => toastFn(msg, 'error')
}

export function Toaster() {
  const [notif, setNotif] = useState<{ msg: string, type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    toastFn = (msg, type = 'success') => {
      setNotif({ msg, type })
      setTimeout(() => setNotif(null), 3000)
    }
  }, [])

  if (!notif) return null

  return (
    <div className="fixed top-6 right-6 z-[200] animate-in slide-in-from-right duration-300">
      <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${notif.type === 'success'
        ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
        : 'bg-red-50 border-red-100 text-red-800'
        }`}>
        {notif.type === 'success' ? (
          <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        ) : (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        )}
        <span className="font-black text-sm uppercase tracking-tight">{notif.msg}</span>
      </div>
    </div>
  )
}

export function Modal({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: any }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden relative animate-in zoom-in-95 duration-300 border border-slate-100">
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <h3 className="font-black text-slate-800 uppercase tracking-tighter text-base">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all group">
            <svg className="w-5 h-5 text-slate-300 group-hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  )
}

export function Loader() {
  return <div className="py-4 text-center text-gray-600">Loading...</div>
}

export function ErrorAlert({ message }: { message: string }) {
  return <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded">{message}</div>
}
