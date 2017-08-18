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
        version: 8.3.3

    # Define the steps required to build the project.
    steps:

      # Get the code from the VCS provider.
      - checkout

      # Restore all cached files.
      - restore_cache:
          keys:
          - v1-gems-{{ checksum "Gemfile.lock" }}
          # Fall back to using the latest cache if no exact match is found.
          - v1-gems-

      # Install dependencies.
      - run:
          name: Bundle install
          command: bundle check || bundle install
          environment:
            BUNDLE_JOBS: 4
            BUNDLE_RETRY: 3
            BUNDLE_PATH: vendor/bundle

      - save_cache:
          key: v1-gems-{{ checksum "Gemfile.lock" }}
          paths:
            - vendor/bundle

      - run:
          name: Install CocoaPods
          command: bundle exec pod install

      # Run tests.
      - run:
          name: Run tests
          command: bundle exec fastlane scan
          environment:
            SCAN_DEVICE: iPhone 6
            SCAN_SCHEME: WebTests

      # Collect XML test results data to show in the UI,
      # and save the same XML files under test-results folder
      # in the Artifacts tab.
      - store_test_results:
          path: test_output/report.junit
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
      # Set up code signing via Fastlane Match.
      - run:
          name: Set up code signing
          command: fastlane match development --readonly

      # Build the release version of the app.
      - run:
          name: Build IPA
          command: bundle exec fastlane gym

      # Deploy!
      - run:
          name: Deploy to App Store
          command: bundle exec fastlane spaceship

workflows:
  version: 2
  build-and-deploy:
    jobs:
      - build-and-test
      - deploy:
          filters:
            branches:
              only: master
```

## Steps to configure an iOS project on 2.0

### Gemfile

We suggest that you add a Gemfile to your iOS project if you don't have
one yet. This will ensure that the correct versions of Fastlane and
CocoaPods are used in your project on CircleCI.

A sample Gemfile could look like this:

```
# Gemfile

source 'https://rubygems.org'
gem 'fastlane'
gem 'cocoapods'
```

### Credentials for code signing via Fastlane Match

It is best to set up code signing once you have a successful `build` job
in your iOS project on CircleCI.

Check out the Fastlane Match [getting started guide](https://github.com/fastlane/fastlane/tree/master/match#usage)
for the exact steps for setting up a Match repo and storing your
certificates in it.

Once your certificates are uploaded, you'll need to grant CircleCI
permissions to access your certificates repo on GitHub. You can do that
by going to your CircleCI Project Settings -> Checkout SSH Keys -> Add
User Key -> Authorize with GitHub.

Please mind that this will allow CircleCI access to _all_ of your
private repos.

Once you have configured the User Key in the project settings, CircleCI
will be able to fetch the certificates from GitHub.

### Copying your build commands to the 2.0 config file


