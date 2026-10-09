import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const stored = window.localStorage.getItem('theme')
    const dark = stored ? stored === 'dark' : true
    setIsDark(dark)
    document.documentElement.classList.toggle('dark', dark)
    document.documentElement.classList.toggle('light', !dark)
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
  }, [])

  const toggle = () => {
    const nextDark = !isDark
    setIsDark(nextDark)
    const nextMode = nextDark ? 'dark' : 'light'
    window.localStorage.setItem('theme', nextMode)
    document.documentElement.classList.toggle('dark', nextDark)
    document.documentElement.classList.toggle('light', !nextDark)
    document.documentElement.style.colorScheme = nextMode
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
      title={isDark ? 'Mode Gelap (Aktif)' : 'Mode Terang (Aktif)'}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#302C28] bg-[#1B1917] text-[#A7A098] hover:text-[#F6F2EB] hover:border-[#00C995]/40 transition"
    >
      {isDark ? <Moon className="h-4 w-4 text-[#00C995]" /> : <Sun className="h-4 w-4 text-[#FFB020]" />}
    </button>
  )
}
