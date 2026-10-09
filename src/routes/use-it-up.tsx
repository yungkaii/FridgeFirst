import { createFileRoute, Link } from '@tanstack/react-router'
import {
  AlertTriangle,
  ArrowRight,
  ChefHat,
  Clock,
  Flame,
  Play,
  Refrigerator,
  Sparkles,
  Zap,
} from 'lucide-react'
import { getUseItUpRecommendationsFn } from '../server/api'

export const Route = createFileRoute('/use-it-up')({
  loader: async () => {
    return await getUseItUpRecommendationsFn()
  },
  component: UseItUpPage,
})

function UseItUpPage() {
  const { criticalIngredients, rescueRecipes } = Route.useLoaderData()

  return (
    <div className="min-h-screen bg-[#0B0A09] text-[#F6F2EB] px-4 py-8 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="border-b border-[#302C28] pb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 mb-2">
          <Zap className="h-3.5 w-3.5 fill-current" />
          <span>Zero Waste Emergency Rescue</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#F6F2EB]">
          Use It Up — Selamatkan Bahan Kritis
        </h1>
        <p className="text-sm text-[#A7A098] max-w-2xl leading-relaxed mt-2 font-sans">
          Algoritma cerdas kami mendeteksi bahan kulkas yang paling mendesak untuk dihabiskan dan
          mencari resep yang mampu memanfaatkan kombinasi bahan-bahan tersebut sekaligus hari ini.
        </p>
      </div>

      {/* Critical Ingredients Spotlight Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-[#1B1917] via-[#23211E] to-[#1B1917] p-6 sm:p-8 shadow-xl space-y-5">
        <div className="absolute -top-24 -right-24 h-64 w-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 relative z-10">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-300">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              Target Penyelamatan Utama (2–3 Bahan)
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#F6F2EB]">
              Bahan yang Harus Segera Dihabiskan
            </h2>
          </div>
          <Link
            to="/fridge"
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 transition"
          >
            Atur Kulkas <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {criticalIngredients.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#A7A098]">
            Kulkas kamu kosong! Tambahkan bahan di halaman Kulkas untuk mulai mendeteksi penyelamatan.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 relative z-10">
            {criticalIngredients.map((ing) => (
              <div
                key={ing.id}
                className="rounded-2xl border border-amber-500/20 bg-[#12110F]/80 p-4 shadow-sm hover:border-amber-500/40 space-y-2 backdrop-blur-sm transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#A7A098]">
                    {ing.category}
                  </span>
                  <span
                    className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                      ing.daysRemaining <= 1
                        ? 'bg-[#FF5C65]/20 border border-[#FF5C65]/30 text-[#FF5C65] animate-pulse'
                        : 'bg-amber-500/20 border border-amber-500/30 text-amber-300'
                    }`}
                  >
                    {ing.daysRemaining <= 0 ? 'Hari ini!' : `${ing.daysRemaining} hari lagi`}
                  </span>
                </div>
                <h3 className="font-serif text-base font-bold text-[#F6F2EB]">
                  {ing.customName}
                </h3>
                <p className="text-xs text-[#A7A098] font-medium">
                  {ing.quantity} {ing.unit} • Tersimpan di {ing.storageLocation}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommended Rescue Recipes */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-bold text-[#F6F2EB] flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-[#00C995]" />
              Resep Rekomendasi Penyelamat Bahan
            </h2>
            <p className="text-xs text-[#A7A098]">
              Ditemukan {rescueRecipes.length} resep yang memanfaatkan bahan kritis di atas.
            </p>
          </div>
        </div>

        {rescueRecipes.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#302C28] bg-[#1B1917] p-12 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#23211E] text-amber-400 border border-[#302C28]">
              <Refrigerator className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-[#F6F2EB]">
                Belum Ada Resep Kombinasi yang Pas
              </h3>
              <p className="text-xs text-[#A7A098] max-w-sm mx-auto leading-relaxed">
                Coba tambahkan beberapa bahan pendamping seperti telur, minyak goreng, atau nasi di
                kulkas Anda untuk membuka kombinasi resep penyelamatan.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rescueRecipes.map((recipe: any) => (
              <div
                key={recipe.id}
                className="group overflow-hidden rounded-3xl border border-[#302C28] bg-[#1B1917] hover:border-[#00C995]/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  {/* Image with Super Rescue Badge */}
                  <div className="relative h-48 w-full overflow-hidden bg-[#12110F]">
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Rescue Badge */}
                    <div className="absolute top-3 left-3 rounded-xl bg-amber-500 px-3 py-1 text-xs font-bold text-[#0B0A09] shadow-lg flex items-center gap-1.5">
                      <Zap className="h-4 w-4 fill-current" />
                      <span>
                        Menyelamatkan {recipe.criticalRescuedCount} dari {criticalIngredients.length} Bahan Kritis!
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="rounded-xl bg-[#0B0A09]/80 border border-[#302C28] px-2.5 py-1 text-xs font-bold text-[#F6F2EB] backdrop-blur-md">
                        {recipe.fridgeMatchPercentage}% Match ({recipe.matchedIngredientsCount}/{recipe.totalIngredientsCount})
                      </span>
                      <span className="rounded-xl bg-[#0B0A09]/80 border border-[#302C28] px-2.5 py-1 text-xs font-bold text-amber-300 backdrop-blur-md flex items-center gap-1">
                        <Flame className="h-3 w-3 fill-current text-amber-400" /> Score: {recipe.wasteScore}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-4">
                    <h3 className="font-serif text-xl font-bold text-[#F6F2EB] group-hover:text-[#00C995] transition-colors">
                      {recipe.title}
                    </h3>
                    <p className="text-xs text-[#A7A098] line-clamp-2 leading-relaxed">
                      {recipe.description}
                    </p>

                    {/* Rescued Ingredients Tag List */}
                    <div className="rounded-2xl bg-[#23211E] border border-amber-500/20 p-3.5 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                        Bahan Kritis yang Berhasil Diselamatkan:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {recipe.criticalRescuedNames.map((name: string) => (
                          <span
                            key={name}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#12110F] px-2.5 py-1 text-xs font-semibold text-amber-300 border border-amber-500/30"
                          >
                            ✓ {name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-[#A7A098] pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-[#00C995]" /> {recipe.totalTimeMinutes} menit
                      </span>
                      <span className="flex items-center gap-1">
                        <ChefHat className="h-3.5 w-3.5 text-[#00C995]" /> {recipe.difficulty}
                      </span>
                      <span>{recipe.servings} porsi</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="p-6 pt-0 flex gap-3">
                  <Link
                    to="/recipes/$recipeId"
                    params={{ recipeId: String(recipe.id) }}
                    className="flex-1 rounded-xl border border-[#302C28] bg-[#23211E] py-2.5 text-center text-xs font-bold text-[#F6F2EB] hover:bg-[#302C28] transition"
                  >
                    Detail Resep
                  </Link>

                  <Link
                    to="/cook/$recipeId"
                    params={{ recipeId: String(recipe.id) }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#00C995] to-[#00A99A] py-2.5 text-xs font-bold text-[#0B0A09] shadow-lg shadow-[#00C995]/20 hover:brightness-110 transition"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Masak Sekarang</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
