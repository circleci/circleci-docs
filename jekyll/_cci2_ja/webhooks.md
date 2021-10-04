---
layout: classic-docs
title: "Webhook"
short-title: "Webhook を使って CircleCI のイベントを受け取る"
description: "Webhook を使って CircleCI のイベントを受け取る"
version:
  - Cloud
---

## Webhooks overview
{: #overview}

Webhookにより、お客様が管理しているプラットフォーム（ご自身で作成した API またはサードパーティのサービス）と今後の一連の_イベント_を連携することができます。

Setting up a webhook on CircleCI enables you to receive information (referred to as _events_) from CircleCI, as they happen. これにより、必要な情報を得るために API をポーリングしたり、 CircleCI の Web アプリケーションを手動でチェックする必要がなくなります。

ここでは、Webhook の設定方法および Webhook の送信先にどのような形でイベントが送信されるかを詳しく説明します。

**Note:** The webhooks feature on CircleCI is currently in preview; documentation and features may change or be added to.

## Use cases for webhooks
{: #use-cases}

Webhook は多くの目的にご活用いただけます。 Some possible use cases for webhooks might include:

- カスタム ダッシュボードを作成して、ワークフローやジョブのイベントの可視化または分析を行う。
- インシデント管理ツール（例：Pagerduty）にデータを送信する。
- Using tools like [Airtable]({{site.baseurl}}/2.0/webhooks-airtable) to capture data and visualize it.
- Sending events to communication apps, such as Slack.
- Alerting when a workflow is cancelled, then using the API to rerun the workflow.
- Triggering internal notification systems to alert people when workflows/jobs complete.
- Building your own automation plugins and tools.

## Communication protocol with webhooks
{: #communication-protocol }

CircleCI では、現在以下のイベントの Webhook を利用できます。

A webhook is sent using an HTTP POST to the URL that was registered when the webhook was created, with a body encoded using JSON.

CircleCI は、Webhook に応答したサーバーが 2xx のレスポンス コードを返すことを想定しています。 2xx 以外のレスポンスを受信した場合、CircleCI は、後ほど再試行します。 If CircleCI does not receive a response to the webhook within a short period of time, CircleCI will assume that delivery has failed, and will retry at a later time. タイムアウト時間は現在5秒ですが、プレビュー期間中に変更される場合があります。 再試行ポリシーの正確な詳細は現在文書化されておらず、プレビュー期間中に変更される場合があります。 タイムアウトや再試行についてフィードバックがあれば、 [サポートチームにご連絡ください](https://circleci.canny.io/webhooks)。

### Webhook headers
<sup>1</sup> こちらはテストの場合のみチェックボックスをオフのままにします。

Webhook には、以下のような多くの HTTP ヘッダーが設定されています。

| コミットのオーサー名         | 値                                                                             |
| ------------------ | ----------------------------------------------------------------------------- |
| 型                  | `application/json
`                                                           |
| User-Agent         | 送信者が CircleCI であることを示す文字列（`CircleCI-Webhook/1.0`）。 この値はプレビュー期間中に変更される場合があります。 |
| イベントタイプ            | The type of event, (`workflow-completed`, `job-completed`, etc)               |
| Circleci-Signature | この署名により Webhook の送信者にシークレット トークンへのアクセス権が付与されているかどうかを検証することができます。              |
{: class="table table-striped"}

## Setting up a webhook
{: #setting-up-a-hook}

Webhook はプロジェクトごとにセットアップされます。 方法は以下のとおりです。

1. CircleCI 上にセットアップしたプロジェクトにアクセスします。
1. **Project Settings** をクリックします。
1. Project Settings のサイドバーで、**Webhook** をクリックします。
1. **Add Webhook** をクリックします。
1. Fill out the webhook form (the table below describes the fields and their intent):
1. 受信用 API またはサードパーティのサービスがセットアップされている場合、**Test Ping Event** をクリックしてテストイベントをディスパッチします。

| フィールド                  | 必須？ | 説明                                                                                         |
| ---------------------- | --- | ------------------------------------------------------------------------------------------ |
| Webhook name           | ○   | Webhook 名                                                                                  |
| URL                    | ○   | The URL the webhook will make POST requests to                                             |
| Certificate Validation | ○   | Ensure the receiving host has a valid SSL certificate before sending an event <sup>1</sup> |
| Secret token           | ○   | Used by your API/platform to validate incoming data is from CircleCI                       |
| Select an event        | ○   | You must select at least one event that will trigger a webhook                             |
{: class="table table-striped"}

<sup>1</sup> こちらはテストの場合のみチェックボックスをオフのままにします。

**Note: There is a limit of 5 webhooks per project.**

## Webhook payload signature
{: #payload-signature}

受信する Webhook を検証して、 送信元が CircleCI であることを確認する必要があります。 これを行うために、Webhook を作成する際に、シークレット トークンをオプションで提供することができます。 お客様のサービスへの送信HTTPリクエストごとに、 `circleci-signature` ヘッダーが含まれます。 このヘッダーは、バージョン管理された署名のリストで構成され、カンマで区切られています。

```
POST /uri HTTP/1.1
Host: your-webhook-host
circleci-signature: v1=4fcc06915b43d8a49aff193441e9e18654e6a27c2c428b02e8fcc41ccc2299f9,v2=...,v3=...

```

現在、最新の（そして唯一の）署名バージョンは v1 です。 ダウングレード攻撃を防ぐために、最新の署名タイプを*必ず*確認する必要があります。

この v1 署名は、リクエストボディのHMAC-SHA256ダイジェストであり、 設定された署名シークレットをシークレット キーとして使用しています。

プロジェクトに関するデータ

| フィールド                          | 常に表示             | 説明                                                                 |
| ------------------------------ | ---------------- | ------------------------------------------------------------------ |
| `hello World`                  | `secret`         | `734cc62f32841568f45715aeb9f4d7891324e6d948e4c6c60c0621cdac48623a` |
| `lalala`                       | `another-secret` | `daa220016c8f29a8b214fbfc3671aeec2145cfb1e6790184ffb38b6d0425fa00` |
| `an-important-request-payload` | `hunter123`      | `9be2242094a9a8c00c64306f382a7f9d691de910b4a266f67bd314ef18ac49fa` |
{: class="table table-striped"}

以下は、Pythonで署名を検証する場合の例です。

```
import hmac

def verify_signature(secret, headers, body):
    # ヘッダー`circleci-signature` から v1 署名を取得します。
    signature_from_header = {
        k: v for k, v in [
            pair.split('=') for pair in headers['circleci-signature'].split(',')
        ]
    }['v1']

    # 設定した署名シークレットを使って リクエスト ボディーで HMAC-SHA256 を実行します。
    valid_signature = hmac.new(bytes(secret, 'utf-8'), bytes(body, 'utf-8'), 'sha256').hexdigest()

    # 一定時間文字列比較を使ってタイミング攻撃を防ぎます。
    return hmac.compare_digest(valid_signature, signature_from_header)

# 以下の場合 `True` を返します。
verify_signature(
    'secret',
    {
        'circleci-signature': 'v1=773ba44693c7553d6ee20f61ea5d2757a9a4f4a44d2841ae4e95b52e4cd62db4'
    },
    'foo',
)

# 以下の場合 `False` を返します。
verify_signature(
    'secret',
    {
        'circleci-signature': 'v1=not-a-valid-signature'
    },
    'foo',
)

```

## Event specifications of webhooks
{: #event-specifications}

CircleCI では、現在以下のイベントの Webhook を利用できます。

| イベントタイプ            | 説明                  | 状態の例                                                     | 含まれるサブエンティティ                |
| ------------------ | ------------------- | -------------------------------------------------------- | --------------------------- |
| workflow-completed | ワークフローが終了状態になっています。 | "success", "failed", "error", "canceled", "unauthorized" | プロジェクト、組織、ワークフロー、パイプライン     |
| job-completed      | ジョブが終了状態になっています。    | "success", "failed", "error", "canceled", "unauthorized" | プロジェクト、組織、ワークフロー、パイプライン、ジョブ |
{: class="table table-striped"}

## Common top level keys of webhooks
{: #common-top-level-keys}

Each webhook will have some common data as part of the event:

| フィールド       | 説明                                                          | タイプ |
| ----------- | ----------------------------------------------------------- | --- |
| id          | システムからの各イベントを一意に識別するための ID (クライアントはこれを使って重複するイベントを削除できます。 ） | 文字列 |
| happened_at | イベントが発生した日時を表す ISO 8601 形式のタイムスタンプ                          | 文字列 |
| webhook     | トリガーされた Webhook を表すメタデータのマップ                                | マップ |
{: class="table table-striped"}

**注: ** イベントのペイロードはオープンなマップであり、新しいフィールドが互換性を損なう変更とみなされずにWebhook のペイロードのマップに追加される可能性があります。


## Common sub-entities of webhooks
{: #common-sub-entities}

ここでは CicrcleCI の Webhook が提供する様々なイベントのペイロードについて説明します。 The schema of these webhook events will often share data with other webhooks - we refer to these as common maps of data as "sub-entities". For example, when you receive an event payload for the `job-completed` webhook, it will contain maps of data for your *project, organization, job, workflow and pipeline*.

以下は、さまざまな Webhook で表示される共通のサブエンティティの例です。

### 組織
{: #project}

Webhook イベントに関連するプロジェクトに関するデータ

| フィールド | 常に表示 | 説明                                                                     |
| ----- | ---- | ---------------------------------------------------------------------- |
| id    | ○    | プロジェクトの一意の ID                                                          |
| slug  | ○    | 多くの CircleCI の API の中で特定のプロジェクト（例えば、gh/circleci/web-ui）を参照するために使用する文字列 |
| name  | ○    | プロジェクト名（例：web-ui）                                                      |
{: class="table table-striped"}

### ジョブ
{: #organization}

組織に関するデータ

| フィールド | 常に表示 | 説明               |
| ----- | ---- | ---------------- |
| id    | ○    | 組織の一意の ID        |
| name  | ○    | 組織名 (例：CircleCI) |
{: class="table table-striped"}

### ワークフロー
{: #job}

通常、CircleCI のワークロードにおけるある期間を表し（例：「ビルド」、「テスト」、または「デプロイ」）、一連のステップを含むジョブ。

Data about the job associated with the webhook event.


| Field         | Always present? | Description                                                                                                  |
| ------------- | --------------- | ------------------------------------------------------------------------------------------------------------ |
| id            | yes             | Unique ID of the job                                                                                         |
| number        | yes             | An auto-incrementing number for the job, sometimes used in CircleCI's APIs to identify jobs within a project |
| name          | yes             | Name of the job as defined in .circleci/config.yml                                                           |
| status        | yes             | Current status of the job                                                                                    |
| started\_at | yes             | When the job started running                                                                                 |
| stopped\_at | no              | When the job reached a terminal state (if applicable)                                                        |
{: class="table table-striped"}


### パイプライン
{: #workflow}

Workflows contain many jobs, which can run in parallel and/or have dependencies between them. A single git-push can trigger zero or more workflows, depending on the CircleCI configuration (but typically one will be triggered).

Data about the workflow associated with the webhook event.


| Field         | Always present? | Description                                                        |
| ------------- | --------------- | ------------------------------------------------------------------ |
| id            | Yes             | Unique ID of the workflow                                          |
| name          | Yes             | Name of the workflow as defined in .circleci/config.yml            |
| status        | No              | Current status of the workflow. Not included in job-level webhooks |
| created\_at | Yes             | When the workflow was created                                      |
| stopped_at    | No              | When the workflow reached a terminal state (if applicable)         |
| url           | Yes             | URL to the workflow in CircleCI's UI                               |
{: class="table table-striped"}

### トリガー
{: #pipeline}

Pipelines are the most high-level unit of work, and contain zero or more workflows. A single git-push always triggers up to one pipeline. Pipelines can also be triggered manually through the API.

Data about the pipeline associated with the webhook event.

| フィールド         | 常に表示 | 説明                                                                                |
| ------------- | ---- | --------------------------------------------------------------------------------- |
| id            | Yes  | Globally unique ID of the pipeline                                                |
| number        | Yes  | Number of the pipeline, which is auto-incrementing / unique per project           |
| created\_at | Yes  | When the pipeline was created                                                     |
| trigger       | Yes  | A map of metadata about what caused this pipeline to be created -- see below      |
| vcs           | No   | A map of metadata about the git commit associated with this pipeline -- see below |
{: class="table table-striped"}

### トリガー
{: #trigger}

Data about the trigger associated with the webhook event.

| フィールド | 常に表示 | 説明                                                                  |
| ----- | ---- | ------------------------------------------------------------------- |
| type  | yes  | How this pipeline was triggered (e.g. "webhook", "api", "schedule") |
{: class="table table-striped"}


### VCS
{: #vcs}

Note: The vcs map or its contents may not always be provided in cases where the information doesn't apply, such as future scenarios in which a pipeline isn't associated with a git commit.

| Field                   | Always present? | Description                                                                                                        |
| ----------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------ |
| target_repository_url | no              | URL to the repository building the commit                                                                          |
| origin_repository_url | no              | URL to the repository where the commit was made (this will only be different in the case of a forked pull request) |
| revision                | no              | Git commit being built                                                                                             |
| commit.subject          | no              | Commit subject (first line of the commit message). Note that long commit subjects may be truncated.                |
| commit.body             | no              | Commit body (subsequent lines of the commit message). Note that long commit bodies may be truncated.               |
| commit.author.name      | no              | Name of the author of this commit                                                                                  |
| commit.author.email     | no              | Email address of the author of this commit                                                                         |
| commit.authored\_at   | no              | Timestamp of when the commit was authored                                                                          |
| commit.committer.name   | no              | Name of the committer of this commit                                                                               |
| commit.committer.email  | no              | Email address of the committer of this commit                                                                      |
| commit.committed_at     | no              | Timestamp of when the commit was committed                                                                         |
| branch                  | no              | Branch being built                                                                                                 |
| tag                     | no              | Tag being built (mutually exclusive with "branch")                                                                 |
{: class="table table-striped"}


## Sample webhook payloads
{: #sample-webhook-payloads }

### workflow-completed
{: #workflow-completed }

```json
{
  "id": "3888f21b-eaa7-38e3-8f3d-75a63bba8895",
  "type": "workflow-completed",
  "happened_at": "2021-09-01T22:49:34.317Z",
  "webhook": {
    "id": "cf8c4fdd-0587-4da1-b4ca-4846e9640af9",
    "name": "Sample Webhook"
  },
  "project": {
    "id": "84996744-a854-4f5e-aea3-04e2851dc1d2",
    "name": "webhook-service",
    "slug": "github/circleci/webhook-service"
  },
  "organization": {
    "id": "f22b6566-597d-46d5-ba74-99ef5bb3d85c",
    "name": "circleci"
  }
  "workflow": {
    "id": "fda08377-fe7e-46b1-8992-3a7aaecac9c3",
    "name": "build-test-deploy",
    "created_at": "2021-09-01T22:49:03.616Z",
    "stopped_at": "2021-09-01T22:49:34.170Z",
    "url": "https://app.circleci.com/pipelines/github/circleci/webhook-service/130/workflows/fda08377-fe7e-46b1-8992-3a7aaecac9c3",
    "status": "success"
  },
  "pipeline": {
    "id": "1285fe1d-d3a6-44fc-8886-8979558254c4",
    "number": 130,
    "created_at": "2021-09-01T22:49:03.544Z",
    "trigger": {
      "type": "webhook"
    },
    "vcs": {
      "provider_name": "github",
      "origin_repository_url": "https://github.com/circleci/webhook-service",
      "target_repository_url": "https://github.com/circleci/webhook-service",
      "revision": "1dc6aa69429bff4806ad6afe58d3d8f57e25973e",
      "commit": {
        "subject": "Description of change",
        "body": "More details about the change",
        "author": {
          "name": "Author Name",
          "email": "author.email@example.com"
        },
        "authored_at": "2021-09-01T22:48:53Z",
        "committer": {
          "name": "Committer Name",
          "email": "committer.email@example.com"
        },
        "committed_at": "2021-09-01T22:48:53Z"
      },
      "branch": "main"
    }
  },
}
```

### job-completed
{: #job-completed }

```json
{
  "id": "8bd71c28-4969-3677-8940-3e3a61c46660",
  "type": "job-completed",
  "happened_at": "2021-09-01T22:49:34.279Z",
  "webhook": {
    "id": "cf8c4fdd-0587-4da1-b4ca-4846e9640af9",
    "name": "Sample Webhook"
  },
  "project": {
    "id": "84996744-a854-4f5e-aea3-04e2851dc1d2",
    "name": "webhook-service",
    "slug": "github/circleci/webhook-service"
  },
  "organization": {
    "id": "f22b6566-597d-46d5-ba74-99ef5bb3d85c",
    "name": "circleci"
  },
  "pipeline": {
    "id": "1285fe1d-d3a6-44fc-8886-8979558254c4",
    "number": 130,
    "created_at": "2021-09-01T22:49:03.544Z",
    "trigger": {
      "type": "webhook"
    },
    "vcs": {
      "provider_name": "github",
      "origin_repository_url": "https://github.com/circleci/webhook-service",
      "target_repository_url": "https://github.com/circleci/webhook-service",
      "revision": "1dc6aa69429bff4806ad6afe58d3d8f57e25973e",
      "commit": {
        "subject": "Description of change",
        "body": "More details about the change",
        "author": {
          "name": "Author Name",
          "email": "author.email@example.com"
        },
        "authored_at": "2021-09-01T22:48:53Z",
        "committer": {
          "name": "Committer Name",
          "email": "committer.email@example.com"
        },
        "committed_at": "2021-09-01T22:48:53Z"
      },
      "branch": "main"
    }
  },
  "workflow": {
    "id": "fda08377-fe7e-46b1-8992-3a7aaecac9c3",
    "name": "welcome",
    "created_at": "2021-09-01T22:49:03.616Z",
    "stopped_at": "2021-09-01T22:49:34.170Z",
    "url": "https://app.circleci.com/pipelines/github/circleci/webhook-service/130/workflows/fda08377-fe7e-46b1-8992-3a7aaecac9c3"
  },
  "job": {
    "id": "8b91f9a8-7975-4e60-916c-f0152ccbc937",
    "name": "test",
    "started_at": "2021-09-01T22:49:28.841Z",
    "stopped_at": "2021-09-01T22:49:34.170Z",
    "status": "success",
    "number": 136
  }
}
```
