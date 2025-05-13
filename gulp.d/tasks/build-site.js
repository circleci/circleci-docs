'use strict'
const { exec } = require('child_process')
const antoraPlaybook = 'antora-playbook.yml'

module.exports = function buildSite(cb) {
  console.log('Starting Antora build...')
  exec(`npx antora ${antoraPlaybook} --log-failure-level=warn`, (err, stdout, stderr) => {
    console.log(stdout)
    if (stderr) console.error(stderr)
    if (err) return cb(err)
    cb()
  })
}
