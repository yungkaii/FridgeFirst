import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import {
  AlertTriangle,
  ArrowRight,
  ChefHat,
  Clock,
  Flame,
  Plus,
  Refrigerator,
  ShoppingBag,
  Sparkles,
  TrendingDown,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { bulkAddFridgeIngredientsFn, getDashboardSummaryFn } from '../server/api'

export const Route = createFileRoute('/dashboard')({
  loader: async () => {
    return await getDashboardSummaryFn()
  },
  component: DashboardPage,
})

const CHART_COLORS = [
  '#00C995', // emerald
  '#00A99A', // teal
  '#FFB020', // amber
  '#FF5C65', // coral
  '#8B5CF6', // purple
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // gold
]

function DashboardPage() {
  const data = Route.useLoaderData()
  const router = useRouter()
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [bulkInput, setBulkInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bulkInput.trim()) return

    setIsSubmitting(true)
    try {
      await bulkAddFridgeIngredientsFn({
        data: {
          rawInput: bulkInput,
          defaultStorageLocation: 'fridge',
        },
      })
      setBulkInput('')
      setIsBulkModalOpen(false)
      await router.invalidate()
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0A09] text-[#F6F2EB] px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#302C28] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-[#00C995]/30 bg-[#00C995]/10 px-3 py-1 text-[11px] font-bold text-[#00C995] shadow-[0_0_15px_rgba(0,201,149,0.15)]">
              Kitchen Hub OS
            </span>
            <span className="text-xs text-[#A7A098] font-medium">
              Selamat Datang, {data.userName || 'Koki FridgeFirst'}
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-[#F6F2EB] mt-2">
            Dashboard Dapur
          </h1>
          <p className="text-xs sm:text-sm text-[#A7A098] max-w-xl mt-1">
            Ringkasan ketersediaan bahan, potensi penyelamatan makanan, dan rekomendasi menu hari ini.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#302C28] bg-[#1B1917] hover:bg-[#23211E] px-4 py-2.5 text-xs font-semibold text-[#F6F2EB] transition shadow-sm hover:border-[#FFB020]/40"
          >
            <Zap className="h-3.5 w-3.5 text-[#FFB020]" />
            <span>Tambah Cepat (Banyak)</span>
          </button>

          <Link
            to="/fridge"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#00C995] to-[#00A99A] hover:brightness-110 px-4 py-2.5 text-xs font-bold text-[#0B0A09] transition shadow-[0_4px_20px_rgba(0,201,149,0.3)] hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Tambah Bahan</span>
          </Link>

          <Link
            to="/recipes"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#302C28] bg-[#1B1917] hover:bg-[#23211E] hover:border-[#00C995]/40 px-4 py-2.5 text-xs font-semibold text-[#F6F2EB] transition shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#00C995]" />
            <span>Jelajahi Resep</span>
          </Link>
        </div>
      </div>

      {/* 4 Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Bahan di Kulkas */}
        <div className="rounded-3xl border border-[#302C28] bg-[#1B1917] p-6 space-y-3 shadow-md transition-all duration-300 hover:border-[#00C995]/40 hover:shadow-[0_10px_30px_rgba(0,201,149,0.15)] hover:-translate-y-0.5">
          <div className="flex items-center justify-between text-[#A7A098]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Bahan di Kulkas</span>
            <div className="h-8 w-8 rounded-xl border border-[#302C28] bg-[#23211E] flex items-center justify-center text-[#00C995]">
              <Refrigerator className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl sm:text-4xl font-bold text-[#F6F2EB]">
              {data.totalIngredients}
            </span>
            <span className="text-xs text-[#A7A098]">bahan aktif</span>
          </div>
          <Link
            to="/fridge"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#00C995] hover:underline pt-1"
          >
            Kelola inventaris <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Card 2: Siap Masak Hari Ini */}
        <div className="rounded-3xl border border-[#302C28] bg-[#1B1917] p-6 space-y-3 shadow-md transition-all duration-300 hover:border-[#00A99A]/40 hover:shadow-[0_10px_30px_rgba(0,169,154,0.15)] hover:-translate-y-0.5">
          <div className="flex items-center justify-between text-[#A7A098]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Siap Masak Hari Ini</span>
            <div className="h-8 w-8 rounded-xl border border-[#302C28] bg-[#23211E] flex items-center justify-center text-[#00A99A]">
              <ChefHat className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl sm:text-4xl font-bold text-[#00A99A]">
              {data.readyToCookCount}
            </span>
            <span className="text-xs text-[#A7A098]">resep 100% cocok</span>
          </div>
          <Link
            to="/recipes"
            search={{ onlyReady: true } as any}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#00A99A] hover:underline pt-1"
          >
            Lihat menu siap masak <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Card 3: Mendekati Expired */}
        <div className="rounded-3xl border border-[#302C28] bg-[#1B1917] p-6 space-y-3 shadow-md transition-all duration-300 hover:border-[#FFB020]/40 hover:shadow-[0_10px_30px_rgba(255,176,32,0.15)] hover:-translate-y-0.5">
          <div className="flex items-center justify-between text-[#A7A098]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Segera Kedaluwarsa</span>
            <div className="h-8 w-8 rounded-xl border border-[#302C28] bg-[#23211E] flex items-center justify-center text-[#FFB020]">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl sm:text-4xl font-bold text-[#FFB020]">
              {data.expiringSoonCount}
            </span>
            <span className="text-xs text-[#A7A098]">bahan ≤ 2 hari lagi</span>
          </div>
          <Link
            to="/use-it-up"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#FFB020] hover:underline pt-1"
          >
            Aktifkan "Use It Up" mode <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Card 4: Estimated Waste Prevented */}
        <div className="rounded-3xl border border-[#302C28] bg-[#1B1917] p-6 space-y-3 shadow-md transition-all duration-300 hover:border-[#00C995]/40 hover:shadow-[0_10px_30px_rgba(0,201,149,0.15)] hover:-translate-y-0.5">
          <div className="flex items-center justify-between text-[#A7A098]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Food Waste Dicegah</span>
            <div className="h-8 w-8 rounded-xl border border-[#302C28] bg-[#23211E] flex items-center justify-center text-[#00C995]">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl sm:text-4xl font-bold text-[#00C995]">
              ~{data.preventedWasteKg}
            </span>
            <span className="text-xs text-[#A7A098]">kg bahan makanan</span>
          </div>
          <Link
            to="/history"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#00C995] hover:underline pt-1"
          >
            Lihat riwayat masak <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* "USE IT UP" EMERGENCY CALLOUT BANNER (Controlled Warning Surface) */}
      {data.expiringSoonCount > 0 && (
        <div className="rounded-2xl border border-[#302C28] bg-[#1B1917] p-5 text-[#F6F2EB] shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#FFB020]/30 bg-[#FFB020]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#FFB020]">
              <Zap className="h-3 w-3 fill-current" />
              <span>Prioritas Darurat Kulkas</span>
            </div>
            <h3 className="font-editorial text-lg sm:text-xl font-bold text-[#F6F2EB]">
              Ada {data.expiringSoonCount} Bahan yang Harus Segera Dihabiskan!
            </h3>
            <p className="text-xs text-[#A7A098] max-w-xl">
              Algoritma Use It Up merekomendasikan resep yang mengombinasikan bahan kritis di atas hari ini
              agar tidak berakhir di tempat sampah.
            </p>
          </div>

          <Link
            to="/use-it-up"
            className="inline-flex items-center gap-2 rounded-xl bg-[#FFB020] hover:bg-[#e69e1c] px-5 py-2.5 text-xs font-bold text-[#0B0A09] transition whitespace-nowrap shadow-sm"
          >
            <span>Buka Mode "Use It Up"</span>
            <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
          </Link>
        </div>
      )}

      {/* Main Grid: Left Column (Recommended Recipes + Chart) & Right Column (Expiring Items & Shopping List) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Top "Cook Now" Recommendations */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#302C28] pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FFB020]/15 text-[#FFB020]">
                <Flame className="h-4 w-4" />
              </div>
              <h2 className="font-editorial text-lg sm:text-xl font-bold text-[#F6F2EB]">
                Menu Rekomendasi "Cook Now"
              </h2>
            </div>
            <Link
              to="/recipes"
              className="text-xs font-semibold text-[#00C995] hover:underline flex items-center gap-1"
            >
              Lihat Semua Resep <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3.5">
            {data.topCookNow.map((recipe) => (
              <div
                key={recipe.id}
                className="group rounded-2xl border border-[#302C28] bg-[#1B1917] p-4 shadow-xs hover:border-[#00C995]/40 hover:bg-[#23211E] transition flex flex-col sm:flex-row gap-4 items-start sm:items-center"
              >
                {/* Horizontal Recipe Image on Desktop */}
                <div className="relative h-32 w-full sm:h-32 sm:w-44 flex-shrink-0 overflow-hidden rounded-xl bg-[#12110F]">
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-2 left-2 rounded-md bg-[#0B0A09]/80 px-2 py-0.5 text-[10px] font-semibold text-[#F6F2EB] backdrop-blur-md">
                    {recipe.category}
                  </div>
                </div>

                {/* Recipe Info */}
                <div className="flex-1 space-y-1.5 w-full">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Match Badge */}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        recipe.fridgeMatchPercentage === 100
                          ? 'bg-[#00C995]/15 text-[#00C995] border border-[#00C995]/30'
                          : 'bg-[#00A99A]/15 text-[#00A99A] border border-[#00A99A]/30'
                      }`}
                    >
                      {recipe.fridgeMatchPercentage}% Match ({recipe.matchedIngredientsCount}/{recipe.totalIngredientsCount})
                    </span>

                    {/* Waste Score Badge */}
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#FFB020]/30 bg-[#FFB020]/15 px-2 py-0.5 text-[11px] font-bold text-[#FFB020]">
                      <Flame className="h-3 w-3 fill-current" />
                      Score: {recipe.wasteScore}
                    </span>

                    {recipe.expiringRescuedCount > 0 && (
                      <span className="rounded-full border border-[#FF5C65]/30 bg-[#FF5C65]/15 px-2 py-0.5 text-[11px] font-bold text-[#FF5C65]">
                        ⚡ {recipe.expiringRescuedCount} kritis
                      </span>
                    )}
                  </div>

                  <h3 className="font-editorial text-base sm:text-lg font-bold text-[#F6F2EB] group-hover:text-[#00C995] transition-colors line-clamp-1">
                    {recipe.title}
                  </h3>

                  <p className="text-xs text-[#A7A098] line-clamp-2 leading-relaxed">
                    {recipe.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between pt-2 border-t border-[#302C28] text-xs text-[#A7A098]">
                    <div className="flex items-center gap-3.5">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-[#00C995]" /> {recipe.totalTimeMinutes} mnt
                      </span>
                      <span className="flex items-center gap-1">
                        <ChefHat className="h-3 w-3 text-[#00C995]" /> {recipe.difficulty}
                      </span>
                      <span>{recipe.servings} porsi</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to="/recipes/$recipeId"
                        params={{ recipeId: String(recipe.id) }}
                        className="rounded-lg border border-[#302C28] bg-[#12110F] px-2.5 py-1 text-[11px] font-semibold text-[#F6F2EB] hover:bg-[#23211E] transition"
                      >
                        Detail
                      </Link>

                      <Link
                        to="/cook/$recipeId"
                        params={{ recipeId: String(recipe.id) }}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#00C995] hover:bg-[#00b585] px-3 py-1 text-[11px] font-bold text-[#0B0A09] transition"
                      >
                        Masak Sekarang <ArrowRight className="h-3 w-3 stroke-[2.5]" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Category Distribution Recharts Chart */}
          <div className="rounded-2xl border border-[#302C28] bg-[#1B1917] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#302C28] pb-3">
              <h3 className="font-editorial text-sm sm:text-base font-bold text-[#F6F2EB]">
                Distribusi Kategori Bahan di Kulkas
              </h3>
              <span className="text-[11px] text-[#A7A098]">Komposisi Saat Ini</span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#A7A098" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#A7A098" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1B1917',
                      borderRadius: '12px',
                      border: '1px solid #302C28',
                      color: '#F6F2EB',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {data.categoryChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Expiring Soon Items Sidebar & Quick Shopping Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Dedicated Expiring Soon Sidebar */}
          <div className="rounded-2xl border border-[#302C28] bg-[#1B1917] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#302C28] pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[#FFB020]" />
                <h3 className="font-editorial text-sm sm:text-base font-bold text-[#F6F2EB]">
                  Segera Kedaluwarsa
                </h3>
              </div>
              <span className="rounded-full border border-[#FFB020]/30 bg-[#FFB020]/15 px-2 py-0.5 text-[10px] font-bold text-[#FFB020]">
                Perhatian
              </span>
            </div>

            <div className="space-y-2">
              {data.expiringItems.length === 0 ? (
                <p className="text-xs text-[#A7A098] py-4 text-center">
                  Bagus! Semua bahan kulkas masih dalam kondisi segar.
                </p>
              ) : (
                data.expiringItems.map((item) => {
                  const isCritical = item.daysRemaining <= 1
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border border-[#302C28] bg-[#12110F] p-3 transition hover:border-[#FFB020]/30"
                    >
                      <div>
                        <p className="text-xs font-bold text-[#F6F2EB]">{item.customName}</p>
                        <p className="text-[11px] text-[#A7A098]">
                          {item.quantity} {item.unit} • {item.storageLocation}
                        </p>
                      </div>

                      <span
                        className={`rounded-lg px-2 py-0.5 text-[10px] font-bold border ${
                          isCritical
                            ? 'border-[#FF5C65]/30 bg-[#FF5C65]/15 text-[#FF5C65]'
                            : 'border-[#FFB020]/30 bg-[#FFB020]/15 text-[#FFB020]'
                        }`}
                      >
                        {item.daysRemaining <= 0 ? 'Hari ini!' : `${item.daysRemaining} hr lagi`}
                      </span>
                    </div>
                  )
                })
              )}
            </div>

            <Link
              to="/use-it-up"
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#FFB020] hover:bg-[#e69e1c] px-3.5 py-2.5 text-xs font-bold text-[#0B0A09] transition"
            >
              <Zap className="h-3.5 w-3.5 fill-current" />
              <span>Gunakan di Menu "Use It Up"</span>
            </Link>
          </div>

          {/* Quick Shopping List Banner */}
          <div className="rounded-2xl border border-[#302C28] bg-[#1B1917] p-5 space-y-3">
            <div className="flex items-center gap-2 text-[#00C995] border-b border-[#302C28] pb-3">
              <ShoppingBag className="h-4 w-4" />
              <h3 className="font-editorial text-sm sm:text-base font-bold text-[#F6F2EB]">
                Daftar Belanja
              </h3>
            </div>
            <p className="text-xs text-[#A7A098] leading-relaxed">
              Kekurangan bahan untuk memasak resep? Tambahkan langsung ke shopping list dan
              pindahkan ke kulkas otomatis begitu selesai belanja.
            </p>
            <Link
              to="/shopping"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00C995] hover:underline"
            >
              Buka Daftar Belanja <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Modal Quick Bulk Add */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-[#302C28] bg-[#1B1917] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#302C28] pb-3">
              <h3 className="font-editorial text-lg font-bold text-[#F6F2EB] flex items-center gap-2">
                <Zap className="h-4.5 w-4.5 text-[#FFB020]" />
                Bulk Add Bahan Kulkas Sekaligus
              </h3>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="text-[#A7A098] hover:text-[#F6F2EB] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#A7A098] leading-relaxed">
              Ketik beberapa nama bahan sekaligus dipisahkan dengan tanda koma atau baris baru.
              Contoh: <span className="font-semibold text-[#00C995]">telur, bawang merah, cabai rawit, nasi, wortel</span>
            </p>

            <form onSubmit={handleBulkSubmit} className="space-y-4">
              <textarea
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder="Contoh: telur ayam, tomat, kangkung, tahu putih, tempe"
                rows={4}
                className="w-full rounded-xl border border-[#302C28] bg-[#12110F] p-3 text-xs sm:text-sm text-[#F6F2EB] placeholder:text-[#A7A098]/50 focus:border-[#00C995] focus:outline-none"
                required
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-[#A7A098] hover:bg-[#23211E] hover:text-[#F6F2EB] transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-[#00C995] hover:bg-[#00b585] px-5 py-2 text-xs font-bold text-[#0B0A09] shadow-sm disabled:opacity-50 transition"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Semua Bahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
