import { createFileRoute, useRouter } from '@tanstack/react-router'
import {
  CheckCircle2,
  ChefHat,
  Heart,
  Save,
  ShieldCheck,
  User,
} from 'lucide-react'
import { useState } from 'react'
import { getUserProfileFn, updateUserProfileFn } from '../server/api'

export const Route = createFileRoute('/profile')({
  loader: async () => {
    return await getUserProfileFn()
  },
  component: ProfilePage,
})

const DIET_OPTIONS = [
  { id: 'halal', label: 'Halal Only', desc: 'Resep bebas babi dan alkohol' },
  { id: 'vegetarian', label: 'Vegetarian', desc: 'Tanpa daging merah, ayam, atau ikan' },
  { id: 'cepat', label: 'Cepat Masak', desc: 'Prioritaskan masakan di bawah 20 menit' },
  { id: 'hemat', label: 'Low Budget', desc: 'Fokus pada bahan ekonomis' },
  { id: 'sehat', label: 'Tinggi Serat & Sayur', desc: 'Menu kaya sayuran dan bernutrisi' },
]

const ALLERGY_OPTIONS = [
  { id: 'kacang', label: 'Kacang-kacangan' },
  { id: 'seafood', label: 'Seafood / Udang' },
  { id: 'dairy', label: 'Dairy / Laktosa' },
  { id: 'telur', label: 'Telur' },
  { id: 'gluten', label: 'Gluten / Terigu' },
]

function ProfilePage() {
  const { user } = Route.useLoaderData()
  const router = useRouter()

  const [name, setName] = useState(user.name)
  const [defaultServings, setDefaultServings] = useState(user.defaultServings)
  const [preferredUnit, setPreferredUnit] = useState(user.preferredUnit)
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>(
    user.dietaryPreferences || []
  )
  const [allergies, setAllergies] = useState<string[]>(user.allergies || [])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const toggleDiet = (id: string) => {
    setDietaryPreferences((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    )
  }

  const toggleAllergy = (id: string) => {
    setAllergies((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await updateUserProfileFn({
        data: {
          name,
          defaultServings: Number(defaultServings),
          preferredUnit: preferredUnit as any,
          dietaryPreferences,
          allergies,
        },
      })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 4000)
      await router.invalidate()
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0A09] text-[#F6F2EB] px-4 py-8 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-[#302C28] pb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#00C995]/30 bg-[#00C995]/10 px-3 py-1 text-xs font-semibold text-[#00C995] mb-2">
          <User className="h-3.5 w-3.5" />
          <span>Pengaturan Akun</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#F6F2EB]">
          Profil & Preferensi Memasak
        </h1>
        <p className="text-sm text-[#A7A098] mt-1 font-sans">
          Kustomisasi porsi standar, preferensi diet, dan alergi untuk menyesuaikan rekomendasi resep dapur Anda.
        </p>
      </div>

      {saveSuccess && (
        <div className="rounded-2xl border border-[#00C995]/40 bg-[#00C995]/10 p-4 text-[#00C995] flex items-center gap-2 shadow-sm text-sm font-semibold animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <span>Preferensi memasak Anda berhasil disimpan dan disinkronkan ke rekomendasi!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Profile Card */}
        <div className="rounded-3xl border border-[#302C28] bg-[#1B1917] p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="font-serif text-lg font-bold text-[#F6F2EB] flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-[#00C995]" />
            Informasi Dasar Pengguna
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#A7A098]">
                Nama Lengkap / Nama Koki
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#302C28] bg-[#12110F] p-3 text-sm text-[#F6F2EB] focus:border-[#00C995] focus:outline-none transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#A7A098]">
                Email Terdaftar
              </label>
              <input
                type="email"
                disabled
                value={user.email}
                className="mt-1.5 w-full rounded-xl border border-[#302C28] bg-[#23211E] p-3 text-sm text-[#A7A098] cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-bold text-[#A7A098]">
                Jumlah Porsi Standar
              </label>
              <div className="mt-1.5 flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={defaultServings}
                  onChange={(e) => setDefaultServings(Number(e.target.value))}
                  className="w-24 rounded-xl border border-[#302C28] bg-[#12110F] p-3 text-sm font-bold text-[#F6F2EB] text-center focus:border-[#00C995] focus:outline-none transition"
                />
                <span className="text-xs text-[#A7A098]">orang / porsi masak</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#A7A098]">
                Satuan Ukuran Preferensi
              </label>
              <select
                value={preferredUnit}
                onChange={(e) => setPreferredUnit(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#302C28] bg-[#12110F] p-3 text-sm text-[#F6F2EB] focus:border-[#00C995] focus:outline-none transition"
              >
                <option value="metric">Metrik (gram, kilogram, ml, liter)</option>
                <option value="imperial">Imperial (oz, lbs, cup, fl oz)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dietary Preferences Card */}
        <div className="rounded-3xl border border-[#302C28] bg-[#1B1917] p-6 sm:p-8 shadow-sm space-y-4">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#F6F2EB] flex items-center gap-2">
              <Heart className="h-5 w-5 text-[#FF5C65]" />
              Preferensi Pola Makan
            </h2>
            <p className="text-xs text-[#A7A098] mt-1">
              Resep yang sesuai preferensi ini akan diprioritaskan di rekomendasi menu utama Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {DIET_OPTIONS.map((diet) => {
              const active = dietaryPreferences.includes(diet.id)
              return (
                <div
                  key={diet.id}
                  onClick={() => toggleDiet(diet.id)}
                  className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                    active
                      ? 'border-[#00C995] bg-[#00C995]/10'
                      : 'border-[#302C28] bg-[#12110F] hover:border-[#302C28]/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#F6F2EB]">
                      {diet.label}
                    </span>
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => {}}
                      className="h-4 w-4 rounded accent-[#00C995] cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-[#A7A098] mt-1">{diet.desc}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Allergies Card */}
        <div className="rounded-3xl border border-[#302C28] bg-[#1B1917] p-6 sm:p-8 shadow-sm space-y-4">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#F6F2EB] flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-amber-400" />
              Alergi & Bahan yang Dihindari
            </h2>
            <p className="text-xs text-[#A7A098] mt-1">
              Pilih bahan yang harus dihindari saat merekomendasikan hidangan kulkas.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-2">
            {ALLERGY_OPTIONS.map((allergy) => {
              const active = allergies.includes(allergy.id)
              return (
                <button
                  key={allergy.id}
                  type="button"
                  onClick={() => toggleAllergy(allergy.id)}
                  className={`rounded-2xl px-4 py-2 text-xs font-bold transition-all ${
                    active
                      ? 'bg-[#FF5C65] text-[#0B0A09] shadow-sm'
                      : 'border border-[#302C28] bg-[#12110F] text-[#A7A098] hover:border-[#302C28]/80 hover:text-[#F6F2EB]'
                  }`}
                >
                  {allergy.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#00C995] to-[#00A99A] px-8 py-3.5 text-sm font-bold text-[#0B0A09] shadow-lg shadow-[#00C995]/20 hover:brightness-110 disabled:opacity-50 transition"
          >
            <Save className="h-4 w-4" />
            <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
