import { createContext, useContext, useState, useCallback } from 'react'

// ─────────────────────────────────────────────────────────
//  DIZIONARI
// ─────────────────────────────────────────────────────────
const TRANSLATIONS = {
  it: {
    // Navigazione / sezioni
    'nav.overview':    'Panoramica',
    'nav.spedizioni':  'Spedizioni',
    'nav.giri':        'Giri',
    'nav.punti':       'PUDO',
    'nav.flotta':      'Flotta',
    'nav.filiali':     'Filiali',
    'nav.contratti':   'Contratti',
    'nav.utenti':      'Utenti',
    'nav.eccezioni':   'Eccezioni',
    'nav.report':      'Report',
    // Gruppi sidebar
    'nav.group.operations': 'Operazioni',
    'nav.group.management': 'Gestione',
    'nav.group.monitoring': 'Monitoraggio',
    // Header
    'header.settings': 'Impostazioni',
    'header.logout':   'Esci',
    // Azioni comuni
    'action.save':     'Salva',
    'action.cancel':   'Annulla',
    'action.confirm':  'Conferma',
    'action.delete':   'Elimina',
    'action.edit':     'Modifica',
    'action.add':      'Aggiungi',
    'action.import':   'Importa',
    'action.export':   'Esporta',
    'action.close':    'Chiudi',
    'action.search':   'Cerca',
    'action.reset':    'Ripristina',
    // Stati generici
    'status.active':   'Attivo',
    'status.inactive': 'Inattivo',
    'status.expiring': 'In scadenza',
    'status.expired':  'Scaduto',
    'status.planned':  'Pianificato',
    'status.running':  'In corso',
    'status.done':     'Completato',
    'status.cancelled':'Annullato',
    // Settings panel
    'settings.title':         'Impostazioni',
    'settings.tab.tutorials': 'Tutorial',
    'settings.tab.interface': 'Interfaccia',
    'settings.tab.about':     'Info',
    'settings.tutorials.enable':      'Abilita tutorial',
    'settings.tutorials.enable.hint': 'Mostra suggerimenti interattivi al primo utilizzo',
    'settings.language':      'Lingua',
    'settings.language.hint': 'Seleziona la lingua dell\'interfaccia',
    'settings.darkmode':      'Dark mode',
    'settings.darkmode.hint': 'Attiva la modalità scura (prossimamente)',
    // Giri
    'giri.tab.giri':      'Giri',
    'giri.tab.template':  '★ Template',
    'giri.tab.scenari':   'Scenari',
    'giri.tab.favorites': '❤️ Preferiti',
    // Contratti
    'contracts.title':       'Contratti',
    'contracts.tab.vehicles':'🚚 Noleggio Mezzi',
    'contracts.tab.couriers':'👤 Corrieri Dipendenti/Esterni',
    'contracts.tab.handlers':'⚙️ Operatori Handling',
    'contracts.upload.title':'Carica nuovo contratto',
    'contracts.empty.title': 'Nessun contratto caricato',
    'contracts.empty.hint':  'Carica il primo contratto usando la sezione upload qui sopra.',
    // Spedizioni
    'shipments.total':    'Spedizioni totali',
    'shipments.delivery': 'Consegne',
    'shipments.pickup':   'Ritiri',
    'shipments.weight':   'Peso totale',
  },

  en: {
    // Navigation / sections
    'nav.overview':    'Overview',
    'nav.spedizioni':  'Shipments',
    'nav.giri':        'Routes',
    'nav.punti':       'PUDO',
    'nav.flotta':      'Fleet',
    'nav.filiali':     'Branches',
    'nav.contratti':   'Contracts',
    'nav.utenti':      'Users',
    'nav.eccezioni':   'Exceptions',
    'nav.report':      'Reports',
    // Sidebar groups
    'nav.group.operations': 'Operations',
    'nav.group.management': 'Management',
    'nav.group.monitoring': 'Monitoring',
    // Header
    'header.settings': 'Settings',
    'header.logout':   'Log out',
    // Common actions
    'action.save':     'Save',
    'action.cancel':   'Cancel',
    'action.confirm':  'Confirm',
    'action.delete':   'Delete',
    'action.edit':     'Edit',
    'action.add':      'Add',
    'action.import':   'Import',
    'action.export':   'Export',
    'action.close':    'Close',
    'action.search':   'Search',
    'action.reset':    'Reset',
    // Generic states
    'status.active':   'Active',
    'status.inactive': 'Inactive',
    'status.expiring': 'Expiring soon',
    'status.expired':  'Expired',
    'status.planned':  'Planned',
    'status.running':  'In progress',
    'status.done':     'Completed',
    'status.cancelled':'Cancelled',
    // Settings panel
    'settings.title':         'Settings',
    'settings.tab.tutorials': 'Tutorials',
    'settings.tab.interface': 'Interface',
    'settings.tab.about':     'About',
    'settings.tutorials.enable':      'Enable tutorials',
    'settings.tutorials.enable.hint': 'Show interactive hints on first use',
    'settings.language':      'Language',
    'settings.language.hint': 'Select interface language',
    'settings.darkmode':      'Dark mode',
    'settings.darkmode.hint': 'Enable dark theme (coming soon)',
    // Routes
    'giri.tab.giri':      'Routes',
    'giri.tab.template':  '★ Templates',
    'giri.tab.scenari':   'Scenarios',
    'giri.tab.favorites': '❤️ Favorites',
    // Contracts
    'contracts.title':       'Contracts',
    'contracts.tab.vehicles':'🚚 Vehicle Leasing',
    'contracts.tab.couriers':'👤 Couriers',
    'contracts.tab.handlers':'⚙️ Handling Operators',
    'contracts.upload.title':'Upload new contract',
    'contracts.empty.title': 'No contracts uploaded',
    'contracts.empty.hint':  'Upload the first contract using the section above.',
    // Shipments
    'shipments.total':    'Total shipments',
    'shipments.delivery': 'Deliveries',
    'shipments.pickup':   'Pickups',
    'shipments.weight':   'Total weight',
  },
}

// ─────────────────────────────────────────────────────────
//  CONTEXT
// ─────────────────────────────────────────────────────────
const I18nContext = createContext(null)

const STORAGE_KEY = 'fp_ct_language'

function detectInitialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'it' || saved === 'en') return saved
  } catch { /* ignore */ }
  const browserLang = (navigator.language || 'it').substring(0, 2)
  return browserLang === 'en' ? 'en' : 'it'
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(detectInitialLang)

  const setLang = useCallback((newLang) => {
    if (newLang !== 'it' && newLang !== 'en') return
    setLangState(newLang)
    try { localStorage.setItem(STORAGE_KEY, newLang) } catch { /* ignore */ }
  }, [])

  const t = useCallback((key, fallback) => {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.it
    return dict[key] ?? fallback ?? key
  }, [lang])

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  )
}

/**
 * useI18n() — hook to get { lang, setLang, t }
 * Usage: const { t, lang, setLang } = useI18n()
 *        t('action.save') → 'Salva' | 'Save'
 */
export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>')
  return ctx
}
