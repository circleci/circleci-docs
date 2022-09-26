---
layout: classic-docs
title: "Configuring a macOS application on CircleCI"
description: "First macOS project on CircleCI"
contentTags: 
  platform:
  - Cloud
---

This document describes how to get started with continuous integration on
**macOS execution environments** on CircleCI. If you still need to get acquainted
with CircleCI, it is recommended to checkout the [getting started
guide]({{site.baseurl }}/getting-started). You may also wish to visit the
documentation for [testing iOS]({{ site.baseurl}}/testing-ios/) and [an
example iOS project]({{ site.baseurl }}/ios-tutorial/).

## Prerequisites
{: #prerequisites }

To follow along with this document you will need:

- An [account](https://circleci.com/signup/) on CircleCI.
- An Apple computer with XCode installed on it (if you want to open the example project).

## Overview of the macOS executor
{: #overview-of-the-macos-executor }

The macOS execution environment (or `executor`) is used for iOS and macOS
development, allowing you to test, build, and deploy macOS and iOS applications on
CircleCI. The macOS executor runs jobs in a macOS environment and provides access to iPhone, iPad, Apple Watch and Apple TV simulators.

Before we get to setting up the macOS executor, we will need to setup our example application.

## Example application
{: #example-application }

The example application is a simple mac app. The app runs a 5 minute
timer and contains a single unit test (real-world applications
will be far more complex. This app simply serves as an introduction to the macOS
execution environment).

As a user getting to know the macOS execution environment, our ideal scenario is for CircleCI to help with the following:

- Run tests using XCode on the macOS VM whenever we push code.
- Create and upload the compiled application as an artifact after tests have run successfully.

You can check out the example application's repo on [GitHub](https://github.com/CircleCI-Public/circleci-demo-macos).

Please note, if you would like to test running the code in the example configuration file (below) yourself, you should either fork, or duplicate the example application from GitHub. The example configuration file is not guaranteed to work on any/all Xcode projects.

## Example configuration file
{: #example-configuration-file }

Our application does not make use of any external tools or dependencies, so we
have a fairly simple `.circleci/config.yml` file. Below, each line is commented
to indicate what is happening at each step.

```yaml
version: 2.1

jobs: # a basic unit of work in a run
  test: # your job name
    macos:
      xcode: 12.5.1 # indicate your selected version of Xcode
    steps: # a series of commands to run
      - checkout  # pull down code from your version control system.
      - run:
          name: Run Unit Tests
          command: xcodebuild test -scheme circleci-demo-macos

  build:
    macos:
      xcode: 12.5.1 # indicate your selected version of Xcode
    steps:
      - checkout
      - run:
          # build our application
          name: Build Application
          command: xcodebuild
      - run:
          # compress Xcode's build output so that it can be stored as an artifact
          name: Compress app for storage
          command: zip -r app.zip build/Release/circleci-demo-macos.app
      - store_artifacts: # store this build output. Read more: https://circleci.com/docs/artifacts/
          path: app.zip
          destination: app

workflows:
  test_build:
    jobs:
      - test
      - build:
        requires: # sequence the build job to run after test
          test
```

The example `.circleci/config.yml` above covers the following:

- Picking an [`executor`]({{ site.baseurl }}/configuration-reference/#docker) to use
- Pulling code via the [`checkout`]({{ site.baseurl }}/configuration-reference/#checkout) key
- Running tests with Xcode
- Building our application
- Compressing our application and storing it with the [`store_artifacts`]({{
  site.baseurl }}/configuration-reference/#store_artifacts) key.

You can learn more about the `.circleci/config.yml` file in the [Configuration Reference]({{site.baseurl}}/configuration-reference/).


## Next steps
{: #next-steps }

The macOS executor is commonly used for testing and building iOS applications,
which can be more complex in their continuous integration configuration. If you
are interested in building and/or testing iOS applications, consider checking
out our following docs that further explore this topic:

- [Testing iOS Applications on macOS]({{ site.baseurl }}/testing-ios)
- [iOS Project Tutorial]({{ site.baseurl }}/ios-tutorial)
- [Setting Up Code Signing for iOS Projects]({{ site.baseurl }}/ios-codesigning)
