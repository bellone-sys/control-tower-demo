import { useState } from 'react'
import { useTutorial } from '../../contexts/TutorialContext'
import { useI18n } from '../../contexts/I18nContext'
import { APP_VERSION } from '../../version'
import './SettingsPanel.css'

const TUTORIALS_LIST = [
  { id: 'landing_page',             label: '📍 Landing Page',           description: 'Introduzione all\'app' },
  { id: 'spedizioni_overview',      label: '📦 Spedizioni',              description: 'Gestione spedizioni' },
  { id: 'giri_concept',             label: '🚚 Giri Concept',            description: 'Concetto di giri ottimizzati' },
  { id: 'scenario_wizard_step1',    label: '🧙 Scenario Wizard Step 1',  description: 'Area e filiale' },
  { id: 'scenario_wizard_complete', label: '✅ Scenario Wizard Complete', description: 'Conferma scenario' },
  { id: 'pudo_map',                 label: '🗺️ PUDO Map',                description: 'Visualizzazione PUDO' },
  { id: 'flotta_dashboard',         label: '🚗 Flotta Dashboard',         description: 'Dashboard flotta' },
  { id: 'contratti_section',        label: '📋 Contratti',               description: 'Gestione contratti' },
  { id: 'settings_panel',           label: '⚙️ Settings Panel',          description: 'Pannello impostazioni' },
]

const LANG_OPTIONS = [
  { value: 'it', flag: '🇮🇹', label: 'Italiano' },
  { value: 'en', flag: '🇬🇧', label: 'English' },
  { value: 'fr', flag: '🇫🇷', label: 'Français' },
  { value: 'de', flag: '🇩🇪', label: 'Deutsch' },
]

export default function SettingsPanel({ onClose, hiddenTabs = [], defaultTab }) {
  const { settings, resetTutorial, resetAllTutorials, setTutorialsEnabled } = useTutorial()
  const { lang, setLang, t } = useI18n()

  const ALL_TABS = [
    { id: 'tutorials', label: t('settings.tab.tutorials', 'Tutorial') },
    { id: 'interface', label: t('settings.tab.interface', 'Interfaccia') },
    { id: 'about',     label: t('settings.tab.about', 'Info') },
  ].filter(tab => !hiddenTabs.includes(tab.id))

  const [activeTab, setActiveTab] = useState(() => defaultTab ?? ALL_TABS[0]?.id ?? 'tutorials')
  const [confirmReset, setConfirmReset] = useState(false)

  return (
    <div className="settings-panel-overlay" onClick={onClose}>
      <div className="settings-panel-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="settings-panel-header">
          <h2>{t('settings.title', 'Impostazioni')}</h2>
          <button className="settings-panel-close" onClick={onClose} aria-label="Chiudi impostazioni">✕</button>
        </div>

        {/* Tabs */}
        <div className="settings-tabs">
          {ALL_TABS.map(tab => (
            <button key={tab.id} className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="settings-content">

          {/* ── Tab Tutorial ── */}
          {activeTab === 'tutorials' && (
            <div className="settings-section">
              <div className="settings-option">
                <div>
                  <div className="settings-option-label">{t('settings.tutorials.enable', 'Abilita tutorial')}</div>
                  <div className="settings-option-hint">{t('settings.tutorials.enable.hint', 'Mostra suggerimenti interattivi al primo utilizzo')}</div>
                </div>
                <label className="settings-toggle">
                  <input type="checkbox" checked={settings.tutorials.enabled} onChange={e => setTutorialsEnabled(e.target.checked)} />
                  <div className="settings-toggle-track" />
                  <div className="settings-toggle-thumb" />
                </label>
              </div>

              {settings.tutorials.enabled && (
                <>
                  <div className="settings-divider" />
                  <div className="settings-tutorials-list">
                    <div className="settings-list-title">Tutorial disponibili</div>
                    {TUTORIALS_LIST.map(tut => {
                      const isDismissed = settings.tutorials.dismissed[tut.id]
                      return (
                        <div key={tut.id} className="settings-tutorial-item">
                          <div>
                            <div className="settings-tutorial-name">{tut.label}</div>
                            <div className="settings-tutorial-desc">{tut.description}</div>
                          </div>
                          {isDismissed ? (
                            <button className="settings-tutorial-btn settings-tutorial-btn-reset" onClick={() => resetTutorial(tut.id)}>
                              Riabilita
                            </button>
                          ) : (
                            <div className="settings-tutorial-badge">✓ Attivo</div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <div className="settings-divider" />
                  {!confirmReset ? (
                    <button className="settings-action-btn settings-action-btn-reset" onClick={() => setConfirmReset(true)}>
                      Ripristina tutti i tutorial
                    </button>
                  ) : (
                    <div className="settings-confirm-box">
                      <div className="settings-confirm-text">Ripristinare tutti i tutorial?</div>
                      <div className="settings-confirm-actions">
                        <button className="settings-confirm-btn settings-confirm-btn-cancel" onClick={() => setConfirmReset(false)}>
                          {t('action.cancel', 'Annulla')}
                        </button>
                        <button className="settings-confirm-btn settings-confirm-btn-confirm" onClick={() => { resetAllTutorials(); setConfirmReset(false) }}>
                          {t('action.reset', 'Ripristina')}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── Tab Interfaccia ── */}
          {activeTab === 'interface' && (
            <div className="settings-section">
              <div className="settings-option">
                <div>
                  <div className="settings-option-label">{t('settings.language', 'Lingua')}</div>
                  <div className="settings-option-hint">{t('settings.language.hint', 'Seleziona la lingua dell\'interfaccia')}</div>
                </div>
                <select className="settings-select" value={lang} onChange={e => setLang(e.target.value)} aria-label="Seleziona lingua">
                  {LANG_OPTIONS.map(l => (
                    <option key={l.value} value={l.value}>{l.flag} {l.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* ── Tab Info ── */}
          {activeTab === 'about' && (
            <div className="settings-section">
              <div className="settings-about">
                <div className="settings-about-logo">
                  <svg viewBox="0 0 110 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="36" height="36" rx="4" fill="#DC0032"/>
                    <text x="18" y="25" textAnchor="middle" fontSize="14" fontFamily="Inter,sans-serif" fontWeight="700" fill="white">FP</text>
                    <text x="44" y="14" fontSize="8" fontFamily="Inter,sans-serif" fontWeight="300" fill="rgba(255,255,255,.6)" letterSpacing="1.5">FERMOPOINT</text>
                    <text x="44" y="27" fontSize="11" fontFamily="Inter,sans-serif" fontWeight="500" fill="white">Control Tower</text>
                  </svg>
                </div>
                <div className="settings-about-title">Control Tower</div>
                <div className="settings-about-version">v{APP_VERSION}</div>
                <div className="settings-about-desc">Sistema di gestione logistica con raccolta DPD</div>

                <div className="settings-about-divider" />

                <div className="settings-about-info">
                  <div className="settings-about-item">
                    <span className="settings-about-label">Versione</span>
                    <span>{APP_VERSION}</span>
                  </div>
                  <div className="settings-about-item">
                    <span className="settings-about-label">Sviluppato da</span>
                    <span>Elipse Srl</span>
                  </div>
                  <div className="settings-about-item">
                    <span className="settings-about-label">Status</span>
                    <span>Production (Demo)</span>
                  </div>
                </div>

                <div className="settings-about-divider" />

                <div className="settings-about-copyright">
                  © 2016–2026 Elipse Srl · Tutti i diritti riservati
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
