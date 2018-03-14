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

A step is an action that needs to be taken to perform your build. A step is usually a collection of executable commands. For example, the `checkout` step checks out the source code for a job over SSH. Then, the `run` step executes commands using a non-login shell by default. 

![step illustration]( {{ site.baseurl }}/assets/img/docs/concepts_step.png)

```YAML
...
    steps:
      - checkout
      - run:
          name: Running tests
          command: make test
...          
```          

## Image

An image is a packaged system that has the instructions for creating a running container. The Primary Container is defined by the first image listed in `.circleci/config.yml` file. This is where commands are executed for jobs using the Docker executor.

![image illustration]( {{ site.baseurl }}/assets/img/docs/concepts_image.png)

## Job

A job is a collection of steps. The Job Space is all of the containers being run by an executor (`docker`, `machine`, or `macos`) for the current job. 

![job illustration]( {{ site.baseurl }}/assets/img/docs/concepts1.png)

## Workflow

A workflow is a set of rules for defining a collection of jobs and their run order. Within the CI/CD industry, this feature is also referred to as Pipelines.

![workflow illustration]( {{ site.baseurl }}/assets/img/docs/concepts_workflow.png)

## Workspace

A workspace is a workflows-aware storage mechanism. A workspace stores data unique to the job, which may be needed in downstream jobs.

## Artifact

Artifacts persist data after a workflow is completed and may be used for longer-term storage of the outputs of your build process.

![workflows illustration]( {{ site.baseurl }}/assets/img/docs/Diagram-v3--Default.png)

## Cache

Stores a file or directory of files such as dependencies or source code in object storage.

