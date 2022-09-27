---
layout: classic-docs
title: "Setting Up Code Signing for iOS Projects"
short-title: "Code Signing for iOS Projects"
description: "How to set up code signing for an iOS app"
categories: [platforms]
order: 40
contentTags: 
  platform:
  - Cloud
---

This document describes the guidelines for setting up code signing
for your iOS project on CircleCI.

* TOC
{:toc}

## Basic configuration of iOS projects
{: #basic-configuration-of-ios-projects }

This document assumes that you already have an iOS project building
correctly on CircleCI using our recommended best practices. It also assumes that you use Bundler and
Fastlane, and have a `Gemfile`, `Appfile` and `Fastfile` checked into
your repo.

If you have not yet configured your iOS project on CircleCI,
you can find the configuration instructions in the [Testing iOS Applications document]({{ site.baseurl }}/testing-ios/).

**Note:** CircleCI only officially supports Fastlane Match for code signing. Other methods may be used, but are not guaranteed to work and are unsupported.

## Setting up Fastlane Match
{: #setting-up-fastlane-match }

Code signing must be configured to generate
ad-hoc distributions of your app and App Store builds.

[Fastlane Match](https://docs.fastlane.tools/actions/match/) is one of the [Fastlane
tools](https://fastlane.tools/), and it allows for seamless
configuration for code signing in both your local development environment and on
CircleCI. Fastlane Match stores all of your code signing certificates and
provisioning profiles in a git repository/AWS S3 Bucket/Google Cloud Storage, and downloads and installs
the necessary certificates and profiles when required.

In this example configuration, we will set up and use a git repository for storage.

To set up Fastlane Match:

* On your local machine, open Terminal and navigate to the root directory of your repository
* Run `bundle exec fastlane match init`
* Follow the instructions to configure the Match repository
* After the above is complete, run `bundle exec fastlane match development` to generate and
install the Development certificates and profiles
* Then, run `bundle exec fastlane match adhoc` to generate and install the Ad-hoc distribution
certificates and profiles.

### Preparing your Xcode project for use with Fastlane Match
{: #preparing-your-xcode-project-for-use-with-fastlane-match }
{:.no_toc}

Before setting up Match you must ensure that the code signing
settings in your Xcode project are configured as follows:

* **Signing & Capabilities -> Signing** uncheck *Automatically manage signing* for both Debug and Release
* **Signing & Capabilities -> Provisioning Profile** choose the appropriate profile created by Fastlane Match (e.g., `match adhoc com.circleci.helloworld`)

### Adding Match to the Fastlane lane
{: #adding-match-to-the-fastlane-lane }
{:.no_toc}

On CircleCI, Fastlane Match will need to be run every time you build and sign your app. The easiest way to do this is to add the `match` action to the lane which builds your app.

**Note:** For the `match` action to work correctly, you *must* add `setup_circle_ci` to `before_all` in your `Fastfile`. This ensures that a temporary Fastlane keychain with full permissions is used. Without using this you may see build failures or inconsistent results.

```ruby
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

### Adding a user key to the CircleCI project
{: #adding-a-user-key-to-the-circleci-project }
{:.no_toc}

To enable Fastlane Match to download the certificates and the keys
from GitHub, it is necessary to add a user key with access to both the
project repo and the certificates / keys repo to the CircleCI project.

To add a user key:

* In the CircleCI application, go to your project’s settings by clicking the the Project Settings button (top-right on the Pipelines page of the project).
* On the Project Settings page, click on SSH Keys (vertical menu on the left).
* Click the *Add User Key* button and follow the steps to authorize CircleCI

**Note:** This action will give the CircleCI project the
same GitHub permissions as the user who will be clicking the *Authorize
with GitHub* button.

In your `Matchfile`, the `git_url` should be an **SSH** URL ( in the `git@github.com:...` format), rather than a **HTTPS** URL. Otherwise you may see authentication errors when you attempt to use match. For example:

```ruby
git_url("git@github.com:fastlane/certificates")
app_identifier("tools.fastlane.app")
username("user@fastlane.tools")
```

It is best practice to create a machine user with access to just the
project repo and the keys repo, and use that machine user to create a
user key to reduce the level of GitHub access granted to the CircleCI project.

After you have added a user key, CircleCI will be able to checkout both the
project repo and the Fastlane Match repo from GitHub.

### Adding the Match passphrase to the project
{: #adding-the-match-passphrase-to-the-project }
{:.no_toc}

To enable Fastlane Match to decrypt the certificates and profiles stored in
the GitHub repo, it is necessary to add the encryption passphrase that
you configured in the Match setup step to the CircleCI project's
 environment variables.

In the project settings on CircleCI, click on **Environment Variables** and add the `MATCH_PASSWORD` variable. Set its value to your encryption passphrase. The passphrase will be stored
encrypted at rest.

### Building and code-signing the app on CircleCI
{: #invoking-the-fastlane-test-lane-on-circleci }
{:.no_toc}

After you have configured Match and added its invocation into the appropriate
lane, you can run that lane on CircleCI. The following `config.yml` will
create an Ad-hoc build every time you push to the `development` branch:

```yaml
# .circleci/config.yml
version: 2
jobs:
  build-and-test:
    macos:
      xcode: 12.5.1
    steps:
      # ...
      - run: bundle exec fastlane test

  adhoc:
    macos:
      xcode: 12.5.1
    steps:
      # ...
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

## Sample configuration files
{: #sample-configuration-files }

The best practice configuration for setting up code signing for iOS projects is as follows:

```ruby
# fastlane/fastfile
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

By setting the `FL_OUTPUT_DIR:` env, that will tell Fastlane to output the XCode and Fastlane logs to that directory, so they get uploaded as artifacts for ease in troubleshooting.

## Example application on GitHub
{: #example-application-on-github }

See the [`circleci-demo-ios` GitHub repository](https://github.com/CircleCI-Public/circleci-demo-ios)
for an example of how to configure code signing for iOS apps using
Fastlane Match.
