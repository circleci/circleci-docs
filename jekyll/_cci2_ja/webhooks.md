---
layout: classic-docs
title: "Webhook"
short-title: "Webhook を使って CircleCI のイベントを受け取る"
description: "Webhook を使って CircleCI のイベントを受け取る"
version:
  - Cloud
---

## 概要
{: #overview}

Webhookにより、お客様が管理しているプラットフォーム（ご自身で作成した API またはサードパーティのサービス）と今後の一連の_イベント_を連携することができます。

CircleCI 上で Webhook を設定することにより、CircleCI から情報 (_イベント_ と呼ばれます) をリアルタイムで受け取ることができます。 これにより、必要な情報を得るために API をポーリングしたり、 CircleCI の Web アプリケーションを手動でチェックする必要がなくなります。

ここでは、Webhook の設定方法および Webhook の送信先にどのような形でイベントが送信されるかを詳しく説明します。

**注: ** CircleCI の Webhook 機能は、現在プレビュー版であり、ドキュメントや機能が変更または追加される場合があります。

## ユースケース
{: #use-cases}

Webhook は多くの目的にご活用いただけます。 具体的な例は以下のとおりです。

- カスタム ダッシュボードを作成して、ワークフローやジョブのイベントの可視化または分析を行う。
- インシデント管理ツール（例：Pagerduty）にデータを送信する。
- [Airtable]({{site.baseurl}}/2.0/webhooks-airtable) などのツールを使ってデータを取得・可視化する。
- Slack などのコミュニケーション アプリにイベントを送信する。
- ワークフローがキャンセルされた場合に Webhook を使ってアラートを送信し、API を使ってそのワークフローを再実行する。
- ワークフローやジョブが完了したら内部通知システムをトリガーし、アラートを送信する。
- 独自の自動化ブラグインやツールを作成する。

## Communication Protocol
{: #communication-protocol }

A webhook is sent whenever an event occurs on the CircleCI platform.

A webhook is sent using an HTTP POST, to the URL that was registered when the webhook was created, with a body encoded using JSON.

CircleCI expects that the server that responds to a webhook will return a 2xx response code. If a non-2xx response is received, CircleCI will retry at a later time. If CircleCI does not receive a response to the webhook within a short period of time, we will assume that delivery has failed, and we will retry at a later time. The timeout period is currently 5 seconds, but is subject to change during the preview period. The exact details of the retry policy are not currently documented, and are subject to change during the preview period. Please [get in touch with our team if you have feedback about timeouts and retries](https://circleci.canny.io/webhooks).

### Headers
{: #headers }

A number of HTTP headers are set on webhooks, as detailed in the table below.

| Header Name         | Value                                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Content-Type        | `application/json`                                                                                                                   |
| User-Agent          | A string indicating that the sender was CircleCI (`CircleCI-Webhook/1.0`). The value is subject to change during the preview period. |
| Circleci-Event-Type | The type of event, (`workflow-completed`, `job-completed`, etc.)                                                                     |
| Circleci-Signature  | When present, this signature can be used to verify that the sender of the webhook has access to the secret token.                    |
{: class="table table-striped"}

## Setting up a hook
{: #setting-up-a-hook}

Webhooks are set up on a per-project basis. To get started:

1. CircleCI 上にセットアップしたプロジェクトにアクセスします。
1. **Project Settings** をクリックします。
1. Project Settings のサイドバーで、**Webhook** をクリックします。
1. **Add Webhook** をクリックします。
1. Webhook フォームに入力します（フィールドとその説明については下の表をご覧ください）。
1. 受信用 API またはサードパーティのサービスがセットアップされている場合、**Test Ping Event** をクリックしてテストイベントをディスパッチします。

| Field                  | Required? | Intent                                                                                      |
| ---------------------- | --------- | ------------------------------------------------------------------------------------------- |
| Webhook name           | Y         | The name of your webhook                                                                    |
| URL                    | Y         | The URL the webhook will make POST requests to.                                             |
| Certificate Validation | Y         | Ensure the receiving host has a valid SSL certificate before sending an event <sup>1</sup>. |
| Secret token           | Y         | Used by your API/platform to validate incoming data is from CircleCI.                       |
| Select an event        | Y         | You must select at least one event that will trigger a webhook.                             |
{: class="table table-striped"}

<sup>1</sup>Only leave this unchecked for testing purposes.

**Note: There is a limit of 5 Webhooks per project.**

## Payload signature
{: #payload-signature}

You should validate incoming webhooks to verify that they are coming from CircleCI. To support this, when creating a webhook, you can optionally provide a secret token. Each outgoing HTTP request to your service will contain a `circleci-signature` header. This header will consist of a comma-separated list of versioned signatures.

```
POST /uri HTTP/1.1
Host: your-webhook-host
circleci-signature: v1=4fcc06915b43d8a49aff193441e9e18654e6a27c2c428b02e8fcc41ccc2299f9,v2=...,v3=...
```

Currently, the latest (and only) signature version is v1. You should *only* check the latest signature type to prevent downgrade attacks.

The v1 signature is the HMAC-SHA256 digest of the request body, using the configured signing secret as the secret key.

Here are some example signatures for given request bodies:

| Body                           | Secret Key       | Signature                                                          |
| ------------------------------ | ---------------- | ------------------------------------------------------------------ |
| `hello world`                  | `secret`         | `734cc62f32841568f45715aeb9f4d7891324e6d948e4c6c60c0621cdac48623a` |
| `lalala`                       | `another-secret` | `daa220016c8f29a8b214fbfc3671aeec2145cfb1e6790184ffb38b6d0425fa00` |
| `an-important-request-payload` | `hunter123`      | `9be2242094a9a8c00c64306f382a7f9d691de910b4a266f67bd314ef18ac49fa` |
{: class="table table-striped"}

The following is an example of how you might validate signatures in Python:

```
import hmac

def verify_signature(secret, headers, body):
    # get the v1 signature from the `circleci-signature` header
    signature_from_header = {
        k: v for k, v in [
            pair.split('=') for pair in headers['circleci-signature'].split(',')
        ]
    }['v1']

    # Run HMAC-SHA256 on the request body using the configured signing secret
    valid_signature = hmac.new(bytes(secret, 'utf-8'), bytes(body, 'utf-8'), 'sha256').hexdigest()

    # use constant time string comparison to prevent timing attacks
    return hmac.compare_digest(valid_signature, signature_from_header)

# the following will return `True`
verify_signature(
    'secret',
    {
        'circleci-signature': 'v1=773ba44693c7553d6ee20f61ea5d2757a9a4f4a44d2841ae4e95b52e4cd62db4'
    },
    'foo',
)

# the following will return `False`
verify_signature(
    'secret',
    {
        'circleci-signature': 'v1=not-a-valid-signature'
    },
    'foo',
)
```

## Event Specifications
{: #event-specifications}

CircleCI currently offers webhooks for the following events:

| Event type         | Description                             | Potential statuses                                       | Included sub-entities                          |
| ------------------ | --------------------------------------- | -------------------------------------------------------- | ---------------------------------------------- |
| workflow-completed | A workflow has reached a terminal state | "success", "failed", "error", "canceled", "unauthorized" | project, organization, workflow, pipeline      |
| job-completed      | A job has reached a terminal state      | "success", "failed", "canceled", "unauthorized"          | project, organization, workflow, pipeline, job |
{: class="table table-striped"}

## Common top level keys
{: #common-top-level-keys}

Each Webhook will have some common data as part of the event:

| Field       | Description                                                                                        | Type   |
| ----------- | -------------------------------------------------------------------------------------------------- | ------ |
| id          | ID used to uniquely identify each event from the system (the client can use this to dedupe events) | String |
| happened_at | ISO 8601 timestamp representing when the event happened                                            | String |
| webhook     | A map of metadata representing the webhook that was triggered                                      | Map    |
{: class="table table-striped"}

**Note:** The event payloads are open maps, meaning new fields may be added to maps in the webhook payload without considering it a breaking change.


## Common sub-entities
{: #common-sub-entities}

The next sections describe the payloads of different events offered with CircleCI webhooks. The schema of these webhook events will share often share data with other webhooks - we refer to these as common maps of data as "sub-entities". For example, when you receive an event payload for the `job-completed` webhook, it will contains maps of data for your *project, organization, job, workflow and pipeline*.

Let's look at some of the common sub-entities that will appear across various webhooks:

### Project
{: #project}

Data about the project associated with the webhook event.

| Field | Always present? | Description                                                                                                   |
| ----- | --------------- | ------------------------------------------------------------------------------------------------------------- |
| id    | yes             | Unique ID of the project                                                                                      |
| slug  | yes             | String that can be used to refer to a specific project in many of CircleCI's APIs (e.g. "gh/circleci/web-ui") |
| name  | yes             | Name of the project (e.g. "web-ui")                                                                           |
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
