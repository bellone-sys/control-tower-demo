import { useEffect } from 'react'
import { APP_VERSION } from '../version'
import releases from '../data/releases.json'

/**
 * Hook per controllare se è disponibile una nuova versione
 * Verifica al caricamento e periodicamente (ogni 30 minuti)
 */
export function useVersionCheck(onNewVersionAvailable) {
  useEffect(() => {
    const checkVersion = () => {
      const latestVersion = releases.latest
      const currentVersion = APP_VERSION

      // Confronta le versioni (es. "0.24.0" vs "0.24.0")
      if (isNewerVersion(latestVersion, currentVersion)) {
        const releaseInfo = releases.releases.find(r => r.version === latestVersion)
        onNewVersionAvailable?.(releaseInfo)
      }
    }

    // Controlla al caricamento
    checkVersion()

    // Controlla periodicamente (ogni 30 minuti)
    const interval = setInterval(checkVersion, 30 * 60 * 1000)

    return () => clearInterval(interval)
  }, [onNewVersionAvailable])
}

/**
 * Confronta due versioni semantiche (es. "0.24.0" vs "0.23.0")
 * Ritorna true se version1 > version2
 */
function isNewerVersion(version1, version2) {
  const v1Parts = version1.split('.').map(Number)
  const v2Parts = version2.split('.').map(Number)

  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1 = v1Parts[i] || 0
    const v2 = v2Parts[i] || 0
    if (v1 > v2) return true
    if (v1 < v2) return false
  }

  return false
}
