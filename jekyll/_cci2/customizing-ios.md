---
layout: classic-docs
title: Testing iOS Applications on macOS
short-title: Testing iOS Applications on macOS
categories: [configuring-jobs]
description: Testing iOS applications on macOS
order: 71
---

This document describes how to set up and customize testing for an iOS application with CircleCI in the following sections:

* TOC
{:toc}

## Overview

CircleCI offers support for building and testing iOS and macOS projects. Refer to the manifest of the software installed on CircleCI OSX and macOS build images in the [Using a macOS Build Image](/docs/1.0/build-image-macos/#software) document.

## Getting Started

Select a macOS project you would like to build on the [Add
Projects page](https://circleci.com/add-projects). **Note:** If your project does not appear on the OS X tab, it may be listed as a Linux project. Add your project as a Linux build, then change
it to a macOS build by enabling the Build OS X project option on the
Project Settings > Build Environment page.

## Basic setup

After enabling macOS builds for your project, share
the scheme that is going to be built on CircleCI so that we run the
correct build actions. Here is how to share an existing scheme in Xcode:

1. Choose Product > Scheme > Manage Schemes.
2. Select the Shared option for the scheme to share, and click Close.
3. Choose Source Control > Commit.
4. Select the Shared Data folder.
5. Enter your commit message in the text field.
6. Select the "Push to remote" option (if your project is managed with Git).
7. Click the Commit Files button.
A new `.xcscheme` file is located in the
`xcshareddata/xcschemes` folder under your Xcode project. 
8. Commit this file to your git repository so that CircleCI can access it.

Simple projects should run with minimal or no configuration.

By default, CircleCI will:

* **Build your project with Xcode 7.0 on OSX 10.11** - You can
select a specific version of Xcode by specifying the major and minor version in
a [config.yml file]( {{ site.baseurl }}/2.0/configuration-reference/) in the `.circleci` directory of your
repository. 
* **Install any Ruby gems specified in a Gemfile** - We will run `bundle
  install` and cache the installed gems.
* **Install any dependencies managed by CocoaPods** - If a Podfile is
  present, we will run `pod install`, or `bundle exec pod install` if
  both a Podfile and a Gemfile are present, and also cache the installed pods.
* **Run the "test" build action for detected workspace (or project) and scheme
  from the command line** - We will use `xctool` to build either the workspace
  we find in your repo, or the project, if there is no workspace.


### CocoaPods

CircleCI will automatically detect if your project is using [CocoaPods](https://cocoapods.org)
to manage dependencies. If you are using CocoaPods, then we recommend that you
check your [Pods directory into source control](http://guides.cocoapods.org/using/using-cocoapods.html#should-i-check-the-pods-directory-into-source-control).
This will ensure that you have a deterministic, reproducible build.

If CircleCI finds a `Podfile` and the `Pods` directory is not present (or empty)
 then we will run `pod install` to install the necessary dependencies in the
`dependencies` step of your build.

## Supported build and test tools

CircleCI's automatic commands cover a lot of common test patterns, and you can customize your build
as needed to satisfy almost any iOS build and test strategy.

### XCTest-based tools
In addition to standard `XCTestCase` tests, CircleCI will automatically run tests
written in any other tool that builds on top of XCTest and is configured to run
using the "test" build action. The following test tools are known to work well on CircleCI
(though many others should work just fine):

* [XCTest](https://developer.apple.com/library/ios/documentation/DeveloperTools/Conceptual/testing_with_xcode/chapters/01-introduction.html)
* [Kiwi](https://github.com/kiwi-bdd/Kiwi)
* [KIF](https://github.com/kif-framework/KIF)

### Other tools
Popular iOS testing tools like [Appium](http://appium.io/) and [Frank](http://www.testingwithfrank.com/) should also
work normally, though they will need to be installed and called using custom commands.
See [customizing your build](#customizing-your-build) for more info.

## Code signing
[fastlane](https://fastlane.tools) and [Shenzhen](http://nomad-cli.com/#shenzhen)
are pre-installed on the container image. It is recommended to use fastlane to
build, sign and distribute your iOS app to beta-testers.

The fastest way to get code signing working on CircleCI is to follow
these steps:

1. Upload your provisioning profile (`.mobileprovision`) and private key (`.p12`)
   files in **Project Settings > iOS Code Signing**.
1. Set `GYM_CODE_SIGNING_IDENTITY` environment variable
   to match your code-signing identity, ie `"iPhone Distribution: Acme Inc."`.
1. Build with `gym` and deploy with `ipa`.

Please check out the [code signing doc]( {{ site.baseurl }}/1.0/ios-code-signing/) for more
details about setting up code signing, and the [deployment](#deployment)
section for examples of deployment setups.

## Customizing your build
You have complete flexibility to customize what runs in your build. CircleCI runs tests from the command line with the [`xcodebuild`](https://developer.apple.com/library/mac/documentation/Darwin/Reference/ManPages/man1/xcodebuild.1.html)
command by default. This is a tool developed by Apple that is a 
stable and functional option for building and testing your macOS project.

The following command is representative of how CircleCI builds an iOS project:

```
    steps:
      - run:
          name: homebrew dependencies
          command: |
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

The destination can be selected from the simulators the are pre-installed in CircleCI
build images.

In some situations you might also want to build with [`xctool`](https://github.com/facebook/xctool),
an alternative build tool. Please mind that some of the `xcodebuild` functionality might not be
supported by `xctool`. Here is an example of an `xctool` build command:

```
    steps:
      - run:
          name: homebrew dependencies
          command: |
            - xctool
            -reporter pretty
            -reporter junit:$CIRCLE_TEST_REPORTS/xcode/results.xml
            -reporter plain:$CIRCLE_ARTIFACTS/xctool.log
            CODE_SIGNING_REQUIRED=NO
            CODE_SIGN_IDENTITY=
            PROVISIONING_PROFILE=
            -destination 'platform=iOS Simulator,name=iPhone 6,OS=latest'
            -sdk iphonesimulator
            -workspace MyWorkspace.xcworkspace
            -scheme "My Scheme"
            build build-tests run-tests
```

### Setting Environment Variables
Customize the behavior of CircleCI's automatic build commands by setting
the following environment variables in a `config.yml` file or on the 
Project Settings > Environment Variables page of the CircleCI app, see [Using Environment Variables]( {{ site.baseurl }}/2.0/env-vars) for more info about environment variables:

* `XCODE_WORKSPACE` - The path to your `.xcworkspace` file relative to the git repository root
* `XCODE_PROJECT` - The path to your `.xcodeproj` file relative to the repository root
* `XCODE_SCHEME` - The name of the scheme you would like to use to run the "test" build action

**Note:** Only one of `XCODE_WORKSPACE` or `XCODE_PROJECT` will be used, with workspace taking
precedence over project.

If more than one scheme is present, then you should specify the
`XCODE_SCHEME` environment variable.
Otherwise a scheme will be chosen arbitrarily.

Use the Environment Variables page of the CircleCI app to add all of the
secrets that your build requires, because the content of the variables is stored
securely.

### Pre-Starting the Simulator

Pre-start the iOS simulator before building your
application to make sure that the simulator is booted in time.
Doing so generally reduces the number of simulator
timeouts observed in builds.

To pre-start the simulator, add the following to your
`config.yml`, assuming that you are running your tests on an iPhone 7
simulator with iOS 10.2:

```
    steps:
      - run:
          name: pre-start sim
          command: xcrun instruments -w "iPhone 7 (10.2) [" || true
```

**Note:** the `[` character is necessary to uniquely identify the iPhone 7
simulator, as the phone + watch simulator is also present in the build
image:

* `iPhone 7 (10.2) [<uuid>]` for the iPhone simulator;
* `iPhone 7 Plus (10.2) + Apple Watch Series 2 - 42mm (3.1) [<uuid>]` for the phone + watch pair.

### Creating a config.yml
The most flexible means to customize your build is to add a `.circleci/config.yml` file to your project,
which allows you to run arbitrary bash commands 
at various points in the build process. See the [Writing Jobs With Steps]( {{ site.baseurl }}/2.0/configuration-reference/) document for
a detailed discussion of the structure of the `config.yml` file. **Note:** A number of options in the document will not work for macOS builds.

### Installing Custom Packages
[Homebrew](http://brew.sh/) is pre-installed on CircleCI, so you can simply use `brew install`
to add nearly any dependency required in your build VM. Here's an example:

```
    steps:
      - run:
          name: pre-start sim
          command: brew install cowsay
    steps:
      - run:
          name: cowsay hi
          command: cowsay Hi!
```

It is also possible to use the `sudo` command if necessary to perform customizations outside of Homebrew.

### Using Custom Versions of CocoaPods and Other Ruby Gems

To make sure the version of CocoaPods that you use locally is also used
in your CircleCI builds, we suggest creating a Gemfile in your iOS
project and adding the CocoaPods version to it:

```
source 'https://rubygems.org'

gem 'cocoapods', '= 0.39.0'
```

If we detect a Gemfile in your project we’ll run `bundle install` and
will then invoke CocoaPods with `bundle exec` prepended to the command.

Please mind that, if overriding the `dependencies` step, you will need
to manually add the `bundle install` step to your config.

If you have any other gems specified in your Gemfile, we will
automatically install and cache those as well during the `bundle
install` step.

## Configuring Deployment

After you have a signed app you are on the homeward stretch. Distributing
the app is easy. One popular way to distribute your app is using `shenzhen`.
Shenzhen supports many distribution services, including:

* [iTunes Connect](https://itunesconnect.apple.com/)
* [HockeyApp](http://hockeyapp.net/)
* [Beta by Crashlytics](http://try.crashlytics.com/beta/)
* [TestFairy](https://testfairy.com/)

### Hockey App 

1. Log in to Hockey app and create a new API token on the [Tokens page](
https://rink.hockeyapp.net/manage/auth_tokens). Your token will need at
least upload permission to upload new builds to Hockey App. 

2. Give your
new API token a name specific to CircleCI such as "CircleCI
Distribution". 

3. Copy the token, and log into CircleCI and go to the
Project Settings page for your app. 

4. Create a new Environment Variable with
the name `HOCKEY_APP_TOKEN` and paste the token as the value. You can now
access this token during the build.

5. Modify the deployment section of your `config.yml` as follows:

```
    steps:
      - deploy:
          name: hockey app deploy
          command: |
            - gym
            - ipa distribute:hockeyapp
                --file             /Users/distiller/<yourprojectname>/<yourappname>.ipa
                --token            "$HOCKEY_APP_TOKEN"
                --notes            "CircleCI build $CIRCLE_BUILD_NUM"
                --commit-sha       "$CIRCLE_SHA1"
                --build-server-url "$CIRCLE_BUILD_URL"
                --repository-url   "$CIRCLE_REPOSITORY_URL"
```

### Beta By Crashlytics

1. Log in to Fabric.io and visit your organization's settings page.
![](  {{ site.baseurl }}/assets/img/docs/fabric-org-settings-page.png)

2. Click your organization (CircleCI in the image above), and click 
the API key and Build Secret links to reveal the items.
![](  {{ site.baseurl }}/assets/img/docs/fabric-api-creds-page.png)

3. Navigate to your App's Project Settings page in the CircleCI app, and under
Environment Variables add two new items named `CRASHLYTICS_API_KEY` and
`CRASHLYTICS_SECRET`, with the values you find on Crashlytics website.

4. Modify the deployment section of your `config.yml` as
follows:

```
    steps:
      - deploy:
          name: crashlytics deploy
          command: |
            - gym
            - ipa distribute:crashlytics
                --crashlytics_path Crashlytics.framework
                --api_token    "$CRASHLYTICS_API_KEY"
                --build_secret "$CRASHLYTICS_SECRET"
```

### TestFairy

To set up your app on TestFairy follow these steps:

1. Visit the preferences page in the
TestFairy dashboard and navigate to the API Key section. 
2. Copy your API
key and go to your App's Project settings on CircleCI. 
3. Add a new
Environment Variable named `TESTFAIRY_API_KEY` and paste in the API key
from the TestFairy dashboard.

4. Edit your `config.yml` as follows:

```
    steps:
      - deploy:
          name: testfairy deploy
          command: |
            - gym
            - ipa distribute:testfairy
                --key     "$TESTFAIRY_API_KEY"
                --comment "CircleCI build $CIRCLE_BUILD_URL"
```

## Resolving Common Simulator Issues

A series of simulator-related issues are known to happen on some
projects. Here are the most frequent of those:

* **Xcode version is not available.** We install
  a few [different versions](#software-versions) of Xcode in the build
  image and keep those updated with the latest point releases. Therefore
  to use the latest Xcode 7.3, for example, which is `7.3.1`, it is
  sufficient to specify `7.3` in your `config.yml`. If a newer point
  release of 7.3 comes out, we will make that one available under the same
  `7.3` version on CircleCI.

* **Dependency version mismatches.** If you see that the version of the
  dependencies used in the build are not the expected ones, please try
  rebuilding without cache — chances are an older dependency got stuck
  in the cache and is not allowing for the newer version to get
  installed.

* **Cryptic compilation errors.** If you see compile-time errors that do
  not really make sense, please check if the version of Xcode you are using
  in your build is the same one you are using locally. When the
  `config.yml` of the project does not specify an Xcode version,
  we default to an older Xcode which might not support the necessary
  features.

* **Timeout waiting for simulator.** If you see your test command
  failing with errors similar to this:

* **Can't add my project as macOS build.** If you are trying to add a macOS
  project from the ["add-project"](https://circleci.com/add-projects) page, but you don't see your
  project under the "OS X" tab, you can first add your project as a "Linux"
  build — and then switch it to an "OS X" build by going to the "Project
  Settings" page, then on the "Build Environment" page you will see the "Build
  OS X project" option.

```
iPhoneSimulator: Timed out waiting 120 seconds for simulator to boot, current state is 1
```

  Then the version of the simulator you are trying to use on CircleCI
  might not be present in the build machines.
  In addition to the default version of simulator for every Xcode
  installation, we also make simulators of the following iOS versions
  available for all Xcode versions:

  * 7.1
  * 8.4

  Please try using any of the versions of simulator that are present on
  the machines — the error might disappear.

* **Ruby segfaults.** We have seen cases where some of the Ruby gems
  used during the build would produce a segmentation fault in Ruby. This
  might happen because of the mismatch of Ruby version used to build the
  gem and the Ruby version used to run it. Please make sure that the Ruby
  version used locally is the same as the one used on CircleCI. You can
  install a newer version Ruby in the container by following [this
  guide](https://discuss.circleci.com/t/installing-a-newer-ruby-version-on-ios-os-x-containers/2466).

* **Inconsistent timeouts during test runs.** If you are seeing your UI
  tests time out in some of the builds, please try using both the raw
  `xcodebuild` command and the `xctool` command command we suggest [here](#build-commands).
  Sometimes the issue would only be present with one of these tools but not the other.

* **Errors while installing code signing certificates.** Please check out the iOS Code Signing document.

* **Many iOS app developers use tools that generate substantial amounts of code.** In such
cases CircleCI may not correctly detect the Xcode workspace, project, or
scheme. Instead, you can specify these through [environment variables](#environment-variables).

### Constraints on macOS-Based Builds
There are a few features normally available on CircleCI's standard
Linux containers that are not available for macOS builds at the moment:

* Parallelism is not supported
* While the general `config.yml` file structure will be honored in macOS-based builds
[configuration options]( {{ site.baseurl }}/2.0/configuration-reference/), the following sections of
`circle.yml` will not work correctly:
  * `machine: services`
  * `machine: <language>`, where `<language>` is any language mentioned
    in the [Configuration doc]( {{ site.baseurl }}/2.0/configuration-reference/)

Please see the [customizing your build](#customizing-your-build) section for alternatives and the [Sample 20 config.yml]( {{ site.baseurl }}/2.0/sample-config/).

