---
layout: classic-docs
title: Using a macOS Build Image
categories: [containerization]
description: macOS
changefreq: "weekly"
---

This document describes how to specify an Xcode project and use a macOS or OSX image for your build environment in the following sections:

* TOC
{:toc}

## Overview of macOS Images

CircleCI maintains a manifest of the software installed on the available OSX and macOS build images. This manifest includes the version of the software components including the operating system, Xcode, Python, and Ruby, for example.

* [Xcode version 9.0 Beta 2 (macOS 10.12 Sierra)](https://circle-macos-docs.s3.amazonaws.com/image-manifest/build-145/index.html).
* [Xcode version 8.3.3 (macOS 10.12 Sierra)](https://circle-macos-docs.s3.amazonaws.com/image-manifest/build-146/index.html).
* [Xcode version 8.3.2 (macOS 10.12 Sierra)](https://circle-macos-docs.s3.amazonaws.com/image-manifest/build-105/index.html).
* [Xcode version 8.3.1 (macOS 10.12 Sierra)](https://circle-macos-docs.s3.amazonaws.com/image-manifest/build-104/index.html).
* [Xcode versions 7.0 – 8.2.1 (OSX 10.11 El Capitan)](https://circle-macos-docs.s3.amazonaws.com/image-manifest/null/index.html).

## Supported Xcode Versions

To allow CircleCI to upgrade Xcode to the latest point-release without requiring you to change your `config.yml`, specify the version of Xcode that you would like to build by specifying the `major.minor` version. CircleCI will automatically ensure that the correct version of Xcode is selected using `xcode-select`.

The currently available Xcode versions are:

* `9.0`: Xcode 9.0 Beta 2 (Build 16F73)
* `8.3`: Xcode 8.3.2 (Build 8E2002)
* `8.3.3`: Xcode 8.3.3 (Build 8E3004b)
* `8.3.2`: Xcode 8.3.2 (Build 8E2002)
* `8.3.1`: Xcode 8.3.1 (Build 8E1000a)
* `8.2`: Xcode 8.2.1 (Build 8C1002)
* `8.1`: Xcode 8.1 (Build 8B62)
* `8.0`: Xcode 8.0 (Build 8A218a)
* `7.3`: Xcode 7.3 (Build 7D175)
* `7.2`: Xcode 7.2 (Build 7C68)
* `7.1`: Xcode 7.1 (Build 7B91b)
* `7.0`: Xcode 7.0 (Build 7A220)

## Secifying the macOS Build Environment

1. Go to Project Settings > Build Environment and set the Build OS X project
radio button to On.

2. Specify the name and version of the build image and Xcode in your `.circleci/config.yml` file. For example, to build on macOS with Xcode `8.2.1`, add the following:

```
jobs:
  build:
    machine:
      image: circleci/macos
      xcode:
        version: 8.2
```

3. Start a new build by pushing a new commit to GitHub or Bitbucket. 

**Note:** Rebuilding a previous build will *not* use the new setting, you must push a new commit.




