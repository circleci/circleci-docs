---
layout: classic-docs
title: Test with Sauce Labs
description: How to test Sauce Labs on CircleCI
---

This document provides an example of how to run Selenium WebDriver tests with Sauce Labs on CircleCI after deploying to a publicly accessible staging environment.

The following example `.circleci/config.yml` file uses a primary image that has the current stable version of Chrome pre-installed (this is designated by the `-browsers` suffix). Selenium needs to be installed and run since this is not included in the primary image:

```yml
version: 2
jobs:
  build:
    docker:
      - image: circleci/python:3.6.2-stretch-browsers
    steps:
      - checkout
      - run: mkdir test-reports
      - run:
          name: Download Selenium
          command: |
            curl -O http://selenium-release.storage.googleapis.com/3.5/selenium-server-standalone-3.5.3.jar
      - run:
          name: Start Selenium
          command: |
            java -jar selenium-server-standalone-3.5.3.jar -log test-reports/selenium.log
          background: true
      - run:
          name: sauce testing
          command: npm run-script sauce
          environment:
            SAUCE_USERNAME: # ?
            SAUCE_ACCESS_KEY: # ?
```


