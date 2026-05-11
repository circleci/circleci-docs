'use strict'
const { series, watch } = require('gulp')
const buildUI = require('./build-ui')
const reloadBrowser = require('./reload-browser')
const buildSite = require('./build-site')
const uiSrcGlob = 'ui/src/**/*'

module.exports = function watchUI() {
  // return the watcher to signal async (never-ending) task
  return watch(uiSrcGlob, series(buildUI, buildSite, reloadBrowser))
}
