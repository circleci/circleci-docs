---
layout: classic-docs
title: "Introduction to Execution Environments"
description: "An overview of all CircleCI execution environments."
redirect_from: /executor-types/
version:
- Cloud
- Server v4.x
- Server v3.x
- Server v2.x
---

CircleCI offers several execution environments: Docker, Linux VM (virtual machine), macOS, Windows, GPU and Arm. Each job defined in your project configuration is run in a separate execution environment, either a Docker container or a virtual machine.

For each job in your project config you will specify an execution environment by assigning it an **executor**. An **executor** defines the underlying technology or environment in which to run a job, and which image to use to best-suit your project. 

It is possible to specify a different executor type for every job in your [.circleci/config.yml]({{ site.baseurl }}/configuration-reference/) by specifying the executor type and an appropriate image. An *image* is a packaged system that has the instructions for creating a running environment. A *container* or *virtual machine* is the term used for a running instance of an image. For example:

- Jobs that require Docker images (`docker`) may use an image for Node.js or Python. The [pre-built CircleCI Docker image]({{ site.baseurl }}/circleci-images/) from the CircleCI Docker Hub will help you get started quickly without learning all about Docker. These images are not a full operating system, so they will generally make building your software more efficient.
- Jobs that require a complete Linux virtual machine (VM) image (`machine`) may use an Ubuntu version supported by the [list of available machine images]({{site.baseurl}}/configuration-reference/#available-linux-machine-images).
- Jobs that require a macOS VM image (`macos`) may use an Xcode version such as 12.5.1.

<!---![Executor Overview]({{ site.baseurl }}/assets/img/docs/executor_types.png)--->

## Docker
{: #docker }

**Legacy images with the prefix "circleci/" were [deprecated](https://discuss.circleci.com/t/legacy-convenience-image-deprecation/41034)** on December 31, 2021. For faster builds, upgrade your projects with [next-generation convenience images](https://circleci.com/blog/announcing-our-next-generation-convenience-images-smaller-faster-more-deterministic/).
{: class="alert alert-warning"}

To access the Docker execution environment, use the `docker` executor and specify an image. For a full list of convenience images, which are built by CircleCI, see the [CircleCI Developer Hub](https://circleci.com/developer/images?imageType=docker)

```yml
jobs:
  build: # name of your job
    docker: # executor type
      - image: cimg/base:stable # primary container will run the latest, production-ready base image
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference

      steps:
        # Commands run in the primary container
```

Find out more about the Docker execution environment on the [Using Docker]({{ site.baseurl }}/using-docker) page.

## Linux VM
{: #linux-vm }

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

Find out more about the Linux VM execution environment in the [Using Linux Virtual Machines]({{ site.baseurl }}/using-linuxvm) page.

## macOS
{: #macos }

To access the macOS execution environment, use the `macos` executor and specify an image using the `xcode` key. For a full list of macOS images, see the [CircleCI Developer Hub](https://circleci.com/developer/machine/image/macos).

If you want to run a macOS build on a server instance, you will need to use [self-hosted runner]({{site.baseurl}}/runner-overview).
{: class="alert alert-info"}

```yml
jobs:
  build: # name of your job
    macos: # executor type
      xcode: 12.5.1

    steps:
      # Commands run in a macOS virtual machine environment
      # with Xcode 12.5.1 installed
```

Find out more about the macOS execution environment on the [Using macOS]({{site.baseurl}}/using-macos) page.

## Windows
{: #windows }

To access the Windows execution environment, either use the Windows orb and then specify one of the default executor from the orb, or use the `machine` executor and specify a windows image. For a full list of `machine` images, see the [CircleCI Developer Hub](https://circleci.com/developer/images?imageType=machine).

{:.tab.windowsblock.Cloud_with_orb}
```yml
version: 2.1

orbs:
  win: circleci/windows@4.1.1 # The Windows orb gives you everything you need to start using the Windows executor

jobs:
  build: # name of your job
    executor: win/server-2022 # use one of the executors defined within the windows orb

    steps:
      # Commands are run in a Windows virtual machine environment
      - checkout
      - run: Write-Host 'Hello, Windows'
```

{:.tab.windowsblock.Cloud_with_machine}
```yml
version: 2.1 

jobs:
  build: # name of your job
    resource_class: 'windows.medium'
    machine:
      image: 'windows-server-2022-gui:current'   
      shell: 'powershell.exe -ExecutionPolicy Bypass'
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

Find out more about the Windows execution environment in the [Using the Windows Execution Environment]({{ site.baseurl }}/using-windows) page. See [the Windows orb page in the developer hub](https://circleci.com/developer/orbs/orb/circleci/windows) for the list of options available in the Windows orb.

## GPU
{: #gpu }

To access the GPU execution environment, either use the Windows orb and then specify the GPU-enabled executor from the orb, or use the `machine` executor and specify a Linux or Windows GPU-enabled image. For a full list of `machine` images, see the [CircleCI Developer Hub](https://circleci.com/developer/images?imageType=machine).

It is not possible to run a GPU build on a server instance.
{: class="alert alert-info"}

{:.tab.gpublock.Linux}
```yaml
version: 2.1

jobs:
  build:
    resource_class: gpu.nvidia.small
    machine:
      image: ubuntu-2004-cuda-11.4:202110-01
    resource_class: gpu.nvidia.small
    steps:
      - run: nvidia-smi
```

{:.tab.gpublock.Windows_without_orb}
```yaml
version: 2.1

jobs:
  build:
    machine:
      image: windows-server-2019-cuda
    resource_class: gpu.nvidia.small
    steps:
      - run: nvidia-smi
```

{:.tab.gpublock.Windows_with_orb}
```yaml
version: 2.1

orbs:
  win: circleci/windows@4.1.1

jobs:
  build:
    executor: win/server-2019-cuda
    steps:
      - run: 'Write-Host ''Hello, Windows'''
```

Find out more about the GPU execution environment on the [Using the GPU Execution Environment]({{site.baseurl}}/using-gpu) page.

## Arm

To access the Arm execution environment, use the `machine` executor as detailed below, and specify either the `arm.medium` or the `arm.large` resource class. For a full list of `machine` images, see the [CircleCI Developer Hub](https://circleci.com/developer/images?imageType=machine).

{:.tab.armblock.Cloud}
```yaml
# .circleci/config.yml
version: 2.1

jobs:
  build-medium:
    machine:
      image: ubuntu-2004:202101-01
    resource_class: arm.medium
    steps:
      - run: uname -a
      - run: echo "Hello, Arm!"

  build-large:
    machine:
      image: ubuntu-2004:202101-01
    resource_class: arm.large
    steps:
      - run: uname -a
      - run: echo "Hello, Arm!"

workflows:
  build:
    jobs:
      - build-medium
      - build-large
```

{:.tab.armblock.Server_3}
```yaml
# .circleci/config.yml
version: 2.1

jobs:
  build-medium:
    machine:
      image: arm-default
    resource_class: arm.medium
    steps:
      - run: uname -a
      - run: echo "Hello, Arm!"

  build-large:
    machine:
      image: arm-default
    resource_class: arm.large
    steps:
      - run: uname -a
      - run: echo "Hello, Arm!"

workflows:
  build:
    jobs:
      - build-medium
      - build-large
```

Find out more about the Arm execution environment in the [Using the Arm Execution Environment]({{site.baseurl}}/using-arm) page.

## Self-hosted runner
{: #self-hosted-runner }

CircleCI provides the ability to have self-hosted runners with [container runner]({{site.baseurl}}/container-runner) with Kubernetes, as well as in a virtual machine with [machine runner]({{site.baseurl}}/runner-overview#machine-runner-use-case) on Linux, Windows, and macOS.

## Next Steps
{: #next-steps }

* Read more about [Pre-built CircleCI convenience images]({{ site.baseurl }}/circleci-images/) for the Docker execution environment.
* Take the [build environments course](https://academy.circleci.com/build-environments-1?access_code=public-2021) with CircleCI Academy to learn more about choosing and using an executor.
