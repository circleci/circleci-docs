'use strict'
const { series, parallel } = require('gulp')
const buildUI = require('./build-ui')
const buildSite = require('./build-site')
const serveSite = require('./serve-site')
const watchDocs = require('./watch-docs')
const watchUI = require('./watch-ui')

module.exports = series(
  buildUI,
  buildSite,
  serveSite,
  parallel(watchDocs, watchUI)
)
