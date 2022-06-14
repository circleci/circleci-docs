---
layout: classic-docs
title: Testing iOS Applications on macOS
short-title: Testing iOS Applications on macOS
categories: [platforms]
description: Testing iOS applications on macOS
order: 30
version:
- Cloud
---

This document describes how to set up and customize testing for an iOS application with CircleCI in the following sections:

* TOC
{:toc}

## Overview
{: #overview }
{:.no_toc}

CircleCI offers support for building, testing and deploying iOS projects in macOS virtual machines. Each image provided has a set of common tools installed, such as Ruby and OpenJDK, alongside a version of Xcode. For more information about supplied images, refer to the [software manifest](#supported-xcode-versions) for each Xcode image.

There is documentation for [an iOS example project]({{ site.baseurl}}/2.0/ios-tutorial/) and [getting started on MacOS]({{ site.baseurl }}/2.0/hello-world-macos/).

## Using the macOS executor
{: #using-the-macos-executor }

Each `macos` job is run a fresh virtual machine, running a specified version macOS. We build a new image each time a new stable, or beta, version of Xcode is released by Apple and aim to get these deployed as soon as possible. Generally, the contents of a particular build image will remain unchanged, except in very exceptional circumstances we might be forced to re-build a container for a specific reason. Our goal is to keep your execution environment stable, and to allow you to opt-in to newer containers by setting the `xcode` key in your `config.yml` file.

Periodically, we will update the version of macOS each image includes to ensure the execution environment is as up to date as possible. When a new major version of macOS is released, we will generally switch to this once the new major version of Xcode reaches the `xx.2` release to ensure the execution environment is kept stable.

We announce the availability of new macOS containers, including Xcode betas, in the [annoucements section of our Discuss site](https://discuss.circleci.com/c/announcements).

### Beta image support
{: #beta-image-support }

We endeavour to make beta Xcode versions available on the macOS executor as soon as we can to allow developers to test their apps ahead of the next stable Xcode release.

Unlike our stable images (which are frozen and will not change), once a new beta image is released it will overwrite the previous beta image until a GM (stable) image is released, at which point the image is frozen and no longer updated. If you are requesting an image using an Xcode version that is currently in beta, please expect it to change when Apple releases a new Xcode beta with minimal notice. This can include breaking changes in Xcode/associated tooling which are beyond our control.

To read about our customer support policy regarding beta images, please check out the following [support center article](https://support.circleci.com/hc/en-us/articles/360046930351-What-is-CircleCI-s-Xcode-Beta-Image-Support-Policy-).

### Apple silicon support
{: #apple-silicon-support }

It is possible to build Apple Silicon/Universal binaries using Xcode `12.0.0` and higher as Apple provides both the Intel (`x86_64`) and Apple Silicon (`arm64`) toolchains in this release. Cross-compiling Apple Silicon binaries on Intel hosts has an additional overhead and as a result compilation times will be longer than native compilation for Intel.

Running or testing Apple Silicon apps natively is currently not possible as CircleCI build hosts are Intel-based Macs. Binaries will need to be exported as [artifacts]({{site.baseurl}}/2.0/artifacts/) for testing apps locally. Alternatively, [CircleCI runner]({{site.baseurl}}/2.0/runner-overview/#supported) can also be used to run jobs natively on Apple Silicon.

## Supported Xcode versions
{: #supported-xcode-versions }

 Config   | Xcode Version                   | macOS Version | VM Software Manifest | Bare Metal Software Manifest | Release Notes
----------|---------------------------------|---------------|----------------------------|-------------------|--------------
 `14.0.0` | Xcode 14 Beta 1 (14A5228q) | 12.4 | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v8161/index.html) | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/cci-macos-production-2916/index.html) | [Release Notes](https://discuss.circleci.com/t/xcode-14-beta-1-released/44345)
 `13.4.1` | Xcode 13.4 (13F17a) | 12.3.1 | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v8094/index.html) | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/cci-macos-production-2890/index.html) | [Release Notes](https://discuss.circleci.com/t/xcode-13-4-1-released/44328)
 `13.3.1` | Xcode 13.3 (13E500a) | 12.3.1 | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v7555/index.html) | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/cci-macos-production-2718/index.html) | [Release Notes](https://discuss.circleci.com/t/xcode-13-3-1-released/43675)
 `13.2.1` | Xcode 13.2.1 (13C100) | 11.6.2 | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v6690/index.html) | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/cci-macos-production-2243/index.html) | [Release Notes](https://discuss.circleci.com/t/xcode-13-2-1-released/42334)
 `13.1.0` | Xcode 13.1 (13A1030d) | 11.6.1 | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v6269/index.html) | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/cci-macos-production-2218/index.html) | [Release Notes](https://discuss.circleci.com/t/xcode-13-1-rc-released/41577)
 `13.0.0` | Xcode 13.0 (13A233) | 11.5.2 | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v6052/index.html) | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/cci-macos-production-1977/index.html) | [Release Notes](https://discuss.circleci.com/t/xcode-13-rc-released/41256)
 `12.5.1` | Xcode 12.5.1 (12E507) | 11.4.0 | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v5775/index.html) | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/cci-macos-production-1964/index.html) | [Release Notes](https://discuss.circleci.com/t/xcode-12-5-1-released/40490)
 `12.4.0` | Xcode 12.4 (12D4e) | 10.15.5 | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v4519/index.html) | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/cci-macos-production-1970/index.html) | [Release Notes](https://discuss.circleci.com/t/xcode-12-4-release/38993)
 `12.3.0` | Xcode 12.3 (12C33) | 10.15.5 | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v4250/index.html) | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/cci-macos-production-1971/index.html) | [Release Notes](https://discuss.circleci.com/t/xcode-12-3-release/38570)
 `12.2.0` | Xcode 12.2 (12B45b) | 10.15.5 | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v4136/index.html) | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/cci-macos-production-1975/index.html) | [Release Notes](https://discuss.circleci.com/t/xcode-12-2-released/38156)
 `12.1.1` | Xcode 12.1.1 RC (12A7605b) | 10.15.5 | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v4054/index.html) | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/cci-macos-production-2208/index.html) | [Release Notes](https://discuss.circleci.com/t/xcode-12-1-1-rc-released/38023)
 `12.0.1` | Xcode 12.0.1 (12A7300) | 10.15.5 | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v3933/index.html) | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/cci-macos-production-2216/index.html) | [Release Notes](https://discuss.circleci.com/t/xcode-12-0-1-released-xcode-12-0-0-deprecated/37630)
 `11.7.0` | Xcode 11.7 (11E801a) | 10.15.5 | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v3587/index.html) | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/cci-macos-production-2297/index.html) | [Release Notes](https://discuss.circleci.com/t/xcode-11-7-released/37312)
 `11.6.0` | Xcode 11.6 (11E708) | 10.15.5 | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v3299/index.html) | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/cci-macos-production-2299/index.html) | [Release Notes](https://discuss.circleci.com/t/xcode-11-6-released/36777/2)
 `11.5.0` | Xcode 11.5 (11E608c)    | 10.15.4 | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v2960/index.html) | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/cci-macos-production-2310/index.html) | [Release Notes](https://discuss.circleci.com/t/xcode-11-5-gm-released/36029/4)
 `11.4.1` | Xcode 11.4.1 (11E503a)    | 10.15.4 | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v2750/index.html) | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/cci-macos-production-2302/index.html) | [Release Notes](https://discuss.circleci.com/t/xcode-11-4-1-released/35559/2)
 `10.3.0` | Xcode 10.3 (10G8)         | 10.14.4 | [Installed software](https://circle-macos-docs.s3.amazonaws.com/image-manifest/v1925/index.html) | n/a<sup>(1)</sup> | [Release Notes](https://discuss.circleci.com/t/xcode-10-3-image-released/31561)
{: class="table table-striped"}

<sup>(1)</sup> _Xcode 10.3 is unsupported by our dedicated hosts. See the [Dedicated Host for macOS]({{ site.baseurl }}/2.0/dedicated-hosts-macos) page to learn more about this resource class._

**Note:** [macOS App UI Testing]({{ site.baseurl }}/2.0/testing-macos) is supported on Xcode 11.7 and higher

## Getting started
{: #getting-started }

Select a macOS project repository you would like to build from the **Projects** page of the [CircleCI web app](https://app.circleci.com/).

We highly recommend using [Fastlane](https://fastlane.tools) to build and sign your apps in CircleCI. Fastlane requires minimal configuration in most cases and simplifies the build-test-deploy process.

### Setting up your Xcode project
{: #setting-up-your-xcode-project }

After setting up the project on CircleCI, you will need to ensure that the scheme you intend to build with Fastlane is marked as "shared" in your Xcode project. In most new projects created by Xcode, the default scheme will already be marked as "shared". To verify this, or to share an existing scheme, complete the following steps:

1. In Xcode, choose Product -> Scheme -> Manage Schemes
2. Select the "Shared" option for the scheme to share, and click Close
3. Ensure the `myproject.xcodeproj/xcshareddata/xcschemes` directory is checked into your Git repository and push the changes

Simple projects should run with minimal configuration. You can find an
example of a minimal config in the
[iOS Project Tutorial]({{ site.baseurl }}/2.0/ios-tutorial/).

## Using Fastlane
{: #using-fastlane }

[Fastlane](https://fastlane.tools/) is a set of tools for automating the build and deploy process of mobile apps. We encourage the use of Fastlane on CircleCI as it simplifies the setup and automation of the build, test and deploy process. Additionally, it allows parity between local and CircleCI builds.

### Adding a Gemfile
{: #adding-a-gemfile }
{:.no_toc}

It is recommended to add a `Gemfile` to your repository to make sure that the same version of Fastlane is used both locally and on CircleCI and that all dependencies are installed. Below is a sample of a simple `Gemfile`:

```ruby
# Gemfile
source "https://rubygems.org"
gem 'fastlane'
```

After you have created a `Gemfile` locally, you will need to run `bundle install` and check both `Gemfile` and `Gemfile.lock` into your project repository.

### Setting up Fastlane for use on CircleCI
{: #setting-up-fastlane-for-use-on-circleci }
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

* Create a new temporary keychain for use with Fastlane Match (see the
code signing section for more details).
* Switch Fastlane Match to `readonly` mode to make sure CI does not create
new code signing certificates or provisioning profiles.
* Set up log and test result paths to be easily collectible.

### Example Configuration for Using Fastlane on CircleCI
{: #example-configuration-for-using-fastlane-on-circleci }
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
      xcode: 12.5.1
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
      xcode: 12.5.1
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
{: #code-signing-with-fastlane-match }

We recommend the use of Fastlane Match for signing your iOS applications as it simplifies and automates the process of code signing both locally and in the CircleCI environment.

For more information on how to get started with Fastlane Match, please see our [iOS code signing documentation]({{ site.baseurl}}/2.0/ios-codesigning/).

## Using Ruby
{: #using-ruby }

Our macOS images contain multiple versions of Ruby. The default version in use on all images is the system Ruby. The images also include the latest stable versions of Ruby at the time that the image is built. We determine the stable versions of Ruby using the [Ruby-Lang.org downloads page](https://www.ruby-lang.org/en/downloads/). The versions of Ruby that are installed in each image are listed in the [software manifests of each container](#supported-xcode-versions).

If you want to run steps with a version of Ruby that is listed as "available to chruby" in the manifest, then you can use [`chruby`](https://github.com/postmodern/chruby) to do so.

**Note:** Installing Gems with the system Ruby is not advised due to the restrictive permissions enforced on the system directories. As a general rule, we advise using one of the alternative Rubies provided by Chruby for all jobs.

### Switching Rubies with the macOS Orb (Recommended)
{: #switching-rubies-with-the-macos-orb-recommended }

Using the official macOS Orb (version `2.0.0` and above) is the easiest way to switch Rubies in your jobs. It automatically uses the correct switching command, regardless of which Xcode image is in use.

To get started, include the orb at the top of your config:

```yaml
# ...
orbs:
  macos: circleci/macos@2
```

Then, call the `switch-ruby` command with the version number required. For example, to switch to Ruby 2.6:

```yaml
steps:
  # ...
  - macos/switch-ruby:
      version: "2.6"
```

Replace `2.6` with the version you require from the Software Manifest file. You do not need to specify the full Ruby version, `3.0.2` for example, just the major version. This will ensure your config does not break when switching to newer images that might have newer patch versions of Ruby.

To switch back to the system default Ruby (the Ruby shipped by Apple with macOS), define the `version` as `system`:

```yaml
steps:
  # ...
  - macos/switch-ruby:
      version: "system"
```

**Note:** Xcode 11.7 images and later images default to Ruby 2.7 via `chruby` out of the box. Xcode 11.6 images and earlier default to the System Ruby.

### Images using Xcode 11.7 and later
{: #images-using-xcode-117-and-later }
{:.no_toc}

To switch to another Ruby version, add the following to the beginning of your job.

```yaml
steps:
  # ...
  - run:
      name: Set Ruby Version
      command: sed -i '' 's/^chruby.*/chruby ruby-3.0/g' ~/.bash_profile
```

Replace `3.0` with the version of Ruby required - you do not need to specify the full Ruby version, `3.0.2` for example, just the major version. This will ensure your config does not break when switching to newer images that might have newer patch versions of Ruby.

To revert back to the system Ruby, add the following to the beginning of your job:

```yaml
steps:
  # ...
  - run:
      name: Set Ruby Version
      command: sed -i '' 's/^chruby.*/chruby system/g' ~/.bash_profile
```

### Images using Xcode 11.2 and later
{: #images-using-xcode-112-and-later }
{:.no_toc}

To select a version of Ruby to use, add the `chruby` function to `~/.bash_profile`:

```yaml
steps:
  # ...
  - run:
      name: Set Ruby Version
      command: echo 'chruby ruby-2.6' >> ~/.bash_profile
```

Replace `2.6` with the version of Ruby required - you do not need to specify the full Ruby version, `2.6.5` for example, just the major version. This will ensure your config does not break when switching to newer images that might have slightly newer Ruby versions.

### Images using Xcode 11.1 and earlier
{: #images-using-xcode-111-and-earlier }
{:.no_toc}

To specify a version of Ruby to use, you can [create a file named `.ruby-version`, as documented by `chruby`](https://github.com/postmodern/chruby#auto-switching). This can be done from a job step, for example:

```yaml
steps:
  # ...
  - run:
      name: Set Ruby Version
      command:  echo "ruby-2.4" > ~/.ruby-version
```

Replace `2.4` with the version of Ruby required - you do not need to specify the full Ruby version, `2.4.9` for example, just the major version. This will ensure your config does not break when switching to newer images that might have slightly newer Ruby versions.

### Installing additional Ruby versions
{: #installing-additional-ruby-versions }

**Note:** Installing additional Ruby versions consumes a lot of job time. We only recommend doing this if you must use a specific version that is not installed in the image by default.

To run a job with a version of Ruby that is not pre-installed, you must install the required version of Ruby. We use the [ruby-install](https://github.com/postmodern/ruby-install) tool to install the required version. After the install is complete, you can select it using the appropriate technique above.

### Using Custom Versions of CocoaPods and Other Ruby Gems
{: #using-custom-versions-of-cocoapods-and-other-ruby-gems }
{:.no_toc}

To make sure the version of CocoaPods that you use locally is also used
in your CircleCI builds, we suggest creating a Gemfile in your iOS
project and adding the CocoaPods version to it:

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

## Using NodeJS
{: #using-nodejs }

The Xcode images are supplied with at least one version of NodeJS ready to use.

### Images using Xcode 13 and later
{: #images-using-xcode-13-and-later }

These images have NodeJS installations managed by `nvm` and will always be supplied with the latest `current` and `lts` release as of the time the image was built. Additionally, `lts` is set as the default NodeJS version.

Version information for the installed NodeJS versions can be found in [the software manifests for the image](#supported-xcode-versions)], or by running `nvm ls` during a job.

To set the `current` version as the default:

```yaml
# ...
steps:
  - run: nvm alias default node
```

To revert to the `lts` release:

```yaml
# ...
steps:
  - run: nvm alias default --lts
```

To install a specific version of NodeJS and use it:

```yaml
# ...
steps:
  - run: nvm install 12.22.3 && nvm alias default 12.22.3
```

These images are also compatiable with the official [CircleCI Node orb](https://circleci.com/developer/orbs/orb/circleci/node), which helps to manage your NodeJS installation along with caching packages.

### Images using Xcode 12.5 and earlier
{: #images-using-xcode-125-and-earlier }

These images come with at least one version of NodeJS installed directly using `brew`.

Version information for the installed NodeJS versions can be found in [the software manifests for the image](#supported-xcode-versions)].

These images are also compatiable with the official [CircleCI Node orb](https://circleci.com/developer/orbs/orb/circleci/node) which helps to manage your NodeJS installation, by installing `nvm`, along with caching packages.

## Using Homebrew
{: #using-homebrew }

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

## Configuring deployment
{: #configuring-deployment }

After the app has been tested and signed, you are ready to configure deployment to your service of choice, such as App Store Connect or TestFlight. For more information on how to deploy to various services, including example Fastlane configurations, check out the [deploying iOS apps guide]({{ site.baseurl }}/2.0/deploying-ios/)

## Reducing job time and best practises
{: #reducing-job-time-and-best-practises }

### Pre-starting the simulator
{: #pre-starting-the-simulator }

Pre-start the iOS simulator before building your
application to make sure that the simulator is booted in time.
Doing so generally reduces the number of simulator
timeouts observed in builds.

To pre-start the simulator, add the macOS Orb (version `2.0.0` or higher) to your config:

```yaml
orbs:
  macos: circleci/macos@2
```

Then call the `preboot-simulator` command, as shown in the example below:

```yaml
steps:
  - macos/preboot-simulator:
      version: "15.0"
      platform: "iOS"
      device: "iPhone 13 Pro Max"
```

It is advisable to place this command early in your job to allow maximum time for the simulator to boot in the background.

If you require an iPhone simulator that is paired with an Apple Watch simulator, use the `preboot-paired-simulator` command in the macOS Orb:

```yaml
steps:
  - macos/preboot-paired-simulator:
      iphone-device: "iPhone 13"
      iphone-version: "15.0"
      watch-device: "Apple Watch Series 7 - 45mm"
      watch-version: "8.0"
```

**Note:** It may take a few minutes to boot a simulator, or longer if booting a pair of simulators. During this time, any calls to commands such as `xcrun simctl list` may appear to hang while the simulator is booting up.

### Collecting iOS simulator crash reports
{: #collecting-ios-simulator-crash-reports }
{:.no_toc}

Often if your `scan` step fails, for example due to a test runner timeout, it is likely that your app has crashed during the test run. In such cases, collecting crash report is useful for diagnosing the exact cause of the crash. Crash reports can be uploaded as artifacts, as follows:

```yaml
steps:
  # ...
  - store_artifacts:
    path: ~/Library/Logs/DiagnosticReports
```

### Optimizing Fastlane
{: #optimizing-fastlane }
{:.no_toc}

By default, Fastlane Scan generates test output reports in `html` and `junit` formats. If your tests are taking a long time and you do not need these reports, consider disabling them by altering the `output_type` parameter as described in the [fastlane docs](https://docs.fastlane.tools/actions/run_tests/#parameters).

### Optimizing Cocoapods
{: #optimizing-cocoapods }
{:.no_toc}

In addition to the basic setup steps, it is best practice to use Cocoapods 1.8 or newer which allows the use of the CDN, rather than having to clone the entire Specs repo. This will allow you to install pods faster, reducing build times. If you are using Cocoapods 1.7 or older, consider upgrading to 1.8 or newer as this change allows for much faster job execution of the `pod install` step.

To enable this, ensure the first line in your Podfile is as follows:

```
source 'https://cdn.cocoapods.org/'
```

If upgrading from Cocoapods 1.7 or older, additionally ensure the following line is removed from your Podfile, along with removing the "Fetch CocoaPods Specs" step in your CircleCI Configuration:

```
source 'https://github.com/CocoaPods/Specs.git'
```

To update Cocoapods to the latest stable version, simply update the Ruby gem with the following command:

```shell
sudo gem install cocoapods
```

We also recommend that you check your [Pods directory into source control](http://guides.cocoapods.org/using/using-cocoapods.html#should-i-check-the-pods-directory-into-source-control). This will ensure that you have a deterministic, reproducible build.

**Note:** The previous S3 mirror we provided for the Cocoapods Spec repo is no longer being maintained or updated since the release of Cocoapods 1.8. It will remain available to prevent existing jobs breaking, we highly recommend switching to the CDN method described above.

### Optimizing Homebrew
{: #optimizing-homebrew }
{:.no_toc}

Homebrew, by default, will check for updates at the start of any operation. As Homebrew has a fairly frequent release cycle, this means that any step which calls `brew` can take some extra time to complete.

If build speed, or bugs introduced by new Homebrew updates are a concern, this automatic update feature can be disabled. On average, this can save up to 2-5 minutes per job.

To disable this feature, define the `HOMEBREW_NO_AUTO_UPDATE` environment variable within your job:

```yaml
version: 2.1
jobs:
  build-and-test:
    macos:
      xcode: 12.5.1
    environment:
      HOMEBREW_NO_AUTO_UPDATE: 1
    steps:
      - checkout
      - run: brew install wget
```

## Supported build and test tools
{: #supported-build-and-test-tools }

With the macOS executor on CircleCI, it is possible to customize your build as needed to satisfy almost any iOS build and test strategy.

### Common test tools
{: #common-test-tools }
{:.no_toc}

The following common test tools are known to work well on CircleCI:

* [XCTest](https://developer.apple.com/library/ios/documentation/DeveloperTools/Conceptual/testing_with_xcode/chapters/01-introduction.html)
* [Kiwi](https://github.com/kiwi-bdd/Kiwi)
* [KIF](https://github.com/kif-framework/KIF)
* [Appium](http://appium.io/)

### React Native projects
{: #react-native-projects }
{:.no_toc}

React Native projects can be built on CircleCI using `macos` and `docker` executor types. For an example of configuring a React Native project, please see [our demo React Native application](https://github.com/CircleCI-Public/circleci-demo-react-native)

### Creating a `config.yml` File
{: #creating-a-configyml-file }
{:.no_toc}

The most flexible way to customize your build is to modify the CircleCI configuration for your project in `.circleci/config.yml`. This allows you to run arbitrary bash commands as well as utilise built-in features such as workspaces and caching. See the [Configuring CircleCI]( {{ site.baseurl }}/2.0/configuration-reference/) documentation for a detailed description of the structure of the `config.yml` file.

## Using Multiple Executor Types (macOS + Docker)
{: #using-multiple-executor-types-macos-docker }

It is possible to use multiple [executor types]({{site.baseurl}}/2.0/executor-intro/) in the same workflow. In the following example each push of an iOS project will be built on macOS, and additional iOS tools ([SwiftLint](https://github.com/realm/SwiftLint) and [Danger](https://github.com/danger/danger)) will be run in Docker.

```yaml
version: 2.1
jobs:
  build-and-test:
    macos:
      xcode: 12.5.1
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
{: #troubleshooting }

If you are facing build failures while executing your jobs, check out our [support center knowledge base](https://support.circleci.com/hc/en-us/categories/115001914008-Mobile) for answers to common issues.

## See also
{: #see-also }
{:.no_toc}

- See the [`circleci-demo-ios` GitHub repository](https://github.com/CircleCI-Public/circleci-demo-ios)
for a full example of how to build, test, sign and deploy an iOS project
using Fastlane on CircleCI.
- See the [iOS Project Tutorial]( {{ site.baseurl }}/2.0/ios-tutorial/) for a config walkthrough.
- See the [iOS code signing documentation]({{ site.baseurl}}/2.0/ios-codesigning/) to learn how to configure Fastlane Match for your project.
