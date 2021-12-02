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

## Benefits of using pipelines
{: #benefits-of-using-pipelines }

The following features are available for use in your pipelines:

{% include snippets/pipelines-benefits.adoc %}

### Pipelines with 2.0 configuration
{: #pipelines-with-20-configuration }
{:.no_toc}

When using CircleCI cloud or server v3.x the CircleCI pipelines engine is automatically enabled. If, for whatever reason, you continue to use a 2.0 config, CircleCI will inject the `CIRCLE_COMPARE_URL` environment variable into all jobs for backwards compatibility.

This environment variable is generated in a different way compared to the version available in legacy jobs, and is not always available – it is not injected when there is no meaningful previous revision, for example, on the first push of commits to an empty repository, or when a new branch is created/pushed without any additional commits.

## See also
{: #see-also }
{:.no_toc}

Refer to the [Skipping and Cancelling Builds]({{ site.baseurl }}/2.0/skip-build/#auto-cancelling-a-redundant-build) document for more details.
