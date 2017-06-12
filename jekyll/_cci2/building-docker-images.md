---
layout: classic-docs
title: "Building Custom Docker Images"
short-title: "Building Custom Docker Images"
description: "How to build Docker images and access remote services"
categories: [deploying]
order: 30
---

This document explains how to build Docker images for deploying elsewhere or for further testing. To do so, you must use a special key which creates a separate environment for each build for security. This environment is remote, fully-isolated and has been configured to execute Docker commands.

## Configuration
If your build requires `docker` or `docker-compose` commands, add the `setup_remote_docker` step into your `.circleci/config.yml`:

```YAML
jobs:
  build:
    steps:
      # ... steps for building/testing app ...

      - setup_remote_docker
```

When `setup_remote_docker` executes, a remote environment will be created, and your current [primary container][primary-container] will be configured to use it. Then, any docker-related commands you use will be safely executed in this new environment.

### Example
Here's an example where we build and push a Docker image for our [demo docker project](https://github.com/CircleCI-Public/circleci-demo-docker):

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

      - setup_remote_docker   # (2)

      # use a primary image that already has Docker (recommended)
      # or install it during a build like we do here
      - run:
          name: Install Docker client
          command: |
            set -x
            VER="17.03.0-ce"
            curl -L -o /tmp/docker-$VER.tgz https://get.docker.com/builds/Linux/x86_64/docker-$VER.tgz
            tar -xz -C /tmp -f /tmp/docker-$VER.tgz
            mv /tmp/docker/* /usr/bin

      # build and push Docker image
      - run: |
          TAG=0.1.$CIRCLE_BUILD_NUM
          docker build -t   CircleCI-Public/circleci-demo-docker:$TAG .      # (3)
          docker login -u $DOCKER_USER -p $DOCKER_PASS         # (4)
          docker push CircleCI-Public/circleci-demo-docker:$TAG
```

Let’s break down what’s happening during this build’s execution:

1. All commands are executed in the [primary container][primary-container].
2. Once `setup_remote_docker` is called, a new remote environment is created, and your primary container is configured to use it.
3. All docker-related commands are also executed in your primary container, but building/pushing images and running containers happens in the remote Docker Engine.
4. We use project environment variables to store credentials for Docker Hub.

## Separation of Environments
The job and [remote docker]({{ site.baseurl }}/2.0/glossary/#remote-docker) run in  separate environments. Therefore, Docker or Machine containers cannot directly communicate with the containers running in remote docker.

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
