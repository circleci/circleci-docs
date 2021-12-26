---
layout: classic-docs
title: "Executors and Images"
short-title: "Executors and Images"
description: "CircleCI executors and images"
categories: [configuration]
order: 1
version:
- Cloud
- Server v2.x
- Server v3.x
---

CircleCI offers several execution environments. We call these **executors**. An **executor** defines the underlying technology or environment in which to run a job. Set up your jobs to run in the `docker`, `machine`, `macos` or  `windows` executor and specify an image with the tools and packages you need.

![Executor Overview]({{ site.baseurl }}/assets/img/docs/executor_types.png)

## Docker
{: #docker }

<div class="alert alert-warning" role="alert">
  <strong>Legacy images with the prefix "circleci/" will be <a href="https://discuss.circleci.com/t/legacy-convenience-image-deprecation/41034">deprecated</a></strong> on December 31, 2021. For faster builds, upgrade your projects with <a href="https://circleci.com/blog/announcing-our-next-generation-convenience-images-smaller-faster-more-deterministic/">next-generation convenience images</a>.
</div>

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
{: #machine }

{:.tab.machine.Cloud}
```
jobs:
  build: # name of your job
    machine: # executor type
      image: ubuntu-2004:202010-01 # # recommended linux image - includes Ubuntu 20.04, docker 19.03.13, docker-compose 1.27.4

      steps:
        # Commands run in a Linux virtual machine environment
```

{:.tab.machine.Server_3}
```
jobs:
  build: # name of your job
    machine: # executor type
      image: ubuntu-1604:202007-01 # VM will run Ubuntu 16.04 for this release date
      
    steps:
      # Commands run in a Linux virtual machine environment
```

{:.tab.machine.Server_2}
```
jobs:
  build: # name of your job
    machine: # executor type
      image: ubuntu-1604:202007-01 # VM will run Ubuntu 16.04 for this release date

    steps:
      # Commands run in a Linux virtual machine environment
```

Find out more about using the `machine` executor [here]({{ site.baseurl }}/2.0/executor-types/#using-machine).

## macOS
{: #macos }

_The macOS executor is not currently available on self-hosted installations of CircleCI server_

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
{: #windows }

The syntax for using the Windows executor in your config differs depending on whether you are using:

* The cloud version of CircleCI, using config version 2.1 and the Windows orb.
* Self-hosted installation of CircleCI server with config version 2.0 – this option is an instance of using the `machine` executor with a Windows image – _Introduced in CircleCI server v2.18.3_.

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


{:.tab.windowsblock.Server_3}
```
version: 2.1

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

{:.tab.windowsblock.Server_2}
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

## See also
{: #see-also }

* [Choosing an executor type]({{ site.baseurl }}/2.0/executor-types/)
* [Pre-built CircleCI convenience images]({{ site.baseurl }}/2.0/circleci-images/)
* [Building on MacOS]({{site.baseurl}}/2.0/hello-world-macos)
* [Building on Windows]({{site.baseurl}}/2.0/hello-world-windows)

## Learn More
{: #learn-more }
Take the [build environments course](https://academy.circleci.com/build-environments-1?access_code=public-2021) with CircleCI Academy to learn more about choosing and using an executor.
