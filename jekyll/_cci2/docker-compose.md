---
layout: classic-docs
title: "Installing and Using docker-compose"
short-title: "Installing and Using docker-compose"
description: "How to enable docker-compose in your primary container"
categories: [deploying]
order: 40
---

To use `docker-compose`, you must install it in your [primary container][primary-container] using one of the following methods:

- Pre-install it in your custom image by using the instructions in [Building Custom Docker Images]({{ site.baseurl }}/2.0/building-docker-images/).
- Install it during the job execution with the Remote Docker Environment activated by adding the following to your `config.yml` file:

``` 
- run:
    name: Install Docker Compose
    command: |
      set -x
      curl -L https://github.com/docker/compose/releases/download/1.11.2/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
      chmod +x /usr/local/bin/docker-compose
```

Then, to activate the Remote Docker Environment, you must add the `setup_remote_docker` step:

```
- setup_remote_docker
```

This enables you to add `docker-compose` commands to build images:

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

**Note**: To interact with a running service, use docker and a container running in the service's network. This is because your primary container and Remote Docker live in separate environments and can't communicate directly.

See the [Example docker-compose Project](https://github.com/circleci/cci-demo-docker/tree/docker-compose) on GitHub for a demonstration and use the [full configuration file](https://github.com/circleci/cci-demo-docker/blob/docker-compose/.circleci/config.yml) as a template for your own projects. 

[primary-container]: {{ site.baseurl }}/2.0/glossary/#primary-container
