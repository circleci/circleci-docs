---
layout: classic-docs
title: "Working with Pipelines"
short-title: "Enabling Pipelines"
description: "How to work effectively with CircleCI pipelines"
categories: [settings]
order: 1
version:
- Cloud
---

This document describes how to enable the pipelines engine if you need to trigger workflows from the CircleCI API or auto-cancel workflows. Pipelines are not currently available on self hosted installations of CircleCI Server.

* TOC
{:toc}

## What are pipelines?

CircleCI Pipelines encompass the full set of workflows you run when triggering work on your projects in CircleCI. Workflows coordinate the jobs defined within your project configuration.

## Benefits of using pipelines

Pipelines offer the following benefits:

{% include snippets/pipelines-benefits.adoc %}

## Implications of pipelines

When using pipelines, please note the following:

- If no builds or workflows are defined, you will receive an error.

## Transitioning to pipelines

The following sections outline the process of transitioning to pipelines.

### Pipelines with 2.0 configuration
{:.no_toc}

When using 2.0 configuration in combination with pipelines, CircleCI will inject the `CIRCLE_COMPARE_URL` environment variable into all jobs for backwards compatibility. This environment variable is generated in a different way to the version that is available in legacy jobs, and is not always available – it is not injected when there is no meaningful previous revision, for example, on the first push of commits to an empty repository, or when a new branch is created/pushed without any additional commits.

## Giving feedback
{:.no_toc}

If you have feedback, suggestions, or comments:

- Tweet @circleci with thoughts
- Vote or add to our [Ideas board](https://ideas.circleci.com/)

## See also
{:.no_toc}

Refer to the [Skipping and Cancelling Builds]({{ site.baseurl }}/2.0/skip-build/#auto-cancelling-a-redundant-build) document for more details.
