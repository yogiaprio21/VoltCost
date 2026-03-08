import { BrowserRouter as Router, NavLink, Outlet, Route, Routes, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import EstimateFormPage from '@pages/EstimateForm'
import ResultPage from '@pages/Result'
import AdminDashboardPage from '@pages/AdminDashboard'
import DashboardPage from '@pages/Dashboard'
import LoginPage from '@pages/Login'
import RegisterPage from '@pages/Register'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Logo from '@components/Logo'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import { Toaster } from '@components/UI'

function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
    setIsMenuOpen(false)
  }

  const navLinks = [
    { to: '/', label: 'Estimasi' },
    { to: '/dashboard', label: 'Dashboard' },
    ...(user?.role === 'ADMIN' ? [{ to: '/admin', label: 'Admin' }] : []),
  ]

  return (
    <div className="min-h-screen bg-slate-50/50">
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <NavLink to="/" onClick={() => setIsMenuOpen(false)}>
            <Logo />
          </NavLink>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-sm font-bold transition-all ${isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'}`
                }
              >
                {link.label}
              </NavLink>
            ))}

            <div className="h-4 w-px bg-slate-200 mx-2" />

            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-slate-900 leading-none">{user.name}</span>
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{user.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <NavLink to="/login" className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900">Login</NavLink>
                <NavLink
                  to="/register"
                  className="px-5 py-2.5 bg-blue-600 text-white text-xs font-black rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all scale-100 hover:scale-105"
                >
                  DAFTAR GRATIS
                </NavLink>
              </div>
            )}
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-slate-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b animate-in slide-in-from-top duration-300">
            <div className="px-4 py-6 space-y-4">
              {navLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `block text-lg font-bold ${isActive ? 'text-blue-600' : 'text-slate-600'}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="pt-4 border-t">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                        {user.name?.[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <NavLink
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="py-3 text-center font-bold text-slate-600 bg-slate-50 rounded-xl"
                    >
                      Login
                    </NavLink>
                    <NavLink
                      to="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="py-3 text-center font-bold text-white bg-blue-600 rounded-xl shadow-lg shadow-blue-100"
                    >
                      Daftar
                    </NavLink>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
      <main className="max-w-6xl mx-auto p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster />
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<EstimateFormPage />} />
            <Route path="result" element={<ResultPage />} />
            <Route path="admin" element={<AdminDashboardPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password/:token" element={<ResetPassword />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  )
}
