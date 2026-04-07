/**
 * Menu Structure Configuration
 * Organizzazione gerarchica del menu con gruppi collassibili
 */

export const MENU_GROUPS = [
  {
    id: 'header',
    label: null,
    collapsed: false,
    collapsible: false,
    items: [
      { id: 'overview', label: 'Panoramica', icon: 'IconGrid', section: 'overview' },
    ],
  },
  {
    id: 'pianificazione',
    label: 'Pianificazione',
    icon: 'IconRoute',
    collapsed: false,
    collapsible: true,
    items: [
      { id: 'scenari', label: 'Scenari', icon: 'IconScenario', section: 'scenari' },
      { id: 'giri',    label: 'Giri',    icon: 'IconRoute',    section: 'giri' },
      { id: 'autisti', label: 'Autisti', icon: 'IconPerson',   section: 'autisti' },
    ],
  },
  {
    id: 'amministrazione',
    label: 'Amministrazione',
    icon: 'IconBriefcase',
    collapsed: true,
    collapsible: true,
    items: [
      { id: 'contratti', label: 'Contratti', icon: 'IconDocument', section: 'contratti' },
      { id: 'utenti',    label: 'Utenti',    icon: 'IconUsers',    section: 'utenti', adminOnly: true },
      { id: 'flotta',    label: 'Flotta',    icon: 'IconTruck',    section: 'flotta' },
    ],
  },
  {
    id: 'anagrafiche',
    label: 'Anagrafiche',
    icon: 'IconBuilding',
    collapsed: true,
    collapsible: true,
    items: [
      { id: 'punti',      label: 'PUDO',       icon: 'IconMap',      section: 'punti' },
      { id: 'filialiBrt', label: 'Filiali BRT', icon: 'IconBuilding', section: 'filialiBrt' },
      { id: 'filiali',    label: 'Filiali',     icon: 'IconBuilding', section: 'filiali' },
    ],
  },
  {
    id: 'dati',
    label: 'Dati',
    icon: 'IconBox',
    collapsed: true,
    collapsible: true,
    items: [
      { id: 'spedizioni', label: 'Spedizioni', icon: 'IconBox', section: 'spedizioni' },
    ],
  },
  {
    id: 'monitoraggio',
    label: 'Monitoraggio',
    icon: 'IconChart',
    collapsed: true,
    collapsible: true,
    items: [
      { id: 'eccezioni',  label: 'Qualità',       icon: 'IconAlert', section: 'eccezioni', badge: true },
      { id: 'report',     label: 'Performances',  icon: 'IconChart', section: 'report' },
      { id: 'economics',  label: 'Economics',     icon: 'IconCoin',  section: 'economics' },
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
