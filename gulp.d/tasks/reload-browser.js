'use strict'
const browserSync = require('../lib/browser')
module.exports = function reloadBrowser(cb) {
  browserSync.reload()
  cb()
}
