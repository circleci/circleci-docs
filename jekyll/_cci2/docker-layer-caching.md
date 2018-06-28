---
layout: classic-docs
title: "Enabling Docker Layer Caching"
short-title: "Enabling Docker Layer Caching"
description: "How to reuse unchanged cache layers in images you build to reduce overall run time"
categories: [optimization]
order: 70
---

*[Docker, Machine, and iOS Builds]({{ site.baseurl }}/2.0/build/) > Enabling Docker Layer Caching*

{% include beta-premium-feature.html feature='Docker Layer Caching' %}

This document describes how to enable Docker Layer Caching (DLC). The DLC feature caches images you build with a Dockerfile on the first run and when you rerun that same job, CircleCI finds the layers that already exist and reuses them to reduce the build time.

* TOC
{:toc}

## Overview

Docker Layer Caching (DLC) is a great feature to use if you are building Docker images on CircleCI with a Dockerfile. This feature reduces the pain of rebuilding images every single time, especially if nothing in your Dockerfile has changed. You can use DLC to cache the layers of images you have already built in a previous run and reuse those layers instead of building the image every single time. 

In the example below, the job runs all of the steps in a Dockerfile with the `docker_layer_caching: true` for the `setup_remote_docker` step. On subsequent runs of that job, steps that haven't changed in the Dockerfile, will be reused. So, the first run may take 2:45 seconds to build the Docker image, but if nothing changes in the Dockerfile before the second run, those steps will happen instantly, in zero seconds.

```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/node:9.8.0-stretch-browsers
    steps:
      - checkout
      - setup_remote_docker:
          docker_layer_caching: true
      - run: docker build .
```      

When none of the layers in the image change between job runs, CircleCI DLC pulls the layers from cache from the image that was built previously and reuses those instead of rebuilding the entire image. 

If part of the Dockerfile changes (which changes part of the image) a subsequent run of the exact same job with the modified Dockerfile may still finish faster than rebuilding the entire image. It will finish faster because the cache is used for the first few steps that didn't change in the Dockerfile. The steps that follow the change must be rerun because the Dockerfile change invalidates the cache. 

So, if you change something in the Dockerfile, all of those later steps are invalidated and the layers have to be rebuilt.  When some of the steps remain the same (the steps before the one you removed), those steps can be reused. So, it is still faster than rebuilding the entire image.

## Video: Overview of Docker Layer Caching

<div class="video-wrapper">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/AL7aBN7Olng" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
</div>

## Limitations

DLC does **not** speed up downloading of the Docker images which serve as build containers that are used to _run_ your jobs. You can find Docker images that are used to run jobs in the Spin up Environment section of the Jobs page in the CircleCI app. The images in the Spin up Environment section for a job are **not** cached by DLC. 

**Note:** You must [open a support ticket](https://support.circleci.com/hc/en-us/requests/new) to have a CircleCI Sales representative contact you about enabling this feature on your circleci.com account for an additional fee. DLC is available by default when licensed for installation in your datacenter or private cloud.

### Remote Docker Environment

Every layer you build in a previous job will be accessible in the remote environment. However, in some cases your job may run in a clean environment, even if the configuration specifies `docker_layer_caching: true`.

If you run many parallel jobs for the same project that depend on the same environment, all of them will be provided with a Remote Docker Environment. Docker Layer Caching guarantees jobs to have exclusive Remote Docker Environments that other jobs cannot access. However, some of the jobs may have cached layers, some may not have cached layers, and not all of the jobs will have identical cache.

**Note:** Previously the `docker_layer_caching` was called `reusable`. The `reusable` key is deprecated in favor of the `docker_layer_caching` key. In addition, the `exclusive` option is deprecated in favor of all VMs being treated as exclusive. This indicates that jobs are guaranteed to have an exclusive Remote Docker Environment that other jobs cannot access when using `docker_layer_caching`.

## Examples

Docker Layer Caching (DLC) can reduce job runtimes when building Docker images using the [`machine` executor]({{ site.baseurl }}/2.0/executor-types/#using-machine) or the [Remote Docker Environment]({{ site.baseurl }}/2.0/building-docker-images/#overview).

If your application is distributed as a Docker image, the image consists of layers that generally change more frequently toward the bottom of the `Dockerfile`. This is because any lines that change in a Dockerfile invalidate the cache of that line and every line after it. The frequently changing layers are referred to as the *top* layers of the image after it is compiled.

By default, the [Remote Docker Environment]({{ site.baseurl }}/2.0/building-docker-images) doesn't provide layer caching, but you can enable this feature with a special option:

``` YAML
- setup_remote_docker:
    docker_layer_caching: true # default - false  
``` 

Docker Layer Caching is also available for [`machine` executor](https://circleci.com/docs/2.0/executor-types/#using-machine), and it works in exactly the same way as described above. Enable Docker Layer Caching with the `machine` executor by using the example below.

``` YAML
machine:
  docker_layer_caching: true    # default - false
```


