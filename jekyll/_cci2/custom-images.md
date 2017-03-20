---
layout: classic-docs
title: "Building Custom Images for Docker Executor"
short-title: "Building Custom Images"
categories: [configuring-jobs]
order: 30
---

Since CircleCI 2.0 platform is built with a flexibility of Docker in mind the best way to use this power is to create custom images for your jobs. There are few advantages for doing this:
 1. Image will include all required tools that would eliminate need to install them at each run therefore reduce job execution time
 2. Config file will be more concise and will contain only relevant to the job purpose steps

In this document we will give a walkthrough how to create a custom image. In most cases you'll want to have a custom image for your [primary container]({{ site.baseurl }}/2.0/glossary/#primary-container) so we'll mostly describe this case. But you can easily apply this knowledge for creating images for supporting containers as well.

## Requirements

As a prerequisite you'll need to have Docker installed. Please follow [official Docker guide](https://docs.docker.com/engine/installation/) for that.

If you are unfamiliar with Docker at all, we would recommend to read a very good [getting started guide](https://docs.docker.com/engine/getstarted/).

## Dockerfile

Docker has a special format for describing images and conventionally this file is named `Dockerfile`. We recommend to keep this file together with your project source code in `.circleci/images` folder. For instance, in [our Docker demo project](https://github.com/circleci/cci-demo-docker) we put `Dockerfile` for primary container into [`.circleci/images/primary` folder](https://github.com/circleci/cci-demo-docker/tree/master/.circleci/images/primary).

## Base image

First of all you need to choose a base image. In general it makes sense to use image with your main language/framework as a base images. [Docker Hub](https://hub.docker.com/) has tons of images for almost all popular languages and frameworks. We recommend to start from [officially supported images](https://hub.docker.com/explore/).

Once base image is chosen we can start writing `Dockerfile`:

``` Dockerfile
FROM golang:1.8.0
```

For example, in [our Docker demo project](https://github.com/circleci/cci-demo-docker) we use `golang:1.8.0` because project is using Go.

Read more about [`FROM` command](https://docs.docker.com/engine/reference/builder/#from).

## Additional tools

Now you can add tools required for your particular job. You can do it using `RUN` command:

``` Dockerfile
RUN apt-get update && apt-get install -y netcat
RUN go get github.com/jstemmer/go-junit-report
```

In our example project we use `netcat` to validate that DB is up and running. Base image `golang:1.8.0` doesn't have it, so we specify it in our `Dockerfile`. Also we install special Go library for generating test reports.

Please note that for images based on not [`Debian`-like](https://en.wikipedia.org/wiki/Debian) distributives command for installing additional applications might be different. For instance, for [`Alpine`](https://en.wikipedia.org/wiki/Alpine_Linux) based images the same tools might be installed using:

``` Dockerfile
RUN apk update && apk add netcat-openbsd git
RUN go get github.com/jstemmer/go-junit-report
```

Read more about [`RUN` command](https://docs.docker.com/engine/reference/builder/#run).

## Required tools

There are a few tools a custom image need to have in order to be used as a primary image in CircleCI:

 * git
 * ssh
 * tar
 * gzip
 * ca-certificates

In the future we are going to simplify this but right now you need to make sure that these tools are present in a custom image. It doesn't mean you need to install all of them, base image might have some of them already installed.

## Custom tools/files

Sometimes you might want to add custom files/tools not present in package managers. You can do that using `ADD` command:

``` Dockerfile
ADD custom_tool /usr/bin/
```

In this case we copy `custom_tool` into `/usr/bin/` directory of an image. Please note that `custom_tool` needs to be in the same directory as `Dockerfile` is.

Read more about [`ADD` command](https://docs.docker.com/engine/reference/builder/#add).

## Building image

Once all required tools are specified in `Dockerfile` we can build an image using it.

``` Shell
$ docker build <path-to-dockerfile>
```

You'll see how all commands specified in `Dockerfile` are executed. If you see any errors you'll need to fix them. In case of success you'll have something like this at the very end:

``` Text
...
Successfully built e32703162dd4
```

Read more about [`docker build` command](https://docs.docker.com/engine/reference/commandline/build/).

Congratulations, you've just built your first image! Now we need to store it somewhere to make it available for CircleCI.

## Storing images

In order to let CircleCI use your custom image you need to place it in some public [Docker Registry](https://docs.docker.com/registry/introduction/). The easiest way to do that is to create an account on [Docker Hub](https://hub.docker.com/). Docker Hub allows to store unlimited amount of public images for free. If your organization is already using Docker Hub or any other registry you can use it as well.

Once you have your Docker Hub account you can create a [new repository](https://hub.docker.com/add/repository/). We recommend to use pattern `<project-name>-<container-name>` for a repository name (for example, `cci-demo-docker-primary`).

Please note that in order to use image in [Docker Executor]({{ site.baseurl }}/2.0/executor-types/#docker-executor) you'll have to have a public repository. If you want to keep your image private please [read about using private images and repositories]({{ site.baseurl }}/2.0/private-images/).

No we need to rebuild an image using your account and repository name:

``` Shell
$ docker build -t circleci/cci-demo-docker-primary:0.0.1 <path-to-dockerfile>
```

In this case we are using `-t` key to specify name and tag of our new image:
 * `circleci` - our account in Docker Hub
 * `cci-demo-docker-primary` - repository name
 * `0.0.1` - tag (version) of the image. Always update tag if you change something in a `Dockerfile` otherwise you might have unpredictable results ([read more]({{ site.baseurl }}/2.0/executor-types/#avoid-mutable-tags))

Now we can push an image into Docker Hub:

``` Shell
$ docker login
$ docker push circleci/cci-demo-docker-primary:0.0.1
```

Note that first we use `docker login` to authenticate in Docker Hub. If you use registry other than Docker Hub, please refer to its documentation about how to push images there.

Once image is successfully pushed you can start using it in your `.circleci/config.yml`:

``` YAML
version: 2.0
jobs:
  build:
    docker:
      - image: circleci/cci-demo-docker-primary:0.0.1
```

If you have any questions, head over to our [community forum](https://discuss.circleci.com/) for support from us and other users.
