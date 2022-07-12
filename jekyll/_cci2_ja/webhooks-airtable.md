---
layout: classic-docs
title: "Airtable を使った CircleCI Webhook"
short-title: "Webhook のユースケース"
description: "Webhook のユースケース"
version:
  - クラウド
---

このドキュメントでは、サードパーティのアプリケーションを使って Webhook を使用する方法を説明します。今回は [Airtable](https://airtable.com/) を使って、パイプラインの出力をキャプチャし可視化する方法を説明します。

**前提条件**

- CircleCI のアカウント
- [CircleCI の Webhook]({{site.baseurl}}/webhooks) に関する知識
- Airtable のアカウント (下記例を使う場合)


## Airtable のセットアップ
{: #get-setup-in-airtable }

### 1. Airtable で新規「Base」を作成します。
{: #create-a-new-base-on-airtable }

Airtable にログインし、新規「Base」 を作成します。

![Airtable で新規 base を作成する]({{site.baseurl}}/assets/img/docs/webhooks/webhook_airtable_1_new.png)

### 2. テーブルと列のデータタイプを設定します。
{: #set-table-and-column-data-types }

デフォルトでは、新規「Grid view」が 「Table 1」という名前になり、事前定義された複数の列がそれぞれ異なるデータタイプで表示されます。 これらの列を CircleCI から受け取るプロジェクトに関するデータに置き換えます。

CircleCI の多くのデータは、単純な「A single text line (一行のテキスト)」ですが、「date」などのデータタイプを使用する値もあります。 この例では、既存の列を削除し、以下の 3 列を「A single text line」として挿入します。

- ID
- Job Name
- Status

最後に列を 1 列追加します。ここでは「date」のデータタイプを使用します。

- Happened At

![列タイプを変更する]({{site.baseurl}}/assets/img/docs/webhooks/webhook_airtable_2_datatypes.png)

### 3. Webhook のAutomation (自動化) の準備をします。
{: #prepare-the-webhook-automation }

Airtable の画面右上で、 [Automations] ボタンを選択し、右側の [Automations] パネルを開き、[Create a custom automation] を選択します。


![Automations を開く]({{site.baseurl}}/assets/img/docs/webhooks/webhook_airtable_3_automation.png)

次の画面で automation の「trigger」を選択するよう求められます。 [When webhook received] を選択すると、Airtable Webhook URL が書かれた下記の画面が表示されます。

Webhook URL をクリップボードにコピーします。

![Webhook リンクを取得する]({{site.baseurl}}/assets/img/docs/webhooks/webhook_airtable_4.png
)

### 4. CircleCI に接続します。
{: #connect-to-circleci }

Airtable の Webhook URL を入手したので、CircleCI 用に Webhook をセットアップする準備が整いました。 まず監視したい CircleCI のリポジトリの [Project Settings] を開き、サイドパネルから [Webhooks] を選択します。

![CircleCI で Webhook をセットアップする]({{site.baseurl}}/assets/img/docs/webhooks/webhook_airtable_5.png
)

[Add Webhook] をクリックして、Webhook 名と先程コピーした Webhook URL を入力し、[Job Completed] イベントを選択し、再度 [Add Webhook] をクリックして保存します。

![Webhook の詳細を入力する]({{site.baseurl}}/assets/img/docs/webhooks/webhook_airtable_6.png
)

### 5. テスト Webhook をトリガーします。
{: #trigger-a-test-webhook }

Webhook の設定は完了しましたが、Airtable に戻る前に、CircleCI パイプラインをトリガーして CircleCI が送信するデータの種類を Airtable で確認できるようにします。 CircleCI で、テストに使用できる任意のブランチでプロジェクトのパイプラインを表示し、[Run Pipline] ボタンをクリックします。

![テスト Webhook をトリガーする]({{site.baseurl}}/assets/img/docs/webhooks/webhook_airtable_7_run_pipeline.png)

パイプラインが完了すると、最初のテスト Webhook が送信され、Airtable で確認することができます。 Webhook トリガー設定画面の一番下で、[test] ボタンを押して、Webhook データが挿入されるのを待ちます。

![Airtable で結果を確認する]({{site.baseurl}}/assets/img/docs/webhooks/webhook_airtable_8_test.png)

データが正常に受信されたら、[Done] をクリックします。次にトリガーのアクションを作成します。

### 6. Webhook トリガーの「Action」のセットアップ
{: #setup-the-action-for-our-webhook-trigger }

「Action Type」には、ドロップダウンから [Create record] を選択し、ご自身のテーブルを選択します。

![Airtable で Action を作成する]({{site.baseurl}}/assets/img/docs/webhooks/webhook_airtable_9_action.png
)

次に、[Choose field] をクリックし、テーブルの各列を対応する Webhook データにマッピングします。

![Webhook データにテーブルの列をマッピングする]({{site.baseurl}}/assets/img/docs/webhooks/webhook_airtable_10_fields.png)

最後に [Run test] をクリックします。これにより最初の列にデータが入ります。

![Airtable のテストを実行する]({{site.baseurl}}/assets/img/docs/webhooks/webhook_airtable_11_done.png)

7. 完了です！ パイプラインのジョブが完了すると、Airtable に新しいデータが入力されます。 Airtable には、データを様々なビュー (表示形式) で作成するための無料および有料の機能があります。 これらのデータは、他のテーブルと相互参照したり、計算など様々な用途に使用できます。

### Airtable でのデプロイのトラッキング
{: #tracking-deployments-with-airtable }

上記では Airtable の基本について説明しましたが、ここでは一歩進んで、集めたデータをさらに活用する方法について説明します。 十分な量のデータを集めたら、役立つデータビューの作成を開始できます。 デプロイのカレンダービューを作成し、デプロイ頻度を可視化してみましょう！

Airtableで、[views] サイドパネルの左下に移動し、[Calendar] の [plus] アイコンをクリックします。

![Airtable にカレンダーを追加する]({{site.baseurl}}/assets/img/docs/webhooks/webhook_airtable_12_calendar.png)

次の画面では、どの Date 列をカレンダーのベースにするのかを確認されます。Happened at 列は 1 つしかないので、それを選択します。

すべてのジョブのカレンダービューが表示されます。 デプロイのみをトラックするために、このビューの名前を「Deployments」に変更し、CircleCI のデプロイジョブの名前がついたジョブ (この場合は「deploy」) のみを表示するよう最上部でフィルタリングを設定します。

![Airtable カレンダーのフィルタリング]({{site.baseurl}}/assets/img/docs/webhooks/webhook_airtable_12_calendar2.png)

完成です！ すべてのデータのスプレッドシートを含むグリッドビューと、デプロイジョブのみを表示する「Deployments」という名前のカレンダーベースのビューが表示されました。

