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

Docker layer caching can be used with both the `machine` executor and in the [remote Docker environment](/docs/building-docker-images/) (`setup_remote_docker`).

## Quickstart

### Remote Docker environment
{: #remote-docker-environment }

To use DLC with the Docker execution environment, you will need to configure your job to run in the Remote Docker Environment. To do this, add `docker_layer_caching: true` under the `setup_remote_docker` key in your [`.circleci/config.yml`](/docs/configuration-reference/) file:

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

Every layer built in a previous job will be accessible in the Remote Docker Environment. However, in some cases your job may run in a clean environment, even if the configuration specifies `docker_layer_caching: true`.

If you run many concurrent jobs for the same project that depend on the same environment, all of them will be provided with a Remote Docker environment. Docker layer caching guarantees that jobs will have exclusive Remote Docker Environments that other jobs cannot access. However, some of the jobs may have cached layers, some may not have cached layers, and not all of the jobs will have identical caches.

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

DLC is only useful when creating your own Docker image with `docker build`, `docker compose`, or similar docker commands. It does not decrease the wall clock time that all builds take to spin up the initial environment.

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

DLC caches your Docker image layers using a sparse file within the container/virtual machine used to run your job. The same applies to jobs that use parallelism. If two `machine` jobs are run in parallel, each VM will have a separate DLC cache.

If, for example, the first run of your job takes over two minutes to build a Docker image, and nothing changes in the Dockerfile before the second run, the Docker file build steps happen instantly, in zero seconds.

When none of the layers in the image change between job runs, DLC pulls the layers from the cache and reuses those instead of rebuilding the entire image.

If part of the Dockerfile changes (which changes part of the image), a subsequent run of the exact same job with the modified Dockerfile may still finish faster than rebuilding the entire image. This is because the cache can still be used for the first few steps that did not change in the Dockerfile. The steps that follow the change must be rerun because the Dockerfile change invalidates the cache for those layers.

If you change something in your Dockerfile, all of the later steps (from the point that the change was made) are invalidated and the layers have to be rebuilt. When some of the steps remain the same (the steps before the one you removed), those steps can be reused. So, it is still faster than rebuilding the entire image.

### Scope of cache
{: #scope-of-cache }

With DLC enabled, the entirety of `/var/lib/docker` is cached, which also includes any custom networks created in previous jobs.

## Examples
{: #examples }

We will use the following example Dockerfile to illustrate how Docker layer caching works. This eDockerfile is adapted from our [Elixir legacy convenience image](https://hub.docker.com/r/circleci/elixir/~/dockerfile):

### Dockerfile
{: #dockerfile }

```dockerfile
FROM elixir:1.11.4

# make Apt non-interactive
RUN echo 'APT::Get::Assume-Yes "true";' > /etc/apt/apt.conf.d/90circleci \
  && echo 'DPkg::Options "--force-confnew";' >> /etc/apt/apt.conf.d/90circleci

ENV DEBIAN_FRONTEND=noninteractive

# Debian Jessie is EOL'd and original repos do not work.
# Switch to the archive mirror until we can get people to
# switch to Stretch.
RUN if grep -q Debian /etc/os-release && grep -q jessie /etc/os-release; then \
	rm /etc/apt/sources.list \
    && echo "deb http://archive.debian.org/debian/ jessie main" >> /etc/apt/sources.list \
    && echo "deb http://security.debian.org/debian-security jessie/updates main" >> /etc/apt/sources.list \
	; fi

# Make sure PATH includes ~/.local/bin
# https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=839155
# This only works for root. The circleci user is done near the end of this Dockerfile
RUN echo 'PATH="$HOME/.local/bin:$PATH"' >> /etc/profile.d/user-local-path.sh

# man directory is missing in some base images
# https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=863199
RUN apt-get update \
  && mkdir -p /usr/share/man/man1 \
  && apt-get install -y \
    git mercurial xvfb apt \
    locales sudo openssh-client ca-certificates tar gzip parallel \
    net-tools netcat unzip zip bzip2 gnupg curl wget make


# Set timezone to UTC by default
RUN ln -sf /usr/share/zoneinfo/Etc/UTC /etc/localtime

# Use unicode
RUN locale-gen C.UTF-8 || true
ENV LANG=C.UTF-8

# install jq
RUN JQ_URL="https://circle-downloads.s3.amazonaws.com/circleci-images/cache/linux-amd64/jq-latest" \
  && curl --silent --show-error --location --fail --retry 3 --output /usr/bin/jq $JQ_URL \
  && chmod +x /usr/bin/jq \
  && jq --version

# Install Docker

#>    # To install, run the following commands as root:
#>    curl -fsSLO https://download.docker.com/linux/static/stable/x86_64/docker-17.05.0-ce.tgz && tar --strip-components=1 -xvzf docker-17.05.0-ce.tgz -C /usr/local/bin
#>
#>    # Then start docker in daemon mode:
#>    /usr/local/bin/dockerd

RUN set -ex \
  && export DOCKER_VERSION=docker-19.03.12.tgz \
  && DOCKER_URL="https://download.docker.com/linux/static/stable/x86_64/${DOCKER_VERSION}" \
  && echo Docker URL: $DOCKER_URL \
  && curl --silent --show-error --location --fail --retry 3 --output /tmp/docker.tgz "${DOCKER_URL}" \
  && ls -lha /tmp/docker.tgz \
  && tar -xz -C /tmp -f /tmp/docker.tgz \
  && mv /tmp/docker/* /usr/bin \
  && rm -rf /tmp/docker /tmp/docker.tgz \
  && which docker \
  && (docker version || true)

# docker compose
RUN COMPOSE_URL="https://circle-downloads.s3.amazonaws.com/circleci-images/cache/linux-amd64/docker-compose-latest" \
  && curl --silent --show-error --location --fail --retry 3 --output /usr/bin/docker-compose $COMPOSE_URL \
  && chmod +x /usr/bin/docker-compose \
  && docker-compose version

# install dockerize
RUN DOCKERIZE_URL="https://circle-downloads.s3.amazonaws.com/circleci-images/cache/linux-amd64/dockerize-latest.tar.gz" \
  && curl --silent --show-error --location --fail --retry 3 --output /tmp/dockerize-linux-amd64.tar.gz $DOCKERIZE_URL \
  && tar -C /usr/local/bin -xzvf /tmp/dockerize-linux-amd64.tar.gz \
  && rm -rf /tmp/dockerize-linux-amd64.tar.gz \
  && dockerize --version

RUN groupadd --gid 3434 circleci \
  && useradd --uid 3434 --gid circleci --shell /bin/bash --create-home circleci \
  && echo 'circleci ALL=NOPASSWD: ALL' >> /etc/sudoers.d/50-circleci \
  && echo 'Defaults    env_keep += "DEBIAN_FRONTEND"' >> /etc/sudoers.d/env_keep

# BEGIN IMAGE CUSTOMIZATIONS

# END IMAGE CUSTOMIZATIONS

USER circleci
ENV PATH /home/circleci/.local/bin:/home/circleci/bin:${PATH}

CMD ["/bin/sh"]
```

### Config.yml
{: #configyml }

In the `.circleci/config.yml` snippet below, let's assume the `build_elixir` job is regularly building an image using the above Dockerfile.

By adding `docker_layer_caching: true` underneath our `machine` executor key, we ensure that CircleCI will save each Docker image layer as this Elixir image is built.

```yaml
version: 2.1
jobs:
  build_elixir:
    machine:
      image: ubuntu-2004:202104-01
      docker_layer_caching: true
    steps:
      - checkout
      - run:
          name: build Elixir image
          command: docker build -t circleci/elixir:example .
```

On subsequent commits, if our example Dockerfile has not changed, then DLC will pull each Docker image layer from cache during the `build Elixir image` step, and our image will theoretically build almost instantaneously.

Now, let's say we add the following step to our Dockerfile, in between the `# use unicode` and `# install docker` steps:

```dockerfile
# Install jq
RUN JQ_URL="https://circle-downloads.s3.amazonaws.com/circleci-images/cache/linux-amd64/jq-latest" \
  && curl --silent --show-error --location --fail --retry 3 --output /usr/bin/jq $JQ_URL \
  && chmod +x /usr/bin/jq \
  && jq --version
```

On the next commit, DLC will ensure that we still get cached image layers for the first few steps in our Dockerfile—pulling from `elixir:1.11.4` as our base image, the `# make apt non-interactive` step, the step starting with `RUN apt-get update`, the `# set timezone to UTC` step, and the `# use unicode` step.

However, because our `#install jq` step is new, it as well as subsequent steps need to be run from scratch, because the Dockerfile changes will invalidate the rest of the image layer cache. But overall, with DLC enabled our image will still build more quickly, due to the unchanged layers/steps towards the beginning of the Dockerfile.

If we were to change the first step in our example Dockerfile (for example, perhaps we want to pull from a different Elixir base image), then our entire cache for this image would be invalidated even if every other part of our Dockerfile stayed the same.

## Deprecated keys
{: #deprecated-keys }

DLC was previously enabled via the `reusable: true` key. The `reusable` key has been deprecated in favor of the `docker_layer_caching` key.

In addition, the `exclusive: true` option is deprecated and all Remote Docker VMs are now treated as exclusive. This means that when using DLC, jobs are guaranteed to have an exclusive Remote Docker environment that other jobs cannot access.

## Learn More
{: #learn-more }
Take the [DLC course](https://academy.circleci.com/docker-layer-caching?access_code=public-2021) with CircleCI Academy to learn more.
