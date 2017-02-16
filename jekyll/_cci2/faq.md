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

## The `latest` tag

**Please do not use the `latest` tag.** Instead, see how we recommend [specifying image versions](#what-is-the-recommended-way-to-specify-image-versions).

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

### Why do I see `fork/exec /bin/bash: no such file or directory` when I try to run a `type: shell` command before `checkout`?

This error message comes from Picard running a `cd` to your `workDir`, which is normally created by the `checkout` step. You can override this behavior with a `pwd` attribute on your `type: shell` step. If your command expects `workDir` to exist, then you will have to create it with `mkdir -p`.

### My project is running on CircleCI 2.0, but the build appears to be frozen. What happened?

Cancel the build and double check the syntax of `circle.yml`. There's a strong possibility that there's an error. Check for proper indents and make sure that all stages and steps have the required keys.

### Why isn't "Rebuild with SSH" working?

SSH builds aren't yet supported.

### I updated my Docker image, but my build is using a cached image. How can I invalidate the old image?

At this moment, we don't provide a way to invalidate cached Docker images. Instead, we encourage you to use image tags.

For example, say you're running a build on `my-image:123`, and the image is cached in our infrastructure. You update `my-image` and want to use that new image in the next build.

To do this, you can use a different tag, like `my-image:456`, and specify that image in your `circle.yml`.

### What is the recommended way to specify image versions?

Generally, it's a bad idea to use the `latest` tag of a Docker image in any case. Using a specific tag guarantees that you are using the same version of the container image.

More broadly, we advise against using mutable tags because they don’t reliably refer to the same image SHA. `latest` is the most common example, but users have run into issues with branch name tags like `master`.  One thing to keep in mind is that CircleCI runs on a fleet of machines.  A mutable tag can be cached differently by different machines, so that re-running a build might cause it to run on different images.

For more information on why we don't recommend `latest`, check out these blog posts:

http://container-solutions.com/docker-latest-confusion/
https://medium.com/@mccode/the-misunderstood-docker-tag-latest-af3babfd6375#.vqq49cw67

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

### My company is currently using CircleCI Enterprise, can we use CircleCI 2.0 right now?

CircleCI 2.0 features will be available behind your firewall after our launch on CircleCI.com. To be on the beta list for CircleCI Enterprise 2.0 please contact <mailto:enterprise@circleci.com>.



[docker-hub]: https://hub.docker.com
[docker-library]: https://hub.docker.com/explore/