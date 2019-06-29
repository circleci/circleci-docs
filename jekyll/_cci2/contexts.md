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

Contexts are created on the Settings page of the CircleCI application, in the Organization section. You must be an organization member to view, create, or edit contexts. After a context is set in the application it may be configured in the workflows section of the [`config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) file for a project.

To use environment variables set on the Contexts page, the person running the workflow must be a member of the organization for which the context is set and the rule must allow access to all projects in the org. 

Context names must be unique for each GitHub or Bitbucket organization. **Note:** Contexts created with the initial default name of `org-global` will continue to work. 

### Context Naming for CircleCI Installed on Your Servers
{:.no_toc}

For any GitHub Enterprise (GHE) installation that includes multiple organizations, the context names across those organizations must be unique. For example, if your GHE is named Kiwi and includes two organizations, you cannot add a context called `deploy` to both organizations. That is, the `deploy` context name cannot be duplicated in two orgs that exist in the same GHE installation for the Kiwi account. Duplicate contexts within an account will fail with an error. 

## Creating and Using a Context

1. As an organization member, Navigate to the Settings > Contexts page in the CircleCI application. **Note:** Any organization member can create a context only organization administrators can restrict it with a security group.

2. Click the Create Contexts button to add a unique name for your Context. After you click the Create button on the dialog box, the Context appears in a list with Security set to `All members` to indicate that anyone in your organization can access this context at runtime.

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

## Moving a Repository that Uses a Context

If you move your repository to a new organization, you must also have the context with that unique name set in the new organization.

## Restricting a Context

CircleCI enables you to restrict secret environment variables at run time by adding security groups to contexts. Only organization administrators may add *security groups* to a new or existing context. Security groups are definied as LDAP groups or GitHub teams. After a security group is added to a context, only members of that security group who are also CircleCI users may access or use the environment variables of the restricted context. 

Note: Organization administrators have read/write access to all repositories and have unrestricted access to all contexts.

The default security group is `All members` and enables any member of the organization who uses CircleCI to use the context.

## Running Workflows with a Restricted Context

To invoke a job that uses a restricted context, a user must be a member of one of the security groups for the context or the workflow will fail with the status of `Unauthorized`. If you add a context to your job and you are **not** a member of any of the security groups, the workflow will fail as `Unauthorized`.

**Note:** Bitbucket repositories do **not** provide an API that allows CircleCI contexts to be restricted, only GitHub projects include the ability to restrict contexts with security groups. Restricted Contexts are also **not** yet supported in private installations of CircleCI.

### Restrict a Context to a Security Group or Groups

You must be an organization administrator to complete the following task.

1. Navigate to Organization Settings > Contexts page in the CircleCI app. The list of contexts appears. The default security group is `All members` and allows all users in the org to invoke jobs with that context.
2. Click the Create Context button if you will use a new context or click the name of an existing context.
3. Click the Add Group link. The Add Groups dialog box appears.
4. Select GitHub teams or LDAP groups to add to the context and click the Add button. Use of the context is now limited to the selected groups.
5. Click Add Environment Variables to add environment variables to the context if none exist and click the Add button. Use of the environment variables for this context is now limited to members of the security groups.
6. Navigate to Organization Settings > Contexts in the CircleCI app. The security groups appear in the Security column for the context.

Only members of the selected groups may now use the context in their workflows or add or remove environment variables for the context. 

### Approving Jobs that use Restricted Contexts

Adding an approval job to a workflow allows a user to manually approve the use of a restricted context. 

To restrict running of jobs that are downstream from an approval job, add a restricted context to those downstream jobs. 

For example, if you want the execution of job C and job D restricted to a security group, you need to add an approval job B before the jobs C and D to that use a context with a security group. That is, you can have four jobs in a workflow, job A can run unrestricted, the approval job B may be approved by any member, but the jobs C and D after the approval may only be executed by someone in the security group for the context used on jobs C and D. 

If the approver of a job is not part of the restricted context, it is possible to approve the job B, however the jobs C and D in the workflow will fail as unauthorized. That is, the Approval job will appear for every user, even for users who are not part of the group with permissions for the context. When the downstream jobs fail with Unauthorized, it indicates an approval was made by a user who is not part of the security group for the downstream jobs. 

## Removing Groups from Contexts

To make a context available only to the administrators of the organization, you may remove all of the groups associated with a context. All other users will lose access to that context.

### Adding and Removing Users from Teams and Groups

CircleCI syncs GitHub team and LDAP groups every few hours. If a user is added or removed from a GitHub team or LDAP group, it will take up to a few hours to update the CircleCI records and remove access to the context.

### Adding and Removing Environment Variables from Restricted Contexts

Addition and deletion of environment variables from a restricted context is limited to members of the context groups.

## Deleting a Context

If the context is restricted with a group other than `All members`, you must be a member of the security group to complete this task.

1. As an organization administrator, Navigate to the Settings > Contexts page in the CircleCI application.

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

## See Also

[CircleCI Environment Variable Descriptions]({{ site.baseurl }}/2.0/env-vars/) 
[Workflows]({{ site.baseurl }}/2.0/workflows/) 


