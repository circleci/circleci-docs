---
layout: classic-docs
title: "Execution Environments"
description: "An overview of CircleCI execution environments."
redirect_from: /2.0/executor-types/
version:
- Cloud
- Server v2.x
- Server v3.x
---

CircleCI offers several execution environments: Docker, Linux VM (virtual machine), macOS, Windows, GPU and Arm. Each job defined in your project configuration is run in a separate execution environment, either a Docker container or a virtual machine.

For each job in your project config you will specify an execution environment by assigning it an **executor**. An **executor** defines the underlying technology or environment in which to run a job, and which image to use to best-suit your project. 

It is possible to specify a different executor type for every job in your [.circleci/config.yml]({{ site.baseurl }}/2.0/configuration-reference/) by specifying the executor type and an appropriate image. An *image* is a packaged system that has the instructions for creating a running environment. A *container* or *virtual machine* is the term used for a running instance of an image. For example:

- Jobs that require Docker images (`docker`) may use an image for Node.js or Python. The [pre-built CircleCI Docker image]({{ site.baseurl }}/2.0/circleci-images/) from the CircleCI Docker Hub will help you get started quickly without learning all about Docker. These images are not a full operating system, so they will generally make building your software more efficient.
- Jobs that require a complete Linux virtual machine (VM) image (`machine`) may use an Ubuntu version supported by the [list of available machine images]({{site.baseurl}}/2.0/configuration-reference/#available-machine-images).
- Jobs that require a macOS VM image (`macos`) may use an Xcode version such as 12.5.1.

![Executor Overview]({{ site.baseurl }}/assets/img/docs/executor_types.png)

## Docker
{: #docker }

<div class="alert alert-warning" role="alert">
  <strong>Legacy images with the prefix "circleci/" were <a href="https://discuss.circleci.com/t/legacy-convenience-image-deprecation/41034">deprecated</a></strong> on December 31, 2021. For faster builds, upgrade your projects with <a href="https://circleci.com/blog/announcing-our-next-generation-convenience-images-smaller-faster-more-deterministic/">next-generation convenience images</a>.
</div>

```yml
jobs:
  build: # name of your job
    docker: # executor type
      - image: cimg/base:stable # primary container will run the latest, production-ready base image

      steps:
        # Commands run in the primary container
```

Find out more about the `docker` executor on the [Using Docker]({{ site.baseurl }}/2.0/using-docker) page.

## Linux VM
{: #linux-vm }

Ubuntu 14.04 and 16.04 machine images [are deprecated and will be removed permanently May 31, 2022](https://circleci.com/blog/ubuntu-14-16-image-deprecation/). Migrate from [14.04]({{ site.baseurl }}/2.0/images/linux-vm/14.04-to-20.04-migration/) or [16.04]({{ site.baseurl }}/2.0/images/linux-vm/16.04-to-20.04-migration/).
{: class="alert alert-warning"}

To access the Linux VM execution environment, use the `machine` executor and specify a Linux image. For a full list of `machine` images, see the [CircleCI Developer Hub](https://circleci.com/developer/images?imageType=machine)

{:.tab.machine.Cloud}
```yml
jobs:
  build: # name of your job
    machine: # executor type
      image: ubuntu-2004:202010-01 # # recommended linux image - includes Ubuntu 20.04, docker 19.03.13, docker-compose 1.27.4

      steps:
        # Commands run in a Linux virtual machine environment
```

{:.tab.machine.Server_3}
```yml
jobs:
  build: # name of your job
    machine: true # executor type
    steps:
      # Commands run in a Linux virtual machine environment
```

{:.tab.machine.Server_2}
```yml
jobs:
  build: # name of your job
    machine: true # executor type

    steps:
      # Commands run in a Linux virtual machine environment
```

Find out more about the `machine` executor in the [Using Linux Virtual Machines]({{ site.baseurl }}/2.0/using-linuxvm) page.

## macOS
{: #macos }

```
jobs:
  build: # name of your job
    macos: # executor type
      xcode: 12.5.1

    steps:
      # Commands run in a macOS virtual machine environment
      # with Xcode 12.5.1 installed
```

Find out more about the `macos` executor in the [Using macOS]({{ site.baseurl }}/2.0/executor-types/#using-macos) section of the Choosing an Executor Type page.

## Windows
{: #windows }

The syntax for using the Windows executor in your config differs depending on whether you are using:

* The cloud version of CircleCI, using config version 2.1 and the Windows orb.
* Self-hosted installation of CircleCI server with config version 2.0 – this option is an instance of using the `machine` executor with a Windows image – _Introduced in CircleCI server v2.18.3_.

{:.tab.windowsblock.Cloud}
```yml
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
```yml
version: 2.1

jobs:
  build: # name of your job
    machine: # executor type
      image: windows-default
    resource_class: windows.medium
    steps:
      # Commands are run in a Windows virtual machine environment
      - checkout
      - run: Write-Host 'Hello, Windows'
```

{:.tab.windowsblock.Server_2}
```yaml
version: 2

jobs:
  build: # name of your job
    machine: # executor type
      image: windows-default
    resource_class: windows.medium
    steps:
      # Commands are run in a Windows virtual machine environment
      - checkout
      - run: Write-Host 'Hello, Windows'
```

Find out more about the `windows` executor in the [Using the Windows executor]({{ site.baseurl }}/2.0/executor-types/#using-the-windows-executor) section of the Choosing an Executor Type page. See [the Windows orb details](https://circleci.com/developer/orbs/orb/circleci/windows) for the list of options available in the Windows orb.

## See also
{: #see-also }

* [Choosing an executor type]({{ site.baseurl }}/2.0/executor-types/)
* [Pre-built CircleCI convenience images]({{ site.baseurl }}/2.0/circleci-images/)
* [Building on MacOS]({{site.baseurl}}/2.0/hello-world-macos)
* [Building on Windows]({{site.baseurl}}/2.0/hello-world-windows)

## Learn More
{: #learn-more }
Take the [build environments course](https://academy.circleci.com/build-environments-1?access_code=public-2021) with CircleCI Academy to learn more about choosing and using an executor.
