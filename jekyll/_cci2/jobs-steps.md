---
layout: classic-docs
title: "Jobs and Steps"
short-title: "Jobs and Steps"
description: "Description of Jobs and Steps"
categories: [migration]
order: 2
---

*[Basics]({{ site.baseurl }}/2.0/basics/) > Jobs and Steps*

New keys for `jobs:` and `steps:` enable greater control and provide a framework for workflows and status on each phase of a run to report more frequent feedback. The following sections provide an overview of Jobs and Steps, changes to keys from 1.0, new keys that are nested inside Steps, and new keys for Workflows.

* TOC
{:toc}

## Jobs Overview

Jobs are a collection of Steps. All of the steps in the job are executed in a single unit which consumes a CircleCI container from your plan while it's running.

In 2.0 Jobs can be run using the `machine` executor which enables reuse of recently used `machine` executor runs, or the `docker` executor which can compose Docker containers to run your tests and any services they require, such as databases, or the `macos` executor.

When using the `docker` executor the container images listed under the `docker:` keys specify the containers to start and replace the `machine: services:` stanza from 1.0 configuration.  Any public Docker images can be used with the `docker` executor.

See the [Specifying Container Images]({{ site.baseurl }}/2.0/executor-types/) document for more information about `docker` versus `machine` use cases and comparisons.

## Steps Overview

Steps are a collection of executable commands which are run during a job. The `step:` key replaces the 1.0 `compile:`, `test:`, and `deployment:` keys. Within `steps:`, the `checkout:` key is still required and a new key for `run:` enables addition of arbitrary, multi-line shell command scripting.  In addition to the `run:` key, new keys for `save_cache:`, `restore_cache:`,  `deploy:`, `store_artifacts:`, `store_test_results:` and `add_ssh_keys` are nested under Steps.

## Sample Configuration with Sequential Workflow

Following is a sample 2.0 `.circleci/config.yml` file.

{% raw %}
```
version: 2
jobs:
  build:
    working_directory: ~/mern-starter
    # The primary container is an instance of the first list image listed. Your build commands run in this container.
    docker:
      - image: circleci/node:4.8.2
    # The secondary container is an instance of the second listed image which is run in a common network where ports exposed on the primary container are available on localhost.
      - image: mongo:3.4.4
    steps:
      - checkout
      - run:
          name: Update npm
          command: 'sudo npm install -g npm@latest'
      - restore_cache:
          key: dependency-cache-{{ checksum "package.json" }}
      - run:
          name: Install npm wee
          command: npm install
      - save_cache:
          key: dependency-cache-{{ checksum "package.json" }}
          paths:
            - node_modules
  test:
    docker:
      - image: circleci/node:4.8.2
      - image: mongo:3.4.4
    steps:
      - checkout
      - run:
          name: Test
          command: npm test
      - run:
          name: Generate code coverage
          command: './node_modules/.bin/nyc report --reporter=text-lcov'
      - store_artifacts:
          path: test-results.xml
          prefix: tests
      - store_artifacts:
          path: coverage
          prefix: coverage

workflows:
  version: 2
  build_and_test:
    jobs:
      - build
      - test:
          requires:
            - build
          filters:
            branches:
              only: master
```
{% endraw %}
This example shows a sequential workflow with the `test` job configured to run only on the master branch. Refer to the [Workflows]({{ site.baseurl }}/2.0/workflows) document for complete details about orchestrating job runs with parallel, sequential, and manual approval workflows.
