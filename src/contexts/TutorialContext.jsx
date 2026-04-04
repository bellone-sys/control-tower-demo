import { createContext, useContext, useState, useEffect } from 'react'

const TutorialContext = createContext()

const STORAGE_KEY = 'fp_ct_user_settings'

/**
 * Default user settings structure
 */
function getDefaultSettings() {
  return {
    tutorials: {
      enabled: true,
      dismissed: {
        landing_page: false,
        spedizioni_overview: false,
        giri_concept: false,
        scenario_wizard_step1: false,
        scenario_wizard_complete: false,
        pudo_map: false,
        flotta_dashboard: false,
        contratti_section: false,
        settings_panel: false,
        responsive_info: false,
      },
    },
    preferences: {
      language: 'it',
      darkMode: false,
    },
  }
}

/**
 * Load user settings from localStorage, or return defaults
 */
function loadSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return getDefaultSettings()
    const parsed = JSON.parse(stored)
    // Merge with defaults to ensure all keys exist
    return {
      tutorials: {
        enabled: parsed.tutorials?.enabled ?? true,
        dismissed: {
          ...getDefaultSettings().tutorials.dismissed,
          ...parsed.tutorials?.dismissed,
        },
      },
      preferences: {
        ...getDefaultSettings().preferences,
        ...parsed.preferences,
      },
    }
  } catch {
    return getDefaultSettings()
  }
}

/**
 * Save settings to localStorage
 */
function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch (e) {
    console.error('Failed to save settings:', e)
  }
}

export function TutorialProvider({ children }) {
  const [settings, setSettings] = useState(() => loadSettings())

  // Persist to localStorage whenever settings change
  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  const dismissTutorial = (tutorialId) => {
    setSettings(prev => ({
      ...prev,
      tutorials: {
        ...prev.tutorials,
        dismissed: {
          ...prev.tutorials.dismissed,
          [tutorialId]: true,
        },
      },
    }))
  }

  const resetTutorial = (tutorialId) => {
    setSettings(prev => ({
      ...prev,
      tutorials: {
        ...prev.tutorials,
        dismissed: {
          ...prev.tutorials.dismissed,
          [tutorialId]: false,
        },
      },
    }))
  }

  const resetAllTutorials = () => {
    setSettings(prev => ({
      ...prev,
      tutorials: {
        ...prev.tutorials,
        dismissed: getDefaultSettings().tutorials.dismissed,
      },
    }))
  }

  const setTutorialsEnabled = (enabled) => {
    setSettings(prev => ({
      ...prev,
      tutorials: {
        ...prev.tutorials,
        enabled,
      },
    }))
  }

  const isTutorialVisible = (tutorialId) => {
    return settings.tutorials.enabled && !settings.tutorials.dismissed[tutorialId]
  }

  const value = {
    settings,
    dismissTutorial,
    resetTutorial,
    resetAllTutorials,
    setTutorialsEnabled,
    isTutorialVisible,
  }

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  )
}

export function useTutorial() {
  const context = useContext(TutorialContext)
  if (!context) {
    throw new Error('useTutorial must be used within TutorialProvider')
  }
  return context
}
