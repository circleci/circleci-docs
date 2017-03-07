---
layout: classic-docs2
title: "Choosing an Executor Type"
short-title: "Executor Types"
categories: [configuring-jobs]
order: 7
---

Executor defines an underlying technology to be used for running your build. Currently we provide two options:
 * `docker`
 * `machine`

Each of them has different abilities and some specifics. Here's a basic comparison:

 Executor | `docker` | `machine`
----------|----------|----------
 Start time | Instant | 30-60 sec
 Clean environment | Yes | Yes
 Custom images | Yes | No
 Build Docker images | Yes (1) | Yes
 Full controll over build environment | No | Yes
{: class="table table-striped"}

(1) With [Remote Docker]( {{ site.baseurl }}/2.0/remote-docker)

## Docker Executor

### Overview
A build is running in a Docker container. Image for a container is specified in a config file:

``` YAML
jobs:
  build:
    docker:
      - image: alpine:3.4
```

It's possible to specify many images. In this case all of them will be running in a common network and all the ports they expose will be available on `localhost` from a [main container]( {{ site.baseurl }}/2.0/glossary#main-container).

``` YAML
jobs:
  build:
    docker:
     - image: alpine:3.4

     - image: mongo:2.6.8
       command: [mongod, --smallfiles]

    steps:
      - run: telnet localhost 27017 # command is executed in alpine container and can access
                                    # mongo on localhost
```

In case of a multi-image docker configuration build steps are executed in the first container listed (Main Container).

Images for docker build system might be specified in a few ways:
 * `name:tag` or `name@digest` of the public image on Docker Hub:
   * `alpine:3.4`
   * `redis@sha256:54057dd7e125ca41...`

 * `image_full_url:tag` or `image_full_url@digest` of the public image on any public Docker Registry:
   * `gcr.io/google-containers/busybox:1.24`
   * `gcr.io/google-containers/busybox@sha256:4bdd623e848417d9612...`


Only public images and public Docker Registries are supported (read about [Remote Docker]( {{ site.baseurl }}/2.0/remote-docker) to find out how to work with private images/registries).

Read more about other available options for [Docker Executor]( {{ site.baseurl }}/2.0/configuration-reference).

### Typical use cases
* You have a self-sufficient application
* You have an application that requires additional services to be tested
* Your application is distributed as a Docker Image (requires using [Remote Docker]({{ site.baseurl }}/2.0/remote-docker))
* You want to use `docker-compose` (requires using [Remote Docker]({{ site.baseurl }}/2.0/remote-docker))

### Advantages
* The fastest way to start a build
* Using any custom images for build environment
* Built-in image caching
* Building/running/publishing Docker images via [Remote Docker]( {{ site.baseurl }}/2.0/remote-docker)

### Limitations
* Might be insufficient for complex build environments (low-level work with network, kernel, etc)
* Might require some work to migrate current, not Docker oriented, CI config/script

### Best practises
* **We strongly encourage to avoid using mutable tags** (like `latest`, `1`, etc) because it'll lead to unexpected changes in your build environment. Also we don't guaranty that mutable tag will return up-to-date version of an image (`alpine:latest` might return stale month old cache). Instead we recommend to use precise versions of images (`redis:3.2.7`) or digests (`redis@sha256:95f0c9434f37db0a4f...`).

* Build your own, specific for your build needs, images instead of using some base image and installing additional tools during build execution. It'll significantly reduce your build time. Read more about [how to create a Docker image](TBD).

## Machine Executor

### Overview
A build will be runned in a dedicate, ephemeral Virtual Machine (VM) with a full control over it.

``` YAML
jobs:
  build:
    machine: true
```

VM will be running Ubuntu 14.04 with [additional tools installed](TBD). It's no possible to specify other images.

### Typical use cases
* Your application requires full access to OS resources

### Advantages
* Gives full controll over build environment
* Might be easy to migrate current CI scripts
* Built-in capabilities for building/running/pushing Docker images

### Limitations
* Takes additional time to create VM
* Only default image supported (might require additional provisionning for build needs)
