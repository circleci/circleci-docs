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

**Note:** This feature only works with whitelisted projects. To enable this feature, you must contact your Customer Success manager ([open a support ticket](https://support.circleci.com/hc/en-us) and include a link to the project on CircleCI). 

If your application is distributed as a Docker image, the image consists of layers that generally change more frequently toward the bottom of the `Dockerfile`. This is because any lines that change in a Dockerfile invalidate the cache of that line and every line after it. The frequently changing layers are referred to as the *top* layers of the image after it is compiled.

## Docker Layer Caching in Remote Docker
Consider reusing the unchanged layers to significantly reduce image build times. By default, the [Remote Docker Environment]({{ site.baseurl }}/2.0/building-docker-images) doesn't provide layer caching, but you can enable this feature with a special option:

``` YAML
- setup_remote_docker:
    docker_layer_caching: true # default - false  
``` 

When `docker_layer_caching` is set to `true`, CircleCI will try to reuse Docker Images (layers) from your previous builds. That is, every layer you built in a previous job will be accessible in the remote environment. However, in some cases your job may run in a clean environment, even if the configuration specifies `docker_layer_caching: true`.

If you run many parallel jobs for the same project that depend on the same environment, all of them will be provided with a Remote Docker Environment. Docker Layer Caching guarantees jobs to have exclusive Remote Docker Environments that other jobs cannot access. However, some of the jobs may have cached layers, some may not have cached layers, and not all of the jobs will have identical cache.

**Note:** The `docker_layer_caching` option is not yet supported in an installable CircleCI release, but this functionality is available by using the `reusable: true` option. Previously the `docker_layer_caching` was called `reusable`. The `reusable` key is deprecated in favor of the `docker_layer_caching` key. In addition, the `exclusive` option is deprecated in favor of all VMs being treated as exclusive. This indicates that jobs are guaranteed to have an exclusive Remote Docker Environment that other jobs cannot access when using `docker_layer_caching`.

## Docker Layer Caching in Machine Executor

Docker Layer Caching is also available for [`machine` executor](https://circleci.com/docs/2.0/executor-types/#using-machine), and it works in exactly the same way as described above. Enable Docker Layer Caching with the `machine` executor by using the example below.

``` YAML
machine:
  docker_layer_caching: true    # default - false
```

