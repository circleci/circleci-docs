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

There is documentation for [an iOS example project]({{ site.baseurl}}/ios-tutorial/) and [getting started on MacOS]({{ site.baseurl }}/hello-world-macos/).

## Supported Xcode versions
{: #supported-xcode-versions }

{% include snippets/xcode-versions.md %}

**Xcode image removal notice:** In accordance with our [Xcode image policy]({{ site.baseurl}}/xcode-policy), deprecated macOS images will be removed on August 2, 2022. For a list of impacted images, refer to the [Xcode Image Deprecation post](https://discuss.circleci.com/t/xcode-image-deprecation/44294) in the Discuss forum.
{: class="alert alert-warning"}

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
[iOS Project Tutorial]({{ site.baseurl }}/ios-tutorial/).

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

For more information on how to get started with Fastlane Match, please see our [iOS code signing documentation]({{ site.baseurl}}/ios-codesigning/).

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

These images are also compatible with the official [CircleCI Node orb](https://circleci.com/developer/orbs/orb/circleci/node), which helps to manage your NodeJS installation along with caching packages.

### Images using Xcode 12.5 and earlier
{: #images-using-xcode-125-and-earlier }

These images come with at least one version of NodeJS installed directly using `brew`.

Version information for the installed NodeJS versions can be found in [the software manifests for the image](#supported-xcode-versions)].

These images are also compatible with the official [CircleCI Node orb](https://circleci.com/developer/orbs/orb/circleci/node) which helps to manage your NodeJS installation, by installing `nvm`, along with caching packages.

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

After the app has been tested and signed, you are ready to configure deployment to your service of choice, such as App Store Connect or TestFlight. For more information on how to deploy to various services, including example Fastlane configurations, check out the [deploying iOS apps guide]({{site.baseurl}}/deploy-ios-applications/)

## Troubleshooting
{: #troubleshooting }

If you are facing build failures while executing your jobs, check out our [support center knowledge base](https://support.circleci.com/hc/en-us/categories/115001914008-Mobile) for answers to common issues.

## Next steps
{: #next-steps }

- See the [`circleci-demo-ios` GitHub repository](https://github.com/CircleCI-Public/circleci-demo-ios)
for a full example of how to build, test, sign and deploy an iOS project
using Fastlane on CircleCI.
- See the [iOS Project Tutorial]( {{ site.baseurl }}/ios-tutorial/) for a config walkthrough.
- See the [iOS code signing documentation]({{ site.baseurl}}/ios-codesigning/) to learn how to configure Fastlane Match for your project.
