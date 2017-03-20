---
layout: classic-docs
title: "Docker Layer Caching"
short-title: "Docker Layer Caching"
order: 5
---

{% include beta-premium-feature.html%}

If your application is distributed as a Docker image you probably know that Docker image consists of layers and most of the time only top layers are being changed. So if your image is a heavy one you may want to reuse not changed layers and significantly reduce time for building image. By default [Remote Docker Environment]({{ site.baseurl }}/2.0/building-docker-images) doesn't provide caching for layers, but it can be enabled with a special option:

``` YAML
- setup_docker_engine:
    reusable: true    # default - false
    exclusive: true   # default - true
```

Please note, that this feature requires your project to be whitelisted. Please reach out to your support representative in order to enable it.

In case of `reusable: true` CircleCI will try to reuse your previous Remote Docker Environment so all the layers you built in previous job(s) will be there. We try to reuse previous environment at a best efforts basis. That means that in some cases your job may find itself in a clean environment even if your config specifies `reusable: true`.

If you run many parallel jobs for the same project (the same or different branches) and each of them are requesting reusable environment, none of them will be blocked and all will be provided with a Remove Docker Environment (but probably not all of them will have cached layers). Please note that this feature is in Beta right now and we might change this behaviour later.

The second option `exclusive` indicates whether you want to allow running parallel jobs in the same Remote Docker Environment simultaneously or not. If it's enabled (`exclusive: true`) you job is guarantied to have an exclusive Remote Docker Environment, not shared with any other job. Disabling it (`exclusive: false`) will make possible for parallel jobs of the same project to share one Remote Docker Environment. This way you can reduce chances of getting a Remote Docker without cache. However you need to be cautious and make sure that your project is resilient to concurrent operations in Docker Engine. For instance, if you build images with a mutable tags (like `latest`) then shared Docker environment might be a bad idea. In case of `exclusive: false` we will allow only two parallel jobs to use the same Docker environment. Please note that this feature is in Beta right now and we might change this behaviour later.
