'use strict'
const browserSync = require('../lib/browser')
const outputDir = 'build'

module.exports = function serveSite(cb) {
  browserSync.init({ server: { baseDir: outputDir }, port: 3000, notify: true })
  cb()
}
