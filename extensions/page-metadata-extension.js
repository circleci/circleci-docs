'use strict'
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const readingTime = require('reading-time')

// add helper to convert date to “time ago”

let metadata = {}

module.exports.register = function () {
  // load existing metadata file unless CLEAN_LAST_UPDATE_METADATA is set
  const metaFile = path.resolve(__dirname, '.temp/last-update-meta.json')
  if (!process.env.CLEAN_LAST_UPDATE_METADATA && fs.existsSync(metaFile)) {
    try {
      metadata = JSON.parse(fs.readFileSync(metaFile, 'utf8'))
      console.log(`Loaded existing metadata (${Object.keys(metadata).length} entries) from ${metaFile}`)
    } catch (err) {
      console.warn(`Could not parse ${metaFile}, starting with fresh metadata`)
      metadata = {}
    }
  }

  this.on('documentsConverted', ({ contentCatalog }) => {
    contentCatalog.getComponents().forEach(({ versions }) => {
      versions.forEach(({ name: component, version }) => {
        const pages = contentCatalog
          .findBy({ component, version, family: 'page' })

        pages.forEach((page) => {
          let { abspath, origin, path } = page.src
          const { branch, startPath, webUrl } = origin
          const index = abspath?.indexOf('docs/')
          const pagePath = abspath ? (index > -1 ? abspath.substring(index) : abspath ) :  startPath + '/' + path

          const key = `${component}:${version}:${page.path}`

          if (metadata[key]) {
            // reuse existing data
            const { commitUrl, lastUpdate: rawLastUpdate, readingTime: rt } = metadata[key]
            page.asciidoc.attributes['meta'] = {
              commitUrl,
              lastUpdate: rawLastUpdate,
              readingTime: rt
            }
          } else {
            // fetch via git and store
            const command = `git log -1 --format="%H %cd" --date=iso ${branch} -- "${pagePath}"`
            const gitOutput = execSync(command).toString().trim().split(' ')
            const commitHash = gitOutput.shift()
            const commitUrl = `${webUrl}/commit/${commitHash}`
            const lastUpdate = gitOutput.join(' ')
            const content = page.contents
            const readingTimeEstimate = readingTime(content)
            page.asciidoc.attributes = page.asciidoc.attributes || {}
            page.asciidoc.attributes['meta'] = {
              commitUrl,
              lastUpdate: lastUpdate,
              readingTime: readingTimeEstimate.text
            }
            metadata[key] = {
              branch,
              commitUrl,
              lastUpdate,
              readingTime: readingTimeEstimate.text
            }
          }
        })

        console.log(`Found ${pages.length} pages for ${component} ${version}`)
      })
    })

    // after all components/pages are processed, write metadata file
    const tempDir = path.resolve(__dirname, '.temp')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir)
    }
    const out = path.join(tempDir, 'last-update-meta.json')
    fs.writeFileSync(out, JSON.stringify(metadata, null, 2))
    console.log(`Wrote page metadata to ${out}`)
  })
}
