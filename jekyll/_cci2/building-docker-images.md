---
layout: classic-docs
title: "Run Docker commands"
description: "How to build Docker images using the Docker execution environment"
contentTags:
  platform:
  - Cloud
  - Server v4.x
  - Server v3.x
---

This page explains how to build Docker images for deployment and further testing when using the Docker execution environment. This is achieved using the remote Docker environment (`setup_remote_docker`). When you use the remote Docker environment for a job, any Docker commands you run in your job will be executed locally on the virtual machine used to spin up your primary Docker container. The term _remote_ used here is left over from when remote Docker usage would spin up a separate, remote environment for running Docker commands.

## Introduction
{: #introduction }

To build Docker images for deployment using the Docker execution environment, you must use the `setup_remote_docker` key. If your job requires `docker` or `docker-compose` commands, add the `setup_remote_docker` step into your `.circleci/config.yml`:

{% include snippets/docker-auth.md %}

```yaml
jobs:
  build:
    docker:
      - image: cimg/base:2022.06
    steps:
      # ... steps for building/testing app ...
      - setup_remote_docker:
          version: 20.10.14
```

When `setup_remote_docker` executes, any Docker-related commands you use will be executed locally on the virtual machine used to spin up containers for your job.

In the CircleCI web app, you can see which jobs are using the remote Docker environment, they are labelled "Remote Docker".

![Remote Docker label]({{ site.baseurl }}/assets/img/docs/remote-docker-label.png)

The use of the `setup_remote_docker` key is reserved for configs in which your primary executor _is_ a Docker container. If your executor is `machine` (and you want to use docker commands in your config) you do **not** need to use the `setup_remote_docker` key. For an example, see [Run Docker commands using the `machine` executor](#run-docker-commands-using-the-machine-executor).
{: class="alert alert-info"}

## Specifications
{: #specifications }

For technical specifications and pricing information for the remote Docker environment, see [Discuss](https://discuss.circleci.com/t/changes-to-remote-docker-reporting-pricing/47759). For CircleCI server installations, contact the systems administrator for specifications.

## Run Docker commands using the Docker executor
{: #run-docker-commands-using-the-docker-executor }

The example below shows how you can build and deploy a Docker image for our [demo docker project](https://github.com/CircleCI-Public/circleci-demo-docker) using the Docker executor, with remote Docker:

```yml
version: 2.1

jobs:
  build:
    docker:
      - image: cimg/go:1.17
    resource_class: xlarge
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

* All commands are executed in the [primary-container](/docs/glossary/#primary-container). (line 5)
* Once `setup_remote_docker` is called, all Docker-related commands are executed locally. (line 12)
* [Docker Layer Caching](/docs/glossary/#docker-layer-caching) (DLC) is enabled to speed up image building. (line 14)
* We use [project environment variables](/docs/set-environment-variable/#set-an-environment-variable-in-a-project) to store credentials for Docker Hub. (line 19)

### Resource classes
{: #resource-classes}

**Arm on Docker** For pricing information, and a list of CircleCI Docker convenience images that support Arm resource classes, see the [Resource classes page](https://circleci.com/product/features/resource-classes/).
{: class="alert alert-caution"}

The resource class for the remote Docker environment is determined by the configuration of the primary container.

For **x86** architecture the equivalent Linux VM resource class is used for remote Docker, relative to how the primary container is configured, apart from if you are using `small` or `medium+`, in which case `medium` and `large` are used, respectively. For a full list of available Linux VM resource classes see the [Configuration Reference](/docs/configuration-reference/#linuxvm-execution-environment).

For **Arm**, the equivalent Arm VM resource class will be used. For a full list of available Arm VM resource classes see the [Configuration Reference](/docs/configuration-reference/#arm-execution-environment).

For credit/pricing information, see the [Resource class product page](https://circleci.com/product/features/resource-classes/).

## Install the Docker CLI
{: #install-the-docker-cli}

The [CircleCI convenience images]({{site.baseurl}}/circleci-images/) for the Docker executor come with the Docker CLI pre-installed. If you are using a third-party image for your primary container that doesn't already have the Docker CLI installed, then [you will need to install it](https://docs.docker.com/install/#supported-platforms) as part of your job before calling any `docker` commands.

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

CircleCI supports multiple versions of Docker.

For **x86** architecture, the following versions are available:

- `20.10.24`
- `20.10.23` (default)
- `20.10.18`
- `20.10.17`
- `20.10.14`
- `20.10.12`
- `20.10.11`
- `20.10.7`
- `20.10.6`
- `20.10.2`
- `19.03.13`

For **Arm**, the following versions are supported:

- `default`
- `edge`

<!---
Consult the [Stable releases](https://download.docker.com/linux/static/stable/x86_64/) or [Edge releases](https://download.docker.com/linux/static/edge/x86_64/) for the full list of supported versions.
--->

The `version` key is not currently supported on CircleCI server installations. Contact your system administrator for information about the Docker version installed in your remote Docker environment.
{: class="alert alert-info"}

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

## See also
{: #see-also }

* [Docker Layer Caching](/docs/docker-layer-caching/)
* [job-space](/docs/glossary/#job-space)
* [primary-container](/docs/glossary/#primary-container)
* [docker-layer-caching](/docs/glossary/#docker-layer-caching)
