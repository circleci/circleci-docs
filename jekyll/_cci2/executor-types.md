---
layout: classic-docs
title: "Choosing an Executor Type"
short-title: "Executor Types"
categories: [configuring-jobs]
order: 0
---

An executor defines an underlying technology to run your build. Currently, we provide two options: `docker` and `machine`.

Like any set of choices, there are tradeoffs to using one over the other. Here’s a basic comparison:

 Executor | `docker` | `machine`
----------|----------|----------
 Start time | Instant | 30-60 sec
 Clean environment | Yes | Yes
 Custom images | Yes | No
 Build Docker images | Yes (1) | Yes
 Full control over build environment | No | Yes
{: class="table table-striped"}

(1) With [Remote Docker][building-docker-images].

## Docker Executor
When you choose the `docker` executor, your build will run in a Docker container. You can specify the container image in `.circleci/config.yml`:

```YAML
jobs:
  build:
    docker:
      - image: alpine:3.4
```

### Why Use The Docker Executor?
- your application is self-sufficient
- your application requires additional services to be tested
- your application is distributed as a Docker Image (requires using [Remote Docker][building-docker-images])
- you want to use `docker-compose` (requires using [Remote Docker][building-docker-images])

### Specifying Images
Only public images on Docker Hub and Docker Registry are supported. If you want to work with private images/registries, please refer to [Remote Docker][building-docker-images].

Images for the Docker build system can be specified in a few ways:

#### Public Images on Docker Hub
  - `name:tag`
    - `alpine:3.4`
  - `name@digest`
    - `redis@sha256:54057dd7e125ca41...`

#### Public Docker Registries
  - `image_full_url:tag`
    - `gcr.io/google-containers/busybox:1.24`
  - `image_full_url@digest`
    - `gcr.io/google-containers/busybox@sha256:4bdd623e848417d9612...`

### Multiple Images
It’s also possible to specify multiple images. When you do this, all containers will run in a common network. Every exposed port will be available on `localhost` from a [primary container]( {{ site.baseurl }}/2.0/glossary/#primary-container).

```YAML
jobs:
  build:
    docker:
     - image: alpine:3.4

     - image: mongo:2.6.8
       command: [mongod, --smallfiles]

    steps:
      # command will execute in alpine container
      # and can access mongo on localhost
      - run: telnet localhost 27017
```

In a multi-image configuration build, steps are executed in the first container listed (main container).

More details on the Docker Executor are available [here]( {{ site.baseurl }}/2.0/configuration-reference/).

### Advantages
- Fastest way to start a build
- Use any custom image for a build environment
- Built-in image caching
- Build, run, and publish Docker images via [Remote Docker][building-docker-images]

### Limitations
- Limited by what is possible from within a Docker container (including our [Remote Docker][building-docker-images] feature). For instance, if you require low-level access to the network or need to mount external volumes checkout the `machine` executor below.

### Best Practices

#### Avoid Mutable Tags
We strongly discourage using mutable tags like `latest` or `1`. Mutable tags often lead to unexpected changes in your build environment.

We also can’t guarantee that mutable tags will return an up-to-date version of an image. You could specify `alpine:latest` and actually get a stale cache from a month ago.

Instead, we recommend using precise image versions or digests, like `redis:3.2.7` or `redis@sha256:95f0c9434f37db0a4f...`.

#### Use Custom Images
If you find yourself incurring undo increases in your run times due to installing additional tools during execution, we recommend [making custom images](https://docs.docker.com/engine/getstarted/step_four/) that meet the build’s requirements, so the container will have such tools pre-loaded.

<hr>

{% include beta-premium-feature.html feature='Machine Executor'%}

## Machine Executor
When you choose the `machine` executor, your build will run in a dedicated, ephemeral Virtual Machine (VM). To use the machine executor, simply set the `machine` key to `true` in `.circleci/config.yml`:

```YAML
jobs:
  build:
    machine:
      enabled: true
```

The VM will run Ubuntu 14.04 with a few additional tools installed. It isn’t possible to specify other images.

### Why Use the Machine Executor?
- Your application requires full access to OS resources

### Advantages
- Gives full control over build environment

### Limitations
- Takes additional time to create VM
- Only the default image is supported; your build may require additional provisioning.

