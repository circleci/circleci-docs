---
layout: classic-docs
title: "Concepts"
short-title: "Concepts"
description: "CircleCI 2.0 concepts"
categories: [getting-started]
order: 1
---

*[Basics]({{ site.baseurl }}/2.0/concepts/) > Concepts*

This document provides an overview of the concepts used in CircleCI 2.0 in the following sections:

* TOC 
{:toc}

## Step

A step is a collection of executable commands.

![step illustration]( {{ site.baseurl }}/assets/img/docs/concepts_step.png)

## Image

An image is a packaged system that has the instructions for creating a running container. The Primary Container is defined by the first image listed in `.circleci/config.yml` file. This is where commands are executed for jobs using the Docker executor.

![image illustration]( {{ site.baseurl }}/assets/img/docs/concepts_image.png)

## Job

A job is a collection of steps. The Job Space is all of the containers being run by an executor (`docker`, `machine`, or `macos`) for the current job. 

![job illustration]( {{ site.baseurl }}/assets/img/docs/concepts1.png)

## Workflows

A workflow is a set of rules for defining a collection of jobs and their run order. Within the CI/CD industry, this feature is also referred to as Pipelines.

![step illustration]( {{ site.baseurl }}/assets/img/docs/concepts_workflow.png)

## Workspace

A workspace is a workflows-aware storage mechanism. A workspace stores data unique to the job, which may be needed in downstream jobs.

## Artifact

Artifacts persist data after a workflow is completed and may be used for longer-term storage of the outputs of your build process.
