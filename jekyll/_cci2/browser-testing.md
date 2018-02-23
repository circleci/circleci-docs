---
layout: classic-docs
title: Browser Testing
description: Browser Testing on CircleCI
category: [test]
---

*[Test]({{ site.baseurl }}/2.0/basics/) > Browser Testing*

This document describes common methods for running browser testing in your CircleCI config in the following sections:

* TOC
{:toc}

## Prerequisites

Refer to the [Pre-Built CircleCI Docker Images]({{ site.baseurl }}/2.0/circleci-images/) and add `-browsers:` to the image name for a variant that includes Java 8, PhantomJS, Firefox, and Chrome.

## Selenium 

Selenium needs to be installed and run since this is not included in the primary image:

```yml
version: 2
jobs:
  build:
    docker:
      - image: circleci/node-browsers
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
```


## Chrome Headless



## chromium, firefox, webdriver, geckodriver etc (include unsupported browsers - Safari, Edge, IE)



## phantomjs



## Sauce Labs
This section provides an example of how to run Selenium WebDriver tests with Sauce Labs on CircleCI after deploying to a publicly accessible staging environment.

The following example `.circleci/config.yml` file uses a primary image that has the current stable version of Chrome pre-installed (this is designated by the `-browsers` suffix). 

```yml
version: 2
jobs:
  build:
    docker:
      - image: circleci/node-browsers
    steps:
      - checkout
      - run: mkdir test-reports
      - run:
          name: sauce testing
          command: npm run-script sauce
          environment:
            SAUCE_USERNAME: # ?
            SAUCE_ACCESS_KEY: # ?
```


