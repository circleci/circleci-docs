---
layout: classic-docs
title: ubuntu-14.04-XL-922-9410082
categories: [build-images-2-0]
description: ubuntu-14.04-XL-922-9410082
changefreq: "weekly"
sitemap: false
---

***Please note that we are planning to make the image deprecated on CircleCI 2.0 in the future.***

The idea of monolithic build image doesn't fit the idea of CircleCI 2.0 quite well and we are currently
working on providing alternatives. We'll keep the image in the meantime but will not be support it eventually.

### Build Image

Version: `{{ site.data.build-image-versions.ubuntu-1404-XL-922-9410082.summary.build-image }}`

We also push the image to [Docker Hub](https://hub.docker.com/r/circleci/build-image/tags/).

### Git

Version: `{{ site.data.build-image-versions.ubuntu-1404-XL-922-9410082.summary.git }}`

## Programming Languages

### Python

Default: `{{ site.data.build-image-versions.ubuntu-1404-XL-922-9410082.summary.python.default }}`

Pre-installed versions:

{% for version in site.data.build-image-versions.ubuntu-1404-XL-922-9410082.summary.python.all %}
- `{{ version }}`
{% endfor %}

### PHP

Default: `{{ site.data.build-image-versions.ubuntu-1404-XL-922-9410082.summary.php.default }}`

Pre-installed versions:

{% for version in site.data.build-image-versions.ubuntu-1404-XL-922-9410082.summary.php.all %}
- `{{ version }}`
{% endfor %}

### Ruby

Default: `{{ site.data.build-image-versions.ubuntu-1404-XL-922-9410082.summary.ruby.default }}`

Pre-installed versions:

{% for version in site.data.build-image-versions.ubuntu-1404-XL-922-9410082.summary.ruby.all %}
- `{{ version }}`
{% endfor %}

### Nodejs

Default: `{{ site.data.build-image-versions.ubuntu-1404-XL-922-9410082.summary.nodejs.default }}`

Pre-installed versions:

{% for version in site.data.build-image-versions.ubuntu-1404-XL-922-9410082.summary.nodejs.all %}
- `{{ version }}`
{% endfor %}

<!--
Kludge ahead! circle.yml expects abbreviated version name e.g. openjdk8 but
the actual name on build image is different e.g. openjdk-8-jre.
Since there is no reliable way to map the name that circle.yml expects and the name
actually installed correctly, we hardcode versions here.
-->

### Java

Default: `oraclejdk7`

Pre-installed versions:

- `oraclejdk8`

- `oraclejdk7`

- `oraclejdk6`

- `openjdk8`

- `openjdk7`

- `openjdk6`

### Go

Version: `{{ site.data.build-image-versions.ubuntu-1404-XL-922-9410082.summary.go }}`

## Browsers

### Firefox

Version: `{{ site.data.build-image-versions.ubuntu-1404-XL-922-9410082.summary.firefox }}`

### Google Chrome

Version: `{{ site.data.build-image-versions.ubuntu-1404-XL-922-9410082.summary.google-chrome }}`

### ChromeDriver

Version: `{{ site.data.build-image-versions.ubuntu-1404-XL-922-9410082.summary.chromedriver }}`

### PhantomJS

Version: `{{ site.data.build-image-versions.ubuntu-1404-XL-922-9410082.summary.phantomjs }}`

## Misc

### Qt

Version: `{{ site.data.build-image-versions.ubuntu-1404-XL-922-9410082.all.qtbase5-dev-tools }}`

## Integration Tools

### gcloud

Version: `{{ site.data.build-image-versions.ubuntu-1404-XL-922-9410082.summary.gcloud }}`

### awscli

Version: `{{ site.data.build-image-versions.ubuntu-1404-XL-922-9410082.summary.aws-cli }}`

### heroku/heroku-toolbelt

Version: `{{ site.data.build-image-versions.ubuntu-1404-XL-922-9410082.summary.heroku-toolbelt }}`

## Android

### SDK Tools

Version: `{{ site.data.build-image-versions.ubuntu-1404-XL-922-9410082.summary.android.build-tool }}`

### SDK Platforms

{% for version in site.data.build-image-versions.ubuntu-1404-XL-922-9410082.summary.android.platforms %}
- `{{ version }}`
{% endfor %}

### SDK Build Tools

{% for version in site.data.build-image-versions.ubuntu-1404-XL-922-9410082.summary.android.build-tools %}
- `{{ version }}`
{% endfor %}

### Emulator Images

{% for version in site.data.build-image-versions.ubuntu-1404-XL-922-9410082.summary.android.emulator-images %}
- `{{ version }}`
{% endfor %}

### Add-Ons (Google APIs)

{% for version in site.data.build-image-versions.ubuntu-1404-XL-922-9410082.summary.android.add-ons %}
- `{{ version }}`
{% endfor %}

### Android Extra

{% for version in site.data.build-image-versions.ubuntu-1404-XL-922-9410082.summary.android.android-extra %}
- `{{ version }}`
{% endfor %}

### Google Extra

{% for version in site.data.build-image-versions.ubuntu-1404-XL-922-9410082.summary.android.google-extra %}
- `{{ version }}`
{% endfor %}

## dpkg -l

The following is the output of `dpkg -l` from the latest build image.

{% for version in site.data.build-image-versions.ubuntu-1404-XL-922-9410082.all %}
- `{{ version }}`
{% endfor %}
