---
layout: classic-docs
title: "Using Contexts"
short-title: "Using Contexts"
description: "Secured, cross-project resources"
order: 41
version:
- Cloud
- Server v4.x
- Server v3.x
- Server v2.x
---

Contexts provide a mechanism for securing and sharing environment variables across projects. The environment variables are defined as name/value pairs and are injected at runtime. This document describes creating and using contexts in CircleCI.

## Overview
{: #overview }

You can create and manage contexts on the **Organization Settings** page of the [CircleCI web app](https://app.circleci.com). You must be an organization member to view, create, or edit contexts. After a context has been created, you can use the `context` key in the workflows section of a project [`config.yml`]({{ site.baseurl }}/configuration-reference/#context) file to give any job(s) access to the environment variables associated with the context, as shown in the image below.

{:.tab.contextsimage.Cloud}
![Contexts Overview]({{ site.baseurl }}/assets/img/docs/contexts_cloud.png)

{:.tab.contextsimage.Server_3}
![Contexts Overview]({{ site.baseurl }}/assets/img/docs/contexts_cloud.png)

{:.tab.contextsimage.Server_2}
![Contexts Overview]({{ site.baseurl }}/assets/img/docs/contexts_server.png)

To use environment variables set on the Contexts page, the person running the workflow must be a member of the organization for which the context is set.

Context names must be unique for each GitHub or Bitbucket organization.

**Note:** Contexts created with the initial default name of `org-global` will continue to work.

### Context naming for CircleCI server
{: #context-naming-for-circleci-server }
{:.no_toc}

For any GitHub Enterprise (GHE) installation that includes multiple organizations, the context names across those organizations must be unique. For example, if your GHE is named Kiwi and includes two organizations, you cannot add a context called `deploy` to both organizations. That is, the `deploy` context name cannot be duplicated in two orgs that exist in the same GHE installation for the Kiwi account. Duplicate contexts within an account will fail with an error.

### Renaming orgs and repositories
{: #renaming-orgs-and-repositories }

If you find you need to rename an org or repo that you have previously hooked up to CircleCI, best practice is to follow these steps:

1. Rename org/repo in VCS.
2. Head to the CircleCI application, using the new org/repo name, for example,  `app.circleci.com/pipelines/<VCS>/<new-org-name>/<project-name>`.
3. Confirm that your plan, projects and settings have been transferred successfully.
4. You are then free to create a new org/repo with the previously-used name in your VCS, if desired.

    **Note**: If you do not follow these steps, it is possible that you may lose access to your org or repo settings, including **environment variables** and **contexts**.

## Creating and using a context
{: #creating-and-using-a-context }

1. Using the new version of the CircleCI application, navigate to the Organization Settings page by clicking on the link in the sidebar.

    **Note:** Organization members can create a context, but only organization administrators can restrict it with a security group. The one exception to this case is Bitbucket organizations, which require a user to have the `create repositories` workspace permission, regardless of their other permissions on the workspace or the repositories it contains.

    ![Contexts]({{ site.baseurl }}/assets/img/docs/org-settings-contexts-v2.png)

    **Note**: If you are using CircleCI server, Organization Settings can still be accessed as normal using the **Settings** link in the main navigation.

2. Click the Create Context button and add a unique name for your Context. After you click the Create Context button in the dialog box, the Context appears in a list with Security set to `All members` to indicate that anyone in your organization can access this Context at runtime.

3. Click the Add Environment Variable button and enter the variable name and value you wish to associate with this context. Click the Add Variable button to save.

4. Add the `context` key to the [`workflows`]({{ site.baseurl }}/configuration-reference/#workflows) section of your [`config.yml`]({{ site.baseurl }}/configuration-reference/) file for every job in which you want to use the variable. In the following example, the `run-tests` job will have access to the variables set in the `org-global` context. CircleCI Cloud users can specify multiple contexts, so in this example `run-tests` will also have access to variables set in the context called `my-context`.

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

{:.tab.contexts.Server_3}
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

{:.tab.contexts.Server_2}
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

### Moving a repository that uses a context
{: #moving-a-repository-that-uses-a-context }

If you move your repository to a new organization, you must also have the context with that unique name set in the new organization.

### Contexts & Environment variables constraints
{: #contexts-and-environment-variables-constraints }

When creating contexts/environment variables, please note the following:

- The context name must be 200 or fewer characters, must contain at least one non-whitespace character, and must not contain leading, trailing or vertical whitespace.
- The environment variable name must be 300 or fewer characters, begin with alpha or `_` as the first character, and use alphanumeric or `_` for the remaining characters.
- An environment variable value must have 32k or fewer characters.
- An empty environment variable is considered valid.
- Each context is limited to 100 environment variables.
- Each organization is limited to 500 contexts.

## Combining contexts
{: #combining-contexts }

You can combine several contexts for a single job by just adding them to the context list. Contexts are applied in order, so in the case of overlaps, later contexts override earlier ones. This way you can scope contexts to be as small and granular as you like.

## Restricting a context
{: #restricting-a-context }

CircleCI enables you to restrict secret environment variables at run time by adding security groups to contexts. Only organization administrators may add *security groups* to a new or existing context. Security groups are your organization's GitHub teams. If you are using CircleCI server v2.x with LDAP authentication, then LDAP groups also define security groups. After a security group is added to a context, only members of that security group who are also CircleCI users may access the context and use the associated environment variables.

Organization administrators have read/write access to all projects and have unrestricted access to all contexts.

The default security group is `All members` and enables any member of the organization who uses CircleCI to use the context.

**Note:** Bitbucket repositories do **not** provide an API that allows CircleCI contexts to be restricted, only GitHub projects include the ability to restrict contexts with security groups.

### Running workflows with a restricted context
{: #running-workflows-with-a-restricted-context }

To invoke a job that uses a restricted context, a user must be a member of one of the security groups for the context and must sign up for CircleCI. If the user running the workflow does not have access to the context, the workflow will fail with the `Unauthorized` status.

### Restrict a context to a security group or groups
{: #restrict-a-context-to-a-security-group-or-groups }

You must be an organization administrator to complete the following task.

1. Navigate to Organization Settings > Contexts page in the CircleCI app. The list of contexts appears. The default security group is `All members` and allows all users in the org to invoke jobs with that context.
2. Click the Create Context button if you wish to use a new context, or click the name of an existing context.
3. Click the Add Security Group button to view the dialog box.
4. Select GitHub teams or LDAP groups to add to the context and click the Add button. Use of the context is now limited to the selected groups.
5. Click Add Environment Variables to add environment variables to the context if none exist and click the Add button. Use of the environment variables for this context is now limited to members of the security groups.
6. Navigate to Organization Settings > Contexts in the CircleCI app. The security groups appear in the Security column for the context.

Only members of the selected groups may now use the context in their workflows or add or remove environment variables for the context.

### Making changes to context restrictions
{: #making-changes-to-context-restrictions }

Changes to security group restrictions for Contexts might not take effect immediately due to caching. To make sure settings are applied immediately, it is best practice for the Org Administrator to refresh permissions once the change has been made. The **Refresh Permissions** button can be found on the [Account Integrations](https://app.circleci.com/settings/user) page.

Administrators of CircleCI server installations can find the **Refresh Permissions** button at `<circleci-hostname>/account`.

### Approving jobs that use restricted contexts
{: #approving-jobs-that-use-restricted-contexts }
{:.no_toc}

Adding an [approval job]({{ site.baseurl }}/configuration-reference/#type) to a workflow gives the option to require manual approval of the use of a restricted context. To restrict running of jobs that are downstream from an approval job, add a restricted context to those downstream jobs, as shown in the example below:

{:.tab.approvingcontexts.Cloud}
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

{:.tab.approvingcontexts.Server_3}
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

{:.tab.approvingcontexts.Server_2}
```yaml
version: 2

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

In this example, the jobs `test` and `deploy` are restricted, and `deploy` will only run if the user who approves the `hold` job is a member of the security group assigned to the context and `deploy-key-restricted-context`. When the workflow `build-test-deploy` runs, the jobs `build` and `test` will run, then the `hold` job, which presents a manual approval button in the CircleCI application. This approval job may be approved by _any_ member of the project, but the `deploy` job will fail as `unauthorized` if the "approver" is not part of the restricted context security group.

## Project restrictions
{: #project-restrictions }

CircleCI enables you to restrict secret environment variables by adding project restrictions to contexts. Currently, **this feature is only enabled for standalone projects that are not tied to a VCS. Standalone projects are only available at this time with a [GitLab integration]({{site.baseurl}}/gitlab-integration) with CircleCI.** A standalone organization allows for managing users and projects independent of the VCS.

Only [organization admins]({{site.baseurl}}/gitlab-integration#about-roles-and-permissions) may add or remove project restrictions to a new or existing context. After a project restriction is added to a context, only workflows associated with the specified project(s) will have access to the context and its environment variables.

Organization Admins have read/write access to all projects, and have unrestricted access to all contexts.

### Running workflows with a project restricted context
{: #running-workflows-with-a-project-restricted-context }

To invoke a workflow that uses a restricted context, the workflow must be part of the project the context is restricted to. If the workflow does not have access to the context, the workflow will fail with the `Unauthorized` status.

### Restrict a context to a project
{: #restrict-a-context-to-a-project }

You must be an **organization admin** to restrict a context though the method detailed below.

. Navigate to the **Organization Settings > Contexts** page of your GitLab organization in the [CircleCI web app](https://app.circleci.com/). The list of contexts will be visible.

1. Select the name of an existing context, or click the **Create Context** button if you want to use a new context.

1. Click the **Add Project Restriction** button to view the dialog box.

1. Select the project name to add to the context, and click the **Add** button. Use of the context is now limited to the specified project. Currently, multiple projects must be added individually.

1. You should now see a list of the defined project restrictions on the context page.

1. If you have environment variables, they should appear on the page. If there are none, you can click **Add Environment Variables** to add them to the context. Then click the **Add** button to finish. Use of the environment variables for this context is now limited to the specified projects.

Only workflows under the specified projects may now use the context and its environment variables.

### Removing project restrictions from contexts
{: #removing-project-restrictions-from-contexts }

You must be an **organization admin** to remove groups from contexts though the method detailed below.

1. Navigate to **Organization Settings > Contexts** page in the [CircleCI web app](https://app.circleci.com/). The list of contexts will be visible.

1. Select the name of the existing context for which you would like to modify restrictions.

1. Click the **X** button next to the project restriction you would like to remove. The project restriction will be removed for the context.

1. If there are no longer any project restrictions for the context, the context and its environment variables are now effectively unrestricted.

## Removing groups from contexts
{: #removing-groups-from-contexts }

To make a context available _only_ to the administrators of the organization, you may remove all of the groups associated with a context. All other users will lose access to that context.

## Adding and removing users from teams and groups
{: #adding-and-removing-users-from-teams-and-groups }

CircleCI syncs GitHub team and LDAP groups every few hours. If a user is added or removed from a GitHub team or LDAP group, it will take up to a few hours to update the CircleCI records and remove access to the context.

## Adding and removing environment variables from restricted contexts
{: #adding-and-removing-environment-variables-from-restricted-contexts }

Addition and deletion of environment variables from a restricted context is limited to members of the context groups.

## Deleting a context
{: #deleting-a-context }

If the context is restricted with a group other than `All members`, you must be a member of that security group to complete this task:

1. As an organization administrator, navigate to the Organization Settings > Contexts page in the CircleCI application.

2. Click the Delete Context button for the Context you want to delete. A confirmation dialog box appears.

3. Type Delete and click Confirm. The Context and all associated environment variables will be deleted. **Note:** If the context was being used by a job in a Workflow, the job will start to fail and show an error.

## Context management with the CLI
{: #context-management-with-the-cli}

While contexts can be managed on the CircleCI web application, the [CircleCI CLI](https://circleci-public.github.io/circleci-cli/) provides an alternative method for managing the usage of contexts in your projects. With the CLI, you can execute several context-oriented commands:

- `create` - Create a new context
- `delete` - Delete the named context
- `list` - List all contexts
- `remove-secret` - Remove an environment variable from the named context
- `show` - Show a context
- `store-secret` - Store a new environment variable in the named context

The above list are "sub-commands" in the CLI, which would be executed like so:

```shell
circleci context create

# Returns the following:
List all contexts

Usage:
  circleci context list <vcs-type> <org-name> [flags]
```

Many commands will require that you include additional information as indicated by the parameters delimited by `< >`.

As with most of the CLI's commands, you will need to have properly [configure the CLI]({{site.baseurl}}/local-cli#configuring-the-cli) with a token to enable performing context related actions.

Some use cases for the CLI are described below in the [Enironment variable usage](#environment-variable-usage) section.

## Environment variable usage
{: #environment-variable-usage }

Environment variables are used according to a specific precedence order, as follows:

1. Environment variables declared [inside a shell command]({{ site.baseurl }}/env-vars/#setting-an-environment-variable-in-a-shell-command) in a `run` step, for example `FOO=bar make install`.
2. Environment variables declared with the `environment` key [for a `run` step]({{ site.baseurl }}/env-vars/#setting-an-environment-variable-in-a-step).
3. Environment variables set with the `environment` key [for a job]({{ site.baseurl }}/env-vars/#setting-an-environment-variable-in-a-job).
4. Special CircleCI environment variables defined in the [CircleCI Built-in Environment Variables]({{ site.baseurl }}/env-vars/#built-in-environment-variables) section of this document.
5. Context environment variables (assuming the user has access to the Context).
6. [Project-level environment variables]({{ site.baseurl }}/env-vars/#setting-an-environment-variable-in-a-project) set on the Project Settings page.

Environment variables declared inside a shell command `run step`, for example `FOO=bar make install`, will override environment variables declared with the `environment` and `contexts` keys. Environment variables added on the Contexts page will take precedence over variables added on the Project Settings page.

### Secure Environment Variable Creation, Deletion, and Rotation
{: #secure-environment-variable-creation-deletion-and-rotation }

This section will walk through interacting with context environment variables using the CircleCI CLI or API.

#### Creating Environment Variables
{: #creating-environment-variables }

##### Using CircleCI’s CLI
{: #using-circlecis-cli }

_If this is your first time using the CLI, follow the instructions on
[CircleCI CLI Configuration]({{site.baseurl}}/local-cli/?section=configuration)
to set up your CircleCI command line interface._

To create an environment variable using our CLI, perform the following steps:

1. If you have not already done so, find the right context name that will contain the new environment variable. Execute this command in the CLI:
`circleci context list <vcs-type> <org-name>`
2. Store a new environment variable under that context. Execute this command in the CLI:
`circleci context store-secret <vcs-type> <org-name> <context-name> <env-var-name>`

Note that the CLI will prompt you to input the secret value, rather than accepting it
as an argument. This approach is designed to avoid unintentional secret exposure.

##### Using CircleCI’s API
{: #using-circlecis-api }
{:.no_toc}

To create an environment variable using the API, call the [Add Environment Variable](https://circleci.com/docs/api/v2/#operation/addEnvironmentVariableToContext)
endpoint with the appropriate request body. For this request, replace the
`context-id` and the `env-var-name` with the ID for the context and the new
environment variable name. The request body should include a `value` key
containing the plaintext secret as a string.

#### Deleting Environment Variables
{: #deleting-environment-variables }

##### Using CircleCI’s CLI
{: #using-circlecis-cli }
{:.no_toc}

To delete an environment variable using the CLI, perform the following steps:

1. If you have not already done so, find the context name that contains the
   environment variable you wish to delete. Execute this command in the CLI:
   `circleci context list <vcs-type> <org-name>`

2. Confirm the environment variable exists within that context. Execute this
   command in the CLI to list all variables under that context:
   `circleci context show <vcs-type> <org-name> <context-name>`

3. Delete the environment variable by executing this command:
   `circleci context remove-secret <vcs-type> <org-name> <context-name> <env-var-name>`

##### Using CircleCI’s API
{: #using-circlecis-api }
{:.no_toc}

To delete an environment variable using the API, call the [Delete Environment Variable](https://circleci.com/docs/api/v2/#operation/addEnvironmentVariableToContext) endpoint.

For this request, replace the `context-id` and the `env-var-name` with the ID
   for the context and the environment variable name that should be updated.

#### Rotating Environment Variables
{: #rotating-environment-variables }

Rotation refers to the process of updating a secret's value without deleting it
or changing its name.

Because environment variables can be shared, passed around between employees and
teams, and exposed inadvertently, it is always good practice to periodically
rotate secrets. Many organizations automate this process, running a script when
an employee leaves the company or when a secret may have been compromised.

Context environment variables can be rotated using CircleCI’s CLI, or by
directly accessing the API.


##### Using CircleCI’s CLI
{: #using-circlecis-cli }
{:.no_toc}

_If this is your first time using the CLI, follow the instructions on
[CircleCI CLI Configuration]({{site.baseurl}}/local-cli/?section=configuration)
to set up your CircleCI command line interface._

To rotate an environment variable using the CLI, perform the following steps:

1. If you have not already done so, find the context name that contains the
   variable you would like to rotate. Execute this command in the CLI:
   `circleci context list <vcs-type> <org-name>`

2. Find the environment variable to rotate within that context. Execute this command in the CLI:
   `circleci context show <vcs-type> <org-name> <context-name>`

3. Update the existing environment variable under that context. Execute this
   command in the CLI and replace the `env-var-name` with the name of the
   environment variable from Step 2:
  `circleci context store-secret <vcs-type> <org-name> <context-name> <env-var-name>`

Note that the CLI will prompt you to input the secret value, rather than accepting it
as an argument. This approach is designed to avoid unintentional secret exposure.

##### Using CircleCI’s API
{: #using-circlecis-api }
{:.no_toc}

To rotate an environment variable from our API, call the [Update Environment Variable](https://circleci.com/docs/api/v2/#operation/addEnvironmentVariableToContext)
endpoint with the appropriate request body. For this request, replace the `context-id`
and the `env-var-name` with the ID for the context and the environment variable name
that should be updated. The request body should include a `value` key containing the
plaintext secret as a string.


## Secrets masking
{: #secrets-masking }
_Secrets masking is not currently available on self-hosted installations of CircleCI server_

Contexts hold potentially sensitive secrets that are not intended to be exposed. For added security, CircleCI performs secret masking on the build output, obscuring `echo` or `print` output that contains env var values.

The value of the context will not be masked in the build output if:

* the value is less than 4 characters
* the value is equal to one of `true`, `True`, `false` or `False`

**Note:** Secrets Masking will only prevent the value of the environment variable from appearing in your build output. If your secrets appear elsewhere, such as test results or artifacts, they will not be masked. In addition, the value of the environment variable is still accessible to users [debugging builds with SSH]({{ site.baseurl }}/ssh-access-jobs).

## See also
{: #see-also }
{:.no_toc}

* [CircleCI Environment Variable Descriptions]({{ site.baseurl }}/env-vars/)
* [Workflows]({{ site.baseurl }}/workflows/)
