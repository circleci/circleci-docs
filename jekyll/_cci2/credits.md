---
layout: classic-docs
title: Using Credits
categories: [how-to]
description: How to leverage CircleCI credits
version:
- Cloud
---

This document describes the basics of using credits with CircleCI. If you are on the legacy CircleCI Container-based plan you may want to consider consulting the document on [using containers]({{site.baseurl}}/2.0/containers). If you want to switch from using containers to using credits, please [open a support ticket](https://support.circleci.com/hc/en-us/requests/new) requesting so.

## Overview
{: #overview }

The CircleCI credit-based usage plans enable you to only pay for what you use, while also providing flexibility in customizing and scaling your team's CI solution. Credits are consumed by the second at varying rates according to what build configuration you use.

The right plan for you and your team will depend on several factors:

- How many users are on your team
- How much support you need (community support, standard support, or premium support)
- If you want access to different machine-types
- If you need features such as Docker Layer Caching, concurrent builds, or build history

Let's look at how a Performance plan might use credits. In this example, your team is divided into several groups working on different projects; some projects are larger while others are smaller and need less resources from a CI configuration. With credits, it is possible to specify exactly where and when you need to maximize machine resources.

For example, your team might use a `large` `resource_class` (4 vCPUs and 8gb of memory) and make use of more credits/minute to speed up a build for a bigger project, while only using the `small` `resource_class` (1 vCPU, 2gb Memory) with less credits/minute for a smaller project that may not ship code as frequently, or where build time is inconsequential.

Consider taking a moment to look at the CircleCI [Pricing](https://circleci.com/pricing/) page to learn about what each CircleCI plan offers and how credits are distributed across different machine types.

## Configuring your credit plan
{: #configuring-your-credit-plan }

To set up your desired plan, go to `Settings > Plan Overview` in the CircleCI web application. From there, select the plan that best fits your needs.

## Free plan
{: #free-plan }

As with the CircleCI legacy Container plan, CircleCI also supports a free-tier with the usage-based plan. By using the Free plan, you can take advantage of a large number of premium features that will allow your team to be more productive, efficient and fast.

The free usage-based plan offers a set amount of build credits across medium-type machines per week (which offers 2 CPUs, 4gb of memory). With this combination, a small number of credits are charged per minute and there is no limit on user seats. Refer to the [Pricing](https://circleci.com/pricing/) page for more information on credit amounts.

The table below lists some of the features you will be able to use on the Free Plan.

| Feature | Description |
|-------|-------------|
| UNLIMITED USERS | You may have an unlimited number of users. This enables you to have different teams and groups working together on projects |
Docker, Linux and Windows (macOS coming soon) are available for us |
| CONCURRENCY AND TEST SPLITTING | Faster builds and test splitting equals increased productivity and speed when building on CircleCI |
| SELF HOSTED RUNNERS | Increased number of runners you can use when working on CircleCI |
| FLAKY TEST DETECTION | Improved inisghts are available to help analyze and detect flaky tests |
| UNLIMITED PRIVATE ORBS | Streamline team collaboration by sharing CircleCI Orbs across teams and groups |
| DOCKER LAYER CACHING | Efficiency features designed specifically for Docker, providing improved speed and efficiency |
{: class="table table-striped"}

### Unlimited users
{: #unlimited-users }

When you use the free plan, you may have an unlimited number of users building and developing on CircleCI. This allows you to collaborate with more teams and groups within your organization, which can increase speed, productivity, and efficiency.

### Expansive list of available resource classes
{: #expansive-list-of-available-resource-classes }

When using the free plan, you have the widest array of resource classes on Docker, Linux, Windows and macOS (coming soon) available to use. With this flexibility in choosing resource classes, you can be sure to choose the right compute resources for your job.

For more information about these resources, please refer to the the [Executors and Images](https://circleci.com/docs/2.0/executor-intro/) page.

### Concurrency and test splitting
{: #concurrency-and-test-splitting }

The ability to run multiple tests at the same time (concurrently) is a very powerful feature that allows you to decrease your build times and shorten feedback cycles by running jobs concurrently with workflows. Because one of the most important contributors to developer efficiency is being able to retrieve test results quickly, CircleCI can intelligently split tests to get you your test results faster using test splitting.

For more information about how to utilize test splitting, refer to the [Running Tests In Parallel](https://circleci.com/docs/2.0/parallelism-faster-jobs/#using-test-splitting-with-python-django-tests) page.

### Self hosted runners
{: #self-hosted-runners }

CircleCI runners allow you to use your own infrastructure for running jobs, providing more granular control of your own environment and flexibility in building and testing on a wide variety of architectures.

For more information about using CircleCI runners, please see the [CircleCI Runner Overview](https://circleci.com/docs/2.0/runner-overview/) page.

### Flaky test detection
{: #flaky-test-detection }

Flaky test detection is an important tool that helps you determine why a test may pass one time, and then fail the next time. Because the average failed workflow wastes approximately 30 minutes, having the ability to identify flaky tests can save you significant amounts of time in your builds and workflows.

For more detailed information about flaky tests, refer to the [Test Insights](https://circleci.com/docs/2.0/insights-tests/#flaky-tests) page.

### Unlimited private orbs
{: #unlimited-private-orbs }

CircleCI orbs are shareable configuration packages that enable developers to create private, standardardized configurations that can be used across an organization by different teams.

For more information on private orbs, refer to the [Orbs Introduction](https://circleci.com/docs/2.0/orb-intro/#private-orbs-vs-public-orbs) page.

### Docker layer caching
{: #docker-layer-caching }

Reducing the time it takes to build a Docker images is an important consideration for developers who consistently use these images in their workflows.  Docker Layer Caching (DLC) is a great feature to use if building Docker images is a regular part of your CI/CD process. DLC will save image layers created within your jobs, rather than impact the actual container used to run your job.

For more information about Docker Layer Caching, please refer to the [Enabling Docker Layer Caching](https://circleci.com/docs/2.0/docker-layer-caching/) page.

## Performance plan
{: #performance-plan }

Upgrading to a Performance plan offers several improvements over the Free plan:

- Access to all machine sizes for Docker/Linux based machines
- Access to medium sized MacOS machines
- Scalable user seat count
- Access to Docker Layer Caching
- No queuing
- Support

## Open source credit usage
{: #open-source-credit-usage }

Organizations on our Free plan receive a set amount of free credits per month for Linux open source builds. Using our Free plan and keeping your repository public will enable this for you.  Open-source credit availability and limits will not be visible in the UI.

If you build on macOS, we also offer organizations on our Free plan a number of free credits every month to use on macOS open source builds. For access to this, contact our team at billing@circleci.com.

## Docker layer caching
{: #docker-layer-caching }

You are able to use credits per run job for Docker Layer Caching (DLC). DLC is only available on the Performance plan. Read more about DLC in this [document]({{site.baseurl}}/2.0/docker-layer-caching).

## Troubleshooting
{: #troubleshooting }

### Am I charged if my build is "queued" or "preparing"?
{: #am-i-charged-if-my-build-is-queued-or-preparing }

No. If you are notified that a job is "queued", it indicates that your job is
waiting due to a **plan** or **concurrency** limit. If your job indicates that
it is "preparing", it means that CircleCI is setting up or _dispatching_ your
job so that it may run.

If you find that jobs are "preparing" for quite some time, you may be able to
reduce it if your jobs use the docker executor; try using more recent docker
images to decrease preparation time.

## Questions and comments
{: #questions-and-comments }

Consider reading our section on Billing in our [FAQ]({{site.baseurl}}/2.0/faq/#billing). For any further questions, do not hesitate to open a [open a support ticket](https://support.circleci.com/hc/en-us/requests/new).
