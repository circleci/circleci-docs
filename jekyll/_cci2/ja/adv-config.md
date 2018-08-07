---
layout: classic-docs
title: "Advanced Config"
short-title: "Advanced Config"
description: "Summary of advanced config options and features"
categories:
  - migration
order: 2
---
CircleCI supports many advanced configuration options and features:

<hr />

| Parallelism                                                                                                                                                                                                                                                                                                                     | Advanced Caching                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Automatic provisioning of containers as they are freed without waiting for other jobs to finish. Configure Workflows to [run jobs in parallel]({{ site.baseurl }}/2.0/workflows/#workflows-configuration-examples) or [run tests in parallel by splitting and globbing files]({{ site.baseurl }}/2.0/parallelism-faster-jobs/). | Speed up builds by caching files from run to run using keys that are easy to control with [granular caching options]({{ site.baseurl }}/2.0/caching/) for cache save and restore points throughout your jobs. Cache any files from run to run using keys you can control. |

<hr />

| First-class Docker Support                                                                                                                                                                                                                                                   | Docker Commands                                                                                                                                                                                                                                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Choose any [image]({{ site.baseurl }}/2.0/circleci-images/) to run your job steps, customizable on a per-job basis on a particular Git branch. Speed up your run times with [advanced layer caching]({{ site.baseurl }}/2.0/docker-layer-caching/). &nbsp;&nbsp;&nbsp;&nbsp; | [Build docker images]({{ site.baseurl }}/2.0/building-docker-images/) with full docker CLI support and full support for [docker compose]({{ site.baseurl }}/2.0/docker-compose/). Support for all programming languages and [custom database environments]({{ site.baseurl }}/2.0/databases/) that offer more predictable output. |

<hr />

| Shell Scripting                                                                                                     | Browser Testing                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Anything you can do in a [shell script]({{ site.baseurl }}/2.0/using-shell-scripts/), you can automate in CircleCI. | You can configure your [browser-based tests]({{ site.baseurl }}/2.0/browser-testing/) to run whenever a change is made, before every deployment, or on a certain branch. |