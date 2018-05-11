---
layout: classic-docs
title: "Enabling Docker Layer Caching"
short-title: "Enabling Docker Layer Caching"
description: "How to reuse unchanged cache layers to reduce build time"
categories: [optimization]
order: 70
---

*[Docker, Machine, and iOS Builds]({{ site.baseurl }}/2.0/build/) > Enabling Docker Layer Caching*

{% include beta-premium-feature.html feature='Docker Layer Caching' %}

This document describes how to enable Docker Layer Caching (DLC), which is useful when you are _building_ Docker images during your job or Workflow. Docker Layer Caching (DLC) can reduce job runtimes when building Docker images using the [`machine` executor]({{ site.baseurl }}/2.0/executor-types/#using-machine) or [Remote Docker Environment]({{ site.baseurl }}/2.0/building-docker-images/#overview).

DLC does **not** speed up downloading of the Docker images used to _run_ your jobs. That is, Docker images that are used to run jobs appear in the Spin up Environment step for a job and are **not** cached by DLC. DLC does **not** affect Docker images serving as build containers—see [Choosing an Executor Type]({{ site.baseurl }}/2.0/executor-types/#using-docker) for details. CircleCI automatically caches build container images, but with the scale and complexity of cloud infrastructure, there is no guarantee that a particular job will receive caches for images serving as build containers.

**Note:** You must [open a support ticket](https://support.circleci.com/hc/en-us/requests/new) to have a CircleCI Sales representative contact you about enabling this feature on your circleci.com account for an additional fee. DLC is available by default when licensed for installation in your datacenter or private cloud.

## Video Overview of Docker Layer Caching

<div class="video-wrapper">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/AL7aBN7Olng" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
</div>

## Docker Layer Caching in Remote Docker
Consider enabling DLC to significantly reduce image build times by reusing the unchanged layers of the application image built during your job.

If your application is distributed as a Docker image, the image consists of layers that generally change more frequently toward the bottom of the `Dockerfile`. This is because any lines that change in a Dockerfile invalidate the cache of that line and every line after it. The frequently changing layers are referred to as the *top* layers of the image after it is compiled.

By default, the [Remote Docker Environment]({{ site.baseurl }}/2.0/building-docker-images) doesn't provide layer caching, but you can enable this feature with a special option:

``` YAML
- setup_remote_docker:
    docker_layer_caching: true # default - false  
``` 

When `docker_layer_caching` is set to `true`, CircleCI will try to reuse Docker Images (layers) built during a previous job or workflow. That is, every layer you built in a previous job will be accessible in the remote environment. However, in some cases your job may run in a clean environment, even if the configuration specifies `docker_layer_caching: true`.

If you run many parallel jobs for the same project that depend on the same environment, all of them will be provided with a Remote Docker Environment. Docker Layer Caching guarantees jobs to have exclusive Remote Docker Environments that other jobs cannot access. However, some of the jobs may have cached layers, some may not have cached layers, and not all of the jobs will have identical cache.

**Note:** Previously the `docker_layer_caching` was called `reusable`. The `reusable` key is deprecated in favor of the `docker_layer_caching` key. In addition, the `exclusive` option is deprecated in favor of all VMs being treated as exclusive. This indicates that jobs are guaranteed to have an exclusive Remote Docker Environment that other jobs cannot access when using `docker_layer_caching`.

## Docker Layer Caching in Machine Executor

Docker Layer Caching is also available for [`machine` executor](https://circleci.com/docs/2.0/executor-types/#using-machine), and it works in exactly the same way as described above. Enable Docker Layer Caching with the `machine` executor by using the example below.

``` YAML
machine:
  docker_layer_caching: true    # default - false
```
