---
layout: classic-docs
title: macOS Build Images
categories: [build-images]
description: macOS
changefreq: "weekly"
sitemap: false
---

CircleCI will try to run your build on macOS if we can detect an Xcode project.
To change a project from building on Linux to building on macOS you can go to
'Project Settings' -> 'Build Environment', and enable the 'Build OS X project'
setting.

**NOTE: To apply the new setting, you will need to trigger a new build by pushing a commit to GitHub or Bitbucket. Rebuilding a previous build will re-use all settings from the previous build, including the Build Environment.**

## Selecting Xcode Version and Operating System

We have multiple build images available, running OSX and macOS. The build image
that your build is run on is dictated by the version of Xcode that you [select in your circle.yml file]({{ site.baseurl }}/1.0/configuration/). For example, to build with Xcode `8.2.1`, add the following:

```
machine:
  xcode:
    version: 8.2
```

You should specify the version of Xcode that you would like to build by specifying the `major.minor` version. This allows us upgrade Xcode to the latest point-release without requiring you to change your `circle.yml`. We will automatically ensure that the correct version of Xcode is selected using `xcode-select`.

The currently available Xcode versions are:

* `9.2.0`: Xcode 9.2.0 (Build 9C40b)
* `9.1.0`: Xcode 9.1.0 (Build 9B55)
* `9.0`: Xcode 9.0.1 (Build 9A1004)
* `8.3`: Xcode 8.3.3 (Build 8E3004b)
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

**Please note that all future Xcode releases will only be supported on CircleCI 2.0.**

## Software

We maintain a manifest of the software installed on our OSX and macOS build images. This includes version of the operating system, Xcode, Python, Ruby, etc.

* [Xcode version 9.2.0 (macOS 10.12 Sierra)](https://circle-macos-docs.s3.amazonaws.com/image-manifest/build-298/index.html).
* [Xcode version 9.1.0 (macOS 10.12 Sierra)](https://circle-macos-docs.s3.amazonaws.com/image-manifest/build-290/index.html).
* [Xcode version 9.0.1 (macOS 10.12 Sierra)](https://circle-macos-docs.s3.amazonaws.com/image-manifest/build-282/index.html).
* [Xcode version 8.3.3 (macOS 10.12 Sierra)](https://circle-macos-docs.s3.amazonaws.com/image-manifest/build-146/index.html).
* [Xcode version 8.3.2 (macOS 10.12 Sierra)](https://circle-macos-docs.s3.amazonaws.com/image-manifest/build-105/index.html).
* [Xcode version 8.3.1 (macOS 10.12 Sierra)](https://circle-macos-docs.s3.amazonaws.com/image-manifest/build-104/index.html).
* [Xcode versions 7.0 – 8.2.1 (OSX 10.11 El Capitan)](https://circle-macos-docs.s3.amazonaws.com/image-manifest/null/index.html).

If you do not have a `circle.yml` file, or you do not specify a version of Xcode, then your project will build with Xcode 7.0 on OSX 10.11.
