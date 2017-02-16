---
layout: classic-docs
title: "Frequently Asked Questions"
short-title: "FAQ"
categories: [getting-started]
---

## Does CircleCI 2.0 run inference commands?

No, CircleCI 2.0 does not infer anything from your project.

This means that no commands are run automatically. Don’t assume that a particular library/package is available unless it is bundled with the Docker image you are using!

## Can I use CircleCI 2.0 without creating base images?

Yes, you can use* one of ours!

The `circleci/build-image:ubuntu-14.04-XL-922-9410082` image has the same content as the Ubuntu Trusty 14.04 image our web app uses. Just know that the image is fairly large (around 17.5 GB uncompressed), so it’s less ideal for local testing.

The image defaults to running actions as the `ubuntu` user and is designed to work with network services provided by Docker Compose.

Here’s a [list of languages and tools](https://circleci.com/docs/build-images-2-0/) included in the image.

\*For now. The idea of a monolithic build image doesn’t fit well with the ethos of CircleCI 2.0, so we will eventually deprecate it.

## Can I use the `latest` tag when specifying image versions?

You _can_, but please don’t. The `latest` tag is a mutable tag and doesn’t always refer to a consistent image SHA. CircleCI runs on a fleet of machines, so the mutable tag could be cached improperly. In that case, re-running a build wouldn’t be deterministic.

The `latest` tag is the most infamous example, but other mutable tags like `master`, have the same problem. You can read more about the issue [here](http://container-solutions.com/docker-latest-confusion/).

Instead, we recommend choosing a specific tag. This guarantees that you are using the same version of the container image. You can read more about specifying image versions [here](#what-is-the-recommended-way-to-specify-image-versions).

## Why do I see `fork/exec /bin/bash: no such file or directory` when I try to run a `type: shell` command before `checkout`?

You’re seeing this because CircleCI 2.0 is trying to `cd` to your `workDir` for the `type: shell` command. Since `workDir` is normally created by the `checkout` step, CircleCI won’t be able to find it.

You can override this behavior with a `pwd` attribute on your `type: shell` step. If your command expects `workDir` to exist, then you’ll need to create it with `mkdir -p`.

## My project is running on CircleCI 2.0, but the build is frozen!

Builds often freeze due to syntax errors in `circle.yml`. Cancel build and check your `circle.yml` for proper indents and ensure that all stages/steps have the required keys.

## I updated my Docker image, but my build is using a cached image. How can I invalidate the old image?

We don’t currently provide a way to invalidate cached Docker images. One way around this is to use image tags.

If you’re running a build on `my-image:123` and you update the image, you can use a new tag to force a cache refresh. In this example, you could change the tag to `my-image:456` and choose that image in `circle.yml`.

### How do Docker image names work? Where do they come from?

CircleCI 2.0 currently supports pulling (and pushing with Docker Engine) Docker images from [Docker Hub][docker-hub]. For images that are a part of the [Docker Library][docker-library] (official images), you can pull by simply specifying the name of the image and a tag:

```
golang:1.7.1
redis:3.0.7
```

For public images on Docker Hub created by users including yourself, you can pull the image by prefixing the account/team username:

```
myUsername/couchdb:1.6.1
```


## Running bash in login shell mode when using shell steps

One final note: when you use shell steps, we recommend running bash in login shell mode. Images rely heavily on “rc” files, but running `shell: /bin/bash` will invoke bash in a non-interactive mode which won’t load "rc" files.

```
steps:
  - type: shell
    shell: /bin/bash --login # Good! :)
    command: rvm --version

steps:
  - type: shell
    shell: /bin/bash # Bad :(
    command: rvm --version # This will get "bash: rvm: command not found" error
```

In the short term, we’ll be using equivalent shell commands and will post equivalent snippets as we receive requests.



[docker-hub]: https://hub.docker.com
[docker-library]: https://hub.docker.com/explore/