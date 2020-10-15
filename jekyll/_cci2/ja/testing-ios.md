---
layout: classic-docs
title: macOS 上の iOS アプリケーションのテスト
short-title: macOS 上の iOS アプリケーションのテスト
categories:
  - platforms
description: macOS 上の iOS アプリケーションのテスト
order: 30
version:
  - Cloud
---

以下のセクションに沿って、CircleCI を使用して iOS アプリケーションのテストをセットアップおよびカスタマイズする方法について説明します。

- 目次
{:toc}

## 概要
{:.no_toc}

CircleCI offers support for building, testing and deploying iOS projects in macOS virtual machines. Each image provided has a set of common tools installed, such as Ruby and OpenJDK, alongside a version of Xcode. For more information about supplied images, refer to the [software manifest](#supported-xcode-versions) for each Xcode image.

There is documentation for [an iOS example project]({{ site.baseurl}}/2.0/ios-tutorial/) and [getting started on MacOS]({{ site.baseurl }}/2.0/hello-world-macos/).

## Using the macOS Executor

Each `macos` job is run a fresh virtual machine, running a specified version macOS. We build a new image each time a new stable, or beta, version of Xcode is released by Apple and aim to get these deployed as soon as possible. Generally, the contents of a particular build image will remain unchanged, except in very exceptional circumstances we might be forced to re-build a container for a specific reason. Our goal is to keep your build environement stable, and to allow you to opt-in to newer containers by setting the `xcode` key in your `config.yml` file.

Periodically, we will update the version of macOS each image includes to ensure the build environment is as up to date as possible. When a new major version of macOS is released, we will generally switch to this once the new major version of Xcode reaches the `xx.2` release to ensure the build environment is kept stable.

We announce the availability of new macOS containers, including Xcode betas, in the [annoucements section of our Discuss site](https://discuss.circleci.com/c/announcements).

### Beta Image Support

We endeavour to make beta Xcode versions available on the macOS executor as soon as we can to allow developers to test their apps ahead of the next stable Xcode release.

Unlike our stable images (which are frozen and will not change), once a new beta image is released it will overwrite the previous beta image until a GM (stable) image is released, at which point the image is frozen and no longer updated. If you are requesting an image using an Xcode version that is currently in beta, please expect it to change when Apple releases a new Xcode beta with minimal notice. This can include breaking changes in Xcode/associated tooling which are beyond our control.

To read about our customer support policy regarding beta images, please check out the following [support center article](https://support.circleci.com/hc/en-us/articles/360046930351-What-is-CircleCI-s-Xcode-Beta-Image-Support-Policy-).

### Apple Silicon Support

**Please Note:** Apple has indicated that Apple Silicon developers should continue to use Xcode 12 beta 6, rather than the GM. We have retained this image and you can access it by requesting the `12.0.0-beta` image.

It is possible to build Apple Silicon/Universal binaries using the Xcode `12.0.0-beta` image as Apple provides both the Intel (`x86_64`) and Apple Silicon (`arm64`) toolchains in this release. Cross-compiling Apple Silicon binaries on Intel hosts has an additional overhead and as a result compilation times will be longer than native compilation for Intel.

Running or testing Apple Silicon apps natively is currently not possible as CircleCI build hosts are Intel-based Macs. Binaries will need to be exported as [artifacts](https://circleci.com/docs/2.0/artifacts/) for testing apps locally.

## サポートされている Xcode のバージョン

| Config   | Xcode Version                | macOS Version | Software Manifest                                                                                | Release Notes                                                                                       |
| -------- | ---------------------------- | ------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| `12.2.0` | Xcode 12.2 Beta 2 (12B5025f) | 10.15.5       | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v3901/index.html) | [Release Notes](https://discuss.circleci.com/t/xcode-12-2-beta-2-released/37603)                    |
| `12.0.1` | Xcode 12.0.1 (12A7300)       | 10.15.5       | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v3933/index.html) | [Release Notes](https://discuss.circleci.com/t/xcode-12-0-1-released-xcode-12-0-0-deprecated/37630) |
| `11.7.0` | Xcode 11.7 (11E801a)         | 10.15.5       | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v3587/index.html) | [Release Notes](https://discuss.circleci.com/t/xcode-11-7-released/37312)                           |
| `11.6.0` | Xcode 11.6 (11E708)          | 10.15.5       | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v3299/index.html) | [Release Notes](https://discuss.circleci.com/t/xcode-11-6-released/36777/2)                         |
| `11.5.0` | Xcode 11.5 (11E608c)         | 10.15.4       | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v2960/index.html) | [Release Notes](https://discuss.circleci.com/t/xcode-11-5-gm-released/36029/4)                      |
| `11.4.1` | Xcode 11.4.1 (11E503a)       | 10.15.4       | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v2750/index.html) | [Release Notes](https://discuss.circleci.com/t/xcode-11-4-1-released/35559/2)                       |
| `11.3.1` | Xcode 11.3.1 (11C505)        | 10.15.1       | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v2244/index.html) | [Release Notes](https://discuss.circleci.com/t/xcode-11-3-1-released/34137/6)                       |
| `11.2.1` | Xcode 11.2.1 (11B500)        | 10.15.0       | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v2118/index.html) | [Release Notes](https://discuss.circleci.com/t/xcode-11-2-1-gm-seed-1-released/33345/14)            |
| `11.1.0` | Xcode 11.1 (11A1027)         | 10.14.4       | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v1989/index.html) | [Release Notes](https://discuss.circleci.com/t/xcode-11-1-image-released/32668/19)                  |
| `11.0.0` | Xcode 11.0 (11A420a)         | 10.14.4       | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v1969/index.html) | [Release Notes](https://discuss.circleci.com/t/xcode-11-gm-seed-2-released/32505/29)                |
| `10.3.0` | Xcode 10.3 (10G8)            | 10.14.4       | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v1925/index.html) | [Release Notes](https://discuss.circleci.com/t/xcode-10-3-image-released/31561)                     |
| `10.2.1` | Xcode 10.2.1 (10E1001)       | 10.14.4       | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v1911/index.html) | [Release Notes](https://discuss.circleci.com/t/xcode-10-2-1-image-released/30198)                   |
| `10.1.0` | Xcode 10.1 (10B61)           | 10.13.6       | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v1901/index.html) | [Release Notes](https://discuss.circleci.com/t/xcode-10-1-image-released/26350)                     |
| `10.0.0` | Xcode 10.0 (10A255)          | 10.13.6       | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v1893/index.html) | [Release Notes](https://discuss.circleci.com/t/xcode-10-0-gm-image-released/25202)                  |
| `9.4.1`  | Xcode 9.4.1 (9F2000)         | 10.13.3       | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v1881/index.html) |                                                                                                     |
| `9.3.1`  | Xcode 9.3.1 (9E501)          | 10.13.3       | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v1875/index.html) |                                                                                                     |
| `9.0.1`  | Xcode 9.0.1 (9A1004)         | 10.12.6       | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v1848/index.html) |                                                                                                     |
{: class="table table-striped"}

**Note:** Xcode 9.0.1 and Xcode 9.3.1 are deprecated and are scheduled for removal on 5 October 2020 and 28 September 2020 respectively. For more information, please see the [deprecation notice](https://discuss.circleci.com/t/deprecation-notice-xcode-9-0-1-and-xcode-9-3-1/37382).

## はじめに

Select a macOS project repository you would like to build from the **Add Projects** page of the CircleCI application. You will need to ensure you have a [plan that allows macOS builds](https://circleci.com/pricing/), or if your project is open source, you can [apply for a special plan](https://circleci.com/open-source/) with free monthly build credits.

We highly recommend using [Fastlane](https://fastlane.tools) to build and sign your apps in CircleCI. Fastlane requires minimal configuration in most cases and simplifies the build-test-deploy process.

### Setting Up Your Xcode Project

After setting up the project on CircleCI, you will need to ensure that the scheme you intend to build with Fastlane is marked as "shared" in your Xcode project. In most new projects created by Xcode, the default scheme will already be marked as "shared". To verify this, or to share an existing scheme, complete the following steps:

1. In Xcode, choose Product -> Scheme -> Manage Schemes
2. Select the "Shared" option for the scheme to share, and click Close
3. Ensure the `myproject.xcodeproj/xcshareddata/xcschemes` directory is checked into your Git repository and push the changes

Simple projects should run with minimal configuration. You can find an example of a minimal config in the [iOS Project Tutorial]({{ site.baseurl }}/2.0/ios-tutorial/).

## Using Fastlane

[Fastlane](https://fastlane.tools/) is a set of tools for automating the build and deploy process of mobile apps. We encourage the use of Fastlane on CircleCI as it simplifies the setup and automation of the build, test and deploy process. Additionally, it allows parity between local and CircleCI builds.

### Adding a Gemfile
{:.no_toc}

It is recommended to add a `Gemfile` to your repository to make sure that the same version of Fastlane is used both locally and on CircleCI and that all dependencies are installed. Below is a sample of a simple `Gemfile`:

```ruby
# Gemfile
source "https://rubygems.org"
gem 'fastlane'
```

After you have created a `Gemfile` locally, you will need to run `bundle install` and check both `Gemfile` and `Gemfile.lock` into your project repository.

### Setting up Fastlane for use on CircleCI
{:.no_toc}

When using Fastlane in your CircleCI project, we recommend adding the following to beginning of your `Fastfile`:

```ruby
# fastlane/Fastfile

...
platform :ios do
  before_all do
    setup_circle_ci
  end
  ...
end
```

The `setup_circle_ci` Fastlane action must be in the `before_all` block to perform the following actions:

- Create a new temporary keychain for use with Fastlane Match (see the code signing section for more details).
- Switch Fastlane Match to `readonly` mode to make sure CI does not create new code signing certificates or provisioning profiles.
- Set up log and test result paths to be easily collectible.

### Example Configuration for Using Fastlane on CircleCI
{:.no_toc}

A basic Fastlane configuration that can be used on CircleCI is as follows:

```ruby
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

The environment variable `FL_OUTPUT_DIR` is the artifact directory where FastLane logs and signed `.ipa` file should be stored. Use this to set the path in the `store_artifacts` step to automatically save logs and build artifacts from Fastlane.

### Code Signing with Fastlane Match

We recommend the use of Fastlane Match for signing your iOS applications as it simplifies and automates the process of code signing both locally and in the CircleCI environment.

For more information on how to get started with Fastlane Match, please see our [iOS code signing documentation]({{ site.baseurl}}/2.0/ios-codesigning/).

## Using Ruby

Our macOS images contain multiple versions of Ruby. The default version in use on all images is the system Ruby. The images also include the latest stable versions of Ruby at the time that the image is built. We determine the stable versions of Ruby using the [Ruby-Lang.org downloads page](https://www.ruby-lang.org/en/downloads/). The versions of Ruby that are installed in each image are listed in the [software manifests of each container](#supported-xcode-versions).

If you want to run steps with a version of Ruby that is listed as "available to chruby" in the manifest, then you can use [`chruby`](https://github.com/postmodern/chruby) to do so.

**Note:** Installing Gems with the system Ruby is not advised due to the restrictive permissions enforced on the system directories. As a general rule, we advise using one of the alternative Rubies provided by Chruby for all jobs.

### Images using Xcode 11.7 and later

As a result of the macOS system Ruby (2.6.3) becoming increasingly incompatible with various gems (especially those which require native extensions), Xcode 11.7 and later images default to Ruby 2.7 via `chruby`.

Defaulting to Ruby 2.7 allows for greater compatibility and reliability with gems moving forward. Common gems, such as Fastlane, run without any issues in Ruby 2.7.

To switch to another Ruby version, see [our chruby documentation](#images-using-xcode-112-and-later). To revert back to the system Ruby, add the following to the beginning of your job:

```yaml
# ...
run:
  name: Set Ruby Version
  command: echo 'chruby system' >> ~/.bash_profile
```

### Images using Xcode 11.2 and later

The [`chruby`](https://github.com/postmodern/chruby) program is installed on the image and can be used to select a version of Ruby. The auto-switching feature is not enabled by default. To select a version of Ruby to use, add the `chruby` function to `~/.bash_profile`:

```yaml
# ...
run:
  name: Set Ruby Version
  command: echo 'chruby ruby-2.6' >> ~/.bash_profile
```

Replace `2.6` with the version of Ruby required - you do not need to specify the full Ruby version, `2.6.5` for example, just the major version. This will ensure your config does not break when switching to newer images that might have slightly newer Ruby versions.

### Images using Xcode 11.1 and earlier

Images using macOS 10.14 and earlier (Xcode 11.1 and earlier) have both `chruby` and [the auto-switcher](https://github.com/postmodern/chruby#auto-switching) enabled by default.

To specify a version of Ruby to use, there are two options. You can [create a file named `.ruby-version` and commit it to your repository, as documented by `chruby`](https://github.com/postmodern/chruby#auto-switching).

If you do not want to commit a `.ruby-version` file to source control, then you can create the file from a job step:

```yaml
# ...
run:
  name: Set Ruby Version
  command:  echo "ruby-2.4" > ~/.ruby-version
```

Replace `2.4` with the version of Ruby required - you do not need to specify the full Ruby version, `2.4.9` for example, just the major version. This will ensure your config does not break when switching to newer images that might have slightly newer Ruby versions.

### Installing additional Ruby versions

To run a job with a version of Ruby that is not pre-installed, you must install the required version of Ruby. We use the [ruby-install](https://github.com/postmodern/ruby-install) tool to install the required version. After the install is complete, you can select it using the appropriate technique above.

### Using Custom Versions of CocoaPods and Other Ruby Gems
{:.no_toc}

To make sure the version of CocoaPods that you use locally is also used in your CircleCI builds, we suggest creating a Gemfile in your iOS project and adding the CocoaPods version to it:

```ruby
source 'https://rubygems.org'

gem 'cocoapods', '= 1.3.0'
```

Then you can install these using bundler:

{% raw %}
```yaml
steps:

  - restore_cache:
      key: 1-gems-{{ checksum "Gemfile.lock" }}
  - run: bundle check || bundle install --path vendor/bundle --clean
  - save_cache:
      key: 1-gems-{{ checksum "Gemfile.lock" }}
      paths:
        - vendor/bundle
```
{% endraw %}

You can then ensure you are using those, by prefixing commands with `bundle exec`:

```yaml
# ...
steps:
  - run: bundle exec pod install
```

## Using Homebrew

[Homebrew](http://brew.sh/) is pre-installed on CircleCI, so you can simply use `brew install` to add nearly any dependency you require to complete your build. For example:

```yaml
# ...
steps:
  - run:
      name: Install cowsay
      command: brew install cowsay
  - run:
      name: cowsay hi
      command: cowsay Hi!
```

It is also possible to use the `sudo` command if necessary to perform customizations outside of Homebrew.

## Configuring Deployment

After the app has been tested and signed, you are ready to configure deployment to your service of choice, such as App Store Connect or TestFlight. For more information on how to deploy to various services, including example Fastlane configurations, check out the [deploying iOS apps guide]({{ site.baseurl }}/2.0/deploying-ios/)

## Reducing Job Time and Best Practises

### Pre-Starting the Simulator
{:.no_toc}

Pre-start the iOS simulator before building your application to make sure that the simulator is booted in time. Doing so generally reduces the number of simulator timeouts observed in builds.

To pre-start the simulator, add the following to your `config.yml` file, assuming that you are running your tests on an iPhone 11 Pro simulator with iOS 13.2:

```yaml
# ...
steps:
  - run:
      name: pre-start simulator
      command: xcrun instruments -w "iPhone 11 Pro (13.3) [" || true
```

**Note:** the `[` character is necessary to uniquely identify the iPhone 7 simulator, as the phone + watch simulator is also present in the build image:

- `iPhone 11 Pro (13.3) [<uuid>]` for the iPhone simulator.
- `iPhone 11 Pro (13.3) + Apple Watch Series 5 - 40mm (6.1.1) [<uuid>]` for the phone + watch pair.

### Collecting iOS Simulator Crash Reports
{:.no_toc}

Often if your `scan` step fails, for example due to a test runner timeout, it is likely that your app has crashed during the test run. In such cases, collecting crash report is useful for diagnosing the exact cause of the crash. Crash reports can be uploaded as artifacts, as follows:

```yaml
steps:
# ...
- store_artifacts:
  path: ~/Library/Logs/DiagnosticReports
```

### Optimizing Fastlane
{:.no_toc}

By default, Fastlane Scan generates test output reports in `html` and `junit` formats. If your tests are taking a long time and you do not need these reports, consider disabling them by altering the `output_type` parameter as described in the [fastlane docs](https://docs.fastlane.tools/actions/run_tests/#parameters).

### Optimizing Cocoapods
{:.no_toc}

In addition to the basic setup steps, it is best practice to use Cocoapods 1.8 or newer which allows the use of the CDN, rather than having to clone the entire Specs repo. This will allow you to install pods faster, reducing build times. If you are using Cocoapods 1.7 or older, consider upgrading to 1.8 or newer as this change allows for much faster job execution of the `pod install` step.

To enable this, ensure the first line in your Podfile is as follows:

    source 'https://cdn.cocoapods.org/'
    

If upgrading from Cocoapods 1.7 or older, additionally ensure the following line is removed from your Podfile, along with removing the "Fetch CocoaPods Specs" step in your CircleCI Configuration:

    source 'https://github.com/CocoaPods/Specs.git'
    

To update Cocoapods to the latest stable version, simply update the Ruby gem with the following command:

    sudo gem install cocoapods
    

We also recommend that you check your [Pods directory into source control](http://guides.cocoapods.org/using/using-cocoapods.html#should-i-check-the-pods-directory-into-source-control). This will ensure that you have a deterministic, reproducible build.

**Note:** The previous S3 mirror we provided for the Cocoapods Spec repo is no longer being maintained or updated since the release of Cocoapods 1.8. It will remain available to prevent existing jobs breaking, we highly recommend switching to the CDN method described above.

### Optimizing Homebrew
{:.no_toc}

Homebrew, by default, will check for updates at the start of any operation. As Homebrew has a fairly frequent release cycle, this means that any step which calls `brew` can take some extra time to complete.

If build speed, or bugs introduced by new Homebrew updates are a concern, this automatic update feature can be disabled. On average, this can save up to 2-5 minutes per job.

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

## Supported Build and Test Tools

With the macOS executor on CircleCI, it is possible to customize your build as needed to satisfy almost any iOS build and test strategy.

### Common Test Tools
{:.no_toc}

The following common test tools are known to work well on CircleCI:

- [XCTest](https://developer.apple.com/library/ios/documentation/DeveloperTools/Conceptual/testing_with_xcode/chapters/01-introduction.html)
- [Kiwi](https://github.com/kiwi-bdd/Kiwi)
- [KIF](https://github.com/kif-framework/KIF)
- [Appium](http://appium.io/)

### React Native projects
{:.no_toc}

React Native projects can be built on CircleCI using `macos` and `docker` executor types. For an example of configuring a React Native project, please see [our demo React Native application](https://github.com/CircleCI-Public/circleci-demo-react-native)

### Creating a `config.yml` File
{:.no_toc}

The most flexible way to customize your build is to modify the CircleCI configuration for your project in `.circleci/config.yml`. This allows you to run arbitrary bash commands as well as utilise built-in features such as workspaces and caching. See the [Configuring CircleCI]({{ site.baseurl }}/2.0/configuration-reference/) documentation for a detailed description of the structure of the `config.yml` file.

## Using Multiple Executor Types (macOS + Docker)

It is possible to use multiple [executor types](https://circleci.com/docs/2.0/executor-types/) in the same workflow. In the following example each push of an iOS project will be built on macOS, and additional iOS tools ([SwiftLint](https://github.com/realm/SwiftLint) and [Danger](https://github.com/danger/danger)) will be run in Docker.

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

      - image: bytesguy/swiftlint:latest
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run: swiftlint lint --reporter junit | tee result.xml
      - store_artifacts:
          path: result.xml
      - store_test_results:
          path: result.xml

  danger:
    docker:

      - image: bytesguy/danger:latest
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
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

## Troubleshooting

If you are facing build failures while executing your jobs, check out our [support center knowledge base](https://support.circleci.com/hc/en-us/categories/115001914008-Mobile) for answers to common issues.

## 関連項目
{:.no_toc}

- See the [`circleci-demo-ios` GitHub repository](https://github.com/CircleCI-Public/circleci-demo-ios) for a full example of how to build, test, sign and deploy an iOS project using Fastlane on CircleCI.
- See the [iOS Project Tutorial]({{ site.baseurl }}/2.0/ios-tutorial/) for a config walkthrough.
- See the [iOS code signing documentation]({{ site.baseurl}}/2.0/ios-codesigning/) to learn how to configure Fastlane Match for your project.