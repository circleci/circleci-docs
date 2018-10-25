---
layout: classic-docs
title: "Orbs Overview"
short-title: "Orbs Overview"
description: "Starting point for CircleCI Orbs"
categories: [getting-started]
order: 1
---

This document provides a conceptual overview of Orbs and Orb design.

## Introduction

Orbs are package systems (similar to Ruby Gems) that you can use to quickly and easily get up and running using the CircleCI platform. Orbs encourage abstraction of a tight scope with a usable and flexible interface.

Orbs consist of the following elements:

* Commands
* Jobs
* Executors

### Commands
{:.no_toc}

Commands are reusable sets of steps that you can invoke with specific parameters within an existing job (e.g. `checkout` and `run`). For example, if you want to invoke the command `sayhello`, you would pass the parameter `to` as follows:

``jobs
  myjob:
    docker:
      - image: "circleci/node:9.6.1"
    steps:
      - sayhello:
          to: "Lev"
```

### Jobs
{:.no_toc}

Jobs are sets of steps and the environments that the steps should be executed within the environment. Jobs are defined in your build configuration or in an orb and enable you to define a job name in a map under the `jobs` key in a configuration, or in an external orb's configuration.

<aside class="notice">
You must invoke jobs in the workflow stanza of `config.yml`, making sure to pass any necessary parameters as subkeys to the job.
</aside>

### Executors
{:.no_toc}

Executors define the environment in which the steps of a job will be run. When you declare a `job` in CircleCI configuration, you define the type of environment (e.g. `docker`, `machine`, `macos`, etc.) to run in, in addition to any other parameters of that environment, such as:

* environment variables to populate
* which shell to use
* what size `resource_class` to use

When you declare an executor in a configuration outside of `jobs`, you can use these declarations for all jobs in the scope of that declaration, enabling you to reuse a single executor definition across multiple jobs.

Each executor definition includes the subset of the children keys of a `job` declaration related to setting the environment for a job to execute. This means it does not include `steps`. The subset can be one or more of the following keys:

* `docker`, `machine`, or `macos`
* `environment`
* `working_directory`
* `shell`
* `resource_class`

The example below shows a simple example of using an executor:

version: 2.1
executors:
  my-executor:
    docker:
      - image: circleci/ruby:2.4.0

jobs:
  my-job:
    executor: my-executor
    steps:
      - run: echo outside the executor

Notice in the above example that the executor `my-executor` is passed as the single value of the key `executor`. Alternatively, you can pass `my-executor` as the value of a `name` key under `executor`. This method is primarily employed when passing parameters to executor invocations. An example of this method is shown in the example below.

jobs:
  my-job:
    executor:
      name: my-executor
    steps:
      -run: echo outside the executor



## Key Concepts

Before using Orbs, you should first familiarize yourself with some basic core concepts of Orbs and how they are structured and operate. Gaining a basic understanding of these core concepts will enable you to leverage Orbs and use them easily in your own environments.

### Development vs. Production Orbs
{:.no_toc}

Orbs can be published either as ```dev:foo``` or as a semantically versioned production orb. Development Orbs are mutable and expire, whereas Production Orbs are immutable and durable.

### Certified vs. 3rd Party Orbs
{:.no_toc}

CircleCI will make available a number of individual Orbs that have been tested and certified to work with the platform. These orbs will be treated as part of the platform; all other orbs are considered 3rd party Orbs.

<aside class="notice">
All Orbs are open, meaning that anyone can use them and see their source. Also, only the ```circleci``` namespace is certified.
</aside>

## Design Methodology

Before using orbs, you may find it helpful to understand the various design decisions and methodologies that were used when these Orbs were designed. Orbs were designed with the following considerations:

* Orbs are transparent - If you can execute an Orb, you can view the source of that Orb.
* Metadata is baked in - Everything can take a ```description``` key.
* Orbs are ALWAYS semantic versioned (semver'd) - CircleCI allows development Orbs that have versions that start with `dev:`.
* Production Orbs are immutable - Once an Orb has been published to a semantic version, the Orb cannot be changed. This prevents unexpected breakage or changing behaviors in core orchestration.
* One registry (per install) - Each installation of CircleCI, including circleci.com, has only one registry where Orbs can be kept.
* Organization Admins publish production Orbs. Organization members publish development Orbs - All namespaces are owned by an organization. Only the admin(s) of that organization can publish/promote a production Orb. All organization members can publish development Orbs.

### Designing Orbs

{:.no_toc}

When designing your own Orbs, make sure your Orbs meet the following requirements:

* Orbs should always use 'description'. - Be sure to explain usage, assumptions, and any tricks in the ```description``` key under jobs, commands, executors, and parameters.
* Match commands to executors - If you are providing commands, try to provide one or more executors in which they will run.
* Use concise naming for your Orb - Remember that use of your commands and jobs is always contextual to your Orb, so you can use general names like "run-tests" in most cases.
* Required vs. Optional Parameters - Provide sound default values of parameters whenever possible.
* Avoid Job-only Orbs - Job-only Orbs are inflexible. While these Orbs are sometimes appropriate, it can be frustrating for users to not be able to use the commands in their own jobs. Pre and post steps when invoking jobs are a workaround for users.
* Parameter `steps` are powerful - Wrapping steps provided by the user allows you to encapsulate and sugar things like caching strategies and other more complex tasks, providing a lot of value to users.

## See Also
{:.no_toc}

[Reusing Config]({{site.baseurl}}/2.0/reusing-config/)
