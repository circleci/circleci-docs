---
layout: classic-docs
title: Using Containers
categories: [how-to]
description: How to leverage CircleCI containers
version:
- Cloud
---

Container-based plans will be deprecated from July 18th 2022. For steps to migrate to a usage-based plan, see this [Discuss post](https://discuss.circleci.com/t/migrating-from-a-container-paid-plan-to-a-usage-based-plan/42938/1).
{: class="alert alert-warning"}

You can read about usage-based plans in detail [in this document]({{ site.baseurl }}/credits/).

## Overview
{: #overview }

Every change committed to your version control system triggers CircleCI to checkout your code and run your job workflow inside a fresh, on-demand, isolated container or virtual machine with access to the following, depending on your plan:

- **Concurrency** - Utilizing multiple containers to run multiple jobs at the same time. To take advantage of concurrency, configure your development workflow using the [Orchestrating Workflows document]({{site.baseurl}}/workflows/) and run your jobs in parallel as shown in the [Sample Config Files document]({{site.baseurl}}/sample-config/#concurrent-workflow).

- **Parallelism** - Splitting tests across multiple containers, allowing you to dramatically speed up your test suite. Update your `.circleci/config.yml` file to run your tests in parallel as described in the [Configuring CircleCI]({{ site.baseurl }}/configuration-reference/#parallelism) document. Learn how to update your config file to parallelize and split tests to decrease your build time by reading the [Running Tests in Parallel]({{site.baseurl}}/parallelism-faster-jobs/) documentation.

## Migrating to a usage-based plan
{: #migrating-to-a-usage-based-plan }

Refer to [this Discuss posts](https://discuss.circleci.com/t/migrating-from-a-container-paid-plan-to-a-usage-based-plan/42938/1) for step-by-step instructions to migrate your plan, or [contact customer support](mailto:cs@circleci.com).
