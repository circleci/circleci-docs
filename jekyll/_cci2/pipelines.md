---
layout: classic-docs
title: "Pipelines Overview"
description: "This document introduces the concept of pipelines and shows how pipelines can be triggered and what they include."
contentTags:
  platform:
  - Cloud
  - Server v4.x
  - Server v3.x
---

CircleCI pipelines are the highest-level unit of work, encompassing a project's full `.circleci/config.yml` file. Pipelines include your workflows, which coordinate your jobs. They have a fixed, linear lifecycle, and are associated with a specific actor. Pipelines trigger when a change is pushed to a project that has a CircleCI configuration file included, and can also be scheduled, triggered manually through the CircleCI app, or using the API.

When visiting your CircleCI dashboard, you are shown a list of recently triggered pipelines for your organization/account.

![Screenshot of the pipelines dashboard in the CircleCI app](/docs/assets/img/docs/pipelines-dashboard.png)

## Pipeline architecture
{: #pipeline-architecture }

A pipeline is composed of workflows, which are composed of jobs. By navigating from a pipeline to a specific job, you can access your job output, test results, and artifacts through several tabs.

![Job tab options in the CircleCI web app](/docs/assets/img/docs/pipelines-job-step-test-artifact.png)

The output of each job can be opened in a new tab (in either raw or formatted styling) with a unique link, making it shareable between team members.

![Download and share job step output](/docs/assets/img/docs/pipelines-job-output.png)

## VS Code extension
{: #visual-studio-code-extension }

If you use Visual Studio Code, you can also monitor and interact with your pipelines directly from VS Code with the [official CircleCI extension](/docs/vs-code-extension-overview/). The extension allows you to customize which projects and pipelines you want to follow, as well as view job logs and test results, download artifacts, approve, re-run, and debug jobs with SSH, and get notified when your workflows fail or need approval.

![Screenshot showing the detailed view of a failed test](/docs/assets/img/docs/vs_code_extension_job-details.png)

The CircleCI VS Code extension is available to download on the [VS Code marketplace.](https://marketplace.visualstudio.com/items?itemName=circleci.circleci)

## Next steps
{: #next-steps}
Find out more about triggering pipelines in the [Triggers Overview](/docs/triggers-overview/).
