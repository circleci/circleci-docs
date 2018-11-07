---
layout: classic-docs
title: "Using Orbs"
short-title: "Using Orbs"
description: "Starting point for CircleCI Orbs"
categories: [getting-started]
order: 1
---

This document provides a basic example of importing an [orb]({{ site.baseurl }}/2.0/orb-intro/) and elements of orbs followed by a conceptual overview of orbs design. 

* TOC
{:toc}

## Introduction

Orbs are packages of config that you can use to quickly get started with the CircleCI platform. Orbs enable you to share,  standardize, and simplify config across your projects. You may also want to use orbs as a refererence for config best practices. Refer to the [CircleCI Orbs Registry](https://circleci.com/orbs/registry/) for the complete list of available orbs.

To use an existing orb in your 2.1 [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/#orbs-requires-version-21) file, invoke it with the `orbs` key. The following example invokes the [`hello-build` orb](https://circleci.com/orbs/registry/orb/circleci/hello-build) in the `circleci` namespace.

```
version: 2.1

orbs:
    hello: circleci/hello-build@v0.0.5

workflows:
    "Hello Workflow":
        jobs:
          - hello/hello-build
```

**Note:** If your project was added to CircleCI prior to 2.1, you must enable [Build Processing]({{ site.baseurl }}/2.0/build-processing/) to use the `orbs` key. 

Orbs consist of the following elements:

* Commands
* Jobs
* Executors 

### Commands
{:.no_toc}

Commands are reusable sets of steps that you can invoke with specific parameters within an existing job. For example, if you want to invoke the command `sayhello`, you would pass the parameter `to` as follows:

```
jobs
  myjob:
    docker:
      - image: "circleci/node:9.6.1"
    steps:
      - sayhello:
          to: "Lev"
```

### Jobs
{:.no_toc}

Jobs are comprised of two parts: a set of steps, and the environment they should be executed within. Jobs are defined in your build configuration or in an orb and enable you to define a job name in a map under the `jobs` key in a configuration, or in an external orb's configuration.

You must invoke jobs in the workflow stanza of `config.yml` file, making sure to pass any necessary parameters as subkeys to the job.


### Executors
{:.no_toc}

Executors define the environment in which the steps of a job will be run. When you declare a `job` in CircleCI configuration, you define the type of environment (e.g. `docker`, `machine`, `macos`, etc.) to run in, in addition to any other parameters of that environment, such as:

* environment variables to populate
* which shell to use
* what size `resource_class` to use

When you declare an executor in a configuration outside of `jobs`, you can use these declarations for all jobs in the scope of that declaration, enabling you to reuse a single executor definition across multiple jobs.

An executor definition has the following keys available (some of which are also available when using the `job` declaration):

* `docker`, `machine`, or `macos`
* `environment`
* `working_directory`
* `shell`
* `resource_class`

The example below shows a simple example of using an executor:

```
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
 ```

Notice in the above example that the executor `my-executor` is passed as the single value of the key `executor`. Alternatively, you can pass `my-executor` as the value of a `name` key under `executor`. This method is primarily employed when passing parameters to executor invocations. An example of this method is shown in the example below.

```
jobs:
  my-job:
    executor:
      name: my-executor
    steps:
      -run: echo outside the executor
```



## Key Concepts

Before using orbs, you should first familiarize yourself with some basic core concepts of Orbs and how they are structured and operate. Gaining a basic understanding of these core concepts will enable you to leverage Orbs and use them easily in your own environments.

### Development vs. Production Orbs
{:.no_toc}

Orbs may be published either as ```myorbnamespace/myorb@dev:foo``` or as a semantically versioned production orb `mynamespace/myorb@0.1.3`. Development orbs are mutable and expire after 90 days. Production Orbs are immutable and durable.

### Certified vs. 3rd-Party Orbs
{:.no_toc}

CircleCI has available a number of individual orbs that have been tested and certified to work with the platform. These orbs will be treated as part of the platform; all other orbs are considered 3rd-party orbs. **Note:** The Admin of your org must opt-in to 3rd-party uncertified orb usage on the Settings > Security page for your org.

<aside class="notice">
All orbs are open, meaning that anyone can use them and see their source. 
</aside>

## Design Methodology

Before using orbs, you may find it helpful to understand the various design decisions and methodologies that were used when these Orbs were designed. Orbs were designed with the following considerations:

* Orbs are transparent - If you can execute an orb, you and anyone else can view the source of that orb.
* Metadata is available - Every key can include a ```description``` key and an orb may include a `description` at the top level.
* Production orbs are always semantic versioned (semver'd) - CircleCI allows development orbs that have versions that start with `dev:`.
* Production orbs are immutable - Once an Orb has been published to a semantic version, the orb cannot be changed. This prevents unexpected breakage or changing behaviors in core orchestration.
* One registry (per install) - Each installation of CircleCI, including circleci.com, has only one registry where orbs can be kept.
* Organization Admins publish production orbs. Organization members publish development orbs - All namespaces are owned by an organization. Only the admin(s) of that organization can publish/promote a production orb. All organization members can publish development orbs.


## See Also
{:.no_toc}

[Reusing Config]({{site.baseurl}}/2.0/reusing-config/)
