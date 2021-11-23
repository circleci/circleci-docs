---
layout: classic-docs
title: "Viewing Pipelines"
short-title: "Viewing Pipelines"
description: "Introduction to Pipelines"
categories: [getting-started]
order: 1
version:
- Cloud
---

This document provides conceptual information on CircleCI pipelines, as well as introducing some pipelines features.

## Overview
{: #overview }

**Pipelines** represent the entire configuration that is run when you build your CircleCI projects. The entirety of a
`.circleci/config.yml` file is executed by a pipeline.

When visiting your CircleCI dashboard you are presented with the recent pipelines that have run in your organization/account.

## Run a pipeline
Pipelines can be run in several ways. Each method is described below.

### 
Every time a commit is pushed to your code repository on a branch that has a `.circleci/config.yml` file included the pipeline will run.

### From the CircleCI app 

### Using the API

## Jobs, tests, artifacts
{: #jobs-tests-artifacts }

A pipeline is composed of workflows, which are composed of jobs. By navigating from a pipeline to a specific job, you can access your job output, test results and artifacts through several tabs.

![]({{ site.baseurl }}/assets/img/docs/pipelines-job-step-test-artifact.png)

Further, the output of each job can be openened in a new tab (in either raw or formatted styling) with a unique link, making it share-able between team members.

![]({{ site.baseurl }}/assets/img/docs/pipelines-job-output.png)
