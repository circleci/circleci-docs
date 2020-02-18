---
layout: classic-docs
title: Testing iOS Applications on macOS
short-title: Testing iOS Applications on macOS
categories: [platforms]
description: Testing iOS applications on macOS
order: 30
---

This document describes how to set up and customize testing for an iOS application with CircleCI in the following sections:

* TOC
{:toc}

**Note:** There is also documentation for [an iOS example project]({{ site.baseurl}}/2.0/ios-tutorial/) and [getting started on MacOS]({{ site.baseurl }}/2.0/hello-world-macos/).

## Overview
{:.no_toc}

CircleCI offers support for building and testing iOS and macOS projects. Refer to the manifest of the software installed on CircleCI macOS build images in the Using a macOS Build Image document.

## macOS Build Containers

Each `macos` job is run a fresh container, running macOS. We build a new container each time a new version of Xcode is released by Apple. The contents of a particular build container remain unchanged (in very exceptional circumstances we might be forced to re-build a container). Our goal is to keep your builds environement stable, and to allow you to opt-in to newer containers by setting the `xcode` key in your `config.yml` file.

We announce the availability of new macOS containers in the [annoucements section of our Discuss site](https://discuss.circleci.com/c/announcements).

## Supported Xcode Versions

The currently available Xcode versions are:

 Config   | Xcode Version                   | macOS Version | Software Manifest
----------|---------------------------------|---------------|-------------------
`11.4.0` | Xcode 11.4 Beta 1 (Build 11N111s)     | macOS 10.15.3 | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v2378/index.html)
 `11.3.1` | Xcode 11.3.1 (Build 11C505)     | macOS 10.15.1 | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v2244/index.html)
 `11.3.0` | Xcode 11.3 (Build 11C29)        | macOS 10.15.1 | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v2134/index.html)
 `11.2.1` | Xcode 11.2.1 (Build 11B500)     | macOS 10.15   | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v2118/index.html)
 `11.2.0` | Xcode 11.2.1 (Build 11B500)     | macOS 10.15   | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v2118/index.html)
 `11.1.0` | Xcode 11.1 (Build 11A1027)      | macOS 10.14.4 | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v1989/index.html)
 `11.0.0` | Xcode 11.0 (Build 11A420a)      | macOS 10.14.4 | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v1969/index.html)
 `10.3.0` | Xcode 10.3 (Build 10G8)         | macOS 10.14.4 | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v1925/index.html)
 `10.2.1` | Xcode 10.2.1 (Build 10E1001)    | macOS 10.14.4 | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v1911/index.html)
 `10.1.0` | Xcode 10.1 (Build 10B61)        | macOS 10.13.6 | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v1901/index.html)
 `10.0.0` | Xcode 10.0 (Build 10A255)       | macOS 10.13.6 | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v1893/index.html)
 `9.4.1`  | Xcode 9.4.1 (Build 9F2000)      | macOS 10.13.3 | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v1881/index.html)
 `9.3.1`  | Xcode 9.3.1 (Build 9E501)       | macOS 10.13.3 | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v1875/index.html)
 `9.0.1`  | Xcode 9.0.1 (Build 9A1004)      | macOS 10.12.6 | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v1848/index.html)
{: class="table table-striped"}

## Getting Started

Select a macOS project you would like to build on the Add
Projects page of the CircleCI application. **Note:** Changing build environment is no longer needed in 2.0. If your project is not listed as macOS, choose Linux project and then select macOS in the Operating System section.

## Basic Setup

After enabling macOS builds for your project, share
the scheme that is going to be built on CircleCI so that CircleCI runs the
correct build actions. Complete the following steps to share an existing scheme in Xcode:

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

### Best Practices
{:.no_toc}

#### Cocoapods

In addition to the basic setup steps, it is best practice to use Cocoapods 1.8 or newer which allows the use of the CDN, rather than having to clone the entire Specs repo. This will allow you to install pods faster, reducing build times. If you are using Cocoapods 1.7 or older, consider upgrading to 1.8 or newer as this change allows for much faster job execution of the `pod install` step.

To enable this, ensure the first line in your Podfile is as follows:

```
source 'https://cdn.cocoapods.org/'
```

If upgrading from Cocoapods 1.7 or older, additionally ensure the following line is removed from your Podfile, along with removing the "Fetch CocoaPods Specs" step in your CircleCI Configuration:

```
source 'https://github.com/CocoaPods/Specs.git'
```

#### Homebrew

Homebrew, by default, will check for updates at the start of any operation. As Homebrew has a fairly frequent release cycle, this means that the step execution can take some extra time to complete.

If build speed or bugs introduced by new Homebrew updates are a concern, this update-check feature can be disabled. On average, this can save 2-5 minutes per job.

To disable this feature, define the `HOMEBREW_NO_AUTO_UPDATE` environment variable within your job:

```yaml
version: 2.1
jobs:
  build-and-test:
    macos:
      xcode: 11.3.0
    environment:
      HOMEBREW_NO_AUTO_UPDATE: 1
    steps:
      - checkout
      - run: brew install wget
```

#### iOS Simulator Crash Reports

If your iOS app crashes in the Simulator during a test run, the crash report is useful for diagnosing the exact cause of the crash. Crash reports can be uploaded as artifacts, as follows:

```yaml
steps:
  # ...
  - store_artifacts:
    path: ~/Library/Logs/DiagnosticReports
```

## Advanced Setup

For advanced setup, it is possible to run a lint job together with your
build and test job, and potentially also run tools like [Danger](https://github.com/danger/danger).

The recommended configuration can be extended to add a lint job and a Danger
job as follows:


```yaml
version: 2.1
jobs:
  build-and-test:
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
  build-test-lint:
    jobs:
      - swiftlint
      - danger
      - build-and-test
```

## Using Fastlane

[Fastlane](https://fastlane.tools/) is a set of tools for automating the
build and deploy process of mobile apps. We encourage the use of
Fastlane on CircleCI as that allows for parity of build / deploy locally
and on CircleCI, and simplifies the setup process.

### Adding a Gemfile
{:.no_toc}

It is recommended to add a `Gemfile` to your repository to make sure
that the same version of Fastlane is used both locally and on CircleCI.
The simplest `Gemfile` could look like this:

```
# Gemfile
source "https://rubygems.org"
gem 'fastlane'
```

After you have created a `Gemfile` locally, you will need to run
`bundle install` and check both `Gemfile` and `Gemfile.lock` into your
repository.

### Setting up Fastlane for use on CircleCI
{:.no_toc}

When using Fastlane in your CircleCI project, we recommend adding the
following to your `Fastfile`:

```
# fastlane/Fastfile

...
platform :ios do
  before_all do
    setup_circle_ci
  end
  ...
end
```

The `setup_circle_ci` Fastlane action must be in the `before_all` block to perform the following
actions:

* Create a new temporary keychain for use with Fastlane Match (see the
code signing section for more details).
* Switch Fastlane Match to `readonly` mode to make sure CI does not create
new code signing certificates or provisioning profiles.
* Set up log and test result paths to be easily collectible.

### Example Configuration for Using Fastlane on CircleCI
{:.no_toc}

A basic Fastlane configuration that can be used on CircleCI is as follows:

```
# fastlane/Fastfile
default_platform :ios

platform :ios do
  before_all do
    setup_circle_ci
  end

  desc "Runs all the tests"
  lane :test do
    scan
  end

  desc "Ad-hoc build"
  lane :adhoc do
    match(type: "adhoc")
    gym(export_method: "ad-hoc")
  end
end
```

This configuration can be used with the following CircleCI config file:

```yaml
# .circleci/config.yml
version: 2.1
jobs:
  build-and-test:
    macos:
      xcode: 11.3.0
    environment:
      FL_OUTPUT_DIR: output
      FASTLANE_LANE: test
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

  adhoc:
    macos:
      xcode: 11.3.0
    environment:
      FL_OUTPUT_DIR: output
      FASTLANE_LANE: adhoc
    steps:
      - checkout
      - run: bundle install
      - run:
          name: Fastlane
          command: bundle exec fastlane $FASTLANE_LANE
      - store_artifacts:
          path: output

workflows:
  build-test-adhoc:
    jobs:
      - build-and-test
      - adhoc:
          filters:
            branches:
              only: development
          requires:
            - build-and-test
```

The environment variable `FL_OUTPUT_DIR` is the artifact directory where FastLane logs should be stored. Use this to set the path in the `store_artifacts` step to automatically save logs such as Gym and Scan.

### Reducing Testing Time

By default, Fastlane Scan generates test output reports in `html` and `junit` formats. If your tests are taking a long time and you do not need these reports, consider disabling them by altering the `output_type` parameter as described in the [fastlane docs](https://docs.fastlane.tools/actions/run_tests/#parameters).

### Using CocoaPods
{:.no_toc}

If you are using CocoaPods, then we recommend that you
check your [Pods directory into source control](http://guides.cocoapods.org/using/using-cocoapods.html#should-i-check-the-pods-directory-into-source-control).
This will ensure that you have a deterministic, reproducible build.

## Supported Build and Test Tools

In CircleCI 2.0 it is possible to customize your build
as needed to satisfy almost any iOS build and test strategy.

### XCTest-based tools
{:.no_toc}

The following test tools are known to work well on CircleCI
(though many others should work just fine):

* [XCTest](https://developer.apple.com/library/ios/documentation/DeveloperTools/Conceptual/testing_with_xcode/chapters/01-introduction.html)
* [Kiwi](https://github.com/kiwi-bdd/Kiwi)
* [KIF](https://github.com/kif-framework/KIF)

### Other Tools
{:.no_toc}

Popular iOS testing tools like [Appium](http://appium.io/) and [Frank](http://www.testingwithfrank.com/) should also
work normally and are installed and called using `run` commands.

### Pre-Starting the Simulator
{:.no_toc}

Pre-start the iOS simulator before building your
application to make sure that the simulator is booted in time.
Doing so generally reduces the number of simulator
timeouts observed in builds.

To pre-start the simulator, add the following to your
`config.yml` file, assuming that you are running your tests on an iPhone 11 Pro
simulator with iOS 13.2:

```
    steps:
      - run:
          name: pre-start simulator
          command: xcrun instruments -w "iPhone 11 Pro (13.3) [" || true
```

**Note:** the `[` character is necessary to uniquely identify the iPhone 7
simulator, as the phone + watch simulator is also present in the build
image:

* `iPhone 11 Pro (13.3) [<uuid>]` for the iPhone simulator.
* `iPhone 11 Pro (13.3) + Apple Watch Series 5 - 40mm (6.1.1) [<uuid>]` for the phone + watch pair.

### Creating a `config.yml` File
{:.no_toc}

The most flexible means to customize your build is to add a `.circleci/config.yml` file to your project,
which allows you to run arbitrary bash commands
at various points in the build process. See the [Configuring CircleCI]( {{ site.baseurl }}/2.0/configuration-reference/) document for
a detailed discussion of the structure of the `config.yml` file. **Note:** A number of options in the document will not work for macOS builds.

### Installing Custom Packages
{:.no_toc}

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


### Using Custom Ruby Versions
{:.no_toc}

Our macOS containers contain multiple versions of Ruby. The default version is the system-installed Ruby. The containers also include the latest stable versions of Ruby at the time that the container is built. We determine the stable versions of Ruby using the [Ruby-Lang.org downloads page](https://www.ruby-lang.org/en/downloads/). The version of Ruby that are installed in each image are listed in the [software manifests of each container](#supported-xcode-versions).

If you want to run steps with a version of Ruby that is listed as "available to chruby" in the manifest, then you can use [`chruby`](https://github.com/postmodern/chruby) to do so.

#### Images using macOS 10.15 (Catalina) / Xcode 11.2 and later

The [`chruby`](https://github.com/postmodern/chruby) program is installed on the image and can be used to select a version of Ruby. The auto-switing feature is not enabled by default. To select a version of Ruby to use, call the `chruby` function in `~/.bash_profile`:

```yaml
run:
  name: Set Ruby Version
  command: echo 'chruby ruby-2.6' >> ~/.bash_profile  # Replace 2.6 with the specific version of Ruby here.
```

Alternatively, you can choose to [enable auto-switching](https://github.com/postmodern/chruby#auto-switching) if you would like to use it by following [these steps](https://github.com/postmodern/chruby#auto-switching).

#### Images using macOS 10.14 (Mojave) / Xcode 11.1 and earlier

The build images using macOS 10.14 and earlier (Xcode 11.1 and earlier) have both `chruby` and [the auto-switcher](https://github.com/postmodern/chruby#auto-switching) enabled by default.

To specify a version of Ruby to use, there are two options. You can [create a file named `.ruby-version` and commit it to your repository, as documented by `chruby`](https://github.com/postmodern/chruby#auto-switching). If you do not want to commit a `.ruby-version` file to source control, then you can create the file from a job step:

```yaml
run:
  name: Set Ruby Version
  command:  echo "ruby-2.4" > ~/.ruby-version # Replace 2.4 with the specific version of Ruby here.
```

**Note:** The version of Ruby that you select must be one of the versions listed in the [software manifests of your macOS container](#supported-xcode-versions).

To run a job with a version of Ruby that is not pre-installed, you must install the required version of Ruby. We use the [ruby-install](https://github.com/postmodern/ruby-install) tool to install the required version. After the install is complete, you can select it using the technique above.

### Using Custom Versions of CocoaPods and Other Ruby Gems
{:.no_toc}

To make sure the version of CocoaPods that you use locally is also used
in your CircleCI builds, we suggest creating a Gemfile in your iOS
project and adding the CocoaPods version to it:

```
source 'https://rubygems.org'

gem 'cocoapods', '= 1.3.0'
```

Then you can install these using bundler:

{% raw %}
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
{% endraw %}

You can then ensure you are using those, by prefixing commands with `bundle exec`:

```
    steps:
      - run: bundle exec pod install
```

## Configuring Deployment

After the app has been tested and signed, you are ready to configure deployment to your service of choice, such as App Store Connect or TestFlight. For more information on how to deploy to various services, including example Fastlane configurations, check out the [deploying iOS apps guide]({{ site.baseurl }}/2.0/deploying-ios/)

## Resolving Common Simulator Issues
{:.no_toc}

A series of simulator-related issues are known to happen on some
projects. Here are the most frequent of those:

* **Xcode version is not available.** We install
  a few different versions of Xcode in each build
  image and keep those updated with the latest point releases. For version `10.0.0`,
  you must specify the full version, down to the point release number. However,
  to use the latest Xcode 11.3.0, for example, which is `11.3.0`, it is
  sufficient to specify `11.3` in your `config.yml`. If a newer point
  release of 11.3 comes out, we will make that one available under the same
  `11.3` version on CircleCI.

* **Dependency version mismatches.** If you see that the version of the
  dependencies used in a job are not the expected ones, please try
  rebuilding without cache — chances are an older dependency got stuck
  in the cache and is not allowing for the newer version to get
  installed.

* **Cryptic compilation errors.** If you see compile-time errors that do
  not really make sense, please check if the version of Xcode you are using
  in your build is the same one you are using locally. When the
  `config.yml` of the project does not specify an Xcode version,
  we default to an older Xcode which might not support the necessary
  features.

* **Ruby segfaults.** We have seen cases where some of the Ruby gems
  used during a job would produce a segmentation fault in Ruby. This
  might happen because of the mismatch of Ruby version used to build the
  gem and the Ruby version used to run it. Please make sure that the Ruby
  version used locally is the same as the one used on CircleCI. You can
  install a newer version Ruby in the container by following [this
  guide](https://discuss.circleci.com/t/installing-a-newer-ruby-version-on-ios-os-x-containers/2466).

* **Inconsistent timeouts during test runs.**
If your UI tests are timing out,
try running them [before the rest of your tests](https://stackoverflow.com/questions/44361446/ios-uitests-failed-idetestoperationsobservererrordomain-code-13/48299184#48299184).
You can also try using the raw `xcodebuild` command or the `xctool` command.
Some issues are only present in one of these tools.

* **Errors while installing code signing certificates.** Please check out the iOS Code Signing document.

## Sample Configuration with Multiple Executor Types (macOS + Docker)

It is possible to use multiple [executor types](https://circleci.com/docs/2.0/executor-types/)
in the same workflow. In the following example each push of an iOS
project will be built on macOS, and additional iOS tools
([SwiftLint](https://github.com/realm/SwiftLint) and
[Danger](https://github.com/danger/danger))
will be run in Docker.

{% raw %}

```yaml
version: 2.1
jobs:
  build-and-test:
    macos:
      xcode: 11.3.0
    environment:
      FL_OUTPUT_DIR: output

    steps:
      - checkout
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
          path: output/scan
      - store_artifacts:
          path: output

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
  build-test-lint:
    jobs:
      - swiftlint
      - danger
      - build-and-test
```

{% endraw %}

## React Native projects
{:.no_toc}

React Native projects can be built on CircleCI 2.0 using `macos` and
`docker` executor types. Please check out [this example React Native
application](https://github.com/CircleCI-Public/circleci-demo-react-native)
on GitHub for a full example of a React Native project.

## See Also
{:.no_toc}

- See the [`circleci-demo-ios` GitHub repository](https://github.com/CircleCI-Public/circleci-demo-ios)
for a full example of how to build, test, sign and deploy an iOS project
using Fastlane on CircleCI 2.0.
- See the [iOS Project Tutorial]( {{ site.baseurl }}/2.0/ios-tutorial/) for a config walkthrough.
