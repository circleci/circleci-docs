---
layout: classic-docs
title: "Migrating your iOS project from 1.0 to 2.0"
short-title: "Migrating your iOS project from 1.0 to 2.0"
description: "How to migrate your iOS project from CircleCI 1.0 to 2.0"
categories: [migration]
order: 16
---

This document will give you the guidelines for migrating your iOS
project from CircleCI 1.0 to 2.0.

## Overview

With the release of CircleCI 2.0 for macOS, your iOS projects can now
benefit from the improvements in our 2.0 platform, including:

* Workflows: Orchestrate jobs and steps with great flexibility using a
  simple set of new keys in your configuration.

* Advanced caching: Speed up builds by caching files from run to run
  using keys that are easy to control with granular caching options for
  cache save and restore points throughout your jobs. Cache any files
  from run to run using keys you can control.

## Full example of the configuration

This sample configuration file should work for most iOS projects on
CircleCI 2.0:

```
# .circleci/config.yml

# Specify the config version - version 2 is latest.
version: 2

# Define the jobs for the current project.
jobs:
  build-and-test:

    # Specify the Xcode version to use.
    macos:
      xcode:
        version: "8.3.3"

    # Define the steps required to build the project.
    steps:

      # Get the code from the VCS provider.
      - checkout

      # Install CocoaPods.
      - run:
          name: Install CocoaPods
          command: pod install

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
      xcode:
        version: 8.3.3

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

## Before you begin

To ensure a consistent build experience, we recommend adding a Gemfile
and setting up code signing with the help of Fastlane Match before you
push a 2.0 config to your CircleCI iOS project.

### Gemfile

We suggest that you add a Gemfile to your iOS project if you don't have
one already. This will ensure that recent versions of Fastlane and
CocoaPods are available in your build.

A sample Gemfile could look like this:

```
# Gemfile

source 'https://rubygems.org'
gem 'fastlane'
gem 'cocoapods'
```

### Credentials for code signing via Fastlane Match

For 2.0 we don't support automated code signing, and instead we recommend
using Fastlane Match to manage code signing certificates in your iOS projects.

It is best to set up code signing once you have a successful `build` job
in your iOS project on CircleCI.

Check out the Fastlane Match [getting started guide](https://codesigning.guide/)
for the exact steps for setting up a Match repo and storing your
certificates in it.

Once your certificates are uploaded, you'll need to grant CircleCI
permissions to access your certificates repo on GitHub. You can do that
by going to your CircleCI Project Settings -> Checkout SSH Keys -> Add
User Key -> Authorize with GitHub.

Please bear in mind that this will allow CircleCI access to _all_ of
your private repos.

Once you have configured the User Key in the project settings, CircleCI
will be able to fetch the certificates from GitHub.

## Copying your build commands to the 2.0 config file

### Job name and Xcode version

In the 2.0 config file the first few lines specify the name of the job
we will be running for you, and the Xcode version to use:

```
version: 2
jobs:
  build-and-test:
    macos:
      xcode:
        version: "8.3.3"
...
  deploy:
    macos:
      xcode:
        version: 8.3.3
...
```

### Build steps key

The top-level `steps` key contains all the build steps that will be run
for a particular job:

```
jobs:
  build-and-test:
    steps:
      - ...
      - ...
```

You can see all the available step types in [this doc]({{ site.baseurl }}/2.0/configuration-reference/).
Please mind that not all build steps might be available in the macOS
builds.

### Checking out the project code

One of the first items under `steps` will be the code checkout step:

```
jobs:
  build-and-test:
    steps:
      - checkout
```

### Caching Ruby gems installed via Bundler

In CircleCI 2.0, cache save and cache restore are based on a _cache
key_. Here is how you can cache the Ruby gems based on the content of
`Gemfile.lock`:

```
jobs:
  build-and-deploy:
    steps:
      ...
      - restore_cache:
          keys:
          - v1-gems-{{ checksum "Gemfile.lock" }}
          # Fall back to using the latest cache if no exact match is found.
          - v1-gems-
      # Install gems.
      - run:
          name: Bundle install
          command: bundle check || bundle install
          environment:
            BUNDLE_JOBS: 4
            BUNDLE_RETRY: 3
            # This is the path where all the gems will be installed, and
            # which we will later cache.
            BUNDLE_PATH: vendor/bundle
      - save_cache:
          key: v1-gems-{{ checksum "Gemfile.lock" }}
          paths:
            - vendor/bundle
```

Every time your Gemfile.lock changes, a new cache will be created.
Please check out [this doc]({{ site.baseurl }}/2.0/caching/) for
more information about cache keys and other available key options
beyond `checksum`.

### Running tests

We recommend using Fastlane Scan to run your tests:

```
jobs:
  build-and-deploy:
    steps:
      ...
      - run:
          name: Run tests
          command: bundle exec fastlane scan
          environment:
            SCAN_DEVICE: iPhone 6
            SCAN_SCHEME: WebTests
```

You can replace the `bundle exec fastlane scan` command with your custom
test command, and change the environment variables passed into it. If
your test command spans multiple lines, you can include multiple
commands in a single step:

```
jobs:
  build-and-deploy:
    steps:
      ...
      - run:
          name: Run tests
          command: |
            make build
            make test
```

### Storing artifacts, test results and diagnostic files

In 2.0 we don't automatically collect artifacts in your builds anymore,
so if your build is generating files that you would like to access via
the UI later on, you'll need to explicitly collect those files via the
`store_artifacts` step.

The same is true for the XML test results: for us to be able to show
them in the UI, you'll need to add a `store_test_results` step into your
config.

If you would like to save any kind of logs into the artifacts, you'll
need to add that to the config too, for example like this:

```
jobs:
  build-and-deploy:
    steps:
      ...
      - store_test_results:
          path: test_output/report.junit
      - store_artifacts:
          path: /tmp/test-results
          # Destination is the name of the item in the Artifacts tab
          # that will contain the paths specified in this step.
          destination: scan-test-results
      - store_artifacts:
          path: ~/Library/Logs/scan
          destination: scan-logs
```

You will find more details about these steps in the
[Artifacts doc]({{ site.baseurl}}/2.0/artifacts/) and the
[Test Metadata doc]({{ site.baseurl}}/2.0/collect-test-data/).

### Deployment via Workflows

With the availability of Workflows in 2.0, we suggest extracting all the
commands related to the deployment of the app into its own job:

```
jobs:
  ...
  deploy:
    macos:
      xcode:
        version: 8.3.3

    steps:
      - checkout

      # Set up code signing via Fastlane Match.
      - run:
          name: Set up code signing
          command: fastlane match development --readonly

      # Build the release version of the app.
      - run:
          name: Build IPA
          command: bundle exec fastlane gym

      # Store the IPA file in the build artifacts
      - store_artifacts:
          path: ./MyApp.ipa
          destination: ipa

      # Deploy!
      - run:
          name: Deploy to App Store
          command: bundle exec fastlane spaceship
```

In the deployment job we also specify an Xcode version, and then add the
commands that will produce the release version of the app, store it in
the artifacts, and submit it to App Store.

We will also need to add a Workflows section into the config to specify
the conditions when we should run a deployment step:

```
version: 2
jobs:
...
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

In this example, we're going to run the `build-and-test` job on every
push to the repository, and the `deploy` job will only run on `master`
branch once the `build-and-test` job has finished and is successful.

Please check out [this doc]({{ site.baseurl }}/2.0/workflows/) for more
examples of using Workflows.
