---
layout: classic-docs
title: "コンテキストの使用"
short-title: "コンテキストの使用"
description: "プロジェクト間で共有できる安全なリソース"
order: 41
version:
  - Cloud
  - Server v2.x
---

Contexts provide a mechanism for securing and sharing environment variables across projects. The environment variables are defined as name/value pairs and are injected at runtime. This document describes creating and using contexts in CircleCI in the following sections:

* 目次
{:toc}

## 概要
{:.no_toc}

Create and manage contexts on the Organization Settings page of the CircleCI application. You must be an organization member to view, create, or edit contexts. After a context has been created, you can use the `context` key in the workflows section of a project [`config.yml`]({{ site.baseurl }}/2.0/configuration-reference/#context) file to give any job(s) access to the environment variables associated with the context, as shown in the image below.

{:.tab.contextsimage.Cloud}
![Contexts Overview]({{ site.baseurl }}/assets/img/docs/contexts_cloud.png)

{:.tab.contextsimage.Server}
![Contexts Overview]({{ site.baseurl }}/assets/img/docs/contexts_server.png)

To use environment variables set on the Contexts page, the person running the workflow must be a member of the organization for which the context is set.

Context names must be unique for each GitHub or Bitbucket organization. **Note:** Contexts created with the initial default name of `org-global` will continue to work.

### Context Naming for CircleCI Server
{:.no_toc}

For any GitHub Enterprise (GHE) installation that includes multiple organizations, the context names across those organizations must be unique. For example, if your GHE is named Kiwi and includes two organizations, you cannot add a context called `deploy` to both organizations. That is, the `deploy` context name cannot be duplicated in two orgs that exist in the same GHE installation for the Kiwi account. Duplicate contexts within an account will fail with an error.

### Renaming Orgs and Repositories

If you find you need to rename an org or repo that you have previously hooked up to CircleCI, best practice is to follow these steps:

1. Rename org/repo in VCS.
2. Head to the CircleCI application, using the new org/repo name, for example, `app.circleci.com/pipelines/<VCS>/<new-org-name>/<project-name>`.
3. Confirm that your plan, projects and settings have been transferred successfully.
4. You are then free to create a new org/repo with the previously-used name in your VCS, if desired.
    
    **Note**: If you do not follow these steps, it is possible that you may lose access to your org or repo settings, including **environment variables** and **contexts**.

## コンテキストの作成と使用

1. Using the new version of the CircleCI application, navigate to the Organization Settings page by clicking on the link in the sidebar.
    
    **Note:** Organization members can create a context, but only organization administrators can restrict it with a security group. The one exception to this case is Bitbucket organizations, which require a user to have the `create repositories` workspace permission, regardless of their other permissions on the workspace or the repositories it contains.
    
    ![Contexts]({{ site.baseurl }}/assets/img/docs/org-settings-contexts-v2.png)
    
    **Note**: If you are using CircleCI Server, Organization Settings can still be accessed as normal using the **Settings** link in the main navigation.

2. Click the Create Context button and add a unique name for your Context. After you click the Create Context button in the dialog box, the Context appears in a list with Security set to `All members` to indicate that anyone in your organization can access this Context at runtime.

3. Click the Add Environment Variable button and enter the variable name and value you wish to associate with this context. Click the Add Variable button to save.

4. Add the `context` key to the [`workflows`]({{ site.baseurl }}/2.0/configuration-reference/#workflows) section of your [`config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) file for every job in which you want to use the variable. In the following example, the `run-tests` job will have access to the variables set in the `org-global` context. CircleCI Cloud users can specify multiple contexts, so in this example `run-tests` will also have access to variables set in the context called `my-context`.

{:.tab.contexts.Cloud}
```yaml
version: 2.1

workflows:
  my-workflow:
    jobs:

      - run-tests:
          context:
            - org-global
            - my-context

jobs:
  run-tests:
    docker:

      - image: cimg/base:2020.01
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run:
          name: "echo environment variables from org-global context"
          command: echo $MY_ENV_VAR
```

{:.tab.contexts.Server}
```yaml
version: 2.1

workflows:
  my-workflow:
    jobs:

      - run-tests:
          context: org-global

jobs:
  run-tests:
    docker:

      - image: cimg/base:2020.01
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run:
          name: "echo environment variables from org-global context"
          command: echo $MY_ENV_VAR
```

### Moving a Repository that Uses a Context

If you move your repository to a new organization, you must also have the context with that unique name set in the new organization.

## Combining Contexts

You can combine several contexts for a single job by just adding them to the context list. Contexts are applied in order, so in the case of overlaps, later contexts override earlier ones. This way you can scope contexts to be as small and granular as you like.

## Restricting a Context

CircleCI enables you to restrict secret environment variables at run time by adding security groups to contexts. Only organization administrators may add *security groups* to a new or existing context. Security groups are defined by GitHub teams. If you are using CircleCI Server with LDAP authentication, then LDAP groups also define security groups. After a security group is added to a context, only members of that security group who are also CircleCI users may access the context and use the associated environment variables.

Organization administrators have read/write access to all projects and have unrestricted access to all contexts.

The default security group is `All members` and enables any member of the organization who uses CircleCI to use the context.

**Note:** Bitbucket repositories do **not** provide an API that allows CircleCI contexts to be restricted, only GitHub projects include the ability to restrict contexts with security groups.

### Running Workflows with a Restricted Context

To invoke a job that uses a restricted context, a user must be a member of one of the security groups for the context and must sign up for CircleCI. If the user running the workflow does not have access to the context, the workflow will fail with the `Unauthorized` status.

### Restrict a Context to a Security Group or Groups

You must be an organization administrator to complete the following task.

1. Navigate to Organization Settings > Contexts page in the CircleCI app. The list of contexts appears. The default security group is `All members` and allows all users in the org to invoke jobs with that context.
2. Click the Create Context button if you wish to use a new context, or click the name of an existing context.
3. Click the Add Security Group button to view the dialog box.
4. Select GitHub teams or LDAP groups to add to the context and click the Add button. Use of the context is now limited to the selected groups.
5. Click Add Environment Variables to add environment variables to the context if none exist and click the Add button. Use of the environment variables for this context is now limited to members of the security groups.
6. Navigate to Organization Settings > Contexts in the CircleCI app. The security groups appear in the Security column for the context.

Only members of the selected groups may now use the context in their workflows or add or remove environment variables for the context.

### Making Changes to Context Restrictions

Changes to security group restrictions for Contexts might not take effect immediately due to caching. To make sure settings are applied immediately, it is best practice for the Org Administrator to refresh permissions once the change has been made. The **Refresh Permissions** button can be found on the [Account Integrations](https://app.circleci.com/settings/user) page.

Administrators of CircleCI Server installations can find the **Refresh Permissions** button at `<circleci-hostname>/account`.

### Approving Jobs that use Restricted Contexts
{:.no_toc}

Adding an [approval job]({{ site.baseurl }}/2.0/configuration-reference/#type) to a workflow gives the option to require manual approval of the use of a restricted context. To restrict running of jobs that are downstream from an approval job, add a restricted context to those downstream jobs, as shown in the example below:

```yaml
version: 2.1

# jobs declaration for build, test and deploy not displayed

workflows:
  jobs:
    build-test-deploy:

      - build
      - hold:
          type: approval # presents manual approval button in the UI
          requires:
            - build
      - test:
          context: my-restricted-context
          requires:
            - build
            - hold 
      - deploy:
          context: deploy-key-restricted-context
          requires:
            - build
            - hold
            - test
```

In this example, the jobs `test` and `deploy` are restricted, and will only run if the user who approves the `hold` job is a member of the security group assigned to the context `deploy-key-restricted-context`. When the workflow `build-test-deploy` runs, the `build` job will run, then the `hold` job, which presents a manual approval button in the CircleCI application. This approval job may be approved by *any* member, but the jobs `test` and `deploy` will fail as `unauthorized` if the "approver" is not part of the restricted context security group.

## Removing Groups from Contexts

To make a context available only to the administrators of the organization, you may remove all of the groups associated with a context. All other users will lose access to that context.

## Adding and Removing Users from Teams and Groups

CircleCI syncs GitHub team and LDAP groups every few hours. If a user is added or removed from a GitHub team or LDAP group, it will take up to a few hours to update the CircleCI records and remove access to the context.

## Adding and Removing Environment Variables from Restricted Contexts

Addition and deletion of environment variables from a restricted context is limited to members of the context groups.

## Deleting a Context

If the context is restricted with a group other than `All members`, you must be a member of that security group to complete this task:

1. As an organization administrator, navigate to the Organization Settings > Contexts page in the CircleCI application.

2. Click the Delete Context button for the Context you want to delete. A confirmation dialog box appears.

3. Type Delete and click Confirm. The Context and all associated environment variables will be deleted. **Note:** If the context was being used by a job in a Workflow, the job will start to fail and show an error.

## Environment Variable Usage

Environment variables are used according to a specific precedence order, as follows:

1. Environment variables declared [inside a shell command]({{ site.baseurl }}/2.0/env-vars/#setting-an-environment-variable-in-a-shell-command) in a `run` step, for example `FOO=bar make install`.
2. Environment variables declared with the `environment` key [for a `run` step]({{ site.baseurl }}/2.0/env-vars/#setting-an-environment-variable-in-a-step).
3. Environment variables set with the `environment` key [for a job]({{ site.baseurl }}/2.0/env-vars/#setting-an-environment-variable-in-a-job).
4. Special CircleCI environment variables defined in the [CircleCI Built-in Environment Variables]({{ site.baseurl }}/2.0/env-vars/#built-in-environment-variables) section of this document.
5. Context environment variables (assuming the user has access to the Context).
6. [Project-level environment variables]({{ site.baseurl }}/2.0/env-vars/#setting-an-environment-variable-in-a-project) set on the Project Settings page.

Environment variables declared inside a shell command `run step`, for example `FOO=bar make install`, will override environment variables declared with the `environment` and `contexts` keys. Environment variables added on the Contexts page will take precedence over variables added on the Project Settings page.

## Secrets Masking

*Secrets masking is not currently available on self-hosted installations of CircleCI Server*

Contexts hold project secrets or keys that perform crucial functions for your applications. For added security CircleCI performs secret masking on the build output, obscuring the `echo` or `print` output of contexts.

The value of the context will not be masked in the build output if:

* コンテキストの値が 4 文字未満
* コンテキストの値が `true`、`True`、`false`、`False` のいずれか

**Note:** secret masking will only prevent the value of the context from appearing in your build output. The value of the context is still accessible to users [debugging builds with SSH]({{ site.baseurl }}/2.0/ssh-access-jobs).

## See Also
{:.no_toc}

* [CircleCI Environment Variable Descriptions]({{ site.baseurl }}/2.0/env-vars/) 
* [Workflows]({{ site.baseurl }}/2.0/workflows/)