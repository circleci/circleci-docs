'use strict'

// Shared facts about the guides Server build that guides-versions-extension.js
// creates. Every extension that treats the Server build differently checks it
// through here, so removing the build, or renaming its version, is a one-file
// edit.

const COMPONENT = 'guides'
const VERSION = 'server'
const DISPLAY_VERSION = 'Server'
// AsciiDoc attribute holding the earliest Server version the docs cover. A page
// available from this version needs no "Server version" sidebar line.
const BASELINE_ATTRIBUTE = 'server-baseline-version'

function isGuidesServerBuild (componentName, version) {
  return componentName === COMPONENT && version === VERSION
}

// "4.10" -> 410, so versions compare as numbers.
function versionNum (version) {
  const [major, minor] = String(version).split('.').map(Number)
  return major * 100 + minor
}

module.exports = { COMPONENT, VERSION, DISPLAY_VERSION, BASELINE_ATTRIBUTE, isGuidesServerBuild, versionNum }
