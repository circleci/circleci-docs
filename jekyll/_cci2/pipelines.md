---
layout: classic-docs
title: "Pipelines Overview"
description: "This document introduces the concept of pipelines and shows how pipelines can be triggered and what they include."
redirect_from: /project-build/
redirect_from: /api-job-trigger/
contentTags: 
  platform:
  - Cloud
  - Server v4.x
  - Server v3.x
---

CircleCI pipelines are the highest-level unit of work, encompassing a project's full `.circleci/config.yml` file. Pipelines include your workflows, which coordinate your jobs. They have a fixed, linear lifecycle, and are associated with a specific actor. Pipelines trigger when a change is pushed to a project that has a CircleCI configuration file included, and can also be scheduled, triggered manually through the CircleCI app, or using the API.

When visiting your CircleCI dashboard, you are shown a list of recently triggered pipelines for your organization/account.

![Screenshot of the pipelines dashboard in the CircleCI app]({{ site.baseurl }}/assets/img/docs/pipelines-dashboard.png)

## Pipeline architecture
{: #pipeline-architecture }

A pipeline is composed of workflows, which are composed of jobs. By navigating from a pipeline to a specific job, you can access your job output, test results and artifacts through several tabs.

![Job tab options in the CircleCI web app]({{ site.baseurl }}/assets/img/docs/pipelines-job-step-test-artifact.png)

Further, the output of each job can be opened in a new tab (in either raw or formatted styling) with a unique link, making it share-able between team members.

![Download and share job step output]({{ site.baseurl }}/assets/img/docs/pipelines-job-output.png)

## Next steps
{: #next-steps}
Find out more about triggering pipelines in the [Triggers Overview]({{site.baseurl}}/triggers-overview).
