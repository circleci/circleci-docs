---
layout: classic-docs
title: iOS Project Tutorial
short-title: iOS Project Tutorial
categories: [platforms]
description: Setting Up iOS applications on CircleCI
order: 20
contentTags: 
  platform:
  - Cloud
---

This document describes build automation, testing, and deployment of an iOS application project with CircleCI. There are also pages covering [testing iOS]({{site.baseurl}}/testing-ios/) and [getting started on MacOS]({{site.baseurl}}/hello-world-macos/).

## Overview
{: #overview }

The following sections walk through how to write jobs that use `xcodebuild`, how to set up code signing and a provisioning profile in the CircleCI environment, and how to deploy with Fastlane.

## Prerequisites
{: #prerequisites }

* Add your project to CircleCI. See [Creating a Project in CircleCI]({{site.baseurl}}/create-project/).
* This tutorial assumes you have an Xcode workspace for your project with at least one shared scheme and that the selected scheme has a test action. 

If you do not already have a shared scheme, you can add this in Xcode by completing the following steps:

1. Open your Xcode workspace or project.
2. Use the scheme selector to open the Manage Schemes dialogue box:
![Xcode Scheme Selector]({{site.baseurl}}/assets/img/docs/ios-getting-started-scheme-selector.png)
3. In the Manage Schemes dialog, select the scheme you wish to build, and ensure that the **Shared** checkbox is enabled:
![Manage Schemes Dialogue]({{site.baseurl}}/assets/img/docs/ios-getting-started-manage-schemes.png)
4. Commit and push the schemes.

## Run tests
{: #run-tests }

For iOS projects, it is possible to run your tests with Fastlane Scan as follows:

```yml
jobs:
  build-and-test:
    macos:
      xcode: 12.5.1
    steps:
      ...
      - run:
          name: Run tests
          command: fastlane scan
          environment:
            SCAN_DEVICE: iPhone 6
            SCAN_SCHEME: WebTests
```

Refer to [the Xcode version section]({{site.baseurl}}/using-macos/#supported-xcode-versions) of the iOS testing document for the complete list of supported versions.

## Code signing and certificates
{: #code-signing-and-certificates }

Refer to [the code signing doc]({{site.baseurl}}/ios-codesigning/) for details.

To further customize your build process to use custom tools or run your own scripts, use the `config.yml` file, see the [Sample 2.0 config.yml]( {{ site.baseurl }}/sample-config/) document for customizations.

## Installing dependencies
{: #installing-dependencies }

To install dependencies from homebrew, for example, use a `run` step with the appropriate command:

```yml
    steps:
      - run:
          name: Install Homebrew Dependencies
          command: brew install yarn
      - run:
          name: Install Node Dependencies
          command: yarn install
```

### Deployment
{: #deployment }

To deploy your application with CircleCI using [Gym](https://github.com/fastlane/fastlane/tree/master/gym) and [Deliver](https://github.com/fastlane/fastlane/tree/master/deliver) from [Fastlane](https://fastlane.tools), specify an identifier, a branch or pattern that the release should run on, and a set of commands to run the release.

```yml
version: 2.1
jobs:
  test:
    macos:
      xcode: 12.5.1
    steps:
      - checkout
      - run: fastlane scan
  deploy:
    macos:
      xcode: 12.5.1
    steps:
      - checkout
      - run:
          name: Deploy
          command: fastlane release_appstore

workflows:
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

## Advanced configuration
{: #advanced-configuration }

See the [Testing iOS Applications on macOS]({{site.baseurl}}/testing-ios/) document for more
advanced details on configuring iOS projects.

## Example application on GitHub
{: #example-application-on-github }

See the [`circleci-demo-ios` GitHub repository](https://github.com/CircleCI-Public/circleci-demo-ios)
for an example of how to build, test and sign an iOS project using
Fastlane on CircleCI.
