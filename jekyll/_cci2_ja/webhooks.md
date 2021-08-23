---
layout: classic-docs
title: "Webhook"
short-title: "Webhook を使って CircleCI のイベントの最新情報を受け取る"
description: "Webhook を使って CircleCI のイベントの最新情報を受け取る"
version:
  - Cloud
---

## 概要
{: #overview}

Webhookにより、お客様が管理しているプラットフォーム（ご自身で作成した API またはサードパーティのサービス）と今後の一連の_イベント_を連携することができます。

CircleCI 上で Webhook を設定することにより、CircleCI から情報 (_イベント_ と呼ばれます) をリアルタイムで受け取ることができます。 これにより、必要な情報を得るために API をポーリングしたり、 CircleCI の Web アプリケーションを手動でチェックする必要がなくなります。

ここでは、Webhook の設定方法および Webhook の送信先にどのような形でイベントが送信されるかも詳しく説明します。

**注: ** CircleCI の Webhook 機能は、現在プレビュー版であり、ドキュメントや機能が変更または追加される場合があります。

## ユースケース
{: #use-cases}

Webhook は多くの目的にご活用いただけます。 具体的な例は以下のとおりです。

- カスタム ダッシュボードをビルドしてワークフローやジョブのイベントの可視化または分析を行う。
- インシデント管理ツール（例：Pagerduty）にデータを送信する。
- [Airtable]({{site.baseurl}}/2.0/webhooks-airtable) などのツールを使ってデータをキャプチャし可視化する。
- Slack などのコミュニケーション アプリにイベントを送信する。
- ワークフローがキャンセルされた場合に Webhook を使ってアラートを送信し、API を使ってそのワークフローを再実行する。
- ワークフローやジョブが完了したら内部通知システムをトリガーし、アラートを送信する。
- 独自の自動化ブラグインやツールをビルドする。

## フックのセットアップ
{: #setting-up-a-hook}

Webhook はプロジェクトごとにセットアップされます。 以下の方法で開始します。

1. CircleCI 上にセットアップしたプロジェクトにアクセスします。
1. **Project Settings (プロジェクトの設定) ** をクリックします。
1. Project Settings のサイドバーで、**Webhook** をクリックします。
1. **Add Webhook (Webhook の追加）** をクリックします。
1. Webhook フォームに入力します（フィールドとその目的は以下の表をご覧ください）。
1. 受信用 API またはサードパーティのサービスがセットアップされている場合、**Test Ping Event (Ping イベントをテストする) ** をクリックしてテストイベントをディスパッチします。

| フィールド       | 要否 | 説明                                                           |
| ----------- | -- | ------------------------------------------------------------ |
| Webhook 名   | 必須 | Webhook の名前                                                  |
| URL         | 必須 | Webhook が Post リクエストを送信する URL                                |
| 証明書の検証      | 必須 | イベント<sup>1</sup>を送信する前に受信ホストが有効な SSL 証明書を保持していることを確認する。      |
| シークレット トークン | 必須 | 受信データが CircleCI からのデータかどうかを検証するために、ご自身の API または プラットフォームで使用。 |
| イベントの選択     | 必須 | Webhook をトリガーするイベントを少なくとも１つ選択しなければなりません。                     |
{: class="table table-striped"}

<sup>1</sup> こちらはテストの場合のみチェックボックスをオフのままにします。

## イベントの仕様
{: #event-specifications}

CircleCI では現在以下のイベントの Webhook が利用できます。

| イベントタイプ            | 説明                 | 状態の例                          | 含まれる構成要素                    |
| ------------------ | ------------------ | ----------------------------- | --------------------------- |
| workflow-completed | ワークフローが終了状態になっている。 | "成功"、"失敗"、"エラー"、"キャンセル"、"未承認" | プロジェクト、組織、ワークフロー、パイプライン     |
| job-completed      | ジョブが終了状態になっている。    | "成功"、"失敗"、"エラー"、"キャンセル"、"未承認" | プロジェクト、組織、ワークフロー、パイプライン、ジョブ |
{: class="table table-striped"}

## 共通のトップ レベル キー
{: #common-top-level-keys}

イベントの一部として、各Webhook に共通するデータがあります。

| フィールド       | 説明                                                         | タイプ |
| ----------- | ---------------------------------------------------------- | --- |
| id          | システムからの各イベントを一意に識別するための ID (クライアントはこれを使って重複するイベントを削除できます。） | 文字列 |
| happened_at | イベントが発生した日時を表す ISO 8601 形式のタイムスタンプ                         | 文字列 |
| webhook     | トリガーされた Webhook を表すメタデータのマップ                               | マップ |
{: class="table table-striped"}

**注: ** イベントのペイロードはオープンなマップであり、新しいフィールドが互換性を損なう変更とみなされずにWebhook のペイロードのマップに追加される可能性があります。


## 共通のサブエンティティ
{: #common-sub-entities}

ここでは CicrcleCI の Webhook が提供するさまざまなイベントのペイロードについて説明します。 これらの Webhook イベントのスキーマは、多くの場合共有データを他の Webhook と共有します。Circle CI では、このことをデータの共通マップとして「サブエンティティー」と呼びます。 例えば、`job-completed` 状態の Webhook のイベント ペイロードを受信した場合、それにはご自身の*プロジェクト、組織、ジョブ、ワークフロー、およびパイプライン* のデータマップが含まれます。

以下は、さまざまな Webhook で表示される共通のサブエンティティの例です。

### プロジェクト
{: #project}

Webhook のイベントに関連するプロジェクトに関するデータ

| フィールド | 表示   | 説明                                                                                                            |
| ----- | ---- | ------------------------------------------------------------------------------------------------------------- |
| id    | 常に表示 | プロジェクトの一意の ID                                                                                                 |
| slug  | 常に表示 | String that can be used to refer to a specific project in many of CircleCI's APIs (e.g. "gh/circleci/web-ui") |
| name  | yes  | Name of the project (e.g. "web-ui")                                                                           |
{: class="table table-striped"}

### Organization
{: #organization}

Data about the organization associated with the webhook event.

| Field | Always present? | Description                                |
| ----- | --------------- | ------------------------------------------ |
| id    | yes             | Unique ID of the organization              |
| name  | yes             | Name of the organization (e.g. "circleci") |
{: class="table table-striped"}

### Job
{: #job}

A job typically represents one phase in a CircleCI workload (e.g. "build", "test", or "deploy") and contains a series of steps.

| Field         | Always present? | Description                                                                                                  |
| ------------- | --------------- | ------------------------------------------------------------------------------------------------------------ |
| id            | yes             | Unique ID of the job                                                                                         |
| number        | yes             | An auto-incrementing number for the job, sometimes used in CircleCI's APIs to identify jobs within a project |
| name          | yes             | Name of the job as defined in .circleci/config.yml                                                           |
| status        | yes             | Current status of the job                                                                                    |
| started\_at | yes             | When the job started running                                                                                 |
| stopped\_at | no              | When the job reached a terminal state (if applicable)                                                        |
{: class="table table-striped"}


### Workflow
{: #workflow}

Workflows contain many jobs, which can run in parallel and/or have dependencies between them. A single git-push can trigger zero or more workflows, depending on the CircleCI configuration (but typically one will be triggered).


| Field         | Always present? | Description                                                        |
| ------------- | --------------- | ------------------------------------------------------------------ |
| id            | Yes             | Unique ID of the workflow                                          |
| name          | Yes             | Name of the workflow as defined in .circleci/config.yml            |
| status        | No              | Current status of the workflow. Not included in job-level webhooks |
| created\_at | Yes             | When the workflow was created                                      |
| stopped_at    | No              | When the workflow reached a terminal state (if applicable)         |
| url           | Yes             | URL to the workflow in CircleCI's UI                               |
{: class="table table-striped"}

### Pipeline
{: #pipeline}

Pipelines are the most high-level unit of work, and contain zero or more workflows. A single git-push always triggers up to one pipeline. Pipelines can also be triggered manually through the API.

| Field         | Always present? | Description                                                                       |
| ------------- | --------------- | --------------------------------------------------------------------------------- |
| id            | Yes             | Globally unique ID of the pipeline                                                |
| number        | Yes             | Number of the pipeline, which is auto-incrementing / unique per project           |
| created\_at | Yes             | When the pipeline was created                                                     |
| trigger       | Yes             | A map of metadata about what caused this pipeline to be created -- see below      |
| vcs           | No              | A map of metadata about the git commit associated with this pipeline -- see below |
{: class="table table-striped"}

### Trigger
{: #trigger}

| Field    | Always present? | Description                                                         |
| -------- | --------------- | ------------------------------------------------------------------- |
| type     | yes             | How this pipeline was triggered (e.g. "webhook", "api", "schedule") |
| actor.id | No              | The user who triggered the pipeline, if there is one                |
{: class="table table-striped"}


### VCS
{: #vcs}

Note: The vcs map or its contents may not always be provided in cases where the information doesn't apply, such as future scenarios in which a pipeline isn't associated with a git commit.

| Field                   | Always present? | Description                                                                                                        |
| ----------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------ |
| target_repository_url | no              | URL to the repository building the commit                                                                          |
| origin_repository_url | no              | URL to the repository where the commit was made (this will only be different in the case of a forked pull request) |
| revision                | no              | Git commit being built                                                                                             |
| commit.subject          | no              | Commit subject (first line of the commit message)                                                                  |
| commit.body             | no              | Commit body (subsequent lines of the commit message)                                                               |
| commit.author.name      | no              | Name of the author of this commit                                                                                  |
| commit.author.email     | no              | Email address of the author of this commit                                                                         |
| commit.authored\_at   | no              | Timestamp of when the commit was authored                                                                          |
| commit.committer.name   | no              | Name of the committer of this commit                                                                               |
| commit.committer.email  | no              | Email address of the committer of this commit                                                                      |
| commit.committed_at     | no              | Timestamp of when the commit was committed                                                                         |
| branch                  | no              | Branch being built                                                                                                 |
| tag                     | no              | Tag being built (mutually exclusive with "branch")                                                                 |
{: class="table table-striped"}
