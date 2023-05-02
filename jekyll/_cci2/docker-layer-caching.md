---
layout: classic-docs
title: "Docker layer caching overview"
description: "How to reuse unchanged cache layers in images you build to reduce overall run time"
contentTags:
  platform:
  - Cloud
  - Server v4.x
  - Server v3.x
---

Use Docker layer caching (DLC) to reduce Docker image build times on CircleCI. DLC is available on all CircleCI plans, and credits are charged per job run.

## Introduction
{: #introduction }

Docker layer caching (DLC) is beneficial if building Docker images is a regular part of your CI/CD process. DLC saves image layers created within your jobs, using a [_sparse file_](https://en.wikipedia.org/wiki/Sparse_file).

DLC caches the individual layers of any Docker images built during your CircleCI jobs, and then reuses unchanged image layers on subsequent job runs, rather than rebuilding the entire image every time. In short, the less your Dockerfiles change from commit to commit, the less time your image-building jobs will take to run.

Docker layer caching can be used with both the `machine` executor and in a [remote Docker environment](/docs/building-docker-images/) (`setup_remote_docker`).

## Quickstart
{: #quickstart }

### Remote Docker environment
{: #remote-docker-environment }

To use DLC with the Docker execution environment, you will need to configure your job to run in a Remote Docker Environment. To do this, add `docker_layer_caching: true` under the `setup_remote_docker` key in your [`.circleci/config.yml`](/docs/configuration-reference/) file:

```yaml
version: 2.1

jobs:
 build:
    docker:
      - image: cimg/base:2023.04

    steps:
      - checkout
      - setup_remote_docker:
          docker_layer_caching: true
```

### Machine executor
{: #machine-executor }

DLC can be used when building Docker images using the [`machine` executor](/docs/configuration-reference/#machine). Use DLC with the `machine` executor by adding `docker_layer_caching: true` below your `machine` key:

```yml
version: 2.1

jobs:
 build:
    machine:
      image: ubuntu-2004:202104-01  # any available image
      docker_layer_caching: true    # default - false

    steps:
      - checkout
```

## Limitations
{: #limitations }

DLC is only useful when creating your own Docker image with `docker build`, `docker compose`, or similar Docker commands. It does not decrease the wall clock time that all builds take to spin up the initial environment.

```yaml
version: 2.1

orbs:
  browser-tools: circleci/browser-tools@1.2.3

jobs:
 build:
    docker:
      - image: cimg/node:17.2-browsers # DLC does nothing here, its caching depends on commonality of the image layers.

    steps:
      - checkout
      - setup_remote_docker:
          docker_layer_caching: true # DLC will explicitly cache layers here and try to avoid rebuilding.
      - run: docker build .
```

DLC has **no** effect on Docker images used as build containers. That is, containers that are used to _run_ your jobs are specified with the `image` key when using the [`docker` executor](/docs/using-docker/) and appear in the **Spin up Environment** step on your jobs pages.
{: class="alert alert-info"}

## How DLC works
{: #how-dlc-works }

DLC caches your Docker image layers using a sparse file within the container/virtual machine used to run your job.

If, for example, the first run of your job takes over two minutes to build a Docker image, and nothing changes in the Dockerfile before the second run, the Dockerfile build steps happen instantly, in zero seconds.

When none of the layers in the image change between job runs, DLC pulls the layers from the cache and reuses those instead of rebuilding the entire image.

If part of the Dockerfile changes (which changes part of the image), a subsequent run of the exact same job with the modified Dockerfile may still finish faster than rebuilding the entire image. This is because the cache can still be used for the first few steps that did not change in the Dockerfile. The steps that follow the change must be rerun because the Dockerfile change invalidates the cache for those layers.

If you change something in your Dockerfile, all of the later steps (from the point that the change was made) are invalidated and the layers have to be rebuilt. When some of the steps remain the same (the steps before the one you removed), those steps can be reused. So, it is still faster than rebuilding the entire image.

### Parallelism and DLC
{: parallelism-and-dlc }

DLC operates in the same way for jobs that use parallelism. If a `machine` job using DLC is configured with `parallelism: 2`, two jobs run in parallel. Each virtual machine in this case will have a separate DLC cache, and whichever is saved last will be used for the next build.

### Scope of cache
{: #scope-of-cache }

With DLC enabled, the entirety of `/var/lib/docker` is cached.

## Deprecated keys
{: #deprecated-keys }

DLC was previously enabled via the `reusable: true` key. The `reusable` key has been deprecated in favor of the `docker_layer_caching` key.

In addition, the `exclusive: true` option is deprecated and all remote Docker VMs are now treated as exclusive. This means that when using DLC, jobs are guaranteed to have an exclusive remote Docker environment that other jobs cannot access.

## Learn More
{: #learn-more }

Take the [DLC course](https://academy.circleci.com/docker-layer-caching?access_code=public-2021) with CircleCI Academy to learn more.
