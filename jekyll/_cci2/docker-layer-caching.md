---
layout: classic-docs
title: "Enabling Docker Layer Caching"
short-title: "Enabling Docker Layer Caching"
description: "How to reuse unchanged cache layers to reduce build time"
categories: [optimization]
order: 70
---

{% include beta-premium-feature.html feature='Docker Layer Caching' %}

**Note:** This feature only works with whitelisted projects. To enable this feature, you must contact your Customer Success manager (email cs@circleci.com and include a link to the project on CircleCI).

If your application is distributed as a Docker image, the image consists of layers that generally change more frequently toward the bottom of the `Dockerfile`. This is because any lines that change in a Dockerfile invalidate the cache of that line and every line after it. The frequently changing layers are referred to as the *top* layers of the image after it is compiled.

Consider reusing the unchanged layers to significantly reduce image build times. By default, the [Remote Docker Environment]({{ site.baseurl }}/2.0/building-docker-images) doesn't provide layer caching, but you can enable this feature with a special option:

Docker executor:

``` YAML
steps:
  - setup_docker_engine:
      docker_layer_caching: true    # default - false
```

Machine executor:

``` YAML
- machine:
    docker_layer_caching: true    # default - false
```

When `docker_layer_caching` is set to `true`, CircleCI will try to reuse your Remote Docker Environment. That is, every layer you built in a previous job will be accessible in the remote environment and CircleCI will attempt to reuse the previous environment when it is possible. However, in some cases your job may run in a clean environment, even if the configuration specifies `docker_layer_caching: true`.

If you run many parallel jobs for the same project that depend on the same environment, all of them will be provided with a Remote Docker Environment. However, not all of the jobs will have cached layers, although this behavior is subject to change in a future update.

Docker Layer Caching guarantees jobs to have exclusive Remote Docker Environments that other jobs cannot access.

For example, if you build images with mutable tags like `latest`, then a shared Docker environment could have undesireable results. As such, you should not assume sequential sharing, where the `build 1` environment is the same one that `test 1` uses in a job. Instead, each job should be configured to push or pull to a Docker registry as needed. The Docker environments will eventually stabilize with the images your jobs require after a few job runs.
