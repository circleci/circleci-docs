---
layout: classic-docs
title: Test with Sauce Labs
categories: [how-to]
last_updated: July 28, 2014
description: How to test Sauce Labs on Circleci
---

You can run Selenium WebDriver tests with Sauce Labs on CircleCI using Sauce Labs'
secure tunnel, [Sauce Connect](https://docs.saucelabs.com/reference/sauce-connect/).
Sauce Connect allows you to run a test server within the CircleCI build container
and expose it it (using a URL like `localhost:8080`) to Sauce Labs' browsers. If you
run your browser tests after deploying to a publicly accessible staging environment,
then you can use Sauce Labs in the usual way without worrying about Sauce Connect.

This example `circle.yml` file demonstrates how to run browser tests through Sauce Labs
against a test server running within a CircleCI build container.

```
dependencies:
  post:
    - wget https://saucelabs.com/downloads/sc-latest-linux.tar.gz
    - tar -xzf sc-latest-linux.tar.gz

test:
  override:
    - cd sc-*-linux && ./bin/sc -u $SAUCE_USERNAME -k $SAUCE_ACCESS_KEY:
        background: true
    - python -m hello.hello_app:
        background: true
    - sleep 60
    - nosetests
```

To see the complete example project that goes along with this example, see
[circleci/sauce-connect](https://github.com/circleci/sauce-connect)
on GitHub.
