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

CircleCI の API を使用したり、ビルドの詳細を確認したりするには、適切な権限を持つ API トークンが必要です。 ここでは、API トークンの種類と、トークンを作成および削除する方法について説明します。

## 概要
CircleCI では 2 種類の API トークンを作成できます。

There are two types of API tokens you can create within CircleCI.

  1. **パーソナル:** このトークンは CircleCI API とのやり取りに使用され、完全な読み取りアクセス権と書き込みアクセス権を付与します。
  2. **プロジェクト**: このトークンは、特定のプロジェクトに関する情報を提供し、読み取りアクセス権のみを付与します。 プロジェクト トークンには、*Status*、*Build Artifacts*、*All* の 3 つのスコープ オプションがあります。
    - *Status* トークン: プロジェクトのビルド ステータスへの読み取りアクセス権を付与します。 [ステータス バッジを埋め込む]({{ site.baseurl }}/ja/2.0/status-badges/)際に便利です。
    - _Read Only_ tokens grant read only access to the project's API.
    - _Admin_ tokens grant read and write access for the project's API.

**メモ:** API トークンは、一度作成すると修正できません。 既存のトークンを変更するには、いったん削除してから再作成する必要があります。

### パーソナル API トークンの作成
{: #creating-a-personal-api-token }

  1. CircleCI アプリケーションで、[ユーザー設定](https://circleci.com/account){:rel="nofollow"}に移動します。
  2. [[Personal API Tokens (パーソナル API トークン)](https://circleci.com/account/api)]{:rel="nofollow"} をクリックします。
  3. **[Create New Token (新しいトークンを作成する)]** ボタンをクリックします。
  4. **[Token name (トークン名)]** フィールドに、覚えやすいトークン名を入力します。
  5. **[Add API Token (API トークンを追加する)]** ボタンをクリックします。
  6. After the token appears, copy and paste it to another location. You will not be able to view the token again.

To delete a personal API token, click the X in the **Remove** column and confirm your deletion in the dialog window.

### プロジェクト API トークンの作成
{: #creating-a-project-api-token }

  1. CircleCI アプリケーションで、プロジェクトの横にある歯車のアイコンをクリックして、プロジェクトの設定に移動します。
  2. In the **Permissions** section, click on **API Permissions**.
  3. Click the **Create Token** button.
  4. ドロップダウン メニューからスコープを選択します。
  5. **[Token Label (トークン ラベル)]** フィールドに、覚えやすいラベルを入力します。
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
1. パーソナル API トークンを削除するには、**[Remove (削除する)]** 列の [X] をクリックします。
1. Click the Create New Token button.
1. In the Token name field, type a new name for the old token you are rotating. It can be the same name given to the old token.
1. Click the Add API Token button.
1. トークンが表示されたら、別の場所にコピー & ペーストします。 トークンを再度表示することはできません。

#### Rotating a Project API Token
{: #rotating-a-project-api-token }

1. In the CircleCI application, go to your project’s settings by clicking the gear icon next to your project.
1. In the **Permissions** section, click on **API Permissions**.
1. プロジェクト API トークンを削除するには、**[[Remove (削除する)]** 列の [X] をクリックします。 確認ウィンドウが表示されたら、**[Remove (削除する)]** ボタンをクリックします。
1. Click the **Create Token** button.
1. Choose the same scope used for the old token from the dropdown menu.
1. In the **Token Label** field, type a label for the token. It can be the same name given to the old token.
1. Click the **Add Token** button.

## 次のステップ
{: #next-steps }

Some possible usecases for an API token might be:

  - プロジェクトの README などの外部ページに[ビルド ステータス バッジを埋め込む]({{ site.baseurl }}/ja/2.0/status-badges/)
  - [Trigger Conditional Jobs]({{ site.baseurl }}/2.0/api-job-trigger/).
  - [Download a build's artifacts]({{ site.baseurl }}/2.0/artifacts/#downloading-all-artifacts-for-a-build-on-circleci) for safekeeping.
  - ビルドに[環境変数を挿入する]({{ site.baseurl }}/ja/2.0/env-vars/#api-を使用した環境変数の挿入)
