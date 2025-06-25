---
layout: classic-docs
title: インサイトデータの連携
description: このドキュメントでは、 CircleCI のすべてのジョブで、サードパーティツールとの連携により分析データを追跡し、視覚化する方法について説明します。
contentTags:
  platform:
    - クラウド
    - Server v4.x
    - Server v3.x
---

## 概要
{: #overview }

{:toc}

このドキュメントでは、インサイトのデータをサードパーティツールと連携させる方法について説明します。 CircleCI では現在、[New Relic](https://newrelic.com/)、[Datadog](https://www.datadoghq.com/)、[Sumo Logic](https://www.sumologic.com/)との連携をサポートしています。

## New Relic の連携

[New Relic と CircleCI の連携](https://newrelic.com/instant-observability/circleci)により、New Relic のモニタリングスタックで CircleCI ジョブの分析データを見ることができます。

以下の手順を実行して CircleCI Webhook をセットアップし、ログを New Relic に転送します。

**手順 1.** [CircleCI](https://app.circleci.com/projects) にログインします。

**手順 2.** いずれかの CircleCI プロジェクトに移動します。

**手順 3.** **Project settings** をクリックします。

**手順 4.**  Project Settings のサイドバーで **Webhooks** をクリックします。

**手順 5.** **Add Webhook** をクリックします。

**手順 6.** Webhook に名前をつけます。

**手順 7.** New Relic の**ログエンドポイント**を入力します。

US:

`https://log-api.newrelic.com/log/v1?Api-Key=YOUR_LICENSE_KEY`

EU:

`https://log-api.eu.newrelic.com/log/v1?Api-Key=YOUR_LICENSE_KEY`

New Relic のアカウント設定したリージョンを使用します。 `YOUR_LICENSE_KEY` を [UI または API から取得できる](https://docs.newrelic.com/docs/apis/intro-apis/new-relic-api-keys/#manage-license-key) New Relic ライセンスキーに置き換えます。

**手順 8.** ログのプッシュをトリガーしたいイベントのタイプに応じて、**ワークフロー**または**ジョブ**のいずれかを選択します。

**手順 9.** 受信 API またはサードパーティのサービスを設定している場合は、**est ping event** をクリックし、テストイベントを作成します。

詳細については、New Relic と CircleCI の[インストールドキュメント](https://docs.newrelic.com/ja/docs/logs/forward-logs/circleci-logs/)を参照してください。

## Datadog との連携
{: #datadog-integration }

CircleCI では、Webhook を使って Datadog にデータを送ることができます。

1. [CircleCI アプリ](https://app.circleci.com/)で、各プロジェクトの横の省略記号(…)をクリックし、**Project Settings** > **Webhooks** の順にクリックします。
  - **Webhook URL**: `https://webhook-intake.datadoghq.com/api/v2/webhook/?dd-api-key=<API_KEY>` where `<API_KEY>` が[ Datadog の API キー](https://app.datadoghq.com/account/login)です。
  - **Name**: `Datadog CI Visibility` または指定したい識別名を入力します。
  - **Events**: `Workflow Completed` と `Job Completed` を選択します。
  - **Certificate verifications**: このチェックを有効にします。

1. **Add Webhook** をクリックして新しい Webhook を保存します。

### Datadog でパイプラインデータを可視化する
{: #visualize-pipeline-data-in-datadog }

[Datadog](https://app.datadoghq.com/account/login) にサインインし、パイプラインとパイプラインの実行ページにアクセスし、ワークフローの完了後にデータが入力されることを確認します。

**注**: パイプラインのページでは各リポジトリのデフォルトのブランチのデータのみが表示されます。

## Sumo Logic との連携
{: #sumo-logic-integration }

Sumo Logic 用の CircleCI アプリでは、継続的インテグレーションやデプロイパイプラインのパフォーマンスやヘルス状態を追跡するための高度なビューを提供しています。


### Sumo Logic の CircleCI ダッシュボード
{: #the-circleci-dashboard-for-sumo-logic }

このダッシュボードを使って以下を実行します。
  - パフォーマンス、アクティビティ、ヘルスの状態をリアルタイムで監視および時間の経過に伴った追跡
  - 最適化の余地の特定

![header]({{ site.baseurl }}/assets/img/docs/Sumologic_Demo.png)

含まれているダッシュボードパネルを使用して、パイプラインに関するインサイトを得ることができます。 特定のプロジェクトまたはジョブの各パネルを、任意の期間フィルタリングします。 ダッシュボードパネルには以下が表示されます：

  - 実行したジョブの合計数
  - ジョブのヘルス (成功率%）
  - 概要
  - プロジェクト毎の実行ジョブ
  - 1日のパフォーマンス
  - 1日のジョブ数
  - 最近失敗したジョブ 5 つ
  - 最近失敗したワークフロー 5 つ
  - 時間がかかったワークフロートップ 10 （平均）
  - 実行時間の長いジョブトップ 10
  - 1日の平均ジョブ実行時間

CircleCI ダッシュボードは、ダッシュボードのホームページからアプリケーション カタログを使用してインストールできます。

![header]({{ site.baseurl }}/assets/img/docs/sumologic_app_catalog.png)

ダッシュボードは CircleCI Sumo Logic Orb を介してデータを受け取ります。 この Orb は、追跡するプロジェクトに含まれている必要があります。

### CircleCI Webhook を使って Sumo Logic のメトリクスを設定する
{: #set-up-sumo-logic-metrics-using-circleci-webhooks }

Sumo Logic を使ってデータを収集し可視化するには、まずメトリクスデータを Sumo Logic に送るよう CircleCI Webhook を設定します。
#### Webhook の設定
{: #configure-webhooks }
##### **ステップ 1: ホストコレクターを設定します。**
{: #step-1-configure-hosted-collector }

Sumo Logic の[Configuring a Hosted Collector](https://help.sumologic.com/03Send-Data/Hosted-Collectors/Configure-a-Hosted-Collector) についてのドキュメントに従います。

##### **ステップ 2:  HTTP ソースを追加します。**
{: #step-2-add-an-http-source }

CircleCI Webhook を送付する URL を取得し、コレクターに記録するには、[HTTP ソースを追加](https://help.sumologic.com/03Send-Data/Sources/02Sources-for-Hosted-Collectors/HTTP-Source)する必要があります。

完了したら、生成された「HTTP ソースアドレス」をコピーします。 このリンクはその後いつでも Sumo Logic から再取得することができます。 この URL を次のステップで CircleCI Webhook の UI に入力します。

##### **ステップ 3:  プロジェクトの Webhook を設定します。**
{: #step-3-configure-project-webhooks }

トラックするプロジェクト毎に、Webhook が先述の HTTP ソースアドレスに送信されるように設定します。 [Webhook の設定に関するドキュメント]({{ site.baseurl }}/ja/webhooks/#setting-up-a-hook)に従ってください。

Webhook を設定する際は、必ず「workflow-completed」イベントと「job-completed」イベントの両方を含めてください。

### Sumo Logic 用の CircleCI アプリをインストールする
{: #install-the-circleci-app-for-sumo-logic }

データ収集の設定は完了しま他ので、次に、 事前設定された検索機能と CI パイプラインにインサイトを送るダッシュボードを使用するために CircleCI 用 Sumo Logic アプリをインストールします。

#### Sumo Logic アプリのインストール方法
{: #to-install-the-circleci-app-for-sumo-logic }

1. アプリカタログから CircleCI アプリを見つけてインストールします。 インストールの前にこのアプリに入っているダッシュボードのプレビューを見るには、**Preview Dashboards** をクリックします。
2. 使用しているサービスのバージョンを選択し、 **Add to Library** をクリックします。 バージョンの選択は現在いくつかのアプリにのみで可能です。 詳細については、[Install the Apps from the Library](https://help.sumologic.com/05Search/Library/Apps-in-Sumo-Logic/Install-Apps-from-the-Library) を参照して下さい。
3. アプリをインストールするには、以下のフィールドに入力してください。
  - **アプリ名**:  既存の名前をそのまま使用することも、アプリ用の名前を入力することもできます。
  - **データソース**:  データソースに下記のいずれかのオプションを選択します。
    - **Source Category** を選択び、リストからソースカテゴリーを選びます。
    - **Enter a Custom Data Filter** を選び、アンダースコアで始まるカスタムソースカテゴリを入力します。 例: `(_sourceCategory=MyCategory)`
  - **高度な設定**:  ライブラリ内の場所 (デフォルトではライブラリの個人フォルダ) を選択するか、**New Folder** をクリックして新しいフォルダを追加します。
4. **Add to Library** をクリックします。

アプリがインストールされたら、個人フォルダーまたはライブラリ内でデフォルトとして設定した場所に表示されます。 これで、お客様の組織でこのアプリを共有することができます。 パネルが自動的に入力されます。 各パネルには、時間範囲のクエリに合致しパネルの作成以降に受信したデータが徐々に入力されることに注意してください。 結果はすぐには表示されませんが、少し時間が経つと、すべてのグラフとマップが表示されます。
