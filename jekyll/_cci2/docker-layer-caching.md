---
layout: classic-docs
title: "Docker Layer Caching"
short-title: "Docker Layer Caching"
order: 5
---

{% include beta-premium-feature.html%}

If your application is distributed as a Docker image, you probably know that this image consists of layers. In addition, it's usually the top layers that end up changing.

If this is the case, you might want to reuse the unchanged layers to significantly reduce image build times. By default, the [Remote Docker Environment]({{ site.baseurl }}/2.0/building-docker-images) doesn't provide layer caching, but you can enable this feature with a special option:

``` YAML
- setup_remote_docker:
    reusable: true    # default - false
    exclusive: true   # default - true
```

## **`reusable`**

With `reusable: true`, CircleCI will try to reuse your Remote Docker Environment; every layer you built in a previous job will be accessible there. We do our best to reuse the previous environment when we can, but in some cases your job may find itself in a clean environment, even if you've specified `reusable: true`.

If you run many parallel jobs for the same project, and each job requests a reusble environment, all of them will be provided with a Remote Docker Environment. However, not all of them will have cached layers, although this behavior is subject to change over the course of the Beta.

## **`exclusive`**

The second option (`exclusive`) indicates whether you want to allow parallel jobs to run simultaneously in the same Remote Docker Environment.

If you specify `exclusive: true`, your job is guaranteed to have an exclusive Remote Docker Environment that other jobs can't access.

If you specify `exclusive: false`, a project's parallel jobs will be able to share the same Remote Docker Environment. This method lets you reduce the chances of receiving a Remote Docker Environment without a cache. If you choose this option, ensure that your project can handle concurrent operations in Docker Engine.

For example, if you build images with mutable tags like `latest`, then a shared Docker environment could be a bad idea. With `exclusive: false`, we only allow 2 parallel jobs to use the same Docker environment.

<div class="alert alert-info" role="alert">
<strong>Note:</strong> This feature only works with whitelisted projects. Please contact your support representative to enable layer caching.
</div>
