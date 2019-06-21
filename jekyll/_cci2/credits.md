---
layout: classic-docs
title: Using Credits
categories: [how-to]
description: How to leverage CircleCI credits
---

This document describes the basics of using credits with CircleCI. If you are on the legacy CircleCI container-based plan you may want to consider consulting the document on [using containers]({{site.baseurl}}/2.0/containers). If you want to switch from using containers to using credits, please [open a support ticket](https://support.circleci.com/hc/en-us/requests/new) requesting so.

## Overview

The CircleCI credit-based usage plans enable you to only pay for what you use, while also providing flexibility in customizing and scaling your team's CI solution. Credits are used by the minute at varying rates according to what build configuration you use.

The right plan for you and your team will depend on several factors:

- How many users are on your team
- How much support you need (community support, standard support, or premium support)
- If you want access to different machine-types
- If you need features such as Docker Layer Caching, concurrent builds, or build history

Let's look at how a Performance plan might use credits. With the Performance plan you have:

- At least 25,000 credits
- An unlimited number of user seats (at $15 a user)
- A variety of Docker/Linux machine-types (Small, Medium, Medium+, Large, or X-Large)
- The MacOS machine type

In this example, your team is divided into several groups working on different projects; some projects are larger while others are smaller and need less resources from a CI configuration. With credits it's possible to specify exactly where and when you need to maximize machine resources. For example, your team might use a `large` `resource_class` (with 4 vCPUs and 8gb of memory at a rate of 20 credits/minute) to speed up a build for a bigger project, while only using the `small` `resource_class` (1 vCPU, 2gb Memory, 5 credits/minute) for a smaller project that may not ship code as frequently, or where build time is inconsequential.

Consider taking a moment to look at the CircleCI [Usage](https://circleci.com/pricing/usage/) page to learn about what each CircleCI plan offers and how credits are distributed across different machine types.

## Configuring Your Credit Plan

To set up your desired plan, go to `Settings > Plan Overview` in the CircleCI web application. From there, select the plan that best fits your needs. You may find the [plan chart](https://circleci.com/pricing/usage/) on the Usage page helpful in determining what plan fits best.

## Free Plan

As with the CircleCI legacy container plan, CircleCI also supports a free-tier with the credit-based plan. You can still make use of many key features offered by CircleCI:

- Using Orbs
- Workspaces
- Dependency Caching

The free credit-based plan offers 2,500 build credits across medium-type machines (which offers 2 CPUs, 4gb of memory.) With this combination, credits are used at a rate of 10 credits/minute. On the free plan, you are also given a maximum of 3 user seats and a build history of 3 days.

## Performance Plan

Upgrading to a performance plan offers several improvements over the free plan:

- Access to all machine sizes for Docker/Linux based machines.
- Access to medium sized MacOS machines (4 CPUs, 8gb Ram at 50 credits/minute)
- Unlimited user seat count (at $15/seat)
- Access to Docker Layer Caching
- No queuing

## Docker Layer Caching

Docker Layer Caching (DLC) is available for 200 credits per job run. Read more about DLC in this [document]({{site.baseurl}}/2.0/docker-layer-caching).

## Questions And Comments

Consider reading our section on Billing in our [FAQ]({{site.baseurl}}/2.0/faq/#billing). For any further questions, do not hesitate to open a [open a support ticket](https://support.circleci.com/hc/en-us/requests/new).
