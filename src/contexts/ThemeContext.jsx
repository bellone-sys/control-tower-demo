import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const ThemeContext = createContext(null)
const STORAGE_KEY = 'fp_ct_theme' // 'light' | 'dark' | 'system'

function getSystemPref() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function loadSaved() {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'light' || v === 'dark' || v === 'system') return v
  } catch { /* ignore */ }
  return 'system'
}

export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(loadSaved)          // 'light' | 'dark' | 'system'
  const [resolved,   setResolved]   = useState(() => {
    const pref = loadSaved()
    return pref === 'system' ? getSystemPref() : pref
  })

  // Sync <html data-theme> attribute
  useEffect(() => {
    const root = document.documentElement
    if (resolved === 'dark') {
      root.setAttribute('data-theme', 'dark')
    } else {
      root.setAttribute('data-theme', 'light')
    }
  }, [resolved])

  // Listen to system preference changes when in 'system' mode
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => {
      if (preference === 'system') {
        setResolved(e.matches ? 'dark' : 'light')
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [preference])

  const setTheme = useCallback((value) => {
    if (!['light', 'dark', 'system'].includes(value)) return
    setPreference(value)
    const resolvedValue = value === 'system' ? getSystemPref() : value
    setResolved(resolvedValue)
    try { localStorage.setItem(STORAGE_KEY, value) } catch { /* ignore */ }
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(resolved === 'dark' ? 'light' : 'dark')
  }, [resolved, setTheme])

  return (
    <ThemeContext.Provider value={{ preference, resolved, isDark: resolved === 'dark', setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
