---
layout: classic-docs
title: Ubuntu 14.04 (Trusty)
categories: [build-images]
last_updated: Feb 5, 2014
description: Ubuntu 14.04 (Trusty)
---

You can run your Linux builds on Ubuntu 14.04 Trusty (default is Ubuntu 12.04). You can switch to Trusty from "Project Settings" -> "Build Environment" of your project.

Please note that you need to trigger a build by pushing commits to GitHub (instead of rebuilding) to apply the new setting.

## Programming Languages

### Python

Default: `{{ site.data.trusty.versions.default_python }}`

Pre-installed versions:

{% for version in site.data.trusty.versions.python_versions %}
- `{{ version }}`
{% endfor %}

### PHP

Default: `{{ site.data.trusty.versions.default_php }}`

Pre-installed versions:

{% for version in site.data.trusty.versions.php_versions %}
- `{{ version }}`
{% endfor %}

### Ruby

Default: `{{ site.data.trusty.versions.default_ruby }}`

Pre-installed versions:

{% for version in site.data.trusty.versions.ruby_versions %}
- `{{ version }}`
{% endfor %}

### Nodejs

Default: `{{ site.data.trusty.versions.default_nodejs }}`

Pre-installed versions:

{% for version in site.data.trusty.versions.nodejs_versions %}
- `{{ version }}`
{% endfor %}

### Java

JDK: `{{ site.data.trusty.versions.default_java_package }}`

Version: `{{ site.data.trusty.versions.default_java_version }}`

### Go

Version: `{{ site.data.trusty.versions.golang }}`

## Databases

### MySQL

Version: `{{ site.data.trusty.versions.mysql }}`

Started by default: `true`

### PostgreSQL

Version: `{{ site.data.trusty.versions.postgresql }}`

Started by default: `true`

### MongoDB

Version: `{{ site.data.trusty.versions.mongodb }}`

Started by default: `true`

### Redis

Version: `{{ site.data.trusty.versions.redis }}`

Started by default: `false`

```
machine:
  services:
    - redis
```

### Elasticsearch

Version: `{{ site.data.trusty.versions.elasticsearch }}`

Started by default: `false`

```
machine:
  services:
    - elasticsearch
```

### Neo4j

Version: `{{ site.data.trusty.versions.neo4j }}`

Started by default: `false`

```
machine:
  services:
    - neo4j
```

### Cassandra

Version: `{{ site.data.trusty.versions.cassandra }}`

Started by default: `false`

```
machine:
  services:
    - cassandra
```

### Riak

Version: `{{ site.data.trusty.versions.riak }}`

Started by default: `false`

```
machine:
  services:
    - riak
```

## Docker

### docker-engine

Version: `{{ site.data.trusty.versions.docker }}`

Started by default: `false`

```
machine:
  services:
    - docker
```

### docker-compose

Version: `{{ site.data.trusty.versions.docker_compose }}`

## Browsers

### Firefox

Version: `{{ site.data.trusty.versions.firefox }}`

### Chrome

Version: `{{ site.data.trusty.versions.chrome }}`

### PhantomJS

Version: `{{ site.data.trusty.versions.phantomjs }}`

## Misc

### Qt

Version: `{{ site.data.trusty.versions.qt }}`

### Memcached

Started by default: `false`

Version: `{{ site.data.trusty.versions.memcached }}`

```
machine:
  services:
    - memcached
```

### RabbitMQ

Version: `{{ site.data.trusty.versions.rabbitmq }}`

Started by default: `false`

```
machine:
  services:
    - rabbitmq-server
```

### Beanstalkd

Version: `{{ site.data.trusty.versions.beanstalkd }}`

Started by default: `false`

```
machine:
  services:
    - beanstalkd
```

### Android SDK

{% for version in site.data.trusty.versions.android_sdk_packages %}
- `{{ version }}`
{% endfor %}
