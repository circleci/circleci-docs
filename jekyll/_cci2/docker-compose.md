---
layout: classic-docs
title: "Installing and Using docker-compose"
short-title: "Installing and Using docker-compose"
description: "How to enable docker-compose in your primary container"
categories: [containerization]
order: 40
---

To use `docker-compose` with the `docker` key, install it in your [primary container][primary-container] during the job execution with the Remote Docker Environment activated by adding the following to your `config.yml` file:

``` 
- run:
    name: Install Docker Compose
    command: |
      set -x
      curl -L https://github.com/docker/compose/releases/download/1.11.2/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
      chmod +x /usr/local/bin/docker-compose
```

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
          name: Start container and verify it's working
          command: |
            set -x
            docker-compose up -d
            docker run --network container:contacts \
              appropriate/curl --retry 10 --retry-delay 1 --retry-connrefused http://localhost:8080/contacts/test
```
See the [Example docker-compose Project](https://github.com/circleci/cci-demo-docker/tree/docker-compose) on GitHub for a demonstration and use the [full configuration file](https://github.com/circleci/cci-demo-docker/blob/docker-compose/.circleci/config.yml) as a template for your own projects. 

**Note**: The primary container runs in a seperate environment from Remote Docker and the two cannot communicate directly. To interact with a running service, use docker and a container running in the service's network. 

If you want to use docker compose to manage a multi-container setup, use the `machine` key in your `config.yml` file and use docker-compose as you would normally. **Note: There is an overhead for provisioning a machine executor and use of the `machine` key may require additional fees in a future pricing update.**

The overhead delay with `machine` is a result of spinning up a private Docker server. In contrast, the `docker` key runs the executor on a shared Docker server that is already provisioned. To secure your builds, some Docker behavior on this executor is not allowed and restricts your ability to use docker-compose.

For example, use of volumes is restricted. If you have a docker-compose file that shares local directories with a container, it is possible to do this with the `machine` key, but not with `docker`.  Even though using `docker` combined with `setup_remote_docker` provides a remote engine similar to the one created with docker-machine, volume mounting and port forwarding do not work as expected in this setup. 

This combination is really only intended for users who want to build docker images for deployment and cannot be used for performing volume mounting. See the [Building Docker Images]({{ site.baseurl }}/2.0/building-docker-images) for details.


[primary-container]: {{ site.baseurl }}/2.0/glossary/#primary-container
