---
layout: classic-docs
title: Using Credits
categories: [how-to]
description: How to leverage CircleCI credits
---

This document describes the basics of using credits with CircleCI. If you are on
the legacy CircleCI container-based plan you may want to consider consulting the
document on [using containers]({{site.baseurl}}/2.0/containers).

## Overview

Credits offer you flexibility to tailor your build configuration with the
features and tools CircleCI offers as you may need them. Using credits, you can
create custom builds for projects to maximize resources as you need them. 

For example, if you are on the Performance plan you will start with at least
25,000 credits. Your credits can be shared between machine types with varying levels
of resources. For a smaller project, you might use 5 credits/minute with a
`small` machine type, whereas projects that make use of
[workflows]({{site.baseurl}}/2.0/workflows) might use 15 or 20 credits a minute
for `Medium+` or `Large` machine types respectively, allowing you to run builds
that leverage concurrency and parallelism between vCPUs.

## Configuring Your Credit Plan

To set up your desired plan, go to `Settings > Plan Overview` in the CircleCI
web application. From there, select the plan that best fits your needs. You may
find the [plan chart](https://circleci.com/pricing/usage/) on the Usage Page helpful in determining what plan fits best.

## Free Plan

As with the CircleCI legacy container plan, CircleCI also supports a free-tier
with the credit-based plan. You can still make use of many key features offered
by CircleCI:

- Using Orbs
- Workspaces
- Dependency Caching 

The free credit-based plan offers 2,500 build credits across medium-type
machines (which offers 2 CPUs, 4gb of memory.) With this combination, credits
are used at a rate of 10 credits/minute. On the free plan, you are also given a
maximum of 3 user seats and a build history of 3 days.

## Performance Plan

Upgrading to a performance plan offers several improvements over the free plan:

- Access to all machine sizes for Docker/Linux based machines.
- Access to medium sized MacOS machines (4 CPUs, 8gb Ram at 50 credits/minute)
- Unlimited user seat count (at $15/seat)
- Access Docker Layer Caching 

Refer to the [FAQ about upgrading]({{ site.baseurl }}/2.0/faq/#how-do-i-upgrade-my-plan-with-more-containers-to-prevent-queuing) for step-by-step instructions about upgrading your plan.


