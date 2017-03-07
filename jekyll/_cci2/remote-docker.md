---
layout: classic-docs2
title: "Docker and CircleCI 2.0"
short-title: "Docker and CircleCI 2.0"
categories: [configuring-jobs]
order: 8
---

## Overview

For security reasons [Docker Executor](executor-types.md#docker) does not allow building Docker images within a [job space](glossary.md#job-space). To enable customers to build, run and publish new images we've introduced a special feature which for each build creates a remote and fully isolated environment configured to execute Docker commands.

## Configuration

If your build requires executing any `docker` or `docker-compose` commands you need to add a special step into your `.circleci/config.yml`:

``` YAML
jobs:
  build:
    steps:
      # ... steps for building and testing your application...

      - setup_docker_engine
```

During execution of this step special remote environment will be created and your current [main container](glossary.md#main-container) will be configured to work with it. After that you may use any docker-related commands and it'll be safely executed in this new environment.

## Example

Here's the example of config for building and pushing Docker image for our [demo docker project](https://github.com/circleci/cci-demo-docker) :

``` YAML
version: 2
jobs:
  build:
    docker:
      - image: golang:1.6.4
    working_directory: /go/src/github.com/circleci/cci-demo-docker
    steps:
      - checkout

      # ... Test and build app steps ...

      - setup_docker_engine

      # Your build image should already have Docker (recommended) or you can install it during a build
      - run: |
          set -ex
          curl -L -o /tmp/docker-1.12.3.tgz https://get.docker.com/builds/Linux/x86_64/docker-1.12.3.tgz
          tar -xz -C /tmp -f /tmp/docker-1.12.3.tgz
          mv /tmp/docker/* /usr/bin

      # Building and pushing Docker image
      - run: |
          TAG=0.1.$CIRCLE_BUILD_NUM
          docker build -t cci-demo-docker:$TAG .
          docker login -e $DOCKER_EMAIL -u $DOCKER_USER -p $DOCKER_PASS
          docker push circleci/cci-demo-docker:$TAG
```

To give a little perspective what is happening during execution of this build:
 * all commands are executed in your [main container](glossary.md#main-container)
 * once `setup_docker_engine` is called new remote environment is created and your main container is configured to use it
 * all docker-related commands are executed in your main container too, but building/pushing images and running containers is happening in remote docker engine
 * we are using [project environment variables](TBD) to store credentials for Docker Hub

## Separation of environments

Since [job space](glossary.md#job-space) and [remote docker](glossary.md#remote-docker) are two separated environments there's one caveat. Containers, running in your job space, cannot directly communicate with containers, running in remote docker. A few practical examples and ways work around:

 * It's not possible to start service in remote docker and ping it directly from a main container and vice versa. To solve it you need to interact with a service from remote docker as well through the same container:
 
   ``` YAML
   # Starting our service and validating it's running
   - run: |
       docker run -d --name my-app my-app
       docker exec my-app curl --retry 10 http://localhost:8080
   ```
  
   Another way of doing this is to use another container running in the same network with the target one:
   
   ``` YAML
   - run: |
       docker run -d --name my-app my-app
       docker run --network container:my-app appropriate/curl --retry 10 http://localhost:8080
   ```

 * It's not possible to mount folder from build container into container in isolated docker and vise versa.
 
   TBD

## Using private images and Docker registries

Using private images is not possible for Docker Executor per se. However it's possible to use Remote Docker Environment. For example your application requires proprietary DB for testing:

``` YAML
version: 2
jobs:
  build:
    docker:
      - image: docker:1.13.1-git
    working_directory: ~/my_app
    steps:
      - checkout
      - setup_docker_engine

      # Starting proprietary DB using private Docker image
      - run: |
          docker login -e $DOCKER_EMAIL -u $DOCKER_USER -p $DOCKER_PASS
          docker run -d --name db company/proprietery-db:1.2.3

      # Building and testing our application
      - run: |
          docker build -t my-app .
          # assuming that our app expects to have DB on localhost
          docker run --network container:db my-app test
```

## Using `docker-compose`

TBD

## Docker Layers Caching

TBD
