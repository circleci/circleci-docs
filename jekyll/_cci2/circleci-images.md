---
layout: classic-docs
title: "Pre-Built CircleCI Docker Images"
short-title: "Pre-Built CircleCI Docker Images"
description: "Listing of available images maintained by CircleCI"
categories: [containerization]
order: 20
---
*[Reference]({{ site.baseurl }}/2.0/reference/) > Pre-Built CircleCI Docker Images*

As a convenience, CircleCI maintains a number of Docker Images for popular languages with additional tooling that is useful when running your tests. All of the following images are published in the [CircleCI org on Docker Hub](https://hub.docker.com/r/circleci/), the source code is available in the [repository on GitHub](https://github.com/circleci/circleci-images) and the Dockerfiles are available as build artifacts in the [repository's production branch on CircleCI](https://circleci.com/gh/circleci/circleci-images/tree/production). 

## How to Get Started with Pre-Built Docker Images Video Tutorial
<div class="screen">
<iframe width="560" height="315" src="https://www.youtube.com/embed/PgIwBzXBn7M" frameborder="0" allowfullscreen></iframe>
</div>

## Available Images

{% assign images = site.data.docker-image-tags | sort %}

**Note:** The language images are to be used as your primary container listed first in your `config.yml` file. The database images are best used as a secondary service container, in which case, list after the primary container image in your `config.yml` file.

<ul class="list-2cols">
{% for image in images %}
<li markdown="1">
[{{ image[1].name }}](#{{ image[1].name | kramdown_generate_id }})
</li>
{% endfor %}
</ul>

**Note:** CircleCI maintains variants, which can be added to the main image name as follows:

- `-browsers`: Includes browsers and libraries normally used for windowing.
- `-node`: Includes Node.js in addition to the core language for polyglot applications.

**Note:** If you choose to use the `latest` tag the image may change unexpectedly and create surprising results.
<hr>

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
