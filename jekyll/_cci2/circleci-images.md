---
layout: classic-docs
title: "CircleCI Images"
short-title: "CircleCI Images"
description: "Listing of available images maintained by CircleCI"
categories: [reference]
order: 1
---

CircleCI maintains a number of Docker images that are, generally, supersets of official images for popular languages with additional tooling useful when running your tests. 

For many of them we also have the following variants, which can be used by adding the suffix to the main image name (each of which is listed in the tags for each image below, when available):

{% for variant in site.data.circleci_images.variants %}
* `-{{ variant[0] }}`: {{ variant[1] }}
{% endfor %}

All of the following images are published in the [CircleCI org on Docker Hub](https://hub.docker.com/r/circleci/). 

NOTE: We strongly recommend that you lock your image to a particular tag to avoid unwanted changes (the available tags for each image are listed below and available on each images Docker Hub page). If you choose to use the `latest` tag the image may change unexpectedly and create surprising results.

<!-- TODO: Sort this -->
{% assign images = site.data.circleci_images.images %}




## Available Images

**Note:** The 'language' images would usually be used as your 'primary' container. The 'database' images are best used as a secondary 'service' container.

{% for image in images %}
* [{{ image[1].name }}](#{{ image[1].name | kramdown_generate_id }})
{% endfor %}

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
 

