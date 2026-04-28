'use strict'

module.exports.register = function() {
  const logger = this.getLogger('smarter-testing-checksum-update-extension')

  this.on('beforeProcess', async ({ siteAsciiDocConfig }) => {
    logger.info("Setting AsciiDoc attributes for Smarter Testing")

    const releaseUrl = "https://circleci-binary-releases.s3.amazonaws.com/circleci-cli-plugins/circleci-testsuite/latest/release.json"

    logger.debug({ releaseDataURL: releaseUrl }, 'Fetching Smarter Testing release data')
    const response = await fetch(releaseUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch ${releaseUrl}: ${response.status}`)
    }

    const releaseData = await response.json()
    logger.debug({ releaseData: releaseData }, 'Got Smarter Testing Release data')

    const binaries = releaseData.binaries.reduce(
      (acc, {arch, sys, sha256}) => {
        if (sha256.length <= 0) {
          throw new Error(`Found invalid sha256 value for sys:"${sys}", arch:"${arch}" in ${releaseUrl}`)
        }
        logger.debug({ sys: sys, arch: arch, sha256: sha256}, 'Found Smarter Testing binary')
        if (acc[sys] === undefined) {
          acc[sys] = {}
        }
        acc[sys][arch] = sha256
        return acc
      },
      {}
    )

    logger.debug({ binaries: binaries }, 'Mapped release data')

    const checksumFor = (sys, arch) => {
      const val = binaries?.[sys]?.[arch]
      if (val === null || val === undefined) {
        throw new Error(`No Smarter Testing plugin release data for sys:"${sys}", arch:"${arch}"`)
      }

      return val
    }

    const version = releaseData.version
    if (version === null || version === undefined) {
      throw new Error(`No version field in Smarter Testing plugin release data`)
    }
    siteAsciiDocConfig.attributes['testsuite-version'] = version

    for (const [sys, archs] of Object.entries({"darwin": ["arm64", "amd64"],
                                               "linux": ["amd64", "arm", "arm64"],
                                               "windows": ["amd64"]})) {
      for (const arch of archs) {
        siteAsciiDocConfig.attributes[`testsuite-sha-${sys}-${arch}`] = checksumFor(sys, arch)
      }
    }

    logger.info("Successfully set AsciiDoc attributes for Smarter Testing")
  })
}
