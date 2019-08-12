---
layout: classic-docs
title: "Executors and Images"
short-title: "Executors and Images"
description: "CircleCI 2.0 executors and images"
categories: [configuration]
order: 1
---

Set up your build environment to run with the `docker`, `machine`, `windows`, or `macos` executor and specify an image with only the tools and packages you need.

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


## Windows

Note: The Windows executor requires a 2.1 version configuration as well as having Pipelines enabled. Go to "Project" > "Settings" > "Advanced Settings" to enable Pipelines.

```
version: 2.1 # Use version 2.1 to enable Orb usage.

orbs:
  win: circleci/windows@1.0.0 # The Windows orb give you everything you need to start using the Windows executor.

jobs:
  build:
    executor: win/vs2019
    steps:
      - checkout
      - run: Write-Host 'Hello, Windows'
```

## See Also

* [Pre-built CircleCI convenience images]({{ site.baseurl }}/2.0/circleci-images/).
* [Building on MacOS]({{site.baseurl}}/2.0/hello-world-macos).
* [Building on Windows]({{site.baseurl}}/2.0/hello-world-windows).
