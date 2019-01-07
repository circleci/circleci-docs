---
layout: classic-docs
title: "Running Docker Commands"
short-title: "Running Docker Commands"
description: "How to build Docker images and access remote services"
categories: [configuring-jobs]
order: 55
---

This document explains how to build Docker images for deploying elsewhere or for further testing and how to start services in remote docker containers in the following sections:

* TOC
{:toc}

## Overview

To build Docker images for deployment, you must use a special `setup_remote_docker` key which creates a separate environment for each build for security. This environment is remote, fully-isolated and has been configured to execute Docker commands. If your job requires `docker` or `docker-compose` commands, add the `setup_remote_docker` step into your `.circleci/config.yml`:

```yaml
jobs:
  build:
    steps:
      # ... steps for building/testing app ...

      - setup_remote_docker
```

When `setup_remote_docker` executes, a remote environment will be created, and your current [primary container][primary-container] will be configured to use it. Then, any docker-related commands you use will be safely executed in this new environment.

**Note:** The use of the `setup_remote_docker` key is reserved for configs in
which your primary executor _is_ a docker container. If your executor is
`machine` or `macos` (and you want to use docker commands in your config) you do not need to use the `setup_remote_docker` key.

### Specifications
{:.no_toc}

The Remote Docker Environment has the following technical specifications:

CPUs | Processor                 | RAM | HD
-----|---------------------------|-----|------
2    | Intel(R) Xeon(R) @ 2.3GHz | 8GB | 100GB
{: class="table table-striped"}

### Example
{:.no_toc}

Following is an example of building a Docker image using `machine` with the default image:

```yaml
version: 2
jobs:
 build:
   machine: true
   steps:
     - checkout
     # start proprietary DB using private Docker image
     # with credentials stored in the UI
     - run: |
         docker login -u $DOCKER_USER -p $DOCKER_PASS
         docker run -d --name db company/proprietary-db:1.2.3

     # build the application image
     - run: docker build -t company/app:$CIRCLE_BRANCH .

     # deploy the image
     - run: docker push company/app:$CIRCLE_BRANCH
```


Following is an example where we build and push a Docker image for our [demo docker project](https://github.com/CircleCI-Public/circleci-demo-docker):

```yaml
version: 2
jobs:
  build:
    docker:
      - image: golang:1.6.4-jessie   # (1)
    working_directory: /go/src/github.com/CircleCI-Public/circleci-demo-docker
    steps:
      - checkout
      # ... steps for building/testing app ...

      - setup_remote_docker:   # (2)
          docker_layer_caching: true # (3)

      # use a primary image that already has Docker (recommended)
      # or install it during a build like we do here
      - run:
          name: Install Docker client
          command: |
            set -x
            VER="17.03.0-ce"
            curl -L -o /tmp/docker-$VER.tgz https://download.docker.com/linux/static/stable/x86_64/docker-$VER.tgz
            tar -xz -C /tmp -f /tmp/docker-$VER.tgz
            mv /tmp/docker/* /usr/bin

      # build and push Docker image
      - run: |
          TAG=0.1.$CIRCLE_BUILD_NUM
          docker build -t   CircleCI-Public/circleci-demo-docker:$TAG .     
          docker login -u $DOCKER_USER -p $DOCKER_PASS         # (4)
          docker push CircleCI-Public/circleci-demo-docker:$TAG
```

Let’s break down what’s happening during this build’s execution:

1. All commands are executed in the [primary-container]({{ site.baseurl }}/2.0/glossary/#primary-container).
2. Once `setup_remote_docker` is called, a new remote environment is created, and your primary container is configured to use it. All docker-related commands are also executed in your primary container, but building/pushing images and running containers happens in the remote Docker Engine.
3. We enable [Docker Layer Caching][docker-layer-caching] here to speed up image building.
4. We use project environment variables to store credentials for Docker Hub.

## Docker Version

If your job requires a specific docker version, you can set it as a `version` attribute:

```yaml
      - setup_remote_docker:
          version: 17.05.0-ce
```

CircleCI supports multiple versions of Docker and defaults to using `17.03.0-ce`. Consult the [Stable releases](https://download.docker.com/linux/static/stable/x86_64/) or [Edge releases](https://download.docker.com/linux/static/edge/x86_64/) for the full list of supported versions.

If you need a Docker image that installs Docker and has Git, use `17.05.0-ce-git`. **Note:** The `version` key is not currently supported on CircleCI installed in your private cloud or datacenter. Contact your system administrator for information about the Docker version installed in your remote Docker environment.

## Separation of Environments
The job and [remote docker]({{ site.baseurl }}/2.0/glossary/#remote-docker) run in separate environments. Therefore, Docker containers cannot directly communicate with the containers running in remote docker.

### Accessing Services
{:.no_toc}

It is **not** possible to start a service in remote docker and ping it directly from a primary container or to start a primary container that can ping a service in remote docker. To solve that, you’ll need to interact with a service from remote docker, as well as through the same container:

```yaml
#...
      - run:
          name: "Start Service and Check That it’s Running"
          command: |
            docker run -d --name my-app my-app
            docker exec my-app curl --retry 10 --retry-connrefused http://localhost:8080
#...
```

A different way to do this is to use another container running in the same network as the target container:

```yaml
#...
      - run: |
          docker run -d --name my-app my-app
          docker run --network container:my-app appropriate/curl --retry 10 --retry-connrefused http://localhost:8080
#...
```

### Mounting Folders
{:.no_toc}

It is **not** possible to mount a folder from your job space into a container in Remote Docker (and vice versa). You may use the `docker cp` command to transfer files between these two environments. For example, to start a container in Remote Docker using a config file from your source code:

``` yaml
- run: |
    # create a dummy container which will hold a volume with config
    docker create -v /cfg --name configs alpine:3.4 /bin/true
    # copy a config file into this volume
    docker cp path/in/your/source/code/app_config.yml configs:/cfg
    # start an application container using this volume
    docker run --volumes-from configs app-image:1.2.3
```

In the same way, if your application produces some artifacts that need to be stored, you can copy them from Remote Docker:

``` yaml
- run: |
    # start container with the application
    # make sure you're not using `--rm` option otherwise the container will be killed after finish
    docker run --name app app-image:1.2.3

- run: |
    # after application container finishes, copy artifacts directly from it
    docker cp app:/output /path/in/your/job/space
```

It is also possible to use https://github.com/outstand/docker-dockup or a similar image for backup and restore to spin up a container as shown in the following example `circle-dockup.yml` config:

```
version: '2'
services:
 bundler-cache:
   image: outstand/dockup:latest
   command: restore
   container_name: bundler-cache
   tty: true
   environment:
     COMPRESS: 'false'
   volumes:
     - bundler-data:/source/bundler-data
```

Then, the sample CircleCI `.circleci/config.yml` snippets below populate and back up the `bundler-cache` container.

{% raw %}
``` yaml
# Populate bundler-data container from circleci cache
- restore_cache:
    keys:
      - v4-bundler-cache-{{ arch }}-{{ .Branch }}-{{ checksum "Gemfile.lock" }}
      - v4-bundler-cache-{{ arch }}-{{ .Branch }}
      - v4-bundler-cache-{{ arch }}      
- run:
    name: Restoring bundler cache into docker volumes
    command: |
      NAME=bundler-cache
      CACHE_PATH=~/bundler-cache
      set -x
      mkdir -p $CACHE_PATH
      docker-compose -f docker-compose.yml -f docker/circle-dockup.yml up --no-start $NAME
      docker cp $CACHE_PATH/. $NAME:/backup
      docker-compose -f docker-compose.yml -f docker/circle-dockup.yml up --no-recreate $NAME
      docker rm -f $NAME

# Back up the same volume to circle cache
- run:
    name: Backing up bundler cache from docker volumes
    command: |
      NAME=bundler-cache
      CACHE_PATH=~/bundler-cache
      set -x
      docker-compose -f docker-compose.yml -f docker/circle-dockup.yml run --name $NAME $NAME backup
      docker cp $NAME:/backup/. $CACHE_PATH
      docker rm -f $NAME  
- save_cache:
    key: v4-bundler-cache-{{ arch }}-{{ .Branch }}-{{ checksum "Gemfile.lock" }}
    paths:
      - ~/bundler-cache
```
{% endraw %}

Thanks to ryansch for contributing this example.

## See Also

[Docker Layer Caching]({{ site.baseurl }}/2.0/docker-layer-caching/)

[job-space]({{ site.baseurl }}/2.0/glossary/#job-space)

[primary-container]({{ site.baseurl }}/2.0/glossary/#primary-container)

[docker-layer-caching]({{ site.baseurl }}/2.0/glossary/#docker-layer-caching)
