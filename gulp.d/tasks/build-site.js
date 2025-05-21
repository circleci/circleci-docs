'use strict'
const { exec } = require('child_process')
const antoraPlaybook = 'antora-playbook.yml'

const resolvedPath =  require.resolve('../../extensions/page-metadata-extension');
const resolvedPathExportExtension = require.resolve('../../extensions/export-content-extension');
console.log('Resolved path:', resolvedPath);

module.exports = function buildSite(cb) {
  console.log('Starting Antora build...')
  exec(`npx antora ${antoraPlaybook} --log-failure-level=warn --extension ${resolvedPath} --extension ${resolvedPathExportExtension}`, (err, stdout, stderr) => {
    console.log(stdout)
    if (stderr) console.error(stderr)
    if (err) return cb(err)
    cb()
  })
}
