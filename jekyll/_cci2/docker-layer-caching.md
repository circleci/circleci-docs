---
layout: classic-docs
title: "Enabling Docker Layer Caching"
short-title: "Enabling Docker Layer Caching"
description: "How to reuse unchanged cache layers in images you build to reduce overall run time"
categories: [optimization]
order: 70
---

Docker Layer Caching (DLC) can reduce Docker image build times on CircleCI. DLC is available on
the [Performance and Custom](https://circleci.com/pricing/) usage plans (at 200 credits per build) and on installations of [CircleCI Server](https://circleci.com/enterprise/). This document provides an overview of DLC in the following sections:

* TOC
{:toc}

## Overview

Docker Layer Caching (DLC) is a great feature to use if building Docker images is a regular part of your CI/CD process. DLC will save image layers created within your jobs, rather than impact the actual container used to run your job. 

DLC caches the individual layers of any Docker images built during your CircleCI jobs, and then reuses unchanged image layers on subsequent CircleCI runs, rather than rebuilding the entire image every time. In short, the less your Dockerfiles change from commit to commit, the faster your image-building steps will run.

Docker Layer Caching can be used with both the [`machine` executor]({{ site.baseurl }}/2.0/executor-types/#using-machine) and the [Remote Docker Environment]({{ site.baseurl }}/2.0/building-docker-images) (`setup_remote_docker`).

### Limitations
{:.no_toc}

**Note:** DLC has **no** effect on Docker images used as build containers. That is, containers that are used to _run_ your jobs are specified with the `image` key when using the [`docker` executor]({{ site.baseurl }}/2.0/executor-types/#using-docker) and appear in the Spin up Environment step on your Jobs pages.

DLC is only useful when creating your own Docker image  with docker build, docker compose, or similar docker commands), it does not decrease the wall clock time that all builds take to spin up the initial environment. 

``` YAML
version: 2 
jobs: 
 build: 
   docker: 
     # DLC does nothing here, its caching depends on commonality of the image layers.
     - image: circleci/node:9.8.0-stretch-browsers 
   steps: 
     - checkout 
     - setup_remote_docker: 
         docker_layer_caching: true 
     # DLC will explicitly cache layers here and try to avoid rebuilding.
     - run: docker build .
``` 

## How DLC Works

DLC caches your Docker image layers by creating an external volume and attaching it to the instances that execute the `machine` and Remote Docker jobs. The volume is attached in a way that makes Docker save the image layers on the attached volume. When the job finishes, the volume is disconnected and re-used in a future job. This means that the layers downloaded in a previous job with DLC will be available in the next job that uses the same DLC volume.

One DLC volume can only be attached to one `machine` or Remote Docker job at a time. If one DLC volume exists but two jobs that request DLC are launched, CircleCI will create a new DLC volume and attach it to the second job. From that point on the project will have two DLC volumes associated with it. This applies to parallel jobs as well: if two `machine` jobs are run in parallel, they will get different DLC volumes.

Depending on which jobs the volumes are used in, they might end up with different layers saved on them. The volumes that are used less frequently might have older layers saved on them.

The DLC volumes are deleted after 7 days of not being used in a job.

CircleCI will create a maximum of 50 DLC volumes per project, so a maximum of 50 concurrent `machine` or Remote Docker jobs per project can have access to DLC. This takes into account the parallelism of the jobs, so a maximum of 1 job with 50x parallelism will have access to DLC per project, or 2 jobs with 25x parallelism, and so on.

![Docker Layer Caching]({{ site.baseurl }}/assets/img/docs/dlc_cloud.png)

### Remote Docker Environment
{:.no_toc}

To use DLC in the Remote Docker Environment, add `docker_layer_caching: true` under the `setup_remote_docker` key in your [config.yml]({{ site.baseurl }}/2.0/configuration-reference/) file:

``` YAML
- setup_remote_docker:
    docker_layer_caching: true  # default - false  
``` 

Every layer built in a previous job will be accessible in the Remote Docker Environment. However, in some cases your job may run in a clean environment, even if the configuration specifies `docker_layer_caching: true`.

If you run many parallel jobs for the same project that depend on the same environment, all of them will be provided with a Remote Docker environment. Docker Layer Caching guarantees that jobs will have exclusive Remote Docker Environments that other jobs cannot access. However, some of the jobs may have cached layers, some may not have cached layers, and not all of the jobs will have identical caches.

**Note:** Previously DLC was enabled via the `reusable: true` key. The `reusable` key is deprecated in favor of the `docker_layer_caching` key. In addition, the `exclusive: true` option is deprecated and all Remote Docker VMs are now treated as exclusive. This means that when using DLC, jobs are guaranteed to have an exclusive Remote Docker Environment that other jobs cannot access.

### Machine Executor
{:.no_toc}

Docker Layer Caching can also reduce job runtimes when building Docker images using the [`machine` executor]({{ site.baseurl }}/2.0/executor-types/#using-machine). Use DLC with the `machine` executor by adding `docker_layer_caching: true` below your `machine` key (as seen above in our [example](#configyml)):

``` YAML
machine:
  docker_layer_caching: true    # default - false
```

## Examples

Let's use the following Dockerfile to illustrate how Docker Layer Caching works. This example Dockerfile is adapted from our [Elixir convenience image](https://hub.docker.com/r/circleci/elixir/~/dockerfile):

### Dockerfile
{:.no_toc}

```
FROM elixir:1.6.5

# make apt non-interactive
RUN echo 'APT::Get::Assume-Yes "true";' > /etc/apt/apt.conf.d/90circleci \
  && echo 'DPkg::Options "--force-confnew";' >> /etc/apt/apt.conf.d/90circleci

ENV DEBIAN_FRONTEND=noninteractive

# man directory is missing in some base images
# https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=863199
RUN apt-get update \
  && mkdir -p /usr/share/man/man1 \
  && apt-get install -y \
    git mercurial xvfb \
    locales sudo openssh-client ca-certificates tar gzip parallel \
    net-tools netcat unzip zip bzip2 gnupg curl wget

# set timezone to UTC
RUN ln -sf /usr/share/zoneinfo/Etc/UTC /etc/localtime

# use unicode
RUN locale-gen C.UTF-8 || true
ENV LANG=C.UTF-8

# install docker
RUN set -ex \
  && export DOCKER_VERSION=$(curl --silent --fail --retry 3 \
    https://download.docker.com/linux/static/stable/x86_64/ | \
    grep -o -e 'docker-[.0-9]*-ce\.tgz' | sort -r | head -n 1) \
  && DOCKER_URL="https://download.docker.com/linux/static/stable/x86_64/${DOCKER_VERSION}" \
  && echo Docker URL: $DOCKER_URL \
  && curl --silent --show-error --location --fail --retry 3 --output /tmp/docker.tgz "${DOCKER_URL}" \
  && ls -lha /tmp/docker.tgz \
  && tar -xz -C /tmp -f /tmp/docker.tgz \
  && mv /tmp/docker/* /usr/bin \
  && rm -rf /tmp/docker /tmp/docker.tgz

# install docker-compose
RUN curl --silent --show-error --location --fail --retry 3 --output /usr/bin/docker-compose \
    https://circle-downloads.s3.amazonaws.com/circleci-images/cache/linux-amd64/docker-compose-latest \
  && chmod +x /usr/bin/docker-compose \
  && docker-compose version

# setup circleci user
RUN groupadd --gid 3434 circleci \
  && useradd --uid 3434 --gid circleci --shell /bin/bash --create-home circleci \
  && echo 'circleci ALL=NOPASSWD: ALL' >> /etc/sudoers.d/50-circleci \
  && echo 'Defaults    env_keep += "DEBIAN_FRONTEND"' >> /etc/sudoers.d/env_keep

USER circleci

CMD ["/bin/sh"]
```

### Config.yml
{:.no_toc}

In the config.yml snippet below, let's assume the `build_elixir` job is regularly building an image using the above Dockerfile. By adding `docker_layer_caching: true` underneath our `machine` executor key, we ensure that CircleCI will save each Docker image layer as this Elixir image is built.

```yaml
version: 2
jobs:
  build_elixir:
    machine:
      docker_layer_caching: true
    steps:
      - checkout
      - run:
          name: build Elixir image
          command: docker build -t circleci/elixir:example .
```

On subsequent commits, if our example Dockerfile has not changed, then DLC will pull each Docker image layer from cache during the `build Elixir image` step, and our image will theoretically build almost instantaneously.

Now, let's say we add the following step to our Dockerfile, in between the `# use unicode` and `# install docker` steps:

```
# install jq
RUN JQ_URL="https://circle-downloads.s3.amazonaws.com/circleci-images/cache/linux-amd64/jq-latest" \
  && curl --silent --show-error --location --fail --retry 3 --output /usr/bin/jq $JQ_URL \
  && chmod +x /usr/bin/jq \
  && jq --version
```

On the next commit, DLC will ensure that we still get cached image layers for the first few steps in our Dockerfile—pulling from `elixir:1.6.5` as our base image, the `# make apt non-interactive` step, the step starting with `RUN apt-get update`, the `# set timezone to UTC` step, and the `# use unicode` step.

However, because our `#install jq` step is new, it and all subsequent steps will need to be run from scratch, because the Dockerfile changes will invalidate the rest of the image layer cache. Overall, though, with DLC enabled, our image will still build more quickly, due to the unchanged layers/steps towards the beginning of the Dockerfile.

If we were to change the first step in our example Dockerfile—perhaps we want to pull from a different Elixir base image—then our entire cache for this image would be invalidated, even if every other part of our Dockerfile stayed the same.

## Video: Overview of Docker Layer Caching
{:.no_toc}

In the video example, the job runs all of the steps in a Dockerfile with the `docker_layer_caching: true` for the `setup_remote_docker` step. On subsequent runs of that job, steps that haven't changed in the Dockerfile, will be reused. So, the first run takes over two minutes to build the Docker image. If nothing changes in the Dockerfile before the second run, those steps happen instantly, in zero seconds.

```yaml 
version: 2 
jobs: 
 build: 
   docker: 
     - image: circleci/node:9.8.0-stretch-browsers 
   steps: 
     - checkout 
     - setup_remote_docker: 
         docker_layer_caching: true 
     - run: docker build . 
``` 

When none of the layers in the image change between job runs, DLC pulls the layers from cache from the image that was built previously and reuses those instead of rebuilding the entire image. 

If part of the Dockerfile changes (which changes part of the image) a subsequent run of the exact same job with the modified Dockerfile may still finish faster than rebuilding the entire image. It will finish faster because the cache is used for the first few steps that didn't change in the Dockerfile. The steps that follow the change must be rerun because the Dockerfile change invalidates the cache. 

So, if you change something in the Dockerfile, all of those later steps are invalidated and the layers have to be rebuilt. When some of the steps remain the same (the steps before the one you removed), those steps can be reused. So, it is still faster than rebuilding the entire image.

<div class="video-wrapper">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/AL7aBN7Olng" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
</div>

