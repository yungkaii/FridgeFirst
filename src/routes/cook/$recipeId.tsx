import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import confetti from 'canvas-confetti'
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  ListChecks,
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { getRecipeDetailFn, recordCookingHistoryFn } from '../../server/api'

export const Route = createFileRoute('/cook/$recipeId')({
  loader: async ({ params }) => {
    return await getRecipeDetailFn({ data: Number(params.recipeId) })
  },
  component: CookNowPage,
})

function playBeepSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(587.33, ctx.currentTime) // D5 note
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15) // A5 note
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.5)
  } catch (e) {
    console.warn('AudioContext beep unavailable:', e)
  }
}

function CookNowPage() {
  const { recipe } = Route.useLoaderData()
  const navigate = useNavigate()

  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({})
  const [isIngredientsDrawerOpen, setIsIngredientsDrawerOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {})
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {})
    }
  }

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
  }, [])

  // Keyboard navigation (ArrowLeft / ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentStepIndex < recipe.instructions.length - 1) {
        setCurrentStepIndex((prev) => prev + 1)
      } else if (e.key === 'ArrowLeft' && currentStepIndex > 0) {
        setCurrentStepIndex((prev) => prev - 1)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentStepIndex, recipe.instructions.length])

  // Kitchen Timer State
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number | null>(null)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const timerIntervalRef = useRef<any>(null)

  // Finish & Rating Dialog State
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false)
  const [selectedRating, setSelectedRating] = useState<'masak_lagi' | 'oke' | 'tidak_akan_ulang'>('masak_lagi')
  const [chefNotes, setChefNotes] = useState('')
  const [isSubmittingRating, setIsSubmittingRating] = useState(false)

  const currentStep = recipe.instructions[currentStepIndex] || {
    step: 1,
    title: 'Persiapan',
    description: '',
  }

  // Handle timer countdown
  useEffect(() => {
    if (isTimerRunning && timerSecondsLeft !== null && timerSecondsLeft > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSecondsLeft((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timerIntervalRef.current)
            setIsTimerRunning(false)
            playBeepSound()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(timerIntervalRef.current)
    }

    return () => clearInterval(timerIntervalRef.current)
  }, [isTimerRunning, timerSecondsLeft])

  const startPresetTimer = (minutes: number) => {
    setTimerSecondsLeft(minutes * 60)
    setIsTimerRunning(true)
  }

  const toggleTimer = () => {
    if (timerSecondsLeft === null || timerSecondsLeft === 0) {
      setTimerSecondsLeft(3 * 60) // default 3 min
      setIsTimerRunning(true)
    } else {
      setIsTimerRunning(!isTimerRunning)
    }
  }

  const resetTimer = () => {
    setIsTimerRunning(false)
    setTimerSecondsLeft(null)
  }

  const toggleCheckIngredient = (id: number) => {
    setCheckedIngredients((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleFinishCooking = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    })
    setIsRatingDialogOpen(true)
  }

  const handleSubmitRating = async () => {
    setIsSubmittingRating(true)
    try {
      await recordCookingHistoryFn({
        data: {
          recipeId: recipe.id,
          rating: selectedRating,
          notes: chefNotes,
        },
      })
      navigate({ to: '/history' as any })
    } catch (err) {
      console.error(err)
      navigate({ to: '/dashboard' })
    } finally {
      setIsSubmittingRating(false)
    }
  }

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const totalSteps = recipe.instructions.length
  const progressPercent = Math.round(((currentStepIndex + 1) / totalSteps) * 100)

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#0B0A09] text-[#F6F2EB] select-none overflow-hidden font-sans">
      {/* 1. TOP HEADER & RECIPE TITLE */}
      <header className="flex items-center justify-between border-b border-[#302C28] bg-[#12110F] px-4 py-3 sm:px-8">
        <div className="flex items-center gap-3">
          <Link
            to="/recipes/$recipeId"
            params={{ recipeId: String(recipe.id) }}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#302C28] bg-[#1B1917] text-[#A7A098] hover:text-[#F6F2EB] transition"
            title="Keluar dari Cook Mode"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded border border-[#00C995]/30 bg-[#00C995]/15 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase text-[#00C995]">
                Cook Now Mode
              </span>
              <span className="text-xs text-[#A7A098]">
                {recipe.category} • {recipe.totalTimeMinutes} menit
              </span>
            </div>
            <h1 className="font-serif text-sm sm:text-base font-bold tracking-tight text-[#F6F2EB] line-clamp-1">
              {recipe.title}
            </h1>
          </div>
        </div>

        {/* Action Controls: Ingredients Drawer & Native Fullscreen Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsIngredientsDrawerOpen(!isIngredientsDrawerOpen)}
            className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
              isIngredientsDrawerOpen
                ? 'border-[#00C995] bg-[#00C995] text-[#0B0A09]'
                : 'border-[#302C28] bg-[#1B1917] text-[#A7A098] hover:text-[#F6F2EB]'
            }`}
          >
            <ListChecks className="h-4 w-4" />
            <span className="hidden sm:inline">Checklist Bahan</span>
            <span className="rounded-full bg-black/20 px-1.5 py-0.2 text-[10px]">
              {Object.values(checkedIngredients).filter(Boolean).length}/{recipe.ingredientsList.length}
            </span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#302C28] bg-[#1B1917] text-[#A7A098] hover:text-[#F6F2EB] transition"
            title={isFullscreen ? 'Keluar Fullscreen' : 'Layar Penuh (Fullscreen)'}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* 2. PROGRESS BAR */}
      <div className="h-1.5 w-full bg-[#12110F]">
        <div
          className="h-full bg-[#00C995] transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 3. MAIN CENTER STAGE */}
      <div className="relative flex flex-1 flex-col lg:flex-row overflow-hidden">
        {/* Main Cooking Step View */}
        <main className="flex flex-1 flex-col items-center justify-between p-4 sm:p-8 md:p-12 overflow-y-auto">
          {/* Top Step Counter */}
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-[#00C995]/30 bg-[#00C995]/10 px-4 py-1 text-xs font-bold text-[#00C995]">
              Langkah {currentStepIndex + 1} dari {totalSteps}
            </span>
            <span className="text-xs text-[#A7A098] font-medium">
              {progressPercent}% Selesai
            </span>
          </div>

          {/* Big Readable Step Instruction */}
          <div className="my-auto max-w-3xl w-full text-center space-y-6 py-6">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00C995] text-[#0B0A09] font-editorial text-3xl font-extrabold shadow-lg shadow-[#00C995]/20">
              {currentStep.step}
            </div>

            <h2 className="font-editorial text-2xl sm:text-4xl md:text-5xl font-bold text-[#F6F2EB] tracking-tight leading-tight">
              {currentStep.title}
            </h2>

            <p className="text-base sm:text-xl md:text-2xl text-[#A7A098] font-normal leading-relaxed max-w-2xl mx-auto">
              {currentStep.description}
            </p>
          </div>

          {/* Built-in Kitchen Timer Widget */}
          <div className="w-full max-w-xl rounded-2xl border border-[#302C28] bg-[#1B1917] p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#FFB020]/30 bg-[#FFB020]/15 text-[#FFB020]">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFB020]">
                  Kitchen Timer
                </span>
                <p className="font-mono text-2xl font-bold text-[#F6F2EB]">
                  {timerSecondsLeft !== null ? formatTimer(timerSecondsLeft) : '00:00'}
                </p>
              </div>
            </div>

            {/* Quick Timer Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[1, 3, 5, 10].map((mins) => (
                <button
                  key={mins}
                  onClick={() => startPresetTimer(mins)}
                  className="rounded-lg border border-[#302C28] bg-[#12110F] px-2.5 py-1 text-xs font-semibold text-[#A7A098] hover:border-[#00C995] hover:text-[#00C995] transition"
                >
                  +{mins}m
                </button>
              ))}
            </div>

            {/* Timer Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTimer}
                className={`rounded-xl p-2.5 font-bold transition flex items-center gap-1.5 ${
                  isTimerRunning
                    ? 'bg-[#FFB020] text-[#0B0A09] hover:bg-[#e69e1c]'
                    : 'bg-[#00C995] text-[#0B0A09] hover:bg-[#00b585]'
                }`}
                title={isTimerRunning ? 'Pause' : 'Start'}
              >
                {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
              </button>

              <button
                onClick={resetTimer}
                className="rounded-xl border border-[#302C28] bg-[#12110F] p-2.5 text-[#A7A098] hover:text-[#F6F2EB] transition"
                title="Reset Timer"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </main>

        {/* Side / Drawer Ingredient Checklist */}
        {isIngredientsDrawerOpen && (
          <aside className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-[#302C28] bg-[#12110F] p-6 overflow-y-auto flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#302C28] pb-3">
                <h3 className="font-serif text-base font-bold text-[#F6F2EB] flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-[#00C995]" />
                  Checklist Bahan Masakan
                </h3>
                <button
                  onClick={() => setIsIngredientsDrawerOpen(false)}
                  className="rounded-lg p-1 text-[#A7A098] hover:text-[#F6F2EB]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {recipe.ingredientsList.map((item: any) => {
                  const isChecked = !!checkedIngredients[item.recipeIngredientId]
                  return (
                    <div
                      key={item.recipeIngredientId}
                      onClick={() => toggleCheckIngredient(item.recipeIngredientId)}
                      className={`cursor-pointer rounded-xl border p-3 flex items-center justify-between transition ${
                        isChecked
                          ? 'border-[#00C995]/40 bg-[#00C995]/10 opacity-70'
                          : 'border-[#302C28] bg-[#1B1917] hover:border-[#302C28]/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-md border transition ${
                            isChecked
                              ? 'border-[#00C995] bg-[#00C995] text-[#0B0A09]'
                              : 'border-[#302C28] bg-[#12110F]'
                          }`}
                        >
                          {isChecked && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
                        </div>
                        <div>
                          <p
                            className={`text-xs font-semibold ${
                              isChecked ? 'line-through text-[#A7A098]' : 'text-[#F6F2EB]'
                            }`}
                          >
                            {item.name}
                          </p>
                          <p className="text-[11px] text-[#A7A098]">
                            {item.requiredQuantity} {item.unit}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          item.hasIngredient
                            ? 'border-[#00C995]/30 bg-[#00C995]/10 text-[#00C995]'
                            : 'border-[#302C28] bg-[#12110F] text-[#A7A098]'
                        }`}
                      >
                        {item.hasIngredient ? 'Siap' : 'Kurang'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <p className="text-[11px] text-[#A7A098] pt-4 text-center">
              Centang bahan saat dimasukkan ke penggorengan / panci.
            </p>
          </aside>
        )}
      </div>

      {/* 4. GIANT ONE-HANDED BOTTOM NAVIGATION BUTTONS */}
      <footer className="border-t border-[#302C28] bg-[#12110F] p-4 sm:p-5 flex items-center justify-between gap-4">
        <button
          onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentStepIndex === 0}
          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl border border-[#302C28] bg-[#1B1917] px-6 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-semibold text-[#F6F2EB] hover:bg-[#23211E] disabled:opacity-30 transition"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>Sebelumnya</span>
        </button>

        {currentStepIndex < totalSteps - 1 ? (
          <button
            onClick={() => setCurrentStepIndex((prev) => prev + 1)}
            className="flex-2 sm:flex-initial inline-flex items-center justify-center gap-3 rounded-xl bg-[#00C995] hover:bg-[#00b585] px-8 sm:px-12 py-3.5 sm:py-4 text-sm sm:text-base font-bold text-[#0B0A09] shadow-md transition"
          >
            <span>Langkah Berikutnya</span>
            <ChevronRight className="h-5 w-5 stroke-[2.5]" />
          </button>
        ) : (
          <button
            onClick={handleFinishCooking}
            className="flex-2 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFB020] hover:bg-[#e69e1c] px-8 sm:px-12 py-3.5 sm:py-4 text-sm sm:text-base font-bold text-[#0B0A09] shadow-md transition"
          >
            <Sparkles className="h-5 w-5" />
            <span>Selesai Memasak! 🎉</span>
          </button>
        )}
      </footer>

      {/* 5. FINISH & RATING MODAL DIALOG */}
      {isRatingDialogOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-[#302C28] bg-[#1B1917] p-6 sm:p-8 shadow-2xl space-y-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#FFB020]/30 bg-[#FFB020]/15 text-[#FFB020] text-2xl">
              🎉
            </div>

            <div className="space-y-1">
              <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[#F6F2EB]">
                Selamat! Hidangan Selesai!
              </h3>
              <p className="text-xs text-[#A7A098]">
                Kamu berhasil memasak <strong className="text-[#F6F2EB]">{recipe.title}</strong> dan
                menyelamatkan bahan kulkas. Bagaimana rasanya?
              </p>
            </div>

            {/* Simple Rating Options */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRating('masak_lagi')}
                className={`rounded-xl border p-3.5 flex flex-col items-center gap-1.5 transition ${
                  selectedRating === 'masak_lagi'
                    ? 'border-[#00C995] bg-[#00C995]/15 text-[#00C995]'
                    : 'border-[#302C28] bg-[#12110F] text-[#A7A098] hover:border-[#302C28]/80'
                }`}
              >
                <ThumbsUp className="h-5 w-5 text-[#00C995]" />
                <span className="text-xs font-bold">Masak Lagi!</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRating('oke')}
                className={`rounded-xl border p-3.5 flex flex-col items-center gap-1.5 transition ${
                  selectedRating === 'oke'
                    ? 'border-[#FFB020] bg-[#FFB020]/15 text-[#FFB020]'
                    : 'border-[#302C28] bg-[#12110F] text-[#A7A098] hover:border-[#302C28]/80'
                }`}
              >
                <span className="text-xl">👌</span>
                <span className="text-xs font-bold">Cukup Oke</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRating('tidak_akan_ulang')}
                className={`rounded-xl border p-3.5 flex flex-col items-center gap-1.5 transition ${
                  selectedRating === 'tidak_akan_ulang'
                    ? 'border-[#FF5C65] bg-[#FF5C65]/15 text-[#FF5C65]'
                    : 'border-[#302C28] bg-[#12110F] text-[#A7A098] hover:border-[#302C28]/80'
                }`}
              >
                <ThumbsDown className="h-5 w-5 text-[#FF5C65]" />
                <span className="text-xs font-bold">Tidak Ulang</span>
              </button>
            </div>

            {/* Optional Chef Notes */}
            <div className="text-left space-y-1.5">
              <label className="text-xs font-semibold text-[#A7A098]">
                Catatan Koki (Opsional):
              </label>
              <input
                type="text"
                value={chefNotes}
                onChange={(e) => setChefNotes(e.target.value)}
                placeholder="Contoh: Enak sekali, kurangi garam sedikit"
                className="w-full rounded-xl border border-[#302C28] bg-[#12110F] p-2.5 text-xs text-[#F6F2EB] placeholder:text-[#A7A098]/50 focus:border-[#00C995] focus:outline-none"
              />
            </div>

            {/* Save & Finish Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSubmitRating}
                disabled={isSubmittingRating}
                className="w-full rounded-xl bg-[#00C995] hover:bg-[#00b585] py-3 text-xs font-bold text-[#0B0A09] shadow-sm disabled:opacity-50 transition"
              >
                {isSubmittingRating ? 'Menyimpan...' : 'Simpan ke Riwayat Masak & Selesai'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
