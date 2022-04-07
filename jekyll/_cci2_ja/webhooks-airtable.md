---
layout: classic-docs
title: "Airtable を使った CircleCI Webhook"
short-title: "Webhook の使用例"
description: "Webhook の使用例"
version:
  - クラウド
---

このドキュメントでは、サードパーティのアプリケーションを使って Webhook を使用する方法を説明します。今回は [Airtable](https://airtable.com/) を使って、パイプラインの出力をキャプチャし可視化する方法を説明します。

**前提条件**

- Webhook が有効化されている CircleCI のアカウント (Webhook は現在プレビュー段階であり、使用できない場合があります)。
- [CircleCI での Webhook]({{site.baseurl}}/2.0/webhooks) 使用経験
- Airtable のアカウント (下記例を使う場合)


## Airtable のセットアップ
{: #get-setup-in-airtable }

### 1. Airtable で新規「base」を作成します。
{: #create-a-new-base-on-airtable }

Airtable にログインし、新規「Base」 を作成します。

![Creating a new base in airtable]({{site.baseurl}}/assets/img/docs/webhooks/webhook_airtable_1_new.png)

### 2. テーブルと列のデータタイプを設定します。
{: #set-table-and-column-data-types }

デフォルトでは、新規「Grid view」が 「Table 1」という名前になり、事前定義された複数の列がそれぞれ異なるデータタイプで表示されます。 CircleCI では、これらの列を CircleCI から受け取るプロジェクトに関するデータに置き換えます。

CircleCI の多くのデータは、単純な「A single text line (一行のテキスト)」ですが、「date」などのデータタイプを使用する値もあります。 この例では、既存の列を削除し、以下の 3 列を「A single text line」として挿入します。

- ID
- Job Name
- Status

最後に列を 1 列追加します。ここでは「date」のデータタイプを使用します。

- Happened At

![Changing the column types]({{site.baseurl}}/assets/img/docs/webhooks/webhook_airtable_2_datatypes.png)

### 3. Webhook の自動化の準備をします。
{: #prepare-the-webhook-automation }

Airtable の画面右上で、 [Automations] ボタンを選択し、右側の [Automations] パネルを開き、[Create a custom automation] を選択します。


![Open Automations]({{site.baseurl}}/assets/img/docs/webhooks/webhook_airtable_3_automation.png)

次の画面で自動化の「trigger」を選択するよう求められます。 「When webhook received」を選択すると、CircleCI の Airtable Webhook URL が書かれた下記の画面が表示されます。

その Webhook URL をクリップボードにコピーします。

![Get webhook link]({{site.baseurl}}/assets/img/docs/webhooks/webhook_airtable_4.png
)

### 4. CircleCI に接続します。
{: #connect-to-circleci }

CircleCI の Airtable Webhook URL を入手し、CircleCI の Webhook をセットアップする準備が整いました。 まず CircleCI 上で監視するリポジトリの [Project Settings] を開き、サイドパネルから [Webhooks] を選択します。

![Setup webhooks on circleci]({{site.baseurl}}/assets/img/docs/webhooks/webhook_airtable_5.png
)

[Add Webhook] をクリックして、Webhook 名 (先程コピーした Webhook URL ) を入力し、[Job Completed] イベントを選択し、再度 [AddWebhook] をクリックして保存します。

![Entering details for a webhook]({{site.baseurl}}/assets/img/docs/webhooks/webhook_airtable_6.png
)

### 5. テスト Webhook をトリガーします。
{: #trigger-a-test-webhook }

Webhook の設定は完了しましたが、Airtable に戻る前に、CircleCI パイプラインをトリガーして CircleCI が送信するデータの種類を Airtable で確認できるようにします。 CircleCI で、テストに使用できる任意のブランチでプロジェクトのパイプラインを表示し、[Run Pipline] ボタンをクリックします。

![Trigger a test webhook]({{site.baseurl}}/assets/img/docs/webhooks/webhook_airtable_7_run_pipeline.png)

パイプラインが完了すると、最初のテスト Webhook が送信され、Airtable で確認することができます。 Webhook トリガー設定画面の一番下で、[test] ボタンを押して、Webhook データが挿入されるのを待ちます。

![Validate results in airtable]({{site.baseurl}}/assets/img/docs/webhooks/webhook_airtable_8_test.png)

データが正常に受信されたら、[Done] をクリックし、トリガーのアクションを作成します。

### 6. Webhook トリガーの「Action」のセットアップ
{: #setup-the-action-for-our-webhook-trigger }

「Action Type」には、ドロップダウンから [Create record] を選択し、ご自身のテーブルを選択します。

![Create action in airtable]({{site.baseurl}}/assets/img/docs/webhooks/webhook_airtable_9_action.png
)

次に、[Choose field] をクリックし、テーブルの各列を対応する Webhook データにマッピングします。

![Map columns of table to webhook data]({{site.baseurl}}/assets/img/docs/webhooks/webhook_airtable_10_fields.png)

最後に [Run test] をクリックして最初の列を挿入します。

![Run airtable test]({{site.baseurl}}/assets/img/docs/webhooks/webhook_airtable_11_done.png)

7. 完了です！ パイプラインのジョブが完了すると、Airtable に新しいデータが入力されます。 Airtable には、データを様々なビュー (表示形式) で作成するための無料および有料の機能があります。 これらのデータは、他のテーブルと相互参照したり、計算など様々な用途に使用できます。

### Airtable でのデプロイのトラッキング
{: #tracking-deployments-with-airtable }

上記では Airtable の基本について説明しましたが、ここでは一歩進んで、集めたデータをさらに活用する方法について説明します。 十分な量のデータを収集したら、データの役立つビューの作成を開始できます。 デプロイのカレンダービューを作成し、デプロイ頻度を可視化してみましょう！

Airtableで、[views] サイドパネルの左下に移動し、[Calendar] の [plus] アイコンをクリックします。

![Add calendar in Airtable]({{site.baseurl}}/assets/img/docs/webhooks/webhook_airtable_12_calendar.png)

次の画面では、カレンダーのベースにする Date 列を確認するように求められます。Happened at 列は1つしかないので、それを選択します。

すべてのジョブのカレンダービューが表示されます。 デプロイのみをトラックするために、このビューの名前を「デプロイ」に変更し、CircleCI のデプロイジョブの名前のジョブ (この場合は「deploy」)のみを表示するよう最上部でフィルターを設定します。

![Airtable calendar filter]({{site.baseurl}}/assets/img/docs/webhooks/webhook_airtable_12_calendar2.png)

完成です！ これで、すべてのデータのスプレッドシートを含むグリッドビューと、デプロイジョブのみを表示する「Deployments」という名前のカレンダーベースのビューが表示されました。

