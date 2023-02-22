---
layout: classic-docs
title: "Pipeline Processing"
description: "This document describes CircleCI pipelines, what they encompass, and some features available to use in your pipelines"
categories: [settings]
order: 1
version:
- Cloud
- Server v3.x
---

This document describes how your projects are processed using our pipelines engine and some of the features available to use in your pipelines. Pipelines are available on CircleCI cloud and self hosted installations of CircleCI server v3.x.

* TOC
{:toc}

## What are pipelines?
{: #what-are-pipelines }

CircleCI pipelines are the highest-level unit of work, encompassing a project's full `.circleci/config.yml` file. Pipelines include your workflows, which coordinate your jobs. They have a fixed, linear lifecycle, and are associated with a specific actor. Pipelines trigger when a change is pushed to a project that has a CircleCI configuration file included, and can also be scheduled, triggered manually through the CircleCI app, or using the API.

Pipelines are not available on installations of CircleCI server v2.x.

The following features are available for use in your pipelines:

{% include snippets/pipelines-benefits.adoc %}

## Transitioning to pipelines
{: #transitioning-to-pipelines }

When migrating from a server v2.x to a v3.x installation you will have project configurations made before the introduction of pipelines. Pipelines are automatically enabled for server v3.x installations so all you need to do is change your project configurations (`.circleci/_config.yml`) to `version: 2.1` to access all the features described in the section above.

## See also
{: #see-also }
{:.no_toc}

Refer to the [Skipping and Cancelling Builds]({{ site.baseurl }}/skip-build/#auto-cancelling-a-redundant-build) document for more details.
