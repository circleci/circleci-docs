---
layout: classic-docs
title: Setting Up iOS Applications on CircleCI
short-title: Setting Up iOS applications on CircleCI
categories: [configuration-tasks]
description: Setting Up iOS applications on CircleCI
order: 70
sitemap: false
---

To get your build running on CircleCI, you first need to [add your project to CircleCI](https://circleci.com/projects){:rel="nofollow"}. Once you’ve done this, GitHub/Bitbucket will start notifying us of changes to your repository so we can perform builds.

By default, we build projects on Linux, so you’ll need to enable macOS for your project. You can do this by going to **Project Settings** -> **Build Environment** and enabling the **Build OS X Project** setting.

![Build Environment Settings](  {{ site.baseurl }}/assets/img/docs/ios-getting-started-build-env.png)

## Assumptions and prerequisites

For our inference to test your Xcode project, we check for and validate the presence of:

- an Xcode workspace/project
- with at least one shared scheme
- and that the selected scheme has a test action

If none of these are present, then we will not infer any Xcode related `test` commands for your project.

### Sharing Schemes

If you don't already have a shared scheme, you can do this in Xcode.

First, open your Xcode workspace or project. Then, use the scheme selector to open the **Manage Schemes** dialogue.

![Xcode Scheme Selector](  {{ site.baseurl }}/assets/img/docs/ios-getting-started-scheme-selector.png)

In the manage schemes dialog, select the scheme you wish to build, and ensure that the **Shared** checkbox is enabled.

![Manage Schemes Dialogue](  {{ site.baseurl }}/assets/img/docs/ios-getting-started-manage-schemes.png)

Finally, commit and push the schemes.

## Builds

Builds are broken up into three main phases: **Dependencies**, **Test**, and **Deployment**.

### Dependencies

This phase is for installing any [Ruby Gems](https://rubygems.org), [CocoaPods](https://cocoapods.org), [Node Modules](https://npmjs.org), and/or other packages your build needs.

### Tests

This phase is for building and testing your project.

For iOS projects, we will generate a command to build and test your project using the `xcodebuild` command line tool. The command we generate is similar to:

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

If your project uses [React Native](https://facebook.github.io/react-native/), we will also automatically run the `test` script phase from your `package.json`.

### Code Signing

We can automatically inject your code signing certificates and unlock the keychain for your build.

To use our automated code signing support for your iOS app, perform the following steps:

#### Export your certificates (p12)

Open **Keychain Access.app**, and select **My Certificates** in the menu on the left hand side.

![Keychain Access.app with the keychain that contains the keys, and My Certificates selected](  {{ site.baseurl }}/assets/img/docs/ios-getting-started-keychain-access-my-certificates.png)

You should then be able to see a certificate with **iPhone Developer:** or **iPhone Distribution:**
Select the certificate, then select **File -> Export Items** from the macOS Menu Bar.

![The Keychain Access.app file menu with Export Items in a hover state](  {{ site.baseurl }}/assets/img/docs/ios-getting-started-keychain-file-menu.png)

Ensure that the file format is **Personal Information Exchange (.p12)**. If the option is not available, you probably forgot to select the private key when you selected the certificate.

![The Keychain Access.app Export dialogue](  {{ site.baseurl }}/assets/img/docs/ios-getting-started-keychain-export-dialogue.png)

You will then be asked for a **certificate export password**. This is not required, but we do recommend it.

#### Adding your certificate

Go to your project page on CircleCI, and open the **Project Settings**, then go to **OS X Code Signing** in the **Permissions** section.

![The CircleCI Project Settings, iOS Code Signing page](  {{ site.baseurl }}/assets/img/docs/ios-getting-started-cci-code-signing-menu.png)

Click **Upload Key** and enter the details for your certificate, including the password you used when exporting the .p12.

![The CircleCI Certificate Details](  {{ site.baseurl }}/assets/img/docs/ios-getting-started-cci-certificate-details.png)

Select the `.p12` file you wish to upload and click upload.

The uploaded p12 certificates will be installed into `circle.keychain` as part of your build setup. The password for this keychain is `circle`, and it is unlocked for the duration of the build.

This keychain is also added to the Xcode search path, so any credentials stored here will be available to Xcode.

#### Using your provisioning profile

To use your provisioning profile with your CircleCI builds, you need to upload the `.mobileprovision` file on the **Project Settings** > **OS X Code Signing** page. Any provisioning profiles will automatically be added to the `circle.keychain` at the start of the build.

## Customizing your build

Although our inference will work for many cases, some teams may want to customize their build process to use custom tools or run their own scripts. This is done using the `circle.yml` file.

If you wish to see a more detailed guide to the format, take a look at our [configuration sample]( {{ site.baseurl }}/1.0/config-sample/).

### Machine Configuration

Sometimes you’ll want to pin your build to either an older version of Xcode or a version in beta. You can do this by configuring a `machine` section in your `circle.yml`.

To do so, add a root level `machine` section to the document with a nested Xcode and version section:

```
machine:
  xcode:
    version: 8.0
```

### Dependencies

If you have dependencies from homebrew or wish to have more control over dependency installation, you can override our commands:

```
dependencies:
  override:
    - brew install kylef/formulae/swiftenv
    - swiftenv install 3.0
```

The dependencies section also lets you run commands before or after our inferred commands:

```
dependencies:
  pre:
    - gem install bundler --pre # Use a beta version of Bundler
  post:
    - make bootstrap
```

### Tests

If you wish to override your test build phase, you can override our inferred commands with a test override. Every command here will be run regardless of previous failures.

```
test:
  override:
    - swift test
```

### Deployment

If you wish to deploy your application with CircleCI, we recommend using [Gym](https://github.com/fastlane/fastlane/tree/master/gym) and [Deliver](https://github.com/fastlane/fastlane/tree/master/deliver) from [Fastlane](https://fastlane.tools).

Deployments can be defined by specifying an identifier, a branch or pattern that the release should run on, and a set of commands to run the release.

```
deployment:
  staging:
    branch: develop
    commands:
      - fastlane release_staging
  beta:
    branch: master
    commands:
      - fastlane release_beta
  production:
    branch: release
    commands:
      - fastlane release_appstore
```
