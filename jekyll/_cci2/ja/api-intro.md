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
{: #introduction-to-api-v2 }

CircleCI API v2 enables you to use endpoints with several new features that improve the API experience, in addition to optimizing how you use the API for your jobs. API v2 is currently in active development, therefore, the stability of the API is referred to as "mixed".

The current categories of the API v2 endpoints are:

- 認証
- パイプライン
- ワークフロー
- User
- Project
- ジョブ (プレビュー)
- Insights

**Note:** Portions of the CircleCI API v2 remain under "Preview". Preview endpoints are not yet fully supported or considered generally available. Breaking changes to API v2 Preview endpoints are planned in advance and are announced in the [API v2 breaking changes log](https://github.com/CircleCI-Public/api-preview-docs/blob/master/docs/breaking.md).

## Getting started with the API v2
{: #getting-started-with-the-api-v2 }

The CircleCI API v2 is backwards-compatible with previous API versions in the way it identifies your projects using repository name. For instance, if you want to pull information from CircleCI about the GitHub repository https://github.com/CircleCI-Public/circleci-cli you can refer to that in the CircleCI API as `gh/CircleCI-Public/circleci-cli`, which is a "triplet" of the project type, the name of your "organization", and the name of the repository. For the project type you can use `github` or `bitbucket` as well as the shorter forms `gh` or `bb`, which are now supported in API v2. The `organization` is your username or organization name in your version control system.

With API v2, CircleCI is introducing a string representation of the triplet called the `project_slug`, which takes the following form:

`<project_type>/<org_name>/<repo_name>`

The `project_slug` is included in the payload when pulling information about a project as well as when looking up a pipeline or workflow by ID. The `project_slug` can then be used to get information about the project. It is possible in the future the shape of a `project_slug` may change, but in all cases it would be usable as a human-readable identifier for a given project.

### 認証
{: #authentication }

The CircleCI API v2 enables users to be authenticated by simply sending your API token as the username of the HTTP request. For example, if you have set `CIRCLECI_TOKEN` in your shell's environment, you could then use `curl` with that token like the example shown below:

`curl -u ${CIRCLECI_TOKEN}: https://circleci.com/api/v2/me`

**Note**, the `:` is included to indicate there is no password. **Note**, [Project tokens](https://circleci.com/docs/2.0/managing-api-tokens/#creating-a-project-api-token) are currently not supported on API v2.

#### Triggering a pipeline with parameters example
{: #triggering-a-pipeline-with-parameters-example }

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
{: #changes-in-endpoints }

The CircleCI API v2 release includes several new endpoints, and deprecates some others. The sections below list the endpoints added for this release, in addition to the endpoints that have been removed.

For a complete list of all API v2 endpoints, please refer to the [API v2 Reference Guide](https://circleci.com/docs/api/v2/), which contains a detailed description of each individual endpoint, as well as information on required and optional parameters, HTTP status and error codes, and code samples you may use in your workflows.

### New endpoints
{: #new-endpoints }

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
{: #deprecated-endpoints }
{:.no_toc}

For this updated API v2 release, several endpoints have been deprecated, which are listed in the table below.

| エンドポイント                                            | 説明                                                                 |
| -------------------------------------------------- | ------------------------------------------------------------------ |
| `POST /project/:vcs-type/:username/:project`       | 新規ビルドをトリガーします。                                                     |
| `POST /project/:vcs-type/:username/:project/build` | 指定したプロジェクトで新規ビルドをトリガーします。                                          |
| `GET /recent-builds`                               | This endpoint enabled users to retrieve an array of recent builds. |

## API v2 and server customers
{: #api-v2-and-server-customers }

API v2 is not supported for self-hosted installations of CircleCI Server 2.x. API v2 is supported for self-hosted installations of CircleCI Server 3.x.

## Data insights
{: #data-insights }

The CircleCI API v2 enables you to call a specific set of endpoints to retrieve detailed insights and data about your jobs and workflows. This information can be very useful in better understanding how your jobs and workflows are performing while also providing you with data points that you can use to optimize your workflows and builds. A detailed [API Reference Guide](https://circleci.com/docs/api/v2/#section=reference) for these API endpoints has been provided in the documentation. Some examples of insights endpoints include:

- `GET /{vcs_slug}/{org_name}/projects/{project_name}`
- `GET /{vcs_slug}/{org_name}/projects/{project_name}/workflows`
- `GET /{vcs_slug}/{org_name}/projects/{project_name}/workflows/{workflow_name}/jobs`
