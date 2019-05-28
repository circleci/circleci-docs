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



### What Is Optimization?



### Configuring Your Environment To Use the CircleCI Platform and Orbs

Before performing any optimization tasks or actions you must first ensure that your environment and setup is configured to use the CircleCI platform and its associated resources, including CircleCI orbs. Setup and configuration is quick easy, only requiring you to perform the following tasks listed below.

1) Use CircleCI version 2.1 at the top of your `.circleci/config.yml` file.

`version: 2.1`

2) If you do not already have Pipelines enabled, go to **Project Settings -> Advanced Settings** and enable pipelines.

3) Add the orbs stanza below your version, invoking the orb:

`orbs:
  queue: circleci/<the orb you want to use>`

4) Use the specific elements for the orb you are using in your existing workflows and jobs.

5) Make sure to opt-in to use of third-party orbs on your organization’s **Security Settings** page.

### Optimization Recipes

The table below lists the different optimization tasks that can be performed using the CircleCI platform.

Optimization Recipe | Description 
------------|-----------
Single-Threading Builds (Queueing) | This section describes how you can use a specific queueing orb to ensure proper job and build completion without concurrency (queueing subsequent builds or jobs).
Caching | 
Fan-in / Fan-out | 
Workspace Forwarding | 

## Single-Threading Builds (Queuing)

One of the most common tasks you may encounter when using the CircleCI platform for builds and jobs is managing multiple jobs and builds simultaneously to ensure your operations do not fail because of system timeouts. This becomes especially important when you have multiple contributors and committers working in the same environment. Because the CircleCI platform was designed to handle multiple tasks simultaneously without performance degradation or latency, concurrency may sometimes become an issue if there are a large number of jobs being queued, waiting for a previous job to be completed, and the system timeout is set too low. In this case, one job will be completed, and other jobs may fail due to this timeout setting.

To better optimize builds and jobs and prevent concurrency and subsequent jobs failing because of timeout, CircleCI has developed an orb that specifically addresses these issues. By implementing this orb, you can greatly improve overall job and build performance and prevent job and build concurrency.

### Prerequisites

Before using the queueing orb, make sure you have met the following requirements:

* Your environment has been setup and configured for the CircleCI platform and CircleCI orbs, including:
 - Pipelines are in **Project Settings -> Advanced Settings**.
 - You have opted-in to using 3rd party orbs in your organization's **Security Settings** page.

#### Setting Up and Configuring Your Environment to use the CircleCI Platform and CircleCI Orbs

To configure your environment for the CircleCI platform and CircleCI orbs, follow the steps listed below.

1) Use CircleCI `version 2.1` at the top of your `.circleci/config.yml` file.

`version: 2.1`

2) If you do not already have Pipelines enabled, you'll need to go to **Project Settings -> Advanced Settings** to enable pipelines.

3) Add the `orbs` stanza below your version, invoking the orb:

`orbs:
  queue: eddiewebb/queue@1.1.2`

4) Use `queue` elements in your existing workflows and jobs.

5) Opt-in to use of third-party orbs on your organization’s **Security Settings** page.

