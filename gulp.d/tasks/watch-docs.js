'use strict'
const { series, watch } = require('gulp')
const buildSite = require('./build-site')
const reloadBrowser = require('./reload-browser')
const antoraPlaybook = 'antora-playbook.yml'

module.exports = function watchDocs() {
  // return the watcher to signal async (never-ending) task
  return watch(
    ['docs/**/*.adoc', 'docs/**/antora.yml', antoraPlaybook],
    series(buildSite, reloadBrowser)
  )
}
