---
layout: classic-docs
title: Using Credits
categories: [how-to]
description: Learn about the CircleCI credits-based plan system
version:
- Cloud
---

This document describes how to find the available resources regarding credits with CircleCI. If you are on the legacy CircleCI Container-based plan, you may want to consider consulting the document on [using containers]({{site.baseurl}}/containers). If you want to switch from using containers to using credits, please [open a support ticket](https://support.circleci.com/hc/en-us/requests/new) requesting so.

## Overview
{: #overview }

Credits are used on CircleCI's Free, Performance, Scale, and Server plans. Each plan offers key CI/CD features, and some plans offer customization options depending on your needs.

The right plan for you and your team will depend on several factors:

- How many users are on your team
- How much support you need (community and free support, standard support, or premium support)
- If you want access to different machine-types and resource classes
- If you want a limited or unlimited number of self-hosted runners

You can view the [Plan Overview]({{site.baseurl}}/plan-overview) page for more information, or if you would like more details on what features are available per plan, view the individual plan pages:
- [Free Plan]({{site.baseurl}}/plan-free)
- [Performance Plan]({{site.baseurl}}/plan-performance)
- [Scale Plan]({{site.baseurl}}/plan-scale)
- [Server Plan]({{site.baseurl}}/plan-server)

Consider taking a moment to look at the CircleCI [Pricing](https://circleci.com/pricing/) page to learn more about how credits are distributed across different machine types and resource classes.

## Managing credit usage
{: #managing-credit-usage }

Properly managing network and storage usage can potentially lower the amount of credits used per month. If you would like to find out more about managing network and storage usage, please see the [Persisting Data]({{site.baseurl}}/persist-data/) page.

## Open source credit usage
{: #open-source-credit-usage }

Organizations on our Free plan receive a set amount of free credits per month for Linux open source builds. Using our Free plan and keeping your repository public will enable this for you.  Open-source credit availability and limits will not be visible in the UI.

If you build on macOS, we also offer organizations on our Free plan a number of free credits every month to use on macOS open source builds. For access to this, contact our team at billing@circleci.com.

## Troubleshooting: Am I charged if my build is "queued" or "preparing"?
{: #troubleshooting }

No. If you are notified that a job is "queued", it indicates that your job is waiting due to a **plan** or **concurrency** limit. If your job indicates that it is "preparing", it means that CircleCI is setting up or _dispatching_ your job so that it may run.

If your jobs use the Docker executor and you find that they are "preparing" for quite some time, you may be able to reduce the delay by using more recent docker images. See [Building Docker Images]({{site.baseurl}}/building-docker-images/) for more information.

## Questions and comments
{: #questions-and-comments }

Consider reading our section on Billing in our [FAQ]({{site.baseurl}}/faq/#billing). For any further questions, do not hesitate to open a [open a support ticket](https://support.circleci.com/hc/en-us/requests/new).
