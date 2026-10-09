import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  DollarSign,
  Flame,
  Play,
  Refrigerator,
  ShoppingBag,
  Sparkles,
  Utensils,
  Zap,
} from 'lucide-react'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0B0A09] text-[#F6F2EB] selection:bg-[#00C995]/20 selection:text-[#00C995]">
      {/* =========================================================================
          1. HERO SECTION WITH AMBIENT LIGHTING & SHOWPIECE PRODUCT STUDIO
      ========================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-36">
        {/* Ambient Radial Glow Lighting */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-[#00C995]/15 via-[#00A99A]/5 to-transparent rounded-[100%] blur-[120px] pointer-events-none" />
        <div className="absolute top-48 right-0 w-[500px] h-[450px] bg-gradient-to-b from-[#FFB020]/10 to-transparent rounded-[100%] blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-[400px] h-[300px] bg-gradient-to-tr from-[#00C995]/10 to-transparent rounded-full blur-[80px] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12">
            {/* Left Column: Editorial Headline & High-Conversion CTA */}
            <div className="space-y-7 text-center lg:col-span-6 lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2.5 rounded-full border border-[#00C995]/30 bg-[#00C995]/10 px-4 py-1.5 text-xs font-semibold text-[#00C995] shadow-[0_0_20px_rgba(0,201,149,0.15)] backdrop-blur-md">
                <span className="flex h-2 w-2 rounded-full bg-[#00C995] animate-ping" />
                <span className="font-sans tracking-wider uppercase text-[10px] font-extrabold text-[#00C995]">
                  Zero Waste Recipe Planner
                </span>
              </div>

              {/* Grand Editorial Headline */}
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-[#F6F2EB] leading-[1.08]">
                Masak dari apa yang{' '}
                <span className="italic font-serif bg-gradient-to-r from-[#00C995] via-[#4EEDB8] to-[#00A99A] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(0,201,149,0.35)]">
                  sudah ada
                </span>{' '}
                di kulkas Anda.
              </h1>

              {/* Subheadline */}
              <p className="mx-auto lg:mx-0 max-w-xl text-base sm:text-lg text-[#A7A098] leading-relaxed font-normal font-sans">
                Ubah sisa bahan dapur yang terlupakan menjadi hidangan lezat dalam hitungan menit.
                Pantau tanggal kedaluwarsa, hemat jutaan rupiah belanjaan, dan akhiri kebiasaan membuang makanan.
              </p>

              {/* Primary Action Group */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/fridge"
                  className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#00C995] to-[#00A99A] hover:brightness-110 px-8 py-4 text-sm font-bold text-[#0B0A09] shadow-[0_10px_35px_rgba(0,201,149,0.35)] hover:shadow-[0_15px_45px_rgba(0,201,149,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Refrigerator className="h-5 w-5" />
                  <span>Mulai Masak Sekarang</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl border border-[#302C28] bg-[#1B1917]/85 hover:bg-[#23211E] hover:border-[#00C995]/40 px-7 py-4 text-sm font-semibold text-[#F6F2EB] backdrop-blur-xl transition-all shadow-md"
                >
                  <Sparkles className="h-4 w-4 text-[#FFB020]" />
                  <span>Lihat Demo Interaktif</span>
                </Link>
              </div>

              {/* High-Impact Numerical Value Metrics */}
              <div className="pt-6 border-t border-[#302C28]/80 grid grid-cols-3 gap-4 text-left">
                <div>
                  <div className="font-serif text-2xl sm:text-3xl font-bold text-[#F6F2EB]">
                    94<span className="text-[#00C995]">%</span>
                  </div>
                  <div className="text-[11px] text-[#A7A098] font-medium mt-0.5">
                    Akurasi Cocok Resep
                  </div>
                </div>
                <div>
                  <div className="font-serif text-2xl sm:text-3xl font-bold text-[#F6F2EB]">
                    Rp 350k<span className="text-[#00C995]">+</span>
                  </div>
                  <div className="text-[11px] text-[#A7A098] font-medium mt-0.5">
                    Hemat per Bulan
                  </div>
                </div>
                <div>
                  <div className="font-serif text-2xl sm:text-3xl font-bold text-[#F6F2EB]">
                    0<span className="text-[#00C995]">%</span>
                  </div>
                  <div className="text-[11px] text-[#A7A098] font-medium mt-0.5">
                    Bahan Terbuang
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Multi-Layered Product Studio Showcase */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto max-w-lg lg:max-w-none">
                {/* Main Kitchen Hub Interface Mockup */}
                <div className="relative rounded-3xl border border-[#302C28] bg-gradient-to-b from-[#1B1917] to-[#12110F] p-5 sm:p-6 shadow-[0_30px_70px_rgba(0,0,0,0.85)] backdrop-blur-2xl space-y-5">
                  {/* Studio Top Navigation Bar */}
                  <div className="flex items-center justify-between border-b border-[#302C28] pb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-[#FF5C65]/80" />
                      <div className="h-3 w-3 rounded-full bg-[#FFB020]/80" />
                      <div className="h-3 w-3 rounded-full bg-[#00C995]/80" />
                      <span className="text-xs font-semibold text-[#A7A098] ml-2 hidden sm:inline">
                        FridgeFirst Kitchen OS • Active Session
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#00C995]/40 bg-[#00C995]/10 px-3 py-1 text-xs font-bold text-[#00C995] shadow-[0_0_15px_rgba(0,201,149,0.15)]">
                      <Sparkles className="h-3.5 w-3.5" />
                      3 Resep Siap Masak 100%
                    </span>
                  </div>

                  {/* Primary Culinary Card */}
                  <div className="overflow-hidden rounded-2xl border border-[#302C28] bg-[#23211E] shadow-xl group">
                    <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-[#12110F]">
                      <img
                        src="https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=85"
                        alt="Nasi Goreng Spesial Kulkas"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A09] via-transparent to-black/30" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#00C995]/40 bg-[#0B0A09]/85 px-3 py-1.5 text-xs font-bold text-[#00C995] backdrop-blur-md shadow-md">
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#00C995]" />
                          100% Bahan Tersedia
                        </span>
                      </div>

                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center gap-1 rounded-xl border border-amber-500/40 bg-[#0B0A09]/85 px-3 py-1.5 text-xs font-bold text-amber-300 backdrop-blur-md shadow-md">
                          <Flame className="h-3.5 w-3.5 fill-current text-amber-400" />
                          Waste Score: 98
                        </span>
                      </div>

                      {/* Bottom Info on Image */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                        <div>
                          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#F6F2EB] drop-shadow-md">
                            Nasi Goreng Spesial Kulkas
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-[#F6F2EB]/90 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-[#00C995]" /> 15 Menit
                            </span>
                            <span>• 2 Porsi</span>
                            <span>• Tingkat: Mudah</span>
                          </div>
                        </div>

                        <Link
                          to="/recipes/$recipeId"
                          params={{ recipeId: '1' }}
                          className="hidden sm:inline-flex items-center gap-1 rounded-xl bg-[#00C995] px-3.5 py-2 text-xs font-bold text-[#0B0A09] shadow-md hover:brightness-110"
                        >
                          <Play className="h-3 w-3 fill-current" /> Masak
                        </Link>
                      </div>
                    </div>

                    {/* Matched Ingredients Chips Inside Mockup */}
                    <div className="p-4 bg-[#1B1917] space-y-2 border-t border-[#302C28]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#A7A098]">Bahan yang Dihabiskan:</span>
                        <span className="text-[#00C995] font-semibold text-[11px]">Semua tersedia di kulkas</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-[#23211E] border border-[#302C28] px-2.5 py-1 text-xs font-semibold text-[#F6F2EB]">
                          ✓ Telur Ayam (2 butir)
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-lg bg-[#23211E] border border-[#302C28] px-2.5 py-1 text-xs font-semibold text-[#F6F2EB]">
                          ✓ Nasi Putih (1 porsi)
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-lg bg-[#23211E] border border-[#302C28] px-2.5 py-1 text-xs font-semibold text-[#F6F2EB]">
                          ✓ Cabai Rawit (5 buah)
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-lg bg-[#23211E] border border-[#302C28] px-2.5 py-1 text-xs font-semibold text-[#F6F2EB]">
                          ✓ Bawang Merah & Putih
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Studio Status Bar (Expiration & Savings) */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-[#23211E] to-[#1B1917] p-3.5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Prioritas Hari Ini
                        </span>
                        <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                      </div>
                      <p className="font-serif text-sm font-bold text-[#F6F2EB]">
                        Cabai Rawit (Sisa 1 Hari)
                      </p>
                      <p className="text-[10px] text-[#A7A098]">
                        Segera habiskan sebelum busuk
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#00C995]/30 bg-gradient-to-br from-[#23211E] to-[#1B1917] p-3.5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-[#00C995] flex items-center gap-1">
                          <DollarSign className="h-3 w-3" /> Dampak Finansial
                        </span>
                        <span className="text-[10px] text-[#00C995] font-bold">+18%</span>
                      </div>
                      <p className="font-serif text-sm font-bold text-[#F6F2EB]">
                        Rp 350.000 / Bulan
                      </p>
                      <p className="text-[10px] text-[#A7A098]">
                        2.8 kg food waste dicegah
                      </p>
                    </div>
                  </div>
                </div>

                {/* Floating Glow Badge - Top Right */}
                <div className="hidden sm:flex absolute -top-5 -right-5 items-center gap-2 rounded-2xl border border-[#00C995]/40 bg-[#1B1917]/95 px-4 py-2.5 shadow-2xl backdrop-blur-xl animate-bounce duration-1000">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#00C995]/20 text-[#00C995]">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-[#A7A098] font-bold">Auto-Matcher</div>
                    <div className="text-xs font-bold text-[#00C995]">22 Resep Terbuka</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. CORE FEATURES BENTO GRID
      ========================================================================= */}
      <section className="relative border-y border-[#302C28] bg-[#12110F] py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#00C995]">
              Arsitektur Zero-Waste
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#F6F2EB]">
              Dirancang untuk Dapur Modern Bebas Sampah
            </h2>
            <p className="text-[#A7A098] text-sm sm:text-base leading-relaxed">
              Semua fitur terintegrasi mulus: dari inventaris kulkas, matching resep cerdas,
              hingga daftar belanja otomatis untuk bahan pendukung.
            </p>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Bento Card 1 (Span 2 columns on lg) */}
            <div className="lg:col-span-2 rounded-3xl border border-[#302C28] bg-[#1B1917] p-8 shadow-xl hover:border-[#00C995]/50 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#302C28] bg-[#23211E] text-[#00C995] shadow-sm">
                    <Refrigerator className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-[#00C995]/15 border border-[#00C995]/30 px-3 py-1 text-xs font-bold text-[#00C995]">
                    Inventaris Cerdas
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#F6F2EB] mb-2">
                  Smart Refrigerator Inventory
                </h3>
                <p className="text-sm text-[#A7A098] leading-relaxed max-w-xl mb-6">
                  Catat dan pantau isi kulkas berdasarkan kategori (Chiller, Freezer, Pantry).
                  Sistem secara otomatis menghitung sisa hari kesegaran dan memperingatkan bahan yang hampir kedaluwarsa.
                </p>
              </div>

              {/* Visual Preview Inside Card */}
              <div className="rounded-2xl border border-[#302C28] bg-[#12110F] p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-[#302C28] bg-[#1B1917] p-3 space-y-1">
                  <span className="text-[10px] font-bold text-[#00C995] uppercase">Chiller (12 Bahan)</span>
                  <div className="text-xs font-bold text-[#F6F2EB]">Telur, Sayur, Saus</div>
                  <div className="text-[10px] text-[#A7A098]">Masa segar: 5-7 hari</div>
                </div>
                <div className="rounded-xl border border-amber-500/30 bg-[#1B1917] p-3 space-y-1">
                  <span className="text-[10px] font-bold text-amber-400 uppercase">Segera Habis (3 Bahan)</span>
                  <div className="text-xs font-bold text-[#F6F2EB]">Cabai, Kol, Tomat</div>
                  <div className="text-[10px] text-amber-400 font-semibold">Tersisa ≤ 2 hari!</div>
                </div>
                <div className="rounded-xl border border-[#302C28] bg-[#1B1917] p-3 space-y-1">
                  <span className="text-[10px] font-bold text-[#A7A098] uppercase">Pantry (8 Bahan)</span>
                  <div className="text-xs font-bold text-[#F6F2EB]">Beras, Minyak, Kecap</div>
                  <div className="text-[10px] text-[#A7A098]">Stok aman</div>
                </div>
              </div>
            </div>

            {/* Bento Card 2 */}
            <div className="rounded-3xl border border-[#302C28] bg-[#1B1917] p-8 shadow-xl hover:border-[#00C995]/50 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#302C28] bg-[#23211E] text-[#00A99A] shadow-sm mb-4">
                  <Utensils className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#F6F2EB] mb-2">
                  Recipe Matching 100%
                </h3>
                <p className="text-sm text-[#A7A098] leading-relaxed mb-6">
                  Algoritma menyaring puluhan resep nusantara dan dunia berdasarkan persentase bahan yang sudah kamu miliki di dapur.
                </p>
              </div>

              <div className="rounded-2xl border border-[#302C28] bg-[#12110F] p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#F6F2EB]">Tingkat Kecocokan</span>
                  <span className="font-bold text-[#00C995]">94% Sangat Cocok</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#23211E] overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#00C995] to-[#00A99A] w-[94%]" />
                </div>
                <div className="text-[11px] text-[#A7A098]">
                  4 dari 4 bahan utama sudah ada di kulkas. Siap langsung dimasak.
                </div>
              </div>
            </div>

            {/* Bento Card 3: Use It Up Emergency Rescue */}
            <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-[#1B1917] via-[#23211E] to-[#1B1917] p-8 shadow-xl hover:border-amber-400 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/40 bg-amber-500/10 text-amber-400 shadow-sm">
                    <Zap className="h-6 w-6 fill-current" />
                  </div>
                  <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-300">
                    Fitur Eksklusif
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#F6F2EB] mb-2">
                  "Use It Up" Rescue Mode
                </h3>
                <p className="text-sm text-[#A7A098] leading-relaxed mb-6">
                  Satu tombol untuk mendeteksi 2–3 bahan yang paling kritis dan mencari hidangan lezat yang memanfaatkan kombinasi bahan tersebut hari ini.
                </p>
              </div>

              <Link
                to="/use-it-up"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-3 text-xs font-bold text-[#0B0A09] shadow-md transition"
              >
                <Zap className="h-4 w-4 fill-current" /> Coba Rescue Mode
              </Link>
            </div>

            {/* Bento Card 4: Shopping List */}
            <div className="rounded-3xl border border-[#302C28] bg-[#1B1917] p-8 shadow-xl hover:border-[#00C995]/50 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#302C28] bg-[#23211E] text-[#00C995] shadow-sm mb-4">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#F6F2EB] mb-2">
                  Integrated Shopping List
                </h3>
                <p className="text-sm text-[#A7A098] leading-relaxed mb-6">
                  Bahan yang kurang di resep otomatis bisa dipindahkan ke Daftar Belanja. Setelah dibeli, langsung pindahkan ke kulkas dengan 1 klik.
                </p>
              </div>

              <div className="rounded-2xl border border-[#302C28] bg-[#12110F] p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs">
                  <div className="h-5 w-5 rounded-md border border-[#00C995] bg-[#00C995]/20 flex items-center justify-center text-[#00C995]">
                    ✓
                  </div>
                  <span className="font-semibold text-[#F6F2EB]">Bawang Putih (100g)</span>
                </div>
                <span className="text-[10px] text-[#00C995] font-bold">Siap Masuk Kulkas</span>
              </div>
            </div>

            {/* Bento Card 5: Fullscreen Cook Mode */}
            <div className="rounded-3xl border border-[#302C28] bg-[#1B1917] p-8 shadow-xl hover:border-[#00C995]/50 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#302C28] bg-[#23211E] text-[#00C995] shadow-sm mb-4">
                  <Play className="h-6 w-6 fill-current" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#F6F2EB] mb-2">
                  Cook Now Mode & Timer
                </h3>
                <p className="text-sm text-[#A7A098] leading-relaxed mb-6">
                  Mode memasak layar penuh dengan teks besar, timer interaktif berbunyi lonceng, dan rating kepuasan rasa setelah selesai masak.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs text-[#A7A098]">
                <span className="flex items-center gap-1 text-[#00C995] font-bold">
                  <Clock className="h-3.5 w-3.5" /> Built-in Timer
                </span>
                <span>• Audio Chime Alarm</span>
                <span>• Touch-Friendly</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. HOW IT WORKS (3 SIMPLE EDITORIAL STEPS)
      ========================================================================= */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#00C995]">
            Workflow Sederhana
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#F6F2EB]">
            Cara Kerja FridgeFirst
          </h2>
          <p className="text-[#A7A098] text-sm">
            Tiga langkah ringkas untuk mengubah kulkas berantakan menjadi sajian istimewa setiap hari.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="rounded-3xl border border-[#302C28] bg-[#1B1917] p-8 space-y-4 hover:border-[#00C995]/40 transition">
            <span className="font-serif text-5xl font-bold text-[#00C995]">01</span>
            <h3 className="font-serif text-xl font-bold text-[#F6F2EB]">
              Catat Bahan di Kulkas
            </h3>
            <p className="text-xs text-[#A7A098] leading-relaxed">
              Ketik cepat atau gunakan fitur bulk add untuk memasukkan telur, ayam, sayur, atau bumbu yang ada di kulkas Anda beserta tanggalnya.
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-3xl border border-[#302C28] bg-[#1B1917] p-8 space-y-4 hover:border-[#00C995]/40 transition">
            <span className="font-serif text-5xl font-bold text-[#00C995]">02</span>
            <h3 className="font-serif text-xl font-bold text-[#F6F2EB]">
              Pilih Resep Rekomendasi
            </h3>
            <p className="text-xs text-[#A7A098] leading-relaxed">
              Sistem langsung mencocokkan resep yang memiliki persentase match tertinggi dan memprioritaskan bahan yang mendekati kedaluwarsa.
            </p>
          </div>

          {/* Step 3 */}
          <div className="rounded-3xl border border-[#302C28] bg-[#1B1917] p-8 space-y-4 hover:border-[#00C995]/40 transition">
            <span className="font-serif text-5xl font-bold text-[#00C995]">03</span>
            <h3 className="font-serif text-xl font-bold text-[#F6F2EB]">
              Masak dengan Tenang
            </h3>
            <p className="text-xs text-[#A7A098] leading-relaxed">
              Buka mode Cook Now, ikuti langkah memasak tahap demi tahap tanpa repot menghitung timer secara manual, lalu beri rating makanan Anda.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. GRAND CALL TO ACTION BANNER
      ========================================================================= */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-[#00C995]/40 bg-gradient-to-r from-[#1B1917] via-[#23211E] to-[#12110F] p-8 sm:p-14 text-center shadow-2xl space-y-6">
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#00C995]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-[#00A99A]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00C995]/15 border border-[#00C995]/30 px-3 py-1 text-xs font-bold text-[#00C995]">
              <Sparkles className="h-3.5 w-3.5" />
              Mulai Sekarang Gratis
            </span>

            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#F6F2EB] leading-tight">
              Siap Menyelamatkan Makanan di Kulkas Anda?
            </h2>

            <p className="text-sm sm:text-base text-[#A7A098] leading-relaxed">
              Bergabunglah dengan ribuan keluarga dan koki rumahan yang memasak lebih hemat, lezat,
              dan bebas dari sampah makanan.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/fridge"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#00C995] to-[#00A99A] hover:brightness-110 px-8 py-4 text-sm font-bold text-[#0B0A09] shadow-xl shadow-[#00C995]/30 hover:scale-[1.02] transition-all"
              >
                <Refrigerator className="h-5 w-5" />
                <span>Buka Kulkas Saya Sekarang</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/recipes"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-[#302C28] bg-[#1B1917] hover:bg-[#23211E] px-7 py-4 text-sm font-bold text-[#F6F2EB] transition"
              >
                <Utensils className="h-4 w-4" />
                <span>Eksplor 22+ Resep</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
