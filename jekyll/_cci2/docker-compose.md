---
layout: classic-docs
title: "Installing and Using Docker Compose"
description: "How to enable Docker Compose in your primary container"
version:
- Cloud
- Server v3.x
- Server v2.x
---

This document describes how to install and use Docker Compose, and assumes the reader has some experience using the `docker-compose` utility.

If you are new to Docker Compose, do consider reviewing the [official Docker Compose overview](https://docs.docker.com/compose/), or checking out the [Getting Started guide](https://docs.docker.com/compose/gettingstarted/).

* TOC
{:toc}

The `docker-compose` utility is [pre-installed in the CircleCI convenience
images]({{ site.baseurl }}/2.0/circleci-images/#pre-installed-tools) and machine executor images. 

If you are using the Docker executor and **are not** using a convenience image, you can install Docker Compose into your [primary container]({{ site.baseurl }}/2.0/glossary/#primary-container) during the job execution with the Remote Docker Environment activated by adding the following to your [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) file:

```yml
      - run:
          name: Install Docker Compose
          environment:
            COMPOSE_VERSION: '1.29.2'
          command: |
            curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o ~/docker-compose
            chmod +x ~/docker-compose
            sudo mv ~/docker-compose /usr/local/bin/docker-compose
```

The above code example assumes that you will also have `curl` available in your
executor. If you are constructing your own docker images, consider reading the
[custom docker images document]({{site.baseurl}}/2.0/custom-images/).

Then, to activate the Remote Docker Environment, add the `setup_remote_docker` step:

```yml
      - setup_remote_docker
```

This step enables you to run `docker-compose` commands to build images:

```yml
      - run:
          name: Build images of services declared in docker-compose.yml
          command: docker-compose build
```

Or to run the whole system:

```yml
      - run:
          name: Start all services declared in docker-compose.yml
          command: docker-compose up -d
```

Or to also verify if a service is running for example:

```yml
      - run:
          name: Start docker-compose and verify service(s)
          command: |
            # Setting the Docker Compose project name to "circleci-demo-docker" means
            # the names of our services' containers would be prefixed with "circleci-demo-docker".
            docker-compose --project circleci-demo-docker up -d

            # In this example, we have a "contacts" service, and
            # we are trying to check, via `dockerize`, if the service is ready.
            docker container run --network container:circleci-demo-docker_contacts_1 \
              docker.io/jwilder/dockerize \
              -wait http://localhost:8080/healthcheck \
              -wait-retry-interval 2s \
              -timeout 20s
```

## Example project
{: #example-project }

See the [Example docker-compose Project](https://github.com/circleci/cci-demo-docker/tree/docker-compose) on GitHub for a demonstration and use the [full configuration file](https://github.com/circleci/cci-demo-docker/blob/docker-compose/.circleci/config.yml) as a template for your own projects.

**Note**: The primary container runs in a separate environment from Remote Docker and the two cannot communicate directly. To interact with a running service, run a container in the service's network.

## Using Docker Compose with machine executor
{: #using-docker-compose-with-machine-executor }

If you want to use Docker Compose to manage a multi-container setup with a Docker Compose file, use the `machine` key in your `config.yml` file and use `docker-compose` as you would normally (see Linux VM execution environment documentation [here]({{site.baseurl}}/2.0/using-linuxvm) for more details). That is, if you have a Docker Compose file that shares local directories with a container, this will work as expected. Refer to Docker's documentation of [Your first docker-compose.yml file](https://docs.docker.com/get-started/part3/#your-first-docker-composeyml-file) for details.


## Using Docker Compose with docker executor
{: #using-docker-compose-with-docker-executor }

Using `docker` combined with `setup_remote_docker` provides a remote engine similar to the one created with docker-machine, but volume mounting and port forwarding do **not** work the same way in this setup. The remote docker daemon runs on a different system than the docker CLI and docker compose, so you must move data around to make this work. Mounting can usually be solved by making content available in a docker volume. It is possible to load data into a docker volume by using `docker cp` to get the data from the CLI host into a container running on the docker remote host.

This combination is required if you want to build docker images for deployment.

## Limitations
{: #limitations }

Using `docker-compose` with the `macos` executor is not supported.
See [our support article for more information](https://support.circleci.com/hc/en-us/articles/360045029591-Can-I-use-Docker-within-the-macOS-executor-).

## See also
{: #see-also }
{:.no_toc}

See the [Mounting Folders section of the Running Docker Commands]({{ site.baseurl }}/2.0/building-docker-images/#mounting-folders) for examples and details.
