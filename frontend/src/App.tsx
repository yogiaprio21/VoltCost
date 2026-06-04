import { Suspense, lazy, useMemo, useState } from 'react'
import { BrowserRouter as Router, NavLink, Outlet, Route, Routes, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Logo from '@components/Logo'
import Icon from '@components/Icon'
import { Button, IconButton, Loader, Toaster } from '@components/UI'

const EstimateFormPage = lazy(() => import('@pages/EstimateForm'))
const ResultPage = lazy(() => import('@pages/Result'))
const AdminDashboardPage = lazy(() => import('@pages/AdminDashboard'))
const DashboardPage = lazy(() => import('@pages/Dashboard'))
const LoginPage = lazy(() => import('@pages/Login'))
const RegisterPage = lazy(() => import('@pages/Register'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))

function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navLinks = useMemo(() => [
    { to: '/', label: 'Estimasi', icon: 'home' as const },
    { to: '/dashboard', label: 'Riwayat', icon: 'clipboard' as const },
    ...(user?.role === 'ADMIN' ? [{ to: '/admin', label: 'Admin', icon: 'barChart' as const }] : [])
  ], [user?.role])

  const handleLogout = async () => {
    await logout()
    setIsMenuOpen(false)
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <NavLink to="/" onClick={() => setIsMenuOpen(false)} aria-label="VoltCost beranda">
            <Logo />
          </NavLink>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Navigasi utama">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${isActive ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`
                }
              >
                <Icon name={link.icon} className="h-4 w-4" />
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                <div className="max-w-[180px] text-right">
                  <div className="truncate text-sm font-semibold text-slate-950">{user.name || user.email}</div>
                  <div className="text-xs font-medium text-slate-500">{user.role}</div>
                </div>
                <Button tone="ghost" icon="logOut" onClick={handleLogout}>Keluar</Button>
              </>
            ) : (
              <>
                <Button tone="ghost" onClick={() => navigate('/login')}>Masuk</Button>
                <Button icon="logIn" onClick={() => navigate('/register')}>Daftar</Button>
              </>
            )}
          </div>

          <IconButton label="Buka menu" icon={isMenuOpen ? 'x' : 'menu'} className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)} />
        </div>

        {isMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
            <nav className="grid gap-2" aria-label="Navigasi mobile">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold ${isActive ? 'bg-sky-50 text-sky-700' : 'text-slate-700 hover:bg-slate-100'}`
                  }
                >
                  <Icon name={link.icon} className="h-5 w-5" />
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-4 border-t border-slate-200 pt-4">
              {user ? (
                <div className="space-y-3">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <div className="font-semibold text-slate-950">{user.name || user.email}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </div>
                  <Button tone="danger" icon="logOut" className="w-full" onClick={handleLogout}>Keluar</Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Button tone="ghost" onClick={() => navigate('/login')}>Masuk</Button>
                  <Button onClick={() => navigate('/register')}>Daftar</Button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Suspense fallback={<Loader />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}

function AuthShell() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <NavLink to="/" className="inline-flex w-fit" aria-label="VoltCost beranda">
          <Logo />
        </NavLink>
        <main className="grid flex-1 place-items-center py-8">
          <Suspense fallback={<Loader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster />
        <Routes>
          <Route element={<AuthShell />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password/:token" element={<ResetPassword />} />
          </Route>
          <Route element={<AppShell />}>
            <Route index element={<EstimateFormPage />} />
            <Route path="result" element={<ResultPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="admin" element={<AdminDashboardPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  )
}
