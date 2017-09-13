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

The CircleCI 2.0 configuration introduces a new key for `version: 2`. This new key enables you to try 2.0 while continuing to build on 1.0. That is, you can still use 1.0 on some projects while using 2.0 on others. New keys for `jobs:` and `steps:` enable greater control and provide a framework for workflows and status on each phase of a run to report more frequent feedback.

The following sections provide a sample `.circleci/config.yml` with an overview of Jobs and Steps, changes to keys from 1.0, new keys that are nested inside Steps and new keys for Workflows.

## Jobs Overview

Jobs are a collection of Steps. All of the steps in the job are executed in a single unit which consumes a CircleCI container from your plan while it's running.

In 2.0 Jobs can be run using the `machine` executor which enables reuse of recently used `machine` executor runs, or the `docker` executor which can compose Docker containers to run your tests and any services they require, such as databases.

When using the `docker` executor the container images listed under the `docker:` keys specify the containers to start and replace the `machine: services:` stanza from 1.0 configuration.  Any public Docker images can be used with the `docker` executor.

See the [Executor Overview]({{ site.baseurl }}/2.0/executor-types/#machine-executor-overview) for more information about the available executors.

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

## Sample Configuration with Fan-in/Fan-out Workflow
Following is a sample configuration for a Fan-in/Fan-out workflow. Refer to [the complete demo repo on GitHub](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/fan-in-fan-out/.circleci/config.yml) for details.

Note that since a job can only run when its dependencies are satisfied it transitively requires the dependencies of all upstream jobs, this means only the immediate upstream dependencies need to be specified in the `requires:` blocks.

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
            - bundle_dependencies
      - precompile_assets:
          requires:
            - bundle_dependencies
      - deploy:
          requires:
            - rake_test
            - precompile_assets
```
{% endraw %}

## Sample macOS Configuration File

```
# .circleci/config.yml

# Specify the config version - version 2 is latest.
version: 2

# Define the jobs for the current project.
jobs:
  build-and-test:

    # Specify the Xcode version to use.
    macos:
      xcode: "8.3.3"

    # Define the steps required to build the project.
    steps:

      # Get the code from the VCS provider.
      - checkout

      # Download CocoaPods specs via HTTPS (faster than Git)
      # and install CocoaPods.
      - run:
          name: Install CocoaPods
          command: |
            curl https://cocoapods-specs.circleci.com/fetch-cocoapods-repo-from-s3.sh | bash -s cf
            pod install

      # Run tests.
      - run:
          name: Run tests
          command: fastlane scan
          environment:
            SCAN_DEVICE: iPhone 6
            SCAN_SCHEME: WebTests

      # Collect XML test results data to show in the UI,
      # and save the same XML files under test-results folder
      # in the Artifacts tab.
      - store_test_results:
          path: test_output/report.xml
      - store_artifacts:
          path: /tmp/test-results
          destination: scan-test-results
      - store_artifacts:
          path: ~/Library/Logs/scan
          destination: scan-logs

  deploy:
    macos:
      xcode: 8.3.3

    steps:
      - checkout

      # Set up code signing via Fastlane Match.
      - run:
          name: Set up code signing
          command: fastlane match development --readonly

      # Build the release version of the app.
      - run:
          name: Build IPA
          command: fastlane gym

      # Store the IPA file in the build artifacts
      - store_artifacts:
          path: ./MyApp.ipa
          destination: ipa

      # Deploy!
      - run:
          name: Deploy to App Store
          command: fastlane spaceship

workflows:
  version: 2
  build-and-deploy:
    jobs:
      - build-and-test
      - deploy:
          requires:
            - build-and-test
          filters:
            branches:
              only: master

```

## Sample Linux and macOS Configuration File

```version: 2
jobs:
  linux_seed:
    docker:
      - image: circleci/ruby:2.4
    steps:
      - run: uname -a | tee linux.txt
      - persist_to_workspace:
          root: ~/project
          paths:
            - "*.txt"

  xcode_nine:
    macos:
      xcode: "9.0"
    steps:
      - checkout
      - attach_workspace:
          at: workspace
      - run: ruby -v
      - run: uname -a | tee workspace/xcode90.txt
      - run: xcodebuild -version | tee -a workspace/xcode90.txt
      - persist_to_workspace:
          root: workspace
          paths:
            - xcode90.txt
      - run: fastlane scan

  xcode_eight_three_three:
    macos:
      xcode: "8.3.3"
    steps:
      - checkout
      - attach_workspace:
          at: workspace
      - run: uname -a | tee workspace/xcode833.txt
      - run: xcodebuild -version | tee -a workspace/xcode833.txt
      - persist_to_workspace:
          root: workspace
          paths:
            - xcode833.txt
      - run:
          shell: /bin/bash --login -eo pipefail
          command: ruby -v
          name: Show Ruby Version
      - run: fastlane scan

  linux_final:
    docker:
      - image: circleci/ruby:2.4
    steps:
      - attach_workspace:
          at: workspace
      - run: cat workspace/*.txt

workflows:
  version: 2
  build:
    jobs:
      - linux_seed
      - xcode_eight_three_three:
          requires: [linux_seed]
      - xcode_nine:
          requires: [linux_seed]
      - linux_final:
          requires:
            - xcode_nine
            - xcode_eight_three_three
```
