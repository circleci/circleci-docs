---
layout: classic-docs
title: "Workflows not Starting"
short-title: "Workflows not Starting"
description: "Workflow doesn't appear to be building or starting"
categories: [troubleshooting]
order: 1
---
When creating or modifying workflow configuration, if you don't see new jobs, you may have a configuration error in `config.yml`.

Oftentimes when users don't see their workflows triggering, but a configuration error prevented the workflow from starting.  As a result, the workflow-run didn't start any jobs.

Most users are used to looking on the jobs index page. When setting up workflows, you currently have to check your workflows index page to see if there are configuration errors.

A project's job index URL looks like this:

`https://circleci.com/:VCS/:ORG/:PROJECT`

and its workflow index URL looks like this:

`https://circleci.com/:VCS/:ORG/workflows/:PROJECT`

Look for workflow runs that have a yellow tag and "Needs Setup" for the text.

![Invalid workflow configuration example]({{ site.baseurl }}/assets/img/docs/workflow-config-error.png)
