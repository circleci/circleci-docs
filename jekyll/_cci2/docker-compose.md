---
layout: classic-docs
title: "Installing and Using Docker Compose"
description: "How to enable Docker Compose in your primary container"
contentTags:
  platform:
  - Cloud
  - Server v4+
---

This page describes how to use Docker Compose in your CircleCI pipelines.

If you are new to Docker Compose, you can review the [official Docker Compose overview](https://docs.docker.com/compose/), or checking out the [Getting Started guide](https://docs.docker.com/compose/gettingstarted/).

## Using Docker Compose with machine executor
{: #using-docker-compose-with-machine-executor }

If you want to use Docker Compose to manage a multi-container setup with a Docker Compose file, use the `machine` key in your `.circleci/config.yml` file and use `docker compose` as you would normally (see Linux VM execution environment documentation [here]({{site.baseurl}}/using-linuxvm) for more details). That is, if you have a Docker Compose file that shares local directories with a container, this will work as expected.


## Using Docker Compose with docker executor
{: #using-docker-compose-with-docker-executor }

Using the `docker` execution environment combined with `setup_remote_docker` enables you to run Docker commands similar to how you run Docker commands in a machine execution environment, however, volume mounting and port forwarding do **not** work the same way when using the `docker` execution environment. The docker daemon runs in a different location than the docker CLI and Docker Compose, so you must move data around to make this work. Mounting can typically be solved by making content available in a docker volume. It is possible to load data into a Docker volume by using `docker cp` to get the data from the CLI host into a location running on the docker host.

## Install Docker Compose

The Docker Compose utility is [pre-installed in the CircleCI convenience
images]({{ site.baseurl }}/circleci-images/#pre-installed-tools) and machine executor images.

If you are using the Docker executor and **are not** using a convenience image, you can install Docker Compose into your [primary container]({{ site.baseurl }}/glossary/#primary-container) during the job execution and use the xref:building-docker-images#[Remote Docker Environment], as follows:

```yml
      - run:
          name: Install Docker Compose
          command: |
            # Add Docker's official GPG key:
            apt-get update
            DEBIAN_FRONTEND=noninteractive apt-get install -y ca-certificates curl
            install -m 0755 -d /etc/apt/keyrings
            curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
            chmod a+r /etc/apt/keyrings/docker.asc

            # Add the repository to Apt sources:
            echo \
              "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
              $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
              sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
            apt-get update
            DEBIAN_FRONTEND=noninteractive apt-get install docker-ce-cli docker-buildx-plugin docker-compose-plugin

      - setup_remote_docker #activate the remote docker environment
```

If you are constructing your own Docker images, consider reading the
[custom docker images page]({{site.baseurl}}/custom-images/).

Once you have Docker Compose installed, you can use it to build images and run containers:

```yml
      - run:
          name: Build images of services declared in docker-compose.yml
          command: docker compose build
```

Or to run the whole system:

```yml
      - run:
          name: Start all services declared in docker-compose.yml
          command: docker compose up -d
```

Or to also verify if a service is running for example:

```yml
      - run:
          name: Start Docker Compose and verify service(s)
          command: |
            # Setting the Docker Compose project name to "circleci-demo-docker" means
            # the names of our services' containers would be prefixed with "circleci-demo-docker".
            docker compose --project circleci-demo-docker up -d

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

## Limitations
{: #limitations }

Using `docker compose` with the `macos` executor is not supported.
See [our support article for more information](https://support.circleci.com/hc/en-us/articles/360045029591-Can-I-use-Docker-within-the-macOS-executor-).

## See also
{: #see-also }

[Running Docker Commands]({{site.baseurl}}/building-docker-images/)
