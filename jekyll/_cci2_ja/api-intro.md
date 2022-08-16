---
layout: classic-docs
title: "API v2 の概要"
short-title: "API v2 の概要"
description: "CircleCI API の概要"
categories:
  - はじめよう
order: 1
version:
  - Cloud
  - Server v4.x
  - Server v3.x
  - Server v2.x
---

CircleCI API を使用すると、ユーザー、ジョブ、ワークフロー、パイプラインに関する詳細情報を取得する API を呼び出すことができます。 現在、以下の 2 つのバージョンの API がサポートされています。

* [API v1.1]({{site.baseurl}}/api/v1/)
* [API v2]({{site.baseurl}}/api/v2/)

API v2 には、パイプラインやパイプラインパラメーターのサポートなど、API v1.1 にはない強力な機能が備わっています。 クラウド版 CircleCI をご利用のお客様はできるだけ早くスクリプトを API v2 の安定したエンドポイントに移行することをお勧めします。

API v1.1 と API v2 は正式にサポートされ、一般提供されています。 CircleCI では、最終的には API v1.1 のサポートを終了し、API v2 に切り替えたいと考えています。 CircleCI API v1.1 の廃止時期についての詳細は、今後お知らせします。

## 概要
{: #overview }

CircleCI API v2 では、API エクスペリエンスを向上させる新しい機能を備えたエンドポイントを使用できるほか、ジョブでの API の使用を最適化することができます。

現在の API v2 の各エンドポイントは、以下のカテゴリに分けられます。

{% include snippets/ja/api-v2-endpoints.md %}

現在 API v2 でサポートされているのは [パーソナル API トークン]({{site.baseurl}}/ja/managing-api-tokens/#creating-a-personal-api-token) のみです。 [プロジェクトトークン]({{site.baseurl}}/ja/managing-api-tokens/#creating-a-project-api-token) は、現在 API v2 ではサポートされていません。
{: class="alert alert-info"}

## API v2 の利用開始
{: #getting-started-with-the-api-v2 }

CircleCI API v2 は、リポジトリ名でプロジェクトを識別する方法で、以前のバージョンの API との下位互換性を備えています。 たとえば、CircleCI から GitHub リポジトリ (https://github.com/CircleCI-Public/circleci-cli) についての情報を取得する場合、CircleCI API ではそのリポジトリを `gh/CircleCI-Public/circleci-cli` と表現します。これは、プロジェクトのタイプ、組織の名前、リポジトリの名前から成り、「トリプレット」と呼ばれます。 プロジェクトのタイプとしては、`github` または `bitbucket`、短縮形の `gh` または `bb` が使用できます。この短縮形は API v2 でサポートされるようになりました。 組織は、お使いのバージョン管理システムにおけるユーザー名または組織名です。

API v2 では、`project_slug` というトリプレットの文字列表現が導入されており、このプロジェクト スラッグは次のような形式をとります。

`<プロジェクト タイプ>/<組織名>/<リポジトリ名>`

`project_slug` は、プロジェクトに関する情報を取得する際や、ID でパイプラインやワークフローを検索する際に、ペイロードに含めます。 `project_slug` が、プロジェクトについての情報を得る手段となります。 将来的には、`project_slug` の形式が変更になる可能性もありますが、いかなる場合でも、プロジェクトの識別子として人が判読できる形式が用いられるはずです。

## 認証
{: #authentication }

CircleCI API v2 では、[パーソナル API トークン]({{site.baseurl}}/ja/managing-api-tokens/#creating-a-personal-api-token)を HTTP リクエストのユーザー名として送信するだけで、ユーザーの認証が可能です。 たとえば、シェルの環境で `CIRCLE_TOKEN` を設定している場合は、以下のように `curl` コマンドでそのトークンを指定します。

```shell
curl -u ${CIRCLE_TOKEN}: https://circleci.com/api/v2/me
```

**注:** パスワードがないことを示すために `:` が記述されています。

#### パラメーターを使用したパイプラインのトリガーの例
{: #triggering-a-pipeline-with-parameters-example }

以下は、パラメーターを使用したパイプラインを `curl` でトリガーする例です。

```shell
curl -u ${CIRCLE_TOKEN}: -X POST --header "Content-Type: application/json" -d '{
  "parameters": {
    "myparam": "./myspecialdir",
    "myspecialversion": "4.8.2"
  }
}' https://circleci.com/api/v2/project/{project_slug}/pipeline
```

上記の例では、`project_slug` の形式は `:vcs/:org/:project` になります。 たとえば、プロジェクト スラッグが `gh/CircleCI-Public/circleci-cli` とすると、`CircleCI` に対して、GitHub の組織「CircleCI-Public」のリポジトリ「`circleci-cli`」にあるプロジェクトを使用するよう指示します。

**重要:** パイプライン パラメーターは機密データとしては**扱われない**ため、機密の値 (シークレット) には**使用しないでください**。 機密データの正しい使い方については、[プロジェクト設定]({{site.baseurl}}/ja/settings/)や[コンテキスト]({{site.baseurl}}/ja/glossary/#context)の説明を参照してください。

## エンドポイントの変更
{: #changes-in-endpoints }

CircleCI API v2 リリースで追加されたエンドポイントもあれば、サポートされなくなったエンドポイントもあります。 以降のセクションに、このリリースで追加されたエンドポイントとサポートされなくなったエンドポイントをまとめています。

API v2 のすべてのエンドポイントは、[API v2 リファレンス ガイド]({{site.baseurl}}/api/v2/)をご覧ください。このガイドには、各エンドポイントの詳細な説明、必須および任意のパラメーターの情報、HTTP ステータスとエラー コード、ワークフローで使用する場合のコード例が掲載されています。

### 新しいエンドポイント
{: #new-endpoints }

API v2 は現在、CircleCI Server のセルフホスティング環境ではサポートされていません。

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

最新の API v2 リリースでサポートされなくなったエンドポイントは以下の表のとおりです。

| エンドポイント                                             | 説明                                               |
| --------------------------------------------------- | ------------------------------------------------ |
| `POST /project/:vcs-type/:username/:project`        | 新規ビルドをトリガーします。                                   |
| `POST /project/:vcs-type/:username/:project/build
` | このエンドポイントにより、ユーザーはプロジェクトごとに新規ビルドをトリガーできるようになります。 |
| `GET /recent-builds`                                | 最近のビルドの配列を取得します。                                 |

## API v2 および CircleCI Server をご利用のお客様
{: #api-v2-and-server-customers }

API v2 は、CircleCI Server 2.x. ではサポートされていません。 CircleCI Server 3.x. のセルフホスティング環境ではサポートされています。

## データインサイト
{: #data-insights }

CircleCI API v2 では、特定のエンドポイントセットを呼び出し、ジョブやワークフローに関する詳細な [インサイト]({{site.baseurl}}/insights) やデータを取得できます。 これらの情報により、ジョブやワークフローのパフォーマンスを詳しく理解でき、また、ワークフローやビルドを最適化するためのデータポイントを提供します。 以下は、インサイトのエンドポイントの例です。

- `GET /{vcs_slug}/{org_name}/projects/{project_name}`
- `GET /{vcs_slug}/{org_name}/projects/{project_name}/workflows`
- `GET /{vcs_slug}/{org_name}/projects/{project_name}/workflows/{workflow_name}/jobs`

## 次のステップ

- 認証に関する詳細や API リクエストの例については、[API 開発者向けガイド]({{site.baseurl}}/ja/api-developers-guide) を参照してください。
