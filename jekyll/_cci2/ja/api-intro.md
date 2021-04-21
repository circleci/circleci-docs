---
layout: classic-docs
title: "API リファレンス"
short-title: "API リファレンス"
description: "CircleCI API の概要"
categories:
  - getting-started
order: 1
version:
  - Cloud
---

CircleCI API を使用すると、ユーザー、ジョブ、ワークフロー、パイプラインに関する詳細情報を取得する API を呼び出すことができます。 現在、以下の 2 つのバージョンの API がサポートされています。

* [API v1.1](https://circleci.com/docs/api/v1/)
* [API v2](https://circleci.com/docs/api/v2/)

API v2 includes several powerful features (e.g. support for pipelines and pipeline parameters) that are unavailable in API v1.1. It is recommended that CircleCI Cloud users migrate their scripts to API v2 stable endpoints as soon as possible.

正式にサポートされ一般提供されているのは CircleCI API v1.1 と API v2 の一部です。 CircleCI は、安定していることが宣言されている API v2 のエンドポイントが増えてきたため、最終的には API v1.1 のサポートを終了し、完全に API v2 に切り替えたいと考えています。 CircleCI API v1.1 の廃止時期についての詳細は、後日お知らせします。

## API v2 の概要

CircleCI API v2 では、API エクスペリエンスを向上させる新しい機能を備えたエンドポイントを使用できるほか、ジョブでの API の使用を最適化することができます。 API v2 は現在も活発に開発が進められているため、API の安定性は「混在」した状態とされています。

現在の API v2 の各エンドポイントは、以下のカテゴリに分けられます。

- 認証
- パイプライン
- ワークフロー
- User
- Project
- ジョブ (プレビュー)
- Insights

**メモ:** CircleCI API v2 の一部は現在もプレビュー中です。 プレビューのエンドポイントは、まだ完全にはサポートされておらず、一般提供のレベルにありません。 API v2 のプレビュー エンドポイントの大きな変更は前もって計画され、[API v2 の重大変更ログ](https://github.com/CircleCI-Public/api-preview-docs/blob/master/docs/breaking.md)で発表されます。

## Getting started with the API v2

CircleCI API v2 は、リポジトリ名でプロジェクトを識別する方法で、以前のバージョンの API との下位互換性を備えています。 たとえば、CircleCI から GitHub リポジトリ (https://github.com/CircleCI-Public/circleci-cli) についての情報を取得する場合、CircleCI API ではそのリポジトリを `gh/CircleCI-Public/circleci-cli` と表現します。これは、プロジェクトのタイプ、組織の名前、リポジトリの名前から成り、「トリプレット」と呼ばれます。 プロジェクトのタイプとしては、`github` または `bitbucket`、短縮形の `gh` または `bb` が使用できます。この短縮形は API v2 でサポートされるようになりました。 組織は、お使いのバージョン管理システムにおけるユーザー名または組織名です。

API v2 では、`project_slug` というトリプレットの文字列表現が導入されており、このプロジェクト スラッグは次のような形式をとります。

`<プロジェクト タイプ>/<組織名>/<リポジトリ名>`

`project_slug` は、プロジェクトに関する情報を取得する際や、ID でパイプラインやワークフローを検索する際に、ペイロードに含めます。 `project_slug` が、プロジェクトについての情報を得る手段となります。 将来的には、`project_slug` の形式が変更になる可能性もありますが、いかなる場合でも、プロジェクトの識別子として人が判読できる形式が用いられるはずです。

### 認証

CircleCI API v2 では、API トークンを HTTP リクエストのユーザー名として送信するだけで、ユーザーの認証が可能です。 たとえば、シェルの環境で `CIRCLECI_TOKEN` を設定している場合は、以下のように `curl` コマンドでそのトークンを指定します。

`curl -u ${CIRCLECI_TOKEN}: https://circleci.com/api/v2/me`

**Note**, the `:` is included to indicate there is no password. **Note**, [Project tokens](https://circleci.com/docs/2.0/managing-api-tokens/#creating-a-project-api-token) are currently not supported on API v2.

#### Triggering a pipeline with parameters example

Here is a simple example using `curl` to trigger a pipeline with parameters:

```
curl -u ${CIRCLECI_TOKEN}: -X POST --header "Content-Type: application/json" -d '{
  "parameters": {
    "myparam": "./myspecialdir",
    "myspecialversion": "4.8.2"
  }
}' https://circleci.com/api/v2/project/{project_slug}/pipeline
```

In the above example the `project_slug` would take the form `:vcs/:org/:project`. For example, the project slug `gh/CircleCI-Public/circleci-cli` tells `CircleCI` to use the project found in the GitHub organization CircleCI-Public in the repository named `circleci-cli`.

**IMPORTANT** Pipeline parameters are **not** treated as sensitive data and **must not** be used for sensitive values (secrets). You can find information on using sensitive data correctly in the [Project Settings](https://circleci.com/docs/2.0/settings/) and [Contexts](https://circleci.com/docs/2.0/glossary/#context) guides.

## Changes in endpoints

The CircleCI API v2 release includes several new endpoints, and deprecates some others. The sections below list the endpoints added for this release, in addition to the endpoints that have been removed.

For a complete list of all API v2 endpoints, please refer to the [API v2 Reference Guide](https://circleci.com/docs/api/v2/), which contains a detailed description of each individual endpoint, as well as information on required and optional parameters, HTTP status and error codes, and code samples you may use in your workflows.

### New endpoints

The table below describes the new endpoints that have been added to the CircleCI API for this updated v2 version.

| エンドポイント                                                               | 説明                                                                                          |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `GET /workflow/:id`                                                   | リクエスト内で渡されるパラメーター `id` に基づいて、個別のワークフローが返されます。                                               |
| `GET /workflow/:id/job`                                               | 固有の `id` に基づいて、特定のワークフローに関連付けられているジョブをすべて取得します。                                             |
| `GET /project/:project_slug`                                          | 固有のスラッグに基づいて、特定のプロジェクトを取得します。                                                               |
| `POST /project/:project_slug/pipeline`                                | 指定したプロジェクトに対して新規パイプラインをトリガーします。                                                             |
| `GET /pipeline/:id`                                                   | リクエスト内で渡す `id` に基づいて、個別のパイプラインを取得します。                                                       |
| `GET /pipeline/:id/config`                                            | 特定のパイプラインの設定ファイルを取得します。                                                                     |
| `GET /project/:project_slug/pipelines/[:filter]`                      | 特定のプロジェクトの最新のパイプライン セットを取得します。                                                              |
| `GET /insights/:project-slug/workflows`                               | This endpoint enables you to retrieve summary metrics for an individual project's workflow. |
| `GET /insights/:project-slug/workflows/:workflow-name`                | This endpoint enables you to retrieve recent runs for a workflow.                           |
| `GET /insights/:project-slug/workflows/:workflow-name/jobs`           | This endpoint enables you to retrieve summary metrics for a project workflow's jobs.        |
| `GET /insights/:project-slug/workflows/:workflow-name/jobs/:job-name` | This endpoint enables you to retrieve recent runs of a job within a workflow.               |

### Deprecated endpoints
{:.no_toc}

For this updated API v2 release, several endpoints have been deprecated, which are listed in the table below.

| エンドポイント                                                    | 説明                             |
| ---------------------------------------------------------- | ------------------------------ |
| `POST /project/:vcs-type/:username/:project`               | 新規ビルドをトリガーします。                 |
| `POST /project/:vcs-type/:username/:project/build`         | 指定したプロジェクトで新規ビルドをトリガーします。      |
| `DELETE /project/:vcs-type/:username/:project/build-cache` | 特定のプロジェクトのプロジェクト キャッシュをクリアします。 |
| `GET /recent-builds`                                       | 最近のビルドのサマリーを配列で取得します。          |

## API v2 and server customers

API v2 is not currently supported for self-hosted installations of CircleCI Server.

## Data insights

The CircleCI API v2 enables you to call a specific set of endpoints to retrieve detailed insights and data about your jobs and workflows. This information can be very useful in better understanding how your jobs and workflows are performing while also providing you with data points that you can use to optimize your workflows and builds. A detailed [API Reference Guide](https://circleci.com/docs/api/v2/#section=reference) for these API endpoints has been provided in the documentation. Some examples of insights endpoints include:

- `GET /{vcs_slug}/{org_name}/projects/{project_name}`
- `GET /{vcs_slug}/{org_name}/projects/{project_name}/workflows`
- `GET /{vcs_slug}/{org_name}/projects/{project_name}/workflows/{workflow_name}/jobs`
