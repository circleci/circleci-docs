---
layout: classic-docs
title: "Running Docker Commands"
short-title: "Running Docker Commands"
description: "How to build Docker images and access remote services"
categories: [configuring-jobs]
order: 55
---

*[Docker, Machine, and iOS Builds]({{ site.baseurl }}/2.0/build/) > Running Docker Commands*

This document explains how to build Docker images for deploying elsewhere or for further testing and how to start services in remote docker containers in the following sections:

* TOC
{:toc}

## Overview

To build Docker images for deployment, you must use a special `setup_remote_docker` key which creates a separate environment for each build for security. This environment is remote, fully-isolated and has been configured to execute Docker commands. If your build requires `docker` or `docker-compose` commands, add the `setup_remote_docker` step into your `.circleci/config.yml`:

```YAML
jobs:
  build:
    steps:
      # ... steps for building/testing app ...

      - setup_remote_docker
```

When `setup_remote_docker` executes, a remote environment will be created, and your current [primary container][primary-container] will be configured to use it. Then, any docker-related commands you use will be safely executed in this new environment.

*Note: `setup_remote_docker` is not curently compatible with the `machine` executor.*

### Example

Following is an example of building a Docker image using `machine` with the default image:

```YAML
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

```YAML
version: 2
jobs:
  build:
    docker:
      - image: golang:1.6.4   # (1)
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
          docker build -t   CircleCI-Public/circleci-demo-docker:$TAG .      # (4)
          docker login -u $DOCKER_USER -p $DOCKER_PASS         # (5)
          docker push CircleCI-Public/circleci-demo-docker:$TAG
```

Let’s break down what’s happening during this build’s execution:

1. All commands are executed in the [primary container][primary-container].
2. Once `setup_remote_docker` is called, a new remote environment is created, and your primary container is configured to use it.
3. **Note**: The `docker_layer_caching` option is not yet supported in an installable CircleCI release, but this functionality is available by using the `reusable: true` option. For details, refer to the [Docker Layer Caching]({{ site.baseurl }}/2.0/docker-layer-caching/) document for details.
4. All docker-related commands are also executed in your primary container, but building/pushing images and running containers happens in the remote Docker Engine.
5. We use project environment variables to store credentials for Docker Hub.

## Docker version

If your build requires a specific docker image, you can set it as an `image` attribute:

```YAML
      - setup_remote_docker:
          version: 17.05.0-ce
```

The currently supported versions are:

* `17.03.0-ce` (default)
* `17.05.0-ce`
* `17.06.0-ce`
* `17.06.1-ce`
* `17.07.0-ce`
* `17.09.0-ce`
* `17.10.0-ce`
* `17.11.0-ce`

If you need a Docker image that installs Docker and has Git, use `17.05.0-ce-git`. **Note:** The `version` key is not currently supported on CircleCI installed in your private cloud or datacenter. Contact your system administrator for information about the Docker version installed in your remote Docker environment.

## Separation of Environments
The job and [remote docker]({{ site.baseurl }}/2.0/glossary/#remote-docker) run in  separate environments. Therefore, Docker containers cannot directly communicate with the containers running in remote docker.

### Accessing Services
It’s impossible to start a service in remote docker and ping it directly from a primary container (and vice versa). To solve that, you’ll need to interact with a service from remote docker, as well as through the same container:

```YAML
# start service and check that it’s running
- run: |
    docker run -d --name my-app my-app
    docker exec my-app curl --retry 10 --retry-connrefused http://localhost:8080
```

A different way to do this is to use another container running in the same network as the target container:

```YAML
- run: |
    docker run -d --name my-app my-app
    docker run --network container:my-app appropriate/curl --retry 10 --retry-connrefused http://localhost:8080
```

### Mounting Folders
It's not possible to mount a folder from your job space into a container in Remote Docker (and vice versa). But you can use `docker cp` command to transfer files between these two environments. For example, you want to start a container in Remote Docker and you want to use a config file from your source code for that:

``` YAML
- run: |
    # creating dummy container which will hold a volume with config
    docker create -v /cfg --name configs alpine:3.4 /bin/true
    # copying config file into this volume
    docker cp path/in/your/source/code/app_config.yml configs:/cfg
    # starting application container using this volume
    docker run --volumes-from configs app-image:1.2.3
```

In the same way, if your application produces some artifacts that need to be stored, you can copy them from Remote Docker:

``` YAML
- run: |
    # starting container with our application
    # make sure you're not using `--rm` option otherwise container will be killed after finish
    docker run --name app app-image:1.2.3

- run: |
    # once application container finishes we can copy artifacts directly from it
    docker cp app:/output /path/in/your/job/space
```

[job-space]: {{ site.baseurl }}/2.0/glossary/#job-space
[primary-container]: {{ site.baseurl }}/2.0/glossary/#primary-container
