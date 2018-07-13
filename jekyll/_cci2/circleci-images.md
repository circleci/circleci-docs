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
Dockerfiles for these images are also [archived on GitHub](https://github.com/circleci-public/circleci-dockerfiles).

For a brief overview,
watch the video below.

<div class="video-wrapper">
    <iframe width="560" height="315" src="https://www.youtube.com/embed/PgIwBzXBn7M" frameborder="0" allowfullscreen></iframe>
</div>

## Best Practices

CircleCI bases pre-built images off of upstream, for example, `circleci/ruby:2.4-node` is based off the most up to date version of the Ruby 2.4-node container, similar to using `:latest`. It is best practice to lock down aspects of your build container, by specifying an additional tag to pin down the image in your configuration.

That is, to prevent unintended changes that come from upstream, instead of using `circleci/ruby:2.4-node` use a more specific version of these containers to ensure the image does not change with upstream changes until you change the tag.

For example, add `-jessie` or `-stretch` to the end of each of those containers to ensure you're only using that base OS. You can pin down those images to a specific point version, like `circleci/ruby:2.3.7-jessie`, or you can just specify the OS version, with `circleci/ruby:2.3-jessie`. This is possible for any of the CircleCI images. 

It is also possible to specify all the way down to the specific SHA of the image you want to use. Doing so allows you to test specific images for as long as you like before making any changes. To find the value, navigate to on older Build page in the CircleCI app that utilized the image you wish to use and select the drop-down for `Spin up Environment`. Inside you will find the SHA256, for example, 
`circleci/ruby@sha256:df1808e61a9c32d0ec110960fed213ab2339451ca88941e9be01a03adc98396e`. 

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
The above images use the **most current** version of the upstream image.
Because the latest images are often less stable,
it is best practice to use a more specific tag.
For more details,
see the [Latest Image Tags by Language](#latest-image-tags-by-language).

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

## Image Variants

CircleCI maintains several variants for convenience images.
These can be created by adding optional suffixes to the end of image tags.

**Note:**
If you choose to use the `latest` tag,
the image may change unexpectedly
and create surprising results.

### Language Image Variants

- `-node`: includes Node.js for polyglot applications
- `-browsers`: includes Java 8, PhantomJS, Firefox, and Chrome
- `-node-browsers`: a combination of the `-node` and `-browsers` variants

### Service Image Variants

- `-ram`: variants that use the RAM volume to speed up builds

## Latest Image Tags by Language

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


