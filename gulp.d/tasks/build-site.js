'use strict'
const { exec } = require('child_process')
require('@dotenvx/dotenvx').config()
const antoraPlaybook = 'antora-playbook.yml'
const buildApiDocs = require('./build-api-docs')

const resolvedPath =  require.resolve('../../extensions/page-metadata-extension');
const resolvedPathExportExtension = require.resolve('../../extensions/export-content-extension');
console.log('Resolved path:', resolvedPath);

module.exports = function buildSite(cb) {
  console.log('Starting Antora build...')
  exec(`npx antora ${antoraPlaybook} --log-failure-level=warn --extension ${resolvedPath} --extension ${resolvedPathExportExtension} --key segment_write=${process.env.SEGMENT_WRITE_KEY || null} ${process.env.COOKIEBOT ? `--key cookiebot=${process.env.COOKIEBOT}` : ''}`, (err, stdout, stderr) => {
    console.log(stdout)
    if (stderr) console.error(stderr)
    if (err) return cb(err)

    // After Antora build succeeds, build API docs
    console.log('Antora build completed, now building API docs...')
    buildApiDocs((apiErr) => {
      if (apiErr) {
        console.error('API docs build failed, but continuing...')
        console.error(apiErr)
      }
      cb()
    })
  })
}
