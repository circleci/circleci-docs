/**
 * This script creates a temporary JSON to run synthetics for a preview branch's
 * S3-hosted docs preview site. The Datadog CLI supports only JSON arguments for
 * the tests. However, we can make use of a Datadog feature that allows us to
 * create variables with default values that may be overriden as we do here.
 *
 * This way me subsitute the JEKYLL_BASENAME and like at build time much as we
 * do in elsewhere in the CI config.
 */

const fs = require('fs');
const path = require('path');
const template = require('../.datadog/development.synthetics.json');

for (const test of template.tests) {
  test.config = {
    variables: {
      JEKYLL_BASENAME: process.env.CIRCLE_BRANCH, // same as how JEKYLL_BASENAME is derived for *-preview branches in config
      HOST_URL:
        'http://circleci-doc-preview.s3-website-us-east-1.amazonaws.com',
    },
  };
}

fs.writeFileSync(
  path.resolve(__dirname, '../.datadog/preview.synthetics.json'),
  JSON.stringify(template),
);
