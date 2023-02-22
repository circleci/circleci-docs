---
layout: classic-docs
title: "Choosing an Executor Type"
short-title: "Choosing an Executor Type"
description: "Overviews of the docker, machine, and executor types"
categories: [containerization]
order: 10
version:
- Cloud
- Server v3.x
- Server v2.x
---
[custom-images]: {{ site.baseurl }}/2.0/custom-images/
[building-docker-images]: {{ site.baseurl }}/2.0/building-docker-images/
[server-gpu]: {{ site.baseurl }}/2.0/gpu/

This document describes the available executor types (`docker`, `machine`, `windows` and `macos`) in the following sections:

* TOC
{:toc}

## Overview
{: #overview }
{:.no_toc}

<div class="alert alert-warning" role="alert">
  <strong>Legacy images with the prefix "circleci/" were <a href="https://discuss.circleci.com/t/legacy-convenience-image-deprecation/41034">deprecated</a></strong> on December 31, 2021. For faster builds, upgrade your projects with <a href="https://circleci.com/blog/announcing-our-next-generation-convenience-images-smaller-faster-more-deterministic/">next-generation convenience images</a>.
</div>

An *executor type* defines the underlying technology or environment in which to run a job. CircleCI enables you to run jobs in one of four environments:

- Within Docker images (`docker`)
- Within a Linux virtual machine (VM) image (`machine`)
- Within a macOS VM image (`macos`)
- Within a windows VM image (`windows`)

It is possible to specify a different executor type for every job in your [.circleci/config.yml]({{ site.baseurl }}/2.0/configuration-reference/) by specifying the executor type and an appropriate image. An *image* is a packaged system that has the instructions for creating a running environment. A *container* or *virtual machine* is the term used for a running instance of an image. For example:

- Jobs that require Docker images (`docker`) may use an image for Node.js or Python. The [pre-built CircleCI Docker image]({{ site.baseurl }}/2.0/circleci-images/) from the CircleCI Docker Hub will help you get started quickly without learning all about Docker. These images are not a full operating system, so they will generally make building your software more efficient.
- Jobs that require a complete Linux virtual machine (VM) image (`machine`) may use an Ubuntu version supported by the [list of available machine images]({{site.baseurl}}/2.0/configuration-reference/#available-linux-machine-images).
- Jobs that require a macOS VM image (`macos`) may use an Xcode version such as 12.5.1.

## Using Docker
{: #using-docker }

The `docker` key defines Docker as the underlying technology to run your jobs using Docker containers. Containers are an instance of the Docker image you specify and the first image listed in your configuration is the primary container image in which all steps run. If you are new to Docker, see the [Docker Overview documentation](https://docs.docker.com/engine/docker-overview/) for concepts.

Docker increases performance by building only what is required for your application. Specify a Docker image in your [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) file that will generate the primary container where all steps run:

```yaml
jobs:
  build:
    docker:
      - image: cimg/node:lts
```

In this example, all steps run in the container created by the first image listed under the `build` job.

To make the transition easy, CircleCI maintains convenience images on Docker Hub for popular languages. See [Using Pre-Built CircleCI Docker Images]({{ site.baseurl }}/2.0/circleci-images/) for the complete list of names and tags. If you need a Docker image that installs Docker and has Git, consider using `cimg/base:current`.

### Docker image best practices
{: #docker-image-best-practices }
{:.no_toc}

- If you encounter problems with rate limits imposed by your registry provider, using [authenticated docker pulls]({{ site.baseurl }}/2.0/private-images/) may grant higher limits.

- CircleCI has partnered with Docker to ensure that our users can continue to access Docker Hub without rate limits. As of November 1st 2020, with few exceptions, you should not be impacted by any rate limits when pulling images from Docker Hub through CircleCI. However, these rate limits may go into effect for CircleCI users in the future. We encourage you to [add Docker Hub authentication]({{ site.baseurl }}/2.0/private-images/) to your CircleCI configuration and consider upgrading your Docker Hub plan, as appropriate, to prevent any impact from rate limits in the future.

- Avoid using mutable tags like `latest` or `1` as the image version in your `config.yml file`. It is best practice to use precise image versions or digests, like `redis:3.2.7` or `redis@sha256:95f0c9434f37db0a4f...` as shown in the examples. Mutable tags often lead to unexpected changes in your job environment.  CircleCI cannot guarantee that mutable tags will return an up-to-date version of an image. You could specify `alpine:latest` and actually get a stale cache from a month ago.

- If you experience increases in your run times due to installing additional tools during execution, consider creating and using a custom-built image that comes with those tools pre-installed. See the [Using Custom-Built Docker Images]({{site.baseurl}}/2.0/custom-images/) page for more information.

- When you use [AWS ECR]({{ site.baseurl }}/2.0/private-images/#aws-ecr) images, it is best practice to use `us-east-1` region. Our job execution infrastructure is in `us-east-1` region, so having your image on the same region reduces the image download time.

- In the event that your pipelines are failing despite there being little to no changes in your project, you may need to investigate upstream issues with the Docker images being used.

More details on the Docker executor are available in the [Configuring CircleCI]({{ site.baseurl }}/2.0/configuration-reference/) document.

### Using multiple Docker images
{: #using-multiple-docker-images }

It is possible to specify multiple images for your job. Specify multiple images if, for example, you need to use a database for your tests or for some other required service. **In a multi-image configuration job, all steps are executed in the container created by the first image listed**. All containers run in a common network and every exposed port will be available on `localhost` from a [primary container]({{ site.baseurl }}/2.0/glossary/#primary-container).

```yaml
jobs:
  build:
    docker:
    # Primary container image where all steps run.
     - image: cimg/base:current
    # Secondary container image on common network.
     - image: cimg/mariadb:10.6
       command: [mongod, --smallfiles]

    steps:
      # command will execute in an Ubuntu-based container
      # and can access MariaDB on localhost
      - run: sleep 5 && nc -vz localhost 3306
```
Docker images may be specified in a few ways:

- By the image name and version tag on Docker Hub, or
- By using the URL to an image in a registry.

The following examples show how you can use public images from various sources:

#### CircleCI's public convenience images on Docker Hub
{: #public-convenience-images-on-docker-hub }
{:.no_toc}

  - `name:tag`
    - `cimg/node:14.17-browsers`
  - `name@digest`
    - `cimg/node@sha256:aa6d08a04d13dd8a...`

#### Public images on Docker Hub
{: #public-images-on-docker-hub }
{:.no_toc}

  - `name:tag`
    - `alpine:3.13`
  - `name@digest`
    - `alpine@sha256:e15947432b813e8f...`

#### Public images on Docker registries
{: #public-docker-registries }
{:.no_toc}

  - `image_full_url:tag`
    - `gcr.io/google-containers/busybox:1.24`
  - `image_full_url@digest`
    - `gcr.io/google-containers/busybox@sha256:4bdd623e848417d9612...`

Nearly all of the public images on Docker Hub and other Docker registries are supported by default when you specify the `docker:` key in your `config.yml` file. If you want to work with private images/registries, please refer to [Using Docker Authenticated Pulls]({{ site.baseurl }}/2.0/private-images/).

### RAM disks
{: #ram-disks }

A RAM disk is available at `/mnt/ramdisk` that offers a [temporary file storage paradigm](https://en.wikipedia.org/wiki/Tmpfs), similar to using `/dev/shm`. Using the RAM disk can help speed up your build, provided that the `resource_class` you are using has enough memory to fit the entire contents   of your project (all files checked out from git, dependencies, assets generated etc).

The simplest way to use this RAM disk is to configure the `working_directory` of a job to be `/mnt/ramdisk`:

```yaml
jobs:
  build:
    docker:
     - image: alpine

    working_directory: /mnt/ramdisk

    steps:
      - run: |
          echo '#!/bin/sh' > run.sh
          echo 'echo Hello world!' >> run.sh
          chmod +x run.sh
      - run: ./run.sh
```

### Docker benefits and limitations
{: #docker-benefits-and-limitations }

Docker also has built-in image caching and enables you to build, run, and publish Docker images via [Remote Docker][building-docker-images]. Consider the requirements of your application as well. If the following are true for your application, Docker may be the right choice:

- Your application is self-sufficient.
- Your application requires additional services to be tested.
- Your application is distributed as a Docker image (requires using [Remote Docker][building-docker-images]).
- You want to use `docker-compose` (requires using [Remote Docker][building-docker-images]).

Choosing Docker limits your runs to what is possible from within a Docker container (including our [Remote Docker][building-docker-images] feature). For instance, if you require low-level access to the network or need to mount external volumes, consider using `machine`.

There are tradeoffs to using a `docker` image versus an Ubuntu-based `machine` image as the environment for the container, as follows:

Capability | `docker` | `machine`
----------|----------|----------
 Start time | Instant | 30-60 sec
 Clean environment | Yes | Yes
 Custom images | Yes <sup>(1)</sup> | No
 Build Docker images | Yes <sup>(2)</sup> | Yes
 Full control over job environment | No | Yes
 Full root access | No | Yes
 Run multiple databases | Yes <sup>(3)</sup> | Yes
 Run multiple versions of the same software | No | Yes
 [Docker layer caching]({{ site.baseurl }}/2.0/docker-layer-caching/) | Yes | Yes
 Run privileged containers | No | Yes
 Use docker compose with volumes | No | Yes
 [Configurable resources (CPU/RAM)]({{ site.baseurl }}/2.0/configuration-reference/#resource_class) | Yes | Yes
{: class="table table-striped"}

<sup>(1)</sup> See [Using Custom Docker Images][custom-images].

<sup>(2)</sup> Requires using [Remote Docker][building-docker-images].

<sup>(3)</sup> While you can run multiple databases with Docker, all images (primary and secondary) share the underlying resource limits. Performance in this regard will be dictated by the compute capacities of your container plan.

For more information on `machine`, see the next section below.

### Caching Docker images
{: #caching-docker-images }

This section discusses caching the Docker images used to spin up a Docker execution environment. It does not apply to [Docker layer caching]({{site.baseurl}}/2.0/docker-layer-caching), which is a feature used to speed up building new Docker images in your projects.
{: class="alert alert-info" }


The time it takes to spin up a Docker container to run a job can vary based on several different factors, such as the size of the image and if some, or all, of the layers are already cached on the underlying Docker host machine.

If you are using a more popular image, such as CircleCI convenience images, then cache hits are more likely for a larger number of layers. Most of the popular CircleCI images use the same base image. The majority of the base layers are the same between images, so you have a greater chance of having a cache hit.

The environment has to spin up for every new job, regardless of whether it is in the same workflow or if it is a re-run/subsequent run. (CircleCI never reuses containers, for security reasons.) Once the job is finished, the container is destroyed. There is no guarantee that jobs, even in the same workflow, will run on the same Docker host machine. This implies that the cache status may differ.

In all cases, cache hits are not guaranteed, but are a bonus convenience when available. With this in mind, a worst-case scenario of a full image pull should be accounted for in all jobs.

In summary, the availability of caching is not something that can be controlled via settings or configuration, but by choosing a popular image, such as [CircleCI convenience images](https://circleci.com/developer/images), you will have more chances of hitting cached layers in the "Spin Up Environment" step.

### Available Docker resource classes
{: #available-docker-resource-classes }

The [`resource_class`]({{ site.baseurl }}/2.0/configuration-reference/#resource_class) key allows you to configure CPU and RAM resources for each
job. In Docker, the following resources classes are available:

Class                 | vCPUs | RAM
----------------------|-------|-----
small                 | 1     | 2GB
medium                | 2     | 4GB
medium+               | 3     | 6GB
large                 | 4     | 8GB
xlarge                | 8     | 16GB
2xlarge               | 16    | 32GB
2xlarge+              | 20    | 40GB
{: class="table table-striped"}

Where example usage looks like the following:

```yaml
jobs:
  build:
    docker:
      - image: cimg/base:current
    resource_class: xlarge
    steps:
    #  ...  other config
```

## Using machine
{: #using-machine }
Ubuntu 14.04 and 16.04 machine images [are deprecated and will be removed permanently May 31, 2022](https://circleci.com/blog/ubuntu-14-16-image-deprecation/). These images will be temporarily unavailable March 29 and April 26, 2022. Migrate from [14.04]({{ site.baseurl }}/2.0/images/linux-vm/14.04-to-20.04-migration/) or [16.04]({{ site.baseurl }}/2.0/images/linux-vm/16.04-to-20.04-migration/).
{: class="alert alert-warning"}

The `machine` option runs your jobs in a dedicated, ephemeral VM that has the following specifications:

{% include snippets/machine-resource-table.md %}

Using the `machine` executor gives your application full access to OS resources and provides you with full control over the job environment. This control can be useful in situations where you need full access to the network stack; for example, to listen on a network interface, or to modify the system with `sysctl` commands. To find out about migrating a project from using the Docker executor to using `machine`, see the [Executor Migration from Docker to Machine]({{ site.baseurl }}/2.0/docker-to-machine) document.

Using the `machine` executor also means that you get full access to the Docker process. This allows you to run privileged Docker containers and build new Docker images.

To use the machine executor,
set the [`machine` key]({{ site.baseurl }}/2.0/configuration-reference/#machine) in `.circleci/config.yml`:

{:.tab.machineblock.Cloud}
```yaml
version: 2.1
jobs:
  build:
    machine:
      image: ubuntu-2004:current
    resource_class: large
```

{:.tab.machineblock.Server}
```yaml
version: 2.1
jobs:
  build:
    machine: true
```

You can view the list of available images [here]({{ site.baseurl }}/2.0/configuration-reference/#available-linux-machine-images).

The following example uses an image and enables [Docker layer caching]({{ site.baseurl }}/2.0/docker-layer-caching) (DLC) which is useful when you are building Docker images during your job or workflow.

```yaml
machine:
  image: ubuntu-2004:202104-01
  docker_layer_caching: true    # default - false
```

The IP range `192.168.53.0/24` is reserved by CircleCI for internal use on the machine executor. This range should not be used in your jobs.

## Using macOS
{: #using-macos }

Using the `macos` executor allows you to run your job in a macOS environment on a VM. In macOS, the following resources classes are available:

Class                 | vCPUs | RAM
----------------------|-------|-----
medium                | 4 @ 2.7 GHz     | 8GB
macos.x86.medium.gen2 | 4 @ 3.2 GHz     | 8GB
large                 | 8 @ 2.7 GHz     | 16GB
macos.x86.metal.gen1<sup>(1)</sup>                 | 12 @ 3.2 GHz     | 32GB
{: class="table table-striped"}

You can also specify which version of Xcode should be used. See the [Supported Xcode Versions section of the Testing iOS]({{ site.baseurl }}/2.0/testing-ios/#supported-xcode-versions) document for the complete list of version numbers and information about technical specifications for the VMs running each particular version of Xcode.

```yaml
jobs:
  build:
    macos:
      xcode: 12.5.1

    steps:
      # Commands will execute in macOS container
      # with Xcode 12.5.1 installed
      - run: xcodebuild -version
```

### macOS VM Storage
{: #macos-vm-storage }

The amount of available storage on our macOS VMs depends on the resource class and Xcode image being used. The size of the Xcode images varies based on which tools are pre-installed.

Xcode Version | Class                 | Minimum Available Storage
--------------|-----------------------|--------------------------
10.3.0        | medium, large         | 36GB
10.3.0        | macos.x86.medium.gen2 | 36GB
11.*          | medium, large         | 23GB
11.*          | macos.x86.medium.gen2 | 23GB
12.*          | medium, large         | 30GB
12.*          | macos.x86.medium.gen2 | 30GB<sup>(2)</sup>
13.*          | medium, large         | 23GB
13.*          | macos.x86.medium.gen2 | 89GB
{: class="table table-striped"}

<sup>(1)</sup> _This resource requires a minimum 24-hour lease. See the [Dedicated Host for macOS]({{ site.baseurl }}/2.0/dedicated-hosts-macos) page to learn more about this resource class._

<sup>(2)</sup> _Exception: Xcode 12.0.1, 12.4.0 and 12.5.1 have a minimum 100GB of available storage._

## Using the Windows executor
{: #using-the-windows-executor }

Using the `windows` executor allows you to run your job in a Windows environment. The following is an example configuration that will run a simple Windows job. The syntax for using the Windows executor in your config differs depending on whether you are using:
* CircleCI Cloud – config version 2.1.
* Self-hosted installation of CircleCI server with config version 2.0 – this option is an instance of using the `machine` executor with a Windows image – _Introduced in CircleCI server v2.18.3_.

{:.tab.windowsblock.Cloud}
```yaml
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

{:.tab.windowsblock.Server}
```yaml
version: 2

jobs:
  build: # name of your job
    machine:
      image: windows-default
    resource_class: windows.medium
    steps:
      # Commands are run in a Windows virtual machine environment
        - checkout
        - run: Write-Host 'Hello, Windows'
```

Cloud users will notice the Windows orb is used to set up the Windows executor to simplify the configuration. See [the Windows orb details page](https://circleci.com/developer/orbs/orb/circleci/windows) for more details.

CircleCI server users should contact their system administrator for specific information about the image used for Windows jobs. The Windows image is configured by the system administrator, and in the CircleCI config is always available as the `windows-default` image name.

## Using GPUs
{: #using-gpus }

CircleCI Cloud has execution environments with Nvidia GPUs for specialized workloads. The hardware is Nvidia Tesla T4 Tensor Core GPU, and our GPU executors come in both Linux and Windows VMs.

{:.tab.gpublock.Linux}
```yaml
version: 2.1

jobs:
  build:
    machine:
      resource_class: gpu.nvidia.small
      image: ubuntu-1604-cuda-10.1:201909-23
    steps:
      - run: nvidia-smi
```

{:.tab.gpublock.Windows}
```yaml
version: 2.1

orbs:
  win: circleci/windows@2.3.0

jobs:
  build:
    executor: win/gpu-nvidia
    steps:
      - run: '&"C:\Program Files\NVIDIA Corporation\NVSMI\nvidia-smi.exe"'
```

Customers using CircleCI server can configure their VM service to use GPU-enabled machine executors. See [Running GPU Executors in Server][server-gpu].

## See also
{: #see-also }

[Configuration Reference]({{ site.baseurl }}/2.0/configuration-reference/)
