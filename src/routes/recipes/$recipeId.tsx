import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import {
  ArrowLeft,
  CheckCircle2,
  ChefHat,
  Clock,
  Flame,
  Heart,
  Play,
  ShoppingBag,
  Sparkles,
} from 'lucide-react'
import { useState } from 'react'
import {
  addMissingToShoppingListFn,
  getRecipeDetailFn,
  toggleFavoriteRecipeFn,
} from '../../server/api'

export const Route = createFileRoute('/recipes/$recipeId')({
  loader: async ({ params }) => {
    return await getRecipeDetailFn({ data: Number(params.recipeId) })
  },
  component: RecipeDetailPage,
})

function RecipeDetailPage() {
  const { recipe } = Route.useLoaderData()
  const router = useRouter()
  const [isShoppingAdding, setIsShoppingAdding] = useState(false)
  const [shoppingSuccessMessage, setShoppingSuccessMessage] = useState<string | null>(null)

  const handleAddMissingToShoppingList = async () => {
    setIsShoppingAdding(true)
    try {
      const res = await addMissingToShoppingListFn({ data: recipe.id })
      await router.invalidate()
      setShoppingSuccessMessage(
        `Berhasil menambahkan ${res.addedCount} bahan yang kurang ke daftar belanja!`
      )
      setTimeout(() => setShoppingSuccessMessage(null), 5000)
    } catch (err) {
      console.error(err)
    } finally {
      setIsShoppingAdding(false)
    }
  }

  const handleToggleFavorite = async () => {
    try {
      await toggleFavoriteRecipeFn({ data: recipe.id })
      await router.invalidate()
    } catch (err) {
      console.error(err)
    }
  }

  const missingItems = recipe.ingredientsList.filter((i: any) => !i.hasIngredient)

  return (
    <div className="min-h-screen bg-[#0B0A09] text-[#F6F2EB] px-4 py-8 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Back Link */}
      <div>
        <Link
          to="/recipes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A7A098] hover:text-[#00C995] transition"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Resep
        </Link>
      </div>

      {/* Success Notification Alert */}
      {shoppingSuccessMessage && (
        <div className="rounded-xl border border-[#00C995]/40 bg-[#00C995]/15 p-4 text-[#F6F2EB] flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
            <CheckCircle2 className="h-4.5 w-4.5 text-[#00C995]" />
            <span>{shoppingSuccessMessage}</span>
          </div>
          <Link
            to="/shopping"
            className="text-xs font-bold text-[#00C995] underline hover:text-[#F6F2EB]"
          >
            Buka Daftar Belanja &rarr;
          </Link>
        </div>
      )}

      {/* Hero Card */}
      <div className="overflow-hidden rounded-2xl border border-[#302C28] bg-[#1B1917] shadow-lg">
        <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-[#12110F]">
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A09] via-[#0B0A09]/40 to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <span className="rounded-lg border border-[#302C28] bg-[#0B0A09]/80 px-3 py-1 text-xs font-bold text-[#F6F2EB] backdrop-blur-md">
              {recipe.category}
            </span>

            <button
              onClick={handleToggleFavorite}
              className={`rounded-full p-2.5 backdrop-blur-md transition ${
                recipe.isFavorite
                  ? 'bg-[#FF5C65] text-white shadow-sm'
                  : 'bg-[#0B0A09]/70 text-[#A7A098] hover:text-[#F6F2EB] hover:bg-[#0B0A09]'
              }`}
              title={recipe.isFavorite ? 'Hapus dari favorit' : 'Simpan favorit'}
            >
              <Heart
                className={`h-4.5 w-4.5 ${recipe.isFavorite ? 'fill-current' : ''}`}
              />
            </button>
          </div>

          {/* Hero Bottom Overlay Details */}
          <div className="absolute bottom-6 left-6 right-6 space-y-2 text-[#F6F2EB]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-[#00C995] px-2.5 py-0.5 text-xs font-bold text-[#0B0A09]">
                {recipe.fridgeMatchPercentage}% Fridge Match
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-[#FFB020]/30 bg-[#FFB020] px-2.5 py-0.5 text-xs font-bold text-[#0B0A09]">
                <Flame className="h-3 w-3 fill-current" />
                Waste Score: {recipe.wasteScore}
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl font-normal tracking-tight text-[#F6F2EB]">
              {recipe.title}
            </h1>
            <p className="max-w-2xl text-xs sm:text-sm text-[#A7A098] line-clamp-2">
              {recipe.description}
            </p>
          </div>
        </div>

        {/* Action and Metrics Bar */}
        <div className="p-5 border-t border-[#302C28] flex flex-wrap items-center justify-between gap-4 bg-[#12110F]">
          <div className="flex flex-wrap items-center gap-6 text-xs text-[#A7A098]">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-[#00C995]" />
              <span>
                <strong className="text-[#F6F2EB]">{recipe.totalTimeMinutes} menit</strong> total ({recipe.prepTimeMinutes}m persiapan + {recipe.cookTimeMinutes}m masak)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <ChefHat className="h-4 w-4 text-[#00C995]" />
              <span>
                Tingkat: <strong className="text-[#F6F2EB]">{recipe.difficulty}</strong>
              </span>
            </div>
            <div>
              <span>
                Porsi: <strong className="text-[#F6F2EB]">{recipe.servings} orang</strong>
              </span>
            </div>
          </div>

          {/* Start Cooking Mode Button */}
          <Link
            to="/cook/$recipeId"
            params={{ recipeId: String(recipe.id) }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#00C995] hover:bg-[#00b585] px-5 py-2.5 text-xs sm:text-sm font-bold text-[#0B0A09] shadow-sm transition hover:scale-102"
          >
            <Play className="h-4 w-4 fill-current stroke-[2.5]" />
            <span>Mulai Masak (Cook Now Mode) 🧑‍🍳</span>
          </Link>
        </div>
      </div>

      {/* Fridge Match Progress Card */}
      <div className="rounded-2xl border border-[#302C28] bg-[#1B1917] p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="font-editorial text-base sm:text-lg font-bold text-[#F6F2EB] flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-[#00C995]" />
              Status Bahan Kulkas
            </h2>
            <p className="text-xs text-[#A7A098]">
              Kamu memiliki {recipe.matchedIngredientsCount} dari {recipe.totalIngredientsCount} bahan ({recipe.fridgeMatchPercentage}%).
            </p>
          </div>

          {missingItems.length > 0 && (
            <button
              onClick={handleAddMissingToShoppingList}
              disabled={isShoppingAdding}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#302C28] bg-[#12110F] hover:bg-[#23211E] px-3.5 py-2 text-xs font-semibold text-[#F6F2EB] transition disabled:opacity-50"
            >
              <ShoppingBag className="h-3.5 w-3.5 text-[#00C995]" />
              <span>
                {isShoppingAdding
                  ? 'Menambahkan...'
                  : `Tambah ${missingItems.length} Bahan Kurang ke Daftar Belanja`}
              </span>
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="h-2.5 w-full rounded-full bg-[#12110F] border border-[#302C28] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              recipe.fridgeMatchPercentage === 100
                ? 'bg-[#00C995]'
                : recipe.fridgeMatchPercentage >= 70
                ? 'bg-[#00A99A]'
                : 'bg-[#FFB020]'
            }`}
            style={{ width: `${recipe.fridgeMatchPercentage}%` }}
          />
        </div>
      </div>

      {/* Ingredients Grid Section */}
      <div className="space-y-4">
        <h2 className="font-editorial text-xl font-bold text-[#F6F2EB]">
          Daftar Bahan & Status Ketersediaan
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {recipe.ingredientsList.map((item: any) => {
            const isHave = item.hasIngredient
            const status = item.status

            let badgeClass = 'border-[#00C995]/30 bg-[#00C995]/15 text-[#00C995]'
            let statusText = 'Kamu Punya'

            if (status === 'expiring') {
              badgeClass = 'border-[#FF5C65]/30 bg-[#FF5C65]/15 text-[#FF5C65]'
              statusText = 'Hampir Expired (Pakai Cepat!)'
            } else if (status === 'use_soon') {
              badgeClass = 'border-[#FFB020]/30 bg-[#FFB020]/15 text-[#FFB020]'
              statusText = 'Use Soon'
            } else if (status === 'missing') {
              badgeClass = 'border-[#302C28] bg-[#12110F] text-[#A7A098]'
              statusText = 'Perlu Beli'
            }

            return (
              <div
                key={item.recipeIngredientId}
                className={`rounded-xl border p-4 transition ${
                  isHave
                    ? 'border-[#00C995]/30 bg-[#1B1917]'
                    : 'border-[#302C28] bg-[#12110F]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${badgeClass}`}>
                    {statusText}
                  </span>
                  {item.isOptional && (
                    <span className="text-[10px] text-[#A7A098]">Opsional</span>
                  )}
                </div>

                <h3 className="font-editorial text-sm font-bold text-[#F6F2EB]">
                  {item.name}
                </h3>
                <p className="text-xs text-[#A7A098]">
                  Dibutuhkan: {item.requiredQuantity} {item.unit}
                </p>

                {item.matchedUserIngredient && (
                  <p className="text-[11px] text-[#00C995] pt-1">
                    Ada di {item.matchedUserIngredient.storageLocation} ({item.matchedUserIngredient.quantity} {item.matchedUserIngredient.unit})
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step by Step Cooking Instructions */}
      <div className="rounded-2xl border border-[#302C28] bg-[#1B1917] p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[#302C28] pb-4">
          <h2 className="font-editorial text-xl font-bold text-[#F6F2EB]">
            Langkah Memasak
          </h2>
          <span className="text-xs text-[#A7A098]">
            Total {recipe.instructions.length} langkah
          </span>
        </div>

        <div className="space-y-6">
          {recipe.instructions.map((step: any) => (
            <div key={step.step} className="flex gap-4">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#00C995] text-[#0B0A09] font-editorial font-bold text-sm shadow-xs">
                {step.step}
              </div>
              <div className="space-y-1 pt-0.5">
                <h3 className="font-editorial text-base font-bold text-[#F6F2EB]">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#A7A098] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
