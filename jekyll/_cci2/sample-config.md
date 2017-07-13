---
layout: classic-docs
title: "Sample 2.0 config.yml File"
short-title: "Sample 2.0 config.yml File"
description: "Sample 2.0 config.yml File"
categories: [migration]
order: 2
---

* TOC
{:toc}

The CircleCI 2.0 configuration introduces a new key for `version: 2`. This new key enables you to try 2.0 while continuing to build on 1.0. New keys for `jobs:` and `steps:` enable greater control and provide a framework for workflows and status on each phase of a run to report more frequent feedback.

The following sections provide a sample `.circleci/config.yml` with an overview of Jobs and Steps, changes to keys from 1.0, new keys that are nested inside Steps and new keys for Workflows. 

## Jobs Overview

Jobs are a collection of Steps. In 2.0, the `machine:` key is nested under `jobs:`. The `docker:` and `image:` keys are new and replace the `dependencies:` and `database:` keys in 1.0. This change enables continued use of previously configured `machine` executor runs and adds the ability to reference any public Docker image in your `config.yml` file. 

## Steps Overview

Steps are a collection of executable commands. The `step:` key replaces the 1.0 `compile:`, `test:`, and `deployment:` keys. Within `steps:`, the `checkout:` key is still required and a new key for `run:` enables addition of arbitrary, multi-line shell command scripting.  In addition to the `run:` key, new keys for `save_cache:`, `restore_cache:`,  `deploy:`, `store_artifacts:`, and `store_test_results:` are nested under Steps. 

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
  test:
    docker:
      - image: circleci/node:4.8.2  
      - image: mongo:3.4.4
    steps:
      - checkout
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

## Sample Configuration with Fan-in/Fan-out Workflow
Following is a sample configuration for a Fan-in/Fan-out workflow. Refer to [the complete demo repo on GitHub](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/fan-in-fan-out/.circleci/config.yml) for details.

{% raw %}
```
version: 2.0

jobs:
  checkout_code:
    docker:
      - image: circleci/ruby:2.4-node
      - image: circleci/postgres:9.4.12-alpine
    working_directory: ~/circleci-demo-workflows
    steps:
      - checkout
      - run:
          name: save SHA to a file
          command: echo $CIRCLE_SHA1 > .circle-sha
      - save_cache:
          key: v1-repo-{{ checksum ".circle-sha" }}
          paths:
            - ~/circleci-demo-workflows

  bundle_dependencies:
    docker:
      - image: circleci/ruby:2.4-node
      - image: circleci/postgres:9.4.12-alpine
    working_directory: ~/circleci-demo-workflows
    steps:
      - run:
          name: save SHA to a file
          command: echo $CIRCLE_SHA1 > .circle-sha
      - restore_cache:
          keys:
            - v1-repo-{{ checksum ".circle-sha" }}
      - restore_cache:
          keys:
            - v1-bundle-{{ checksum "Gemfile.lock" }}
      - run: bundle install --path vendor/bundle
      - save_cache:
          key: v1-bundle-{{ checksum "Gemfile.lock" }}
          paths:
            - ~/circleci-demo-workflows/vendor/bundle

  rake_test:
    docker:
      - image: circleci/ruby:2.4-node
      - image: circleci/postgres:9.4.12-alpine
    working_directory: ~/circleci-demo-workflows
    steps:
      - run:
          name: save SHA to a file
          command: echo $CIRCLE_SHA1 > .circle-sha
      - restore_cache:
          keys:
            - v1-repo-{{ checksum ".circle-sha" }}
      - restore_cache:
          keys:
            - v1-bundle-{{ checksum "Gemfile.lock" }}
      - run: bundle --path vendor/bundle
      - run: bundle exec rake db:create db:schema:load
      - run:
          name: Run tests
          command: bundle exec rake

  precompile_assets:
    docker:
      - image: circleci/ruby:2.4-node
      - image: circleci/postgres:9.4.12-alpine
    working_directory: ~/circleci-demo-workflows
    steps:
      - run:
          name: save SHA to a file
          command: echo $CIRCLE_SHA1 > .circle-sha
      - restore_cache:
          keys:
            - v1-repo-{{ checksum ".circle-sha" }}
      - restore_cache:
          keys:
            - v1-bundle-{{ checksum "Gemfile.lock" }}
      - run: bundle --path vendor/bundle
      - run:
          name: Precompile assets
          command: bundle exec rake assets:precompile
      - save_cache:
          key: v1-assets-{{ checksum ".circle-sha" }}
          paths:
            - ~/circleci-demo-workflows/public/assets

  deploy:
    machine:
        enabled: true
    working_directory: ~/circleci-demo-workflows
    environment:
      - HEROKU_APP: still-shelf-38337
    steps:
      - run:
          name: save SHA to a file
          command: echo $CIRCLE_SHA1 > .circle-sha
      - restore_cache:
          keys:
            - v1-repo-{{ checksum ".circle-sha" }}
      - restore_cache:
          keys:
            - v1-bundle-{{ checksum "Gemfile.lock" }}
      - restore_cache:
          keys:
            - v1-assets-{{ checksum ".circle-sha" }}
      - run:
          name: Setup Heroku
          command: bash .circleci/setup-heroku.sh
      - run:
          command: |
            git push heroku fan-in-fan-out:master
            heroku run rake db:migrate
            sleep 5 # sleep for 5 seconds to wait for dynos
            heroku restart
workflows:
  version: 2
  build-and-deploy:
    jobs:
      - checkout_code
      - bundle_dependencies:
          requires:
            - checkout_code
      - rake_test:
          requires:
            - checkout_code
            - bundle_dependencies
      - precompile_assets:
          requires:
            - checkout_code
            - bundle_dependencies
      - deploy:
          requires:
            - checkout_code
            - rake_test
            - precompile_assets
```
{% endraw %}
