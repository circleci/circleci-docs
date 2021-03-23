---
layout: classic-docs
title: "パイプラインの表示"
short-title: "パイプラインの表示"
description: "パイプラインの概要"
categories:
  - getting-started
order: 1
version:
  - Cloud
---

This document provides a summary of the Pipelines page in the CircleCI app and documents some of the changes to the CircleCI user interface.

## 概要

最近 CircleCI の Web インターフェイスの一部が変更されたことにお気付きかと思います。 We have some exciting changes that are rolling out regarding how your builds are being grouped and the user interface that presents that information. Let's begin by stating what a **Pipeline** is.

**Pipelines** represent the entire configuration that is run when you trigger work on your projects that use CircleCI. The entirety of a `.circleci/config.yml` file is executed by a pipeline.

When visiting your CircleCI dashboard you will be presented with the recent pipelines that have run in your organization/account.

## Jobs, tests, artifacts

A pipeline is composed of workflows, which are composed of jobs. By navigating from a pipeline to a specific job, you can access your job output, test results and artifacts through several tabs.

![]({{ site.baseurl }}/assets/img/docs/pipelines-job-step-test-artifact.png)

Further, the output of each job can be openened in a new tab (in either raw or formatted styling) with a unique link, making it share-able between team members.

![]({{ site.baseurl }}/assets/img/docs/pipelines-job-output.png)
