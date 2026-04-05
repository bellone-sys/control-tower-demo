/**
 * Menu Structure Configuration
 * Organizzazione gerarchica del menu con gruppi collassibili
 */

export const MENU_GROUPS = [
  {
    id: 'header',
    label: null,  // No group label, just items
    collapsed: false,
    collapsible: false,
    items: [
      { id: 'overview', label: 'Panoramica', icon: 'IconGrid', section: 'overview' },
    ],
  },
  {
    id: 'operazioni',
    label: 'Operazioni',
    icon: 'IconTruck',
    collapsed: false,
    collapsible: true,
    items: [
      { id: 'spedizioni', label: 'Spedizioni', icon: 'IconBox', section: 'spedizioni' },
      { id: 'giri', label: 'Giri', icon: 'IconRoute', section: 'giri' },
      { id: 'punti', label: 'PUDO', icon: 'IconMap', section: 'punti' },
      { id: 'flotta', label: 'Flotta', icon: 'IconTruck', section: 'flotta' },
    ],
  },
  {
    id: 'gestione',
    label: 'Gestione',
    icon: 'IconSettings',
    collapsed: true,
    collapsible: true,
    items: [
      { id: 'filiali', label: 'Filiali Fermopoint', icon: 'IconBuilding', section: 'filiali' },
      { id: 'filialiBrt', label: 'Filiali BRT', icon: 'IconBuilding', section: 'filialiBrt' },
      { id: 'contratti', label: 'Contratti', icon: 'IconDocument', section: 'contratti' },
      { id: 'utenti', label: 'Utenti', icon: 'IconUsers', section: 'utenti', adminOnly: true },
    ],
  },
  {
    id: 'monitoraggio',
    label: 'Monitoraggio',
    icon: 'IconChart',
    collapsed: true,
    collapsible: true,
    items: [
      { id: 'eccezioni', label: 'Eccezioni', icon: 'IconAlert', section: 'eccezioni', badge: true },
      { id: 'report', label: 'Report', icon: 'IconChart', section: 'report' },
    ],
  },
]

/**
 * Get visible menu groups based on user role
 */
export function getVisibleMenuGroups(isAdmin = false) {
  return MENU_GROUPS.map(group => ({
    ...group,
    items: group.items.filter(item => !item.adminOnly || isAdmin),
  })).filter(group => group.items.length > 0)
}

/**
 * Get menu group collapsed state from localStorage
 */
export function getMenuGroupState(groupId) {
  const stored = localStorage.getItem('fp_ct_menu_state')
  if (!stored) return null
  const state = JSON.parse(stored)
  return state[groupId]
}

/**
 * Set menu group collapsed state
 */
export function setMenuGroupState(groupId, collapsed) {
  const stored = localStorage.getItem('fp_ct_menu_state') || '{}'
  const state = JSON.parse(stored)
  state[groupId] = collapsed
  localStorage.setItem('fp_ct_menu_state', JSON.stringify(state))
}

/**
 * Find a menu item by section id
 */
export function findMenuItemBySection(sectionId) {
  for (const group of MENU_GROUPS) {
    const item = group.items.find(i => i.section === sectionId)
    if (item) return item
  }
  return null
}
