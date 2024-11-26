---
layout: classic-docs
title: "Configuring a macOS application on CircleCI"
description: "First macOS project on CircleCI"
contentTags:
  platform:
  - Cloud
---

This document describes how to get started with CI/CD using a **macOS execution environment** on CircleCI.
If you need to learn the basics of CircleCI, see the [getting started guide]({{site.baseurl }}/getting-started).
You may also want to visit the documentation for [testing and setting up iOS projects]({{ site.baseurl}}/testing-ios/).

## Prerequisites
{: #prerequisites }

To follow along with this document you will need:

- An [account](https://circleci.com/signup/) on CircleCI.
- An Apple computer with XCode installed on it (if you want to open the example project).

## Overview of the macOS executor
{: #overview-of-the-macos-executor }

The macOS execution environment is used for iOS and macOS development, allowing you to test, build, and deploy macOS and iOS applications on CircleCI.
The macOS executor runs jobs in a macOS environment and provides access to iPhone, iPad, Apple Watch and Apple TV simulators.

Before we get to setting up the macOS executor, we will need to setup our example application.

## Example application
{: #example-application }

The example application is a simple mac app. The app runs a 5 minute
timer and contains a single unit test. Real-world applications
will be far more complex. This app simply serves as an introduction to the macOS
execution environment.

In this example app, CircleCI is configured to help with the following:

- Run tests using XCode on the macOS virtual machine whenever we push a change to the repository.
- Create and upload the compiled application as an artifact after tests have run successfully.

You can check out the example application's repo on [GitHub](https://github.com/CircleCI-Public/circleci-demo-macos).

Please note, if you would like to test running the code in the example configuration file (below) yourself, you should either fork, or duplicate the example application from GitHub. The example configuration file is not guaranteed to work on any/all Xcode projects.

## Example configuration file
{: #example-configuration-file }

Our application does not make use of any external tools or dependencies, so we
have a fairly simple `.circleci/config.yml` file. Below, each line is commented
to indicate what is happening at each step.

For a full list of supported Xcode versions, see the [using macOS](/docs/using-macos/#supported-xcode-versions) page.

```yaml
version: 2.1

jobs: # a basic unit of work in a run
  test: # your job name
    macos:
      xcode: 14.2.0 # indicate your selected version of Xcode
    steps: # a series of commands to run
      - checkout  # pull down code from your version control system.
      - run:
          name: Run Unit Tests
          command: xcodebuild test -scheme circleci-demo-macos

  build:
    macos:
      xcode: 14.2.0 # indicate your selected version of Xcode
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
      - store_artifacts: # store this build output. Read more: https://circleci.com/docs/2.0/artifacts/
          path: app.zip
          destination: app

workflows:
  test_build:
    jobs:
      - test
      - build:
          requires:
            - test
```

The example `.circleci/config.yml` above covers the following:

- Specify an [`executor`](/docs/configuration-reference/#macos)
- Pull code using the [`checkout`]({{ site.baseurl }}/configuration-reference/#checkout) key
- Run tests with Xcode
- Build the application
- Compress the application and store it using the [`store_artifacts`]({{
  site.baseurl }}/configuration-reference/#storeartifacts) key.

You can learn more about the `.circleci/config.yml` file in the [Configuration Reference]({{site.baseurl}}/configuration-reference/).


## Next steps
{: #next-steps }

The macOS executor is commonly used for testing and building iOS applications,
which can be more complex in their continuous integration configuration. If you
are interested in building and/or testing iOS applications, consider checking
out our following docs that further explore this topic:

- [Testing iOS Applications on macOS]({{ site.baseurl }}/testing-ios)
- [Setting Up Code Signing for iOS Projects]({{ site.baseurl }}/ios-codesigning)
