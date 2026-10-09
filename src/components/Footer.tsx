import { Link } from '@tanstack/react-router'
import { Heart, Leaf, Refrigerator, ShieldCheck, Sparkles, Zap } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-20 border-t border-[#302C28] bg-[#0B0A09] text-[#A7A098] transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand & Mission */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#302C28] bg-[#1B1917] text-[#00C995] shadow-xs">
                <Refrigerator className="h-4.5 w-4.5" />
              </div>
              <span className="font-editorial text-xl font-bold tracking-tight text-[#F6F2EB]">
                Fridge<span className="text-[#00C995]">First</span>
              </span>
            </div>
            <p className="max-w-md text-xs sm:text-sm text-[#A7A098] leading-relaxed">
              Fridge First Recipe Planner membantu Anda memasak lezat dari bahan yang sudah ada di kulkas,
              mengurangi sampah makanan, menghemat belanja bulanan, dan merencanakan menu harian tanpa pusing.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#00C995] font-medium">
              <Leaf className="h-3.5 w-3.5" />
              <span>Bersama mencegah food waste, satu hidangan setiap hari.</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F6F2EB]">
              Navigasi Utama
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/dashboard" className="transition hover:text-[#00C995]">
                  Dashboard Dapur
                </Link>
              </li>
              <li>
                <Link to="/fridge" className="transition hover:text-[#00C995]">
                  Kulkas & Bahan Saya
                </Link>
              </li>
              <li>
                <Link to="/recipes" className="transition hover:text-[#00C995]">
                  Rekomendasi Resep
                </Link>
              </li>
              <li>
                <Link to="/use-it-up" className="transition hover:text-[#FFB020] flex items-center gap-1.5">
                  <Zap className="h-3 w-3 text-[#FFB020] fill-current" />
                  <span>Fitur "Use It Up"</span>
                </Link>
              </li>
              <li>
                <Link to="/shopping" className="transition hover:text-[#00C995]">
                  Daftar Belanja
                </Link>
              </li>
              <li>
                <Link to="/history" className="transition hover:text-[#00C995]">
                  Riwayat Masak & Favorit
                </Link>
              </li>
              <li>
                <Link to="/profile" className="transition hover:text-[#00C995]">
                  Preferensi & Profil
                </Link>
              </li>
            </ul>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F6F2EB]">
              Sistem Cerdas
            </h4>
            <ul className="space-y-2.5 text-xs text-[#A7A098]">
              <li className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-[#FFB020]" />
                <span>Algoritma Waste Score Cerdas</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-[#00C995]" />
                <span>Prioritas Bahan Hampir Expired</span>
              </li>
              <li className="flex items-center gap-2">
                <Heart className="h-3.5 w-3.5 text-[#FF5C65]" />
                <span>22+ Resep Nusantara & Favorit Keluarga</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#302C28] pt-6 text-xs text-[#A7A098] sm:flex-row">
          <p>&copy; {currentYear} FridgeFirst. Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#302C28] bg-[#1B1917] px-3 py-1 text-[#00C995] font-medium text-[11px]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00C995] animate-pulse" />
              Database PostgreSQL Aktif
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
