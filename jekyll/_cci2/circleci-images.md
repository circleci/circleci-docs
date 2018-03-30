---
layout: classic-docs
title: "Pre-Built CircleCI Docker Images"
short-title: "Pre-Built CircleCI Docker Images"
description: "Listing of available images maintained by CircleCI"
categories: [containerization]
order: 20
---
*[Reference]({{ site.baseurl }}/2.0/reference/) > Pre-Built CircleCI Docker Images*

For convenience, CircleCI maintains several Docker images. These images are extensions of official Docker images and include tools that are especially useful for CI/CD. All of these pre-built images are available in the [CircleCI org on Docker Hub](https://hub.docker.com/r/circleci/). The source code for these images is available at [github.com/circleci/circleci-images](https://github.com/circleci/circleci-images). Dockerfiles for each CircleCI image variant are archived at [github.com/circleci-public/circleci-dockerfiles](https://github.com/circleci-public/circleci-dockerfiles).

## Image Types

CircleCI's pre-built Docker images fall into two categories: **language** images and **service** images. All images add a `circleci` user as a system user.

### Language Images

Language images are images for common programming languages, along with some common [pre-installed tools](#pre-installed-tools). A language image should be listed first under the `docker` key in your configuration, thus becoming the [primary container]({{ site.baseurl }}/2.0/glossary/#primary-container){:target="_blank"} during execution.

CircleCI maintains language images for the following languages:

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

### Service Images

Service images are images for services like databases. These images should be listed _after_ language images so they become secondary service containers.

CircleCI maintains service images for the following services:

- [buildpack-deps](#buildpack-deps)
- [MariaDB](#mariadb)
- [MongoDB](#mongodb)
- [MySQL](#mysql)
- [PostgreSQL](#postgresql)

## How to Get Started with Pre-Built Docker Images Video Tutorial
<div class="video-wrapper">
    <iframe width="560" height="315" src="https://www.youtube.com/embed/PgIwBzXBn7M" frameborder="0" allowfullscreen></iframe>
</div>

## Pre-installed Tools

All convenience images have been extended with additional tools.

### APT Packages

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

### Other Packages

The following packages are installed via `curl` or other means:

- [Docker client](https://docs.docker.com/install/)
- [Docker Compose](https://docs.docker.com/compose/overview/)
- [dockerize](https://github.com/jwilder/dockerize)
- [jq](https://stedolan.github.io/jq/)

## Image Variants

CircleCI maintains variants of convenience images. These can be created by adding optional suffixes to the end of image tags.

**Note:** If you choose to use the `latest` tag, the image may change unexpectedly and create surprising results.

### Language Image Variants

- `-node`: includes Node.js for polyglot applications
- `-browsers`: includes Java 8, PhantomJS, Firefox, and Chrome
- `-node-browsers`: a combination of the `-node` and `-browsers` variants

### Service Image Variants

- `-ram`: variants that use the RAM volume to speed up builds

<hr>

{% assign images = site.data.docker-image-tags | sort %}
{% for image in images %}

### {{ image[1].name }} 

**Usage:** Add the following under `docker:` in your config.yml:  

`- image: circleci/{{ image[0] }}:[TAG]`

**Latest Tags:** <small>(view all available tags on [Docker Hub](https://hub.docker.com/r/circleci/{{ image[0] }}/tags/))</small>

<ul class="list-2cols">
{% assign tags = image[1].tags | sort %}
{% for tag in tags %}
<li>{{ tag }}</li>
{% endfor %}
</ul>

---

{% endfor %}
