---
layout: classic-docs
title: "Using the Docker execution environment"
description: "Learn how to configure a your jobs to run in the Docker execution environment"
version:
- Cloud
- Server v4.x
- Server v3.x
- Server v2.x
---
[custom-images]: {{ site.baseurl }}/custom-images/
[building-docker-images]: {{ site.baseurl }}/building-docker-images/
[server-gpu]: {{ site.baseurl }}/gpu/

**Legacy images with the prefix "circleci/" were [deprecated](https://discuss.circleci.com/t/legacy-convenience-image-deprecation/41034)** on December 31, 2021. For faster builds, upgrade your projects with [next-generation convenience images](https://circleci.com/blog/announcing-our-next-generation-convenience-images-smaller-faster-more-deterministic/).
{: class="alert alert-warning"}

You can use the Docker execution environment to run your [jobs]({{site.baseurl}}/jobs-steps/) in Docker containers. The Docker execution environment is accessed using the [Docker executor]({{site.baseurl}}/configuration-reference/#docker). Using Docker increases performance by building only what is required for your application.

Specify a Docker image in your [`.circleci/config.yml`]({{ site.baseurl }}/configuration-reference/) file to spin up a container. All steps in your job will be run in this container.

```yaml
jobs:
  my-job:
    docker:
      - image: cimg/node:lts
```

A container is an instance of a specified Docker image. The first image listed in your configuration for a job is referred to as the _primary_ container image and this is where all steps in the job will run. _Secondary_ containers can also be specified to run alongside for running services, such as, databases. If you are new to Docker, see the [Docker Overview documentation](https://docs.docker.com/engine/docker-overview/) for concepts.

CircleCI maintains convenience images on Docker Hub for popular languages. See [the CircleCI Developer Hub](https://circleci.com/developer/images) for a complete list of image names and tags.

**Note**: If you need a Docker image that installs Docker and has Git, consider using `cimg/base:current`.

## Specifying Docker images
{: #specifying-docker-images }

Docker images may be specified in a few ways:

- By the image name and version tag on Docker Hub, or
- By using the URL to an image in a registry.

Nearly all of the public images on Docker Hub and other Docker registries are supported by default when you specify the `docker:` key in your `config.yml` file. If you want to work with private images/registries, please refer to [Using Docker Authenticated Pulls]({{ site.baseurl }}/private-images/).

The following examples show how you can use public images from various sources:

### CircleCI's public convenience images on Docker Hub
{: #public-convenience-images-on-docker-hub }

  - `name:tag`
    - `cimg/node:14.17-browsers`
  - `name@digest`
    - `cimg/node@sha256:aa6d08a04d13dd8a...`

### Public images on Docker Hub
{: #public-images-on-docker-hub }

  - `name:tag`
    - `alpine:3.13`
  - `name@digest`
    - `alpine@sha256:e15947432b813e8f...`

### Public images on Docker registries
{: #public-docker-registries }

  - `image_full_url:tag`
    - `gcr.io/google-containers/busybox:1.24`
  - `image_full_url@digest`
    - `gcr.io/google-containers/busybox@sha256:4bdd623e848417d9612...`

## Available Docker resource classes
{: #available-docker-resource-classes }

The [`resource_class`]({{ site.baseurl }}/configuration-reference/#resource_class) key allows you to configure CPU and RAM resources for each
job. In Docker, the following resources classes are available:

Class                 | vCPUs | RAM
----------------------|-------|-----
small                 | 1     | 2GB
medium                | 2     | 4GB
medium+               | 3     | 6GB
large                 | 4     | 8GB
xlarge                | 8     | 16GB
2xlarge               | 16    | 32GB
2xlarge+              | 20    | 40GB
{: class="table table-striped"}

**Note**: `2xlarge` and `2xlarge+` require review by our support team. [Open a support ticket](https://support.circleci.com/hc/en-us/requests/new) if you would like to request access.

Specify a resource class using the `resource_class` key, as follows:

```yaml
jobs:
  build:
    docker:
      - image: cimg/base:current
    resource_class: xlarge
    steps:
    #  ...  other config
```

## Docker benefits and limitations
{: #docker-benefits-and-limitations }

Docker also has built-in image caching and enables you to build, run, and publish Docker images via [Remote Docker][building-docker-images]. Consider the requirements of your application as well. If the following are true for your application, Docker may be the right choice:

- Your application is self-sufficient.
- Your application requires additional services to be tested.
- Your application is distributed as a Docker image (requires using [Remote Docker][building-docker-images]).
- You want to use `docker-compose` (requires using [Remote Docker][building-docker-images]).

Choosing Docker limits your runs to what is possible from within a Docker container (including our [Remote Docker][building-docker-images] feature). For instance, if you require low-level access to the network or need to mount external volumes, consider using `machine`.

There are tradeoffs to using a `docker` image versus an Ubuntu-based `machine` image as the environment for the container, as follows:

Capability | `docker` | `machine`
----------|----------|----------
 Start time | Instant | 30-60 sec
 Clean environment | Yes | Yes
 Custom images | Yes <sup>(1)</sup> | No
 Build Docker images | Yes <sup>(2)</sup> | Yes
 Full control over job environment | No | Yes
 Full root access | No | Yes
 Run multiple databases | Yes <sup>(3)</sup> | Yes
 Run multiple versions of the same software | No | Yes
 [Docker layer caching]({{ site.baseurl }}/docker-layer-caching/) | Yes | Yes
 Run privileged containers | No | Yes
 Use docker compose with volumes | No | Yes
 [Configurable resources (CPU/RAM)]({{ site.baseurl }}/configuration-reference/#resource_class) | Yes | Yes
{: class="table table-striped"}

<sup>(1)</sup> See [Using Custom Docker Images][custom-images].

<sup>(2)</sup> Requires using [Remote Docker][building-docker-images].

<sup>(3)</sup> While you can run multiple databases with Docker, all images (primary and secondary) share the underlying resource limits. Performance in this regard will be dictated by the compute capacities of your container plan.

For more information on `machine`, see the next section below.

## Docker image best practices
{: #docker-image-best-practices }

- If you encounter problems with rate limits imposed by your registry provider, using [authenticated docker pulls]({{ site.baseurl }}/private-images/) may grant higher limits.

- CircleCI has partnered with Docker to ensure that our users can continue to access Docker Hub without rate limits. As of November 1st 2020, with few exceptions, you should not be impacted by any rate limits when pulling images from Docker Hub through CircleCI. However, these rate limits may go into effect for CircleCI users in the future. We encourage you to [add Docker Hub authentication]({{ site.baseurl }}/private-images/) to your CircleCI configuration and consider upgrading your Docker Hub plan, as appropriate, to prevent any impact from rate limits in the future.

- Avoid using mutable tags like `latest` or `1` as the image version in your `config.yml file`. It is best practice to use precise image versions or digests, like `redis:3.2.7` or `redis@sha256:95f0c9434f37db0a4f...` as shown in the examples. Mutable tags often lead to unexpected changes in your job environment.  CircleCI cannot guarantee that mutable tags will return an up-to-date version of an image. You could specify `alpine:latest` and actually get a stale cache from a month ago.

- If you experience increases in your run times due to installing additional tools during execution, consider creating and using a custom-built image that comes with those tools pre-installed. See the [Using Custom-Built Docker Images]({{site.baseurl}}/custom-images/) page for more information.

- When you use [AWS ECR]({{ site.baseurl }}/private-images/#aws-ecr) images, it is best practice to use `us-east-1` region. Our job execution infrastructure is in `us-east-1` region, so having your image on the same region reduces the image download time.

- In the event that your pipelines are failing despite there being little to no changes in your project, you may need to investigate upstream issues with the Docker images being used.

More details on the Docker executor are available in the [Configuring CircleCI]({{ site.baseurl }}/configuration-reference/) document.

## Using multiple Docker images
{: #using-multiple-docker-images }

It is possible to specify multiple images for your job. Specify multiple images if, for example, you need to use a database for your tests or for some other required service. All containers run in a common network and every exposed port will be available on `localhost` from a [primary container]({{ site.baseurl }}/glossary/#primary-container).

**In a multi-image configuration job, all steps are executed in the container created by the first image listed**.

```yaml
jobs:
  build:
    docker:
    # Primary container image where all steps run.
     - image: cimg/base:current
    # Secondary container image on common network.
     - image: cimg/mariadb:10.6
       command: [mongod, --smallfiles]

    steps:
      # command will execute in an Ubuntu-based container
      # and can access MariaDB on localhost
      - run: sleep 5 && nc -vz localhost 3306
```

## RAM disks
{: #ram-disks }

A RAM disk is available at `/mnt/ramdisk` that offers a [temporary file storage paradigm](https://en.wikipedia.org/wiki/Tmpfs), similar to using `/dev/shm`. Using the RAM disk can help speed up your build, provided that the `resource_class` you are using has enough memory to fit the entire contents of your project (all files checked out from git, dependencies, assets generated etc).

The simplest way to use this RAM disk is to configure the `working_directory` of a job to be `/mnt/ramdisk`:

```yaml
jobs:
  build:
    docker:
     - image: alpine

    working_directory: /mnt/ramdisk

    steps:
      - run: |
          echo '#!/bin/sh' > run.sh
          echo 'echo Hello world!' >> run.sh
          chmod +x run.sh
      - run: ./run.sh
```

## Caching Docker images
{: #caching-docker-images }

This section discusses caching the Docker images used to spin up a Docker execution environment. It does not apply to [Docker layer caching]({{site.baseurl}}/docker-layer-caching), which is a feature used to speed up building new Docker images in your projects.
{: class="alert alert-info" }


The time it takes to spin up a Docker container to run a job can vary based on several different factors, such as the size of the image and if some, or all, of the layers are already cached on the underlying Docker host machine.

If you are using a more popular image, such as CircleCI convenience images, then cache hits are more likely for a larger number of layers. Most of the popular CircleCI images use the same base image. The majority of the base layers are the same between images, so you have a greater chance of having a cache hit.

The environment has to spin up for every new job, regardless of whether it is in the same workflow or if it is a re-run/subsequent run. (CircleCI never reuses containers, for security reasons.) Once the job is finished, the container is destroyed. There is no guarantee that jobs, even in the same workflow, will run on the same Docker host machine. This implies that the cache status may differ.

In all cases, cache hits are not guaranteed, but are a bonus convenience when available. With this in mind, a worst-case scenario of a full image pull should be accounted for in all jobs.

In summary, the availability of caching is not something that can be controlled via settings or configuration, but by choosing a popular image, such as [CircleCI convenience images](https://circleci.com/developer/images), you will have more chances of hitting cached layers in the "Spin Up Environment" step.

## Next steps
{: #next-steps }

Find out more about using [Convenience Images]({{site.baseurl}}/circleci-images) with the Docker executor.
