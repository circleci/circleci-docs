---
layout: classic-docs
title: Troubleshooting iOS and macOS builds
short-title: iOS & macOS troubleshooting
categories: [troubleshooting]
description: Common problems with iOS and macOS builds
sitemap: false
---



There are common problems you might run into during the initial setup of your CI/CD setup with CircleCI or even issues that only occur when your project has grown to a certain size.


## Xcode Toolchain errors

### xcodebuild exit code 65
There are plenty of reasons why exit code 65 could be thrown, as it is a general error returned for bad user input. Sometimes that is not the case though, since all your builds run in a container your builds also have to share system resources with other builds. Exit code 65 is mostly the issue of a lack of enough CPU power to launch the iOS simulator in time for the test to run once xcodebuild's `test` action is called, and the tests simply time out.
A way to mitigate this is to launch the iOS simulator as a part of your dependencies block in your CircleCI configuration file.


```
dependencies:
  pre:
  - xcrun instruments -w "iPhone 7 (10.1)" || true
```

This will launch the simulator just like it would if you'd hit `CMD + R` on your
machine in Xcode, and once your tests are supposed to start the iOS simulator is
immediately available.

We maintain a [full list of simulators that are available in our macOS and OSX
build images](/docs/1.0/build-image-macos/#selecting-xcode-version-and-operating-system).
