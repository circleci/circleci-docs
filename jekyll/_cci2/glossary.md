---
layout: classic-docs2
title: "Glossary"
short-title: "Glossary"
categories: [configuring-jobs]
order: 5000
---

### Executor

Defines an underlying technology used for running a build. Might be `docker` or `machine`. [Detailed information]({{ site.baseurl }}/2.0/executor-types)

### Job Space

All the containers (VMs) running by an Executor for a current Job

### Main Container

A place where build commands executes for Docker Executor (first image listed in config)

### Remote Docker

Feature enabling building, running and pushing images into Docker Regestries within a Docker [Executor](#executor). [Detailed information]({{ site.baseurl }}/2.0/remote-docker)
