---
layout: classic-docs
title: "Convenience Images"
description: "Listing of available Docker images maintained by CircleCI"
version:
- Cloud
- Server v4.x
- Server v3.x
- Server v2.x
---


**Legacy images with the prefix "circleci/" were [deprecated](https://discuss.circleci.com/t/legacy-convenience-image-deprecation/41034)** on December 31, 2021. For faster builds, upgrade your projects with [next-generation convenience images](https://circleci.com/blog/announcing-our-next-generation-convenience-images-smaller-faster-more-deterministic/).
{: class="alert alert-warning"}

This document provides information about convenience images (pre-built Docker images maintained by CircleCI) and a listing by language, service type, and tags.

* TOC
{:toc}

## Overview
{: #overview }
{:.no_toc}

For convenience, CircleCI maintains several Docker images. These images are
typically extensions of official Docker images, and include tools especially
useful for CI/CD.

This document provides an overview of best practices when using a convenience image. Please note that we advise using the **next-generation** convenience images (these start `cimg/`) rather than **legacy images**, as explained below.

If you would like to directly search for an image, you can browse CircleCI Docker images in the following locations:

- Visit the [Developer Hub](https://circleci.com/developer/images/) for links to all the repositories for each next-gen image.
- Find all CircleCI pre-built images available on [Docker Hub](https://hub.docker.com/u/cimg).
- Visit the `circleci-images` GitHub repo for the [source code for the legacy CircleCI Docker images](https://github.com/circleci/circleci-images).

_**Note:** CircleCI occasionally makes scheduled changes to images to fix bugs or
otherwise improve functionality, and these changes can sometimes affect
how images work in CircleCI jobs. Please follow the [**convenience-images** tag on
Discuss](https://discuss.circleci.com/tags/convenience-images) to be notified in advance of scheduled maintenance._

### Examples
{: #examples }
{:.no_toc}

Refer to the [Examples and Guides Overview]({{ site.baseurl }}/examples-and-guides-overview/) for examples of using pre-built CircleCI Docker Images in a demo application.

## Next-generation convenience images
{: #next-generation-convenience-images }

The next-generation convenience images in this section were built from the ground up with CI, efficiency, and determinism in mind. Here are some of the highlights:

**Faster spin-up time** - In Docker terminology, these next-gen images will generally have fewer and smaller layers. Using these new images will lead to faster image downloads when a build starts, and a higher likelihood that the image is already cached on the host.

**Improved reliability and stability** - The existing legacy convenience images are
rebuilt practically every day with potential changes from upstream that we cannot
always test fast enough. This leads to frequent breaking changes, which is not
the best environment for stable, deterministic builds. Next-gen images will only
be rebuilt for security and critical-bugs, leading to more stable and
deterministic images.

### CircleCI base image
{: #circleci-base-image }
Using the `base` image in your config looks like the example shown below:

```yaml
  myjob:
    docker:
      - image: cimg/base:2021.04
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
```

This is a brand new Ubuntu-based image designed to install the bare minimum. The
next-generation convenience images are based on this image.

**When to use it?**

If you need a generic image to run on CircleCI, to use with orbs, or to use as a
base for your own custom Docker image, this image is for you.

**Resources**

You can find more config examples for this image on the [Developer Hub](https://circleci.com/developer/images/image/cimg/base), and the source code and documentation on [GitHub](https://github.com/CircleCI-Public/cimg-base).

The example below demonstrates how to use the next-gen Go image, which is based off the `base` image above.

```yaml
  myjob:
    docker:
      - image:  cimg/go:1.16
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
```

This is a direct replacement for the legacy CircleCI Go image (`circleci/golang`). Note, the Docker Hub namespace is `cimg`. You can view other next generation images for other languages [below](#next-gen-language-images).


## Best practices
{: #best-practices }

The next-gen convenience images in the following sections are based on the most recent Ubuntu LTS Docker images and installed with the base libraries for the language or services, so it is best practice to use the most specific image possible. This makes your builds more deterministic by preventing an upstream image from introducing unintended changes to your image.

That is, to prevent unintended changes that come from upstream, instead of using `cimg/ruby:2.4-node` use a more specific version of these containers to ensure the image does not change with upstream changes until you change the tag.

For example, pin down those images to a specific point version, like `cimg/ruby:2.4.10-node`. Specifying the version is possible for any of the CircleCI images.

It is also possible to use the specific SHA of a image. For example, you can use
`cimg/ruby@sha256:e4aa60a0a47363eca3bbbb066620f0a5967370f6469f6831ad52231c87ca9390`
instead of `cimg/ruby:2.4.10-node`. Doing so allows you to test specific images
for as long as you would like before making any changes.


### Notes on pinning images
{: #notes-on-pinning-images }

It is not recommended that you use the SHA for extended periods of time. If there is a major bug or security issue that requires a rebuild of the image, your pipeline's dependency on the image could inhibit you from acquiring the update that fixes that bug or patches a security issue.
{: class="alert alert-warning"}

**Note:** If you are using a legacy image and you do not specify a tag, Docker
applies the `latest` tag. The `latest` tag refers to the most recent stable
release of an image. However, since this tag may change unexpectedly, it is best
practice to add an explicit image tag.

**Note:** For Node.js variant Docker images (tags that end in `-node`) the LTS
release of Node.js is pre-installed. If you would like to include your own
specific version of Node.js / NPM you can set it up in a series of `run` steps
in your `.circleci/config.yml`. Consider the example below, which installs a
specific version of Node.js alongside the Ruby image.

```yaml
version: 2.1

jobs:
  build:
    docker:
      - image: cimg/ruby:2.7.1-node
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run:
          name: "Update Node.js and npm"
          command: |
            curl -sSL "https://nodejs.org/dist/v11.10.0/node-v11.10.0-linux-x64.tar.xz" | sudo tar --strip-components=2 -xJ -C /usr/local/bin/ node-v11.10.0-linux-x64/bin/node
            curl https://www.npmjs.com/install.sh | sudo bash
      - run:
          name: Check current version of node
          command: node -v
```

#### Finding an image id
{: #finding-an-image-id }
{:.no_toc}

Follow these steps to find your docker image id:

1. In the CircleCI application, navigate to the job in your pipeline for which you would like to know the docker image.
2. Toggle open the **Spin up environment** step.
3. In the log output, locate the digest for the image.
4. Add the image ID to the image name as shown below.

```
cimg/python@sha256:bdabda041f88d40d194c65f6a9e2a2e69ac5632db8ece657b15269700b0182cf
```

## Image types
{: #image-types }

CircleCI's convenience images fall into two categories: **language** images and
**service** images. All images add a `circleci` user as a system user. The sections below will walk through the available next-generation and legacy images.

### Next-gen language images
{: #next-gen-language-images }
{:.no_toc}

Like the legacy images, the next-gen language images are convenience images for common programming languages.
These images include both the same relevant language and [commonly-used tools](#pre-installed-tools).
A language image should be listed first under the `docker` key in your configuration,
making it the [primary container]({{ site.baseurl }}/glossary/#primary-container){:target="_blank"} during execution.

CircleCI is developing next-gen images for the languages below.

- [Elixir](https://circleci.com/developer/images/image/cimg/elixir)
- [Go (Golang)](https://circleci.com/developer/images/image/cimg/go)
- [Node.js](https://circleci.com/developer/images/image/cimg/node)
- [OpenJDK (Java)](https://circleci.com/developer/images/image/cimg/openjdk)
- [PHP](https://circleci.com/developer/images/image/cimg/php)
- [Python](https://circleci.com/developer/images/image/cimg/python)
- [Ruby](https://circleci.com/developer/images/image/cimg/ruby)
- [Rust](https://circleci.com/developer/images/image/cimg/rust)

If your language is not listed, feel free to request an image on our [Ideas
Board](https://ideas.circleci.com/). First, check to see if that "idea" is
already on CircleCI Ideas. If it is, up-vote it. If not, create it and set the
category as "images". Finally, go and market your "idea" to friends, co-workers,
forums, and other communities in order to help it build traction.

If we see an idea on the board take off, we'll consider building it officially.

#### Next-gen language image variants
{: #next-gen-language-image-variants }
{:.no_toc}

CircleCI maintains several variants for the next-gen language image. For
next-gen images be sure to check each image listing for information on each
variant. The `-browsers` variant for next-gen images is still in progress. See
each image listing on the [Developer Hub](https://circleci.com/developer/images/)
for details on which variants it supports.

### Legacy language images
{: #legacy-language-images }
{:.no_toc}

The legacy language images are convenience images for common programming languages.
These images include both the relevant language and [commonly-used tools](#pre-installed-tools).
A language image should be listed first under the `docker` key in your configuration,
making it the [primary container]({{ site.baseurl }}/glossary/#primary-container){:target="_blank"} during execution.

CircleCI maintains legacy images for the languages below.

- [Android](#android)
- [Clojure](#clojure)
- [Elixir](#elixir)
- [Go (Golang)](#go-golang)
- [JRuby](#jruby)
- [Node.js](#nodejs)
- [OpenJDK (Java)](#openjdk)
- [PHP](#php)
- [Python](#python)
- [Ruby](#ruby)
- [Rust](#rust)

#### Language image variants
{: #language-image-variants }
{:.no_toc}

CircleCI maintains several variants for language images. To use these variants,
add one of the following suffixes to the end of an image tag.

- `-node` includes Node.js for polyglot applications
- `-browsers` includes Chrome, Firefox, OpenJDK v11, and Geckodriver
- `-node-browsers` combines the `-node` and `-browsers` variants

For example, if you want to add browsers to the `circleci/golang:1.9` image, use
the `circleci/golang:1.9-browsers` image.

### Next-Gen Service images
{: #next-gen-service-images }
{:.no_toc}

Service images are convenience images for services like databases. These images should be listed **after** language images so they become secondary service containers.

- [Postgres](https://circleci.com/developer/images/image/cimg/postgres)
- [MySQL](https://circleci.com/developer/images/image/cimg/mysql)
- [MariaDB](https://circleci.com/developer/images/image/cimg/mariadb)
- [Redis](https://circleci.com/developer/images/image/cimg/redis)

### Legacy Service images
{: #legacy-service-images }
{:.no_toc}

CircleCI maintains legacy images for the services below.

- [buildpack-deps](#buildpack-deps)
- [DynamoDB](#dynamodb)
- [MariaDB](#mariadb)
- [MongoDB](#mongodb)
- [MySQL](#mysql)
- [PostgreSQL](#postgresql)
- [Redis](#redis)

#### Service image variant
{: #service-image-variant }
{:.no_toc}

CircleCI maintains only one variant for service images. To speed up builds using
RAM volume, add the `-ram` suffix to the end of a service image tag.

For example, if you want the `circleci/postgres:9.5-postgis` image to use RAM
volume, use the `circleci/postgres:9.5-postgis-ram` image.

### Next-gen service images
{: #next-gen-service-images }
{:.no_toc}

CircleCI is working on adding next-gen service convenience images.
Checkout CircleCI's [Developer Hub](https://circleci.com/developer/images/) for the latest available service images.

## Pre-installed tools
{: #pre-installed-tools }

All convenience images have been extended with additional tools, installed with `apt-get`:

- `bzip2`
- `ca-certificates`
- `curl`
- `git`
- `gnupg`
- `gzip`
- `locales`
- `mercurial` (legacy images only)
- `net-tools`
- `netcat`
- `openssh-client`
- `parallel`
- `sudo`
- `tar`
- `unzip`
- `wget`
- `xvfb` (legacy images only)
- `zip`

The specific version of a particular package that gets installed in a particular
CircleCI image variant depends on the default version included in the package
directory for the Linux distribution/version installed in that variant's base
image. The legacy CircleCI convenience images are [Debian Jessie](https://packages.debian.org/jessie/)-
or [Stretch](https://packages.debian.org/stretch/)-based images,
however the next-gen images, `cimg`, extend the official [Ubuntu](https://packages.ubuntu.com) image.
For details on the next-gen images, see the [Developer Hub](https://circleci.com/developer/images/). Each image is tracked in its own repository.

The following packages are installed via `curl` or other means.

- [Docker client](https://docs.docker.com/install/)
- [Docker Compose](https://docs.docker.com/compose/overview/)
- [dockerize](https://github.com/jwilder/dockerize)
- [jq](https://stedolan.github.io/jq/)


## Out of scope
{: #out-of-scope }

1. If an image is not listed above, it is not available. As the Convenience Image
   program is revamped, proposals for new images are not currently being
   accepted.
1. Old versions of software will not be rebuilt. Once an upstream image stops
   building the tag for a specific release, say Node.js v8.1.0, then we stop
   building it too. This means other tools in that image, such as `npm` in this
   example, will no longer be updated either.
1. We do not support building preview, beta, or release candidate images tags. On
   occasion they will be available but these tags tend to cause our build system
   for Convenience Images to fail. If you need a non-stable release of a
   language, we suggest installing it via [an orb](https://circleci.com/orbs/)
   or a custom Docker image instead.

## Legacy image tags by language
{: #legacy-image-tags-by-language }

Below is a list of the latest **legacy** convenience images, sorted by language.


It is recommended to use next-generation images when possible.
For a list of the latest next-gen convenience images and
details about the content of each image, visit
the [Developer Hub](https://circleci.com/developer/).
{: class="alert alert-warning"}

**Note:** Excluding [language image variants](#language-image-variants) and [the
service image variant](#service-image-variant), **for legacy images** CircleCI
does **not** control which tags are used. These tags are chosen and maintained
by upstream projects. Do not assume that a given tag has the same meaning across
images!

{% assign images = site.data.docker-image-tags | sort %}
{% for image in images %}

### {{ image[1].name }}
{: # {{image1name}} }
{:.no_toc}

**Resources:**

- [Docker Hub](https://hub.docker.com/r/circleci/{{ image[0] }}) - where this image is hosted as well as some useful instructions.

**Usage:** Add the following under `docker:` in your config.yml:

`- image: circleci/{{ image[0] }}:[TAG]`

**Recent Tags:**

See [the tag list for circleci/{{ image[0] }} on Docker Hub](https://hub.docker.com/r/circleci/{{ image[0] }}/tags?ordering=last_updated).

---

{% endfor %}

## See also
{: #see-also }
{:.no_toc}

- See [Using Docker Authenticated Pulls]({{ site.baseurl }}/private-images/) for information about how to authorize your build to use an image in a private repository or in Amazon ECR.
- For information about macOS images for iOS, see ({{ site.baseurl }}/testing-ios/).
- See [Running Docker Commands]({{ site.baseurl }}/building-docker-images/) for information about how to build Docker images.
