import { createContext, useContext, useEffect } from 'react'

const ThemeContext = createContext(null)

// Il portale usa sempre il tema chiaro — dark mode rimossa.
export function ThemeProvider({ children }) {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light')
  }, [])

  return (
    <ThemeContext.Provider value={{ preference: 'light', resolved: 'light', isDark: false }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
