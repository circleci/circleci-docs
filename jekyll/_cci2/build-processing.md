---
layout: classic-docs
title: "Enabling Build Processing"
short-title: "Enabling Build Processing"
description: "How to enable the preview of build processing"
categories: [settings]
order: 1
---

This document describes how to enable the preview build processing engine if you need to trigger workflows from the CircleCI API or auto-cancel workflows.

## Getting Started
Enable build processing at the bottom of the Advanced section of Settings page for your project in the CircleCI app. 

The new build processing feature enables use of the new [API endpoint to trigger builds with workflows]({{ site.baseurl }}/api/v1-reference/#new-project-build) and the following use cases:

- New API endpoint to trigger builds, including running all workflows in the build
- Jobs named `build` will be wrapped in a workflows stanza by the processor
- Projects for which auto-cancel is enabled in the Advanced Settings will have workflows on non-default branches cancelled when a newer build is triggered on that same branch. 
- Use of configuration version 2.1 or higher requires build processing to be on.

**Notes:** It is important to carefully consider the impact of enabling the auto-cancel feature, for example, if you have configured automated deployment jobs on non-default branches. 

## Troubleshooting

Build processing errors will appear on the Jobs page or the Workflows page. When migrating an existing project to build processing, you may safely go back by disabling the radio button for the build processing feature on your Advanced Settings for your project if jobs or workflows fail the new build processing service.

## Limitations
CircleCI is committed to achieving backwards compatibility in almost all cases, and most projects that enable build processing will have no effect on existing builds. Let us know if you experience breaking builds that worked before you turned on build processing but broke after you turned it on. 

- If you use `<<` in your shell commands (most commonly found in use of heredocs) you will need to escape them using backslash `\` as in `\<<` in order to use version 2.1 or higher of configuration.
- Build processing is **not** fully backwards-compatible with the 1.1 API endpoint to trigger arbitrary jobs - you may experience unexpected or inconsistent results if you use this endpoint after turning on Build Processing. Alternatively, you can use the [build-triggering endpoint in the 1.1 API](https://circleci.com/docs/api/v1-reference/#new-project-build) introduced in September 2018. Please keep in mind that this build triggering API endpoint does **not** accept parameters or workflow or job filters. If you make heavy use of those API features and want to use Build Processing please contact your CircleCI account team.

## Giving Feedback
1. Come to [CircleCI Discuss](https://discuss.circleci.com/t/2-1-config-and-build-processing/24102) to post feedback.
2. Tweet @circleci with thoughts
3. Vote or add to our [Ideas board](https://circleci.com/ideas/)

## See Also

Refer to the [Skipping and Cancelling Builds]({{ site.baseurl }}/2.0/skip-build/#auto-cancelling-a-redundant-build) document for more details.
