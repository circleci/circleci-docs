---
layout: classic-docs
title: "Building Custom Images for Docker Executor"
short-title: "Building Custom Images"
description: "Why and how to create custom Docker images"
categories: [docker]
order: 30
---

CircleCI 2.0 gives you access to the power and flexibility of Docker. One of the ways you can take advantage of this is to create custom Docker images for your jobs. The benefits of doing this are:

1. Faster job execution because you can preinstall all the tools you require, eliminating the need to install them on each job run
2. A more concise and easier to maintain CircleCI `config.yml` file

In this document we will give a walkthrough how to create a custom image. In most cases you'll want to have a custom image for your [primary container]({{ site.baseurl }}/2.0/glossary/#primary-container) so we'll mostly describe this case. But you can easily apply this knowledge to create images for supporting containers as well.

## Requirements

As a prerequisite you'll need to have Docker installed. Please follow the [official Docker guide](https://docs.docker.com/engine/installation/).

If you are unfamiliar with Docker, we recommend reading Docker's [getting started guide](https://docs.docker.com/engine/getstarted/).

## Dockerfile

Docker has a special format for describing images and conventionally this file is named `Dockerfile`. We recommend keeping this file together with your project source code in `.circleci/images` folder. For instance, in [our Docker demo project](https://github.com/circleci/cci-demo-docker) we put the `Dockerfile` for the primary container into [`.circleci/images/primary` folder](https://github.com/circleci/cci-demo-docker/tree/master/.circleci/images/primary).

## Base image

First of all you need to choose a base image. In general it makes sense to use a image with your main language/framework as a base images. [Docker Hub](https://hub.docker.com/) has pre-built images for most popular languages and frameworks. We recommend starting with an [officially supported image](https://hub.docker.com/explore/).

Once you've chosen a base image you can start writing a `Dockerfile` to extend it:

``` Dockerfile
FROM golang:1.8.0
```

For example, in [our Docker demo project](https://github.com/circleci/cci-demo-docker) we use `golang:1.8.0` because the project is using Go.

Read more about [`FROM` command](https://docs.docker.com/engine/reference/builder/#from).

## Additional tools

Now you can add the tools required for your job. You can do this using the `RUN` command:

``` Dockerfile
RUN apt-get update && apt-get install -y netcat
RUN go get github.com/jstemmer/go-junit-report
```

In our example project we use `netcat` to validate that our database is up and running. The `golang:1.8.0` base image doesn't have it preinstalled, so we specify it in our `Dockerfile`. Next we install a special Go library for generating test reports `go-junit-report`.

**Note:** For images **not** based on [`Debian`-like](https://en.wikipedia.org/wiki/Debian) distributions, the command for installing additional applications might be different. For instance, for [`Alpine`](https://en.wikipedia.org/wiki/Alpine_Linux) based images the same tools might be installed using:

``` Dockerfile
RUN apk update && apk add netcat-openbsd git
RUN go get github.com/jstemmer/go-junit-report
```

Read more about [`RUN` command](https://docs.docker.com/engine/reference/builder/#run).

## Required tools

There are a few tools a custom image needs to have in order to be used as a primary image in CircleCI:

 * git
 * ssh
 * tar
 * gzip
 * ca-certificates

In the future we will simplify this, but right now you need to make sure that these tools are present in a custom image. You might not need to install all of them, the base image you choose might have some of them pre-installed.

## Custom tools/files

Sometimes you might want to add custom files/tools not present in package managers. You can do that using `ADD` command:

``` Dockerfile
ADD custom_tool /usr/bin/
```

In this case we copy `custom_tool` into the `/usr/bin/` directory of an image. Please note that `custom_tool` needs to be in the same directory as `Dockerfile`.

Read more about [`ADD` command](https://docs.docker.com/engine/reference/builder/#add).

## Building the image

Once all required tools are specified in `Dockerfile` we can build the image.

``` Shell
$ docker build <path-to-dockerfile>
```

You'll see how all commands specified in `Dockerfile` are executed. If there are any errors they'll be displayed and you'll need to fix them before continuing. If the build is successful you'll have something like this at the very end:

``` Text
...
Successfully built e32703162dd4
```

Read more about [`docker build` command](https://docs.docker.com/engine/reference/commandline/build/).

Congratulations, you've just built your first image! Now we need to store it somewhere to make it available for CircleCI.

## Storing images in a Docker Registry

In order to let CircleCI use your custom image you need to place it in a public [Docker Registry](https://docs.docker.com/registry/introduction/). The easiest way to do that is to create an account on [Docker Hub](https://hub.docker.com/). Docker Hub allows you to store unlimited public images for free. If your organization is already using Docker Hub you can use your existing account.

### Public or private images?

Please note that in order to use an image with our [Docker Executor]({{ site.baseurl }}/2.0/executor-types) you'll have to have a public repository. If you want to keep your image private please [read about using private images and repositories]({{ site.baseurl }}/2.0/private-images/).

### Using different Docker registries

Our example uses Docker Hub, but you can use different registries if you prefer. Please adapt the example based on the registry you're using.

### Preparing the image for the registry

Once you have your Docker Hub account you can create a [new repository](https://hub.docker.com/add/repository/). We recommend to use a pattern like `<project-name>-<container-name>` for a repository name (for example, `cci-demo-docker-primary`).

Now you need to rebuild your image using your account and repository name:

``` Shell
$ docker build -t circleci/cci-demo-docker-primary:0.0.1 <path-to-dockerfile>
```

In this case we are using `-t` key to specify the name and tag of our new image:

- `circleci` - our account in Docker Hub
- `cci-demo-docker-primary` - repository name
- `0.0.1` - tag (version) of the image. Always update the tag if you change something in a `Dockerfile` otherwise you might have unpredictable results ([read more]({{ site.baseurl }}/2.0/executor-types))

### Pushing the image to the registry

Now we can push the image to Docker Hub:

``` Shell
$ docker login
$ docker push circleci/cci-demo-docker-primary:0.0.1
```

Note that first we use `docker login` to authenticate in Docker Hub. If you use a registry other than Docker Hub, please refer to its documentation about how to push images there.

## Using your image on CircleCI

Once the image is successfully pushed you can start using it in your `.circleci/config.yml`:

``` YAML
version: 2.0
jobs:
  build:
    docker:
      - image: circleci/cci-demo-docker-primary:0.0.1
```

If you have any questions, head over to our [community forum](https://discuss.circleci.com/) for support from us and other users.
