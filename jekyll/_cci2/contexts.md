---
layout: classic-docs
title: "CircleCI Contexts"
short-title: "Using Contexts"
description: "Secured, cross-project resources"
categories: [configuring-jobs]
order: 41
---

**NOTE:** As of July 2017 Contexts are launched in their MVP state. Some future features of Contexts are called out below as "Coming Soon". We encourage your feedback either on [our Discuss forum](https://discuss.circleci.com/t/contexts-feedback/13908) or in the Pull Request for this document.

<hr>

## Contexts Overview
Contexts provide centrally managed, secured resources for use in jobs. They are primarily used for sharing environment variables across projects.

Contexts are associated with your Organization and can be requested in [Workflows](../workflows/) configuration. If the person running the workflow has access to the requested context for a given job, the resources of the requested context will be used to run the job.

## Using a Context
Contexts are requested as part of [workflows configuration](../workflows/) using a sub-key of the job invocation. For instance, to use the `org-global` Context while running the job `run-tests` your Workflow configuration would look something like:

```
workflows:
  version: 2
  my-workflow:
    jobs:
      - run-tests:
            context: org-global
```

## Environment Variables in Contexts
Contexts have a set of environment variables defined as name/value pairs. When a job is run with a Context the environment variables of the Context are injected at runtime, overwriting any project-level environment variables that had been set in the Project Settings. However, environment variables defined in the job configuration itself will overwrite those of the Context.

## Creating and Editing Contexts
You can manage your organization's Contexts from the Organization Settings page. 

To create a new context hit the "Add Context" button from the Contexts page.

You can edit existing Contexts by clicking them in the list on the Context page.

## Context Security
By default, a Context is available to all projects within the organization where the Context was created. 

_**Coming Soon**: we will soon be adding the ability to add additional security rules to Contexts, including allowing only people who belong to a particular Group to use the Context. We encourage feedback on coming enhancements to Context in [our Discuss forum](https://discuss.circleci.com/t/contexts-feedback/13908)._
