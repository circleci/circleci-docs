'use strict'

const { series } = require('gulp')
const buildSite = require('./build-site')
const serveSite = require('./serve-site')
const watchDocs = require('./watch-docs')

module.exports = series(buildSite, serveSite, watchDocs)
