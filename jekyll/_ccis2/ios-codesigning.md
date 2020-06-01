---
layout: classic-docs
title: "Setting Up Code Signing for iOS Projects"
short-title: "Code Signing for iOS Projects"
description: "How to set up code signing for an iOS or Mac app"
categories: [platforms]
order: 40
---

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
CircleCI 2.0 using Fastlane Match requires *adding a User key** to your
CircleCI project. Setting up code signing is quite different than it was in CircleCI 1.0. The 2.0 documentation has been updated to reflect that the CircleCI app is not used, only the config instructions below are used for code signing in 2.0.

**Note**: If you would like to proceed without using Fastlane Match, [this blog post](https://medium.com/@m4rr/circleci-2-0-and-the-ios-code-signing-df434d0086e2) provides an overview of how you can do this with CircleCI.

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
{:.no_toc}

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
{:.no_toc}

On CircleCI, Fastlane Match will need to be run every time you are
going to generate an Ad-hoc build of your app. The easiest way to
achieve that is to create a custom Fastlane lane just for that. It is best practice to create a Fastfile similar to the following:

**Note:** For `fastlane match` to work correctly, you _must_ add `setup_circle_ci` to `before_all` in your `Fastfile`. This ensures that a temporary Fastlane keychain is used.

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
{:.no_toc}

To enable Fastlane Match to download the certificates and the keys
from GitHub, it is necessary to add a user key with access to both the
project repo and the certificates / keys repo to the CircleCI project.
In the project settings, navigate to **Permissions -> Checkout SSH
Keys -> Add user key** and click *Authorize with GitHub*.

**Note:** This action will give the CircleCI project the
same GitHub permissions as the user who will be clicking the *Authorize
with GitHub* button.

In your `Matchfile`, the `git_url` should be an **SSH** URL ( in the `git@github.com:...` format), rather than a **HTTPS** URL. Otherwise you may see authentication errors when you attempt to use match. For example:

```
git_url("git@github.com:fastlane/certificates")
app_identifier("tools.fastlane.app")
username("user@fastlane.tools")
```

It is best practice to create a machine user with access to just the
project repo and the keys repo, and use that machine user to create a
user key to reduce the level of GitHub access granted to the CircleCI project.

After you have added a user key, CircleCI will be able to checkout both the
project repo and the code signing certificates / keys repo from GitHub.

### Adding the Match Passphrase to the Encrypted Environment Variables
{:.no_toc}

To enable Fastlane Match to decrypt the keys and profiles stored in
the GitHub repo, it is necessary to add the encryption passphrase that
you configured in the Match setup step to the CircleCI project's
encrypted environment variables.

In the project settings on CircleCI, navigate to **Build Settings ->
Environment Variables** and add the `MATCH_PASSWORD` variable, and set
its value to your encryption passphrase. The passphrase will be stored
encrypted at rest.

### Invoking the Fastlane Test Lane on CircleCI
{:.no_toc}

After you have configured Match and added its invocation into the Ad-hoc
lane, you can run that lane on CircleCI. The following `config.yml` will
create an Ad-hoc build every time you push to the `development` branch:

```
# .circleci/config.yml
version: 2
jobs:
  build-and-test:
    macos:
      xcode: 11.3.0
    steps:
      ...
      - run: bundle exec fastlane test
      ...

  adhoc:
    macos:
      xcode: 11.3.0
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

By setting the `FL_OUTPUT_DIR:` env, that will tell Fastlane to output the XCode and Fastlane logs to that directory, so they get uploaded as artifacts for ease in troubleshooting.

## Example Application on GitHub

See the [`circleci-demo-ios` GitHub repository](https://github.com/CircleCI-Public/circleci-demo-ios)
for an example of how to configure code signing for iOS apps using
Fastlane Match.

## See Also
{:.no_toc}

To read a blog post by Franz Busch at Sixt about their setup for CI with Fastlane and CircleCI, refer to the [Continuous integration and delivery with fastlane and CircleCI](https://medium.com/sixt-labs-techblog/continuous-integration-and-delivery-at-sixt-91ca215670a0) blog post on Medium.
