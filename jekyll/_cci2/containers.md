---
layout: classic-docs
title: Using Containers
categories: [how-to]
description: How to leverage CircleCI containers
---

This document describes the basics of containers and how to leverage the containers in your plan to speed up your job and workflow runs. Please note: container-based plans will soon be deprecated in favor of using CircleCI's new [usage plans](https://circleci.com/pricing/usage/). If your builds are queuing with a Container-based plan, consider signing up for a CircleCI usage-based plan to mitigate queuing and to enjoy other benefits.

You can read about the new usage-based plans in detail [in this document]({{ site.baseurl }}/2.0/credits/).


## Overview

Every change committed to your version control system triggers CircleCI to checkout your code and run your job workflow inside a fresh, on-demand, isolated container with access to the following, depending on your plan:

- **Concurrency** - Utilizing multiple containers to run multiple builds at the same time. To take advantage of concurrency, configure your development workflow using the [Orchestrating Workflows document]({{ site.baseurl }}/2.0/workflows/) and run your jobs in parallel as shown in the [Sample 2.0 Config Files document]({{ site.baseurl }}/2.0/sample-config/#sample-configuration-with-parallel-jobs).

- **Parallelism** - Splitting tests across multiple containers, allowing you to dramatically speed up your test suite. Update your `.circleci/config.yml` file to run your tests in parallel as described in the [Configuring CircleCI]({{ site.baseurl }}/2.0/configuration-reference/#parallelism) document. Learn how to update your config file to parallelize and split tests to decrease your build time by reading the [Running Tests in Parallel]({{ site.baseurl }}/2.0/parallelism-faster-jobs/) documentation.

## Getting Started

Linux plans start with the ability to run one workflow, without concurrency, at no charge. Purchasing a Linux plan enables you to use additional containers when you need them. Choose a paid or free plan during the signup process and change your plan in the CircleCI app Settings page later to meet changing business requirements.

Most CircleCI customers use two to three containers per full-time developer. Increase the number of containers to any level of parallelism and concurrency as your team or the complexity of your workflow grows.

Open source projects include three additional free containers to run jobs concurrently.

## Upgrading

Refer to the [FAQ about upgrading]({{ site.baseurl }}/2.0/faq/#how-do-i-upgrade-my-container-plan-with-more-containers-to-prevent-queuing) for step-by-step instructions to upgrade your plan.
