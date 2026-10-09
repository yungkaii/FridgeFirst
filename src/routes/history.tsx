import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Calendar,
  ChefHat,
  Clock,
  Heart,
  History,
  Play,
  RotateCcw,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Utensils,
} from 'lucide-react'
import { useState } from 'react'
import { getCookingHistoryFn, getFavoritesFn } from '../server/api'

export const Route = createFileRoute('/history')({
  loader: async () => {
    const historyData = await getCookingHistoryFn()
    const favoritesData = await getFavoritesFn()
    return {
      history: historyData.history,
      favorites: favoritesData.favorites,
    }
  },
  component: HistoryPage,
})

function HistoryPage() {
  const { history, favorites } = Route.useLoaderData()
  const [activeTab, setActiveTab] = useState<'history' | 'favorites'>('history')

  const renderRatingBadge = (rating: string) => {
    if (rating === 'masak_lagi') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#00C995]/20 border border-[#00C995]/30 px-2.5 py-1 text-xs font-semibold text-[#00C995]">
          <ThumbsUp className="h-3.5 w-3.5" /> Masak Lagi!
        </span>
      )
    }
    if (rating === 'oke') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 text-xs font-semibold text-amber-300">
          <span>👌</span> Cukup Oke
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#FF5C65]/20 border border-[#FF5C65]/30 px-2.5 py-1 text-xs font-semibold text-[#FF5C65]">
        <ThumbsDown className="h-3.5 w-3.5" /> Tidak Akan Ulang
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B0A09] text-[#F6F2EB] px-4 py-8 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#302C28] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00C995]/30 bg-[#00C995]/10 px-3 py-1 text-xs font-semibold text-[#00C995] mb-2">
            <History className="h-3.5 w-3.5" />
            <span>Kitchen Logbook</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#F6F2EB]">
            Riwayat Masak & Favorit
          </h1>
          <p className="text-sm text-[#A7A098] mt-1">
            Kumpulan resep yang sudah pernah Anda selesaikan beserta rating rasa dan daftar favorit.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-2xl bg-[#1B1917] border border-[#302C28] p-1.5 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'history'
                ? 'bg-[#23211E] text-[#F6F2EB] shadow-sm border border-[#302C28]'
                : 'text-[#A7A098] hover:text-[#F6F2EB]'
            }`}
          >
            <History className="h-4 w-4" />
            <span>Riwayat ({history.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'favorites'
                ? 'bg-[#23211E] text-[#F6F2EB] shadow-sm border border-[#302C28]'
                : 'text-[#A7A098] hover:text-[#F6F2EB]'
            }`}
          >
            <Heart className="h-4 w-4 text-[#FF5C65] fill-current" />
            <span>Favorit ({favorites.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Riwayat Memasak */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#302C28] bg-[#1B1917] p-12 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#23211E] text-[#00C995] border border-[#302C28]">
                <ChefHat className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-[#F6F2EB]">
                  Belum Ada Resep yang Selesai Dimasak
                </h3>
                <p className="text-xs text-[#A7A098] max-w-sm mx-auto leading-relaxed">
                  Gunakan mode "Cook Now" saat memasak resep pertama Anda dan berikan ulasan setelahnya!
                </p>
              </div>
              <Link
                to="/recipes"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00C995] to-[#00A99A] px-5 py-2.5 text-xs font-bold text-[#0B0A09] shadow-md shadow-[#00C995]/20 hover:brightness-110 transition"
              >
                <Utensils className="h-4 w-4" /> Mulai Pilih Resep
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item: any) => (
                <div
                  key={item.id}
                  className="rounded-3xl border border-[#302C28] bg-[#1B1917] p-5 shadow-sm hover:border-[#302C28]/80 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    {item.recipe?.imageUrl && (
                      <img
                        src={item.recipe.imageUrl}
                        alt={item.recipe.title}
                        className="h-16 w-16 rounded-2xl object-cover flex-shrink-0 border border-[#302C28]"
                      />
                    )}

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-serif text-base font-bold text-[#F6F2EB]">
                          {item.recipe?.title || 'Resep Masakan'}
                        </h3>
                        {renderRatingBadge(item.rating)}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-[#A7A098]">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(item.cookedAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {item.recipe?.category && <span>• {item.recipe.category}</span>}
                      </div>

                      {item.notes && (
                        <p className="text-xs italic text-[#A7A098] bg-[#12110F] px-3 py-1.5 rounded-xl border border-[#302C28] inline-block">
                          "{item.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {item.recipe && (
                      <Link
                        to="/cook/$recipeId"
                        params={{ recipeId: String(item.recipe.id) }}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#302C28] bg-[#23211E] px-3.5 py-2 text-xs font-bold text-[#F6F2EB] hover:border-[#00C995]/50 hover:text-[#00C995] transition"
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Masak Ulang
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Resep Favorit */}
      {activeTab === 'favorites' && (
        <div className="space-y-4">
          {favorites.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#302C28] bg-[#1B1917] p-12 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#23211E] text-[#FF5C65] border border-[#302C28]">
                <Heart className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-[#F6F2EB]">
                  Belum Ada Resep Favorit
                </h3>
                <p className="text-xs text-[#A7A098] max-w-sm mx-auto leading-relaxed">
                  Klik ikon hati pada resep apa saja di halaman Rekomendasi Resep untuk menyimpannya ke sini.
                </p>
              </div>
              <Link
                to="/recipes"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00C995] to-[#00A99A] px-5 py-2.5 text-xs font-bold text-[#0B0A09] shadow-md shadow-[#00C995]/20 hover:brightness-110 transition"
              >
                <Sparkles className="h-4 w-4" /> Cari Resep Menarik
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((recipe: any) => (
                <div
                  key={recipe.id}
                  className="group overflow-hidden rounded-3xl border border-[#302C28] bg-[#1B1917] shadow-lg hover:border-[#00C995]/50 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44 w-full overflow-hidden bg-[#12110F]">
                      <img
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 rounded-xl bg-[#0B0A09]/80 border border-[#302C28] px-2.5 py-1 text-[11px] font-bold text-[#F6F2EB] backdrop-blur-md">
                        {recipe.category}
                      </div>
                      <div className="absolute top-3 right-3 rounded-full bg-[#FF5C65] p-2 text-white shadow-md">
                        <Heart className="h-4 w-4 fill-current" />
                      </div>
                    </div>

                    <div className="p-5 space-y-2">
                      <h3 className="font-serif text-base font-bold text-[#F6F2EB] group-hover:text-[#00C995] transition-colors line-clamp-1">
                        {recipe.title}
                      </h3>
                      <p className="text-xs text-[#A7A098] line-clamp-2 leading-relaxed">
                        {recipe.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-[#A7A098] pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-[#00C995]" /> {recipe.totalTimeMinutes}m
                        </span>
                        <span>{recipe.difficulty}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex gap-2">
                    <Link
                      to="/recipes/$recipeId"
                      params={{ recipeId: String(recipe.id) }}
                      className="flex-1 rounded-xl border border-[#302C28] bg-[#23211E] py-2 text-center text-xs font-bold text-[#F6F2EB] hover:bg-[#302C28] transition"
                    >
                      Detail
                    </Link>
                    <Link
                      to="/cook/$recipeId"
                      params={{ recipeId: String(recipe.id) }}
                      className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-[#00C995] to-[#00A99A] py-2 text-xs font-bold text-[#0B0A09] hover:brightness-110 transition"
                    >
                      <Play className="h-3 w-3 fill-current" /> Masak
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
