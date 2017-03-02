---
layout: classic-docs2
title: "Frequently Asked Questions"
short-title: "FAQ"
categories: [getting-started]
order: 2
---

## Does CircleCI 2.0 run inference commands?

No, CircleCI 2.0 does not infer anything from your project.

This means that no commands are run automatically. Don’t assume that a particular library/package is available unless it is bundled with the Docker image you are using!

## My project is running on CircleCI 2.0, but the build is frozen!

Builds often freeze due to syntax errors in `config.yml`.

Cancel the build, check your `config.yml` for proper indents, and ensure that all jobs and steps have the required keys.

## Can I use CircleCI 2.0 without creating base images?

Yes, you can use* one of ours!

The `circleci/build-image:ubuntu-14.04-XL-922-9410082` image has the same content as the Ubuntu Trusty 14.04 image our web app uses. Just know that the image is fairly large (around 17.5 GB uncompressed), so it’s less ideal for local testing.

The image defaults to running actions as the `ubuntu` user and is designed to work with network services provided by Docker Compose.

Here’s a [list of languages and tools]({{site.baseurl}}/1.0/build-images-2-0/) included in the image.

\*For now. The idea of a monolithic build image doesn’t fit well with the ethos of CircleCI 2.0, so we will eventually deprecate it.

## How do Docker image names work? Where do they come from?

CircleCI 2.0 currently supports pulling (and pushing with Docker Engine) Docker images from [Docker Hub][docker-hub]. For [official images][docker-library], you can pull by simply specifying the name of the image and a tag:

```
golang:1.7.1
redis:3.0.7
```

For public images on Docker Hub, you can pull the image by prefixing the account/team username:

```
myUsername/couchdb:1.6.1
```

## Can I use the `latest` tag when specifying image versions?

You _can_, but please don’t. The `latest` tag is mutable and doesn’t always refer to a consistent image SHA. CircleCI runs on a fleet of machines, so a mutable tag could be improperly cached. In that case, re-running a build wouldn’t be deterministic.

The `latest` tag is the most infamous example, but other mutable tags like `master`, have the same problem. You can read more about the issue [here](http://container-solutions.com/docker-latest-confusion/).

Instead, we recommend choosing a specific tag. This guarantees that you are using the same version of the container image.

## I updated my Docker image, but my build is using a cached image. How can I invalidate the old image?

We don’t currently provide a way to invalidate cached Docker images. One way around this is to use image tags.

If you’re running a build on `my-image:123` and you update the image, you can use a new tag to force a cache refresh. In this example, you could change the tag to `my-image:456` and choose that image in `config.yml`.

## Why do I see `fork/exec /bin/bash: no such file or directory` when I try to run a `type: shell` command before `checkout`?

You’re seeing this because CircleCI 2.0 is trying to `cd` to your `workDir` for the `type: shell` command. Since `workDir` is normally created by the `checkout` step, CircleCI won’t be able to find it.

You can override this behavior with a `pwd` attribute on your `type: shell` step. If your command expects `workDir` to exist, then you’ll need to create it with `mkdir -p`.

[docker-hub]: https://hub.docker.com
[docker-library]: https://hub.docker.com/explore/
