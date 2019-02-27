---
layout: classic-docs
title: "Pre-Built CircleCI Docker Images"
short-title: "Pre-Built CircleCI Docker Images"
description: "Listing of available images maintained by CircleCI"
categories: [containerization]
order: 20
---

This document provides information about pre-built CircleCI images and a listing by language, service type, and tags in the following sections:

* TOC
{:toc}

## Overview
{:.no_toc}

For convenience,
CircleCI maintains several Docker images.
These images are typically extensions of official Docker images
and include tools especially useful for CI/CD.
All of these pre-built images are available in the [CircleCI org on Docker Hub](https://hub.docker.com/r/circleci/).
Visit the `circleci-images` GitHub repo for the [source code for the CircleCI Docker images](https://github.com/circleci/circleci-images).
Visit the `circleci-dockerfiles` GitHub repo for the [Dockerfiles for the CircleCI Docker images](https://github.com/circleci-public/circleci-dockerfiles).

_**Note:** CircleCI occasionally makes scheduled changes to images to fix bugs or otherwise improve functionality, and these changes can sometimes cause affect how images work in CircleCI jobs. Please follow the [**convenience-images** tag on Discuss](https://discuss.circleci.com/tags/convenience-images) to be notified in advance of scheduled maintenance._

## Best Practices

Convenience images are based on the most recently built versions of upstream images, so it is best practice to use the most specific image possible. This makes your builds more deterministic by preventing an upstream image from introducing unintended changes to your image.

CircleCI bases pre-built images off of upstream, for example, `circleci/ruby:2.4-node` is based off the most up to date version of the Ruby 2.4-node container. Using `circleci/ruby:2.4-node` is similar to using `:latest`. It is best practice to lock down aspects of your build container by specifying an additional tag to pin down the image in your configuration.

That is, to prevent unintended changes that come from upstream, instead of using `circleci/ruby:2.4-node` use a more specific version of these containers to ensure the image does not change with upstream changes until you change the tag.

For example, add `-jessie` or `-stretch` to the end of each of those containers to ensure you’re only using that version of the Debian base OS. Pin down those images to a specific point version, like `circleci/ruby:2.3.7-jessie`, or specify the OS version with `circleci/ruby:2.3-jessie`. Specifying the version is possible for any of the CircleCI images.

It is also possible to specify all the way down to the specific SHA of the image you want to use. Doing so allows you to test specific images for as long as you like before making any changes.

There are two ways
to make an image more specific:

- Use a tag
to pin an image to a version or operating system (OS).
- Use a Docker image ID
to pin an image to a fixed version.

**NOTE:** For docker images that have `-node` (Node.js) included in the container, the latest LTS
version of Node is used. If you would like to include your own specific version of
Node.js / NPM you can do so as a `run` step in your `.circleci/config.yml`.

### Using an Image Tag to Pin an Image Version or OS
{:.no_toc}

You can pin aspects of a Docker image
by adding an [image tag](https://docs.docker.com/engine/reference/commandline/tag/#extended-description).

For example,
instead of `circleci/golang`,
specify the version and OS
by using `circleci/golang:1.8.6-jessie`.
Because the second image specifies a version and OS,
it is less likely
to change unexpectedly.

See below for a list of the [Latest Image Tags by Language](#latest-image-tags-by-language).

**Note:**
If you do not specify a tag,
Docker applies the `latest` tag.
The `latest` tag refers to the most recent stable release of an image.
However,
since this tag may change unexpectedly,
it is best practice
to add an explicit image tag.

### Using a Docker Image ID to Pin an Image to a Fixed Version
{:.no_toc}

Every Docker image has a [unique ID](https://docs.docker.com/engine/reference/commandline/pull/#pull-an-image-by-digest-immutable-identifier).
You can use this image ID
to pin an image to a fixed version.

Each image ID is an immutable SHA256 digest
and looks like this:

```
sha256:df1808e61a9c32d0ec110960fed213ab2339451ca88941e9be01a03adc98396e
```

#### Finding an Image ID
{:.no_toc}

1. In the CircleCI application,
go to a past build
that used the image.
2. On the **Test Summary** tab,
click the **Spin up environment** step.
3. In the log output,
locate the digest for the image.
4. Add the image ID to the image name as shown below.

```
circleci/ruby@sha256:df1808e61a9c32d0ec110960fed213ab2339451ca88941e9be01a03adc98396e
```

## Image Types

CircleCI's convenience images fall into two categories:
**language** images and **service** images.
All images add a `circleci` user as a system user.

**Note:**
The images below are based on the most recently built upstream images for their respective languages.
Because the most recent images are more likely to change,
it is [best practice](#best-practices)
to use a more specific tag.

### Language Images
{:.no_toc}

Language images are convenience images for common programming languages.
These images include both the relevant language and [commonly-used tools](#pre-installed-tools).
A language image should be listed first under the `docker` key in your configuration,
making it the [primary container]({{ site.baseurl }}/2.0/glossary/#primary-container){:target="_blank"} during execution.

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
- [Rust](#rust)

If your language is not listed,
CircleCI also maintains a [Dockerfile Wizard](https://github.com/circleci-public/dockerfile-wizard)
you can use to create a custom image.

#### Language Image Variants
{:.no_toc}

CircleCI maintains several variants for language images.
To use these variants,
add one of the following suffixes to the end of an image tag.

- `-node` includes Node.js for polyglot applications
- `-browsers` includes Chrome, Firefox, Java 8, and Geckodriver
- `-browsers-legacy` includes Chrome, Firefox, Java 8, and PhantomJS
- `-node-browsers` combines the `-node` and `-browsers` variants
- `-node-browsers-legacy` combines the `-node` and `-browsers-legacy` variants

For example,
if you want
to add browsers to the `circleci/golang:1.9` image,
use the `circleci/golang:1.9-browsers` image.

### Service Images
{:.no_toc}

Service images are convenience images for services like databases.
These images should be listed **after** language images
so they become secondary service containers.

CircleCI maintains images for the services below.

- [buildpack-deps](#buildpack-deps)
- [DynamoDB](#dynamodb)
- [MariaDB](#mariadb)
- [MongoDB](#mongodb)
- [MySQL](#mysql)
- [PostgreSQL](#postgresql)
- [Redis](#redis)

#### Service Image Variant
{:.no_toc}

CircleCI maintains only one variant for service images.
To speed up builds
using RAM volume,
add the `-ram` suffix to the end of a service image tag.

For example,
if you want the `circleci/postgres:9.5-postgis` image
to use RAM volume,
use the `circleci/postgres:9.5-postgis-ram` image.

## Pre-installed Tools

All convenience images have been extended with additional tools.

With the exception of [Android images](https://hub.docker.com/r/circleci/android),
all images include the following packages, installed via `apt-get`:

- `bzip2`
- `ca-certificates`
- `curl`
- `git`
- `gnupg`
- `gzip`
- `locales`
- `mercurial`
- `net-tools`
- `netcat`
- `openssh-client`
- `parallel`
- `sudo`
- `tar`
- `unzip`
- `wget`
- `xvfb`
- `zip`

The specific version of a particular package
that gets installed in a particular CircleCI image variant
depends on the default version included in the package directory
for the Linux distribution/version installed in that variant's base image.
Most CircleCI convenience images are [Debian Jessie](https://packages.debian.org/jessie/)-
or [Stretch](https://packages.debian.org/stretch/)-based images,
however some extend [Ubuntu](https://packages.ubuntu.com)-based images.
For details on individual variants of CircleCI images, see the
[circleci-dockerfiles](https://github.com/circleci-public/circleci-dockerfiles) repository.

The following packages are installed via `curl` or other means.

- [Docker client](https://docs.docker.com/install/)
- [Docker Compose](https://docs.docker.com/compose/overview/)
- [dockerize](https://github.com/jwilder/dockerize)
- [jq](https://stedolan.github.io/jq/)

## Latest Image Tags by Language

Below is a list of the latest convenience images, sorted by language.
For details about the contents of each image,
refer to the [corresponding Dockerfiles](https://github.com/circleci-public/circleci-dockerfiles).

**Note:**
Excluding [language image variants](#language-image-variants) and [the service image variant](#service-image-variant),
CircleCI does **not** control which tags are used.
These tags are chosen and maintained by upstream projects.
Do not assume
that a given tag has the same meaning across images!

{% assign images = site.data.docker-image-tags | sort %}
{% for image in images %}

### {{ image[1].name }}
{:.no_toc}

**Usage:** Add the following under `docker:` in your config.yml:  

`- image: circleci/{{ image[0] }}:[TAG]`

**Latest Tags:** <small>(view more available tags on [Docker Hub](https://hub.docker.com/r/circleci/{{ image[0] }}/tags/))</small>

<ul class="list-2cols">
{% assign tags = image[1].tags | sort %}
{% for tag in tags %}
	{% unless tag contains "-browsers" or tag contains "-node" %}
	<li>{{ tag }}</li>
	{% endunless %}
{% endfor %}
</ul>
<p>Note: Any variants available for this image can be added by appending the variant tag to the tags above.</p>

---

{% endfor %}

## See Also
{:.no_toc}

See [Using Private Images]({{ site.baseurl }}/2.0/private-images/) for information about how to authorize your build to use an image in a private repository or in Amazon ECR.
