---
layout: classic-docs
title: "Enabling Pipelines"
short-title: "Enabling Pipelines"
description: "How to enable pipelines"
categories: [settings]
order: 1
---

This document describes how to enable the pipelines engine if you need to trigger workflows from the CircleCI API or auto-cancel workflows.

## Getting Started

Most projects will have Pipelines enabled by default. Verify the project pipeline setting in the Advanced section of your project's Settings page in the CircleCI app. **Note:** Pipelines are compatible with v2 and v2.1 configurations of CircleCI. Currently, Pipelines are not yet supported for private CircleCI Server installations.

## Benefits of Pipelines

The pipelines feature enables use of the new [API endpoint to trigger builds with workflows](https://circleci.com/docs/api/#trigger-a-new-build-by-project-preview) and the following use cases:

- New API endpoint to trigger builds, including running all workflows in the build.
- Jobs named `build` will be wrapped in a workflows stanza by the processor.
- Projects for which auto-cancel is enabled in the Advanced Settings will have workflows on non-default branches cancelled when a newer build is triggered on that same branch.
- Use of configuration version 2.1 or higher requires pipelines to be turned on.

**Notes:** It is important to carefully consider the impact of enabling the auto-cancel feature, for example, if you have configured automated deployment jobs on non-default branches.

## Troubleshooting

Pipeline errors will appear on the Jobs page or the Workflows page.

Please note that once pipelines are enabled for a project on a usage plan, they may not be
turned off without filing a ticket with CircleCI support. See `limitations` below.

## Limitations
CircleCI is committed to achieving backwards compatibility in almost all cases, and most projects that enable pipelines will have no effect on existing builds. Let us know if you experience breaking builds that worked before you turned on pipelines, but broke after you turned it on.

- Anchors will be processed and resolved instead of appearing in the app config.
- If you use `<<` in your shell commands (most commonly found in use of heredocs) you will need to escape them using backslash `\` as in `\<<` in order to use version 2.1 or higher of configuration. 2.0 configuration will not be affected.
- Pipelines are **not** fully backwards-compatible with the 1.1 API endpoint to trigger arbitrary jobs - you may experience unexpected or inconsistent results if you use this endpoint after turning on Pipelines. Alternatively, you can use the [build-triggering endpoint in the 1.1 API](https://circleci.com/docs/api/#trigger-a-new-build-by-project-preview) introduced in September 2018. Please keep in mind that this build triggering API endpoint does **not** accept parameters or workflow or job filters. If you make heavy use of those API features and want to use Pipelines, please contact your CircleCI account team.

## Giving Feedback

- Tweet @circleci with thoughts
- Vote or add to our [Ideas board](https://ideas.circleci.com/)

## See Also

Refer to the [Skipping and Cancelling Builds]({{ site.baseurl }}/2.0/skip-build/#auto-cancelling-a-redundant-build) document for more details.
