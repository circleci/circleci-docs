---
layout: classic-docs
title: "Workflows not Starting"
short-title: "Workflows not Starting"
description: "Workflow doesn't appear to be building or starting"
categories: [troubleshooting]
order: 1
---
When creating or modifying workflow configuration, if you don't see new jobs, you may have a configuration error in `config.yml`.

Oftentimes if you do not see your workflows triggering, a configuration error is preventing the workflow from starting.  As a result, the workflow does not start any jobs.

When setting up workflows, you currently have to check your Workflows page of the CircleCI app (*not* the Job page) to view the configuration errors.

A project's Job page URL looks like this:

`https://circleci.com/:VCS/:ORG/:PROJECT`

A Workflow page URL looks like this:

`https://circleci.com/:VCS/:ORG/workflows/:PROJECT`

Look for Workflows that have a yellow tag and "Needs Setup" for the text.

![Invalid workflow configuration example]({{ site.baseurl }}/assets/img/docs/workflow-config-error.png)
