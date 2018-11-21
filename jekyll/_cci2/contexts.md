---
layout: classic-docs
title: "Using Contexts"
short-title: "Using Contexts"
description: "Secured, cross-project resources"
categories: [configuring-jobs]
order: 41
---

This document describes creating and using contexts in CircleCI in the following sections:

* TOC
{:toc}

Contexts provide a mechanism for securing and sharing environment variables across projects. The environment variables are defined as name/value pairs and are injected at runtime.

## Overview
{:.no_toc}

Contexts are created on the Settings page of the CircleCI application, in the Organization section. After a context is set in the application it may be configured in the workflows section of the [`config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) file for a project.

To use environment variables set on the Contexts page, the person running the workflow must be a member of the organization for which the context is set and the rule must allow access to all projects in the org. 

Context names must be unique for each Github or Bitbucket organization. **Note:** Contexts created with the initial default name of `org-global` will continue to work. 

### Context Naming for CircleCI Installed on Your Servers
{:.no_toc}

For any GitHub Enterprise (GHE) installation that includes multiple organizations, the context names across those organizations must be unique. For example, if your GHE is named Kiwi and includes two organizations, you cannot add a context called `deploy` to both organizations. That is, the `deploy` context name cannot be duplicated in two orgs that exist in the same GHE installation for the Kiwi account. Duplicate contexts within an account will fail with an error. 

## Creating and Using a Context

1. Navigate to the Settings > Contexts page in the CircleCI application. 

2. Click the Create Contexts button to add a unique name for your Context. After you click the Create button on the dialog box, the Context appears in a list with Security set to Public to indicate that anyone in your org can access this context at runtime.

3. Click the Add Environment Variable button and copy/paste in the variable name and value. Click the Add Variable button to save it.

4. Add the `context: <context name>` key to the [`workflows`]({{ site.baseurl }}/2.0/configuration-reference/#workflows) section of your [`config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) file for every job in which you want to use the variable. In the following example, the `run-tests` job will use the variables set in the `org-global` context.

```
workflows:
  version: 2
  my-workflow:
    jobs:
      - run-tests:
          context: org-global
```

To rerun a job and use the context, it **must** be rerun from the Workflows page of the CircleCI application.

## Deleting a Context

1. Navigate to the Settings > Contexts page in the CircleCI application.

2. Click the Delete Context button for the Context you want to delete. A confirmation dialog box appears.

3. Type Delete and click Confirm. The Context and all associated environment variables will be deleted. **Note:** If the context was being used by a job in a Workflow, the job will start to fail and show an error.

## Environment Variable Usage 

Environment variables are used according to a specific precedence order, as follows:

1. Environment variables declared inside a shell command in a `run` step, for example `FOO=bar make install`.
2. Environment variables declared with the `environment` key for a `run` step.
3. Environment variables set with the `environment` key for a job.
4. Environment variables set with the `environment` key for a container.
5. Context environment variables (assuming the user has access to the Context).
6. Project-level environment variables set on the Project Settings page.
7. Special CircleCI environment variables defined in the [CircleCI Environment Variable Descriptions]({{ site.baseurl }}/2.0/env-vars/#built-in-environment-variables) section of this document.

Environment variables declared inside a shell command `run step`, for example `FOO=bar make install`, will override environment variables declared with the `environment` and `contexts` keys. Environment variables added on the Contexts page will take precedence over variables added on the Project Settings page. Finally, special CircleCI environment variables are loaded.

## Send Feedback on Contexts
{:.no_toc}

We're interested in your feedback on how Contexts can evolve. Read more about our proposed roadmap and offer suggestions in the [contexts discussion](https://discuss.circleci.com/t/contexts-feedback/13908).

## See Also

[CircleCI Environment Variable Descriptions]({{ site.baseurl }}/2.0/env-vars/) 


