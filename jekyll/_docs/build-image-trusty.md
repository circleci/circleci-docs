---
layout: classic-docs
title: Ubuntu 14.04 (Trusty)
categories: [build-images]
description: Ubuntu 14.04 (Trusty)
---

You can run your Linux builds on Ubuntu 14.04 Trusty (default is Ubuntu 12.04). You can switch to Trusty from "Project Settings" -> "Build Environment" of your project.

Please note that you need to trigger a build by pushing commits to GitHub (instead of rebuilding) to apply the new setting.

## Base

Our base image uses Ubuntu 14.04, with the addition of many packages commonly used in web development.

### Build Image

Version: `{{ site.data.trusty.versions.summary.build-image }}`

### Git

Version: `{{ site.data.trusty.versions.summary.git }}`

## Programming Languages

### Python

Default: `{{ site.data.trusty.versions.summary.python.default }}`

Pre-installed versions:

{% for version in site.data.trusty.versions.summary.python.all %}
- `{{ version }}`
{% endfor %}

### PHP

Default: `{{ site.data.trusty.versions.summary.php.default }}`

Pre-installed versions:

{% for version in site.data.trusty.versions.summary.php.all %}
- `{{ version }}`
{% endfor %}

### Ruby

Default: `{{ site.data.trusty.versions.summary.ruby.default }}`

Pre-installed versions:

{% for version in site.data.trusty.versions.summary.ruby.all %}
- `{{ version }}`
{% endfor %}

### Nodejs

Default: `{{ site.data.trusty.versions.summary.nodejs.default }}`

Pre-installed versions:

{% for version in site.data.trusty.versions.summary.nodejs.all %}
- `{{ version }}`
{% endfor %}

<!--
Kludge ahead! circle.yml expects abbreviated version name e.g. openjdk8 but
the actual name on build image is different e.g. openjdk-8-jre.
Since there is no reliable way to map the name that circle.yml expects and the name
actually installed correctly, we hardcode versions here.
-->

### Java

Default: `oraclejdk8`

Pre-installed versions:

- `oraclejdk8`

- `openjdk8`

- `openjdk7`

### Go

Version: `{{ site.data.trusty.versions.summary.go }}`

## Databases

### MySQL

Version: `{{ site.data.trusty.versions.summary.mysqld }}`

Started by default: `true`

### PostgreSQL

Version: `{{ site.data.trusty.versions.summary.psql }}`

Started by default: `true`

### MongoDB

Version: `{{ site.data.trusty.versions.summary.mongod }}`

Started by default: `true`

### Redis

Version: `{{ site.data.trusty.versions.summary.redis }}`

Started by default: `false`

```
machine:
  services:
    - redis
```

### Elasticsearch

Version: `{{ site.data.trusty.versions.summary.elasticsearch }}`

Started by default: `false`

```
machine:
  services:
    - elasticsearch
```

### Neo4j

Version: `{{ site.data.trusty.versions.all.neo4j }}`

Started by default: `false`

```
machine:
  services:
    - neo4j
```

### Cassandra

Version: `{{ site.data.trusty.versions.summary.cassandra }}`

Started by default: `false`

```
machine:
  services:
    - cassandra
```

### Riak

Version: `{{ site.data.trusty.versions.all.riak }}`

Started by default: `false`

```
machine:
  services:
    - riak
```

## Docker

### docker-engine

Version: `{{ site.data.trusty.versions.summary.docker }}`

Started by default: `false`

```
machine:
  services:
    - docker
```

### docker-compose

Version: `{{ site.data.trusty.versions.summary.docker-compose }}`

## Browsers

### Firefox

Version: `{{ site.data.trusty.versions.summary.firefox }}`

### Chrome

Version: `{{ site.data.trusty.versions.summary.google-chrome }}`

### PhantomJS

Version: `{{ site.data.trusty.versions.summary.phantomjs }}`

## Misc

### Qt

Version: `{{ site.data.trusty.versions.all.qtbase5-dev-tools }}`

### Memcached

Started by default: `false`

Version: `{{ site.data.trusty.versions.all.memcached }}`

```
machine:
  services:
    - memcached
```

### RabbitMQ

Version: `{{ site.data.trusty.versions.all.rabbitmq-server }}`

Started by default: `false`

```
machine:
  services:
    - rabbitmq-server
```

### Beanstalkd

Version: `{{ site.data.trusty.versions.summary.beanstalkd }}`

Started by default: `false`

```
machine:
  services:
    - beanstalkd
```

## Android

### SDK Tools

Version: `{{ site.data.trusty.versions.summary.android.build-tool }}`

### SDK Platforms

{% for version in site.data.trusty.versions.summary.android.platforms %}
- `{{ version }}`
{% endfor %}

### SDK Build Tools

{% for version in site.data.trusty.versions.summary.android.build-tools %}
- `{{ version }}`
{% endfor %}

### Emulator Images

{% for version in site.data.trusty.versions.summary.android.emulator-images %}
- `{{ version }}`
{% endfor %}

### Add-Ons (Google APIs)

{% for version in site.data.trusty.versions.summary.android.add-ons %}
- `{{ version }}`
{% endfor %}

### Android Extra

{% for version in site.data.trusty.versions.summary.android.android-extra %}
- `{{ version }}`
{% endfor %}

### Google Extra

{% for version in site.data.trusty.versions.summary.android.google-extra %}
- `{{ version }}`
{% endfor %}

## dpkg -l

The following is the output of `dpkg -l` from the latest build image.

{% for version in site.data.trusty.versions.all %}
- `{{ version }}`
{% endfor %}
