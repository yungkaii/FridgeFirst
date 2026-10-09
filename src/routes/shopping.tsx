import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import confetti from 'canvas-confetti'
import {
  ArrowRight,
  CheckCircle2,
  PackageCheck,
  Plus,
  Refrigerator,
  ShoppingBag,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import {
  addManualShoppingItemFn,
  deleteShoppingItemFn,
  getShoppingListFn,
  toggleShoppingItemBoughtFn,
  transferBoughtItemsToFridgeFn,
} from '../server/api'

export const Route = createFileRoute('/shopping')({
  loader: async () => {
    return await getShoppingListFn()
  },
  component: ShoppingListPage,
})

function ShoppingListPage() {
  const { items } = Route.useLoaderData()
  const router = useRouter()

  // Manual Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [formName, setFormName] = useState('')
  const [formQuantity, setFormQuantity] = useState(1)
  const [formUnit, setFormUnit] = useState('buah')
  const [formCategory, setFormCategory] = useState<'sayur' | 'buah' | 'protein' | 'karbohidrat' | 'dairy' | 'bumbu' | 'frozen' | 'lainnya'>('sayur')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [transferMessage, setTransferMessage] = useState<string | null>(null)

  // Toggle item bought status
  const handleToggleBought = async (id: number, currentBought: boolean) => {
    try {
      await toggleShoppingItemBoughtFn({
        data: { id, isBought: !currentBought },
      })
      await router.invalidate()
    } catch (err) {
      console.error(err)
    }
  }

  // Delete item
  const handleDeleteItem = async (id: number) => {
    try {
      await deleteShoppingItemFn({ data: id })
      await router.invalidate()
    } catch (err) {
      console.error(err)
    }
  }

  // Transfer all bought items to fridge
  const handleTransferToFridge = async () => {
    setIsSubmitting(true)
    try {
      const res = await transferBoughtItemsToFridgeFn()
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      })
      setTransferMessage(
        `Sukses! ${res.count} bahan yang sudah dibeli berhasil dimasukkan ke kulkas dengan tanggal kedaluwarsa otomatis!`
      )
      setTimeout(() => setTransferMessage(null), 5000)
      await router.invalidate()
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Submit manual item
  const handleManualAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) return

    setIsSubmitting(true)
    try {
      await addManualShoppingItemFn({
        data: {
          name: formName,
          quantity: Number(formQuantity),
          unit: formUnit,
          category: formCategory,
        },
      })
      setFormName('')
      setFormQuantity(1)
      setIsAddModalOpen(false)
      await router.invalidate()
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const boughtItems = items.filter((i: any) => i.isBought)
  const unboughtItems = items.filter((i: any) => !i.isBought)
  const totalCount = items.length
  const progressPercent = totalCount > 0 ? Math.round((boughtItems.length / totalCount) * 100) : 0

  return (
    <div className="min-h-screen bg-[#0B0A09] text-[#F6F2EB] px-4 py-8 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#302C28] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00C995]/30 bg-[#00C995]/10 px-3 py-1 text-xs font-semibold text-[#00C995] mb-2 shadow-[0_0_15px_rgba(0,201,149,0.15)]">
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Smart Grocery Cart</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-[#F6F2EB]">
            Daftar Belanja
          </h1>
          <p className="text-xs sm:text-sm text-[#A7A098] mt-1">
            Daftar bahan yang masih kurang dari resep yang ingin Anda buat, siap dicek saat berbelanja.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 self-start sm:self-auto rounded-xl bg-gradient-to-r from-[#00C995] to-[#00A99A] hover:brightness-110 px-4 py-2.5 text-xs font-bold text-[#0B0A09] shadow-[0_4px_20px_rgba(0,201,149,0.3)] hover:scale-[1.02] transition"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>Tambah Item Manual</span>
        </button>
      </div>

      {/* Progress & Item Summary Bar */}
      {totalCount > 0 && (
        <div className="rounded-2xl border border-[#302C28] bg-[#1B1917] p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#F6F2EB]">
              Kemajuan Belanja ({boughtItems.length} dari {totalCount} dibeli)
            </span>
            <span className="font-bold text-[#00C995]">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-[#12110F] border border-[#302C28] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#00C995] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Transfer Success Notification */}
      {transferMessage && (
        <div className="rounded-xl border border-[#00C995]/40 bg-[#00C995]/15 p-4 text-[#F6F2EB] flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
            <CheckCircle2 className="h-4.5 w-4.5 text-[#00C995]" />
            <span>{transferMessage}</span>
          </div>
          <Link to="/fridge" className="text-xs font-bold text-[#00C995] underline hover:text-[#F6F2EB]">
            Lihat Kulkas Saya &rarr;
          </Link>
        </div>
      )}

      {/* Transfer Bought Items to Fridge Action Banner */}
      {boughtItems.length > 0 && (
        <div className="rounded-2xl border border-[#302C28] bg-[#1B1917] p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-serif text-base font-bold text-[#F6F2EB] flex items-center gap-2 justify-center sm:justify-start">
              <PackageCheck className="h-4.5 w-4.5 text-[#00C995]" />
              Ada {boughtItems.length} Bahan yang Sudah Dibeli!
            </h3>
            <p className="text-xs text-[#A7A098]">
              Pindahkan bahan yang sudah dicentang langsung ke kulkas dengan masa simpan otomatis.
            </p>
          </div>

          <button
            onClick={handleTransferToFridge}
            disabled={isSubmitting}
            className="rounded-xl bg-[#00C995] hover:bg-[#00b585] px-5 py-2.5 text-xs font-bold text-[#0B0A09] shadow-sm transition disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap"
          >
            <Refrigerator className="h-4 w-4 stroke-[2.5]" />
            <span>Pindahkan ke Kulkas Sekarang</span>
          </button>
        </div>
      )}

      {/* Shopping List Items Container */}
      <div className="rounded-2xl border border-[#302C28] bg-[#1B1917] p-6 shadow-xs space-y-6">
        {items.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#302C28] bg-[#12110F] text-[#A7A098]">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <h3 className="font-editorial text-base font-bold text-[#F6F2EB]">
              Daftar Belanja Masih Kosong
            </h3>
            <p className="text-xs text-[#A7A098] max-w-sm mx-auto">
              Saat kamu melihat detail resep yang bahannya belum lengkap, klik tombol "Tambah Bahan Kurang"
              untuk memasukkannya ke sini.
            </p>
            <Link
              to="/recipes"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#00C995] hover:underline pt-2"
            >
              Jelajahi Resep <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Unbought Items Section */}
            {unboughtItems.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#A7A098] border-b border-[#302C28] pb-2">
                  <span>Perlu Dibeli ({unboughtItems.length})</span>
                  <span>Centang saat belanja</span>
                </div>

                <div className="divide-y divide-[#302C28]/60">
                  {unboughtItems.map((item: any) => (
                    <div
                      key={item.id}
                      className="py-3 flex items-center justify-between gap-3 group"
                    >
                      <label className="flex items-center gap-3 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={item.isBought}
                          onChange={() => handleToggleBought(item.id, item.isBought)}
                          className="h-4.5 w-4.5 rounded-md border-[#302C28] bg-[#12110F] accent-[#00C995] cursor-pointer"
                        />
                        <div>
                          <p className="text-sm font-semibold text-[#F6F2EB] group-hover:text-[#00C995] transition-colors">
                            {item.name}
                          </p>
                          <p className="text-xs text-[#A7A098]">
                            {item.quantity} {item.unit} • <span className="capitalize">{item.category}</span>
                          </p>
                        </div>
                      </label>

                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="rounded-lg p-1.5 text-[#A7A098] hover:text-[#FF5C65] transition"
                        title="Hapus Item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bought Items Section */}
            {boughtItems.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-[#302C28]">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#00C995] border-b border-[#302C28] pb-2">
                  <span>Sudah Dibeli ({boughtItems.length})</span>
                  <span>Siap Ditransfer</span>
                </div>

                <div className="divide-y divide-[#302C28]/40">
                  {boughtItems.map((item: any) => (
                    <div
                      key={item.id}
                      className="py-3 flex items-center justify-between gap-3 opacity-60 hover:opacity-100 transition"
                    >
                      <label className="flex items-center gap-3 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={item.isBought}
                          onChange={() => handleToggleBought(item.id, item.isBought)}
                          className="h-4.5 w-4.5 rounded-md border-[#302C28] bg-[#12110F] accent-[#00C995] cursor-pointer"
                        />
                        <div>
                          <p className="text-sm font-semibold text-[#A7A098] line-through">
                            {item.name}
                          </p>
                          <p className="text-xs text-[#A7A098]">
                            {item.quantity} {item.unit}
                          </p>
                        </div>
                      </label>

                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="rounded-lg p-1.5 text-[#A7A098] hover:text-[#FF5C65] transition"
                        title="Hapus Item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Manual Add Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-[#302C28] bg-[#1B1917] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#302C28] pb-3">
              <h3 className="font-editorial text-base font-bold text-[#F6F2EB] flex items-center gap-2">
                <Plus className="h-4 w-4 text-[#00C995]" />
                Tambah Bahan ke Daftar Belanja
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#A7A098] hover:text-[#F6F2EB] font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#A7A098] mb-1">
                  Nama Bahan:
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Santan Kelapa, Merica Bubuk"
                  className="w-full rounded-xl border border-[#302C28] bg-[#12110F] p-2.5 text-xs text-[#F6F2EB] placeholder:text-[#A7A098]/50 focus:border-[#00C995] focus:outline-none"
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
                    placeholder="buah, sachet, kg"
                    className="w-full rounded-xl border border-[#302C28] bg-[#12110F] p-2.5 text-xs text-[#F6F2EB] focus:border-[#00C995] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#A7A098] mb-1">
                  Kategori:
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  className="w-full rounded-xl border border-[#302C28] bg-[#12110F] p-2.5 text-xs text-[#F6F2EB] focus:border-[#00C995] focus:outline-none capitalize"
                >
                  <option value="sayur">Sayur</option>
                  <option value="protein">Protein</option>
                  <option value="karbohidrat">Karbohidrat</option>
                  <option value="bumbu">Bumbu</option>
                  <option value="dairy">Dairy</option>
                  <option value="buah">Buah</option>
                  <option value="frozen">Frozen</option>
                  <option value="lainnya">Lainnya</option>
                </select>
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
                  {isSubmitting ? 'Menyimpan...' : 'Tambah ke Daftar Belanja'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
