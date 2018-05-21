---
layout: classic-docs
title: "API Permissions"
short-title: "API Permissions"
description: "How to Change API Permissions on CircleCI"
order: 20
---

To use the CircleCI API
or view details about a build,
you will need API tokens with the appropriate permissions.
This document describes the types of API tokens,
as well as how to create and delete them.

## Overview

There are two types of API token
you can create within CircleCI.

  1. **Personal**:
  These tokens are used to interact with the CircleCI API
  and grant full read and write permissions.
  2. **Project**:
  These tokens provide information about specific projects
  and only grant read permissions.
  Project tokens have three scope options: _Status_, _Build Artifacts_, and _All_.
      - _Status_ tokens grant read access to the project's build statuses.
      - _Build Artifacts_ tokens grant read access to the project's build artifacts.
      - _All_ tokens grant read access for the project's build statuses and build artifacts.

### Creating a Personal API Token

  1. In the CircleCI application,
  go to your user settings
  by clicking the profile picture in the upper-right corner,
  then clicking [User settings](https://circleci.com/account).
  2. On the **User Settings** page,
  click [Personal API Tokens](https://circleci.com/account/api).
  3. On the Personal API Tokens page,
  click the **Create New Token** button.
  4. In the **Token name** field,
  add a name for this token
  to remind you
  how it will be used.
  5. To create the API token,
  click the **Add API Token** button.
  6. After the token appears,
  copy and paste it to another location.
  You will not be able to view the token again.

**Note**:
Once created,
personal API tokens cannot be modified.
The only way to change an existing token
is to delete it and recreate it.

### Creating a Project API Token

  1. In the CircleCI application,
  go to your project's settings
  by clicking the gear icon next to your project.
  2. In the **Permissions** section,
  click on **API Permissions**.
  3. Click the **Create Token** button.
  4. Choose a scope from the dropdown menu.
  **Status** gives read access to build statuses,
  **Build Artifacts** gives read access to build artifacts,
  and **All** gives combined access.
  5. In the **Token Label** field,
  create a memorable label for the API token.
  6. Click the **Add Token** button
  to create the API token.

## See More

- [Downloading All Artifacts for a Build on CircleCI]({{ site.baseurl }}/2.0/artifacts/#downloading-all-artifacts-for-a-build-on-circleci)
- [Injecting Environment Variables with the API]({{ site.baseurl }}/2.0/env-vars/#injecting-environment-variables-with-the-api)
- [Using Config Translation]({{ site.baseurl }}/2.0/config-translation/#using-config-translation)
- [Status Badges]({{ site.baseurl }}/2.0/status-badges/)
- [Running Jobs With the API]({{ site.baseurl }}/2.0/api-job-trigger/)
- [Examples]({{ site.baseurl }}/2.0/examples/)
