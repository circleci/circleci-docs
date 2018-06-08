---
layout: classic-docs
title: "Managing API Tokens"
short-title: "Managing API Tokens"
description: "How to assign scoped tokens for using the CircleCI API"
order: 20
---

To use the CircleCI API
or view details about a build,
you will need API tokens with the appropriate permissions.
This document describes the types of API tokens,
as well as how to create and delete them.

## Overview

There are two types of API tokens
you can create within CircleCI.

  1. **Personal**:
  These tokens are used to interact with the CircleCI API
  and grant full read and write permissions.
  2. **Project**:
  These tokens provide information about specific projects
  and only grant read permissions.
  Project tokens have three scope options: _Status_, _Build Artifacts_, and _All_.
      - _Status_ tokens grant read access to the project's build statuses.
      Useful for [embedding status badges]({{ site.baseurl }}/2.0/status-badges/).
      - _Build Artifacts_ tokens grant read access to the project's build artifacts.
      - _All_ tokens grant read access for the project's build statuses and build artifacts.

**Note**:
API tokens cannot be modifed
after they have been created.
The only way to change existing tokens
is to delete and recreate them.

### Creating a Personal API Token

  1. In the CircleCI application,
  go to your [User settings](https://circleci.com/account){:rel="nofollow"}.
  2. Click [Personal API Tokens](https://circleci.com/account/api){:rel="nofollow"}.
  3. Click the **Create New Token** button.
  4. In the **Token name** field,
  type a memorable name for the token.
  5. Click the **Add API Token** button.
  6. After the token appears,
  copy and paste it to another location.
  You will not be able to view the token again.

To delete a personal API token,
click the X in the **Remove** column.

### Creating a Project API Token

  1. In the CircleCI application,
  go to your project's settings
  by clicking the gear icon next to your project.
  2. In the **Permissions** section,
  click on **API Permissions**.
  3. Click the **Create Token** button.
  4. Choose a scope from the dropdown menu.
  5. In the **Token Label** field,
  type a memorable label for the token.
  6. Click the **Add Token** button.

To delete a project API token,
click the X in the **Remove** column.
When the confirmation window appears,
click the **Remove** button.

## Next Steps

API tokens are not useful
unless you do something with them.
Here are a few ideas:

  - [Embed Build Status Badges]({{ site.baseurl }}/2.0/status-badges/) in your project's README or other external page.
  - [Trigger Conditional Jobs]({{ site.baseurl }}/2.0/api-job-trigger/).
  - [Download a build's artifacts]({{ site.baseurl }}/2.0/artifacts/#downloading-all-artifacts-for-a-build-on-circleci) for safekeeping.
  - [Inject environment variables]({{ site.baseurl }}/2.0/env-vars/#injecting-environment-variables-with-the-api) into a build.
