---
layout: classic-docs
title: "Enabling Build Processing"
short-title: "Enabling Build Processing"
description: "How to enable the preview of build processing"
categories: [settings]
order: 1
---

# CircleCI Build Processing

This document describes how to enable the preview build processing engine if you need to trigger workflows from the CircleCI API.

## Getting Started
Enable build processing at the bottom of the Advanced section of Settings page for your project in the CircleCI app. 

The new build processing feature enables use of the new [API endpoint to trigger builds with workflows]({{ site.baseurl }}/api/v1-reference/#projects) and the following use cases:

- New API endpoint to trigger builds, including running all workflows in the build
- Jobs named `build` will be wrapped in a workflows stanza by the processor

## Troubleshooting

Errors will appear on the Jobs page or the Workflows page. You may safely go back by disabling the radio button for this feature on your Advanced Settings for your project if jobs or workflows fail the new build processing.

## Limitations
We are committed to achieving backwards compatibility in almost all cases, and we expect for most projects turning on build processing will have no effect on existing builds. Please let us know if you experience breaking builds that worked before you turned on build processing but broke once you turned it on. 

- Build processing is **not** fully backwards-compatible with existing API calls to trigger arbitrary jobs
- The new build triggering API endpoint does **not** accept parameters and workflow or job filters
- UI for Rerun of a job or rerun the workflow of the job is **not** yet implemented

## Giving Feedback
1. Come to [CircleCI Discuss](https://discuss.circleci.com/t/2-1-config-and-build-processing/24102) to post feedback.
2. Tweet @circleci with thoughts
3. Vote or add to our [Ideas board](https://circleci.com/ideas/)
