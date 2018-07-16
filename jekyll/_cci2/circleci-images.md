---
layout: classic-docs
title: "Pre-Built CircleCI Docker Images"
short-title: "Pre-Built CircleCI Docker Images"
description: "Listing of available images maintained by CircleCI"
categories: [containerization]
order: 20
---
*[Reference]({{ site.baseurl }}/2.0/reference/) > Pre-Built CircleCI Docker Images*

This document provides information about pre-built CircleCI images and a listing by language, service type, and tags in the following sections:

* TOC
{:toc}

## Overview

For convenience,
CircleCI maintains several Docker images.
These images are extensions of official Docker images
and include tools that are especially useful for CI/CD.
All of these pre-built images are available in the [CircleCI org on Docker Hub](https://hub.docker.com/r/circleci/).
The source code for these images is [available on GitHub](https://github.com/circleci/circleci-images).
Dockerfiles for these images are also [available on GitHub](https://github.com/circleci-public/circleci-dockerfiles).

For a brief overview,
watch the video below.

<div class="video-wrapper">
    <iframe width="560" height="315" src="https://www.youtube.com/embed/PgIwBzXBn7M" frameborder="0" allowfullscreen></iframe>
</div>

## Image Types

CircleCI's pre-built Docker images fall into two categories:
**language** images and **service** images.
All images add a `circleci` user as a system user.

### Language Images

Language images are images for common programming languages,
along with some common [pre-installed tools](#pre-installed-tools).
A language image should be listed first under the `docker` key in your configuration,
thus becoming the [primary container]({{ site.baseurl }}/2.0/glossary/#primary-container){:target="_blank"} during execution.

CircleCI maintains images for the languages below.

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

If your language is not listed,
CircleCI also maintains a wizard you can use to create a custom image.
See the [Dockerfile Wizard]({{ site.baseurl }}/2.0/custom-images/#circleci-dockerfile-wizard) section of the Using Custom-Built Docker Images document for instructions.

**Note:**
The above images are based on the **most current** upstream images for their respective languages.
Because the latest images are more likely to change,
it is best practice to use a more specific tag.
For more details,
see the [Customizing a Convenience Image](#customizing-a-convenience-image) section.

### Service Images

Service images are images for services like databases.
These images should be listed **after** language images
so they become secondary service containers.

CircleCI maintains images for the services below.

- [buildpack-deps](#buildpack-deps)
- [MariaDB](#mariadb)
- [MongoDB](#mongodb)
- [MySQL](#mysql)
- [PostgreSQL](#postgresql)

## Pre-installed Tools

All convenience images have been extended with additional tools.

The following packages are installed with `apt-get` on every image:

- [bzip2](https://packages.debian.org/stretch/bzip2)
- [ca-certificates](https://packages.debian.org/stretch/ca-certificates)
- [curl](https://packages.debian.org/stretch/curl)
- [git](https://packages.debian.org/stretch/git)
- [gnupg](https://packages.debian.org/stretch/gnupg)
- [gzip](https://packages.debian.org/stretch/gzip)
- [locales](https://packages.debian.org/stretch/locales)
- [mercurial](https://packages.debian.org/stretch/mercurial)
- [net-tools](https://packages.debian.org/stretch/net-tools)
- [netcat](https://packages.debian.org/stretch/netcat)
- [openssh-client](https://packages.debian.org/stretch/openssh-client)
- [parallel](https://packages.debian.org/stretch/parallel)
- [sudo](https://packages.debian.org/stretch/sudo)
- [tar](https://packages.debian.org/stretch/tar)
- [unzip](https://packages.debian.org/stretch/unzip)
- [wget](https://packages.debian.org/stretch/wget)
- [xvfb](https://packages.debian.org/stretch/xvfb)
- [zip](https://packages.debian.org/stretch/zip)

The following packages are installed via `curl` or other means:

- [Docker client](https://docs.docker.com/install/)
- [Docker Compose](https://docs.docker.com/compose/overview/)
- [dockerize](https://github.com/jwilder/dockerize)
- [jq](https://stedolan.github.io/jq/)

## Customizing a Convenience Image

You can customize convenience images by adding image tags.
There are three good reasons to do this:

- You want to pin an image to a certain version or operating system (OS).
- You want to specify a particular instance of an image with a SHA.
- You want to modify an image by installing additional tools
or changing the behavior of the image.

### Pinning an Image Version or OS

Since convenience images are based on the **latest** versions of upstream images,
it is best practice
to use the most specific image possible.
This prevents the upstream image
from introducing unintended changes to your image.

For example,
instead of `circleci/golang:latest`,
consider using `circleci/golang:1.8.6-jessie`.
Since the second image specifies both the version and OS,
it is less likely to change unexpectedly.

See below for a list of the [Latest Image Tags by Language](#latest-image-tags-by-language).

**Note:**
Excluding the [variants below](#changing-the-tools-and-behavior-of-an-image),
CircleCI does not control which tags are used.
These tags are chosen and maintained by upstream projects.
Do not assume
that a given tag has the same meaning across images!

### Specifying a Past Image Build With a SHA

You can also use a SHA
to specify a particular instance of an image.

To find a SHA,
go to the CircleCI application
and choose a past build
that used the same image.
On the **Test Summary** tab,
click the **Spin up environment** step.
In the log output,
locate the sha256 for the appropriate image.

Look for something like the example below.

```
circleci/ruby@sha256:df1808e61a9c32d0ec110960fed213ab2339451ca88941e9be01a03adc98396e
```

### Changing the Tools and Behavior of an Image

CircleCI maintains several variants for convenience images.
You can use these variants
by adding the following suffixes to the end of image tags.

For language images:

- `-node` includes Node.js for polyglot applications
- `-browsers` includes Java 8, PhantomJS, Firefox, and Chrome
- `-node-browsers` combines the `-node` and `-browsers` variants

For service images:

- `-ram` uses the RAM volume to speed up builds

## Latest Image Tags by Language

Below is a list of the latest image tags, sorted by language.

For details about the contents of each image,
refer to the [corresponding Dockerfiles](https://github.com/circleci-public/circleci-dockerfiles).

{% assign images = site.data.docker-image-tags | sort %}
{% for image in images %}

### {{ image[1].name }}

**Usage:** Add the following under `docker:` in your config.yml:  

`- image: circleci/{{ image[0] }}:[TAG]`

**Latest Tags:** <small>(view more available tags on [Docker Hub](https://hub.docker.com/r/circleci/{{ image[0] }}/tags/))</small>

<ul class="list-2cols">
{% assign tags = image[1].tags | sort %}
{% for tag in tags %}
<li>{{ tag }}</li>
{% endfor %}
</ul>

---

{% endfor %}

## See Also

See [Using Private Images]({{ site.baseurl }}/2.0/private-images/) for information about how to authorize your build to use an image in a private repository or in Amazon ECR.
