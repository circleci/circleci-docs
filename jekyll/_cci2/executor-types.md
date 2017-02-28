---
layout: classic-docs
title: "Choosing an Executor Type"
short-title: "Executor Types"
categories: [configuring-circleci]
---

There are 2 different executor types to choose from when using CircleCI: `docker` and `machine`. Both allow you to use the `docker` and `docker-compose` commands, but there are Reasons why you’d pick one executor over the other.

This guide will discuss these Reasons so you can choose the right executor for your project. Note that neither method will work if you’re running builds locally using `circleci-builder`.

## Option 1: `docker` (Run in a Container)

We strongly recommend using the `docker` executor. This option allows you to use Docker directly, which usually results in faster startup times and allows you to specify a custom image.

To use Docker’s features, you’ll need Docker Engine 1.12+ installed. You can do that by picking an image that already has Docker Engine or installing it yourself.

You’ll also need to add a special step called `setup-docker-engine` before you can run any Docker commands.

Below is a sample `config.yml` that uses the `docker` executor, installs Docker Engine, and runs `setup_docker_engine`:

```yaml
version: 2.0
jobs:
  build:
    working_directory: ~/my-project
    docker:
      - image: golang:1.7
    steps:
      - checkout
      - run:
          name: Install Docker Client
        command: |
            echo "test"
            curl -L -o /tmp/docker.tgz https://get.docker.com/builds/Linux/x86_64/docker-1.12.6.tgz
            tar -xz -C /tmp -f /tmp/docker.tgz
            mv /tmp/docker/docker* /usr/bin/

            curl -L "https://github.com/docker/compose/releases/download/1.10.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/bin/docker-compose
            chmod +x  /usr/bin/docker-compose

      - setup_docker_engine
      - run:
          name: Verify Docker Works
          command: |
            docker --version
            docker-compose --version
            docker run hello-world
```

For a working example of an app using Docker Engine, check out our [sample Rails project](https://github.com/circleci/cci-demo-rails).

### Limitations

Using the `docker` executor and the `setup_docker_engine` step requires a remote Docker Engine instance running on our infrastructure. This produces a few limitations:

- Any image specified within the `docker` executor must be from a public register.

- Files from your build space can’t be directly mounted to a volume.

- On our platform, Docker doesn’t support Linux user IDs greater than 65536.

- user IDs: Docker does not support Linux user IDs greater than 65536 and will display the following error for invalid images: "Error fetching image ... Error: No such image".

- Any ports exposed in your Dockerfile will not be accessible from the build.

#### Accessing Exposed Ports

If you do need to access ports exposed by your Dockerfile, then there are a couple ways to do that:

**Use `docker exec`**

```
$ docker exec railsapp curl -sSL http://localhost:3000 | grep "New Todo List"
```

**Use a custom Docker network**

```
$ docker network create test-net
$ docker run --network=test-net --name=my-app <container_under_test>
```

Any container started within `test-net` will be able to access any exposed ports of `my-app`.

If any of these limitations are blockers for you, then we recommend using the `machine` executor.

## Option 2: `machine` (Run in CircleCI Virtual Machine)

If you want to play with volumes, use `docker-compose`, run tests in their own containers or want to test schedulers, then we recommend using the `machine` executor.

This method spins up a virtual machine that will run everything locally. You won’t be able to control the base image, but you’ll have access to all of Docker’s features. This gives you (virtually) complete control of Docker, similar to a local machine setup.

The `machine` executor also supports private Docker images. Before pulling private images, run `docker login` along with private environment variables to login to the registry.

Here's a sample `config.yml`:

```yaml
version: 2
jobs:
  build:
    machine:
      enabled: true
    working_directory: ~/my-project
    steps:
      - checkout
      - run:
          name: Verify Docker Works
          command: |
            docker --version
            docker-compose --version
            docker run hello-world
```

The image used with the `machine` executor is fairly sparse. You’ll have:

- Git
- Docker
- Docker Compose

...and that’s about it. You’ll need to install anything else you might need. With great build flexibility comes great setup.
