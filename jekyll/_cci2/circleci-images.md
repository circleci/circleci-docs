---
layout: classic-docs
title: "Using Pre-Built CircleCI Docker Images"
short-title: "Using Pre-Built CircleCI Docker Images"
description: "Listing of available images maintained by CircleCI"
categories: [containerization]
order: 20
---

As a convenience, CircleCI maintains a number of Docker Images for popular languages with additional tooling that is useful when running your tests. All of the following images are published in the [CircleCI org on Docker Hub](https://hub.docker.com/r/circleci/), the Dockerfiles and other source code is available in the [repository on GitHub](https://github.com/circleci/circleci-images). 



<!-- TODO: Sort this -->
{% assign images = site.data.circleci_images.images %}




## Available Images

**Note:** The language images are to be used as your primary container listed first in your `config.yml` file. The database images are best used as a secondary service container, in which case, list after the primary container image in your `config.yml` file.

{% for image in images %}
* [{{ image[1].name }}](#{{ image[1].name | kramdown_generate_id }})
{% endfor %}




**Note:** CircleCI maintains variants, which can be added to the main image name as follows:

{% for variant in site.data.circleci_images.variants %}
* `-{{ variant[0] }}`: {{ variant[1] }}
{% endfor %}

**Note:** If you choose to use the `latest` tag the image may change unexpectedly and create surprising results.
<hr>

{% for image in images %}
### {{ image[1].name }} 
**Usage:** Add the following under `docker:` in your config.yml:  
`image: {{ image[1].image }}:[TAG]`  (<small>[Docker Hub page]({{image[1].info-url}})</small>)  
**Available Tags:**
{% for tag in image[1].tags %}
* {{tag}}
{% endfor %}
<hr>
{% endfor %}
 


