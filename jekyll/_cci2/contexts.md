---
layout: classic-docs
title: "Using Contexts"
short-title: "Using Contexts"
description: "Secured, cross-project resources"
contentTags:
  platform:
  - Cloud
  - Server v4.x
  - Server v3.x
---

Contexts provide a mechanism for securing and sharing environment variables across projects. The environment variables are defined as name/value pairs and are injected at runtime. This document describes creating and using contexts in CircleCI.

If you have existing contexts (or environment variables) and you would like to rename your organization or repository, please follow the [Rename organizations and repositories]({{site.baseurl}}/rename-organizations-and-repositories) guide to make sure you do not lose access to contexts or environment variables in the process.

## Overview
{: #overview }

You can create and manage contexts on the **Organization Settings** page of the [CircleCI web app](https://app.circleci.com). You must be an organization member to view, create, or edit contexts. After a context has been created, you can use the `context` key in the workflows section of a project's [`.circleci/config.yml`]({{site.baseurl}}/configuration-reference/#context) file to give any job(s) access to the environment variables associated with the context, as shown in the image below.

![Contexts Overview]({{site.baseurl}}/assets/img/docs/contexts_cloud.png)

To use environment variables set on the **Contexts** page of the web app, the person running the workflow must be a member of the organization for which the context is set.

Context names must be unique for each VCS organization. The default name for a context is `org-global`. Contexts created with the initial default name of `org-global` will continue to work.
{: class="alert alert-info" }

## Create and use a context
{: #create-and-use-a-context }

1. Using CircleCI web app, click on **Organization Settings > Contexts** on the left side navigation.

    Be aware that organization members can create a context, but only organization administrators can restrict it with a security group. The one exception to this case is Bitbucket organizations, which require a user to have the `create repositories` workspace permission, regardless of their other permissions on the workspace or the repositories it contains.

    ![Contexts]({{site.baseurl}}/assets/img/docs/org-settings-contexts-v2.png)

    If you are using CircleCI server, **Organization Settings** can still be accessed as normal using the **Settings** link in the main navigation.
    {: class="alert alert-info" }

2. Click the **Create Context** button to add a unique name for your context. Click the **Create Context** button in the dialog box to finalize. The new context will appear in a list with security set to `All members` to indicate that anyone in your organization can access this context at runtime.

3. You can now click on any context created in your list to add environment variables. Click on the **Add Environment Variable** button to enter the variable name and value you wish to associate with this context. Click the **Add Environment Variable** button in the dialoge box to finialize.

4. Add the `context` key to the [`workflows`]({{site.baseurl}}/configuration-reference/#workflows) section of your `.circleci/config.yml` file for every job in which you want to use the variable. In the following example, the `run-tests` job will have access to the variables set in the `org-global` context. CircleCI cloud users can specify multiple contexts, so in this example `run-tests` will also have access to variables set in the context called `my-context`.

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
    steps:
      - checkout
      - run:
          name: "echo environment variables from org-global context"
          command: echo $MY_ENV_VAR
```

If you move your repository to a new organization, you must also have the context with that unique name set in the new organization ([see below](#rename-orgs-and-repositories)).
{: class="alert alert-info" }

### Contexts and environment variable constraints
{: #contexts-and-environment-variable-constraints }

When creating contexts/environment variables, please note the following:

- The context name must be 200 or fewer characters, must contain at least one non-whitespace character, and must not contain leading, trailing or vertical whitespace.
- The environment variable name must be 300 or fewer characters, begin with alpha or `_` as the first character, and use alphanumeric or `_` for the remaining characters.
- An environment variable value must have 32k or fewer characters.
- An empty environment variable is considered valid.
- Each context is limited to 100 environment variables.
- Each organization is limited to 500 contexts.

## Context naming for CircleCI server
{: #context-naming-for-circleci-server }

For any VCS enterprise installation that includes multiple organizations, the context names across those organizations must be unique. For example, if your GitHub Enterprise installation is named Kiwi and includes two organizations, you cannot add a context called `deploy` to both organizations. That is, the `deploy` context name cannot be duplicated in two organizations that exist in the same GitHub Enterprise installation for the Kiwi account. Duplicate contexts within an account will fail with an error.

## Combine contexts
{: #combine-contexts }

You can combine several contexts for a single job by adding them to the context list. Contexts are applied in order, so in the case of overlaps, later contexts override earlier ones. This way, you can scope contexts to be as small and granular as you like.

## Restrict a context
{: #restrict-a-context }

CircleCI enables you to restrict secret environment variables at run time by adding security groups to contexts. Only organization administrators may add *security groups* to a new or existing context. Security groups are your organization's VCS teams. After a security group is added to a context, only members of that security group who are also CircleCI users may access the context and use the associated environment variables.

Organization administrators have read/write access to all projects and have unrestricted access to all contexts.

The default security group is `All members`, and enables any member of the organization who uses CircleCI to use the context.

Bitbucket repositories do **not** provide an API that allows CircleCI contexts to be restricted, only GitHub projects include the ability to restrict contexts with security groups.
{: class="alert alert-info" }

### Run workflows with a restricted context
{: #run-workflows-with-a-restricted-context }

To invoke a job that uses a restricted context, a user must be a member of one of the security groups for the context and must sign up for CircleCI. If the user running the workflow does not have access to the context, the workflow will fail with the `Unauthorized` status.

### Restrict a context to a security group or groups
{: #restrict-a-context-to-a-security-group-or-groups }

You must be an organization administrator to complete the following task.

1. Navigate to **Organization Settings > Contexts** in the CircleCI web app to see the list of contexts. The default security group is `All members`, and allows all users in the organization to invoke jobs with that context.
2. Click the **Create Context** button if you wish to use a new context, or click the name of an existing context (if using an existing context, you will need to remove the `All members` security group before adding a new one).
3. Click the **Add Security Group** (GitHub users) or **Add Project Restriction** (GitLab users) button to view the dialog box.
4. Make your choices in the dialogue box and then click the **Add Security Group** or **Add Project Restriction** button to finalize. Conexts will now be restricted to the selections you have made.
5. Click **Add Environment Variables** to add environment variables to the context if none exist, fill out your desired name and value in the dialogue box, then click the **Add Environment Variables** button to finalize. Use of the environment variables for this context is now limited to members of the security groups.
6. Navigate back to **Organization Settings > Contexts** in the CircleCI app. The security groups appear in the Security column for the context.

Only members of the selected groups may now use the context in their workflows or add or remove environment variables for the context.

### Make changes to context restrictions
{: #make-changes-to-context-restrictions }

Changes to security group restrictions for contexts might not take effect immediately due to caching. To make sure settings are applied immediately, it is best practice for the organization administrator to refresh permissions once the change has been made. The **Refresh Permissions** button can be found on the [Account Integrations](https://app.circleci.com/settings/user) page.

Administrators of CircleCI server installations can find the **Refresh Permissions** button at `<circleci-hostname>/account`.

### Approve jobs that use restricted contexts
{: #approve-jobs-that-use-restricted-contexts }

Adding an [approval job]({{site.baseurl}}/configuration-reference/#type) to a workflow gives the option to require manual approval of the use of a restricted context. To restrict running of jobs that are downstream from an approval job, add a restricted context to those downstream jobs, as shown in the example below:

```yaml
version: 2.1

# Jobs declaration for build, test and deploy not displayed

workflows:
  jobs:
    build-test-deploy:
      - build
      - test:
          context: my-restricted-context
          requires:
            - build
      - hold:
          type: approval # presents manual approval button in the UI
          requires:
            - build
      - deploy:
          context: deploy-key-restricted-context
          requires:
            - build
            - hold
            - test
```

In this example, the jobs `test` and `deploy` are restricted, and `deploy` will only run if the user who approves the `hold` job is a member of the security group assigned to the context _and_ `deploy-key-restricted-context`. When the workflow `build-test-deploy` runs, the jobs `build` and `test` will run, then the `hold` job will run, which will present a manual approval button in the CircleCI application. This approval job may be approved by _any_ member of the project, but the `deploy` job will fail as `unauthorized` if the approver is not part of the restricted context security group.

## Project restrictions
{: #project-restrictions }

CircleCI enables you to restrict secret environment variables by adding project restrictions to contexts. Only [organization admins]({{site.baseurl}}/gitlab-integration#about-roles-and-permissions) may add or remove project restrictions to a new or existing context. After a project restriction is added to a context, only workflows associated with the specified project(s) will have access to the context and its environment variables.

NOTE: API support for project restricted contexts is coming soon.

Organization Admins have read/write access to all projects, and have unrestricted access to all contexts.

### Run workflows with a project restricted context
{: #run-workflows-with-a-project-restricted-context }

To invoke a workflow that uses a restricted context, the workflow must be part of the project the context is restricted to. If the workflow does not have access to the context, the workflow will fail with the `Unauthorized` status.

### Restrict a context to a project
{: #restrict-a-context-to-a-project }

You must be an **organization admin** to restrict a context though the method detailed below.

. Navigate to the **Organization Settings > Contexts** page of your organization in the [CircleCI web app](https://app.circleci.com/). The list of contexts will be visible.

1. Select the name of an existing context, or click the **Create Context** button if you want to use a new context.

1. Click the **Add Project Restriction** button to view the dialog box.

1. Select the project name to add to the context, and click the **Add** button. Use of the context is now limited to the specified project. Currently, multiple projects must be added individually.

1. You should now see a list of the defined project restrictions on the context page.

1. If you have environment variables, they should appear on the page. If there are none, you can click **Add Environment Variables** to add them to the context. Then click the **Add** button to finish. Use of the environment variables for this context is now limited to the specified projects.

Only workflows under the specified projects may now use the context and its environment variables.

### Remove project restrictions from contexts
{: #remove-project-restrictions-from-contexts }

You must be an **organization admin** to remove projects from contexts though the method detailed below.

1. Navigate to **Organization Settings > Contexts** page in the [CircleCI web app](https://app.circleci.com/). The list of contexts will be visible.

1. Select the name of the existing context for which you would like to modify restrictions.

1. Click the **X** button next to the project restriction you would like to remove. The project restriction will be removed for the context.

1. If there are no longer any project restrictions for the context, the context and its environment variables are now effectively unrestricted.

## Remove groups from contexts
{: #remove-groups-from-contexts }

To make a context available _only_ to the administrators of the organization, you may remove all of the groups associated with a context. All other users will lose access to that context.


## Add and remove users from teams and groups
{: #add-and-remove-users-from-teams-and-groups }

**GitHub users:** CircleCI syncs GitHub team and LDAP groups every few hours. If a user is added or removed from a GitHub team or LDAP group, it will take up to a few hours to update the CircleCI records and remove access to the context.

## Add and remove environment variables from restricted contexts
{: #adding-and-removing-environment-variables-from-restricted-contexts }

Addition and deletion of environment variables from a restricted context is limited to members of the context groups.

## Delete a context
{: #delete-a-context }

If the context is restricted with a group other than `All members`, you must be a member of that security group to complete this task. To delete a context, follow the steps below:

1. Navigate to the **Organization Settings > Contexts** in the CircleCI web app.

2. Click the **X** icon in the row of the context you want to delete. A confirmation dialog box will appear.

3. Type "DELETE" in the field and then click **Delete Context**. The context and all associated environment variables will be deleted.

If a deleted context was being used by a job in a workflow, the job will start to fail and show an error.
{: class="alert alert-info"}

## Context management with the CLI
{: #context-management-with-the-cli}

Managing Contexts via the CircleCI CLI is not currently supported for GitLab or GitHub App projects. To find out if you authorized through the GitHub OAuth app or the CircleCI GitHub App, see the [GitHub App integration](/docs/github-apps-integration/) page.
{: class="alert alert-info"}

While contexts can be managed on the CircleCI web application, the [CircleCI CLI](https://circleci-public.github.io/circleci-cli/) provides an alternative method for managing the usage of contexts in your projects. With the CLI, you can execute several [context-oriented commands](https://circleci-public.github.io/circleci-cli/circleci_context.html).

- `create` - Create a new context
- `delete` - Delete the named context
- `list` - List all contexts
- `remove-secret` - Remove an environment variable from the named context
- `show` - Show a context
- `store-secret` - Store a new environment variable in the named context

The above list are "sub-commands" in the CLI, which would be executed like so:

```shell
circleci context create
```

Many commands will require that you include additional information as indicated by the parameters delimited by `< >`. For example, after running `circleci context create`, you will be instructed to provide more information: `circleci context create <vcs-type> <org-name> <context-name> [flags]`.

As with most of the CLI's commands, you will need to properly [configure the CLI]({{site.baseurl}}/local-cli#configuring-the-cli) with a token to enable performing context related actions.

## Environment variable usage
{: #environment-variable-usage }

Environment variables are used according to a specific precedence order, as follows:

1. Environment variables declared [inside a shell command]({{site.baseurl}}/set-environment-variable/#set-an-environment-variable-in-a-shell-command) in a `run` step, for example `FOO=bar make install`.
2. Environment variables declared with the `environment` key [for a `run` step]({{site.baseurl}}/set-environment-variable/#set-an-environment-variable-in-a-step)
3. Environment variables set with the `environment` key [for a job]({{ site.baseurl }}/set-environment-variable/#set-an-environment-variable-in-a-job).
4. Special CircleCI environment variables defined on the [Project values and variables]({{site.baseurl}}/variables#built-in-environment-variables) page.
5. Context environment variables (assuming the user has access to the context).
6. [Project-level environment variables]({{site.baseurl}}/set-environment-variable/#set-an-environment-variable-in-a-project) set on the **Project Settings** page in the web app.

Environment variables declared inside a shell command `run step`, for example `FOO=bar make install`, will override environment variables declared with the `environment` and `contexts` keys. Environment variables added on the contexts page will take precedence over variables added on the **Project Settings** page.

### Create environment variables with the CLI or API
{: #creating-environment-variables }

**With the CLI**

_If this is your first time using the CLI, follow the instructions on [CircleCI CLI configuration]({{site.baseurl}}/local-cli/?section=configuration) to set up your CircleCI command line interface._

To create an environment variable using our CLI, perform the following steps:

1. If you have not already done so, find the right context name that will contain the new environment variable by executing this command: `circleci context list <vcs-type> <org-name>`

2. Store a new environment variable under that context by executing this command: `circleci context store-secret <vcs-type> <org-name> <context-name> <env-var-name>`

Note that the CLI will prompt you to input the secret value, rather than accepting it as an argument. This approach is designed to avoid unintentional secret exposure.

**With the API**

To create an environment variable using the API, call the [Add Environment Variable](https://circleci.com/docs/api/v2/#operation/addEnvironmentVariableToContext) endpoint with the appropriate request body. For this request, replace the `context-id` and the `env-var-name` with the ID for the context and the new environment variable name. The request body should include a `value` key containing the plaintext secret as a string.

### Delete environment variables with the CLI or API
{: #deleting-environment-variables }

**With the CLI**

To delete an environment variable using the CLI, perform the following steps:

1. If you have not already done so, find the context name that contains the environment variable you wish to delete by executing this command: `circleci context list <vcs-type> <org-name>`

2. Confirm the environment variable exists within that context. To list all variables under that context, execute this command: `circleci context show <vcs-type> <org-name> <context-name>`

3. Delete the environment variable by executing this command: `circleci context remove-secret <vcs-type> <org-name> <context-name> <env-var-name>`

**With the API**

To delete an environment variable using the API, call the [Delete environment variable](https://circleci.com/docs/api/v2/#operation/addEnvironmentVariableToContext) endpoint.

For this request, replace the `context-id` and the `env-var-name` with the ID for the context and the environment variable name that should be updated.

### Rotate Environment Variables with the CLI or API
{: #rotating-environment-variables }

Rotation refers to the process of updating a secret's value without deleting it or changing its name.

Because environment variables can be shared, passed around between employees and teams, and exposed inadvertently, it is always good practice to periodically rotate secrets. Many organizations automate this process, for example, running a script when an employee leaves the company, or when a secret may have been compromised.

Context environment variables can be rotated using CircleCI’s CLI, or by accessing the API.

 **With the CLI**

_If this is your first time using the CLI, follow the instructions on [CircleCI CLI configuration]({{site.baseurl}}/local-cli/?section=configuration) to set up your CircleCI command line interface._

To rotate an environment variable using the CLI, perform the following steps:

1. If you have not already done so, find the context name that contains the variable you would like to rotate by executing this command: `circleci context list <vcs-type> <org-name>`

2. Find the environment variable to rotate within that context by executing this command: `circleci context show <vcs-type> <org-name> <context-name>`

3. Update the existing environment variable under that context. Execute this command and replace the `env-var-name` with the name of the environment variable from Step 2: `circleci context store-secret <vcs-type> <org-name> <context-name> <env-var-name>`

Note that the CLI will prompt you to input the secret value, rather than accepting it as an argument. This approach is designed to avoid unintentional secret exposure.

**With the API**

To rotate an environment variable from the API, call the [Update environment variable](https://circleci.com/docs/api/v2/#operation/addEnvironmentVariableToContext) endpoint with the appropriate request body. For this request, replace the `context-id` and the `env-var-name` with the ID for the context and the environment variable name that should be updated. The request body should include a `value` key containing the plaintext secret as a string.

{% include snippets/secrets-masking.md %}

## See also
{: #see-also }


* [CircleCI environment variable descriptions]({{site.baseurl}}/env-vars/)
* [Workflows]({{site.baseurl}}/workflows/)
