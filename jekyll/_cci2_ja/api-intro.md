---
layout: classic-docs
title: "API リファレンス"
short-title: "API リファレンス"
description: "CircleCI API の概要"
categories:
  - はじめよう
order: 1
version:
  - Cloud
  - Server v3.x
  - Server v2.x
---

CircleCI API を使用すると、ユーザー、ジョブ、ワークフロー、パイプラインに関する詳細情報を取得する API を呼び出すことができます。 現在、以下の 2 つのバージョンの API がサポートされています。

* [API v1.1](https://circleci.com/docs/api/v1/)
* [API v2](https://circleci.com/docs/api/v2/)

API v2 には、API v1.1 にはない強力な機能が備わっています (パイプラインやパイプライン パラメーターのサポートなど)。 できるだけ早くスクリプトを API v2 の安定したエンドポイントに移行することをお勧めします。

正式にサポートされ一般提供されているのは CircleCI API v1.1 と API v2 の一部です。 CircleCI は、安定していることが宣言されている API v2 のエンドポイントが増えてきたため、最終的には API v1.1 のサポートを終了し、完全に API v2 に切り替えたいと考えています。 CircleCI API v1.1 の廃止時期についての詳細は、後日お知らせします。

## API v2 の概要
{: #introduction-to-api-v2 }

CircleCI API v2 では、API エクスペリエンスを向上させる新しい機能を備えたエンドポイントを使用できるほか、ジョブでの API の使用を最適化することができます。 API v2 は現在も活発に開発が進められているため、API の安定性は「混在」した状態とされています。

現在の API v2 の各エンドポイントは、以下のカテゴリに分けられます。

- 認証
- パイプライン
- ワークフロー
- ユーザー
- プロジェクト (プレビュー)
- ジョブ
- インサイト

**注:** CircleCI API v2 の一部は現在も "プレビュー中" です。 プレビューのエンドポイントは、まだ完全にはサポートされておらず、一般提供のレベルにありません。 API v2 のプレビュー エンドポイントの大きな変更は前もって計画され、[API v2 の重大変更ログ](https://github.com/CircleCI-Public/api-preview-docs/blob/master/docs/breaking.md)で発表されます。

現在 API v2 でサポートされているのは [パーソナル API トークン]({{site.baseurl}}/ja/managing-api-tokens/#creating-a-personal-api-token) のみです。 [プロジェクトトークン]({{site.baseurl}}/ja/managing-api-tokens/#creating-a-project-api-token) は、現在 API v2 ではサポートされていません。
{: class="alert alert-info"}

## API v2 の利用開始
{: #getting-started-with-the-api-v2 }

CircleCI API v2 は、リポジトリ名でプロジェクトを識別する方法で、以前のバージョンの API との下位互換性を備えています。 たとえば、CircleCI から GitHub リポジトリ (https://github.com/CircleCI-Public/circleci-cli) についての情報を取得する場合、CircleCI API ではそのリポジトリを `gh/CircleCI-Public/circleci-cli` と表現します。これは、プロジェクトのタイプ、組織の名前、リポジトリの名前から成り、「トリプレット」と呼ばれます。 プロジェクトのタイプとしては、`github` または `bitbucket`、短縮形の `gh` または `bb` が使用できます。この短縮形は API v2 でサポートされるようになりました。 組織は、お使いのバージョン管理システムにおけるユーザー名または組織名です。

API v2 では、`project_slug` というトリプレットの文字列表現が導入されており、このプロジェクト スラッグは次のような形式をとります。

`<プロジェクト タイプ>/<組織名>/<リポジトリ名>`

`project_slug` は、プロジェクトに関する情報を取得する際や、ID でパイプラインやワークフローを検索する際に、ペイロードに含めます。 `project_slug` が、プロジェクトについての情報を得る手段となります。 将来的には、`project_slug` の形式が変更になる可能性もありますが、いかなる場合でも、プロジェクトの識別子として人が判読できる形式が用いられるはずです。

### 認証
{: #authentication }

CircleCI API v2 では、[パーソナル API トークン]({{site.baseurl}}/managing-api-tokens/#creating-a-personal-api-token)を HTTP リクエストのユーザー名として送信するだけで、ユーザーの認証が可能です。 たとえば、シェルの環境で `CIRCLECI_TOKEN` を設定している場合は、以下のように `curl` コマンドでそのトークンを指定します。

`curl -u ${CIRCLECI_TOKEN}: https://circleci.com/api/v2/me`

**注:** パスワードがないことを示すために `:` が記述されています。

#### パラメーターを使用したパイプラインのトリガーの例
{: #triggering-a-pipeline-with-parameters-example }

以下は、パラメーターを使用したパイプラインを `curl` でトリガーする例です。

```
curl -u ${CIRCLECI_TOKEN}: -X POST --header "Content-Type: application/json" -d '{
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

API v2 のすべてのエンドポイントは、[API v2 リファレンス ガイド](https://circleci.com/docs/api/v2/)をご覧ください。このガイドには、各エンドポイントの詳細な説明、必須および任意のパラメーターの情報、HTTP ステータスとエラー コード、ワークフローで使用する場合のコード例が掲載されています。

### 新しいエンドポイント
{: #new-endpoints }

最新の v2 バージョンの CircleCI API に追加された新しいエンドポイントは以下の表のとおりです。

| エンドポイント                                                               | 説明                                              |
| --------------------------------------------------------------------- | ----------------------------------------------- |
| `GET /workflow/:id`                                                   | リクエスト内で渡されるパラメーター `id` に基づいて、個々のワークフローが返されます。   |
| `GET /workflow/:id/jobs`                                              | 固有の `id` に基づいて、特定のワークフローに関連付けられているジョブをすべて取得します。 |
| `GET /project/:project_slug`                                          | 固有のスラッグに基づいて、特定のプロジェクトを取得します。                   |
| `POST /project/:project_slug/pipeline`                                | 指定したプロジェクトに対して新規パイプラインをトリガーします。                 |
| `GET /pipeline/:id`                                                   | リクエスト内で渡す `id` に基づいて、個々のパイプラインを取得します。           |
| `GET /pipeline/:id/config`                                            | 特定のパイプラインの設定ファイルを取得します。                         |
| `GET /project/:project_slug/pipelines/[:filter]`                      | 特定のプロジェクトの最新のパイプライン セットを取得します。                  |
| `GET /insights/:project-slug/workflows`                               | 個々のプロジェクトのワークフローに関するサマリーメトリクスを取得します。            |
| `GET /insights/:project-slug/workflows/:workflow-name`                | ワークフローの最近の実行結果を取得します。                           |
| `GET /insights/:project-slug/workflows/:workflow-name/jobs`           | プロジェクト ワークフローのジョブに関するサマリーメトリクスを取得します。           |
| `GET /insights/:project-slug/workflows/:workflow-name/jobs/:job-name` | ワークフロー内のジョブの最近の実行結果を取得します。                      |

### 非推奨のエンドポイント
{: #deprecated-endpoints }
{:.no_toc}

最新の API v2 リリースでサポートされなくなったエンドポイントは以下の表のとおりです。

| エンドポイント                                             | 説明                        |
| --------------------------------------------------- | ------------------------- |
| `POST /project/:vcs-type/:username/:project`        | 新規ビルドをトリガーします。            |
| `POST /project/:vcs-type/:username/:project/build
` | 指定したプロジェクトで新規ビルドをトリガーします。 |
| `GET /recent-builds`                                | 最近のビルドの配列を取得します。          |

## API v2 および CircleCI Server をご利用のお客様
{: #api-v2-and-server-customers }

API v2 は、CircleCI Server 2.x. ではサポートされていません。 CircleCI Server 3.x. のセルフホスティング環境ではサポートされています。

## データインサイト
{: #data-insights }

CircleCI API v2 では、特定のエンドポイントセットを呼び出して、ジョブやワークフローに関する詳細なインサイトやデータを取得することができます。 この情報により、ジョブやワークフローのパフォーマンスをより良く理解することができ、また、ワークフローやビルドを最適化するためのデータポイントを提供します。 API v2 のすべてのエンドポイントは、[API v2 リファレンス ガイド](https://circleci.com/docs/api/v2/)をご覧ください。 以下は、インサイトのエンドポイントの例です。

- `GET /{vcs_slug}/{org_name}/projects/{project_name}`
- `GET /{vcs_slug}/{org_name}/projects/{project_name}/workflows`
- `GET /{vcs_slug}/{org_name}/projects/{project_name}/workflows/{workflow_name}/jobs`
