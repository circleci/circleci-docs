---
layout: classic-docs
title: "Hello World On macOS"
short-title: "Hello World On MacOS"
description: "First macOS project on CircleCI"
categories: [getting-started]
order: 4
version:
- Cloud
---

This document describes how to get started with continuous integration on
**macOS execution environments** on CircleCI. If you still need to get acquainted
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

The macOS execution environment (or `executor`) is used for iOS and macOS
development, allowing you to test, build, and deploy macOS and iOS applications on
CircleCI. The macOS executor runs jobs in a macOS environment and provides access to iPhone, iPad, Apple Watch and Apple TV simulators.

Before we get to setting up the macOS executor, we will need to setup our example application.

## Example application
{: #example-application }

The example application is a simple mac app - it runs a 5 minute
timer and contains a single unit test (real-world applications
will be far more complex; this app simply serves as an introduction to the macOS
execution environment).

As a user getting to know the macOS execution environment, our ideal scenario is for CircleCI to help with the following:

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
{: #universal-binaries }

Xcode currently supports the creation of universal
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


## Dedicated Hosts for macOS
{: #dedicated-hosts-macos }

The dedicated host resource class is a new macOS option for those developing, building, testing, and signing iOS, iPadOS, macOS, WatchOS, and tvOS applications using the Xcode IDE. These dedicated resources provide an isolated environment for increased security.

This resource class requires a 24-hour minimum lease and runs on Intel-based Mac hardware.

The identifier for the dedicated host resource is metal and supports the following Xcode images:

- Xcode 13.0.0
- Xcode 12.5.1
- Xcode 12.4.0
- Xcode 12.3.0
- Xcode 12.2.0

### Pricing and specs

Once a dedicated host has been allocated, you have exclusive access to it for a minimum of 24 hours. If the dedicated host is already in use when a job is kicked off, an additional dedicated host is reserved (with its own 24 hour lease window).

Each account can currently have a maximum of three concurrent dedicated hosts. Any time over the initial 24 hours that a dedicated host is in use will be charged a per-minute overage rate (see table below for pricing details).

| Resource Class Name  | vCPU  | Memory  | Storage  | Cost  |
|---|---|---|---|---|
| `metal`  | 12  | 32 GB  | 200 GB  | 100 credits per minute (24-hour minimum)  |
{: class="table table-striped"}

### Known limitations

- The resource class does not currently support test splitting or parallelism.
- The host gets cleaned between jobs, which can take 5-45 minutes currently.

### Example configuration file using macOS dedicated host resources

```yaml
# .circleci/config.yml
version: 2.1
jobs: 
  build-and-test: 
    macos:
      xcode: 12.5.1 # indicate our selected version of Xcode
    resource_class: metal # dedicated host, with 24-hour billing
    steps: 
      - checkout  
      - run: bundle install
      - run:
          name: Fastlane
          command: bundle exec fastlane $FASTLANE_LANE
      - store_artifacts:
          path: output
      - store_test_results:
          path: output/scan
          
workflows:
  build-test:
    jobs:
      - build-and-test
```

### FAQ

- Is there an Apple Silicon option for dedicated hosts?
  - There are plans to support Apple Silicon hardware in the future, but the option is not available at this time.
- Why is there a 24-hour minimum?
  - Apple released an [updated end-user license agreement (EULA)](https://www.apple.com/legal/sla/docs/macOSBigSur.pdf) along with the release of Big Sur in November 2020, which requires cloud providers to lease Apple hardware to no more than one customer for a minimum of 24 hours.
- How does a dedicated host differ from the other macOS resources on CircleCI?
  - CircleCI's other macOS resources are run on isolated virtual machines, which means that multiple customers can be using VMs on the same host. Dedicated hosts provide exclusive access to an entire host, without worrying about sharing resources with other customers.

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
