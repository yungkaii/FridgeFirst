import { createFileRoute, useRouter } from '@tanstack/react-router'
import {
  Clock,
  Edit2,
  Grid,
  List,
  Plus,
  Refrigerator,
  Search,
  Trash2,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import {
  addFridgeIngredientFn,
  bulkAddFridgeIngredientsFn,
  deleteFridgeIngredientFn,
  getFridgeItemsFn,
  getMasterIngredientsFn,
  seedStarterPantryFn,
  updateFridgeIngredientFn,
} from '../server/api'

export const Route = createFileRoute('/fridge')({
  validateSearch: (search: Record<string, unknown>): { openAdd?: boolean } => ({
    openAdd: search.openAdd !== undefined ? search.openAdd === true || search.openAdd === 'true' : undefined,
  }),
  loader: async () => {
    const fridgeData = await getFridgeItemsFn()
    const masterData = await getMasterIngredientsFn()
    return {
      items: fridgeData.items,
      masterIngredients: masterData.ingredients,
    }
  },
  component: FridgePage,
})

const CATEGORIES = [
  'Semua',
  'sayur',
  'protein',
  'karbohidrat',
  'bumbu',
  'dairy',
  'buah',
  'frozen',
  'lainnya',
]

const STORAGE_LOCATIONS = ['Semua', 'fridge', 'freezer', 'pantry']
const STATUS_FILTERS = ['Semua', 'Expiring', 'Use Soon', 'Fresh', 'Expired']

function FridgePage() {
  const { items, masterIngredients } = Route.useLoaderData()
  const searchParams = Route.useSearch()
  const router = useRouter()

  // Filters state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [selectedLocation, setSelectedLocation] = useState('Semua')
  const [selectedStatus, setSelectedStatus] = useState('Semua')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // React to openAdd search parameter from header
  useState(() => {
    if (searchParams.openAdd) {
      setIsAddModalOpen(true)
    }
  })

  // Single Add Form State
  const [formName, setFormName] = useState('')
  const [formCategory, setFormCategory] = useState<'sayur' | 'buah' | 'protein' | 'karbohidrat' | 'dairy' | 'bumbu' | 'frozen' | 'lainnya'>('sayur')
  const [formQuantity, setFormQuantity] = useState(1)
  const [formUnit, setFormUnit] = useState('gram')
  const [formLocation, setFormLocation] = useState<'fridge' | 'freezer' | 'pantry'>('fridge')
  const [formShelfDays, setFormShelfDays] = useState(7)
  const [formNotes, setFormNotes] = useState('')

  // Bulk Add Form State
  const [bulkInput, setBulkInput] = useState('')

  // Handle Quick Select from Master Ingredients Autocomplete
  const handleSelectMaster = (name: string) => {
    const matched = masterIngredients.find((m: any) => m.name.toLowerCase() === name.toLowerCase())
    if (matched) {
      setFormName(matched.name)
      setFormCategory(matched.category as any)
      setFormUnit(matched.defaultUnit)
      setFormShelfDays(matched.defaultShelfLifeDays)
      setFormLocation(matched.storageLocation as any)
    } else {
      setFormName(name)
    }
  }

  // Handle Add Ingredient Submission
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) return

    setIsSubmitting(true)
    try {
      await addFridgeIngredientFn({
        data: {
          name: formName,
          category: formCategory,
          quantity: Number(formQuantity),
          unit: formUnit,
          storageLocation: formLocation,
          expiryDays: Number(formShelfDays),
          notes: formNotes,
        },
      })
      setFormName('')
      setFormQuantity(1)
      setFormNotes('')
      setIsAddModalOpen(false)
      await router.invalidate()
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Bulk Add Submission
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

  // Handle Edit Submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return

    setIsSubmitting(true)
    try {
      await updateFridgeIngredientFn({
        data: {
          id: editingItem.id,
          customName: editingItem.customName,
          category: editingItem.category,
          quantity: Number(editingItem.quantity),
          unit: editingItem.unit,
          storageLocation: editingItem.storageLocation,
          expiryDate: editingItem.expiryDate,
          notes: editingItem.notes,
        },
      })
      setEditingItem(null)
      await router.invalidate()
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Delete
  const handleDelete = async (id: number) => {
    if (!confirm('Hapus bahan ini dari kulkas?')) return
    try {
      await deleteFridgeIngredientFn({ data: id })
      await router.invalidate()
    } catch (err) {
      console.error(err)
    }
  }

  // Filtered Items
  const filteredItems = items.filter((item) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const matchName = (item.customName || '').toLowerCase().includes(q)
      const matchCat = item.category.toLowerCase().includes(q)
      if (!matchName && !matchCat) return false
    }

    if (selectedCategory !== 'Semua' && item.category !== selectedCategory) {
      return false
    }

    if (selectedLocation !== 'Semua' && item.storageLocation !== selectedLocation) {
      return false
    }

    if (selectedStatus !== 'Semua' && item.status !== selectedStatus) {
      return false
    }

    return true
  })

  // Format status badge
  const renderStatusBadge = (status: string, days: number) => {
    if (status === 'Expired') {
      return (
        <span className="rounded-full border border-[#FF5C65]/30 bg-[#FF5C65]/15 text-[#FF5C65] px-2.5 py-0.5 text-[10px] font-bold">
          Lewat Kedaluwarsa
        </span>
      )
    }
    if (status === 'Expiring') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-[#FF5C65]/30 bg-[#FF5C65]/15 text-[#FF5C65] px-2.5 py-0.5 text-[10px] font-bold">
          <Clock className="h-3 w-3" />
          Expiring ({days} hr)
        </span>
      )
    }
    if (status === 'Use Soon') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-[#FFB020]/30 bg-[#FFB020]/15 text-[#FFB020] px-2.5 py-0.5 text-[10px] font-bold">
          <Clock className="h-3 w-3" />
          Use Soon ({days} hr)
        </span>
      )
    }
    return (
      <span className="rounded-full border border-[#00C995]/30 bg-[#00C995]/15 text-[#00C995] px-2.5 py-0.5 text-[10px] font-bold">
        Fresh ({days} hr)
      </span>
    )
  }

  const expiringCount = items.filter((i) => i.status === 'Expiring').length
  const useSoonCount = items.filter((i) => i.status === 'Use Soon').length

  return (
    <div className="min-h-screen bg-[#0B0A09] text-[#F6F2EB] px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#302C28] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00C995]/30 bg-[#00C995]/10 px-3 py-1 text-xs font-semibold text-[#00C995] mb-2 shadow-[0_0_15px_rgba(0,201,149,0.15)]">
            <Refrigerator className="h-3.5 w-3.5" />
            <span>Inventaris Kulkas Cerdas</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-[#F6F2EB]">
            Kulkas & Bahan Saya
          </h1>
          <p className="text-xs sm:text-sm text-[#A7A098] mt-1">
            Total {items.length} bahan terdaftar • {expiringCount} mendesak kedaluwarsa • {useSoonCount} perlu segera dimasak.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#302C28] bg-[#1B1917] hover:bg-[#23211E] px-4 py-2.5 text-xs font-semibold text-[#F6F2EB] shadow-sm hover:border-[#FFB020]/40 transition"
          >
            <Zap className="h-3.5 w-3.5 text-[#FFB020]" />
            <span>Bulk Add Bahan</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#00C995] to-[#00A99A] hover:brightness-110 px-4 py-2.5 text-xs font-bold text-[#0B0A09] shadow-[0_4px_20px_rgba(0,201,149,0.3)] hover:scale-[1.02] transition"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Tambah Bahan</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-[#302C28] bg-[#1B1917] p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          {/* Search Input */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A7A098]" />
            <input
              type="text"
              placeholder="Cari bahan (contoh: telur, bayam, cabai, tahu)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-[#302C28] bg-[#12110F] pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#F6F2EB] placeholder:text-[#A7A098]/60 focus:border-[#00C995] focus:outline-none"
            />
          </div>

          {/* Location Filter Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-semibold text-[#A7A098] whitespace-nowrap">Lokasi:</span>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="rounded-xl border border-[#302C28] bg-[#12110F] px-3 py-2 text-xs font-semibold text-[#F6F2EB] focus:border-[#00C995] focus:outline-none"
            >
              {STORAGE_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc === 'Semua' ? 'Semua Lokasi' : loc.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-semibold text-[#A7A098] whitespace-nowrap">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-xl border border-[#302C28] bg-[#12110F] px-3 py-2 text-xs font-semibold text-[#F6F2EB] focus:border-[#00C995] focus:outline-none"
            >
              {STATUS_FILTERS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl border border-[#302C28] bg-[#12110F] p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'grid'
                  ? 'bg-[#1B1917] text-[#00C995] shadow-xs'
                  : 'text-[#A7A098] hover:text-[#F6F2EB]'
              }`}
              title="Tampilan Grid"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'list'
                  ? 'bg-[#1B1917] text-[#00C995] shadow-xs'
                  : 'text-[#A7A098] hover:text-[#F6F2EB]'
              }`}
              title="Tampilan Tabel / List"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold capitalize whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-[#00C995]/15 text-[#00C995] border border-[#00C995]/30'
                  : 'border border-[#302C28] bg-[#12110F] text-[#A7A098] hover:text-[#F6F2EB] hover:bg-[#23211E]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Ingredient Inventory Content */}
      {items.length === 0 ? (
        /* Empty State when Refrigerator has 0 items */
        <div className="rounded-2xl border border-dashed border-[#302C28] bg-[#1B1917] p-12 text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#302C28] bg-[#12110F] text-[#00C995]">
            <Refrigerator className="h-8 w-8" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="font-editorial text-xl font-bold text-[#F6F2EB]">
              Kulkas Anda Masih Kosong
            </h3>
            <p className="text-xs text-[#A7A098] leading-relaxed">
              Mulai masukkan bahan makanan yang saat ini ada di kulkas, freezer, atau rak bumbu Anda
              agar sistem dapat merekomendasikan resep yang tepat.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={async () => {
                await seedStarterPantryFn()
                await router.invalidate()
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#00C995] hover:bg-[#00b585] px-5 py-3 text-xs font-bold text-[#0B0A09] transition shadow-sm"
            >
              <Zap className="h-4 w-4" />
              <span>Isi Paket Bahan Dasar Koki (1-Klik)</span>
            </button>

            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#302C28] bg-[#12110F] hover:bg-[#23211E] px-5 py-3 text-xs font-semibold text-[#F6F2EB] transition"
            >
              <Plus className="h-4 w-4" />
              <span>Ketik Sendiri (Bulk Add)</span>
            </button>
          </div>

          <div className="max-w-lg mx-auto rounded-xl border border-[#302C28] bg-[#12110F] p-4 text-xs text-[#A7A098] text-left space-y-1">
            <span className="font-bold text-[#00C995] flex items-center gap-1.5">
              💡 Tips Cerdas Dapur:
            </span>
            <p>
              Hanya dengan memiliki <strong>Telur</strong>, <strong>Nasi</strong>, dan <strong>Bawang</strong> di kulkas, Anda sudah membuka lebih dari 8 rekomendasi resep lezat seperti Nasi Goreng dan Telur Dadar Padang!
            </p>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        /* Empty State when Filter has 0 matches */
        <div className="rounded-2xl border border-dashed border-[#302C28] bg-[#1B1917] p-12 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#302C28] bg-[#12110F] text-[#FFB020]">
            <Refrigerator className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-editorial text-lg font-bold text-[#F6F2EB]">
              Tidak Ada Bahan yang Cocok
            </h3>
            <p className="text-xs text-[#A7A098] max-w-sm mx-auto">
              Coba sesuaikan kata kunci pencarian atau ubah filter kategori/lokasi di atas.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('Semua')
              setSelectedLocation('Semua')
              setSelectedStatus('Semua')
            }}
            className="rounded-xl border border-[#302C28] bg-[#12110F] hover:bg-[#23211E] px-4 py-2 text-xs font-semibold text-[#F6F2EB] transition"
          >
            Reset Filter Pencarian
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group rounded-2xl border border-[#302C28] bg-[#1B1917] p-5 shadow-xs hover:border-[#00C995]/30 hover:bg-[#23211E] transition flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="rounded-md border border-[#302C28] bg-[#12110F] px-2 py-0.5 text-[10px] font-bold uppercase text-[#A7A098]">
                    {item.category}
                  </span>
                  {renderStatusBadge(item.status, item.daysRemaining)}
                </div>

                <div>
                  <h3 className="font-editorial text-base font-bold text-[#F6F2EB] group-hover:text-[#00C995] transition-colors line-clamp-1">
                    {item.customName}
                  </h3>
                  <p className="text-xs font-semibold text-[#A7A098]">
                    {item.quantity} {item.unit}
                  </p>
                </div>

                <div className="text-[11px] text-[#A7A098] space-y-1 pt-1 border-t border-[#302C28]">
                  <div className="flex items-center justify-between">
                    <span>Lokasi:</span>
                    <span className="font-semibold text-[#F6F2EB] uppercase">
                      {item.storageLocation}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Kedaluwarsa:</span>
                    <span className="font-semibold text-[#F6F2EB]">
                      {new Date(item.expiryDate).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                  {item.notes && (
                    <p className="text-[10px] text-[#A7A098] italic line-clamp-1 pt-0.5">
                      "{item.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-[#302C28]">
                <button
                  onClick={() => setEditingItem(item)}
                  className="rounded-lg p-1.5 text-[#A7A098] hover:text-[#00C995] hover:bg-[#12110F] transition"
                  title="Edit Bahan"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="rounded-lg p-1.5 text-[#A7A098] hover:text-[#FF5C65] hover:bg-[#12110F] transition"
                  title="Hapus Bahan"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* LIST / TABLE VIEW */
        <div className="rounded-2xl border border-[#302C28] bg-[#1B1917] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#302C28] bg-[#12110F] text-[#A7A098] uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nama Bahan</th>
                  <th className="px-4 py-3 font-semibold">Kategori</th>
                  <th className="px-4 py-3 font-semibold">Jumlah</th>
                  <th className="px-4 py-3 font-semibold">Lokasi</th>
                  <th className="px-4 py-3 font-semibold">Status Kesegaran</th>
                  <th className="px-4 py-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#302C28]">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#23211E] transition">
                    <td className="px-4 py-3 font-bold text-[#F6F2EB]">
                      {item.customName}
                    </td>
                    <td className="px-4 py-3 text-[#A7A098] capitalize">
                      {item.category}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#F6F2EB]">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="px-4 py-3 text-[#A7A098] uppercase">
                      {item.storageLocation}
                    </td>
                    <td className="px-4 py-3">
                      {renderStatusBadge(item.status, item.daysRemaining)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="rounded-lg p-1.5 text-[#A7A098] hover:text-[#00C995] transition"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="rounded-lg p-1.5 text-[#A7A098] hover:text-[#FF5C65] transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal 1: Single Add Ingredient */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-[#302C28] bg-[#1B1917] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#302C28] pb-3">
              <h3 className="font-editorial text-lg font-bold text-[#F6F2EB] flex items-center gap-2">
                <Plus className="h-4 w-4 text-[#00C995]" />
                Tambah Bahan ke Kulkas
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#A7A098] hover:text-[#F6F2EB] font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Quick autocomplete pills from master ingredients */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-[#A7A098]">
                Pilih Cepat Bahan Populer:
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {masterIngredients.slice(0, 16).map((m: any) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleSelectMaster(m.name)}
                    className="rounded-lg border border-[#302C28] bg-[#12110F] px-2 py-1 text-[11px] text-[#A7A098] hover:border-[#00C995] hover:text-[#00C995] transition"
                  >
                    + {m.name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#A7A098] mb-1">
                  Nama Bahan:
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Telur Ayam, Bayam Segar, Tahu Putih"
                  className="w-full rounded-xl border border-[#302C28] bg-[#12110F] p-2.5 text-xs text-[#F6F2EB] focus:border-[#00C995] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#A7A098] mb-1">
                    Kategori:
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-[#302C28] bg-[#12110F] p-2.5 text-xs text-[#F6F2EB] focus:border-[#00C995] focus:outline-none capitalize"
                  >
                    {CATEGORIES.filter((c) => c !== 'Semua').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#A7A098] mb-1">
                    Lokasi Simpan:
                  </label>
                  <select
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value as any)}
                    className="w-full rounded-xl border border-[#302C28] bg-[#12110F] p-2.5 text-xs text-[#F6F2EB] focus:border-[#00C995] focus:outline-none uppercase"
                  >
                    <option value="fridge">FRIDGE (Kulkas Utama)</option>
                    <option value="freezer">FREEZER (Beku)</option>
                    <option value="pantry">PANTRY (Rak / Kering)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#A7A098] mb-1">
                    Jumlah:
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#302C28] bg-[#12110F] p-2.5 text-xs text-[#F6F2EB] focus:border-[#00C995] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#A7A098] mb-1">
                    Satuan:
                  </label>
                  <input
                    type="text"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder="gram, butir, ikat"
                    className="w-full rounded-xl border border-[#302C28] bg-[#12110F] p-2.5 text-xs text-[#F6F2EB] focus:border-[#00C995] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#A7A098] mb-1">
                    Masa Simpan (Hari):
                  </label>
                  <input
                    type="number"
                    value={formShelfDays}
                    onChange={(e) => setFormShelfDays(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#302C28] bg-[#12110F] p-2.5 text-xs text-[#F6F2EB] focus:border-[#00C995] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#A7A098] mb-1">
                  Catatan Tambahan (Opsional):
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Contoh: Sisa belanja kemarin, simpan di wadah rapat"
                  className="w-full rounded-xl border border-[#302C28] bg-[#12110F] p-2.5 text-xs text-[#F6F2EB] focus:border-[#00C995] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#302C28]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-[#A7A098] hover:bg-[#12110F] hover:text-[#F6F2EB] transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-[#00C995] hover:bg-[#00b585] px-5 py-2 text-xs font-bold text-[#0B0A09] shadow-sm disabled:opacity-50 transition"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Bahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Bulk Add Ingredients */}
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
                className="text-[#A7A098] hover:text-[#F6F2EB] font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#A7A098] leading-relaxed">
              Ketik beberapa nama bahan sekaligus dipisahkan dengan tanda koma atau baris baru.
              Contoh: <span className="font-semibold text-[#00C995]">telur, bawang merah, cabai rawit, kubis, wortel</span>
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
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-[#A7A098] hover:bg-[#12110F] hover:text-[#F6F2EB] transition"
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

      {/* Modal 3: Edit Ingredient */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-[#302C28] bg-[#1B1917] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#302C28] pb-3">
              <h3 className="font-editorial text-lg font-bold text-[#F6F2EB] flex items-center gap-2">
                <Edit2 className="h-4 w-4 text-[#00C995]" />
                Edit Bahan Kulkas
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-[#A7A098] hover:text-[#F6F2EB] font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#A7A098] mb-1">
                  Nama Bahan:
                </label>
                <input
                  type="text"
                  value={editingItem.customName}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, customName: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#302C28] bg-[#12110F] p-2.5 text-xs text-[#F6F2EB] focus:border-[#00C995] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#A7A098] mb-1">
                    Jumlah:
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editingItem.quantity}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, quantity: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-[#302C28] bg-[#12110F] p-2.5 text-xs text-[#F6F2EB] focus:border-[#00C995] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#A7A098] mb-1">
                    Satuan:
                  </label>
                  <input
                    type="text"
                    value={editingItem.unit}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, unit: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#302C28] bg-[#12110F] p-2.5 text-xs text-[#F6F2EB] focus:border-[#00C995] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#A7A098] mb-1">
                    Kategori:
                  </label>
                  <select
                    value={editingItem.category}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, category: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#302C28] bg-[#12110F] p-2.5 text-xs text-[#F6F2EB] focus:border-[#00C995] focus:outline-none capitalize"
                  >
                    {CATEGORIES.filter((c) => c !== 'Semua').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#A7A098] mb-1">
                    Lokasi:
                  </label>
                  <select
                    value={editingItem.storageLocation}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, storageLocation: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#302C28] bg-[#12110F] p-2.5 text-xs text-[#F6F2EB] focus:border-[#00C995] focus:outline-none uppercase"
                  >
                    <option value="fridge">FRIDGE</option>
                    <option value="freezer">FREEZER</option>
                    <option value="pantry">PANTRY</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#A7A098] mb-1">
                  Tanggal Kedaluwarsa:
                </label>
                  <input
                    type="date"
                    value={
                      editingItem.expiryDate
                        ? new Date(editingItem.expiryDate).toISOString().split('T')[0]
                        : ''
                    }
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, expiryDate: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#302C28] bg-[#12110F] p-2.5 text-xs text-[#F6F2EB] focus:border-[#00C995] focus:outline-none"
                    required
                  />
                </div>

              <div>
                <label className="block font-semibold text-[#A7A098] mb-1">
                  Catatan:
                </label>
                <input
                  type="text"
                  value={editingItem.notes || ''}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, notes: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#302C28] bg-[#12110F] p-2.5 text-xs text-[#F6F2EB] focus:border-[#00C995] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#302C28]">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-[#A7A098] hover:bg-[#12110F] hover:text-[#F6F2EB] transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-[#00C995] hover:bg-[#00b585] px-5 py-2 text-xs font-bold text-[#0B0A09] shadow-sm disabled:opacity-50 transition"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Perbarui Bahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
