---
layout: classic-docs
title: "Glossary"
short-title: "Glossary"
categories: [reference]
order: 2
---

### executor

Defines the underlying technology to run a build. Can be `docker` or `machine`. [Learn more]({{ site.baseurl }}/2.0/executor-types/).

### job space

All the containers (VMs) being run by an [executor](#executor) for the current job.

### primary container

The first image listed in `config.yml`. This is where commands are executed for jobs using the Docker executor.

### remote Docker

Feature that enables building, running and pushing images to Docker registries from within a Docker [executor](#executor) job. [Learn more]({{ site.baseurl }}/2.0/building-docker-images/).
