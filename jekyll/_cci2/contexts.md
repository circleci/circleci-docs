---
layout: classic-docs
title: "CircleCI 2.0"
redirect: /docs/2.0/env-vars/#contexts
---

This document describes
how to create and use contexts in CircleCI in the following sections:

* TOC
{:toc}

## Overview

Contexts provide a mechanism
for securing and sharing environment variables across projects.
Contexts are set in the CircleCI application
and specified in the `workflows` section of a project's `~/.circleci/config.yml` file.

For more information on other types of environment variables,
see the [Environment Variables]({{ site.baseurl }}/2.0/env-vars/) document.

## Creating a Context

1. In the CircleCI application,
select **Settings** in the sidebar.

2. In the **Organization** section,
select **Contexts**.
All Contexts for your organization are listed here.

3. Click the **Create Contexts** button
and enter a name for the new Context.
Context names must be unique for each Github or Bitbucket organization,
with the exception of the default Context name (`org-global`).
To create the Context,
click the **Create** button.
The new Context appears in the list.

**Note:**
By default,
all new Contexts are public
and can be specified by anyone in your organization.

## Adding an Environment Variable to a Context

1. In the CircleCI application,
select **Settings** in the sidebar.

2. In the **Organization** section,
select **Contexts**.
All Contexts for your organization are listed here.

3. From the list,
select the name of the Context
to which you would like
to add an environment variable.

4. Click the **Add Environment Variable** button.

5. Enter a name and value for the environment variable,
then click the **Add** button.
The new environment variable appears in the list.

**Note:**
Once created,
environment variables are hidden and uneditable in the application.
Changing an environment variable is only possible
by deleting and recreating it.

## Using a Context

Contexts are specified in the `workflows` section of your project's `~/.circleci/config.yml` file.
For each job in a workflow you want
to use the Context,
use the `context` key with the name of the Context.

```yaml
workflows:
  version: 2
  my-workflow:
    jobs:
      - run-tests:
          context: org-global
```

In the above example,
the `run-tests` job uses any environment variables set in the `org-global` Context.

**Note:**
After specifying a Context for a job,
you must rerun the job from the Workflows page of the CircleCI application.
The job cannot access the environment variables in the Context
until the job is rerun.

## Deleting a Context

1. In the CircleCI application,
select **Settings** in the sidebar.

2. In the **Organization** section,
select **Contexts**.
All Contexts for your organization are listed here.

3. Click the **X** next to the Context you want to delete.
A confirmation dialog box appears.

4. Type 'DELETE'
and click the **Delete** button.
The Context disappears from the list of Contexts.

## See More
