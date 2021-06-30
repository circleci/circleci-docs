---
layout: classic-docs
title: "API トークンの管理"
short-title: "API トークンの管理"
description: "CircleCI の API を使用するためにスコープ付きトークンを割り当てる方法"
order: 20
version:
  - Cloud
  - Server v2.x
---

To use the CircleCI API or view details about a build, you will need API tokens with the appropriate permissions. This document describes the types of API tokens, as well as how to create and delete them.

## 概要
{: #overview }

There are two types of API tokens you can create within CircleCI.

  1. **Personal**: These tokens are used to interact with the CircleCI API and grant full read and write permissions.
  2. **Project**: These tokens allow you to read/write information for specific projects. Project tokens have three scope options: _Status_, _Read Only_, and _Admin_.
    - _Status_ tokens grant read access to the project's build statuses. [ステータス バッジを埋め込む]({{ site.baseurl }}/2.0/status-badges/)際に便利です。
    - _Read Only_ tokens grant read only access to the project's API.
    - _Admin_ tokens grant read and write access for the project's API.

**Note**: API tokens cannot be modified after they have been created. The only way to change existing tokens is to delete and recreate them, also known as "token rotation".

### Creating a personal API token
{: #creating-a-personal-api-token }

  1. In the CircleCI application, go to your [User settings](https://circleci.com/account){:rel="nofollow"}.
  2. [[Personal API Tokens (パーソナル API トークン)](https://circleci.com/account/api)]{:rel="nofollow"} をクリックします。
  3. Click the **Create New Token** button.
  4. In the **Token name** field, type a memorable name for the token.
  5. Click the **Add API Token** button.
  6. After the token appears, copy and paste it to another location. You will not be able to view the token again.

To delete a personal API token, click the X in the **Remove** column and confirm your deletion in the dialog window.

### Creating a project API token
{: #creating-a-project-api-token }

  1. In the CircleCI application, go to your project's settings by clicking the gear icon next to your project.
  2. In the **Permissions** section, click on **API Permissions**.
  3. Click the **Create Token** button.
  4. ドロップダウン メニューからスコープを選択します。
  5. In the **Token Label** field, type a memorable label for the token.
  6. Click the **Add Token** button.

To delete a project API token, Click the **X** in the **Remove** column for the token you wish to replace. When the confirmation window appears, enter the text DELETE in the form and click the Delete API Token button.


### Rotating Personal and Project API Tokens
{: #rotating-personal-and-project-api-tokens }

API Token rotation occurs when an old API token is replaced with a new token.

Because API Tokens can be shared, passed around between employees and teams, and exposed inadvertently, it is always good practice to periodically regenerate new API Tokens. Many organizations automate this process, running a script when an employee leaves the company or when a token has been considered leaked.

#### Rotating a Personal API Token
{: #rotating-a-personal-api-token }

1. In the CircleCI application, go to your [User settings](https://app.circleci.com/settings/user).
1. Click [Personal API Tokens](https://app.circleci.com/settings/user/tokens).
1. Click the **X** in the **Remove** column for the token you wish to replace and confirm your deletion.
1. Click the Create New Token button.
1. In the Token name field, type a new name for the old token you are rotating. It can be the same name given to the old token.
1. Click the Add API Token button.
1. After the token appears, copy and paste it to another location. You will not be able to view the token again.

#### Rotating a Project API Token
{: #rotating-a-project-api-token }

1. In the CircleCI application, go to your project’s settings by clicking the gear icon next to your project.
1. In the **Permissions** section, click on **API Permissions**.
1. Click the **X** in the **Remove** column for the token you wish to replace. When the confirmation window appears, enter the text DELETE in the form and click the Delete API Token button.
1. Click the **Create Token** button.
1. Choose the same scope used for the old token from the dropdown menu.
1. In the **Token Label** field, type a label for the token. It can be the same name given to the old token.
1. Click the **Add Token** button.

## Next steps
{: #next-steps }

Some possible usecases for an API token might be:

  - プロジェクトの README などの外部ページに[ビルド ステータス バッジを埋め込む]({{ site.baseurl }}/2.0/status-badges/)
  - {{ site.baseurl }}/2.0/api-job-trigger/
  - {{ site.baseurl }}/2.0/artifacts/#circleci-で行うビルドのすべてのアーティファクトのダウンロード
  - [Inject environment variables]({{ site.baseurl }}/2.0/env-vars/#injecting-environment-variables-with-api-v2) into a build.
