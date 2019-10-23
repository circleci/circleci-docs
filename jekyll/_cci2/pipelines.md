---
layout: classic-docs
title: "Pipelines"
short-title: "Pipelines"
description: "Introduction to Pipelines"
categories: [getting-started]
order: 1
---

This document provides a summary of the Pipelines page in the CircleCI app and
documents some of the changes to the CircleCI user interface.

## Overview

You may have noticed some changes to CircleCI's web interface lately! We have
some exciting changes that are rolling out regarding how your builds are being
grouped and the user interface that presents that information. 

Let's begin by stating what a **Pipeline** is.

> Pipelines represents the entire configuration that is run when you trigger
> work on your projects that use CircleCI. The entirety of a
> `.circleci/config.yml` file is executed by a pipeline

Where you once saw the term `Jobs` in the sidebar, you will now see `Pipelines`.

![]({{ site.baseurl }}/assets/img/docs/pipelines-jobs-to-pipelines.png)

**Note:** If you would like to continue to use the old UI while it is still
available you can temporarily opt out while the new UI is continually improved.

![]({{ site.baseurl }}/assets/img/docs/pipelines-opt-out-1.png)

## Jobs, Tests, Artifacts

A Pipeline is composed of Workflows, which are composed of Jobs. By navigating
from a pipeline to a specific job, you can access your job output, test
results and artifact results through several tabs.

![]({{ site.baseurl }}/assets/img/docs/pipelines-job-step-test-artifact.png)

Further, the output of each job can be openened in a new tab (in either raw or formatted styling) with a unique link, making it share-able between team members. 

![]({{ site.baseurl }}/assets/img/docs/pipelines-job-output.png)
