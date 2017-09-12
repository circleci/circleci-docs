---
layout: classic-docs
title: iOS Project Tutorial
short-title: iOS Project Tutorial
categories: [migration]
description: Setting Up iOS applications on CircleCI
order: 70
---

This document describes how to automate builds, testing, and deployment of an iOS application project with CircleCI in the following sections:

* TOC
{:toc}

## Overview

The following sections walk through how to write Jobs and Steps that use `xcodebuild` for this application, how to set up code signing and a provisioning profile in the CircleCI environment, and how to deploy with Fastlane.

## Prerequisites

- Add your project to CircleCI, see [Hello World]( {{ site.baseurl }}/2.0/hello-world/)
- This tutorial assumes you have an Xcode workspace for your project with at least one shared scheme and that the selected scheme has a test action. If you do not already have a shared scheme, you can add this in Xcode by completing the following steps:

1. Open your Xcode workspace or project. 
2. Use the scheme selector to open the Manage Schemes dialogue box as shown in the following image.
![Xcode Scheme Selector](  {{ site.baseurl }}/assets/img/docs/ios-getting-started-scheme-selector.png)
3. In the manage schemes dialog, select the scheme you wish to build, and ensure that the Shared checkbox is enabled.
![Manage Schemes Dialogue](  {{ site.baseurl }}/assets/img/docs/ios-getting-started-manage-schemes.png)
4. Commit and push the schemes.

## Build Phases

In this tutorial, builds are divided into dependencies, test, and deployment. The dependencies phase is for installing any Ruby Gems, CocoaPods, Node Modules or other packages required to build the application. The test phase is for building and testing your project.

For iOS projects, it is possible to run your tests with Fastlane Scan as follows:

```
jobs:
  build-and-test:
    steps:
      ...
      - run:
          name: Run tests
          command: bundle exec fastlane scan
          environment:
            SCAN_DEVICE: iPhone 6
            SCAN_SCHEME: WebTests

```

## Code Signing and Certificates

Refer to <https://codesigning.guide/> for details.

## Using A Provisioning Profile

To use your provisioning profile with your CircleCI builds, upload the `.mobileprovision` file on the Project Settings > OS X Code Signing page. Provisioning profiles are automatically added to the `circle.keychain` at the start of the build.

To further customize your build process to use custom tools or run your own scripts, use the `config.yml` file, see the [Sample 2.0 config.yml]( {{ site.baseurl }}/2.0/sample-config/) document for customizations.

## Installing Dependencies

To install dependencies from homebrew, for example, use a `run` step with the appropriate command:

```
    steps:
      - run:
          name: homebrew dependencies
          command: |
            - brew install kylef/formulae/swiftenv
            - swiftenv install 3.0
```

## Running Tests

The `run` step is also used to run your tests as in the following example of the short form `run` syntax:

```
    steps:
      - run: swift test
```

### Deployment

To deploy your application with CircleCI using [Gym](https://github.com/fastlane/fastlane/tree/master/gym) and [Deliver](https://github.com/fastlane/fastlane/tree/master/deliver) from [Fastlane](https://fastlane.tools) specify an identifier, a branch or pattern that the release should run on, and a set of commands to run the release.

```
version: 2
jobs:
  test:
    machine:
      enabled: true
      xcode:
        version: 8.0
    steps:
      - run: swift test
  deploy:
    steps:
      - deploy:
          name: Maybe Deploy
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
