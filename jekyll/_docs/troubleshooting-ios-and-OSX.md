---
layout: classic-docs
title: Troubleshooting iOS and OSX builds
short-title: iOS & OSX troubleshooting
categories: [troubleshooting]
description: Common problems with iOS and OSX builds
---



There are common problems you might run into during the initial setup of your CI/CD setup with CircleCI or even issues that only occur when your project has grown to a certain size. 


## Xcode Toolchain errors

### xcodebuild exit code 65
There are plenty of reasons why exit code 65 could be thrown, as it is a general error returned for bad user input. Sometimes that is not the case though, since all your builds run in a container your builds also have to share system resources with other builds. Exit code 65 is mostly the issue of a lack of enough CPU power to launch the iOS simulator in time for the test to run once xcodebuild'S `test` action is called, and the tests simply time out.
A way to mitigate this is to launch the iOS simulator as a part of your dependencies block in your CircleCI configuration file.


```
dependencies:
  pre:
    - xcrun instruments -w 'E8DD285C-51EE-4DB5-B326-7E927686EC36' || true 
```

This will launch the simulator just like it would if you'd hit `CMD + R` on your machine in Xcode, and once your tests are supposed to start the iOS simulator is immediately available.

A full list of UUIDs for iOS simulators is available [here]({{site.baseurl}}/docs/ios-builds-on-os-x/).
