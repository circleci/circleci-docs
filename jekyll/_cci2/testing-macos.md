---
layout: classic-docs
title: Testing macOS Applications
short-title: Testing macOS Applications
categories: [platforms]
description: Testing macOS Applications
order: 
---

This document describes how to configure CircleCI for macOS app UI testing.

* TOC
{:toc}

## Overview
{:.no_toc}

CircleCI supports testing macOS apps on the macOS executor and by utilising Fastlane, and the macOS permissions orb, this can be set up quickly and easily.

By setting up automated macOS app testing on CircleCI, you can easily test your app against different versions of macOS and add automation to your development pipeline.

**Note:** Testing macOS apps is only supported on Xcode 11.7 images and newer.

## Concepts

To test a macOS app, the Xcode Runner requires the ability to take control of the app under test to allow it to spoof user interactions. Over time, Apple has increased security in macOS and now triggering a macOS app UI test will cause a popup permissions dialog to ask whether you wish to allow control. On a local development machine this is not an issue, however, in a headless CI environment, it is not possible to interact with the UI.

Apple does not provide an alternative command line based tool for granting permissions, but there is a workaround. By manually modifying the permissions database, we can insert new permissions which will allow Xcode Helper to interact with apps. This file, called `TCC.db`, is responsible for holding information about the permissions that have been requested and granted, or denied, for each app.

There are two unique `TCC.db` files in use. The first copy resides in the home directory `~/Library/Application Support/com.apple.TCC/TCC.db` and the second is in `/Library/Application Support/com.apple.TCC/TCC.db`. When adding, or modifying, permissions we need to edit both of these files to ensure the permissions are available at runtime. 

While it is possible to write to the copy that is located in the home directory, it is not possible to write to `/Library/Application Support/com.apple.TCC/TCC.db` with System Integrity Protection enabled (since macOS Mojave). On CircleCI, all images from Xcode 11.7 and newer have System Integrity Protection disabled. Attempting to write to `TCC.db` on an image with System Integrity Protection enabled will cause a job failure.

While it can be written to manually with `sqlite3` commands, [CircleCI provides an Orb](https://circleci.com/orbs/registry/orb/circleci/macos) to simplify this.

## Setting up a macOS UI Test Project

Configuring CircleCI to run UI tests on a macOS app is split into two parts. Firstly, the CircleCI config needs to add the correct permissions and set up the environment to run the tests. Secondly, Fastlane needs to be configured to execute the tests.

### Configuring CircleCI

In the CircleCI `config.yml` we need to include the `circleci/macos` [orb](https://circleci.com/orbs/registry/orb/circleci/macos) and call the `macos/add-mac-uitest-permissions` step. This step ensures that the correct permissions are added to run Xcode UI tests on a macOS app.

If additional permissions are required, you can find out how to set these up in the [macOS permission orb documentation](https://circleci.com/orbs/registry/orb/circleci/macos).

Sample `config.yml` for testing a macOS app:

```yaml
version: 2.1

orbs:
    mac-permissions: circleci/macos

jobs:
  build-test:
    macos:
      xcode: 11.7.0
    steps:
        - checkout
        - run: echo 'chruby ruby-2.7' >> ~/.bash_profile
        - mac-permissions/add-mac-uitest-permissions
        - run: bundle install
        - run: bundle exec fastlane testandbuild

workflows:
    verify:
        jobs:
            - build-test
```

### Configuring Fastlane

Fastlane allows you to avoid calling lengthy Xcode commands manually and instead write a simple configuration file to initiate the macOS app tests. With Fastlane you can build, sign (for testing) and test a macOS app. 

A simple config can be found below. Note that this config relies on the project being configured as "Sign to Run Locally" and therefore you do not need to set up Fastlane Match. If your app requires signing to test, follow the [code signing documentation]({{ site.baseurl }}/2.0/ios-codesigning/) (the code signing documentation talks about iOS but it is also applicable to macOS).

```ruby
# fastlane/Fastfile
default_platform :mac

platform :mac do
  before_all do
    setup_circle_ci
  end

  desc "Run tests"
  lane :testandbuild do
    scan
  end
end
```

A fully configured sample project can be found [on GitHub](https://github.com/CircleCI-Public/macos-orb).

## Working with the macOS Orb

The `TCC.db` file is simply an SQLite database, so this makes it easy to inject new permissions, or modify existing ones, during a job. 

While it can be written to manually with `sqlite3` commands, we encourage the use of the [macOS orb](https://circleci.com/orbs/registry/orb/circleci/macos) simplify this. The examples in this section are all based on using the orb.

### Listing Current Permissions

To list the currently defined permissions in both the user and system database, call the `list-permissions` command provided by the orb, such as in this example:

```yaml
version: 2.1

orbs:
    mac-permissions: circleci/macos

jobs:
  build-test:
    macos:
      xcode: 11.7.0
    steps:
        - checkout
        - mac-permissions/list-permissions
```

Sample output:

```bash
client              service                          allowed   
------------------  -------------------------------  ----------
com.apple.Terminal  kTCCServiceSystemPolicyAllFiles  1         
com.apple.Terminal  kTCCServiceDeveloperTool         1                
/usr/sbin/sshd      kTCCServiceAccessibility         1         
com.apple.systemev  kTCCServiceAccessibility         1         
com.apple.Terminal  kTCCServiceAccessibility         1         
```

This command generates two steps; one lists the contents of the user `TCC.db` and one lists the system `TCC.db`.

### Listing Permission Types

To grant permissions, the correct type of key for the permission type needs to be passed. These are not very well documented by Apple, but can be found by running the `list-permission-types` command, as this example shows:

```yaml
version: 2.1

orbs:
    mac-permissions: circleci/macos

jobs:
  build-test:
    macos:
      xcode: 11.7.0
    steps:
        - checkout
        - mac-permissions/list-permission-types
```

Sample output:

```bash
kTCCServiceMediaLibrary
kTCCServiceSiri
kTCCServiceMotion
kTCCServiceSpeechRecognition
...
```

### Granting Default Permissions for macOS App Testing

For most developers, only a few standard permissions for Terminal and Xcode Helper are required to set up the environment for macOS app UI Testing. These can be set by calling the `add-uitest-permissions` command, such as in this example:

```yaml
version: 2.1

orbs:
    mac-permissions: circleci/macos

jobs:
  build-test:
    macos:
      xcode: 11.7.0
    steps:
        - checkout
        - mac-permissions/add-uitest-permissions
```

### Granting New Permissions

The orb can be used to add custom permissions with the `add-permission` command. In the following example, we are granting Screen Capture permissions to Terminal. The Bundle ID and the [permission](#listing-permission-types) type are both required parameters: 

```yaml
version: 2.1

orbs:
    mac-permissions: circleci/macos

jobs:
  build-test:
    macos:
      xcode: 11.7.0
    steps:
        - checkout
        - mac-permissions/add-permission:
            bundle-id: "com.apple.Terminal"
            permission-type: "kTCCServiceScreenCapture"
```

### Removing a permission

In the unlikely event that a permission needs to be removed during a job, use the `delete-permission` command. In the following example, we are removing Screen Capture permissions from Terminal. The Bundle ID and the [permission](#listing-permission-types) type are both required parameters: 

```yaml
version: 2.1

orbs:
    mac-permissions: circleci/macos

jobs:
  build-test:
    macos:
      xcode: 11.7.0
    steps:
        - checkout
        - mac-permissions/delete-permission:
            bundle-id: "com.apple.Terminal"
            permission-type: "kTCCServiceScreenCapture"
```
