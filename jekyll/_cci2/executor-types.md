---
layout: classic-docs
title: "Choosing an Executor Type"
short-title: "Choosing an Executor Type"
description: "Overviews of the docker, machine, and executor types"
categories: [containerization]
order: 10
---
[building-docker-images]: {{ site.baseurl }}/2.0/building-docker-images/

*[Docker, Machine, and iOS Builds]({{ site.baseurl }}/2.0/build/) > Choosing an Executor Type*

This document describes the `docker`, `machine`, and `macos` environments in the following sections:

* TOC
{:toc}

## Overview
This version of CircleCI enables you to run jobs in one of three environments: using  Docker images, using a dedicated Linux VM image, or using a macOS VM image.

For building on Linux, there are tradeoffs to `docker` versus `machine`, as follows:

Virtual Environment | `docker` | `machine`
----------|----------|----------
 Start time | Instant | 30-60 sec
 Clean environment | Yes | Yes
 Custom images | Yes | No
 Build Docker images | Yes <sup>(1)</sup> | Yes
 Full control over job environment | No | Yes
 Full root access | No | Yes
 Run multiple databases | No | Yes
 Run multiple versions of the same software | No | Yes
 Layer caching | Yes | Yes
 Run privileged containers | No | Yes
 Use docker compose with volumes | No | Yes
{: class="table table-striped"}

<sup>(1)</sup> Requires using [Remote Docker][building-docker-images].

It is also possible to use the `macos` executor type with `xcode`, see the [iOS Project Tutorial]({{ site.baseurl }}/2.0/ios-tutorial/) to get started.

### Using Docker

The `docker` key defines Docker as the underlying technology to run your jobs using Docker Containers. Containers are an instance of the Docker Image you specify and the first image listed in your configuration is the primary container image in which all steps run.

Docker increases performance by building only what is required for your application. Specify a Docker image in your `.circleci/config.yml` file that will generate the primary container where all steps run:
```
jobs:
  build:
    docker:
      - image: buildpack-deps:trusty
```
In this example, all steps run in the container created by the first image listed under the `build` job. To make the transition easy, CircleCI maintains convenience images on Docker Hub for popular languages. See [Using Pre-Built CircleCI Docker Images]({{ site.baseurl }}/2.0/circleci-images/) for the complete list of names and tags. If you need a Docker image that installs Docker and has Git, consider using `docker:stable-git`, which is an offical [Docker image](https://hub.docker.com/_/docker/).

### Using Machine

The `machine` option will run your jobs in a dedicated, ephemeral Virtual Machine (VM). **Note**: Use of `machine` may require additional fees in a future pricing update. 

To use the machine executor with the default `machine` image, set the `machine` key to `true` in `.circleci/config.yml`:

```YAML
jobs:
  build:
    machine: true
```

Using the `machine` executor enables your application with full access to OS resources and provides you with full control over the job environment, if for example, you need to use `ping` or to modify system with `sysctl` commands. In addition, it enables your repo to build a docker image without additional downloads for languages like Ruby and PHP.

This example specifies a particular image for the `machine` executor:

```YAML
jobs:
  build:
    machine:
      image: circleci/classic:201708-01
``` 

 Following are the available machine images:

* `circleci/classic:latest` is the default image. Changes to this will be announced at least one week before they go live.
* `circleci/classic:edge` receives the latest updates and will be upgraded at short notice.
* `circleci/classic:[year-month]` This lets you pin the image version to prevent breaking changes. Refer to the [Configuration Reference](https://circleci.com/docs/2.0/configuration-reference/#machine) for versions.

The images have common language tools preinstalled. Refer to the [specification script for the VM](https://raw.githubusercontent.com/circleci/image-builder/picard-vm-image/provision.sh) for more information about additional tools.

### Using macOS

Using the `macos` executor allows you to run your build in a VM running macOS with a specific version of Xcode installed.

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
     - image: mongo:2.6.8
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
    - `circleci/node:7.10-browsers`
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

## Docker Image Best Practices

- Avoid using mutable tags like `latest` or `1` as the image version in your `config.yml file`. Mutable tags often lead to unexpected changes in your job environment.  CircleCI cannot guarantee that mutable tags will return an up-to-date version of an image. You could specify `alpine:latest` and actually get a stale cache from a month ago. Instead, we recommend using precise image versions or digests, like `redis:3.2.7` or `redis@sha256:95f0c9434f37db0a4f...` as shown in the examples.

- If you experience increases in your run times due to installing additional tools during execution, it is best practice to use the [Building Custom Docker Images Documentation]({{ site.baseurl }}/2.0/custom-images/) to create a custom image with tools that are pre-loaded in the container to meet the job requirements. 

More details on the Docker Executor are available [here]({{ site.baseurl }}/2.0/configuration-reference/).





