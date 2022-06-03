---
layout: classic-docs
title: "Pipelines Overview"
description: "This document introduces the concept of pipelines and shows how pipelines can be triggered and what they include."
redirect_from: /2.0/project-build/
redirect_from: /2.0/api-job-trigger/
version:
- Cloud
- Server v3.x
---

This page provides information on CircleCI pipelines, how they are triggered, and what they include. For further information on pipeline processing, and the features available within your pipelines, refer to the [Pipeline Processing]({{site.baseurl}}/2.0/build-processing) doc.

## Overview
{: #overview }

CircleCI pipelines are the highest-level unit of work, encompassing a project's full `.circleci/config.yml` file. Pipelines include your workflows, which coordinate your jobs. They have a fixed, linear lifecycle, and are associated with a specific actor. Pipelines trigger when a change is pushed to a project that has a CircleCI configuration file included, and can also be scheduled, triggered manually through the CircleCI app, or using the API.

Pipelines are not available on installations of CircleCI server v2.x.

When visiting your CircleCI dashboard, you are shown a list of recently triggered pipelines for your organization/account.

![Screenshot of the pipelines dashboard in the CircleCI app]({{ site.baseurl }}/assets/img/docs/pipelines-dashboard.png)

## Triggering a pipeline
{: #running-a-pipeline }

Pipelines can be triggered in several ways. Each method is described below.

### Trigger a pipeline on push to your code repository
{: #run-a-pipeline-on-commit-to-your-code-repository }

Each time a commit is pushed to one of your projects, on a branch that has a `.circleci/config.yml` file included, a pipeline is triggered.

### Trigger a pipeline from the CircleCI app
{: #run-a-pipeline-from-the-circleci-app }

In the CircleCI app, when you have a specific branch selected, the **Trigger Pipeline** button becomes enabled. Click **Trigger Pipeline**, choose if you want to specify any pipeline parameters, and click **Trigger Pipeline** again.

### Trigger a pipeline using the API
{: #run-a-pipeline-using-the-api }

You can trigger a pipeline for a project using the [Trigger a New Pipeline]({{site.baseurl}}/api/v2/#operation/triggerPipeline) endpoint.

<!---
### Scheduling a pipeline
{: #scheduling-a-pipeline }

TBC
--->

## Pipeline architecture
{: #pipeline-architecture }

A pipeline is composed of workflows, which are composed of jobs. By navigating from a pipeline to a specific job, you can access your job output, test results and artifacts through several tabs.

![Job tab options in the CircleCI web app]({{ site.baseurl }}/assets/img/docs/pipelines-job-step-test-artifact.png)

Further, the output of each job can be opened in a new tab (in either raw or formatted styling) with a unique link, making it share-able between team members.

![Download and share job step output]({{ site.baseurl }}/assets/img/docs/pipelines-job-output.png)
