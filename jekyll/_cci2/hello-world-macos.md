---
layout: classic-docs
title: "Hello World On macOS"
short-title: "Hello World On MacOS"
description: "First macOS project on CircleCI 2.0"
categories: [getting-started]
order: 4
version:
- Cloud
---

This document describes how to get started with continuous integration on
**macOS build environments** on CircleCI. If you still need to get acquainted
with CircleCI, it is recommended to checkout the [getting started
guide]({{site.baseurl }}/2.0/getting-started). You may also wish to visit the
documentation for [testing iOS]({{ site.baseurl}}/2.0/testing-ios/) and [an
example iOS project]({{ site.baseurl }}/2.0/ios-tutorial/).

## Prerequisites
{: #prerequisites }

To follow along with this document you will need:

- An [account](https://circleci.com/signup/) on CircleCI.
- A subscription to a [paid plan](https://circleci.com/pricing/#build-os-x) to enable building on the macOS executor.
- An Apple computer with XCode installed on it (if you want to open the example project).

## Overview of the macOS executor
{: #overview-of-the-macos-executor }

The macOS build environment (or `executor`) is used for iOS and macOS
development, allowing you to test, build, and deploy macOS and iOS applications on
CircleCI. The macOS executor runs jobs in a macOS environment and provides access to iPhone, iPad, Apple Watch and Apple TV simulators.

Before we get to setting up the macOS executor, we will need to setup our example application.

## Example application
{: #example-application }

The example application is a simple mac app - it runs a 5 minute
timer and contains a single unit test (real-world applications
will be far more complex; this app simply serves as an introduction to the macOS
build environment).

As a user getting to know the macOS build environment, our ideal scenario is for CircleCI to help with the following:

- Run tests using XCode on the macOS VM whenever we push code.
- Create and upload the compiled application as an artifact after tests have run successfully.

You can checkout the example application's repo on
[GitHub](https://github.com/CircleCI-Public/circleci-demo-macos).

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
      xcode: 11.3.0 # indicate our selected version of Xcode
    steps: # a series of commands to run
      - checkout  # pull down code from your version control system.
      - run:
          name: Run Unit Tests
          command: xcodebuild test -scheme circleci-demo-macos

  build: 
    macos:
      xcode: 11.3.0 # indicate our selected version of Xcode
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
  version: 2
  test_build:
    jobs:
      - test
      - build:
        requires:
          test
```

If this is your first exposure to a CircleCI `config.yml`, some of the above
might seem a bit confusing. In the section below you can find some links that
provide a more in-depth overview of how a `config.yml` works.

Since this is a general introduction to building on MacOs, the `config.yml` above example covers the following:

- Picking an [`executor`]({{ site.baseurl }}/2.0/configuration-reference/#docker) to use
- Pulling code via the [`checkout`]({{ site.baseurl }}/2.0/configuration-reference/#checkout) key
- Running tests with Xcode
- Building our application
- Compressing our application and storing it with the [`store_artifacts`]({{
  site.baseurl }}/2.0/configuration-reference/#store_artifacts) key.

You can learn more about the `config.yml` file in the [configuration reference guide]({{site.baseurl}}/2.0/configuration-reference/).

## Xcode Cross Compilation
{: #xcode-cross-compilation }

### Universal Binaries
{: #universal-binaries } Xcode currently supports the creation of universal
binaries which can be run on both `x86_64` and `ARM64` CPU architectures without
needing to ship separate executables. This is supported only under Xcode 12.2+
although older Xcode versions can still be used to compile separate `x86_64` and
`ARM64` executables.

### Extracting Unwanted Architectures
{: #extracting-unwanted-architectures }

Xcode 12.2+ will by default create universal binaries, compiling to a single
executable that supports both `x86_64` and `ARM64` based CPUs. If you need to remove
an instruction set, you can do so by using the `lipo` utility.

Assuming that we are interested in creating a standalone x86_64 binary from a
universal binary called `circleci-demo-macos`, we can do so by running the
command:

```sh
lipo -extract x86_64 circleci-demo-macos.app/Contents/MacOS/circleci-demo-macos -output circleci-demo-macos-x86_64
```

We can then confirm the supported architecture of the extracted binary with
`lipo -info circleci-demo-macos-x86_64` which will output the following

```sh
Architectures in the fat file: circleci-demo-macos-x86_64 are: x86_64
```


### Cross Compiled Binaries
{: #cross-compiled-binaries }

While universal binaries are only supported under Xcode 12.2+, you can still
cross compile binaries for architectures other than the architecture of the
machine being used to build the binary. For xcodebuild the process is relatively
straightforward. To build ARM64 binaries, prepend the `xcodebuild` command with
`ARCHS=ARM64 ONLY_ACTIVE_ARCH=NO` such that it reads `xcodebuild ARCHS=ARM64
ONLY_ACTIVE_ARCH=NO ...`. For the `x86_64` architecture simply change `ARCHS` to
`x86_64`.

## Next steps
{: #next-steps }

The macOS executor is commonly used for testing and building iOS applications,
which can be more complex in their continuous integration configuration. If you
are interested in building and/or testing iOS applications, consider checking
out our following docs that further explore this topic:

- [Testing iOS Applications on macOS]({{ site.baseurl }}/2.0/testing-ios)
- [iOS Project Tutorial]({{ site.baseurl }}/2.0/ios-tutorial)
- [Setting Up Code Signing for iOS Projects]({{ site.baseurl }}/2.0/ios-codesigning)

Also, consider reading documentation on some of CircleCI's features:

- See the [Concepts]({{ site.baseurl }}/2.0/concepts/) document for a summary of 2.0 configuration and the hierarchy of top-level keys in a `.circleci/config.yml` file.
- Refer to the [Workflows]({{ site.baseurl }}/2.0/workflows) document for examples of orchestrating job runs with concurrent, sequential, scheduled, and manual approval workflows.
- Find complete reference information for all keys and pre-built Docker images in the [Configuring CircleCI]({{ site.baseurl }}/2.0/configuration-reference/) and [CircleCI Images]({{ site.baseurl }}/2.0/circleci-images/) documentation, respectively.
