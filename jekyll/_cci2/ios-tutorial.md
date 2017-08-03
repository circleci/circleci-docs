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
- Enable macOS for your project by going to the Project Settings > Build Environment page of the CircleCI app and enabling the Build OS X project setting. ![Build Environment Settings](  {{ site.baseurl }}/assets/img/docs/ios-getting-started-build-env.png)
- This tutorial assumes you have an Xcode workspace for your project with at least one shared scheme and that the selected scheme has a test action. If you do not already have a shared scheme, you can add this in Xcode by completing the following steps:

1. Open your Xcode workspace or project. 
2. Use the scheme selector to open the Manage Schemes dialogue box as shown in the following image.
![Xcode Scheme Selector](  {{ site.baseurl }}/assets/img/docs/ios-getting-started-scheme-selector.png)
3. In the manage schemes dialog, select the scheme you wish to build, and ensure that the Shared checkbox is enabled.
![Manage Schemes Dialogue](  {{ site.baseurl }}/assets/img/docs/ios-getting-started-manage-schemes.png)
4. Commit and push the schemes.

## Build Phases

In this tutorial, builds are divided into dependencies, test, and deployment. The dependencies phase is for installing any Ruby Gems, CocoaPods, Node Modules or other packages required to build the application. The test phase is for building and testing your project.

For iOS projects, CircleCI generates a command to build and test your project using the `xcodebuild` command line tool. The generated command is similar to:

```
set -o pipefail &&
  xcodebuild
    CODE_SIGNING_REQUIRED=NO
    CODE_SIGN_IDENTITY=
    PROVISIONING_PROFILE=
    -sdk iphonesimulator
    -destination 'platform=iOS Simulator,OS=9.0,name=iPhone 6'
    -workspace MyWorkspace.xcworkspace
    -scheme "My Scheme"
    clean build test |
      tee $CIRCLE_ARTIFACTS/xcode_raw.log |
      xcpretty --color --report junit --output $CIRCLE_TEST_REPORTS/xcode/results.xml
```

If your project uses React Native, CircleCI automatically runs the `test` script phase from your `package.json`.

## Code Signing

It is possible for CircleCI to automatically inject your code signing certificates and unlock the keychain for your build. To use this automated code signing support for your iOS app, perform the following steps:

1. Export your certificates (p12) by opening the Keychain Access.app, and selecting My Certificates in the left menu.
![Keychain Access.app with the keychain that contains the keys, and My Certificates selected](  {{ site.baseurl }}/assets/img/docs/ios-getting-started-keychain-access-my-certificates.png)
A certificate with **iPhone Developer:** or **iPhone Distribution:** appears.

2. Click the certificate, then select File > Export Items from the macOS menu bar ensuring that the file format is Personal Information Exchange (.p12). 
![The Keychain Access.app file menu with Export Items in a hover state](  {{ site.baseurl }}/assets/img/docs/ios-getting-started-keychain-file-menu.png)
If the option is not available, check that you selected the private key when you selected the certificate.
![The Keychain Access.app Export dialogue](  {{ site.baseurl }}/assets/img/docs/ios-getting-started-keychain-export-dialogue.png)

3. It is best practice to enter a certificate export password when it is requested. 

## Adding your certificate

1. Go to your project page in the CircleCI app, and click the Settings icon.

2. Click the Code Signing link in the Permissions section.
![The CircleCI Project Settings, iOS Code Signing page](  {{ site.baseurl }}/assets/img/docs/ios-getting-started-cci-code-signing-menu.png)

3. Click the Upload Key button and enter the details for your certificate, including the password you used when exporting the .p12, the `.p12` file you want to upload and click the Upload button.
![The CircleCI Certificate Details](  {{ site.baseurl }}/assets/img/docs/ios-getting-started-cci-certificate-details.png)

The uploaded p12 certificates will be installed into `circle.keychain` as part of your build setup. The password for this keychain is `circle`, and it is unlocked for the duration of the build. This keychain is also added to the Xcode search path, so any credentials stored here will be available to Xcode.

## Using A Provisioning Profile

To use your provisioning profile with your CircleCI builds, upload the `.mobileprovision` file on the Project Settings > OS X Code Signing page. Provisioning profiles are automatically added to the `circle.keychain` at the start of the build.

To further customize your build process to use custom tools or run your own scripts, use the `config.yml` file, see the [Sample 2.0 config.yml]( {{ site.baseurl }}/2.0/sample-config/) document for customizations.

If you want to pin your build to either an older version of Xcode or a version in beta, it is possible to do so by configuring a `machine` section in your `circle.yml`.

To do so, add a `machine` key to the document with a nested Xcode and version section:

```
jobs:
  build:
    machine:
      enabled: true
      xcode:
        version: 8.0
```

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
