---
layout: classic-docs
title: Test with Sauce Labs
categories: [how-to]
last_updated: April 26, 2016
description: How to test Sauce Labs on Circleci
sitemap: false
---

You can run Selenium WebDriver tests with Sauce Labs on CircleCI using Sauce Labs'
secure tunnel, [Sauce Connect](https://wiki.saucelabs.com/display/DOCS/Sauce+Connect+Proxy).
Sauce Connect allows you to run a test server within the CircleCI build container
and expose it (using a URL like `localhost:8080`) to Sauce Labs' browsers. If you
run your browser tests after deploying to a publicly accessible staging environment,
then you can use Sauce Labs in the usual way without worrying about Sauce Connect.

This example `circle.yml` file demonstrates how to run browser tests through Sauce Labs
against a test server running within a CircleCI build container.

```yml
dependencies:
  post:
    - wget https://saucelabs.com/downloads/sc-latest-linux.tar.gz
    - tar -xzf sc-latest-linux.tar.gz

test:
  override:
    - cd sc-*-linux && ./bin/sc --user $SAUCE_USERNAME --api-key $SAUCE_ACCESS_KEY --readyfile ~/sauce_is_ready:
        background: true
    # Wait for tunnel to be ready
    - while [ ! -e ~/sauce_is_ready ]; do sleep 1; done
    - python -m hello.hello_app:
        background: true
    # Wait for app to be ready
    - wget --retry-connrefused --no-check-certificate -T 30 http://localhost:5000
    # Run selenium tests
    - nosetests
  post:
    - killall --wait sc  # wait for Sauce Connect to close the tunnel
```

To see the complete example project that goes along with this example, see
[circleci/sauce-connect](https://github.com/circleci/sauce-connect)
on GitHub.
