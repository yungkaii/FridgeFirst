import { Download, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      const dismissed = sessionStorage.getItem('pwa_prompt_dismissed')
      if (!dismissed) {
        setIsVisible(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      console.log('User accepted PWA installation')
    }
    setDeferredPrompt(null)
    setIsVisible(false)
  }

  const handleDismiss = () => {
    sessionStorage.setItem('pwa_prompt_dismissed', 'true')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 md:bottom-6 md:left-auto md:right-6 md:max-w-sm animate-in fade-in slide-in-from-bottom duration-300">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#302C28] bg-[#1B1917]/95 p-3.5 text-[#F6F2EB] shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <img src="/icon.svg" alt="FridgeFirst" className="h-9 w-9 rounded-xl shadow-xs" />
          <div>
            <p className="text-xs font-bold text-[#F6F2EB] leading-tight">Install FridgeFirst</p>
            <p className="text-[10px] text-[#A7A098]">Akses cepat & resep offline di HP Anda</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1 rounded-xl bg-[#00C995] hover:bg-[#00b585] px-3 py-1.5 text-xs font-bold text-[#0B0A09] shadow-sm transition"
          >
            <Download className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Install</span>
          </button>
          <button
            onClick={handleDismiss}
            className="rounded-lg p-1 text-[#A7A098] hover:text-[#F6F2EB] transition"
            title="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
