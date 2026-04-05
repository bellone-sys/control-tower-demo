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
    'nav.docs':          'Documentazione',
    'nav.filialiBrt':    'Filiali BRT',
    'nav.releaseNotes':  'Release Notes',
    'nav.credits':       'Credits',
    // Gruppi sidebar
    'nav.group.operations': 'Operazioni',
    'nav.group.management': 'Gestione',
    'nav.group.monitoring': 'Monitoraggio',
    'nav.group.resources':  'Risorse',
    'nav.group.info':       'Info',
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
    'nav.overview':    'Overview',
    'nav.spedizioni':  'Shipments',
    'nav.giri':        'Routes',
    'nav.punti':       'PUDO',
    'nav.flotta':      'Fleet',
    'nav.filiali':     'Branches',
    'nav.contratti':   'Contracts',
    'nav.utenti':      'Users',
    'nav.eccezioni':   'Exceptions',
    'nav.report':        'Reports',
    'nav.docs':          'Documentation',
    'nav.filialiBrt':    'BRT Branches',
    'nav.releaseNotes':  'Release Notes',
    'nav.credits':       'Credits',
    'nav.group.operations': 'Operations',
    'nav.group.management': 'Management',
    'nav.group.monitoring': 'Monitoring',
    'nav.group.resources':  'Resources',
    'nav.group.info':       'Info',
    'header.settings': 'Settings',
    'header.logout':   'Log out',
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
    'status.active':   'Active',
    'status.inactive': 'Inactive',
    'status.expiring': 'Expiring soon',
    'status.expired':  'Expired',
    'status.planned':  'Planned',
    'status.running':  'In progress',
    'status.done':     'Completed',
    'status.cancelled':'Cancelled',
    'settings.title':         'Settings',
    'settings.tab.tutorials': 'Tutorials',
    'settings.tab.interface': 'Interface',
    'settings.tab.about':     'About',
    'settings.tutorials.enable':      'Enable tutorials',
    'settings.tutorials.enable.hint': 'Show interactive hints on first use',
    'settings.language':      'Language',
    'settings.language.hint': 'Select interface language',
    'settings.darkmode':      'Dark mode',
    'settings.darkmode.hint': 'Enable dark theme',
    'giri.tab.giri':      'Routes',
    'giri.tab.template':  '★ Templates',
    'giri.tab.scenari':   'Scenarios',
    'giri.tab.favorites': '❤️ Favorites',
    'giri.tab.history':   'History',
    'contracts.title':       'Contracts',
    'contracts.tab.vehicles':'🚚 Vehicle Leasing',
    'contracts.tab.couriers':'👤 Couriers',
    'contracts.tab.handlers':'⚙️ Handling Operators',
    'contracts.upload.title':'Upload new contract',
    'contracts.empty.title': 'No contracts uploaded',
    'contracts.empty.hint':  'Upload the first contract using the section above.',
    'shipments.total':    'Total shipments',
    'shipments.delivery': 'Deliveries',
    'shipments.pickup':   'Pickups',
    'shipments.weight':   'Total weight',
    'history.tab':        'History',
    'history.empty':      'No changes recorded yet.',
    'history.action.create':  'Created',
    'history.action.update':  'Updated',
    'history.action.delete':  'Deleted',
    'history.action.status':  'Status changed',
  },

  fr: {
    'nav.overview':    'Vue d\'ensemble',
    'nav.spedizioni':  'Expéditions',
    'nav.giri':        'Tournées',
    'nav.punti':       'PUDO',
    'nav.flotta':      'Flotte',
    'nav.filiali':     'Agences',
    'nav.contratti':   'Contrats',
    'nav.utenti':      'Utilisateurs',
    'nav.eccezioni':   'Exceptions',
    'nav.report':      'Rapports',
    'nav.docs':          'Documentation',
    'nav.filialiBrt':    'Agences BRT',
    'nav.releaseNotes':  'Notes de version',
    'nav.credits':       'Crédits',
    'nav.group.operations': 'Opérations',
    'nav.group.management': 'Gestion',
    'nav.group.monitoring': 'Surveillance',
    'nav.group.resources':  'Ressources',
    'nav.group.info':       'Info',
    'header.settings': 'Paramètres',
    'header.logout':   'Déconnexion',
    'action.save':     'Enregistrer',
    'action.cancel':   'Annuler',
    'action.confirm':  'Confirmer',
    'action.delete':   'Supprimer',
    'action.edit':     'Modifier',
    'action.add':      'Ajouter',
    'action.import':   'Importer',
    'action.export':   'Exporter',
    'action.close':    'Fermer',
    'action.search':   'Rechercher',
    'action.reset':    'Réinitialiser',
    'status.active':   'Actif',
    'status.inactive': 'Inactif',
    'status.expiring': 'Expire bientôt',
    'status.expired':  'Expiré',
    'status.planned':  'Planifié',
    'status.running':  'En cours',
    'status.done':     'Terminé',
    'status.cancelled':'Annulé',
    'settings.title':         'Paramètres',
    'settings.tab.tutorials': 'Tutoriels',
    'settings.tab.interface': 'Interface',
    'settings.tab.about':     'À propos',
    'settings.tutorials.enable':      'Activer les tutoriels',
    'settings.tutorials.enable.hint': 'Afficher les conseils interactifs à la première utilisation',
    'settings.language':      'Langue',
    'settings.language.hint': 'Sélectionner la langue de l\'interface',
    'settings.darkmode':      'Mode sombre',
    'settings.darkmode.hint': 'Activer le thème sombre',
    'giri.tab.giri':      'Tournées',
    'giri.tab.template':  '★ Modèles',
    'giri.tab.scenari':   'Scénarios',
    'giri.tab.favorites': '❤️ Favoris',
    'giri.tab.history':   'Historique',
    'contracts.title':       'Contrats',
    'contracts.tab.vehicles':'🚚 Location de véhicules',
    'contracts.tab.couriers':'👤 Coursiers',
    'contracts.tab.handlers':'⚙️ Opérateurs logistiques',
    'contracts.upload.title':'Charger un nouveau contrat',
    'contracts.empty.title': 'Aucun contrat chargé',
    'contracts.empty.hint':  'Chargez le premier contrat via la section ci-dessus.',
    'shipments.total':    'Total expéditions',
    'shipments.delivery': 'Livraisons',
    'shipments.pickup':   'Collectes',
    'shipments.weight':   'Poids total',
    'history.tab':        'Historique',
    'history.empty':      'Aucune modification enregistrée.',
    'history.action.create':  'Créé',
    'history.action.update':  'Modifié',
    'history.action.delete':  'Supprimé',
    'history.action.status':  'Statut modifié',
  },

  de: {
    'nav.overview':    'Übersicht',
    'nav.spedizioni':  'Sendungen',
    'nav.giri':        'Touren',
    'nav.punti':       'PUDO',
    'nav.flotta':      'Fuhrpark',
    'nav.filiali':     'Filialen',
    'nav.contratti':   'Verträge',
    'nav.utenti':      'Benutzer',
    'nav.eccezioni':   'Ausnahmen',
    'nav.report':      'Berichte',
    'nav.docs':          'Dokumentation',
    'nav.filialiBrt':    'BRT-Filialen',
    'nav.releaseNotes':  'Versionshinweise',
    'nav.credits':       'Impressum',
    'nav.group.operations': 'Betrieb',
    'nav.group.management': 'Verwaltung',
    'nav.group.monitoring': 'Überwachung',
    'nav.group.resources':  'Ressourcen',
    'nav.group.info':       'Info',
    'header.settings': 'Einstellungen',
    'header.logout':   'Abmelden',
    'action.save':     'Speichern',
    'action.cancel':   'Abbrechen',
    'action.confirm':  'Bestätigen',
    'action.delete':   'Löschen',
    'action.edit':     'Bearbeiten',
    'action.add':      'Hinzufügen',
    'action.import':   'Importieren',
    'action.export':   'Exportieren',
    'action.close':    'Schließen',
    'action.search':   'Suchen',
    'action.reset':    'Zurücksetzen',
    'status.active':   'Aktiv',
    'status.inactive': 'Inaktiv',
    'status.expiring': 'Läuft bald ab',
    'status.expired':  'Abgelaufen',
    'status.planned':  'Geplant',
    'status.running':  'In Bearbeitung',
    'status.done':     'Abgeschlossen',
    'status.cancelled':'Storniert',
    'settings.title':         'Einstellungen',
    'settings.tab.tutorials': 'Tutorials',
    'settings.tab.interface': 'Benutzeroberfläche',
    'settings.tab.about':     'Info',
    'settings.tutorials.enable':      'Tutorials aktivieren',
    'settings.tutorials.enable.hint': 'Interaktive Hinweise bei der ersten Nutzung anzeigen',
    'settings.language':      'Sprache',
    'settings.language.hint': 'Sprache der Benutzeroberfläche auswählen',
    'settings.darkmode':      'Dunkelmodus',
    'settings.darkmode.hint': 'Dunkles Design aktivieren',
    'giri.tab.giri':      'Touren',
    'giri.tab.template':  '★ Vorlagen',
    'giri.tab.scenari':   'Szenarien',
    'giri.tab.favorites': '❤️ Favoriten',
    'giri.tab.history':   'Verlauf',
    'contracts.title':       'Verträge',
    'contracts.tab.vehicles':'🚚 Fahrzeugmiete',
    'contracts.tab.couriers':'👤 Kuriere',
    'contracts.tab.handlers':'⚙️ Lageroperatoren',
    'contracts.upload.title':'Neuen Vertrag hochladen',
    'contracts.empty.title': 'Keine Verträge hochgeladen',
    'contracts.empty.hint':  'Laden Sie den ersten Vertrag über den Bereich oben hoch.',
    'shipments.total':    'Sendungen gesamt',
    'shipments.delivery': 'Lieferungen',
    'shipments.pickup':   'Abholungen',
    'shipments.weight':   'Gesamtgewicht',
    'history.tab':        'Verlauf',
    'history.empty':      'Noch keine Änderungen aufgezeichnet.',
    'history.action.create':  'Erstellt',
    'history.action.update':  'Aktualisiert',
    'history.action.delete':  'Gelöscht',
    'history.action.status':  'Status geändert',
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
  // Available languages for selector
  const AVAILABLE_LANGS = ['it', 'en', 'fr', 'de']

  const setLang = useCallback((newLang) => {
    if (!AVAILABLE_LANGS.includes(newLang)) return
    setLangState(newLang)
    try { localStorage.setItem(STORAGE_KEY, newLang) } catch { /* ignore */ }
  }, [])

  const t = useCallback((key, fallback) => {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.it
    return dict[key] ?? fallback ?? key
  }, [lang])

  return (
    <I18nContext.Provider value={{ lang, setLang, t, AVAILABLE_LANGS }}>
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
