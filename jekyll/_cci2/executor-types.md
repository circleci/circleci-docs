---
layout: classic-docs
title: "Specifying Container Images"
short-title: "Specifying Container Images"
description: "Overviews of the docker and machine executor types"
categories: [containerization]
order: 10
---
[building-docker-images]: {{ site.baseurl }}/2.0/building-docker-images/

This version of CircleCI enables you to use Docker Images optimized for your needs. This increases performance by building only what is required for your application. Specify a Docker image in your `.circleci/config.yml` file that will generate the primary container where all steps run:
```
jobs:
  build:
    docker:
      - image: buildpack-deps:trusty
```
In this example, all steps run in the container created by the first listed image. To make the transition easy, CircleCI maintains convenience images on Docker Hub for popular languages. See [Using Pre-Built CircleCI Docker Images]({{ site.baseurl }}/2.0/circleci-images/) for the complete list of names and tags.    

### Using Multiple Docker Images
It is possible to specify multiple images for your job. Specify multiple images if, for example, you need to use a database for your tests or for some other required service. **In a multi-image configuration job, all steps are executed in the container created by the first image listed**. All containers run in a common network and every exposed port will be available on `localhost` from a [primary container]({{ site.baseurl }}/2.0/glossary/#primary-container).

```
jobs:
  build:
    docker:
    # Primary container image where all steps run.
     - image: buildpack-deps:trusty
    # Secondary container image on common network. 
     - image: mongo:2.6.8
       command: [mongod, --smallfiles]

    working_directory: ~/

    steps:
      # command will execute in trusty container
      # and can access mongo on localhost
      - run: sleep 5 && nc -vz localhost 27017
```
Docker Images may be specified in three ways, by the image name and version tag on Docker Hub or by using the URL to an image in a registry:

### Public Convenience Images on Docker Hub
  - `name:tag`
    - `circleci/node:7.10-browsers`
  - `name@digest`
    - `redis@sha256:34057dd7e135ca41...`

### Public Images on Docker Hub
  - `name:tag`
    - `alpine:3.4`
  - `name@digest`
    - `redis@sha256:54057dd7e125ca41...`

### Public Docker Registries
  - `image_full_url:tag`
    - `gcr.io/google-containers/busybox:1.24`
  - `image_full_url@digest`
    - `gcr.io/google-containers/busybox@sha256:4bdd623e848417d9612...`

Nearly all of the public images on Docker Hub and Docker Registry are supported by default when you specify the `docker:` key in your `config.yml` file. If you want to work with private images/registries, please refer to [Remote Docker][building-docker-images].

### Docker and Machine Comparison

The `docker` key defines Docker as the underlying technology to run your jobs using Docker Containers. Containers are an instance of the Docker Image you specify and the first image listed in your configuration is the primary container image in which all steps run. CircleCI also provides a `machine` option.

Like any set of choices, there are tradeoffs to using one over the other. Here’s a basic comparison:

Virtual Environment | `docker` | `machine`
----------|----------|----------
 Start time | Instant | 30-60 sec
 Clean environment | Yes | Yes
 Custom images | Yes | No
 Build Docker images | Yes <sup>(1)</sup> | Yes
 Full control over job environment | No | Yes
{: class="table table-striped"}

<sup>(1)</sup> Requires using [Remote Docker][building-docker-images].

### Docker Benefits
Docker also has built-in image caching and enables you to build, run, and publish Docker images via [Remote Docker][building-docker-images]. Consider the requirements of your application as well. If the following are true for your application, Docker may be the right choice:
 
- Your application is self-sufficient
- Your application requires additional services to be tested
- Your application is distributed as a Docker Image (requires using [Remote Docker][building-docker-images])
- You want to use `docker-compose` (requires using [Remote Docker][building-docker-images])

### Docker Limitations
Choosing Docker limits your runs to what is possible from within a Docker container (including our [Remote Docker][building-docker-images] feature). For instance, if you require low-level access to the network or need to mount external volumes check out the `machine` executor below.

### Docker Image Best Practices

- Avoid using mutable tags like `latest` or `1` as the image version in your `config.yml file`. Mutable tags often lead to unexpected changes in your job environment.  CircleCI cannot guarantee that mutable tags will return an up-to-date version of an image. You could specify `alpine:latest` and actually get a stale cache from a month ago. Instead, we recommend using precise image versions or digests, like `redis:3.2.7` or `redis@sha256:95f0c9434f37db0a4f...` as shown in the examples.

- If you experience increases in your run times due to installing additional tools during execution, it is best practice to use the [Building Custom Docker Images Documentation]({{ site.baseurl }}/2.0/custom-images/) to create a custom image with tools that are pre-loaded in the container to meet the job requirements. 

More details on the Docker Executor are available [here]({{ site.baseurl }}/2.0/configuration-reference/).

## Machine Executor

**Potential Premium Feature Notice: Machine Executor may be available for additional fees in a future pricing update. We welcome your [feedback](https://discuss.circleci.com/c/circleci-2-0/feedback) on this and all other aspects of CircleCI 2.0.**

When you choose the `machine` key, your job will run in a dedicated, ephemeral Virtual Machine (VM). To use the machine executor, simply set the `machine` key to `true` in `.circleci/config.yml`:

```YAML
jobs:
  build:
    machine: true
```

The VM will run Ubuntu 14.04 with a few additional tools installed. It isn’t possible to specify other images. Refer to the [specification script for the VM](https://raw.githubusercontent.com/circleci/image-builder/picard-vm-image/provision.sh) for more information about additional tools.

### When To Use the Machine Executor?
- Your application requires full access to OS resources

### Advantages
- Gives full control over job environment

### Limitations
- Takes additional time to create VM
- Only the default image is supported; your job may require additional provisioning.



