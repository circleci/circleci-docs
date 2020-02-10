---
layout: classic-docs
title: "Installing and Using docker-compose"
short-title: "Installing and Using docker-compose"
description: "How to enable docker-compose in your primary container"
categories: [containerization]
order: 40
---

This document describes how to install and use `docker-compose`.

* TOC 
{:toc}

The `docker-compose` utility is [pre-installed in the CircleCI convenience images][pre-installed] and machine executors. If you're using another image, you can install it into your [primary container][primary-container] during the job execution with the Remote Docker Environment activated by adding the following to your [`config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) file:

``` 
      - run:
          name: Install Docker Compose
          command: |
            set -x
            curl -L https://github.com/docker/compose/releases/download/1.25.3/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
            chmod +x /usr/local/bin/docker-compose
```

[pre-installed]: {{ site.baseurl }}/2.0/circleci-images/#pre-installed-tools
[primary-container]: {{ site.baseurl }}/2.0/glossary/#primary-container

Then, to activate the Remote Docker Environment, add the `setup_remote_docker` step:

```
- setup_remote_docker
```

This step enables you to add `docker-compose` commands to build images:

``` 
docker-compose build
```

Or to run the whole system:

``` 
docker-compose up -d
```

In the following example, the whole system starts, then verifies it is running and responding to requests:

``` YAML
      - run:
          name: Start container and verify it is working
          command: |
            set -x
            docker-compose up -d
            docker run --network container:contacts \
              appropriate/curl --retry 10 --retry-delay 1 --retry-connrefused http://localhost:8080/contacts/test
```

## Example Project

See the [Example docker-compose Project](https://github.com/circleci/cci-demo-docker/tree/docker-compose) on GitHub for a demonstration and use the [full configuration file](https://github.com/circleci/cci-demo-docker/blob/docker-compose/.circleci/config.yml) as a template for your own projects. 

**Note**: The primary container runs in a separate environment from Remote Docker and the two cannot communicate directly. To interact with a running service, use docker and a container running in the service's network. 

## Using Docker Compose with Machine Executor

If you want to use docker compose to manage a multi-container setup with a docker-compose file, use the `machine` key in your `config.yml` file and use docker-compose as you would normally (see machine executor documentation [here](https://circleci.com/docs/2.0/executor-types/#using-machine) for more details). That is, if you have a docker-compose file that shares local directories with a container, this will work as expected. Refer to Docker's documentation of [Your first docker-compose.yml file](https://docs.docker.com/get-started/part3/#your-first-docker-composeyml-file) for details. **Note: There is an overhead for provisioning a machine executor as a result of spinning up a private Docker server. Use of the `machine` key may require additional fees in a future pricing update.**


## Using Docker Compose with Docker Executor

Using `docker` combined with `setup_remote_docker` provides a remote engine similar to the one created with docker-machine, but volume mounting and port forwarding do **not** work the same way in this setup. The remote docker daemon runs on a different system than the docker CLI and docker compose, so you must move data around to make this work. Mounting can usually be solved by making content available in a docker volume. It is possible to load data into a docker volume by using `docker cp` to get the data from the CLI host into a container running on the docker remote host. 

This combination is required if you want to build docker images for deployment. 

## See Also
{:.no_toc}

See the Mounting Folders section of the [Running Docker Commands]({{ site.baseurl }}/2.0/building-docker-images/#mounting-folders) for examples and details.
