/**
 * AsciiDoc extension: links that exist on Cloud only.
 *
 * The `cloudlink` macro renders a link to the CircleCI web app on Cloud and
 * plain text on Server, since Server has no fixed hostname. See the "Links to
 * the web app" section of cloud-and-server-content.adoc for usage.
 *
 * To support a new destination, add an entry to DESTINATIONS.
 */

const { isGuidesServerBuild } = require('./lib/guides-server')

const BASE_URL = 'https://app.circleci.com'

// `text` is used when the macro has no link text.
const DESTINATIONS = {
  webapp: { path: '', text: 'CircleCI web app' },
  'user-settings': { path: '/settings/user', text: 'User Settings' },
  'personal-api-tokens': { path: '/settings/user/tokens', text: 'Personal API Tokens' },
  'job-ssh-keys': { path: '/settings/user/job-ssh-keys', text: 'Job SSH Keys' },
  'plan-usage': { path: '/settings/plan/usage', text: 'Plan Usage' },
  projects: { path: '/projects', text: 'Projects' },
}

function render (document, name, text, pathAttr, window) {
  const dest = name === 'path' ? { path: `/${String(pathAttr || '').replace(/^\//, '')}`, text: '' } : DESTINATIONS[name]
  if (!dest) throw new Error(`cloudlink: unknown destination "${name}". Known: ${Object.keys(DESTINATIONS).join(', ')}, path`)
  const label = text || dest.text
  if (!label) throw new Error(`cloudlink:${name}[] needs link text`)
  if (isGuidesServerBuild(document.getAttribute('page-component-name'), document.getAttribute('page-component-version'))) return label
  const escaped = label.replace(/\]/g, '\\]')
  if (window) return `link:${BASE_URL}${dest.path}["${escaped.replace(/"/g, '\\"')}",window=${window}]`
  return `link:${BASE_URL}${dest.path}[${escaped}]`
}

module.exports.register = function register (registry) {
  registry.inlineMacro('cloudlink', function () {
    const self = this
    self.process((parent, target, attrs) => {
      const text = attrs.$positional && attrs.$positional[0]
      return self.createInlinePass(parent, render(parent.getDocument(), target, text, attrs.path, attrs.window))
    })
  })
}

module.exports._test = { render, DESTINATIONS }
