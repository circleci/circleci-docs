---
layout: classic-docs
title: "API v2 の概要"
short-title: "API v2 の概要"
description: "CircleCI API の概要"
categories:
  - はじめよう
order: 1
contentTags:
  platform:
    - クラウド
    - Server v4.x
    - Server v3.x
    - Server v2.x
---

CircleCI API を使用すると、ユーザー、ジョブ、ワークフロー、パイプラインに関する詳細情報を取得する API を呼び出すことができます。 現在、以下の 2 つのバージョンの API がサポートされています。

* [API v1.1](https://circleci.com/docs/api/v1/)
* [API v2](https://circleci.com/docs/api/v2/)

API v2 には、パイプラインやパイプラインパラメーターのサポートなど、API v1.1 にはない強力な機能が備わっています。 クラウド版 CircleCI をご利用のお客様は、できるだけ早くスクリプトを API v2 の安定したエンドポイントに移行することをお勧めします。

API v1.1 と API v2 は正式にサポートされ、一般公開されています。 CircleCI では、最終的には API v1.1 のサポートを終了し、API v2 に切り替える予定です。 CircleCI API v1.1 の廃止時期については、後日お知らせします。

## 概要
{: #overview }

CircleCI API v2 では、API エクスペリエンスを向上させる新しい機能を備えたエンドポイントを使用できるほか、ジョブでの API の使用を最適化することができます。

現在の API v2 の各エンドポイントは、以下のカテゴリに分けられます。

{% include snippets/ja/api-v2-endpoints.md %}

現在 API v2 でサポートされているのは [パーソナル API トークン]({{site.baseurl}}/ja/managing-api-tokens/#creating-a-personal-api-token) のみです。 [プロジェクトトークン]({{site.baseurl}}/ja/managing-api-tokens/#creating-a-project-api-token) は、現在 API v2 ではサポートされていません。
{: class="alert alert-info"}

## API v2 の入門ガイド
{: #getting-started-with-the-api-v2 }

CircleCI API v2 は、リポジトリ名でプロジェクトを識別する方法で、以前のバージョンの API との下位互換性を備えています。 たとえば、CircleCI から GitHub リポジトリ (https://github.com/CircleCI-Public/circleci-cli) についての情報を取得する場合、CircleCI API ではそのリポジトリを `gh/CircleCI-Public/circleci-cli` と表現します。これは、プロジェクトのタイプ、組織の名前、リポジトリの名前から成り、「トリプレット」と呼ばれます。 プロジェクトのタイプとしては、`github` または `bitbucket`、短縮形の `gh` または `bb` が使用できます。この短縮形は API v2 でサポートされるようになりました。 組織は、お使いのバージョン管理システムにおけるユーザー名または組織名です。

API v2 では、`project_slug` というトリプレットの文字列表現が導入されており、このプロジェクトスラッグは次のような形式をとります。

`<プロジェクト タイプ>/<組織名>/<リポジトリ名>`

`project_slug` は、プロジェクトに関する情報を取得する際や、ID でパイプラインやワークフローを検索する際に、ペイロードに含めます。 すると、`project_slug` によりプロジェクトについての情報を得ることができます。 将来的には、`project_slug` の形式が変更になる可能性もありますが、いかなる場合でも、プロジェクトの識別子として人が判読できる形式が用いられるはずです。

## 認証
{: #authentication }

**パブリックリポジトリの場合**、CircleCI API v2 を使って[パーソナル API トークン]({{site.baseurl}}/ja/managing-api-tokens/#creating-a-personal-api-token)を HTTP リクエストのユーザー名として送信することにより、ユーザーを認証できます。 たとえば、シェルの環境で `CIRCLE_TOKEN` を設定している場合は、このトークンを `curl` コマンドで以下のように指定します。

```shell
curl -u ${CIRCLE_TOKEN}: https://circleci.com/api/v2/me
```

パスワードがないことを示すために` : `が記述されています。

**プライベートリポジトリの場合**、 API トークンをリクエスト内の HTTP ヘッダーとして `Circle-Token` という名前でトークンをその値として送信する必要があります。 コード例については、[開発者向けガイド]({{site.baseurl}}/api-developers-guide)をご覧ください。

#### パラメーターを使用したパイプラインのトリガーの例
{: #triggering-a-pipeline-with-parameters-example }

以下は、パラメーターを使用したパイプラインを `curl` でトリガーするシンプルなコード例です。

```shell
curl -u ${CIRCLE_TOKEN}: -X POST --header "Content-Type: application/json" -d '{
  "parameters": {
    "myparam": "./myspecialdir",
    "myspecialversion": "4.8.2"
  }
}' https://circleci.com/api/v2/project/{project_slug}/pipeline
```

上記の例では、`project_slug` の形式は `:vcs/:org/:project` になります。 たとえば、プロジェクトスラッグ `gh/CircleCI-Public/circleci-cli` が、`CircleCI` に対して `circleci-cli` というリポジトリの GitHub 組織「CircleCI-Public」のプロジェクトを使用するよう指示します。

**重要:** パイプラインパラメーターは機密データとしては**扱われない**ため、機密の値 (シークレット) には**使用しないでください**。 機密データの正しい使い方については、[プロジェクト設定]({{site.baseurl}}/ja/settings/)や[コンテキスト]({{site.baseurl}}/ja/glossary/#context)に関するガイドを参照してください。

## エンドポイントの変更
{: #changes-in-endpoints }

今回のリリースでは、追加されたエンドポイントと廃止されたエンドポイントがあります。 下記セクションでは、このリリースで追加されたエンドポイントと削除されたエンドポイントをまとめています。

For a complete list of all API v2 endpoints, please refer to the [API v2 Reference Guide]({{site.baseurl}}/api/v2/), which contains a detailed description of each individual endpoint, as well as information on required and optional parameters, HTTP status and error codes, and code samples you may use in your workflows.

### 新しいエンドポイント
{: #new-endpoints }

The table below describes the new endpoints that have been added to the CircleCI API for this updated v2 version.

| エンドポイント                                                               | 説明                                              |
| --------------------------------------------------------------------- | ----------------------------------------------- |
| `GET /workflow/:id`                                                   | リクエスト内で渡されるパラメーター `id` に基づいて、個々のワークフローが返されます。   |
| `GET /workflow/:id/jobs`                                              | 一意の `id` に基づいて、特定のワークフローに関連付けられているジョブをすべて取得します。 |
| `GET /project/:project_slug`                                          | 一意のスラッグにより特定のプロジェクトを取得します。                      |
| `POST /project/:project_slug/pipeline`                                | 一意のスラッグにより個々のプロジェクトを取得します。                      |
| `GET /pipeline/:id`                                                   | リクエスト内で渡される `id` に基づいて、個々のパイプラインを取得します。         |
| `GET /pipeline/:id/config`                                            | 特定のパイプラインの設定を取得します。                             |
| `GET /project/:project_slug/pipelines/[:filter]`                      | プロジェクトの最新の一連のパイプラインを取得します。                      |
| `GET /insights/:project-slug/workflows`                               | 各プロジェクトのワークフローのサマリーメトリクスを取得します。                 |
| `GET /insights/:project-slug/workflows/:workflow-name`                | ワークフローの最近の実行を取得します。                             |
| `GET /insights/:project-slug/workflows/:workflow-name/jobs`           | プロジェクトのワークフローのジョブのサマリーメトリクスを取得します。              |
| `GET /insights/:project-slug/workflows/:workflow-name/jobs/:job-name` | ワークフローにおけるジョブの最近の実行を取得します。                      |

### 非推奨のエンドポイント
{: #deprecated-endpoints }

For this updated API v2 release, several endpoints have been deprecated, which are listed in the table below.

| エンドポイント                                            | 説明                                               |
| -------------------------------------------------- | ------------------------------------------------ |
| `POST /project/:vcs-type/:username/:project`       | 新規ビルドをトリガーします。                                   |
| `POST /project/:vcs-type/:username/:project/build` | このエンドポイントにより、ユーザーはプロジェクトごとに新規ビルドをトリガーできるようになります。 |
| `GET /recent-builds`                               | 最近のビルドの配列を取得します。                                 |

## API v2 および CircleCI Server をご利用のお客様
{: #api-v2-and-server-customers }

API v2 is not supported for installations of CircleCI server 2.x. API v2 is supported for self-hosted installations of CircleCI server 3.x.

## データインサイト
{: #data-insights }

The CircleCI API v2 enables you to call a specific set of endpoints to retrieve detailed [insights]({{site.baseurl}}/insights) and data about your jobs and workflows. This information can help you better understand how your jobs and workflows are performing while also providing you with data points that you can use to optimize your workflows and builds. Some examples of insights endpoints include:

- `GET /{vcs_slug}/{org_name}/projects/{project_name}`
- `GET /{vcs_slug}/{org_name}/projects/{project_name}/workflows`
- `GET /{vcs_slug}/{org_name}/projects/{project_name}/workflows/{workflow_name}/jobs`

## 次のステップ

- 認証に関する詳細や API リクエストの例については、[API 開発者向けガイド]({{site.baseurl}}/ja/api-developers-guide) を参照してください。
