'use strict'

/**
 * Shared source of truth for the generated availability sidebar (see
 * page-availability-extension.js) and its markdown-mirror counterpart (see
 * markdown-export-extension.js). Wording and display names live here so
 * they're a one-file edit.
 */

const { versionNum } = require('./guides-server')

const ALL_PLANS = ['Free', 'Performance', 'Scale']

const VCS_DISPLAY_NAMES = {
  github: 'GitHub',
  'github-enterprise': 'GitHub Enterprise Server',
  gitlab: 'GitLab',
  'gitlab-self-hosted': 'GitLab self-managed',
  bitbucket: 'Bitbucket Cloud',
  'cursor-origin': 'Cursor Origin',
}

const LABELS = {
  plan: 'Cloud plans',
  vcs: 'Version control',
  server: 'Server version',
}

const VCS_ALL_TEXT = 'All supported providers'
// Rendered path for VCS_ALL_TEXT's link.
const VCS_OVERVIEW_PATH = '/guides/integration/version-control-system-integration-overview/'

// Antora components in scope for the sidebar (checked via page-component-name).
const SCOPED_COMPONENTS = ['guides', 'reference']

// Returns the sidebar text for a Server build, or null when the page is
// available from the baseline (the earliest covered version, set by
// guides-versions-extension.js as the server-baseline-version attribute).
function getServerVersionAvailability(rawMin, rawBaseline) {
  const min = typeof rawMin === 'string' ? rawMin.replace(/"/g, '').trim() : ''
  if (!/^\d+\.\d+$/.test(min)) return null
  const baseline = typeof rawBaseline === 'string' ? rawBaseline.trim() : ''
  if (/^\d+\.\d+$/.test(baseline) && versionNum(min) <= versionNum(baseline)) return null
  return `${min} and later`
}

function parseList(rawValue) {
  if (!rawValue || typeof rawValue !== 'string') return []
  return rawValue.split(',').map((v) => v.trim()).filter(Boolean)
}

/**
 * @param {string} rawValue - the page-plan attribute value
 * @param {(msg: string) => void} [logWarning]
 * @returns {{ restricted: boolean, text: string } | null} null when there's
 *   nothing usable to show (attribute missing, blank, or every value unknown)
 */
function getPlanAvailability(rawValue, logWarning = console.warn) {
  const values = parseList(rawValue)
  if (values.length === 0) return null

  const known = values.filter((v) => {
    if (ALL_PLANS.includes(v)) return true
    logWarning(`page-availability: unknown page-plan value "${v}"`)
    return false
  })
  if (known.length === 0) return null

  return {
    restricted: known.length < ALL_PLANS.length,
    text: known.join(', '),
  }
}

/**
 * @param {string} rawValue - the page-vcs attribute value
 * @param {(msg: string) => void} [logWarning]
 * @returns {{ restricted: boolean, text: string, isAll: boolean } | null}
 */
function getVcsAvailability(rawValue, logWarning = console.warn) {
  const values = parseList(rawValue)
  if (values.length === 0) return null

  if (values.length === 1 && values[0] === 'all') {
    return { restricted: false, text: VCS_ALL_TEXT, isAll: true }
  }

  const known = values
    .filter((v) => {
      if (VCS_DISPLAY_NAMES[v]) return true
      logWarning(`page-availability: unknown page-vcs value "${v}"`)
      return false
    })
    .map((v) => VCS_DISPLAY_NAMES[v])
  if (known.length === 0) return null

  return { restricted: true, text: known.join(', '), isAll: false }
}

module.exports = {
  ALL_PLANS,
  VCS_DISPLAY_NAMES,
  LABELS,
  VCS_ALL_TEXT,
  VCS_OVERVIEW_PATH,
  SCOPED_COMPONENTS,
  parseList,
  getPlanAvailability,
  getVcsAvailability,
  getServerVersionAvailability,
}
