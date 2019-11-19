---
layout: classic-docs
title: "Executors and Images"
short-title: "Executors and Images"
description: "CircleCI 2.0 executors and images"
categories: [configuration]
order: 1
---

An **executor** defines the underlying technology or environment in which to run a job. Set up your jobs to run in the `docker`, `machine`, `macos` or  `windows` executor and specify an image with the tools and packages you need.

![Executor Overview](  {{ site.baseurl }}/assets/img/docs/executor_types.png)

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

```
jobs:
  build: # name of your job
    machine: # executor type
      image: circleci/classic:201708-01 # VM will run Ubuntu 14.04 for this release date

      steps:
        # Commands run in a Linux virtual machine environment
```

Find out more about using the `machine` executor [here]({{ site.baseurl }}/2.0/executor-types/#using-machine).

## macOS

_Available on CircleCI Cloud - not currently available on self-hosted installations_

```
jobs:
  build: # name of your job
    macos: # executor type
      xcode: "9.0"

    steps:
      # Commands run in a macOS virtual machine environment
      # with Xcode 9.0 installed
```

Find out more about using the `macos` executor [here]({{ site.baseurl }}/2.0/executor-types/#using-macos).

## Windows

_Available on CircleCI Cloud with `version 2.1` config - not currently available on self-hosted installations of CircleCI Server_

Note: The Windows executor requires a 2.1 version configuration as well as having Pipelines enabled. Go to "Project" > "Settings" > "Advanced Settings" to enable Pipelines.

```
version: 2.1 # Use version 2.1 to enable Orb usage.

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

Find out more about using the `windows` executor [here]({{ site.baseurl }}/2.0/executor-types/#using-windows). See [the Windows orb details](https://circleci.com/orbs/registry/orb/circleci/windows) for the list of options available in the Windows orb.

## See Also

* [Pre-built CircleCI convenience images]({{ site.baseurl }}/2.0/circleci-images/).
* [Building on MacOS]({{site.baseurl}}/2.0/hello-world-macos).
* [Building on Windows]({{site.baseurl}}/2.0/hello-world-windows).
