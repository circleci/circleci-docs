---
layout: classic-docs
title: macOS Build Images
categories: [build-images]
description: macOS
changefreq: "weekly"
---

CircleCI will try to run your build on macOS if we can detect an Xcode project.
To change a project from building on Linux to building on macOS you can go to
'Project Settings' -> 'Build Environment', and enable the 'Build OS X project'
setting.

**NOTE: To apply the new setting, you will need to trigger a build by pushing commits to GitHub or Bitbucket (instead of rebuilding).**

## Software

We have multiple build images available, running OSX and macOS. The build image
that your build is run on is dictated by the version of Xcode that you select
in [your circle.yml file](/docs/1.0/ios-builds-on-os-x/#xcode-version).

We maintain a manifest of the software installed on our OSX and macOS build images.

* [Xcode versions 7.0 - 8.2.1 - OSX 10.11 (El Capitan)](https://circle-macos-docs.s3.amazonaws.com/image-manifest/null/index.html).
  * 8.2.1 Build 8C1002
  * 8.1 Build 8B62
  * 8.0 Build 8A218a
  * 7.3 Build 7D175
  * 7.2 Build 7C68
  * 7.1 Build 7B91b
  * 7.0 Build 7A220
* [Xcode version 8.3 - macOS 10.12 (Sierra)](https://circle-macos-docs.s3.amazonaws.com/image-manifest/build-105/index.html).
  * 8.3.2 Build 8E2002


