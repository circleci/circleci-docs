---
layout: classic-docs
title: Ubuntu 14.04 (Trusty)
categories: [build-images]
description: Ubuntu 14.04 (Trusty)
changefreq: "weekly"
---

The default image is Ubuntu 14.04 (Trusty), but you can always change the image directly by going to 'Project Settings' -> 'Build Environment'.

To apply the new setting, you will need to trigger a build by pushing commits to GitHub or Bitbucket (instead of rebuilding).

## Base

Our base image uses Ubuntu 14.04, with the addition of many packages commonly used in web development.

### Build Image

Version: `{{ site.data.trusty.versions-ubuntu-14_04-XXL.summary.build-image }}`

We also push the image to [Docker Hub](https://hub.docker.com/r/circleci/build-image/tags/).

### Git

Version: `{{ site.data.trusty.versions-ubuntu-14_04-XXL.summary.git }}`

## Programming Languages

### Python

Default: `{{ site.data.trusty.versions-ubuntu-14_04-XXL.summary.python.default }}`

Pre-installed versions:

{% for version in site.data.trusty.versions-ubuntu-14_04-XXL.summary.python.all %}
- `{{ version }}`
{% endfor %}

### PHP

Default: `{{ site.data.trusty.versions-ubuntu-14_04-XXL.summary.php.default }}`

Pre-installed versions:

{% for version in site.data.trusty.versions-ubuntu-14_04-XXL.summary.php.all %}
- `{{ version }}`
{% endfor %}

### Ruby

Default: `{{ site.data.trusty.versions-ubuntu-14_04-XXL.summary.ruby.default }}`

Pre-installed versions:

{% for version in site.data.trusty.versions-ubuntu-14_04-XXL.summary.ruby.all %}
- `{{ version }}`
{% endfor %}

### Nodejs

Default: `{{ site.data.trusty.versions-ubuntu-14_04-XXL.summary.nodejs.default }}`

Pre-installed versions:

{% for version in site.data.trusty.versions-ubuntu-14_04-XXL.summary.nodejs.all %}
- `{{ version }}`
{% endfor %}

### Yarn

Version: `{{ site.data.trusty.versions-ubuntu-14_04-XXL.summary.nodejs.yarn }}`

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

Version: `{{ site.data.trusty.versions-ubuntu-14_04-XXL.summary.go }}`

## Databases

### MySQL

Version: `{{ site.data.trusty.versions-ubuntu-14_04-XXL.summary.mysqld }}`

Started by default: `true`

### PostgreSQL

Version: `{{ site.data.trusty.versions-ubuntu-14_04-XXL.summary.psql }}`

Started by default: `true`

### MongoDB

Version: `{{ site.data.trusty.versions-ubuntu-14_04-XXL.summary.mongod }}`

Started by default: `true`

### Redis

Version: `{{ site.data.trusty.versions-ubuntu-14_04-XXL.summary.redis }}`

Started by default: `false`

```
machine:
  services:
    - redis
```

### Elasticsearch

Version: `{{ site.data.trusty.versions-ubuntu-14_04-XXL.summary.elasticsearch }}`

Started by default: `false`

```
machine:
  services:
    - elasticsearch
```

### Neo4j

Version: `{{ site.data.trusty.versions-ubuntu-14_04-XXL.all.neo4j }}`

Started by default: `false`

```
machine:
  services:
    - neo4j
```

### Cassandra

Version: `{{ site.data.trusty.versions-ubuntu-14_04-XXL.summary.cassandra }}`

Started by default: `false`

```
machine:
  services:
    - cassandra
```

### Riak

Version: `{{ site.data.trusty.versions-ubuntu-14_04-XXL.all.riak }}`

Started by default: `false`

```
machine:
  services:
    - riak
```

## Docker

### docker-engine

Version: `{{ site.data.trusty.versions-ubuntu-14_04-XXL.summary.docker }}`

Started by default: `false`

```
machine:
  services:
    - docker
```

### docker-compose

Version: `{{ site.data.trusty.versions-ubuntu-14_04-XXL.summary.docker-compose }}`

## Browsers

### Firefox

Version: `{{ site.data.trusty.versions-ubuntu-14_04-XXL.summary.firefox }}`

### Google Chrome

Version: `{{ site.data.trusty.versions-ubuntu-14_04-XXL.summary.google-chrome }}`

### ChromeDriver

Version: `{{ site.data.trusty.versions-ubuntu-14_04-XXL.summary.chromedriver }}`

### PhantomJS

Version: `{{ site.data.trusty.versions-ubuntu-14_04-XXL.summary.phantomjs }}`

## Misc

### Qt

Version: `{{ site.data.trusty.versions-ubuntu-14_04-XXL.all.qtbase5-dev-tools }}`

### Memcached

Started by default: `false`

Version: `{{ site.data.trusty.versions-ubuntu-14_04-XXL.all.memcached }}`

```
machine:
  services:
    - memcached
```

### RabbitMQ

Version: `{{ site.data.trusty.versions-ubuntu-14_04-XXL.all.rabbitmq-server }}`

Started by default: `false`

```
machine:
  services:
    - rabbitmq-server
```

### Beanstalkd

Version: `{{ site.data.trusty.versions-ubuntu-14_04-XXL.summary.beanstalkd }}`

Started by default: `false`

```
machine:
  services:
    - beanstalkd
```

## Integration Tools

### gcloud

Version: `{{ site.data.trusty.versions-ubuntu-14_04-XXL.summary.gcloud }}`

### awscli

Version: `{{ site.data.trusty.versions-ubuntu-14_04-XXL.summary.aws-cli }}`

### heroku/heroku-toolbelt

Version: `{{ site.data.trusty.versions-ubuntu-14_04-XXL.summary.heroku-toolbelt }}`

## Android

### SDK Tools

Version: `{{ site.data.trusty.versions-ubuntu-14_04-XXL.summary.android.build-tool }}`

### SDK Platforms

{% for version in site.data.trusty.versions-ubuntu-14_04-XXL.summary.android.platforms %}
- `{{ version }}`
{% endfor %}

### SDK Build Tools

{% for version in site.data.trusty.versions-ubuntu-14_04-XXL.summary.android.build-tools %}
- `{{ version }}`
{% endfor %}

### Emulator Images

{% for version in site.data.trusty.versions-ubuntu-14_04-XXL.summary.android.emulator-images %}
- `{{ version }}`
{% endfor %}

### Add-Ons (Google APIs)

{% for version in site.data.trusty.versions-ubuntu-14_04-XXL.summary.android.add-ons %}
- `{{ version }}`
{% endfor %}

### Android Extra

{% for version in site.data.trusty.versions-ubuntu-14_04-XXL.summary.android.android-extra %}
- `{{ version }}`
{% endfor %}

### Google Extra

{% for version in site.data.trusty.versions-ubuntu-14_04-XXL.summary.android.google-extra %}
- `{{ version }}`
{% endfor %}

## dpkg -l

The following is the output of `dpkg -l` from the latest build image.

{% for version in site.data.trusty.versions-ubuntu-14_04-XXL.all %}
- `{{ version }}`
{% endfor %}
