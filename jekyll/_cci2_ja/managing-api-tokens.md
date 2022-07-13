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

CircleCI の API を使用したり、パイプラインの詳細を確認したりするには、適切なアクセス許可を持つ API トークンが必要です。 ここでは、利用可能な API トークンの種類と、トークンを作成および削除する方法について説明します。

## 概要
{: #overview }

CircleCI では 2 種類の API トークンを作成できます。

  1. **パーソナル:** このトークンは CircleCI API とのやり取りに使用され、すべての情報の読み取りと書き込みに対するアクセス権を付与します。
  2. **プロジェクト**: このトークンは特定のプロジェクトに関する情報の読み取りと書き取りに対するアクセス権を付与します。 プロジェクト トークンには、*ステータス*、*読み取り専用*、*すべて*、の 3 つの権限範囲のオプションがあります。
    - *ステータス* トークン: プロジェクトのビルド ステータスの読み取りに対するアクセス権を付与します。 Useful for [embedding status badges]({{ site.baseurl }}/status-badges/).
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

  1. CircleCI アプリケーションで、プロジェクトの設定に移動します。 移動にはいくつかの方法があります。 1 つの方法として、サイドバーから **Projects (プロジェクト)** を選択し、 プロジェクトの横の省略記号(`...`)を選択し、**Project Settings (プロジェクト設定)** を選択します。
  2. **API Permissions (API のアクセス権)**を選択します。
  3. **[Add API Token (API トークンを追加する)]** ボタンをクリックします。
  4. ドロップダウン メニューから権限の範囲を選択します。 権限については、ページ上部の [概要](#overview)セクションで説明しています。
  5. **Label (ラベル)**フィールドに、覚えやすいラベルを入力します。
  6. **[Add API Token (API トークンを追加する)]** ボタンをクリックします。

プロジェクト API トークンを削除するには、**[Remove (削除する)]** 列の [X] をクリックします。 確認ウィンドウが表示されたら、フォームに `DELETE` と入力し、 **Delete API Token (API トークンを削除する)** ボタンをクリックします。


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
1. **Token name (トークン名)** フィールドに、ローテーションする古いトークンの新しい名前を入力します。 古いトークンと同じ名前でもかまいません。
1. **[Add API Token (API トークンを追加する)]** ボタンをクリックします。
1. トークンが表示されたら、別の場所にコピー & ペーストします。 トークンを再度表示することはできません。

#### プロジェクト API トークンのローテーション
{: #rotating-a-project-api-token }

1. CircleCI アプリケーションで、プロジェクトの設定に移動します。 移動にはいくつかの方法があります。 1 つの方法として、サイドバーから **Projects (プロジェクト)** を選択し、 プロジェクトの横の省略記号(`...`)を選択し、**Project Settings (プロジェクト設定)** を選択します。
1. **API Permissions (API のアクセス権)**を選択します。
1. 入れ替えたいトークンの**[[Remove (削除する)]** 列の X をクリックします。 確認ウィンドウが表示されたら、フォームに `DELETE` と入力し、 **Delete API Token (API トークンを削除する)** ボタンをクリックします。
1. **Create API Token (API トークンを作成する)** ボタンをクリックします。
1. 古いトークンに使用したのと同じ範囲を、ドロップダウンメニューから選択します。
1. **Label (ラベル)**フィールドに、トークンのラベルを入力します。 古いトークンと同じ名前でもかまいません。
1. **[Add API Token (API トークンを追加する)]** ボタンをクリックします。

## 次のステップ
{: #next-steps }

APIトークンの使用例としては、以下のようなものが考えられます。

  - [Embed Build Status Badges]({{ site.baseurl }}/status-badges/) in your project's README or other external page.
  - [Download a build's artifacts]({{ site.baseurl }}/artifacts/#downloading-all-artifacts-for-a-build-on-circleci) for safekeeping.
  - [Inject environment variables]({{ site.baseurl }}/env-vars/#injecting-environment-variables-with-api-v2) into a build.
