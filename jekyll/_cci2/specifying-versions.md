---
layout: classic-docs2
title: "Specifying Versions"
short-title: "Specifying Versions"
categories: [managing-dependencies]
order: 10
---

In CircleCI 2.0 you are free to specify the exact version for all project dependencies.

## Using public Docker images

Please see [this section of the FAQ](/docs/2.0/faq/#how-do-docker-image-names-work-where-do-they-come-from) for more details.

We recommend choosing a specific tag for your Docker images rather than `[latest]`. This guarantees that you are using the correct version of the container image.

## Can I use private Docker images?

You can currently use, build, and push private images on `executorType: machine`

We don't currently have an ETA for when private images can be used as the base image on `executorType: docker`.
