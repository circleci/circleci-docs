---
layout: classic-docs
title: iOS Project Tutorial
short-title: iOS Project Tutorial
categories: [platforms]
description: Setting Up iOS applications on CircleCI 2.0
order: 20
---

This document describes how to automate builds, testing, and deployment of an iOS application project with CircleCI in the following sections:

* TOC
{:toc}

## Overview
{:.no_toc}

The following sections walk through how to write Jobs and Steps that use `xcodebuild` for this application, how to set up code signing and a provisioning profile in the CircleCI environment, and how to deploy with Fastlane.

## Prerequisites
{:.no_toc}

- Add your project to CircleCI, see [Hello World]( {{ site.baseurl }}/2.0/hello-world/).
- This tutorial assumes you have an Xcode workspace for your project with at least one shared scheme and that the selected scheme has a test action. If you do not already have a shared scheme, you can add this in Xcode by completing the following steps:

1. Open your Xcode workspace or project.
2. Use the scheme selector to open the Manage Schemes dialogue box as shown in the following image.
![Xcode Scheme Selector](  {{ site.baseurl }}/assets/img/docs/ios-getting-started-scheme-selector.png)
3. In the manage schemes dialog, select the scheme you wish to build, and ensure that the Shared checkbox is enabled.
![Manage Schemes Dialogue](  {{ site.baseurl }}/assets/img/docs/ios-getting-started-manage-schemes.png)
4. Commit and push the schemes.

## Running Tests

For iOS projects, it is possible to run your tests with Fastlane Scan as follows:

```
jobs:
  build-and-test:
    macos:
      xcode: "9.3.0"
    steps:
      ...
      - run:
          name: Run tests
          command: fastlane scan
          environment:
            SCAN_DEVICE: iPhone 6
            SCAN_SCHEME: WebTests

```

Refer to [the Xcode version section]({{ site.baseurl }}/2.0/testing-ios/#supported-xcode-versions) of the iOS testing document for the complete list of supported versions.

## Code Signing and Certificates

Refer to [the code signing doc]({{ site.baseurl }}/2.0/ios-codesigning/) for details.

To further customize your build process to use custom tools or run your own scripts, use the `config.yml` file, see the [Sample 2.0 config.yml]( {{ site.baseurl }}/2.0/sample-config/) document for customizations.

## Installing Dependencies

To install dependencies from homebrew, for example, use a `run` step with the appropriate command:

```
    steps:
      - run:
          name: Install Homebrew Dependencies
          command: brew install yarn
      - run:
          name: Install Node Dependencies
          command: yarn install
```

## Running Tests

The `run` step is also used to run your tests as in the following example of the short form `run` syntax:

```
    steps:
      - run: fastlane scan
```

### Deployment
{:.no_toc}

To deploy your application with CircleCI using [Gym](https://github.com/fastlane/fastlane/tree/master/gym) and [Deliver](https://github.com/fastlane/fastlane/tree/master/deliver) from [Fastlane](https://fastlane.tools) specify an identifier, a branch or pattern that the release should run on, and a set of commands to run the release.

```
version: 2
jobs:
  test:
    macos:
      xcode: "9.3.0"
    steps:
      - checkout
      - run: fastlane scan
  deploy:
    macos:
      xcode: "9.3.0"
    steps:
      - checkout
      - deploy:
          name: Deploy
          command: fastlane release_appstore

workflows:
  version: 2
  test_release:
    jobs:
      - test
      - deploy:
          requires:
            test
          filters:
            branches:
              only: release
```

## Advanced Configuration

See the [Testing iOS Applications on macOS](https://circleci.com/docs/2.0/testing-ios/) document for more
advanced details on configuring iOS projects.

## Example Application on GitHub

See the [`circleci-demo-ios` GitHub repository](https://github.com/CircleCI-Public/circleci-demo-ios)
for an example of how to build, test and sign an iOS project using
Fastlane on CircleCI 2.0.
