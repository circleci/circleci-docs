---
layout: classic-docs
title: Trusty Build Image
categories: [build-images]
last_updated: Feb 5, 2014
description: trusty image
---

You can run your Linux builds on Ubuntu 14.04 Trusty (default is Ubuntu 12.04). You can switch to Trusty from "Project Settings" -> "Build Environment" of your project.

Please note that you need to trigger a build by pushing commits to GitHub (instead of rebuilding) to apply the new setting.

## Programming Languages

### Python

Default: `2.7.11`

Pre-installed versions:

```
2.7.10
2.7.11
3.1.4
3.1.5
3.2.5
3.2.6
3.3.5
3.3.6
3.4.3
3.4.4
3.5.0
3.5.1
pypy-1.9
pypy-2.6.1
pypy-4.0.1
```

### PHP

Default: `5.6.17`

Pre-installed versions:

```
5.5.31
5.5.32
5.6.17
5.6.18
7.0.2
7.0.3
```

### Ruby

Default: `2.2.4`

Pre-installed versions:

```
2.0.0-p647
2.1.7
2.1.8
2.2.3
2.2.4
2.3.0
```

### Nodejs

Default: `4.2.6`

Pre-installed versions:

```
v0.12.9
v4.0.0
v4.1.2
v4.2.6
v4.3.0
v5.0.0
v5.1.1
v5.2.0
v5.3.0
v5.4.1
v5.5.0
v5.6.0
v5.7.0
```

### Java

Version: `1.8.0.40`

### Go

Version: `1.6`

## Databases

### MySQL

Version: `5.6.28`

Started by default: `true`

### PostgreSQL

Version: `9.4.5`

Started by default: `true`

### MongoDB

Version: `3.0.7`

Started by default: `true`

### Redis

Version: `2.8.4`

Started by default: `false`

```
machine:
  services:
    - redis
```

### Elasticsearch

Version: `1.7.2`

Started by default: `false`

```
machine:
  services:
    - elasticsearch
```

### Neo4j

Version: `2.3.2`

Started by default: `false`

```
machine:
  services:
    - neo4j
```

### Cassandra

Version: `3.4`

Started by default: `false`

```
machine:
  services:
    - cassandra
```

### Riak

Version: `2.1.3`

Started by default: `false`

```
machine:
  services:
    - riak
```

## Docker

### docker-engine

Version: `1.9.1`

Started by default: `false`

```
machine:
  services:
    - docker
```

### docker-compose

Version: `1.5.2`

## Browsers

### Firefox

Version: `44.0`

### Chrome

Version: `48.0.2564.97`

### PhantomJS

Version: `2.1.1`

## Misc

### Qt

Version: `5.2.1`

### Memcached

Started by default: `false`

Version: `1.4.14`

```
machine:
  services:
    - memcached
```

### RabbitMQ

Version: `3.2.4`

Started by default: `false`

```
machine:
  services:
    - rabbitmq-server
```

### Beanstalkd

Version: `1.9.2`

Started by default: `false`

```
machine:
  services:
    - beanstalkd
```

### Android

```
Android SDK 23
Android SDK 22
```
