---
layout: classic-docs
title: "Choosing an Executor Type"
short-title: "Choosing an Executor Type"
description: "Overviews of the docker, machine, and executor types"
categories: [containerization]
order: 10
---
[building-docker-images]: {{ site.baseurl }}/2.0/building-docker-images/

This document describes the available executor types (`docker`, `machine`, and `macos`) in the following sections:

* TOC
{:toc}

## Overview
{:.no_toc}

An *executor type* defines the underlying technology or environment in which to run a job. CircleCI enables you to run jobs in one of three environments:

- Within Docker images (`docker`)
- Within a Linux virtual machine (VM) image (`machine`)
- Within a macOS VM image (`macos`)

It is possible to specify a different executor type for every job in your ['.circleci/config.yml']({{ site.baseurl }}/2.0/configuration-reference/) by specifying the executor type and an appropriate image. An *image* is a packaged system that has the instructions for creating a running environment.  A *container* or *virtual machine* is the term used for a running instance of an image. For example, you could specify an executor type and an image for every job:

- Jobs that require Docker images (`docker`) may use an image for Node.js or Python. The [pre-built CircleCI Docker image]({{ site.baseurl }}/2.0/circleci-images/) from the CircleCI Dockerhub will help you get started quickly without learning all about Docker. These images are not a full operating system, so they will generally make building your software more efficient. 
- Jobs that require a complete Linux virtual machine (VM) image (`machine`) may use an Ubuntu version such as 16.04.
- Jobs that require a macOS VM image (`macos`) may use an Xcode version such as 10.0.0.

For building software on Linux,
there are tradeoffs to using a `docker` image versus an Ubuntu-based `machine` image as the environment for the container, as follows:

Virtual Environment | `docker` | `machine`
----------|----------|----------
 Start time | Instant | 30-60 sec
 Clean environment | Yes | Yes
 Custom images | Yes | No
 Build Docker images | Yes <sup>(1)</sup> | Yes
 Full control over job environment | No | Yes
 Full root access | No | Yes
 Run multiple databases | Yes <sup>(2)</sup> | Yes
 Run multiple versions of the same software | No | Yes
 Layer caching | Yes | Yes
 Run privileged containers | No | Yes
 Use docker compose with volumes | No | Yes
 [Configurable resources (CPU/RAM)]({{ site.baseurl }}/2.0/configuration-reference/#resource_class) | Yes | No
{: class="table table-striped"}

<sup>(1)</sup> Requires using [Remote Docker][building-docker-images].

<sup>(2)</sup> While you can run multiple databases with Docker, all images (primary and secondary) share the underlying resource limits. Performance in this regard will be dictated by the compute capacities of your container plan.

It is also possible to use the `macos` executor type with `xcode`, see the [iOS Project Tutorial]({{ site.baseurl }}/2.0/ios-tutorial/) to get started.

## Using Docker

The `docker` key defines Docker as the underlying technology to run your jobs using Docker Containers. Containers are an instance of the Docker Image you specify and the first image listed in your configuration is the primary container image in which all steps run. If you are new to Docker, see the [Docker Overview documentation](https://docs.docker.com/engine/docker-overview/) for concepts.

Docker increases performance by building only what is required for your application. Specify a Docker image in your [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) file that will generate the primary container where all steps run:

```yaml
jobs:
  build:
    docker:
      - image: buildpack-deps:trusty
```

In this example, all steps run in the container created by the first image listed under the `build` job. To make the transition easy, CircleCI maintains convenience images on Docker Hub for popular languages. See [Using Pre-Built CircleCI Docker Images]({{ site.baseurl }}/2.0/circleci-images/) for the complete list of names and tags. If you need a Docker image that installs Docker and has Git, consider using `docker:stable-git`, which is an offical [Docker image](https://hub.docker.com/_/docker/).

### Docker Image Best Practices
{:.no_toc}

- Avoid using mutable tags like `latest` or `1` as the image version in your `config.yml file`. It is best practice to use precise image versions or digests, like `redis:3.2.7` or `redis@sha256:95f0c9434f37db0a4f...` as shown in the examples. Mutable tags often lead to unexpected changes in your job environment.  CircleCI cannot guarantee that mutable tags will return an up-to-date version of an image. You could specify `alpine:latest` and actually get a stale cache from a month ago. 

- If you experience increases in your run times due to installing additional tools during execution, it is best practice to use the [Building Custom Docker Images Documentation]({{ site.baseurl }}/2.0/custom-images/) to create a custom image with tools that are pre-loaded in the container to meet the job requirements. 

More details on the Docker Executor are available in the [Configuring CircleCI]({{ site.baseurl }}/2.0/configuration-reference/) document.

## Using Machine

The `machine` option runs your jobs in a dedicated, ephemeral VM
that has the following specifications:

CPUs | Processor                 | RAM | HD
-----|---------------------------|------------
2    | Intel(R) Xeon(R) @ 2.3GHz | 8GB | 100GB
{: class="table table-striped"}

Using the `machine` executor
gives your application full access to OS resources
and provides you with full control over the job environment.
This control can be useful in situations
where you need to use `ping`
or modify the system with `sysctl` commands.

Using the `machine` executor also enables you
to build a Docker image
without downloading additional packages
for languages like Ruby and PHP.

**Note**:
Using `machine` may require additional fees in a future pricing update.

To use the machine executor,
set the [`machine` key]({{ site.baseurl }}/2.0/configuration-reference/#machine) to `true` in `.circleci/config.yml`:

```yaml
version: 2
jobs:
  build:
    machine:
      image: ubuntu-1604:201903-01    # pins image to specific version
```

The default image for the machine executor is `circleci/classic:latest`.
You can specify other images
by using the `image` key.

**Note:**
The `image` key is not supported on private installations of CircleCI.
See the [VM Service documentation]({{ site.baseurl }}/2.0/vm-service) for more information.

The `image` key accepts one of three image types, refer to the [Configuration Reference]({{ site.baseurl }}/2.0/configuration-reference/#machine) for additional details about classic versions:

- `circleci/classic:latest`:
This is the default image.
Changes to this image are announced at least one week in advance.
- `circleci/classic:edge`:
This image receives the latest updates.
Changes to this image occur frequently.
- `circleci/classic:{YYYY-MM}`:
This image is pinned to a specific version
to prevent breaking changes.

All images have common language tools preinstalled.
Refer to the [specification script for the VM](https://raw.githubusercontent.com/circleci/image-builder/picard-vm-image/provision.sh) for more information.

The following example uses the default machine image and enables [Docker Layer Caching]({{ site.baseurl }}/2.0/docker-layer-caching) (DLC) which is useful when you are building Docker images during your job or Workflow. **Note:** You must open a support ticket to have a CircleCI Sales representative contact you about enabling this feature on your account for an additional fee.

```yaml
version: 2
jobs:
  build:
    machine:
      image: ubuntu-1604:201903-01
      docker_layer_caching: true    # default - false
```

## Using macOS

Using the `macos` executor allows you to run your job in a macOS environment on a VM. You can also specify which version of Xcode should be used. See the [Supported Xcode Versions section of the Testing iOS]({{ site.baseurl }}/2.0/testing-ios/#supported-xcode-versions) document for the complete list of version numbers and information about technical specifications for the VMs running each particular version of Xcode.

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

## Using Multiple Docker Images
It is possible to specify multiple images for your job. Specify multiple images if, for example, you need to use a database for your tests or for some other required service. **In a multi-image configuration job, all steps are executed in the container created by the first image listed**. All containers run in a common network and every exposed port will be available on `localhost` from a [primary container]({{ site.baseurl }}/2.0/glossary/#primary-container).

```
jobs:
  build:
    docker:
    # Primary container image where all steps run.
     - image: buildpack-deps:trusty
    # Secondary container image on common network. 
     - image: mongo:2.6.8-jessie
       command: [mongod, --smallfiles]

    working_directory: ~/

    steps:
      # command will execute in trusty container
      # and can access mongo on localhost
      - run: sleep 5 && nc -vz localhost 27017
```
Docker Images may be specified in three ways, by the image name and version tag on Docker Hub or by using the URL to an image in a registry:

### Public Convenience Images on Docker Hub
{:.no_toc}
  - `name:tag`
    - `circleci/node:7.10-jessie-browsers`
  - `name@digest`
    - `redis@sha256:34057dd7e135ca41...`

### Public Images on Docker Hub
{:.no_toc}
  - `name:tag`
    - `alpine:3.4`
  - `name@digest`
    - `redis@sha256:54057dd7e125ca41...`

### Public Docker Registries
{:.no_toc}
  - `image_full_url:tag`
    - `gcr.io/google-containers/busybox:1.24`
  - `image_full_url@digest`
    - `gcr.io/google-containers/busybox@sha256:4bdd623e848417d9612...`

Nearly all of the public images on Docker Hub and Docker Registry are supported by default when you specify the `docker:` key in your `config.yml` file. If you want to work with private images/registries, please refer to [Using Private Images]({{ site.baseurl }}/2.0/private-images).

## Docker Benefits and Limitations
Docker also has built-in image caching and enables you to build, run, and publish Docker images via [Remote Docker][building-docker-images]. Consider the requirements of your application as well. If the following are true for your application, Docker may be the right choice:
 
- Your application is self-sufficient
- Your application requires additional services to be tested
- Your application is distributed as a Docker Image (requires using [Remote Docker][building-docker-images])
- You want to use `docker-compose` (requires using [Remote Docker][building-docker-images])

Choosing Docker limits your runs to what is possible from within a Docker container (including our [Remote Docker][building-docker-images] feature). For instance, if you require low-level access to the network or need to mount external volumes consider using `machine`.

## See Also

[Configuring CircleCI]({{ site.baseurl }}/2.0/configuration-reference/)





