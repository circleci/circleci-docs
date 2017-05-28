---
layout: classic-docs
title: "Sample 2.0 `config.yml` File"
short-title: "Sample 2.0 `config.yml` File"
description: "Sample 2.0 `config.yml` File"
categories: [migration]
order: 2
---

The CircleCI 2.0 configuration introduces a new key for `version: 2`. This new key enables you to try 2.0 while continuing to build on 1.0. New keys for `jobs:` and `steps:` enable greater control and provide a framework for status on each phase of a run to report more frequent feedback.

The following sections provide a sample `.circleci/config.yml` with an overview of Jobs and Steps, changes to keys from 1.0, and new keys that are nested inside Steps. 

## Jobs Overview

Jobs are a collection of Steps. In 2.0, the `machine:` key is nested under `jobs:`. The `docker:` and `image:` keys are new and replace the `dependencies:` and `database:` keys in 1.0. This change enables continued use of previously configured `machine` executor runs and adds the ability to reference any public Docker image in your `config.yml` file. 

## Steps Overview

Steps are a collection of executable commands. The `step:` key replaces the 1.0 `compile:`, `test:`, and `deployment:` keys. Within `steps:`, the `checkout:` key is still required and a new key for `run:` enables addition of arbitrary, multi-line shell command scripting.  In addition to the `run:` key, new keys for `save_cache:`, `restore_cache:`,  `deploy:`, `store_artifacts:`, and `store_test_results:` are nested under Steps. 

Following is a sample 2.0 `.circleci/config.yml` file. 

{% raw %}
```
version: 2
jobs:
  build:
    working_directory: ~/mern-starter
    docker:
      - image: circleci/node:4.8.2
      - image: mongo:3.4.4
    steps:
      - checkout
      - run:
          name: update-npm
          command: 'sudo npm install -g npm@latest'
      - restore_cache:
          key: dependency-cache-{{ checksum "package.json" }}
      - run:
          name: install-npm-wee
          command: npm install
      - save_cache:
          key: dependency-cache-{{ checksum "package.json" }}
          paths:
            - .node_modules
      - run:
          name: test
          command: npm test
      - run:
          name: code-coverage
          command: './node_modules/.bin/nyc report --reporter=text-lcov'
      - store_artifacts:
          path: test-results.xml
          prefix: tests
      - store_artifacts:
          path: coverage
          prefix: coverage
      - store_test_results:
          path: test-results.xml
```
{% endraw %}
