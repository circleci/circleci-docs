---
layout: classic-docs
title: "CircleCI Optimizations Cookbook"
short-title: "Optimizations Cookbook"
description: "Starting point for Optimizations Cookbook"
categories: [getting-started]
order: 1
---

The *CircleCI Optimizations Cookbook* is a collection of individual use cases (referred to as "recipes") that provide you with detailed, step-by-step instructions on how to perform various optimization tasks using CircleCI resources. This guide, and it associated sections, will enable you to quickly and easily perform easily repeatable optimization tasks on the CircleCI platform.

* TOC
{:toc}

## Introduction

When work with the CircleCI platform, one of the most critical tasks you will want to complete is to optimize your jobs, builds, workflows, and other tasks to prevent performance degradation, latency, and concurrency. Optimizing your tasks is not simply a function of lessening the workload or number of tasks, but rather, reviewing your optimization and caching strategies to ensure you are meeting your business and technical requirements while also maintaining stability and reliability.

CircleCI has developed several different approaches you may wish to use to better optimize these tasks while also leveraging the power of the CircleCI platform and its associated resources (e.g. orbs). The sections below describe various strategies and methodologies you can use to optimize your organization tasks.

### Optimization Recipes

The table below lists the different optimization tasks that can be performed using the CircleCI platform.

Recipe | Description 
------------|-----------
Single-Threading Builds (Queueing) | This section describes how you can use a specific single-threading (queueing) orb to ensure proper job and build completion without concurrency (queueing subsequent builds or jobs).
Caching |  This section describes how you can use different caching strategies in your implemenations to optimize your builds and workflows.

## Single-Threading Builds (Queuing)

One of the most common tasks you may encounter when using the CircleCI platform for builds and jobs is managing multiple jobs and builds simultaneously to ensure your operations do not fail because of system timeouts. This becomes especially important when you have multiple contributors and committers working in the same environment. Because the CircleCI platform was designed to handle multiple tasks simultaneously without performance degradation or latency, concurrency may sometimes become an issue if there are a large number of jobs being queued, waiting for a previous job to be completed before the new job can be initiated, and the system timeout is set too low. In this case, one job will be completed, and other jobs may fail due to this timeout setting.

To better optimize builds and jobs and prevent concurrency and subsequent jobs failing because of timeout, CircleCI has developed a single-threading (queueing) orb that specifically addresses these performance issues. By invoking this orb, you can greatly improve overall job and build performance and prevent concurrency.

**Note**For more detailed information about the CircleCI Queueing orb, refer to the following CircleCI pages:
- Queueing and Single Threading Overview - https://github.com/eddiewebb/circleci-queue
- CircleCI Queueing Orb - https://circleci.com/orbs/registry/orb/eddiewebb/queue#quick-start

### Setting Up and Configuring Your Environment to use the CircleCI Platform and CircleCI Orbs

To configure your environment for the CircleCI platform and CircleCI orbs, follow the steps listed below.

1) Use CircleCI `version 2.1` at the top of your `.circleci/config.yml` file.

`version: 2.1`

2) If you do not already have Pipelines enabled, you'll need to go to **Project Settings -> Advanced Settings** to enable pipelines.

3) Add the `orbs` stanza below your version, invoking the orb:

`orbs:
  queue: eddiewebb/queue@1.1.2`

4) Use `queue` elements in your existing workflows and jobs.

5) Opt-in to use of third-party orbs on your organization’s **Security Settings** page.

### Blocking Workflows

One of the easiest ways to prevent workflow concurrency using the CircleCI Single-Threading orb is to enable "blocking" of any workflows with an earlier timestamp. By setting the `block-workflow` parameter value to `true`, all workflows will be forced to run consecutively, not concurrently, thereby limiting the number of workflows in the queue. In turn, this will also improve overall performance while making sure no workflows are discarded.


```yaml
Version: 2.1
docker:
  - image: 'circleci/node:10'
parameters:
  block-workflow:
    default: true
    description: >-
      If true, this job will block until no other workflows with an earlier
      timestamp are running. Typically used as first job.
    type: boolean
  consider-branch:
    default: true
    description: Should we only consider jobs running on the same branch?
    type: boolean
  consider-job:
    default: false
    description: Deprecated. Please see block-workflow.
    type: boolean
  dont-quit:
    default: false
    description: >-
      Quitting is for losers. Force job through once time expires instead of
      failing.
    type: boolean
  only-on-branch:
    default: '*'
    description: Only queue on specified branch
    type: string
  time:
    default: '10'
    description: How long to wait before giving up.
    type: string
  vcs-type:
    default: github
    description: Override VCS to 'bitbucket' if needed.
    type: string
steps:
  - until_front_of_line:
      consider-branch: <<parameters.consider-branch>>
      consider-job: <<parameters.consider-job>>
      dont-quit: <<parameters.dont-quit>>
      only-on-branch: <<parameters.only-on-branch>>
      time: <<parameters.time>>
      vcs-type: <<parameters.vcs-type>>
```

## Caching

One of the quickest and easiest ways to optimize your builds and workflows is to implement specific caching strategies so you can use existing data from previous builds and workflows. Whether you choose to use a package management application (e.g. Yarn, Bundler, etc), or manually configure your caching, utilizing the best and most effective caching strategy may improve overall performance. In this section, several different use cases are described that may assist you in determining which caching method is best for your implementation.

Because caching is a critical aspect of optimizing builds and workflows, you should first familiarize yourself with the following page that describes caching and how various strategies can be optimized:

- Caching - https://circleci.com/docs/2.0/caching/
