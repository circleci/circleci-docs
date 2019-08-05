---
layout: classic-docs
title: "Introduction to Authoring an Orb"
short-title: "Authoring Orbs Introduction"
description: "Starting point for how to authoring an orb"
categories: [getting-started]
order: 1
---
## Introduction to Orb Authoring

Orbs are reusable packages of CircleCI configuration that you may share across projects, enabling you to create encapsulated, parameterized commands, jobs, and executors that can be [used across multiple projects]({{ site.baseurl }}/2.0/using-orbs/). 

[Orbs]({{ site.baseurl }}/2.0/orb-intro/) are made available for use in a configuration through the `orbs` key in the top level of your 2.1 [.circleci/config.yml]({{ site.baseurl }}/2.0/configuration-reference/) file.

If you have determined that using an existing CircleCI or partner-certified orb will not address your specific workflow or job, then you may choose to author your own orb. Although more time-consuming than using an existing orb from the [CircleCI Orbs Registry](https://circleci.com/orbs/registry/), authoring your own orb will enable you to create a pre-packaged configuration that suits your particular workflow. These pages will walk you through the steps required to author an orb, validate its configuration, and then publish this newly-created orb to the CircleCI Orb Registry.

## Key Concepts

Before authoring an orb, you should first familiarize yourself with some basic core concepts of orbs and how they are structured and operate. Gaining a basic understanding of these core concepts will enable you to write fully-featured orbs you can leverage and use in your workflows.

Orbs consist of the following three elements:

- Commands
- Jobs
- Executors

### Commands

Commands are reusable sets of steps that you can invoke with specific parameters within an existing job. For example, if you want to invoke the command `sayhello`, you would pass the parameter `to` as follows:

version: 2.1
jobs:
  myjob:
    docker:
      - image: "circleci/node:9.6.1"
    steps:
      - myorb/sayhello:
          to: "Lev"
### Jobs

Jobs are comprised of two parts: a set of steps, and the environment they should be executed within. Jobs are defined in your build configuration or in an orb and enable you to define a job name in a map under the jobs key in a configuration, or in an external orb’s configuration.

You must invoke jobs in the workflow stanza of `config.yml file`, making sure to pass any necessary parameters as subkeys to the job.

### Executors

Executors define the environment in which the steps of a job will be run. When you declare a job in CircleCI configuration, you define the type of environment (e.g. docker, machine, macos, etc.) to run in, in addition to any other parameters of that environment, such as:

- environment variables to populate
- which shell to use
- what size resource_class to use

When you declare an executor in a configuration outside of jobs, you can use these declarations for all jobs in the scope of that declaration, enabling you to reuse a single executor definition across multiple jobs.

An executor definition has the following keys available (some of which are also available when using the job declaration):

- docker, machine, or macos
- environment
- working_directory
- shell
- resource_class

## Orbs Configuration

The table below describes each element that makes up an orb.

**Note** Orbs require CircleCI version 2.1.

Key | Required | Type | Description
----|-----------|------|------------
orbs | N | Map | A map of user-selected names to either: orb references (strings) or orb definitions (maps). Orb definitions must be the orb-relevant subset of 2.1 config.
executors | N | Map | A map of strings to executor definitions.
commands | N | Map | A map of command names to command definitions. 

### Orb Configuration Example

The following example calls an Orb named `hello-build` that exists in the certified `circleci` namespace.

```
version: 2.1
orbs:
    hello: circleci/hello-build@0.0.5
workflows:
    "Hello Workflow":
        jobs:
          - hello/hello-build
```
In the above example, `hello` is considered the orbs reference; whereas `circleci/hello-build@0.0.5` is the fully-qualified orb reference.

## See Also
{:.no_toc}

- Refer to Orb Introduction (link needed here), for a high-level overview of CircleCI orbs.
- Refer to Set Up The CircleCI CLI (link needed here) for steps on how to set up the CircleCI CLI.
- Refer to Author Your Orb (link needed here) for more detailed information on how to author an orb.
- Refer to Test and Publish Your Orb (link needed here) for more information on how to test and publish your orb.
