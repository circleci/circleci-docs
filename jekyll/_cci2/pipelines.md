---
layout: classic-docs
title: "Viewing Pipelines"
short-title: "Viewing Pipelines"
description: "Introduction to Pipelines"
categories: [getting-started]
order: 1
version:
- Cloud
- Server v3.x
---

This page provides information on CircleCI pipelines, how they are run, and what they include.

## Overview
{: #overview }

CircleCI pipelines are the highest-level unit of work, encompassing a project's full `.circleci/config.yml` file. Pipelines includes your workflows, which coordinate your jobs. They have a fixed, linear lifecycle, and are associated with a specific actor. Pipelines run when a change is pushed to a project that has a CircleCI configuration file included, and can also be scheduled, triggered manually through the CircleCI app, or using the API.

Pipelines are not available on installations of CircleCI server v2.x.

When visiting your CircleCI dashboard you are presented with recent pipelines that have run in your organization/account.

## Running a pipeline
Pipelines can be run in several ways. Each method is described below.

### Run a pipeline on commit to your code repository
Each time a commit is pushed to one of your projects, on a branch that has a `.circleci/config.yml` file included, a pipeline is triggered.

### Run a pipeline from the CircleCI app 
In the CircleCI app, when you have a specific branch selected, the **Run Pipeline** button becomes enabled. Click **Run Pipeline**, choose if you want to specify any pipeline parameters, and click **Run Pipeline** again.

### Run a pipeline using the API
You can trigger a pipeline for a project using the [Trigger a New Pipeline]({{side.baseurl}}/api/v2/#operation/triggerPipeline) endpoint.
<!---
### Scheduling a pipeline
TBC
--->

## Pipeline architecture
{: #pipeline-architecture }

A pipeline is composed of workflows, which are composed of jobs. By navigating from a pipeline to a specific job, you can access your job output, test results and artifacts through several tabs.

![]({{ site.baseurl }}/assets/img/docs/pipelines-job-step-test-artifact.png)

Further, the output of each job can be opened in a new tab (in either raw or formatted styling) with a unique link, making it share-able between team members.

![]({{ site.baseurl }}/assets/img/docs/pipelines-job-output.png)
