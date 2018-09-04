---
layout: classic-docs
title: "Executors and Images"
short-title: "Executors and Images"
description: "CircleCI 2.0 executors and images"
categories: [configuration]
order: 1
---

Set up your build environment to run with the `docker`, `machine`, or `macos` executor and specify an image with only the tools and packages you need.

## Docker

```
jobs:
  build: # name of your job
    docker: # executor type
      - image: buildpack-deps:trusty # primary container will run Ubuntu Trusty
```

## Machine

```
jobs:
  build: 
    machine: 
      image: circleci/classic:201708-01 # VM will run Ubuntu 14.04 for this release date
```

## macOS

```
jobs:
  build:
    macos:
      xcode: "9.0"
      
    steps:
      # Commands will execute in macOS container
      # with Xcode 9.0 installed
      - run: xcodebuild -version
```

## See Also

Learn more about the [pre-built CircleCI convenience images]({{ site.baseurl }}/2.0/circleci-images/).
