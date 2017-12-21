---
layout: classic-docs
title: "Setting Up Code Signing for iOS Projects"
short-title: "Code Signing for iOS Projects"
description: "How to set up code signing for an iOS or Mac app"
categories: [platforms]
order: 40
---

*[Docker, Machine, and iOS Builds]({{ site.baseurl }}/2.0/build/) > Setting Up Code Signing for iOS Projects*

This document describes the guidelines for setting up code signing
for your iOS or Mac project on CircleCI 2.0.

* TOC
{:toc}

## Basic Configuration of iOS Projects

This document assumes that you already have an iOS or Mac project building
correctly on CircleCI 2.0. It also assumes that you use Bundle and
Fastlane, and have a `Gemfile`, `Appfile` and `Fastfile` checked into
your repo.

**Note:** Setting up code signing on
CircleCI 2.0 using Fastlane Match requires *adding a User key* to your
CircleCI project.

If you have not yet configured your iOS or Mac project on CircleCI 2.0,
you can find the configuration instructions in the [Testing iOS Applications on macOS document]({{ site.baseurl }}/2.0/testing-ios/).

## Setting up Fastlane Match

Code signing must be configured to generate
ad-hoc distributions of your app and App Store builds.

[Fastlane Match](https://codesigning.guide/) is one of the [Fastlane
tools](https://fastlane.tools/), and it allows for seamless
configuration on code signing in both the development environment and on
CircleCI. Fastlane Match stores all of your code signing keys and
provisioning profiles in a GitHub repository, and downloads and installs
the necessary keys and profiles with a single command.

In the root of your repository, run `bundle exec fastlane match init`
and follow the instructions to configure the Match repository. After configuration is complete, run `bundle exec fastlane match development` to generate and
install the Development keys and profiles, and then run `bundle exec
fastlane match adhoc` to generate and install the Ad-hoc distribution
keys and profiles.

### Preparing Your Xcode Project for use With Fastlane Match

Before setting up Match you must ensure that the code signing
settings in your Xcode project are configured as follows:

* **Build Settings -> Code Signing Style** is set to *Manual*
* **Build Settings -> Development Team** is set to your development team ID
* **Build Settings -> Code Signing Identity** is set to:
  * *iOS Developer* for the Debug configuration
  * *iOS Distribution* for the Release configuration

In the target that you will be using for ad-hoc builds:
* **Build Settings -> Provisioning Profile (Deprecated)** is set to the
*Match AdHoc* profile.

### Adding Match to the Fastlane Lane

On CircleCI, Fastlane Match will need to be run every time you are
going to generate an Ad-hoc build of your app. The easiest way to
achieve that is to create a custom Fastlane lane just for that. It is best practice to create a Fastfile similar to the following:

```
# fastlane/Fastfile
default_platform :ios

platform :ios do
  before_all do
    setup_circle_ci
  end

  desc "Build and run tests"
  lane :test do
    scan
  end

  desc "Ad-hoc build"
  lane :adhoc do
    match(type: "adhoc")
    gym(export_method: "ad-hoc")
  end
  ...
end
```

### Adding a User key to the CircleCI Project

To enable Fastlane Match to download the certificates and the keys
from GitHub, it is necessary to add a user key with access to both the
project repo and the certificates / keys repo to the CircleCI project.
In the project settings, navigate to **Permissions -> Checkout SSH
Keys -> Add user key** and click *Authorize with GitHub*.

**Note:** This action will give the CircleCI project the
same GitHub permissions as the user who will be clicking the *Authorize
with GitHub* button.

It is best practice to create a machine user with access to just the
project repo and the keys repo, and use that machine user to create a
user key to reduce the level of GitHub access granted to the CircleCI project.

After you have added a user key, CircleCI will be able to checkout both the
project repo and the code signing certificates / keys repo from GitHub.

### Adding the Match Passphrase to the Encrypted Environment Variables

To enable Fastlane Match to decrypt the keys and profiles stored in
the GitHub repo, it is necessary to add the encryption passphrase that
you configured in the Match setup step to the CircleCI project's
encrypted environment variables.

In the project settings on CircleCI, navigate to **Build Settings ->
Environment Variables** and add the `MATCH_PASSWORD` variable, and set
its value to your encryption passphrase. The passphrase will be stored
encrypted at rest.

### Invoking the Fastlane Test Lane on CircleCI

After you have configured Match and added its invocation into the Ad-hoc
lane, you can run that lane on CircleCI. The following `config.yml` will
create an Ad-hoc build every time you push to the `development` branch:

```
# .circleci/config.yml
version: 2
jobs:
  build-and-test:
    macos:
      xcode: "9.0"
    steps:
      ...
      - run: bundle exec fastlane test
      ...

  adhoc:
    macos:
      xcode: "9.0"
    steps:
      ...
      - run: bundle exec fastlane adhoc

workflows:
  version: 2
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

## Sample Configuration Files

The best practice configuration for setting up code signing for iOS and
Mac projects is as follows:

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

```
# .circleci/config.yml
version: 2
jobs:
  build-and-test:
    macos:
      xcode: "9.0"
    working_directory: /Users/distiller/output
    environment:
      FL_OUTPUT_DIR: $CIRCLE_WORKING_DIRECTORY
      FASTLANE_LANE: test
    shell: /bin/bash --login -o pipefail
    steps:
      - checkout
      - run: mkdir $FL_OUTPUT_DIR
      - run: bundle install
      - run:
          name: Fastlane
          command: bundle exec fastlane $FASTLANE_LANE
      - run:
          command: cp $FL_OUTPUT_DIR/scan/report.junit $FL_OUTPUT_DIR/scan/results.xml
          when: always
      - store_artifacts:
          path: /Users/distiller/output
      - store_test_results:
          path: /Users/distiller/output/scan

  adhoc:
    macos:
      xcode: "9.0"
    working_directory: /Users/distiller/output
    environment:
      FL_OUTPUT_DIR: $CIRCLE_WORKING_DIRECTORY
      FASTLANE_LANE: adhoc
    shell: /bin/bash --login -o pipefail
    steps:
      - checkout
      - run: bundle install
      - run:
          name: Fastlane
          command: bundle exec fastlane $FASTLANE_LANE
      - store_artifacts:
          path: /Users/distiller/output

workflows:
  version: 2
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

## Example Application on GitHub

See the [`circleci-demo-ios` GitHub repository](https://github.com/CircleCI-Public/circleci-demo-ios)
for an example of how to configure code signing for iOS apps using
Fastlane Match.
