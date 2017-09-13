---
layout: classic-docs
title: Using a macOS Build Image
categories: [containerization]
description: Using a macOS Build Image
changefreq: "weekly"
---

This document describes how to specify an Xcode project and use a macOS image for your build environment in the following sections:

* TOC
{:toc}

## Overview of CircleCI 2.0 macOS Images

CircleCI maintains a manifest of the software installed on the available macOS build images. This manifest includes the version of the software components including the operating system, Xcode, Python, and Ruby, for example.

* [Xcode version 9.0 (macOS 10.12 Sierra)](https://circle-macos-docs.s3.amazonaws.com/image-manifest/build-145/index.html).
* [Xcode version 8.3.3 (macOS 10.12 Sierra)](https://circle-macos-docs.s3.amazonaws.com/image-manifest/build-146/index.html).

## Supported Xcode Versions

The currently available Xcode versions are:

* `9.0`: Xcode 9.0 (Build 9A235)
* `8.3.3`: Xcode 8.3.3 (Build 8E3004b)

## Specifying the macOS Build Environment

1. Specify the name and version of the build image and Xcode in your `.circleci/config.yml` file. For example, to build on macOS with Xcode `8.3.3`, add the following:

```
jobs:
  build:
    macos:
      xcode: "8.3.3"
```

2. Start a new run by pushing a new commit to GitHub or Bitbucket.


