'use strict'

const fs = require('fs')
const path = require('path')
const File = require('vinyl')

const SOURCE_PATH = path.join(__dirname, '..', 'docs', 'agent-guide.md')

/**
 * An Antora extension that publishes docs/agent-guide.md verbatim as
 * /AGENTS.md at the site root, following the emerging convention (see
 * https://agents.md) of AI coding agents checking a well-known path for
 * project or site instructions.
 *
 * Hooks into `beforePublish` to add the file directly to the siteCatalog as
 * a Vinyl file, the same way llms-txt-generator-extension.js publishes
 * llms.txt — no intermediate filesystem writes or post-build copy steps.
 *
 * This is a separate file from the repo's own root AGENTS.md, which holds
 * instructions for people and agents writing docs content in this repo.
 * docs/agent-guide.md is instructions for agents and humans using the
 * CircleCI product, published for consumption on the live site.
 *
 * Set SKIP_AGENTS_MD=true to disable generation (e.g. for faster local builds).
 */
module.exports.register = function () {
  const logger = this.getLogger('agents-md-generator')

  this.once('beforePublish', ({ siteCatalog }) => {
    if (process.env.SKIP_AGENTS_MD === 'true') {
      logger.info('Skipping AGENTS.md generation (SKIP_AGENTS_MD=true)')
      return
    }

    try {
      logger.info('Generating AGENTS.md...')
      const contents = fs.readFileSync(SOURCE_PATH)

      siteCatalog.addFile(new File({
        contents,
        mediaType: 'text/markdown',
        out: { path: 'AGENTS.md' },
        path: 'AGENTS.md',
        pub: { url: '/AGENTS.md', rootPath: '' },
        src: { stem: 'AGENTS' },
      }))

      logger.info('Successfully generated AGENTS.md')
    } catch (err) {
      // Never break the build — log and continue
      logger.error(`Error generating AGENTS.md: ${err.message}`)
    }
  })
}
