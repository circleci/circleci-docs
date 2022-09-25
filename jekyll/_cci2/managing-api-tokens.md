---
layout: classic-docs
title: "Managing API Tokens"
short-title: "Managing API Tokens"
description: "How to assign scoped tokens for using the CircleCI API"
order: 20
version:
- Cloud
- Server v4.x
- Server v3.x
- Server v2.x
---

To use the CircleCI API or view details about your pipelines, you will need API tokens
with the appropriate permissions. This document describes the types of API
tokens available, as well as how to create and delete them.

## Overview
{: #overview }

There are two types of API token you can create within CircleCI.

  1. **Personal**:
  These tokens are used to interact with the CircleCI API
  and grant full read and write permissions.
  2. **Project**:
  These tokens allow you to read/write information for specific projects.
  Project tokens have three scope options: _Status_, _Read Only_, and _Admin_.
    - _Status_ tokens grant read access to the project's build statuses.
    Useful for [embedding status badges]({{ site.baseurl }}/status-badges/).
    - _Read Only_ tokens grant read only access to the project's API.
    - _Admin_ tokens grant read and write access for the project's API.

**Note**: API tokens cannot be modified after they have been created. The only
way to change existing tokens is to delete and recreate them, also known as "token rotation".

### Creating a personal API token
{: #creating-a-personal-api-token }

  1. In the CircleCI application, go to your [User settings](https://app.circleci.com/settings/user){:rel="nofollow"}.
  2. Click [Personal API Tokens](https://app.circleci.com/settings/user/tokens){:rel="nofollow"}.
  3. Click the **Create New Token** button.
  4. In the **Token name** field, type a memorable name for the token.
  5. Click the **Add API Token** button.
  6. After the token appears, copy and paste it to another location. You will
     not be able to view the token again.

To delete a personal API token, click the X in the **Remove** column and confirm
your deletion in the dialog window.

### Creating a project API token
{: #creating-a-project-api-token }

  1. In the CircleCI application, go to your project's settings. There are various ways to get there. One way is to select **Projects** in the sidebar, then the ellipsis (`...`) next to your project and select **Project Settings**.
  2. Select **API Permissions**.
  3. Click the **Add API Token** button.
  4. Choose a scope from the dropdown menu. These are described in the [Overview](#overview) section above.
  5. In the **Label** field, type a memorable label for the token.
  6. Click the **Add API Token** button.

To delete a project API token, Click the **X** in the **Remove** column for the
token you wish to replace. When the confirmation window appears, enter the text
`DELETE` in the form and click the **Delete API Token** button.


### Rotating Personal and Project API Tokens
{: #rotating-personal-and-project-api-tokens }

API Token rotation occurs when an old API token is replaced with a new token.

Because API Tokens can be shared, passed around between employees and teams, and
exposed inadvertently, it is always good practice to periodically regenerate new
API Tokens. Many organizations automate this process, running a script when an
employee leaves the company or when a token has been considered leaked.

#### Rotating a Personal API Token
{: #rotating-a-personal-api-token }

1. In the CircleCI application, go to your [User settings](https://app.circleci.com/settings/user).
1. Click [Personal API Tokens](https://app.circleci.com/settings/user/tokens).
1. Click the **X** in the **Remove** column for the token you wish to replace and confirm your deletion.
1. Click the **Create New Token** button.
1. In the **Token name** field, type a new name for the old token you are rotating. It can be the same name given to the old token.
1. Click the **Add API Token** button.
1. After the token appears, copy and paste it to another location. You will not be able to view the token again.

#### Rotating a Project API Token
{: #rotating-a-project-api-token }

1. In the CircleCI application, go to your project's settings. There are various ways to get there. One way is to select **Projects** in the sidebar, then the ellipsis (`...`) next to your project and select **Project Settings**.
1. Select **API Permissions**.
1. Click the **X** in the **Remove** column for the token you wish to replace.
   When the confirmation window appears, enter the text `DELETE` in the form and click the **Delete API Token** button.
1. Click the **Create API Token** button.
1. Choose the same scope used for the old token from the dropdown menu.
1. In the **Label** field, type a label for the token. It can be the same name given to the old token.
1. Click the **Add API Token** button.

## Next steps
{: #next-steps }

Some possible use cases for an API token might be:

  - [Embed Build Status Badges]({{ site.baseurl }}/status-badges/) in your project's README or other external page.
  - [Download a build's artifacts]({{ site.baseurl }}/artifacts/#downloading-all-artifacts-for-a-build-on-circleci) for safekeeping.
  - [Inject environment variables]({{ site.baseurl }}/inject-environment-variables-with-api) into a build.
