'use strict'

const camelCase = (name) => name.replace(/[-]./g, (m) => m.slice(1).toUpperCase())

module.exports = require('require-directory')(module, __dirname, { recurse: false, rename: camelCase })
