---
layout: classic-docs
title: "Webhook の概要"
short-title: "Webhook を使って CircleCI のイベントを受け取る"
description: "Webhook を使って CircleCI のイベントを受け取る"
contentTags:
  platform:
    - クラウド
    - Server v4.x
    - Server v3.x
---

Use webhooks to:

- Build a custom dashboard to visualize or analyze workflow/job events.
- Send data to incident management tools (such as [PagerDuty](https://www.pagerduty.com)).
- Use tools like [Airtable]({{site.baseurl}}/webhooks-airtable) to capture data and visualize it.
- Alert when a workflow is cancelled, then use the API to rerun the workflow.
- Trigger notification systems to alert people when workflows/jobs complete.
- 独自の自動化ブラグインやツールを作成する。

## 概要
{: #introduction}

Webhook により、お客様が管理しているプラットフォーム（ご自身で作成した API またはサードパーティのサービス）と今後の一連の_イベント_を連携することができます。

CircleCI 上で Webhook を設定することにより、CircleCI から情報 (_イベント_と呼ばれます) をリアルタイムで受け取ることができます。 これにより、必要な情報を得るために API をポーリングしたり、 CircleCI の Web アプリケーションを手動でチェックする必要がなくなります。

## クイックスタート
{: #quickstart}

Webhook は CircleCI アプリ内で、または API を介してプロジェクトごとにセットアップされます。

API を介して Webhook を設定する場合は、[Webhook パブリック API](https://circleci.com/docs/api/v2/#tag/Webhook) をご覧ください。

CircleCI アプリ内で Webhook を設定する場合は、以下を実行してください。

1. CircleCI 上にセットアップしたプロジェクトにアクセスします。
1. **Project Settings** をクリックします。
1. Project Settings のサイドバーで、**Webhook** をクリックします。
1. **Add Webhook** をクリックします。
1. Webhook フォームに入力します (フィールドとその説明については下の表をご覧ください)。
1. 受信用 API またはサードパーティのサービスがセットアップされている場合、**Test Ping Event** をクリックしてテストイベントをディスパッチします。 この test ping event は、テストを簡易化するためのペイロードが省略されていることにご注意ください。 [workflow-completed]({{site.baseurl}}/ja/webhooks/#workflow-completed) イベントと [job-completed]({{site.baseurl}}/ja/webhooks/#job-completed) イベントのサンブル全文は、下記をご覧ください。


| フィールド                  | 必須? | 説明                                                              |
| ---------------------- | --- | --------------------------------------------------------------- |
| Webhook name           | ○   | Webhook 名                                                       |
| URL                    | ○   | Webhook が Post リクエストを送信する URL                                   |
| Certificate Validation | ○   | イベント<sup>1</sup>を送信する前に受信ホストが有効な SSL 証明書を保持していることを確認します。        |
| Secret token           | ×   | 受信データが CircleCI からのデータかどうかを検証するために、ご自身の API または プラットフォームで使用します。 |
| Select an event        | ○   | Webhook をトリガーするイベントを少なくとも１つ選択しなければなりません。                        |
{: class="table table-striped"}

<sup>1</sup> こちらはテストの場合のみチェックボックスをオフのままにします。

1つのプロジェクトにつき Webhook は５つまでです。
{: class="alert alert-info"}

## Webhook の通信プロトコル
{: #communication-protocol }

CircleCI では、現在以下のイベントの Webhook を利用できます。

Webhook は、HTTP POST により、Webhook 作成時に登録した URL に JSON でエンコードされた本文と共に送信されます。

CircleCI expects the server that responds to a webhook will return a 2xx response code. 2xx 以外のレスポンスを受信した場合、CircleCI は、後で再試行します。 短時間のうちに Webhook への応答がない場合も、配信に失敗したと判断して後で再試行します。 The timeout period is currently 5 seconds.

Webhook リクエストが重複する場合があります。 To deduplicate (prevent requests from being duplicated for a specific event), use the [`id` property](/docs/webhooks-reference/#common-top-level-keys) in the webhook payload for identification.

タイムアウトや再試行についてフィードバックがあれば、 [サポートチームにご連絡ください](https://circleci.canny.io/webhooks)。

### Webhook のヘッダー
{: #headers }

Webhook には、以下のような多くの HTTP ヘッダーが設定されています。

| ヘッダー名                 | 値                                                                |
| --------------------- | ---------------------------------------------------------------- |
| `content-type`        | `application/json`                                               |
| `user-agent`          | 送信者が CircleCI であることを示す文字列（`CircleCI-Webhook/1.0`)。               |
| `circleci-event-type` | イベントのタイプ （`workflow-completed`、`job-completed`など）                |
| `circleci-signature`  | この署名により Webhook の送信者にシークレット トークンへのアクセス権が付与されているかどうかを検証することができます。 |
{: class="table table-striped"}

## Validate webhooks
{: #validate-webhooks}

受信する Webhook を検証して、 送信元が CircleCI であることを確認する必要があります。 これを行うために、Webhook を作成する際に、シークレットトークンをオプションで提供することができます。 お客様のサービスへの送信 HTTP リクエストごとに、 `circleci-signature` ヘッダーが含まれます。 このヘッダーは、バージョン管理された署名のリストで構成され、カンマで区切られています。

```shell
POST /uri HTTP/1.1
Host: your-webhook-host
circleci-signature: v1=4fcc06915b43d8a49aff193441e9e18654e6a27c2c428b02e8fcc41ccc2299f9,v2=...,v3=...
```

現在、最新の (そして唯一の) 署名バージョンは v1 です。 ダウングレード攻撃を防ぐために、最新の署名タイプを*必ず*確認する必要があります。

この v1 署名は、リクエストボディの HMAC-SHA256 ダイジェストであり、 設定された署名シークレットをシークレットキーとして使用しています。

以下は、リクエストボディに対する署名の例です。

| 本文                             | シークレット キー        | 署名                                                                 |
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

## Webhook のイベント仕様
{: #event-specifications}

CircleCI では、現在以下のイベントの Webhook を利用できます。

| イベントタイプ            | 説明                  | 状態の例                                                     | 含まれるサブエンティティ                |
| ------------------ | ------------------- | -------------------------------------------------------- | --------------------------- |
| workflow-completed | ワークフローが終了状態になっています。 | "success", "failed", "error", "canceled", "unauthorized" | プロジェクト、組織、ワークフロー、パイプライン     |
| job-completed      | ジョブが終了状態になっています。    | "success", "failed", "error", "canceled", "unauthorized" | プロジェクト、組織、ワークフロー、パイプライン、ジョブ |
{: class="table table-striped"}

## 次のステップ
{: #next-steps}

* See the [Webhooks reference](/docs/webhooks-reference/) page for key definitions and sample payloads.
* Follow the [Using webhooks with third party tools](/docs/webhooks-airtable/) tutorial.

