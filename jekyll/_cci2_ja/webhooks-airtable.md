---
layout: classic-docs
title: "Airtable を使った CircleCI Webhook"
short-title: "Webhook を使った例"
description: "Webhook を使った例"
version:
  - クラウド
---

このドキュメントでは、サードパーティのアプリケーションを使って Webhook を使用する方法を説明します。今回は [Airtable](https://airtable.com/) を使って、パイプラインの出力をキャプチャし可視化する方法を説明します。

**前提条件**

- Webhook を有効化した CircleCI のアカウント (Webhook は現在プレビュー段階であり、使用できない場合があります)。
- [CircleCI での Webhook]({{site.baseurl}}/2.0/webhooks) 使用経験
- Airtable のアカウント (下記例を使う場合)


## Airtable をセットアップする
{: #get-setup-in-airtable }

### 1. Airtable で新しい "base"  を作成します。
{: #create-a-new-base-on-airtable }

Airtable にログインし、新しい "Base" を作成します。

![Creating a new base in airtable]({{site.baseurl}}/assets/img/docs/webhooks/webhook_airtable_1_new.png)

### 2. テーブルと列のデータタイプを設定します。
{: #set-table-and-column-data-types }

デフォルトでは、新しい 「Grid view」が 「Table 1」という名前になり、事前定義された複数の列がそれぞれ異なるデータタイプで表示されます。 CircleCI では、これらの列を CircleCI から受け取るプロジェクトに関するデータに置き換えます。

CircleCI データの多くは、「A single text line (一行のテキスト)」になりますが、 「date」などのデータタイプを使用する値もあります。 この例では、既存の列を削除し、以下の３列を「A single text line」として挿入します。

- ID
- Job Name
- Status

最後に列を１列追加します。ここでは「date」のデータタイプを使用します。

- Happened At

![Changing the column types]({{site.baseurl}}/assets/img/docs/webhooks/webhook_airtable_2_datatypes.png)

### 3. Webhook の自動化の準備をします。
{: #prepare-the-webhook-automation }

Airtable の右上で、 [Automations] ボタンを選択し、右側の [Automations] パネルを開き、[Create a custom automation] を選択します。


![Open Automations]({{site.baseurl}}/assets/img/docs/webhooks/webhook_airtable_3_automation.png)

次の画面で自動化の「trigger」を選択するよう求められます。 「When webhook received」を選択すると、CircleCI の Airtable Webhook URL が書かれた下記の画面が表示されます。

その Webhook URL をクリップボードにコピーします。

![Get webhook link]({{site.baseurl}}/assets/img/docs/webhooks/webhook_airtable_4.png
)

### 4. CircleCI に接続します。
{: #connect-to-circleci }

CircleCI の Airtable Webhook URL を入手したら、CircleCI 用の Webhook をセットアップできるようになります。 まず CircleCI で監視するリポジトリのプロジェクト設定を開き、サイドパネルから「Webhooks」を選択します。

![Setup webhooks on circleci]({{site.baseurl}}/assets/img/docs/webhooks/webhook_airtable_5.png
)

[Add Webhook] をクリックして、Webhook 名 (先程コピーした Webhook URL ) を入力し、 再度 [AddWebhook] をクリックして保存する前に、[Job Completed] イベントを選択します。

![Entering details for a webhook]({{site.baseurl}}/assets/img/docs/webhooks/webhook_airtable_6.png)

### 5. テスト Webhook をトリガーします。
{: #trigger-a-test-webhook }

これで Webhook が設定されました。Airtable に戻る前に、CircleCI パイプラインをトリガーして CircleCI が送信するデータの種類を Airtable が分かるようにします。 CircleCI で、テストに使用できる任意のブランチでプロジェクトのパイプラインを表示し、[Run Piprline] ボタンをクリックします。

![Trigger a test webhook]({{site.baseurl}}/assets/img/docs/webhooks/webhook_airtable_7_run_pipeline.png)

パイプラインが完了すると、最初のテストの Webhook が送信され、Airtable で検証することができます。 Webhookトリガー設定画面の一番下で、[test] ボタンを押して、Webhook データが入力されるまで待ちます。

![Validate results in airtable]({{site.baseurl}}/assets/img/docs/webhooks/webhook_airtable_8_test.png)

データが正常に受信されたら、[Done] をクリックし、トリガーのアクションを作成します。

### 6. Webhook トリガーのアクションのセットアップ
{: #setup-the-action-for-our-webhook-trigger }

「Action Type」には、ドロップダウンから [Create record] を選択し、テーブルを選択します。

![Create action in airtable]({{site.baseurl}}/assets/img/docs/webhooks/webhook_airtable_9_action.png
)

次に、[Choose field] をクリックし、テーブルの各列を対応する Webhook データにマッピングします。

![Map columns of table to webhook data]({{site.baseurl}}/assets/img/docs/webhooks/webhook_airtable_10_fields.png)

最後に [Run test] をクリックして最初の列を挿入します。

![Run airtable test]({{site.baseurl}}/assets/img/docs/webhooks/webhook_airtable_11_done.png)

7. 完了です！ パイプラインのジョブが完了すると、Airtable に新しいデータが入力されます。 Airtable has both free and premium features for creating different views of your data. Your data can be cross-referenced with other tables, used in calculations, and more.

### Tracking Deployments With Airtable
{: #tracking-deployments-with-airtable }

While the above covers some basics with Airtable, let's take things a step further and look at how we might further leverage the collected data. Once you have a sufficient amount of data, we can start to create helpful views of our data. How about a calendar view of our deployments to help us visualize how often we are deploying!

In Airtable, go to the bottom left of the "views" side panel and click the "plus" icon on "Calendar".

![Add calendar in Airtable]({{site.baseurl}}/assets/img/docs/webhooks/webhook_airtable_12_calendar.png)

The next screen will ask you to confirm which "Date" column we want to base our calendar on, and since we only have one "Happened at", we will select that.

You will be presented with a calendar view of all of your jobs. Because we want to track just our deployments, let’s rename this view "Deployments" and set a filter at the top to only show jobs with the name of our deployment job on CircleCI, which in our case is "deploy".

![Airtable calendar filter]({{site.baseurl}}/assets/img/docs/webhooks/webhook_airtable_12_calendar2.png)

And that's it! We now have a grid view which contains a spreadsheet of all of our data, and a calendar-based view named "Deployments" which shows us only our deploy jobs.

