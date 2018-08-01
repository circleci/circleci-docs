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

To use environment variables set on the Contexts page, the person running the workflow must be a member of the organization for which the context is set and the rule must allow access to all projects in the org. 

Context names must be unique for each Github or Bitbucket organization. **Note:** Contexts created with the initial default name of `org-global` will continue to work. 

### Context Naming for CircleCI Installed on Your Servers

For any GitHub Enterprise (GHE) installation that includes multiple organizations, the context names across those organizations must be unique. For example, if your GHE is named Kiwi and includes two organizations, you cannot add a context called `deploy` to both organizations. That is, the `deploy` context name cannot be duplicated in two orgs that exist in the same GHE installation for the Kiwi account. Duplicate contexts within an account will fail with an error. 

## Creating and Using a Context

1. Navigate to the Settings > Contexts page in the CircleCI application. 

2. Click the Create Contexts button to add a unique name for your Context. After you click the Create button on the dialog box, the Context appears in a list with Security set to Public to indicate that anyone in your org can access this context at runtime.

3. Click the Add Environment Variable button and copy/paste in the variable name and value. Click the Add Variable button to save it.

4. Add the `context: <context name>` key to the `workflows` section of your `config.yml` file for every job in which you want to use the variable. In the following example, the `run-tests` job will use the variables set in the `org-global` context.

```
workflows:
  version: 2
  my-workflow:
    jobs:
      - run-tests:
          context: org-global
```

To rerun a job and use the context, it **must** be rerun from the Workflows page of the CircleCI application.

## Securing a Context

CircleCI enables you to secure secrets at run time by adding authorized groups to contexts. Only Org Admins may add *groups* to a new or existing context. Groups are definied as LDAP groups or GitHub teams. After the group is added to a context, only members of that group may use the environment variables of the secure context. 

To invoke a job that uses a secure context, a user must be a member of one of the context groups or the workflow will fail with the status of `Unauthorized`. If you add a context to your job and you are **not** a member of any of the context groups, the job will fail as `Unauthorized`.

**Note:** Bitbucket repositories do **not** provide an API that allows CircleCI contexts to be secured, so only GitHub hosted projects or projects that use GitHub Enterprise with CircleCI include this feature.

### Limit a Context to a Group or Groups of Users

You must be an Org Admin to complete the following task.

1. Navigate to Organization Settings > Context in the CircleCI app.
2. Click Add a new context if one does not exist.
3. Click the context name link.
4. Click `Add group` to add GitHub teams or LDAP groups to the context. The default group is `organization` and allows all users in the org to invoke jobs with that context.
5. Select the groups to which you want to limit access for this context.
6. Click `Add environment variable` to add environment variables to the context if none exist. 

Only members of the selected groups may now use the context in their jobs or add or remove environment variables for the context.

## Removing Groups from Contexts

To make a context available only to the admins of the org, you may remove all of the groups associated with a context. All other users will lose access to that context.

### Adding and Removing Users from Teams and Groups

CircleCI syncs GitHub team and LDAP groups every four hours. If a user is added or removed from a GitHub team or LDAP group, it will take up to four hours to update the CircleCI records and remove access to the context.

### Adding and Removing Environment Variables from Secure Contexts

Addition and deletion of environment variables from a secure context is limited to members of the context groups.

### Approving Jobs that use Secure Contexts

Manual invocation of a job that is `type: approval` is limited to members of the context groups.

## Deleting a Context

If the context is secured with a group other than `organization`, you must be an org admin to complete this task.

1. Navigate to the Settings > Contexts page in the CircleCI application.

2. Click the Delete Context button for the Context you want to delete. A confirmation dialog box appears.

3. Type Delete and click Confirm. The Context and all associated environment variables will be deleted. **Note:** If the context was being used by a job in a Workflow, the job will start to fail and show an error.

## Environment Variable Usage 

Environment variables are used according to a specific precedence order, as follows:

1. Environment variables declared inside a shell command in a `run` step, for example `FOO=bar make install`.
2. Environment variables declared with the `environment` key for a `run` step.
3. Environment variables set with the `environment` key for a job.
4. Environment variables set with the `environment` key for a container.
5. Context environment variables (assuming the user has access to the Context). See the [Contexts]( {{ site.baseurl }}/2.0/contexts/) documentation for instructions.
6. Project-level environment variables set on the Project Settings page.
7. Special CircleCI environment variables defined in the [CircleCI Environment Variable Descriptions]({{ site.baseurl }}/2.0/env-vars/#built-in-environment-variables) section of this document.

Environment variables declared inside a shell command `run step`, for example `FOO=bar make install`, will override environment variables declared with the `environment` and `contexts` keys. Environment variables added on the Contexts page will take precedence over variables added on the Project Settings page. Finally, special CircleCI environment variables are loaded.

## Send Feedback on Contexts

We're interested in your feedback on how Contexts can evolve. Read more about our proposed roadmap and offer suggestions in the [contexts discussion](https://discuss.circleci.com/t/contexts-feedback/13908).

