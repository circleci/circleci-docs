---
layout: classic-docs
title: "CircleCI Contexts"
short-title: "Using Contexts"
description: "Secured, cross-project resources"
categories: [configuring-jobs]
order: 41
hide: true
---


**NOTE:** Contexts are a feature under development. This document is being released early to give you a preview and solicit feedback. We encourage your feedback either on [our Discuss forum](https://discuss.circleci.com/t/contexts-feedback/13908) or in a Pull Request for this document.

<hr>

## Contexts Overview
Contexts provide centrally managed, secured resources for use in jobs. They are currently primarily used for sharing environment variables across projects.

_**Coming Soon:** We will be adding new capabilities to Contexts such the ability to route jobs to certain workers, share encrypted files like certificates across jobs, and new kinds of security rules for who can execute jobs in a Context. What capabilities would you like to see? Let us know in [our Discuss forum](https://discuss.circleci.com/t/contexts-feedback/13908)_

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
Contexts have a set of environment variables defined as name/value pairs. When a job is run with a Context the environment variables of the Context are injected at runtime. The order of precedence is important to remember when working with environment variables that might overlap in name. Following is the order, with later injection always taking precedence when the steps of your job run:
1. Project-level environment variables set on the Project Settings page.
2. Context environment variables (assuming the user has access to the Context).
3. Environment variables set in your config YAML with the `environment` key of a job definition.
4. Environment variables declared inside a shell command in a `run` step of a job.

## Creating and Editing Contexts
You can manage your organization's Contexts from the Organization Settings page. 

To create a new context hit the "Add Context" button from the Contexts page.

You can edit existing Contexts by clicking them in the list on the Context page.

## Context Security
By default, a Context is available to all projects within the organization where the Context was created. 

_**Coming Soon**: we will soon be adding the ability to add additional security rules to Contexts, including allowing only people who belong to a particular Group to use the Context. We encourage feedback on coming enhancements to Context in [our Discuss forum](https://discuss.circleci.com/t/contexts-feedback/13908)._
