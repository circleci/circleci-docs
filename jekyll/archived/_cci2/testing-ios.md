---
layout: classic-docs
title: Testing iOS applications on macOS
short-title: Testing iOS applications on macOS.
categories: [platforms]
description: Testing iOS applications on macOS.
contentTags:
  platform:
  - Cloud
---

This document describes how to set up and customize testing for an iOS application with CircleCI.

## Overview
{: #overview }

CircleCI offers support for building, testing and deploying iOS projects in macOS virtual machines. Each image provided has a set of common tools installed, such as Ruby and OpenJDK, alongside a version of Xcode. For more information about supplied images, refer to the [software manifest](#supported-xcode-versions) for each Xcode image.

There is documentation for [iOS code signing projects](/docs/ios-codesigning/) and [getting started on MacOS](/docs/hello-world-macos/).

## Supported Xcode versions
{: #supported-xcode-versions }

### Supported Xcode versions for Intel
{: #supported-xcode-versions-intel}

{% include snippets/xcode-intel-vm.md %}

### Supported Xcode versions for Apple silicon
{: #supported-xcode-versions-silicon}

{% include snippets/xcode-silicon-vm.md %}

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

Simple projects should run with minimal configuration.

## Using Fastlane
{: #using-fastlane }

[Fastlane](https://fastlane.tools/) is a set of tools for automating the build and deploy process of mobile apps. We encourage the use of Fastlane on CircleCI as it simplifies the setup and automation of the build, test and deploy process. Additionally, it allows parity between local and CircleCI builds.

### Adding a Gemfile
{: #adding-a-gemfile }

It is recommended to add a `Gemfile` to your repository to make sure that the same version of Fastlane is used both locally and on CircleCI and that all dependencies are installed. Below is a sample of a simple `Gemfile`:

```ruby
# Gemfile
source "https://rubygems.org"
gem 'fastlane'
```

After you have created a `Gemfile` locally, you will need to run `bundle install` and check both `Gemfile` and `Gemfile.lock` into your project repository.

### Setting up Fastlane for use on CircleCI
{: #setting-up-fastlane-for-use-on-circleci }

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

* Create a new temporary keychain for use with Fastlane Match (see the code signing section for more details).
* Switch Fastlane Match to `readonly` mode to make sure CI does not create new code signing certificates or provisioning profiles.
* Set up log and test result paths to be easily collectible.

### Example Configuration for Using Fastlane on CircleCI
{: #example-configuration-for-using-fastlane-on-circleci }

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

This configuration can be used with the following CircleCI configuration file:

```yaml
# .circleci/config.yml
version: 2.1
jobs:
  build-and-test:
    macos:
      xcode: 14.0.1
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
      xcode: 14.0.1
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

### Code signing with Fastlane Match
{: #code-signing-with-fastlane-match }

We recommend the use of Fastlane Match for signing your iOS applications as it simplifies and automates the process of code signing both locally and in the CircleCI environment.

For more information on how to get started with Fastlane Match, visit the [iOS code signing](/docs/ios-codesigning/) page.

## Using Ruby
{: #using-ruby }

Our Xcode images ship with multiple versions of Ruby installed. The versions we install are the latest stable versions of Ruby, according to [Ruby-Lang.org downloads page](https://www.ruby-lang.org/en/downloads/), at the time the image is built. The versions of Ruby that are installed in each image, along with the default Ruby selected for that image, are listed in the software manifests of each container (see [supported Xcode versions](#supported-xcode-versions)).

Installing gems with the system Ruby is not advised due to the restrictive permissions enforced on the system directories. As a general rule, CircleCI advises using one of the alternative Rubies provided by Chruby (as configured by default in all images) for jobs.
{: class="alert alert-info" }

### Switching Rubies with the macOS orb
{: #switching-rubies-with-the-macos-orb }

Using the official macOS orb (version `2.0.0` and above) is the easiest way to switch Rubies in your jobs. It automatically uses the correct switching command, regardless of which Xcode image is in use.

To get started, include the orb at the top of your configuration:

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
      version: "3.1"
```

Replace `3.1` with the version you require from the Software Manifest file. You do not need to specify the full Ruby version, `3.1.3` for example, just the major version. This will ensure your configuration does not break when switching to newer images that might have newer patch versions of Ruby.

To switch back to the system default Ruby (the Ruby shipped by Apple with macOS), define the `version` as `system`:

```yaml
steps:
  # ...
  - macos/switch-ruby:
      version: "system"
```

### Switching Rubies manually
{: #switching-rubies-manually }

For Xcode version `14.2` and higher, add the following to the beginning of your job.

```yaml
steps:
  # ...
  - run:
      name: Set Ruby Version
      command: rbenv global 3.1.3 && rbenv rehash
```

Replace `3.1.3` with the version of Ruby required.

To revert back to the system Ruby, specify `system` as the Ruby version.

For Xcode versions `14.1` and lower, add the following to the beginning of your job.

```yaml
steps:
  # ...
  - run:
      name: Set Ruby Version
      command: sed -i '' 's/^chruby.*/chruby ruby-3.1.3/g' ~/.bash_profile
```

Replace `3.1.3` with the version of Ruby required.

To revert back to the system Ruby, specify `system` as the Ruby version.

### Installing additional Ruby versions
{: #installing-additional-ruby-versions }

Installing additional Ruby versions consumes a lot of job time. We only recommend doing this if you must use a specific version that is not installed in the image by default.
{: class="alert alert-info" }

To run a job with a version of Ruby that is not pre-installed, you must install the required version of Ruby.

For Xcode versions `14.2` and higher, this can be done with the `rbenv install` command, ensuring you pass the version of Ruby required. If a newer version of Ruby is not available, you will need to update the `ruby-build` package (`brew upgrade ruby-build`) to ensure the latest Ruby version definitions are available.

For Xcode versions `14.1` and lower, we use the [ruby-install](https://github.com/postmodern/ruby-install) tool to install the required version. After the install is complete, you can select it using the appropriate technique above.

### Using custom versions of CocoaPods and other Ruby gems
{: #using-custom-versions-of-cocoapods-and-other-ruby-gems }


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

## Using NodeJS
{: #using-nodejs }

The Xcode images are supplied with at least one version of NodeJS ready to use.

### Images using Xcode 13 and later
{: #images-using-xcode-13-and-later }

These images have NodeJS installations managed by `nvm` and will always be supplied with the latest `current` and `lts` release as of the time the image was built Additionally, `lts` is set as the default NodeJS version.

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

Version information for the installed NodeJS versions can be found in the software manifests for the image (see [supported Xcode versions](#supported-xcode-versions)).

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

After the app has been tested and signed, you are ready to configure deployment to your service of choice, such as App Store Connect or TestFlight. For more information on how to deploy to various services, including example Fastlane configurations, check out the [deploying iOS apps guide](/docs/deploy-ios-applications/).

## Troubleshooting
{: #troubleshooting }

If you are facing build failures while executing your jobs, check out our [support center knowledge base](https://support.circleci.com/hc/en-us/categories/115001914008-Mobile) for answers to common issues.

## Next steps
{: #next-steps }

- See the [`circleci-demo-ios` GitHub repository](https://github.com/CircleCI-Public/circleci-demo-ios) for a full example of how to build, test, sign and deploy an iOS  project using Fastlane on CircleCI.
- See the [iOS code signing](/docs/ios-codesigning/) page to learn how to configure Fastlane Match for your project.
