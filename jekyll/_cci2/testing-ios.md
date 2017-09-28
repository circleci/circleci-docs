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

CircleCI offers support for building and testing iOS and macOS projects. Refer to the manifest of the software installed on CircleCI macOS build images in the Using a macOS Build Image document.

## Getting Started

Select a macOS project you would like to build on the Add
Projects page of the CircleCI application. **Note:** Changing build environment is no longer needed in 2.0. If your project is not listed as macOS, choose Linux project and then select macOS in the Operating System section.

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

Simple projects should run with minimal configuration. You can find an
example of a minimal config in the
[iOS Project Tutorial]({{ site.baseurl }}/2.0/ios-tutorial/).

# Recommended setup

In addition to the basic setup steps, the recommended setup includes
downloading CocoaPods specs from the CircleCI mirror (up to 70% faster)
and linting the Swift code together with the `build-and-test` job:

```
# .circleci/config.yml
version: 2
jobs:
  build-and-test:
    macos:
      xcode:
        version: "9.0"

    steps:
      - checkout
      - run:
          name: Fetch CocoaPods Specs
          command: |
            curl https://cocoapods-specs.circleci.com/fetch-cocoapods-repo-from-s3.sh | bash -s cf
      - run:
          name: Install CocoaPods
          command: pod install --verbose

      - run:
          name: Build and run tests
          command: fastlane scan
          environment:
            SCAN_DEVICE: iPhone 8
            SCAN_SCHEME: WebTests

      - store_test_results:
          path: test_output/report.xml
      - store_artifacts:
          path: /tmp/test-results
          destination: scan-test-results
      - store_artifacts:
          path: ~/Library/Logs/scan
          destination: scan-logs

workflows:
  version: 2
    build-and-test:
      jobs:
        - build-and-test
```

### Advanced setup

For advanced setup, it is possible to run a lint job together with your
build and test job, and potentially also run tools like [Danger](https://github.com/danger/danger).

The recommended config can be extended to add a lint job and a Danger
job as follows:


```
version: 2
jobs:
  build-and-test:
  ...
  swiftlint:
    docker:
      - image: dantoml/swiftlint:latest
    steps:
      - checkout
      - run: swiftlint lint --reporter junit | tee result.xml
      - store_artifacts:
          path: result.xml
      - store_test_results:
          path: result.xml
  danger:
    docker:
      - image: dantoml/danger:latest
    steps:
      - checkout
      - run: danger

workflows:
  version: 2
  build-test-lint:
    jobs:
      - swiftlint
      - danger
      - build-and-test
```


### CocoaPods

If you are using CocoaPods, then we recommend that you
check your [Pods directory into source control](http://guides.cocoapods.org/using/using-cocoapods.html#should-i-check-the-pods-directory-into-source-control).
This will ensure that you have a deterministic, reproducible build.

## Supported build and test tools

In CircleCI 2.0 it is possible to customize your build
as needed to satisfy almost any iOS build and test strategy.

### XCTest-based tools
The following test tools are known to work well on CircleCI
(though many others should work just fine):

* [XCTest](https://developer.apple.com/library/ios/documentation/DeveloperTools/Conceptual/testing_with_xcode/chapters/01-introduction.html)
* [Kiwi](https://github.com/kiwi-bdd/Kiwi)
* [KIF](https://github.com/kif-framework/KIF)

### Other Tools
Popular iOS testing tools like [Appium](http://appium.io/) and [Frank](http://www.testingwithfrank.com/) should also
work normally and are installed and called using `run` commands.

## Code Signing

Refer to the iOS Code Signing documentation for CircleCI 2.0.

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
          name: pre-start simulator
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
          name: Install cowsay
          command: brew install cowsay
      - run:
          name: cowsay hi
          command: cowsay Hi!
```

It is also possible to use the `sudo` command if necessary to perform customizations outside of Homebrew.


## Custom Ruby Versions

The macOS container ships with the system-installed Ruby, as well as the
latest stable versions of Ruby as provided by [Ruby-Lang.org](https://www.ruby-lang.org/en/downloads/).
To allow you to manage custom versions of Ruby, we install
[ruby-install](https://github.com/postmodern/ruby-install) and [chruby](https://github.com/postmodern/chruby).
To select a custom version of ruby you should [create a file named
`.ruby-version` and commit it to your
repository, as documented by `chruby`](https://github.com/postmodern/chruby#auto-switching).
You will also need to change the default shell that commands are executed with
to be a login shell, so that `chruby` is correctly invoked.

```yaml
version: 2
jobs:
  build:
    macos:
      version: "9.0"
    shell: /bin/bash --login --eo pipefail
```

If you do not want to commit a `.ruby-version` file to source control, then
you can create the file from a build step:
```yaml
run:
  name: Set Ruby Version
  command:  echo "ruby-2.4" > ~/.ruby-version
```

### Using Custom Versions of CocoaPods and Other Ruby Gems

To make sure the version of CocoaPods that you use locally is also used
in your CircleCI builds, we suggest creating a Gemfile in your iOS
project and adding the CocoaPods version to it:

```
source 'https://rubygems.org'

gem 'cocoapods', '= 1.3.0'
```

Then you can install these using bundler:

```
    steps:
      - restore_cache:
          key: 1-gems-{{ checksum "Gemfile.lock" }}

      - run: bundle check || bundle install --path vendor/bundle

      - save_cache:
          key: 1-gems-{{ checksum "Gemfile.lock" }}
          paths:
            - vendor/bundle
```

You can then ensure you're using those, by prefixing commands with `bundle exec`:

```
    steps:
      - run: bundle exec pod install
```

## Configuring Deployment

After you have a signed app you are on the homeward stretch. Distributing
the app is easy.

* [iTunes Connect](https://itunesconnect.apple.com/)
* [HockeyApp](http://hockeyapp.net/)
* [Beta by Crashlytics](http://try.crashlytics.com/beta/)
* [TestFairy](https://testfairy.com/)

Then you should set up environment variables for your service of choice:

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

### Beta By Crashlytics

1. Log in to Fabric.io and visit your organization's settings page.
![](  {{ site.baseurl }}/assets/img/docs/fabric-org-settings-page.png)

2. Click your organization (CircleCI in the image above), and click 
the API key and Build Secret links to reveal the items.
![](  {{ site.baseurl }}/assets/img/docs/fabric-api-creds-page.png)

3. Navigate to your App's Project Settings page in the CircleCI app, and under
Environment Variables add two new items named `CRASHLYTICS_API_KEY` and
`CRASHLYTICS_SECRET`, with the values you find on Crashlytics website.

### TestFairy

To set up your app on TestFairy follow these steps:

1. Visit the preferences page in the
TestFairy dashboard and navigate to the API Key section. 
2. Copy your API
key and go to your App's Project settings on CircleCI. 
3. Add a new
Environment Variable named `TESTFAIRY_API_KEY` and paste in the API key
from the TestFairy dashboard.
```

And then follow the [fastlane documentation](https://docs.fastlane.tools/getting-started/ios/beta-deployment/) for deployment, with your environment variable for keys.


## Resolving Common Simulator Issues

A series of simulator-related issues are known to happen on some
projects. Here are the most frequent of those:

* **Xcode version is not available.** We install
  a few different versions of Xcode in the build
  image and keep those updated with the latest point releases. Therefore
  to use the latest Xcode 8.3, for example, which is `8.3.3`, it is
  sufficient to specify `8.3` in your `config.yml`. If a newer point
  release of 8.3 comes out, we will make that one available under the same
  `8.3` version on CircleCI.

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
  `xcodebuild` command and the `xctool` command.
  Sometimes the issue would only be present with one of these tools but not the other.

* **Errors while installing code signing certificates.** Please check out the iOS Code Signing document.

* **Many iOS app developers use tools that generate substantial amounts of code.** In such
cases CircleCI may not correctly detect the Xcode workspace, project, or
scheme. Instead, you can specify these through environment variables.

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

Please see the [Sample 2.0 config.yml]( {{ site.baseurl }}/2.0/sample-config/) for additional examples.

