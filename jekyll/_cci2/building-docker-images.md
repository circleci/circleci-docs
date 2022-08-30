---
layout: classic-docs
title: "Running Docker Commands"
short-title: "Running Docker Commands"
description: "How to build Docker images and access remote services"
order: 55
version:
- Cloud
- Server v4.x
- Server v3.x
- Server v2.x
---

This page explains how to build Docker images for deployment and further testing. The examples on this page that use the Docker execution environment show how to start services in a remote docker environment.

* TOC
{:toc}

## Overview
{: #overview }

To build Docker images for deployment using the Docker execution environment, you must use a special `setup_remote_docker` key which creates a separate environment for each build for security. This environment is remote, fully-isolated and has been configured to execute Docker commands. If your job requires `docker` or `docker-compose` commands, add the `setup_remote_docker` step into your `.circleci/config.yml`:

```yaml
jobs:
  build:
    docker:
      - image: cimg/base:2022.06
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      # ... steps for building/testing app ...
      - setup_remote_docker:
          version: 20.10.14
```

When `setup_remote_docker` executes, a remote environment will be created, and your current [primary container]({{ site.baseurl }}/glossary/#primary-container) will be configured to use it. Then, any docker-related commands you use will be safely executed in this new environment.

**Note:** The use of the `setup_remote_docker` key is reserved for configs in which your primary executor _is_ a docker container. If your executor is `machine` (and you want to use docker commands in your config) you do **not** need to use the `setup_remote_docker` key.

## Specifications
{: #specifications }

The Remote Docker Environment has the following technical specifications (for CircleCI server installations, contact the systems administrator for specifications):

CPUs | Processor                 | RAM | HD
-----|---------------------------|-----|------
2    | Intel(R) Xeon(R) @ 2.3GHz | 8GB | 100GB
{: class="table table-striped"}

## Run Docker commands using the machine executor
{: #run-docker-commands-using-the-machine-executor }

The example below shows how you can build a Docker image using the `machine` executor with the default image - this does not require the use of remote Docker:

```yaml
version: 2.1

jobs:
 build:
   machine:
    image: ubuntu-2204:2022.04.2
   steps:
     - checkout
     # start proprietary DB using private Docker image
     # with credentials stored in the UI
     - run: |
         echo "$DOCKER_PASS" | docker login --username $DOCKER_USER --password-stdin
         docker run -d --name db company/proprietary-db:1.2.3

     # build the application image
     - run: docker build -t company/app:$CIRCLE_BRANCH .

     # deploy the image
     - run: docker push company/app:$CIRCLE_BRANCH
```

## Run Docker commands using the Docker executor
{: #run-docker-commands-using-the-docker-executor }

The example below shows how you can build and deploy a Docker image for our [demo docker project](https://github.com/CircleCI-Public/circleci-demo-docker) using the Docker executor, with remote Docker:

```yml
version: 2.1
jobs:
  build:
    docker:
      - image: cimg/go:1.17
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      # ... steps for building/testing app ...

      - setup_remote_docker:
          version: 20.10.14
          docker_layer_caching: true

      # build and push Docker image
      - run: |
          TAG=0.1.$CIRCLE_BUILD_NUM
          docker build -t CircleCI-Public/circleci-demo-docker:$TAG .
          echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
          docker push CircleCI-Public/circleci-demo-docker:$TAG
```

Below is a break down of what is happening during this build’s execution:

1. All commands are executed in the [primary-container]({{ site.baseurl }}/glossary/#primary-container). (line 5)
2. Once `setup_remote_docker` is called, a new remote environment is created, and your primary container is configured to use it. All docker-related commands are also executed in your primary container, but building/pushing images and running containers happens in the remote Docker Engine. (line 10)
3. We enable [Docker Layer Caching]({{ site.baseurl }}/glossary/#docker-layer-caching) (DLC) here to speed up image building.
4. We use project environment variables to store credentials for Docker Hub. (line 17)

**Note:** The [CircleCI convenience images]({{site.baseurl}}/circleci-images/) for the Docker executor come with the Docker CLI pre-installed. If you are using a third-party image for your primary container that doesn't already have the Docker CLI installed, then [you will need to install it](https://docs.docker.com/install/#supported-platforms) as part of your job before calling any `docker` commands.

```yml
      # Install via apk on alpine based images
      - run:
          name: Install Docker client
          command: apk add docker-cli
```

## Specify a Docker version for remote docker
{: #docker-version }

To specify the Docker version, you can set it as a `version` attribute:

```yml
      - setup_remote_docker:
          version: 20.10.11
```

CircleCI supports multiple versions of Docker. The following are the available versions:

- `20.10.14`
- `20.10.12`
- `20.10.11`
- `20.10.7`
- `20.10.6`
- `20.10.2`
- `19.03.13`
- `17.09.0-ce` (default)

<!---
Consult the [Stable releases](https://download.docker.com/linux/static/stable/x86_64/) or [Edge releases](https://download.docker.com/linux/static/edge/x86_64/) for the full list of supported versions.
--->

**Note:** The `version` key is not currently supported on CircleCI server installations. Contact your system administrator for information about the Docker version installed in your remote Docker environment.

## Separation of environments
{: #separation-of-environments }
The job and [remote docker]({{ site.baseurl }}/glossary/#remote-docker) run in separate environments. Therefore, Docker containers specified to run your jobs cannot directly communicate with containers running in remote docker.

### Accessing services
{: #accessing-services }

It is **not** possible to start a service in remote docker and ping it directly from a primary container or to start a primary container that can ping a service in remote docker. To solve that, you’ll need to interact with a service from remote docker, as well as through the same container:

```yml
# ...
      - run:
          name: "Start Service and Check That it’s Running"
          command: |
            docker run -d --name my-app my-app
            docker exec my-app curl --retry 10 --retry-connrefused http://localhost:8080
# ...
```

A different way to do this is to use another container running in the same network as the target container:

```yml
# ...
      - run: |
          docker run -d --name my-app my-app
          docker run --network container:my-app appropriate/curl --retry 10 --retry-connrefused http://localhost:8080
# ...
```

### Mounting folders
{: #mounting-folders }

It is **not** possible to mount a volume from your job space into a container in Remote Docker (and vice versa). You may use the `docker cp` command to transfer files between these two environments. For example, to start a container in Remote Docker using a config file from your source code:

```yml
- run: |
    # create a dummy container which will hold a volume with config
    docker create -v /cfg --name configs alpine:3.4 /bin/true
    # copy a config file into this volume
    docker cp path/in/your/source/code/app_config.yml configs:/cfg
    # start an application container using this volume
    docker run --volumes-from configs app-image:1.2.3
```

In the same way, if your application produces some artifacts that need to be stored, you can copy them from Remote Docker:

```yml
- run: |
    # start container with the application
    # make sure you're not using `--rm` option otherwise the container will be killed after finish
    docker run --name app app-image:1.2.3

- run: |
    # after application container finishes, copy artifacts directly from it
    docker cp app:/output /path/in/your/job/space
```

It is also possible to use https://github.com/outstand/docker-dockup or a similar image for backup and restore to spin up a container as shown in the following example `circle-dockup.yml` config:

```yml
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
```yml
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

### Accessing the remote docker environment
{: #accessing-the-remote-docker-environment }

When a remote Docker environment is spun up, an SSH alias is created for you so you can SSH into the remote Docker virtual machine. This may be helpful for debugging your builds, or modifying the Docker or VM filesystem configuration. To SSH into the remote Docker VM, run the following within your project configuration job steps, or during a SSH rerun:

```shell
ssh remote-docker
```

**Note:** The example shown above provides a way for you to utilize volume mounts since they don't work in the `docker` executor. An alternative to this approach is to use the `machine` executor where volume mounts do work.

Thanks to ryansch for contributing this example.

## See also
{: #see-also }

[Docker Layer Caching]({{ site.baseurl }}/docker-layer-caching/)

[job-space]({{ site.baseurl }}/glossary/#job-space)

[primary-container]({{ site.baseurl }}/glossary/#primary-container)

[docker-layer-caching]({{ site.baseurl }}/glossary/#docker-layer-caching)
