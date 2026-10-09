import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import {
  ChefHat,
  Clock,
  Flame,
  Heart,
  Play,
  Plus,
  Search,
  Utensils,
} from 'lucide-react'
import { useState } from 'react'
import { getRecipesFn, toggleFavoriteRecipeFn } from '../../server/api'

export const Route = createFileRoute('/recipes/')({
  validateSearch: (search: Record<string, unknown>): {
    search?: string
    category?: string
    difficulty?: string
    maxTime?: number
    isVegetarian?: boolean
    onlyReady?: boolean
    sortBy?: 'waste' | 'match' | 'missing' | 'time'
  } => ({
    search: typeof search.search === 'string' ? search.search : undefined,
    category: typeof search.category === 'string' ? search.category : undefined,
    difficulty: typeof search.difficulty === 'string' ? search.difficulty : undefined,
    maxTime: typeof search.maxTime === 'number' ? search.maxTime : undefined,
    isVegetarian: search.isVegetarian !== undefined ? search.isVegetarian === true || search.isVegetarian === 'true' : undefined,
    onlyReady: search.onlyReady !== undefined ? search.onlyReady === true || search.onlyReady === 'true' : undefined,
    sortBy: typeof search.sortBy === 'string' ? (search.sortBy as any) : undefined,
  }),
  loader: async () => {
    return await getRecipesFn({ data: {} })
  },
  component: RecipesPage,
})

const CATEGORIES = [
  'Semua',
  'Nasi & Mie',
  'Sup & Kuah',
  'Tumisan',
  'Lauk Protein',
  'Sarapan & Snack',
  'Pasta & Western',
]

const DIFFICULTIES = ['Semua', 'Mudah', 'Sedang', 'Sulit']
const TIME_OPTIONS = [
  { label: 'Semua Waktu', value: 0 },
  { label: '≤ 15 Menit (Kilat)', value: 15 },
  { label: '≤ 25 Menit', value: 25 },
  { label: '≤ 45 Menit', value: 45 },
]

function RecipesPage() {
  const initialData = Route.useLoaderData()
  const searchParams = Route.useSearch()
  const router = useRouter()

  // Filter States initialized from URL search params if present
  const [search, setSearch] = useState(searchParams.search || '')
  const [category, setCategory] = useState(searchParams.category || 'Semua')
  const [difficulty, setDifficulty] = useState(searchParams.difficulty || 'Semua')
  const [maxTime, setMaxTime] = useState<number>(searchParams.maxTime || 0)
  const [isVegetarian, setIsVegetarian] = useState(searchParams.isVegetarian || false)
  const [onlyReady, setOnlyReady] = useState(searchParams.onlyReady || false)
  const [sortBy, setSortBy] = useState<'waste' | 'match' | 'missing' | 'time'>(
    (searchParams.sortBy as any) || 'waste'
  )

  // Filtered client side for instant responsiveness
  let recipes = [...initialData.recipes]

  if (search.trim()) {
    const q = search.toLowerCase()
    recipes = recipes.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.tags.some((t: string) => t.toLowerCase().includes(q))
    )
  }

  if (category !== 'Semua') {
    recipes = recipes.filter((r) => r.category === category)
  }

  if (difficulty !== 'Semua') {
    recipes = recipes.filter((r) => r.difficulty === difficulty)
  }

  if (maxTime > 0) {
    recipes = recipes.filter((r) => r.totalTimeMinutes <= maxTime)
  }

  if (isVegetarian) {
    recipes = recipes.filter((r) => r.isVegetarian)
  }

  if (onlyReady) {
    recipes = recipes.filter((r) => r.fridgeMatchPercentage === 100)
  }

  // Sorting
  recipes.sort((a, b) => {
    if (sortBy === 'waste') {
      if (b.wasteScore !== a.wasteScore) return b.wasteScore - a.wasteScore
      return b.fridgeMatchPercentage - a.fridgeMatchPercentage
    }
    if (sortBy === 'match') {
      if (b.fridgeMatchPercentage !== a.fridgeMatchPercentage)
        return b.fridgeMatchPercentage - a.fridgeMatchPercentage
      return a.missingIngredientsCount - b.missingIngredientsCount
    }
    if (sortBy === 'missing') {
      if (a.missingIngredientsCount !== b.missingIngredientsCount)
        return a.missingIngredientsCount - b.missingIngredientsCount
      return b.fridgeMatchPercentage - a.fridgeMatchPercentage
    }
    if (sortBy === 'time') {
      if (a.totalTimeMinutes !== b.totalTimeMinutes)
        return a.totalTimeMinutes - b.totalTimeMinutes
      return b.fridgeMatchPercentage - a.fridgeMatchPercentage
    }
    return 0
  })

  const handleToggleFavorite = async (recipeId: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await toggleFavoriteRecipeFn({ data: recipeId })
      await router.invalidate()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0A09] text-[#F6F2EB] px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#302C28] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00C995]/30 bg-[#00C995]/10 px-3 py-1 text-xs font-semibold text-[#00C995] mb-2 shadow-[0_0_15px_rgba(0,201,149,0.15)]">
            <Utensils className="h-3.5 w-3.5" />
            <span>Katalog Resep Cerdas</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-[#F6F2EB]">
            Rekomendasi Resep Dapur
          </h1>
          <p className="text-xs sm:text-sm text-[#A7A098] mt-1">
            Diurutkan berdasarkan bahan kulkas Anda, memprioritaskan makanan yang harus segera dihabiskan.
          </p>
        </div>

        <Link
          to="/fridge"
          className="inline-flex items-center gap-1.5 self-start md:self-auto rounded-xl bg-[#00C995] hover:bg-[#00b585] px-4 py-2.5 text-xs font-bold text-[#0B0A09] transition shadow-xs"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Update Bahan Kulkas</span>
        </Link>
      </div>

      {/* Filter and Control Hub */}
      <div className="rounded-2xl border border-[#302C28] bg-[#1B1917] p-5 shadow-xs space-y-4">
        {/* Top Search & Sort */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A7A098]" />
            <input
              type="text"
              placeholder="Cari resep (contoh: nasi goreng, ayam geprek, tumis kangkung, sup)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[#302C28] bg-[#12110F] pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#F6F2EB] placeholder:text-[#A7A098]/60 focus:border-[#00C995] focus:outline-none"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-semibold text-[#A7A098] whitespace-nowrap">
              Urutkan:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-[#302C28] bg-[#12110F] px-3 py-2 text-xs font-semibold text-[#F6F2EB] focus:border-[#00C995] focus:outline-none"
            >
              <option value="waste">🔥 Waste Score Tertinggi (Prioritas Expired)</option>
              <option value="match">✨ Paling Banyak Bahan Cocok (%)</option>
              <option value="missing">🛒 Paling Sedikit Bahan Kurang</option>
              <option value="time">⚡ Tercepat (Waktu Masak)</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold capitalize whitespace-nowrap transition ${
                category === cat
                  ? 'bg-[#00C995]/15 text-[#00C995] border border-[#00C995]/30'
                  : 'border border-[#302C28] bg-[#12110F] text-[#A7A098] hover:text-[#F6F2EB] hover:bg-[#23211E]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Secondary Filter Badges (Difficulty, Time, Vegetarian, Ready to Cook) */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#302C28] text-xs">
          {/* Difficulty */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#A7A098]">Tingkat:</span>
            <div className="flex rounded-lg border border-[#302C28] bg-[#12110F] p-0.5">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`rounded-md px-2 py-0.5 text-[11px] font-semibold transition ${
                    difficulty === d
                      ? 'bg-[#1B1917] text-[#00C995] shadow-xs'
                      : 'text-[#A7A098] hover:text-[#F6F2EB]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Cooking Time */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#A7A098]">Waktu:</span>
            <select
              value={maxTime}
              onChange={(e) => setMaxTime(Number(e.target.value))}
              className="rounded-lg border border-[#302C28] bg-[#12110F] px-2.5 py-1 text-[11px] font-semibold text-[#F6F2EB] focus:border-[#00C995] focus:outline-none"
            >
              {TIME_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Toggles */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setIsVegetarian(!isVegetarian)}
              className={`rounded-xl border px-3 py-1 text-xs font-semibold transition ${
                isVegetarian
                  ? 'border-[#00C995]/40 bg-[#00C995]/15 text-[#00C995]'
                  : 'border-[#302C28] bg-[#12110F] text-[#A7A098] hover:text-[#F6F2EB]'
              }`}
            >
              🌱 Vegetarian Saja
            </button>

            <button
              onClick={() => setOnlyReady(!onlyReady)}
              className={`rounded-xl border px-3 py-1 text-xs font-semibold transition ${
                onlyReady
                  ? 'border-[#00C995]/40 bg-[#00C995]/15 text-[#00C995]'
                  : 'border-[#302C28] bg-[#12110F] text-[#A7A098] hover:text-[#F6F2EB]'
              }`}
            >
              ✨ Siap Masak (100% Cocok)
            </button>
          </div>
        </div>
      </div>

      {/* Recipe Cards Grid */}
      {recipes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#302C28] bg-[#1B1917] p-12 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#302C28] bg-[#12110F] text-[#FFB020]">
            <Utensils className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-editorial text-lg font-bold text-[#F6F2EB]">
              Tidak Ada Resep yang Cocok dengan Filter Ini
            </h3>
            <p className="text-xs text-[#A7A098] max-w-sm mx-auto">
              Coba sesuaikan kata kunci atau nonaktifkan filter untuk melihat pilihan menu lainnya.
            </p>
          </div>
          <button
            onClick={() => {
              setSearch('')
              setCategory('Semua')
              setDifficulty('Semua')
              setMaxTime(0)
              setIsVegetarian(false)
              setOnlyReady(false)
            }}
            className="rounded-xl border border-[#302C28] bg-[#12110F] hover:bg-[#23211E] px-4 py-2 text-xs font-semibold text-[#F6F2EB] transition"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recipes.map((recipe) => {
            const missingItems = recipe.ingredientsList.filter((i) => !i.hasIngredient)

            return (
              <div
                key={recipe.id}
                className="group rounded-2xl border border-[#302C28] bg-[#1B1917] shadow-xs hover:border-[#00C995]/40 hover:bg-[#23211E] transition flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Recipe Image with Badges */}
                  <div className="relative h-48 w-full overflow-hidden bg-[#12110F]">
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Category pill */}
                    <div className="absolute top-3 left-3 rounded-lg border border-black/40 bg-[#0B0A09]/80 px-2.5 py-1 text-[11px] font-semibold text-[#F6F2EB] backdrop-blur-md">
                      {recipe.category}
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => handleToggleFavorite(recipe.id, e)}
                      className={`absolute top-3 right-3 rounded-full p-2 backdrop-blur-md transition ${
                        recipe.isFavorite
                          ? 'bg-[#FF5C65] text-white shadow-sm'
                          : 'bg-[#0B0A09]/60 text-[#A7A098] hover:text-[#F6F2EB]'
                      }`}
                      title={recipe.isFavorite ? 'Hapus dari favorit' : 'Simpan favorit'}
                    >
                      <Heart
                        className={`h-4 w-4 ${recipe.isFavorite ? 'fill-current' : ''}`}
                      />
                    </button>

                    {/* Match & Waste Score Badges Float */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold backdrop-blur-md shadow-xs ${
                          recipe.fridgeMatchPercentage === 100
                            ? 'bg-[#00C995] text-[#0B0A09]'
                            : 'bg-[#0B0A09]/80 text-[#F6F2EB] border border-[#302C28]'
                        }`}
                      >
                        {recipe.fridgeMatchPercentage}% Match ({recipe.matchedIngredientsCount}/
                        {recipe.totalIngredientsCount} bahan)
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-lg border border-[#FFB020]/30 bg-[#FFB020]/90 px-2.5 py-1 text-xs font-bold text-[#0B0A09] backdrop-blur-md shadow-xs">
                        <Flame className="h-3.5 w-3.5 fill-current" />
                        Score: {recipe.wasteScore}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center gap-3 text-xs text-[#A7A098]">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-[#00C995]" />{' '}
                        {recipe.totalTimeMinutes} menit
                      </span>
                      <span className="flex items-center gap-1">
                        <ChefHat className="h-3.5 w-3.5 text-[#00C995]" /> {recipe.difficulty}
                      </span>
                      <span>{recipe.servings} porsi</span>
                      {recipe.isVegetarian && (
                        <span className="text-[#00C995] font-semibold">🌱 Veg</span>
                      )}
                    </div>

                    <h3 className="font-editorial text-lg font-bold text-[#F6F2EB] group-hover:text-[#00C995] transition-colors line-clamp-1">
                      {recipe.title}
                    </h3>

                    <p className="text-xs text-[#A7A098] line-clamp-2 leading-relaxed">
                      {recipe.description}
                    </p>

                    {/* Rescued / Missing Ingredients Indicator */}
                    <div className="space-y-1 pt-2 border-t border-[#302C28] text-[11px]">
                      {recipe.expiringRescuedCount > 0 && (
                        <p className="font-bold text-[#FF5C65] flex items-center gap-1">
                          ⚡ Menyelamatkan {recipe.expiringRescuedCount} bahan hampir kedaluwarsa!
                        </p>
                      )}

                      {missingItems.length > 0 ? (
                        <p className="text-[#A7A098] line-clamp-1">
                          <span className="font-semibold text-[#F6F2EB]">
                            Kurang ({missingItems.length}):{' '}
                          </span>
                          {missingItems.map((m) => m.name).join(', ')}
                        </p>
                      ) : (
                        <p className="font-bold text-[#00C995]">
                          ✨ Kamu punya semua bahan! Siap dimasak sekarang.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Bottom CTA */}
                <div className="p-5 pt-0 flex gap-2">
                  <Link
                    to="/recipes/$recipeId"
                    params={{ recipeId: String(recipe.id) }}
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl border border-[#302C28] bg-[#12110F] hover:bg-[#23211E] py-2.5 text-center text-xs font-semibold text-[#F6F2EB] transition"
                  >
                    <span>Detail Resep</span>
                  </Link>

                  <Link
                    to="/cook/$recipeId"
                    params={{ recipeId: String(recipe.id) }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#00C995] hover:bg-[#00b585] py-2.5 text-xs font-bold text-[#0B0A09] shadow-xs transition"
                  >
                    <Play className="h-3.5 w-3.5 fill-current stroke-[2.5]" />
                    <span>Cook Now</span>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
