---
layout: classic-docs
title: "Enabling Pipelines"
short-title: "Enabling Pipelines"
description: "How to enable pipelines"
categories: [settings]
order: 1
---

This document describes how to enable the pipelines engine if you need to trigger workflows from the CircleCI API or auto-cancel workflows. Pipelines are not currently available on self hosted installations of CircleCI Server.

* TOC
{:toc}

## Getting Started
{:.no_toc}

Most projects will have Pipelines enabled by default. Verify the project pipeline setting in the Advanced section of your project's Settings page in the CircleCI app. **Note:** Pipelines are compatible with v2 and v2.1 configurations of CircleCI.

## What are Pipelines?

Pipelines are our name for the full set of configurations you run when you trigger work on your projects in CircleCI. Pipelines contain your workflows, which coordinate jobs.

## Benefits of Using Pipelines

The pipelines feature enables use of the new [API endpoint to trigger builds with workflows](https://circleci.com/docs/api/#trigger-a-new-build-by-project-preview) and the following use cases:

{% include snippets/pipelines-benefits.adoc %}

## Implications of Using Pipelines

When using pipelines, please note the following implications of pipelines:

- Both 2.0 and 2.1 configurations wrap the 'build' job in a workflow if no 'workflows' are defined.
- API 1.1 job triggering works via the Access Control List (ACL) for both 2.0 and 2.1 configurations.
- If no builds or workflows are defined, you will receive an error.

## Transitioning to Pipelines

The following sections outline the process of transitioning to pipelines.

### Pipelines with 2.0 Configuration
{:.no_toc}

When using 2.0 configuration in combination with pipelines, CircleCI will inject the `CIRCLE_COMPARE_URL` environment variable into all jobs for backwards compatibility. This environment variable is generated in a different way to the version that is available in legacy jobs, and is not always available – it is not injected when there is no meaningful previous revision, for example, on the first push of commits to an empty repository, or when a new branch is created/pushed without any additional commits.

## Opting In to Pipelines on a Branch

There are two main ways to try out pipelines on a branch without committing to changing the project-wide setting:

1. Use version 2.1 configuration
2. Use version 2.0 configuration and include the [`experimental` stanza](#using-the-experimental-stanza)

**Note:** these methods currently apply to webhooks as well as the version 2 "pipeline trigger" API, but not the version 1.1 "job trigger" API yet. Support for using the version 1.1 API with pipelines will be announced soon.

If you have used the latest features in CircleCI version 2.1 configuration and/or orbs, then you already have pipelines enabled for your project. Also, all projects added after September 1, 2018 already have pipelines enabled by default. If your project does not yet have pipelines enabled, you can find pipelines under “Advanced Settings” in your project’s settings page. If you don’t see that option on your project’s settings page, this means your project already has pipelines enabled.

### Using Version 2.1 Configuration
{:.no_toc}

Using configuration version `2.1` will automatically enable the use of pipelines and allow the use of `2.1`-exclusive features, for example, [pipeline values](https://circleci.com/docs/2.0/pipeline-variables/#pipeline-values).

### Using the `experimental` Stanza
{:.no_toc}

There is also a configuration stanza that you can use to enable pipelines using a version 2.0 configuration. An example of this stanza is shown below:

```yaml
experimental:
  pipelines: true
```

## Giving Feedback
{:.no_toc}

If you have feedback, suugestions, or comments:

- Tweet @circleci with thoughts
- Vote or add to our [Ideas board](https://ideas.circleci.com/)

## See Also
{:.no_toc}

Refer to the [Skipping and Cancelling Builds]({{ site.baseurl }}/2.0/skip-build/#auto-cancelling-a-redundant-build) document for more details.
