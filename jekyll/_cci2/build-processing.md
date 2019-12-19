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

## Benefits of Pipelines

The pipelines feature enables use of the new [API endpoint to trigger builds with workflows](https://circleci.com/docs/api/#trigger-a-new-build-by-project-preview) and the following use cases:

{% include snippets/pipelines-benefits.adoc %}

## Troubleshooting

Pipeline errors will appear on the Jobs page or the Workflows page.

Please note that once pipelines are enabled for a project on a usage plan, they may not be
turned off without filing a ticket with CircleCI support. See `limitations` below.

## Limitations
CircleCI is committed to achieving backwards compatibility in almost all cases, and most projects that enable pipelines will have no effect on existing builds. Let us know if you experience breaking builds that worked before you turned on pipelines, but broke after you turned it on.

- Anchors will be processed and resolved instead of appearing in the app config.
- If you use `<<` in your shell commands (most commonly found in use of heredocs) you will need to escape them using backslash `\` as in `\<<` in order to use version 2.1 or higher of configuration. 2.0 configuration will not be affected.
- Pipelines are **not** fully backwards-compatible with the 1.1 API endpoint to trigger arbitrary jobs - you may experience unexpected or inconsistent results if you use this endpoint after turning on Pipelines. Alternatively, you can use the [build-triggering endpoint in the 1.1 API](https://circleci.com/docs/api/#trigger-a-new-build-by-project-preview) introduced in September 2018. Please keep in mind that this build triggering API endpoint does **not** accept parameters or workflow or job filters. If you make heavy use of those API features and want to use Pipelines, please contact your CircleCI account team.
- Configuration version 2.0 will have the `CIRCLE_COMPARE_URL` environment variable injected into all jobs for backwards compatibility.

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

### Using Version 2.1 Configuration
{:.no_toc}

Using configuration version `2.1` will automatically enable the use of pipelines and allow the use of `2.1`-exclusive features, for example, [pipeline values](https://circleci.com/docs/2.0/pipeline-variables/#pipeline-values).

### Using the `experimental` Stanza
{:.no_toc}

There is a configuration stanza to enable pipelines using a version 2.0 configuration:

```yaml
experimental:
  pipelines: true
```

## Giving Feedback
{:.no_toc}

- Tweet @circleci with thoughts
- Vote or add to our [Ideas board](https://ideas.circleci.com/)

## See Also
{:.no_toc}

Refer to the [Skipping and Cancelling Builds]({{ site.baseurl }}/2.0/skip-build/#auto-cancelling-a-redundant-build) document for more details.
