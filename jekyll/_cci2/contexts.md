---
layout: classic-docs
title: "Using Contexts"
short-title: "Using Contexts"
description: "Secured, cross-project resources"
categories: [configuring-jobs]
order: 41
---

*[Basics]({{ site.baseurl }}/2.0/basics/) > Using Contexts*

This document describes creating and using contexts in CircleCI in the following sections:

* TOC
{:toc}

Contexts provide a mechanism for securing and sharing environment variables across projects. The environment variables are defined as name/value pairs and are injected at runtime.

## Overview
Contexts are created on the Settings page of the CircleCI application, in the Organization section. After a context is set in the application it may be configured in the workflows section of the `config.yml` file for a project.

To use environment variables set on the Contexts page, the person running the workflow must be a member of the organization for which the context is set and the rule must allow access to all projects in the org. The default context name is `org-global` and the default rule allows access to all projects in the org.

## Using a Context

1. Navigate to the Settings > Contexts page in the CircleCI application. The Create a Context button appears.

2. Click the Create Contexts button. The default name and rules appear with an Add a Resource button.

3. Click the Add a Resource button and fill in the variable name and value. Click the Add Variable button to save it.

4. Add the `context: org-global` key to the `workflows` section of your `config.yml` file for every job in which you want to use the variable. In the following example, the `run-tests` job will use the variables set in the `org-global` context.

```
workflows:
  version: 2
  my-workflow:
    jobs:
      - run-tests:
            context: org-global
```

To rerun a job and use the context, it must be rerun from the Workflows page of the CircleCI application. Jobs invoked using the Rebuild button on the Builds page will **not** use the context defined in the workflow. 

**Note:** Environment variables are considered in a specific order, as follows:
1. Project-level environment variables set on the Project Settings page.
2. Context environment variables (assuming the user has access to the Context).
3. Environment variables set with the `environment` key of a `run` step.
4. Environment variables declared inside a shell command in a `run` step, for example `FOO=bar make install`.

## Send Feedback on Contexts

We're interested in your feedback on how Contexts can evolve. Read more about our proposed roadmap and offer suggestions in the [contexts discussion](https://discuss.circleci.com/t/contexts-feedback/13908).

