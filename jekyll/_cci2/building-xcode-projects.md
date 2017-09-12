---
layout: classic-docs
title: Using a macOS Build Image
categories: [containerization]
description: Using a macOS Build Image
changefreq: "weekly"
---

This document describes how to specify an Xcode project and use a macOS or OSX image for your build environment in the following sections:

* TOC
{:toc}

## Overview of CircleCI 2.0 macOS Images

CircleCI maintains a manifest of the software installed on the available OSX and macOS build images. This manifest includes the version of the software components including the operating system, Xcode, Python, and Ruby, for example.

* [Xcode version 9.0 Beta 2 and later (macOS 10.12 Sierra)](https://circle-macos-docs.s3.amazonaws.com/image-manifest/build-145/index.html).
* [Xcode version 8.3.3 and later (macOS 10.12 Sierra)](https://circle-macos-docs.s3.amazonaws.com/image-manifest/build-146/index.html).

## Supported Xcode Versions

To allow CircleCI to upgrade Xcode to the latest point-release without requiring you to change your `config.yml`, specify the version of Xcode that you would like to build by specifying the `major.minor` version. CircleCI will automatically ensure that the correct version of Xcode is selected.

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

## Specifying the macOS Build Environment

1. Specify the name and version of the build image and Xcode in your `.circleci/config.yml` file. For example, to build on macOS with Xcode `8.2.1`, add the following:

```
jobs:
  build:
    macos:
      xcode:
        version: "8.2"
```

2. Start a new run by pushing a new commit to GitHub or Bitbucket. 


