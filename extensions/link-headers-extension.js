'use strict'

const File = require('vinyl')

/**
 * An Antora extension that generates Link header configuration artifacts.
 *
 * This site is served via CloudFront over S3. S3 website hosting does not
 * support arbitrary HTTP response headers, so Link headers (RFC 8288) must be
 * added at the CDN layer. This extension generates two build artifacts:
 *
 *   1. link-headers.json — a machine-readable description of the desired
 *      Link relations, along with their recommended HTTP header values.
 *
 *   2. cloudfront-link-headers-function.js — a CloudFront Function that
 *      adds the Link headers on viewer responses. Deploy it to the docs
 *      CloudFront distribution with the "viewer response" event.
 *
 * Deploy the CloudFront function:
 *
 *   aws cloudfront create-function \
 *     --name docs-link-headers \
 *     --function-config '{"Comment":"Add RFC 8288 Link headers","Runtime":"cloudfront-js-2.0"}' \
 *     --function-code fileb://build/cloudfront-link-headers-function.js
 *
 * Set SKIP_LINK_HEADERS=true to disable generation (e.g. for faster local builds).
 */
module.exports.register = function () {
  const logger = this.getLogger('link-headers-generator')

  this.once('beforePublish', ({ playbook, siteCatalog }) => {
    if (process.env.SKIP_LINK_HEADERS === 'true') {
      logger.info('Skipping link-headers generation (SKIP_LINK_HEADERS=true)')
      return
    }

    try {
      logger.info('Generating link-headers artifacts...')
      const siteUrl = playbook.site.url.replace(/\/+$/, '')
      const links = buildLinks(siteUrl)

      siteCatalog.addFile(new File({
        contents: Buffer.from(JSON.stringify(buildConfig(siteUrl, links), null, 2)),
        mediaType: 'application/json',
        out: { path: 'link-headers.json' },
        path: 'link-headers.json',
        pub: { url: '/link-headers.json', rootPath: '' },
        src: { stem: 'link-headers' },
      }))

      siteCatalog.addFile(new File({
        contents: Buffer.from(buildCloudFrontFunction(links)),
        mediaType: 'application/javascript',
        out: { path: 'cloudfront-link-headers-function.js' },
        path: 'cloudfront-link-headers-function.js',
        pub: { url: '/cloudfront-link-headers-function.js', rootPath: '' },
        src: { stem: 'cloudfront-link-headers-function' },
      }))

      logger.info('Successfully generated link-headers artifacts')
    } catch (err) {
      logger.error(`Error generating link-headers artifacts: ${err.message}`)
    }
  })
}

/**
 * The Link relations this docs site wants to advertise via HTTP response headers.
 *
 * Relation types are from the IANA Link Relations registry:
 * https://www.iana.org/assignments/link-relations/link-relations.xhtml
 *
 * - describedby: a document that describes the semantics of the context resource
 * - service-doc: service documentation, primarily for human readers
 * - service-desc: machine-readable service description (OpenAPI, AsyncAPI, etc.)
 */
function buildLinks (siteUrl) {
  return [
    {
      href: `${siteUrl}/llms.txt`,
      rel: 'describedby',
      type: 'text/plain',
      title: 'LLM-optimized documentation index',
    },
    {
      href: `${siteUrl}/AGENTS.md`,
      rel: 'describedby',
      type: 'text/markdown',
      title: 'AI agent instructions for using CircleCI',
    },
    {
      href: `${siteUrl}/api/v2/`,
      rel: 'service-doc',
      title: 'CircleCI API v2 Reference',
    },
    {
      href: `${siteUrl}/api/v3/`,
      rel: 'service-doc',
      title: 'CircleCI API v3 Reference',
    },
  ]
}

function linkToHeaderValue (link) {
  let value = `<${link.href}>; rel="${link.rel}"`
  if (link.type) value += `; type="${link.type}"`
  if (link.title) value += `; title="${link.title}"`
  return value
}

function buildConfig (siteUrl, links) {
  return {
    description: [
      'RFC 8288 Link relations for HTTP response headers.',
      'Configure your CDN (e.g. CloudFront) to return these Link headers on all',
      'responses from this site. The cloudfront-link-headers-function.js file in',
      'this same directory is a ready-to-deploy CloudFront Function that does this.',
    ].join(' '),
    spec: 'https://www.rfc-editor.org/rfc/rfc8288',
    siteUrl,
    links: links.map((link) => ({
      ...link,
      headerValue: linkToHeaderValue(link),
    })),
    combinedHeaderValue: links.map(linkToHeaderValue).join(', '),
  }
}

function buildCloudFrontFunction (links) {
  const headerValues = links.map((link) => `    '${linkToHeaderValue(link)}'`).join(',\n')
  return `// CloudFront Function — add RFC 8288 Link headers for agent discoverability.
// Deploy to the docs CloudFront distribution, viewer response event.
// Runtime: cloudfront-js-2.0
//
// See link-headers.json for the full configuration and context.
// Spec: https://www.rfc-editor.org/rfc/rfc8288
function handler(event) {
  var response = event.response;
  var headers = response.headers;

  // Append individual Link headers so other origins can also contribute links.
  var linkValues = [
${headerValues}
  ];

  if (headers['link']) {
    headers['link'].value += ', ' + linkValues.join(', ');
  } else {
    headers['link'] = { value: linkValues.join(', ') };
  }

  return response;
}
`
}
