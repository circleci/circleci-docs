---
layout: classic-docs
title: "Webhook"
short-title: "Webhook を使って CircleCI のイベントを受け取る"
description: "Webhook を使って CircleCI のイベントを受け取る"
version:
  - Cloud
  - Server v3.x
---

## Webhookの概要
{: #overview}

Webhookにより、お客様が管理しているプラットフォーム（ご自身で作成した API またはサードパーティのサービス）と今後の一連の_イベント_を連携することができます。

CircleCI 上で Webhook を設定することにより、CircleCI から情報 (_イベント_と呼ばれます) をリアルタイムで受け取ることができます。 これにより、必要な情報を得るために API をポーリングしたり、 CircleCI の Web アプリケーションを手動でチェックする必要がなくなります。

The document details how to set up a webhook, as well as the shape of events that will be sent to your webhook destination.

## Webhookのユースケース
{: #use-cases}

Webhook は多くの目的にご活用いただけます。 具体的な例は以下のとおりです。

- Building a custom dashboard to visualize or analyze workflow/job events
- Sending data to incident management tools (such as [PagerDuty](https://www.pagerduty.com/home/))
- Using tools like [Airtable]({{site.baseurl}}/2.0/webhooks-airtable) to capture data and visualize it
- Alerting when a workflow is cancelled, then using the API to rerun the workflow
- Triggering internal notification systems to alert people when workflows/jobs complete
- Building your own automation plugins and tools

## Webhookの通信プロトコル
{: #communication-protocol }

CircleCI では、現在以下のイベントの Webhook を利用できます。

Webhook は、HTTP POST により、Webhook 作成時に登録した URL に JSON でエンコードされた本文と共に送信されます。

CircleCI は、Webhook に応答したサーバーが 2xx のレスポンス コードを返すことを想定しています。 2xx 以外のレスポンスを受信した場合、CircleCI は、後ほど再試行します。 短時間のうちに Webhook への応答がない場合も、配信に失敗したと判断して後ほど再試行します。 タイムアウト時間は現在5秒ですが、プレビュー期間中に変更される場合があります。 再試行ポリシーの正確な詳細は現在文書化されておらず、プレビュー期間中に変更される場合があります。

If you have feedback about timeouts and retries, please get [get in touch](https://circleci.canny.io/webhooks) with our team.

### Webhookのヘッダー
{: #headers }

Webhook には、以下のような多くの HTTP ヘッダーが設定されています。

| ヘッダー名               | 値                                                                                       |
| ------------------- | --------------------------------------------------------------------------------------- |
| 型                   | `application/json`                                                                      |
| User-Agent          | 送信者が CircleCI であることを示す文字列（</code>CircleCI-Webhook/1.0</0>)）。 この値はプレビュー期間中に変更される場合があります。 |
| Circleci-Event-Type | イベントのタイプ （`workflow-completed`、`job-completed`など）                                       |
| Circleci-Signature  | この署名により Webhook の送信者にシークレット トークンへのアクセス権が付与されているかどうかを検証することができます。                        |
{: class="table table-striped"}

## Webhookのセットアップ
{: #setting-up-a-hook}

Webhooks are set up on a per-project basis, either within the CircleCI app or via API.

To configure webhooks via API see our documentation for [Webhooks Public API](https://circleci.com/docs/api/v2/#tag/Webhook).

To configure webhooks within the CircleCI app:

1. Visit a specific project you have set up on CircleCI
1. Click on **Project Settings**
1. In the sidebar of your Project Settings, click on **Webhooks**
1. Click **Add Webhook**
1. Fill out the webhook form (the table below describes the fields and their intent)
1. 受信用 API またはサードパーティのサービスがセットアップされている場合、**Test Ping Event** をクリックしてテストイベントをディスパッチします。 Note that the test ping event has an abbreviated payload for ease of testing. See full examples of [workflow-completed]({{site.baseurl}}/2.0/webhooks/#workflow-completed) and [job-completed]({{site.baseurl}}/2.0/webhooks/#job-completed) events below.


| フィールド                  | 必須? | 説明                                                              |
| ---------------------- | --- | --------------------------------------------------------------- |
| Webhook name           | ○   | Webhook 名                                                       |
| URL                    | ○   | Webhook が Post リクエストを送信する URL                                   |
| Certificate Validation | ○   | イベント<sup>1</sup>を送信する前に受信ホストが有効な SSL 証明書を保持していることを確認します。        |
| Secret token           | ○   | 受信データが CircleCI からのデータかどうかを検証するために、ご自身の API または プラットフォームで使用します。 |
| Select an event        | ○   | Webhook をトリガーするイベントを少なくとも１つ選択しなければなりません。                        |
{: class="table table-striped"}

<sup>1</sup> こちらはテストの場合のみチェックボックスをオフのままにします。

There is a limit of 5 webhooks per project.
{: class="alert alert-info"}

## Webhookペイロードの署名
{: #payload-signature}

You should validate incoming webhooks to verify that they are coming from CircleCI. To support this, when creating a webhook, you can optionally provide a secret token. Each outgoing HTTP request to your service will contain a `circleci-signature` header. This header will consist of a comma-separated list of versioned signatures.

```
POST /uri HTTP/1.1
Host: your-webhook-host
circleci-signature: v1=4fcc06915b43d8a49aff193441e9e18654e6a27c2c428b02e8fcc41ccc2299f9,v2=...,v3=...
```

現在、最新の（そして唯一の）署名バージョンは v1 です。 You should *only* check the latest signature type to prevent downgrade attacks.

The v1 signature is the HMAC-SHA256 digest of the request body, using the configured signing secret as the secret key.

以下は、リクエストボディに対する署名の例です。

| ボディ                            | シークレット キー        | 署名                                                                 |
| ------------------------------ | ---------------- | ------------------------------------------------------------------ |
| `hello World`                  | `secret`         | `734cc62f32841568f45715aeb9f4d7891324e6d948e4c6c60c0621cdac48623a` |
| `lalala`                       | `another-secret` | `daa220016c8f29a8b214fbfc3671aeec2145cfb1e6790184ffb38b6d0425fa00` |
| `an-important-request-payload` | `hunter123`      | `9be2242094a9a8c00c64306f382a7f9d691de910b4a266f67bd314ef18ac49fa` |
{: class="table table-striped"}

以下は、Pythonで署名を検証する場合の例です。

```python
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

## Webhookのイベント仕様
{: #event-specifications}

CircleCI では、現在以下のイベントの Webhook を利用できます。

| イベントタイプ            | 説明                  | 状態の例                                                     | 含まれるサブエンティティ                |
| ------------------ | ------------------- | -------------------------------------------------------- | --------------------------- |
| workflow-completed | ワークフローが終了状態になっています。 | "success", "failed", "error", "canceled", "unauthorized" | プロジェクト、組織、ワークフロー、パイプライン     |
| job-completed      | ジョブが終了状態になっています。    | "success", "failed", "error", "canceled", "unauthorized" | プロジェクト、組織、ワークフロー、パイプライン、ジョブ |
{: class="table table-striped"}

## Webhookの共通のトップ レベル キー
{: #common-top-level-keys}

イベントの一部として、各Webhook に共通するデータがあります。

| フィールド       | 説明                                                          | 型    |
| ----------- | ----------------------------------------------------------- | ---- |
| id          | システムからの各イベントを一意に識別するための ID (クライアントはこれを使って重複するイベントを削除できます。 ） | 文字列型 |
| happened_at | イベントが発生した日時を表す ISO 8601 形式のタイムスタンプ                          | 文字列型 |
| webhook     | トリガーされた Webhook を表すメタデータのマップ                                | マップ  |
{: class="table table-striped"}

**注: ** イベントのペイロードはオープンなマップであり、新しいフィールドが互換性を損なう変更とみなされずにWebhook のペイロードのマップに追加される可能性があります。


## Webhookの共通のサブエンティティ
{: #common-sub-entities}

The next sections describe the payloads of different events offered with CircleCI webhooks. The schema of these webhook events will often share data with other webhooks - we refer to these as common maps of data as "sub-entities". For example, when you receive an event payload for the `job-completed` webhook, it will contain maps of data for your *project, organization, job, workflow and pipeline*.

Let us look at some of the common sub-entities that will appear across various webhooks:

### プロジェクト
{: #project}

Webhook イベントに関連するプロジェクトに関するデータ

| フィールド | 常に表示 | 説明                                                                     |
| ----- | ---- | ---------------------------------------------------------------------- |
| id    | ○    | プロジェクトの一意の ID                                                          |
| slug  | ○    | 多くの CircleCI の API の中で特定のプロジェクト（例えば、gh/circleci/web-ui）を参照するために使用する文字列 |
| name  | ○    | プロジェクト名（例：web-ui）                                                      |
{: class="table table-striped"}

### 組織
{: #organization}

Webhook イベントに関連する組織に関するデータ

| フィールド | 常に表示 | 説明               |
| ----- | ---- | ---------------- |
| id    | ○    | 組織の一意の ID        |
| name  | ○    | 組織名 (例：CircleCI) |
{: class="table table-striped"}

### ジョブ
{: #job}

通常、CircleCI のワークロードにおけるある期間を表し（例：「ビルド」、「テスト」、または「デプロイ」）、一連のステップを含むジョブ。

Webhook イベントに関連するジョブに関するデータ


| フィールド         | 常に表示 | 説明                                                                |
| ------------- | ---- | ----------------------------------------------------------------- |
| id            | ○    | ジョブの一意の ID                                                        |
| number        | ○    | ジョブの自動インクリメント番号。 CircleCI の API でプロジェクト内のジョブを識別するために使用される場合があります。 |
| name          | ○    | .circleci/config.yml で定義されているジョブ名                                 |
| status        | ○    | ジョブの現在の状態                                                         |
| started\_at | ○    | ジョブの実行が開始された時間                                                    |
| stopped\_at | ×    | ワークフローが終了状態になった時間（該当する場合）                                         |
{: class="table table-striped"}


### ワークフロー
{: #workflow}

Workflows contain many jobs, which can run in parallel and/or have dependencies between them. A single git-push can trigger zero or more workflows, depending on the CircleCI configuration (but typically one will be triggered).

Webhook イベントに関連するワークフローに関するデータ


| フィールド         | 常に表示 | 説明                                      |
| ------------- | ---- | --------------------------------------- |
| id            | はい   | ワークフローの一意の ID                           |
| name          | はい   | .circleci/config.yml で定義されているワークフロー名    |
| status        | いいえ  | ワークフローの現在の状態。 ジョブレベルの Webhook には含まれません。 |
| created\_at | はい   | ワークフローが作成された時間                          |
| stopped_at    | いいえ  | ワークフローが終了状態になった時間（該当する場合）               |
| url           | はい   | CircleCI の UI にあるワークフローへの URL           |
{: class="table table-striped"}

### パイプライン
{: #pipeline}

Pipelines are the most high-level unit of work, and contain zero or more workflows. １回の git-push で、常に最大で１つのパイプラインをトリガーします。 パイプラインは API から手動でトリガーすることもできます。

Webhook イベントに関連するパイプラインに関するデータ

| フィールド         | 常に表示 | 説明                                         |
| ------------- | ---- | ------------------------------------------ |
| id            | はい   | グローバルに一意なパイプラインの ID                        |
| number        | はい   | バイプラインの番号（自動インクリメントまたはプロジェクトごとに一意）         |
| created\_at | はい   | パイプラインが作成された時間                             |
| trigger       | ○    | このパイプラインが作成された原因に関するメタデータ マップ（以下を参照）       |
| vcs           | ×    | このパイプラインに関連する Git コミットに関するメタデータ マップ（以下を参照） |
{: class="table table-striped"}

### トリガー
{: #trigger}

Webhook イベントに関連するトリガーに関するデータ

| フィールド | 常に表示 | 説明                                                 |
| ----- | ---- | -------------------------------------------------- |
| type  | ○    | このパイプラインがどのようにトリガーされたか（例：「Webhook」、「API」、「スケジュール」） |
{: class="table table-striped"}


### VCS
{: #vcs}

The VCS map or its contents may not always be provided in cases where the information does not apply, such as future scenarios in which a pipeline is not associated with a git commit.
{: class="alert alert-info"}


| フィールド                   | 常に表示 | 説明                                                      |
| ----------------------- | ---- | ------------------------------------------------------- |
| target_repository_url | ×    | コミットをビルドするレポジトリへの URL                                   |
| origin_repository_url | ×    | コミットが作成されたレポジトリへの URL （フォークされたプルリクエストの場合のみ異なります）        |
| revision                | ×    | ビルドする Git コミット                                          |
| commit.subject          | ×    | コミットのサブジェクト（コミットメッセージの先頭行） 長いコミットサブジェクトは切り捨てられる場合があります。 |
| commit.body             | ×    | コミットの本文（コミットメッセージの後続の行） 長いコミット本文は切り捨てられる場合があります。        |
| commit.author.name      | ×    | コミットのオーサー名                                              |
| commit.author.email     | ×    | コミットのオーサーのメールアドレス                                       |
| commit.authored\_at   | ×    | コミットがオーサリングされた時のタイムスタンプ                                 |
| commit.committer.name   | ×    | コミットのコミッター名                                             |
| commit.committer.email  | ×    | コミットのコミッターのメールアドレス                                      |
| commit.committed_at     | ×    | コミットがコミットされた時のタイムスタンプ                                   |
| branch                  | ×    | ビルドされたブランチ                                              |
| tag                     | ×    | ビルドされたタグ（「ブランチ」と相互排他的）                                  |
{: class="table table-striped"}


## Webhookペイロードのサンプル
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
  },
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
  }
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
