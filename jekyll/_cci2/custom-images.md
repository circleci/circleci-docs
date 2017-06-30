---
layout: classic-docs
title: "Using Custom-Built Docker Images"
short-title: "Using Custom-Built Docker Images"
description: "Why and how to create custom Docker images"
categories: [containerization]
order: 30
---

CircleCI 2.0 gives you access to the power and flexibility of Docker. One of the ways you can take advantage of this is to create custom Docker images for your jobs. Following are the benefits of creating a custom image:

1. Faster job execution because you can preinstall all the tools you require, eliminating the need to install them on each job run
2. A more concise and easier to maintain CircleCI `config.yml` file

In this document we will give a walkthrough of how to create a custom image. In most cases you'll want to have a custom image for your [primary container]({{ site.baseurl }}/2.0/glossary/#primary-container) so that is the focus of this document. But, you can easily apply this knowledge to create images for supporting containers as well.

## Requirements

As a prerequisite you'll need to have Docker installed. Please follow the [official Docker guide](https://docs.docker.com/engine/installation/).

If you are unfamiliar with Docker, we recommend reading Docker's [getting started guide](https://docs.docker.com/engine/getstarted/).

## Dockerfile

Docker has a special format for describing images and conventionally this file is named `Dockerfile`. We recommend keeping this file together with your project source code in `.circleci/images` folder. For instance, in [our Docker demo project](https://github.com/circleci/cci-demo-docker) we put the `Dockerfile` for the primary container into [`.circleci/images/primary` folder](https://github.com/circleci/cci-demo-docker/tree/master/.circleci/images/primary).

## Base image

First of all you need to choose a base image. In general it makes sense to use a image with your main language/framework as a base images. [Docker Hub](https://hub.docker.com/) has pre-built images for most popular languages and frameworks. We recommend starting with an [officially supported image](https://hub.docker.com/explore/).

After choosing a base image, start writing a `Dockerfile` to extend the base image using `FROM` as in the following example:

``` Dockerfile
FROM golang:1.8.0
```

Refer to the [CircleCI Docker demo project](https://github.com/circleci/cci-demo-docker) for a custom image build from  `golang:1.8.0` because the project is using Go. Read more about the [`FROM` command](https://docs.docker.com/engine/reference/builder/#from).

## Additional tools

Add the tools required for your job by using the `RUN` command:

``` Dockerfile
RUN apt-get update && apt-get install -y netcat
RUN go get github.com/jstemmer/go-junit-report
```

In the example project, `netcat` is used to validate that the database is up and running. The `golang:1.8.0` base image does not have it preinstalled, so we specify `netcat` in the `Dockerfile`. The next line installs a special Go library for generating test reports `go-junit-report`.

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

Ensure that these tools are present in your custom image. You might not need to install all of them, if the base image you choose has some of them pre-installed.

## Custom tools or files

To add custom files or tools not present in package managers, use the `ADD` command:

``` Dockerfile
ADD custom_tool /usr/bin/
```

In this case we copy `custom_tool` into the `/usr/bin/` directory of an image. **Note:** `custom_tool` must be in the same directory as `Dockerfile`. Read more about the [`ADD` command](https://docs.docker.com/engine/reference/builder/#add).

## Building the image

After all of the required tools are specified in the `Dockerfile` it is possible to  build the image.

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

In order to allow CircleCI to use your custom image, store it in a public [Docker Registry](https://docs.docker.com/registry/introduction/). The easiest mechanism is to create an account on [Docker Hub](https://hub.docker.com/) because Docker Hub allows you to store unlimited public images for free. If your organization is already using Docker Hub you can use your existing account.

### Public or private images?

**Note:** To use an image with the CircleCI [Docker Executor]({{ site.baseurl }}/2.0/executor-types) you must have a public repository. If you want to keep your image private refer to the [Using Private Images and Repositories]({{ site.baseurl }}/2.0/private-images/) document for instructions.

### Using different Docker registries

The example uses Docker Hub, but it is possible to use different registries if you prefer. Adapt the example based on the registry you are using.

### Preparing the image for the registry

Log in to Docker Hub with your account and create a new repository on the [add repository](https://hub.docker.com/add/repository/) page. It is best practice to use a pattern similar to `<project-name>-<container-name>` for a repository name (for example, `cci-demo-docker-primary`).

Next, rebuild your image using your account and repository name:

``` Shell
$ docker build -t circleci/cci-demo-docker-primary:0.0.1 <path-to-dockerfile>
```

The `-t` key specifies the name and tag of the new image:

- `circleci` - our account in Docker Hub
- `cci-demo-docker-primary` - repository name
- `0.0.1` - tag (version) of the image. Always update the tag if you change something in a `Dockerfile` otherwise you might have unpredictable results.

### Pushing the image to the registry

Push the image to Docker Hub:

``` Shell
$ docker login
$ docker push circleci/cci-demo-docker-primary:0.0.1
```

**Note:** First, we use `docker login` to authenticate in Docker Hub. If you use a registry other than Docker Hub, refer to the related documentation about how to push images to that registry.

## Using your image on CircleCI

After the image is successfully pushed it is available for use it in your `.circleci/config.yml`:

``` YAML
version: 2.0
jobs:
  build:
    docker:
      - image: circleci/cci-demo-docker-primary:0.0.1
```

If you have any questions, head over to our [community forum](https://discuss.circleci.com/) for support from us and other users.

## Detailed Custom Dockerfile Example for Ruby
This section demonstrates how to build a Ruby container to use on CircleCI 2.0. **Note:** This section assumes you have already used docker login locally. 

The example starts with the [Ruby 2.1](https://hub.docker.com/_/ruby/) image. However, instead of using FROM ruby:2.1 as the base image it describes how the container is built. From the Ruby Docker Hub page, go to the [2.1/Dockerfile](https://raw.githubusercontent.com/docker-library/ruby/e32433a12099d96dc5a1b28a011b73af4f17cfff/2.1/Dockerfile10).
Notice the environment variables that are used to pull in the proper versions.

```
FROM buildpack-deps:jessie

# skip installing gem documentation
RUN mkdir -p /usr/local/etc \
	&& { \
		echo 'install: --no-document'; \
		echo 'update: --no-document'; \
	} >> /usr/local/etc/gemrc

ENV RUBY_MAJOR 2.1
ENV RUBY_VERSION 2.1.10
ENV RUBY_DOWNLOAD_SHA256 5be9f8d5d29d252cd7f969ab7550e31bbb001feb4a83532301c0dd3b5006e148
ENV RUBYGEMS_VERSION 2.6.10

# some of ruby's build scripts are written in ruby
#   we purge system ruby later to make sure our final image uses what we just built
RUN set -ex \
	\
	&& buildDeps=' \
		bison \
		libgdbm-dev \
		ruby \
	' \
	&& apt-get update \
	&& apt-get install -y --no-install-recommends $buildDeps \
	&& rm -rf /var/lib/apt/lists/* \
	\
	&& wget -O ruby.tar.xz "https://cache.ruby-lang.org/pub/ruby/${RUBY_MAJOR%-rc}/ruby-$RUBY_VERSION.tar.xz" \
	&& echo "$RUBY_DOWNLOAD_SHA256 *ruby.tar.xz" | sha256sum -c - \
	\
	&& mkdir -p /usr/src/ruby \
	&& tar -xJf ruby.tar.xz -C /usr/src/ruby --strip-components=1 \
	&& rm ruby.tar.xz \
	\
	&& cd /usr/src/ruby \
	\
# hack in "ENABLE_PATH_CHECK" disabling to suppress:
#   warning: Insecure world writable dir
	&& { \
		echo '#define ENABLE_PATH_CHECK 0'; \
		echo; \
		cat file.c; \
	} > file.c.new \
	&& mv file.c.new file.c \
	\
	&& autoconf \
	&& ./configure --disable-install-doc --enable-shared \
	&& make -j"$(nproc)" \
	&& make install \
	\
	&& apt-get purge -y --auto-remove $buildDeps \
	&& cd / \
	&& rm -r /usr/src/ruby \
	\
	&& gem update --system "$RUBYGEMS_VERSION"

ENV BUNDLER_VERSION 1.14.3

RUN gem install bundler --version "$BUNDLER_VERSION"

# install things globally, for great justice
# and don't create ".bundle" in all our apps
ENV GEM_HOME /usr/local/bundle
ENV BUNDLE_PATH="$GEM_HOME" \
	BUNDLE_BIN="$GEM_HOME/bin" \
	BUNDLE_SILENCE_ROOT_WARNING=1 \
	BUNDLE_APP_CONFIG="$GEM_HOME"
ENV PATH $BUNDLE_BIN:$PATH
RUN mkdir -p "$GEM_HOME" "$BUNDLE_BIN" \
	&& chmod 777 "$GEM_HOME" "$BUNDLE_BIN"

CMD [ "irb" ]
```

Great! This will create a Ruby 2.1 image. Next, we need to install node modules, `awscli`, and PostgreSQL 9.5 using the node:7.4 Dockerfile:

```
FROM buildpack-deps:jessie

RUN groupadd --gid 1000 node \
  && useradd --uid 1000 --gid node --shell /bin/bash --create-home node

# gpg keys listed at https://github.com/nodejs/node
RUN set -ex \
  && for key in \
    9554F04D7259F04124DE6B476D5A82AC7E37093B \
    94AE36675C464D64BAFA68DD7434390BDBE9B9C5 \
    0034A06D9D9B0064CE8ADF6BF1747F4AD2306D93 \
    FD3A5288F042B6850C66B31F09FE44734EB7990E \
    71DCFD284A79C3B38668286BC97EC7A07EDE3FC1 \
    DD8F2338BAE7501E3DD5AC78C273792F7D83545D \
    B9AE9905FFD7803F25714661B63B535A4C206CA9 \
    C4F0DFFF4E8C1A8236409D08E73BC641CC11F4C8 \
  ; do \
    gpg --keyserver ha.pool.sks-keyservers.net --recv-keys "$key"; \
  done

ENV NPM_CONFIG_LOGLEVEL info
ENV NODE_VERSION 7.4.0

RUN curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.xz" \
  && curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc" \
  && gpg --batch --decrypt --output SHASUMS256.txt SHASUMS256.txt.asc \
  && grep " node-v$NODE_VERSION-linux-x64.tar.xz\$" SHASUMS256.txt | sha256sum -c - \
  && tar -xJf "node-v$NODE_VERSION-linux-x64.tar.xz" -C /usr/local --strip-components=1 \
  && rm "node-v$NODE_VERSION-linux-x64.tar.xz" SHASUMS256.txt.asc SHASUMS256.txt \
  && ln -s /usr/local/bin/node /usr/local/bin/nodejs

CMD [ "node" ]
```

Both Dockerfiles use the same base image `buildpack-deps:jessie`. This is excellent because it is possible to combine them and install Python to get `awscli`.
Remove the associated files before commiting the Docker image to install by using `apt`. It is possible to install everything and remove those files afterward, but do not run `apt-get update` more than once. Any custom repos are added beforehand.
The Ruby image comes with git pre-installed so there's no reason to reinstall it. Finally, add sudo, python2.7, and postgresql-9.5 to the list installation list. Then, install yarn with npm.

```
FROM buildpack-deps:jessie

RUN groupadd --gid 1000 node \
  && useradd --uid 1000 --gid node --shell /bin/bash --create-home node

# gpg keys listed at https://github.com/nodejs/node
RUN set -ex \
  && for key in \
    9554F04D7259F04124DE6B476D5A82AC7E37093B \
    94AE36675C464D64BAFA68DD7434390BDBE9B9C5 \
    0034A06D9D9B0064CE8ADF6BF1747F4AD2306D93 \
    FD3A5288F042B6850C66B31F09FE44734EB7990E \
    71DCFD284A79C3B38668286BC97EC7A07EDE3FC1 \
    DD8F2338BAE7501E3DD5AC78C273792F7D83545D \
    B9AE9905FFD7803F25714661B63B535A4C206CA9 \
    C4F0DFFF4E8C1A8236409D08E73BC641CC11F4C8 \
  ; do \
    gpg --keyserver ha.pool.sks-keyservers.net --recv-keys "$key"; \
  done

ENV NPM_CONFIG_LOGLEVEL info
ENV NODE_VERSION 7.4.0
ENV YARN_VERSION 0.18.1

RUN curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.xz" \
  && curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc" \
  && gpg --batch --decrypt --output SHASUMS256.txt SHASUMS256.txt.asc \
  && grep " node-v$NODE_VERSION-linux-x64.tar.xz\$" SHASUMS256.txt | sha256sum -c - \
  && tar -xJf "node-v$NODE_VERSION-linux-x64.tar.xz" -C /usr/local --strip-components=1 \
  && rm "node-v$NODE_VERSION-linux-x64.tar.xz" SHASUMS256.txt.asc SHASUMS256.txt \
  && ln -s /usr/local/bin/node /usr/local/bin/nodejs

# Postgres 9.5
RUN echo "deb http://apt.postgresql.org/pub/repos/apt/ jessie-pgdg main" >> /etc/apt/sources.list \
      && wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - \
      && apt-key adv --keyserver keyserver.ubuntu.com --recv-keys F76221572C52609D 749D6EEC0353B12C

# skip installing gem documentation
RUN mkdir -p /usr/local/etc \
	&& { \
		echo 'install: --no-document'; \
		echo 'update: --no-document'; \
	} >> /usr/local/etc/gemrc

ENV RUBY_MAJOR 2.1
ENV RUBY_VERSION 2.1.10
ENV RUBY_DOWNLOAD_SHA256 5be9f8d5d29d252cd7f969ab7550e31bbb001feb4a83532301c0dd3b5006e148
ENV RUBYGEMS_VERSION 2.6.10

# some of ruby's build scripts are written in ruby
#   we purge system ruby later to make sure our final image uses what we just built
RUN set -ex \
	\
	&& buildDeps=' \
		bison \
		libgdbm-dev \
		ruby \
	' \
	&& apt-get update \
	&& apt-get install -y --no-install-recommends $buildDeps python2.7 sudo postgresql-9.5 \
	&& rm -rf /var/lib/apt/lists/* \
	\
	&& wget -O ruby.tar.xz "https://cache.ruby-lang.org/pub/ruby/${RUBY_MAJOR%-rc}/ruby-$RUBY_VERSION.tar.xz" \
	&& echo "$RUBY_DOWNLOAD_SHA256 *ruby.tar.xz" | sha256sum -c - \
	\
	&& mkdir -p /usr/src/ruby \
	&& tar -xJf ruby.tar.xz -C /usr/src/ruby --strip-components=1 \
	&& rm ruby.tar.xz \
	\
	&& cd /usr/src/ruby \
	\
# hack in "ENABLE_PATH_CHECK" disabling to suppress:
#   warning: Insecure world writable dir
	&& { \
		echo '#define ENABLE_PATH_CHECK 0'; \
		echo; \
		cat file.c; \
	} > file.c.new \
	&& mv file.c.new file.c \
	\
	&& autoconf \
	&& ./configure --disable-install-doc --enable-shared \
	&& make -j"$(nproc)" \
	&& make install \
	\
	&& apt-get purge -y --auto-remove $buildDeps \
	&& cd / \
	&& rm -r /usr/src/ruby \
	\
	&& gem update --system "$RUBYGEMS_VERSION"

ENV BUNDLER_VERSION 1.14.3

RUN gem install bundler --version "$BUNDLER_VERSION"

RUN npm install -g yarn@0.18.1
ENV PATH "$PATH:/root/.yarn/bin/:/usr/local/bin"

# install things globally, for great justice
# and don't create ".bundle" in all our apps
ENV GEM_HOME /usr/local/bundle
ENV BUNDLE_PATH="$GEM_HOME" \
	BUNDLE_BIN="$GEM_HOME/bin" \
	BUNDLE_SILENCE_ROOT_WARNING=1 \
	BUNDLE_APP_CONFIG="$GEM_HOME"
ENV PATH $BUNDLE_BIN:$PATH
RUN mkdir -p "$GEM_HOME" "$BUNDLE_BIN" \
	&& chmod 777 "$GEM_HOME" "$BUNDLE_BIN"

CMD [ "irb" ]
```

To build it, run the following command:

`docker build -t ruby-node:0.1 .`

When it completes, it should display the following:

```
Removing intermediate container e75339607356
Successfully built 52b773cf50e2
```

After it finishes compiling, take the sha from the Docker output and run it as follows:

```
$ docker run -it 52b773cf50e2 /bin/bash
root@6cd398c7b61d:/# exit
```

Then, commit that hostname replacing ruby-node with your Docker Hub username as follows:

```
docker commit 6cd398c7b61d username/ruby-node:0.1
docker push username/ruby-node:0.1
```

Success! To use your custom image, reference ruby-node/bar:0.1 in your `.circleci/config.yml` image key and your primary container will run it.
It is worth it to commit your Dockerfile using a gist and link to it from Docker Hub to avoid losing your configuration.
