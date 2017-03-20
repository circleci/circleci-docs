---
layout: classic-docs
title: "Docker Layer Caching"
short-title: "Docker Layer Caching"
order: 5
---

{% include beta-premium-feature.html%}

If your application is distributed as a Docker image you probably know that the Docker image consists of layers and most of the time only the top layers are being changed. So if your image has many layers you may want to reuse unchanged layers and significantly reduce image build times. By default [Remote Docker Environment]({{ site.baseurl }}/2.0/building-docker-images) doesn't provide caching for layers, but it can be enabled with a special option:

``` YAML
- setup_docker_engine:
    reusable: true    # default - false
    exclusive: true   # default - true
```

Please note, that this feature requires your project to be whitelisted. Please reach out to your support representative in order to enable it.

With `reusable: true` CircleCI will try to reuse your previous Remote Docker Environment, so all the layers you built in previous job(s) will be there. We try to reuse the previous environment on a best effort basis. This means that in some cases your job may find itself in a clean environment even if your config specifies `reusable: true`.

If you run many parallel jobs for the same project (the same or different branches), and each of them are requesting a reusable environment, none of them will be blocked and all will be provided with a Remove Docker Environment (but probably not all of them will have cached layers). Please note that this feature is in Beta right now and we might change this behaviour later.

The second option `exclusive` indicates whether you want to allow simultaneous running of parallel jobs in the same Remote Docker Environment. If it's enabled (`exclusive: true`) your job is guaranteed to have an exclusive Remote Docker Environment not shared with any other job. Disabling it (`exclusive: false`) allows parallel jobs of the same project to share one Remote Docker Environment. This way you can reduce the chances of getting a Remote Docker without cache. You need to be cautious and make sure that your project is resilient to concurrent operations in Docker Engine. For instance, if you build images with mutable tags (like `latest`) then a shared Docker environment might be a bad idea. With `exclusive: false` we will allow only two parallel jobs to use the same Docker environment. As notes above, this feature is currently in Beta and we might change the behaviour. We'll keep this documet up-to-date with the current functionality.
