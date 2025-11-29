import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  // Force light theme only - no dark mode
  const [theme, setTheme] = useState('light')

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('dashboardSettings')
    return saved ? JSON.parse(saved) : {
      logo: null,
      dashboardName: 'Jadwa',
      dashboardNameAr: 'جدوى',
      primaryFont: 'Inter',
      arabicFont: 'Cairo',
      animationsEnabled: true,
      animationSpeed: 'normal', // slow, normal, fast
      primaryColor: '#7a8c66', // olive-green
      secondaryColor: '#14b8a6', // turquoise
    }
  })

  useEffect(() => {
    // Always use light theme
    document.documentElement.setAttribute('data-theme', 'light')
    document.documentElement.classList.remove('dark')
    
    // Apply light theme colors
    const root = document.documentElement
    root.style.setProperty('--bg-primary', '#ffffff')
    root.style.setProperty('--bg-secondary', '#f8f9fa')
    root.style.setProperty('--text-primary', '#1a1a1a')
    root.style.setProperty('--text-secondary', '#666666')
  }, [])

  useEffect(() => {
    localStorage.setItem('dashboardSettings', JSON.stringify(settings))
    
    // Apply fonts
    const root = document.documentElement
    root.style.setProperty('--font-primary', settings.primaryFont)
    root.style.setProperty('--font-arabic', settings.arabicFont)
    
    // Apply animations
    root.style.setProperty('--animation-enabled', settings.animationsEnabled ? '1' : '0')
    root.style.setProperty('--animation-speed', 
      settings.animationSpeed === 'slow' ? '0.5s' :
      settings.animationSpeed === 'fast' ? '0.2s' : '0.3s'
    )
    
    // Apply colors
    root.style.setProperty('--color-primary', settings.primaryColor)
    root.style.setProperty('--color-secondary', settings.secondaryColor)
  }, [settings])

  const toggleTheme = () => {
    // Theme is always light - do nothing
    // This function is kept for compatibility but doesn't change theme
  }

  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        settings,
        updateSettings,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

