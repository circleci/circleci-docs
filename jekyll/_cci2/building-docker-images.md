---
layout: classic-docs
title: "Building Docker Images on CircleCI 2.0"
short-title: "Building Docker Images"
categories: [configuring-jobs]
order: 1
---

## Overview
For security reasons, the [Docker Executor]({{ site.baseurl }}/2.0/executor-types/#docker-executor) doesn’t allow building Docker images within a [job space][job-space].

To help users build, run, and publish new images, we’ve introduced a special feature which creates a separate environment for each build. This environment is remote, fully-isolated and has been configured to execute Docker commands

## Configuration
If your build requires `docker` or `docker-compose` commands, you’ll need to add a special step into your `.circleci/config.yml`:

```YAML
jobs:
  build:
    steps:
      # ... steps for building/testing app ...

      - setup_docker_engine
```

When `setup_docker_engine` executes, a remote environment will be created, and your current [primary container][primary-container] will be configured to use it. Then, any docker-related commands you use will be safely executed in this new environment.

### Example
Here's an example where we build and push a Docker image for our [demo docker project](https://github.com/circleci/cci-demo-docker):

```YAML
version: 2
jobs:
  build:
    docker:
      - image: golang:1.6.4   # (1)
    working_directory: /go/src/github.com/circleci/cci-demo-docker
    steps:
      - checkout
      # ... steps for building/testing app ...

      - setup_docker_engine   # (2)

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
          docker build -t circleci/cci-demo-docker:$TAG .      # (3)
          docker login -u $DOCKER_USER -p $DOCKER_PASS         # (4)
          docker push circleci/cci-demo-docker:$TAG
```

Let’s break down what’s happening during this build’s execution:

1. All commands are executed in the [primary container][primary-container].
2. Once `setup_docker_engine` is called, a new remote environment is created, and your primary container is configured to use it.
3. All docker-related commands are also executed in your primary container, but building/pushing images and running containers happens in the remote Docker Engine.
4. We use project environment variables to store credentials for Docker Hub.

## Separation of Environments
Since the [job space][job-space] and [remote docker]({{ site.baseurl }}/2.0/glossary/#remote-docker) are separated environments, there's one caveat: containers running in your job space can’t directly communicate with containers running in remote docker.

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
It's not possible to mount a folder from the build container into an isolated Docker container (and vice versa).

## Private Images and Docker Registries
Using private images isn’t directly supported by the [Docker Executor]({{ site.baseurl }}/2.0/executor-types/#docker-executor). However, you _can_ use the Remote Docker Environment.

If your application requires a proprietary DB for testing, for example:

```YAML
version: 2
jobs:
  build:
    docker:
      - image: docker:1.13.1-git
    working_directory: ~/my_app
    steps:
      - checkout
      - setup_docker_engine

      # start proprietary DB using private Docker image
      - run: |
          docker login -u $DOCKER_USER -p $DOCKER_PASS
          docker run -d --name db company/proprietery-db:1.2.3

      # build and test application
      - run: |
          docker build -t my-app .
          # assuming that our app expects to have DB on localhost
          docker run --network container:db my-app test
```

[job-space]: {{ site.baseurl }}/2.0/glossary/#job-space
[primary-container]: {{ site.baseurl }}/2.0/glossary/#primary-container
