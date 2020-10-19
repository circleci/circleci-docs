---
layout: classic-docs
title: "Executors and Images"
short-title: "Executors and Images"
description: "CircleCI 2.0 executors and images"
categories: [configuration]
order: 1
version:
- Cloud
- Server v2.x
---

An **executor** defines the underlying technology or environment in which to run a job. Set up your jobs to run in the `docker`, `machine`, `macos` or  `windows` executor and specify an image with the tools and packages you need.

![Executor Overview]({{ site.baseurl }}/assets/img/docs/executor_types.png)

## Docker

```
jobs:
  build: # name of your job
    docker: # executor type
      - image: buildpack-deps:trusty # primary container will run Ubuntu Trusty

      steps:
        # Commands run in the primary container
```

Find out more about using the `docker` executor [here]({{ site.baseurl }}/2.0/executor-types/#using-docker).

## Machine

{:.tab.machine.Cloud}
```
jobs:
  build: # name of your job
    machine: # executor type
      image: ubuntu-2004:202010-01 # # recommended linux image - includes Ubuntu 20.04, docker 19.03.13, docker-compose 1.27.4

      steps:
        # Commands run in a Linux virtual machine environment
```

{:.tab.machine.Server}
```
jobs:
  build: 
    machine: 
      image: ubuntu-1604:202007-01 # VM will run Ubuntu 16.04 for this release date
    steps:
      # Commands run in a Linux virtual machine environment
```

Find out more about using the `machine` executor [here]({{ site.baseurl }}/2.0/executor-types/#using-machine).

## macOS

_The macOS executor is not currently available on self-hosted installations of CircleCI Server_

```
jobs:
  build: # name of your job
    macos: # executor type
      xcode: 11.3.0

    steps:
      # Commands run in a macOS virtual machine environment
      # with Xcode 11.3 installed
```

Find out more about using the `macos` executor [here]({{ site.baseurl }}/2.0/executor-types/#using-macos).

## Windows

The syntax for using the Windows executor in your config differs depending on whether you are using: 

* The cloud version of CircleCI, using config version 2.1 and the Windows orb.
* Self-hosted installation of CircleCI Server with config version 2.0 – this option is an instance of using the `machine` executor with a Windows image – _Introduced in CircleCI Server v2.18.3_.

{:.tab.windowsblock.Cloud}
```
version: 2.1 # Use version 2.1 to enable orb usage.

orbs:
  win: circleci/windows@2.2.0 # The Windows orb give you everything you need to start using the Windows executor.

jobs:
  build: # name of your job
    executor: win/default # executor type

    steps:
      # Commands are run in a Windows virtual machine environment
      - checkout
      - run: Write-Host 'Hello, Windows'
```

{:.tab.windowsblock.Server}
```
version: 2

jobs:
  build: # name of your job
    machine:
      image: windows-default # Windows machine image
    resource_class: windows.medium
    steps:
      # Commands are run in a Windows virtual machine environment
      - checkout
      - run: Write-Host 'Hello, Windows'
```

Find out more about using the `windows` executor [here]({{ site.baseurl }}/2.0/executor-types/#using-the-windows-executor). See [the Windows orb details](https://circleci.com/developer/orbs/orb/circleci/windows) for the list of options available in the Windows orb.

## See Also

* [Pre-built CircleCI convenience images]({{ site.baseurl }}/2.0/circleci-images/).
* [Building on MacOS]({{site.baseurl}}/2.0/hello-world-macos).
* [Building on Windows]({{site.baseurl}}/2.0/hello-world-windows).
