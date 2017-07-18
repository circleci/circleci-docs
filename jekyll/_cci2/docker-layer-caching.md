---
layout: classic-docs
title: "Enabling Docker Layer Caching"
short-title: "Enabling Docker Layer Caching"
description: "How to reuse unchanged cache layers to reduce build time"
categories: [optimization]
order: 70
---

{% include beta-premium-feature.html feature='Docker Layer Caching' %}

<div class="alert alert-info" role="alert">
<strong>Note:</strong> This feature only works with whitelisted projects. To get it enabled, please contact your Customer Success manager (email cs@circleci.com and include a link to the project on CircleCI).
</div>

If your application is distributed as a Docker image, the image consists of layers that generally change more frequently at the top of the `Dockerfile`.

When this is the case, you might want to reuse the unchanged layers to significantly reduce image build times. By default, the [Remote Docker Environment]({{ site.baseurl }}/2.0/building-docker-images) doesn't provide layer caching, but you can enable this feature with a special option:

``` YAML
- setup_remote_docker:
    reusable: true    # default - false
    exclusive: true   # default - true
```

## **`reusable`**

When `reusable` is set to `true`, CircleCI will try to reuse your Remote Docker Environment. That is, every layer you built in a previous job will be accessible in the remote environment and CircleCI will attempt to reuse the previous environment when it is possible. However, in some cases your job may run in a clean environment, even if the configuration specifies `reusable: true`.

If you run many parallel jobs for the same project, and each job requests a reusable environment, all of them will be provided with a Remote Docker Environment. However, not all of the jobs will have cached layers, although this behavior is subject to change in a future update.

## **`exclusive`**

The second option (`exclusive`) indicates whether you want to allow parallel jobs to run simultaneously in the same Remote Docker Environment. Jobs for which `exclusive:` is set to `true` are guaranteed to have an exclusive Remote Docker Environment that other jobs cannot access.

If you set `exclusive:` to `false`, the project's parallel jobs will be able to share the same Remote Docker Environment. This method lets you reduce the chances of receiving a Remote Docker Environment without a cache. If you choose this option, ensure that your project can handle concurrent operations in Docker Engine.

For example, if you build images with mutable tags like `latest`, then a shared Docker environment could have undesireable results. When `exclusive:` is set to `false`, CircleCI only allows two parallel jobs to use the same Docker environment.
