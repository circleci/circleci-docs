---
layout: classic-docs
title: "Migrating Your iOS Project From 1.0 to 2.0"
short-title: "Migrating your iOS project from 1.0 to 2.0"
description: "How to migrate your iOS project from CircleCI 1.0 to 2.0"
categories: [migration]
hide: true
order: 16
---

This document will give you the guidelines for migrating your iOS
project from CircleCI 1.0 to 2.0.

* TOC
{:toc}

## Overview

With the release of CircleCI 2.0 for macOS, your iOS projects can now
benefit from the improvements in the CircleCI 2.0 platform, including:

* [Workflows](https://circleci.com/docs/2.0/workflows/): Orchestrate
  jobs and steps with great flexibility using a simple set of new keys
  in your configuration. Increase the development speed through faster
  feedback, shorter reruns, and more efficient use of resources.

* [Advanced caching](https://circleci.com/docs/2.0/caching/): Speed up
  builds by caching files from run to run using keys that are easy to
  control with granular caching options for cache save and restore
  points throughout your jobs. Cache any files from run to run using
  keys you can control.

## Example 2.0 iOS Project Configuration

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

## Best Practices

To ensure a consistent build experience, it is best practice to add a
Gemfile and set up code signing with the help of Fastlane Match
before you push a 2.0 `.circle/config.yml` file to your CircleCI iOS
project.

### Gemfile

We suggest that you add a Gemfile to your iOS project if you don't have
one already. Checking in a Gemfile and using Bundler to install and run
gems ensures that recent versions of Fastlane and CocoaPods are
available in your build.

Following is a sample Gemfile:

```
# Gemfile

source 'https://rubygems.org'
gem 'fastlane'
gem 'cocoapods'
```

### Setting up Code Signing With Fastlane Match

CircleCI 2.0 does not support automated code signing, use Fastlane Match to manage code signing certificates in your iOS projects.

It is best to set up code signing after you have a successful `build` job
in your iOS project on CircleCI.

Check out the Fastlane Match [getting started guide](https://codesigning.guide/)
for the exact steps for setting up a Match repo and storing your
certificates in it.

After your certificates are uploaded, grant CircleCI
permissions to access your certificates repo on GitHub by going to your CircleCI Project Settings -> Checkout SSH Keys -> Add
User Key -> Authorize with GitHub.

*Warning*: Please bear in mind that adding a user key will allow
CircleCI access to _all_ of your private repos.

After you have configured the User Key in the project settings, CircleCI
will be able to fetch the certificates from GitHub.

## Creating the 2.0 Configuration File

The following sections provide examples of 2.0 configuration syntax for an iOS project.

### Job Name and Xcode Version

In the 2.0 `.circleci/config.yml` file the first few lines specify the
name of the job and the Xcode version to use:

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

### Build Steps Key

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
**Note:** Docker support is not available in the macOS builds.

### Checking out the project code

One of the first items under `steps` will be the code checkout step:

```
jobs:
  build-and-test:
    steps:
      - checkout
```

### Caching Ruby Gems Installed With Bundler

In CircleCI 2.0, cache save and cache restore are based on a _cache
key_. Here is how you can cache the Ruby gems based on the content of
`Gemfile.lock`:

{% raw %}
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
            # which CircleCI will later cache.
            BUNDLE_PATH: vendor/bundle
      - save_cache:
          key: v1-gems-{{ checksum "Gemfile.lock" }}
          paths:
            - vendor/bundle
```
{% endraw %}

Every time your Gemfile.lock changes, a new cache will be created.
Please check out [this doc]({{ site.baseurl }}/2.0/caching/) for
more information about cache keys and other available key options
beyond `checksum`.

### Running Tests

It is possible to use [Fastlane
Scan](https://github.com/fastlane/fastlane/tree/master/scan) to run your
tests as follows:

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

### Storing Artifacts, Test Results, and Diagnostic Files

CircleCI 2.0 does not automatically collect artifacts in your builds,
so if your build is generating files that you would like to access with
the CircleCI application later on, you must explicitly collect those
files with the `store_artifacts` step.

To view XML test results in the CircleCI application, add a
`store_test_results` step in your `.circleci/config.yml` file.

To save logs as artifacts, use the `store_artifacts` step as shown in
the following example:

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

Find more details about these steps in the
[Artifacts doc]({{ site.baseurl}}/2.0/artifacts/) and the
[Test Metadata doc]({{ site.baseurl}}/2.0/collect-test-data/).

### Deployment via Workflows

With the availability of Workflows in 2.0, it is best practice to
extract all the commands related to the deployment of the app into
its own job:

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

The previous example deployment job specifies an Xcode version, adds
command to produce the release version, stores it as an artifact, and
submits it to the App Store.

The following snippet adds a Workflows section to the
`.circleci/config.yml` file to specify the conditions that run the
deployment job:

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

In the previous example, CircleCI runs the `build-and-test` job on every
push to the repository, and the deploy job will only run on the master
branch after the `build-and-test` job has finished and is successful.

Refer to the [Orchestrating Workflows doc]({{ site.baseurl }}/2.0/workflows/)
for more examples of using Workflows.
