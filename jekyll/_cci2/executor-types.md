---
layout: classic-docs
title: "Choosing an Executor Type"
short-title: "Executor Types"
description: "Overviews of the docker and machine executor types"
categories: [configuring-jobs]
order: 0
---
[building-docker-images]: {{ site.baseurl }}/2.0/building-docker-images/

An executor defines an underlying technology to run your job. Currently, we provide two options: `docker` and `machine`.

Like any set of choices, there are tradeoffs to using one over the other. Here’s a basic comparison:

 Executor | `docker` | `machine`
----------|----------|----------
 Start time | Instant | 30-60 sec
 Clean environment | Yes | Yes
 Custom images | Yes | No
 Build Docker images | Yes <sup>(1)</sup> | Yes
 Full control over job environment | No | Yes
{: class="table table-striped"}

<sup>(1)</sup> With [Remote Docker][building-docker-images].

## Docker Executor
When you choose the `docker` executor, your job will run in a Docker container. You can specify the container image in `.circleci/config.yml`:

```YAML
jobs:
  build:
    docker:
      - image: buildpack-deps:trusty
```

### Multiple Images
It’s also possible to specify multiple images. When you do this, all containers will run in a common network. Every exposed port will be available on `localhost` from a [primary container]({{ site.baseurl }}/2.0/glossary/#primary-container).

```YAML
jobs:
  build:
    docker:
     - image: buildpack-deps:trusty

     - image: mongo:2.6.8
       command: [mongod, --smallfiles]

    working_directory: ~/

    steps:
      # command will execute in trusty container
      # and can access mongo on localhost
      - run: sleep 5 && nc -vz localhost 27017
```

In a multi-image configuration job, steps are executed in the first container listed (main container).

More details on the Docker Executor are available [here]({{ site.baseurl }}/2.0/configuration-reference/).

### Specifying Images
Only public images on Docker Hub and Docker Registry are supported. If you want to work with private images/registries, please refer to [Remote Docker][building-docker-images].

Images for the Docker Executor can be specified in a few ways:

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

### When To Use The Docker Executor?
- your application is self-sufficient
- your application requires additional services to be tested
- your application is distributed as a Docker Image (requires using [Remote Docker][building-docker-images])
- you want to use `docker-compose` (requires using [Remote Docker][building-docker-images])

### Advantages
- Fastest way to start a job
- Use any custom image for a job environment
- Built-in image caching
- Build, run, and publish Docker images via [Remote Docker][building-docker-images]

### Limitations
- Limited by what is possible from within a Docker container (including our [Remote Docker][building-docker-images] feature). For instance, if you require low-level access to the network or need to mount external volumes checkout the `machine` executor below.

### Best Practices

#### Avoid Mutable Tags
We strongly discourage using mutable tags like `latest` or `1`. Mutable tags often lead to unexpected changes in your job environment.

We also can’t guarantee that mutable tags will return an up-to-date version of an image. You could specify `alpine:latest` and actually get a stale cache from a month ago.

Instead, we recommend using precise image versions or digests, like `redis:3.2.7` or `redis@sha256:95f0c9434f37db0a4f...`.

#### Use Custom Images
If you find yourself incurring undo increases in your run times due to installing additional tools during execution, we recommend [making custom images]({{ site.baseurl }}/2.0/custom-images/) that meet the job’s requirements, so the container will have such tools pre-loaded.

<hr>

{% include beta-premium-feature.html feature='Machine Executor'%}

## Machine Executor
When you choose the `machine` executor, your job will run in a dedicated, ephemeral Virtual Machine (VM). To use the machine executor, simply set the `machine` key to `true` in `.circleci/config.yml`:

```YAML
jobs:
  build:
    machine: true
```

The VM will run Ubuntu 14.04 with a few additional tools installed. It isn’t possible to specify other images.

### When To Use the Machine Executor?
- Your application requires full access to OS resources

### Advantages
- Gives full control over job environment

### Limitations
- Takes additional time to create VM
- Only the default image is supported; your job may require additional provisioning.

