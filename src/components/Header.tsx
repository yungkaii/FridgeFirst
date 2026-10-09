import { Link, useRouterState } from '@tanstack/react-router'
import {
  ChefHat,
  Compass,
  History,
  LayoutDashboard,
  Menu,
  Plus,
  Refrigerator,
  ShoppingBag,
  Sparkles,
  X,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  const routerState = useRouterState()
  const pathname = routerState.location.pathname
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { to: '/', label: 'Beranda', icon: Sparkles },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/fridge', label: 'Kulkas Saya', icon: Refrigerator },
    { to: '/recipes', label: 'Rekomendasi Resep', icon: Compass },
    { to: '/use-it-up', label: 'Use It Up', icon: Zap, isBadge: true },
    { to: '/shopping', label: 'Daftar Belanja', icon: ShoppingBag },
    { to: '/history', label: 'Riwayat', icon: History },
  ]

  // Mobile Bottom Bar Primary Shortcuts
  const mobileShortcuts = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/fridge', label: 'Kulkas', icon: Refrigerator },
    { to: '/use-it-up', label: 'Use It Up', icon: Zap, isCenter: true },
    { to: '/recipes', label: 'Resep', icon: Compass },
    { to: '/shopping', label: 'Belanja', icon: ShoppingBag },
  ]

  return (
    <>
      {/* Top Main Navigation Bar with Glassmorphic Luxury Surface */}
      <header className="sticky top-0 z-50 border-b border-[#302C28]/80 bg-[#0B0A09]/85 backdrop-blur-2xl transition-all duration-300">
        <div className="mx-auto flex max-w-7xl h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo & Brand Identity */}
          <Link
            to="/"
            className="group flex items-center gap-3.5 text-decoration-none focus:outline-none flex-shrink-0"
          >
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-[#00C995]/40 bg-gradient-to-br from-[#1B1917] via-[#23211E] to-[#12110F] text-[#00C995] shadow-[0_0_20px_rgba(0,201,149,0.2)] transition-all duration-300 group-hover:scale-105 group-hover:border-[#00C995] group-hover:shadow-[0_0_25px_rgba(0,201,149,0.35)]">
              <Refrigerator className="h-5 w-5" />
              <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[#00C995] ring-2 ring-[#0B0A09]" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#F6F2EB]">
                Fridge<span className="text-[#00C995]">First</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A7A098]">
                Zero Waste Kitchen Planner
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 px-3 py-1.5 rounded-2xl bg-[#12110F]/80 border border-[#302C28]/70 backdrop-blur-md">
            {navLinks.map((item) => {
              const Icon = item.icon
              const isActive =
                item.to === '/' ? pathname === '/' : pathname.startsWith(item.to)

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-[#00C995]/15 text-[#00C995] border border-[#00C995]/30 shadow-[0_0_15px_rgba(0,201,149,0.15)] font-bold'
                      : 'text-[#A7A098] hover:text-[#F6F2EB] hover:bg-[#1B1917] border border-transparent'
                  }`}
                >
                  <Icon
                    className={`h-3.5 w-3.5 flex-shrink-0 transition-transform ${
                      isActive ? 'text-[#00C995] scale-105' : 'text-[#A7A098]'
                    }`}
                  />
                  <span>{item.label}</span>
                  {item.isBadge && (
                    <span className="rounded-full px-1.5 py-0.2 text-[9px] font-extrabold bg-[#FFB020]/20 text-[#FFB020] border border-[#FFB020]/30 animate-pulse">
                      ⚡
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Action Controls & User Account */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              to="/fridge"
              search={{ openAdd: true } as any}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00C995] to-[#00A99A] hover:brightness-110 px-4 py-2.5 text-xs font-bold text-[#0B0A09] shadow-[0_4px_20px_rgba(0,201,149,0.3)] hover:shadow-[0_6px_25px_rgba(0,201,149,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span className="hidden sm:inline">Tambah Bahan</span>
              <span className="sm:hidden">Tambah</span>
            </Link>

            <ThemeToggle />

            <Link
              to="/profile"
              className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 ${
                pathname === '/profile'
                  ? 'border-[#00C995] bg-[#00C995]/15 text-[#00C995] shadow-[0_0_15px_rgba(0,201,149,0.2)]'
                  : 'border-[#302C28] bg-[#1B1917] text-[#A7A098] hover:text-[#F6F2EB] hover:border-[#00C995]/40'
              }`}
              title="Profil & Preferensi Koki"
            >
              <ChefHat className="h-4.5 w-4.5" />
            </Link>

            {/* Mobile Hamburger toggle for secondary links */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-[#302C28] bg-[#1B1917] text-[#A7A098] hover:text-[#F6F2EB]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu (Secondary Links) */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#302C28] bg-[#12110F] px-4 py-4 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
            {navLinks.map((item) => {
              const Icon = item.icon
              const isActive =
                item.to === '/' ? pathname === '/' : pathname.startsWith(item.to)

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-[#00C995]/15 text-[#00C995] font-bold border border-[#00C995]/30'
                      : 'text-[#A7A098] hover:bg-[#1B1917] hover:text-[#F6F2EB]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4.5 w-4.5" />
                    <span>{item.label}</span>
                  </div>
                  {item.isBadge && (
                    <span className="rounded-full bg-[#FFB020]/20 border border-[#FFB020]/30 px-2 py-0.5 text-[10px] font-bold text-[#FFB020]">
                      Fitur Baru
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </header>

      {/* Mobile Fixed Bottom Bar (One-Hand Thumb Navigation) */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#302C28] bg-[#12110F]/95 backdrop-blur-2xl px-2 py-1.5 md:hidden flex items-center justify-around shadow-2xl safe-area-pb"
      >
        {mobileShortcuts.map((item) => {
          const Icon = item.icon
          const isActive =
            item.to === '/' ? pathname === '/' : pathname.startsWith(item.to)

          if (item.isCenter) {
            return (
              <Link
                key={item.to}
                to={item.to}
                className="relative -top-3 flex flex-col items-center group focus:outline-none"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-xl transition-transform group-active:scale-95 ${
                    isActive
                      ? 'bg-[#FFB020] text-[#0B0A09] ring-4 ring-[#FFB020]/30'
                      : 'bg-gradient-to-tr from-[#FFB020] to-amber-300 text-[#0B0A09] shadow-[#FFB020]/30'
                  }`}
                >
                  <Icon className="h-5 w-5 fill-current" />
                </div>
                <span className="text-[10px] font-bold text-[#FFB020] mt-0.5">
                  Use It Up
                </span>
              </Link>
            )
          }

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center py-1.5 px-3 min-w-[54px] min-h-[48px] rounded-xl transition ${
                isActive
                  ? 'text-[#00C995] font-bold'
                  : 'text-[#A7A098] hover:text-[#F6F2EB]'
              }`}
            >
              <Icon className={`h-4.5 w-4.5 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
