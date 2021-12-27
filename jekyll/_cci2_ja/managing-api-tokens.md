---
layout: classic-docs
title: "API トークンの管理"
short-title: "API トークンの管理"
description: "CircleCI の API 使用に権限が指定されたトークンを割り当てる方法"
order: 20
version:
  - Cloud
  - Server v3.x
  - Server v2.x
---

To use the CircleCI API or view details about your pipelines, you will need API tokens with the appropriate permissions. This document describes the types of API tokens available, as well as how to create and delete them.

## 概要
{: #overview }

There are two types of API token you can create within CircleCI.

  1. **パーソナル:** このトークンは CircleCI API とのやり取りに使用され、すべての情報の読み取りと書き込みに対するアクセス権を付与します。
  2. **プロジェクト**: このトークンは特定のプロジェクトに関する情報の読み取りと書き取りに対するアクセス権を付与します。 プロジェクト トークンには、*ステータス*、*読み取り専用*、*すべて*、の 3 つの権限範囲のオプションがあります。
    - *ステータス* トークン: プロジェクトのビルド ステータスの読み取りに対するアクセス権を付与します。 [ステータス バッジを埋め込む]({{ site.baseurl }}/ja/2.0/status-badges/)際に便利です。
    - _読み取り専用_ トークンは、プロジェクトの API への読み取り専用のアクセス権を付与します。
    - _管理者_ トークンは、プロジェクトの API の読み取りおよび書き込みに対するアクセス権を付与します。

**注意:** API トークンは、一度作成すると修正できません。 既存のトークンを変更するには、いったん削除してから再作成する、「トークン ローテーション」を行う必要があります。

### パーソナル API トークンの作成
{: #creating-a-personal-api-token }

  1. CircleCI アプリケーションで、[ユーザー設定](https://app.circleci.com/settings/user){:rel="nofollow"}に移動します。
  2. [[Personal API Tokens (パーソナル API トークン)](https://app.circleci.com/settings/user/tokens)]{:rel="nofollow"} をクリックします。
  3. **[Create New Token (新しいトークンを作成する)]** ボタンをクリックします。
  4. **[Token name (トークン名)]** フィールドに、覚えやすいトークン名を入力します。
  5. **[Add API Token (API トークンを追加する)]** ボタンをクリックします。
  6. トークンが表示されたら、別の場所にコピー ＆ ペーストします。 トークンを再度表示することはできません。

パーソナル APIトークンを削除するには、 **Remove (削除)** の欄の X をクリックし、ダイアログウィンドウで 削除されたことを確認してください。

### プロジェクト API トークンの作成
{: #creating-a-project-api-token }

  1. CircleCI アプリケーションで、プロジェクトの設定に移動します。 There are various ways to get there. One way is to select **Projects** in the sidebar, then the ellipsis (`...`) next to your project and select **Project Settings**.
  2. Select **API Permissions**.
  3. **[Add API Token (API トークンを追加する)]** ボタンをクリックします。
  4. ドロップダウン メニューから権限の範囲を選択します。 These are described in the [Overview](#overview) section above.
  5. In the **Label** field, type a memorable label for the token.
  6. **[Add API Token (API トークンを追加する)]** ボタンをクリックします。

プロジェクト API トークンを削除するには、**[Remove (削除する)]** 列の [X] をクリックします。 When the confirmation window appears, enter the text `DELETE` in the form and click the **Delete API Token** button.


### パーソナル トークンとプロジェクト API トークンのローテーション
{: #rotating-personal-and-project-api-tokens }

API トークンのローテーションとは、古い API トークンを新しいトークンに置き換えることです。

API トークンは共有されたり、従業員やチームの間で回されたり、 不用意に公開されたりする可能性があるため、定期的に新しい APIトークンを再生成することをお勧めします。 多くの組織では、このプロセスを自動化しており、 の従業員が退職したときや、トークンが漏洩したと思われるときにスクリプトを実行しています。

#### パーソナル API トークンのローテーション
{: #rotating-a-personal-api-token }

1. CircleCI アプリケーションで、[ユーザー設定](https://app.circleci.com/settings/user)に移動します。
1. [パーソナル API トークン](https://app.circleci.com/settings/user/tokens)をクリックします。
1. パーソナル API トークンを削除するには、**[Remove (削除する)]** 列の [X] をクリックします。
1. **[Create New Token (新しいトークンを作成する)]** ボタンをクリックします。
1. In the **Token name** field, type a new name for the old token you are rotating. 古いトークンと同じ名前でもかまいません。
1. **[Add API Token (API トークンを追加する)]** ボタンをクリックします。
1. トークンが表示されたら、別の場所にコピー & ペーストします。 トークンを再度表示することはできません。

#### プロジェクト API トークンのローテーション
{: #rotating-a-project-api-token }

1. CircleCI アプリケーションで、プロジェクトの設定に移動します。 There are various ways to get there. One way is to select **Projects** in the sidebar, then the ellipsis (`...`) next to your project and select **Project Settings**.
1. Select **API Permissions**.
1. 入れ替えたいトークンの**[[Remove (削除する)]** 列の X をクリックします。 When the confirmation window appears, enter the text `DELETE` in the form and click the **Delete API Token** button.
1. Click the **Create API Token** button.
1. 古いトークンに使用したのと同じ範囲を、ドロップダウンメニューから選択します。
1. In the **Label** field, type a label for the token. 古いトークンと同じ名前でもかまいません。
1. **[Add API Token (API トークンを追加する)]** ボタンをクリックします。

## 次のステップ
{: #next-steps }

APIトークンの使用例としては、以下のようなものが考えられます。

  - プロジェクトの README などの外部ページに[ビルド ステータス バッジを埋め込む]({{ site.baseurl }}/ja/2.0/status-badges/)
  - [条件付きのジョブをトリガーする]({{ site.baseurl }}/2.0/api-job-trigger/)
  - [ビルドのアーティファクトをダウンロード]({{ site.baseurl }}/2.0/artifacts/#downloading-all-artifacts-for-a-build-on-circleci)して安全に保管する
  - ビルドに[環境変数を挿入する]({{ site.baseurl }}/ja/2.0/env-vars/#api-を使用した環境変数の挿入)
