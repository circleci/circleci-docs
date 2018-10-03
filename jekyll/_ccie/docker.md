---
layout: enterprise
section: enterprise
title: "Using Docker with CircleCI Enterprise"
category: [resources]
order: 4
description: "Docker Usage and Caveats on CircleCI Enterprise."
hide: true
sitemap: false
---

## Using Docker with CircleCI Enterprise

CircleCI supports using Docker containers in your build. For details see our main [Docker documentation](https://circleci.com/docs/docker).


## Caveats using Docker on CircleCI Enterprise

1. **Caching** -- by far the most common challenge developers have using Docker on CircleCI is the technical difficulty of caching Docker images. As a result, if you want to pull in Docker images to use in your build (or to run builds within Docker containers) they need to be loaded on each build. Depending on the size of your Docker containers this can add unwanted time to your builds.

2. **Parallelism** -- when running your builds inside of Docker containers the build-in CircleCI test splitting machinery does not work automatically, as it does with test splitting in most environments run directly in your build containers.
