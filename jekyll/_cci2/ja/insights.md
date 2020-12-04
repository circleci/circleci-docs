---
layout: classic-docs
title: "インサイトの使用"
short-title: "インサイトの使用"
description: "リポジトリのステータスおよびテスト パフォーマンスを表示する方法"
order: 41
version:
  - Cloud
  - Server v2.x
---

## 概要

CircleCI のインサイト ダッシュボードでは、リポジトリのビルド プロセスについて状態と使用状況の概要を確認でき、開発方針の検討に役立てられます。 *インサイト ダッシュボード*には、クレジット使用量、成功率、パイプラインの実行時間、その他の関連情報に関する時系列データの概要が示されます。

ここでは、クラウド版 CircleCI と CircleCI Server それぞれでのインサイト ダッシュボードへのアクセス方法と使用方法について説明します。

## 使用法 (クラウド版 CircleCI)

CircleCI Web アプリケーションのサイドバーから、組織全体のインサイトにアクセスできます。

特定のプロジェクトのインサイトにアクセスするには、パイプラインのワークフローを表示して **[Insights (インサイト)]** ボタンをクリックします。 または、*パイプライン ダッシュボード*で、**[actions (アクション)]** セクションの [Insights (インサイト)] ボタンをクリックします。

{:.tab.insight-access.Access_by_sidebar}
![]({{ site.baseurl }}/assets/img/docs/screen_insights_access-3.png)

{:.tab.insight-access.Access_by_pipeline}
![]({{ site.baseurl }}/assets/img/docs/screen_insights_access-1.png)

{:.tab.insight-access.Access_by_workflow}
![]({{ site.baseurl }}/assets/img/docs/screen_insights_access-2.png)

### Workflow overview

インサイト ダッシュボードには、過去 90 日間のワークフローの詳細が表示されます。 **このデータはリアルタイムのものではなく、最新の情報が反映されるまでには最大で 24 時間かかることがあります**。 ページ上部で、ワークフローごとにフィルタリングすることも可能です。 ワークフローの概要に表示されるデータは以下のとおりです。

- ワークフローの合計実行回数
- ワークフローの成功率
- ワークフローの実行時間
- ワークフローのクレジット使用量*

### Job overview

**[Job (ジョブ)]** タブに切り替えると、ジョブごとに集計された以下の時系列データを確認できます。

- 合計クレジット使用量*
- 実行時間 (95 パーセンタイル)
- 合計実行回数
- 成功率

<small>
<i> * インサイト ダッシュボードはリアルタイム形式の財務報告ツールではありません。本ダッシュボードをクレジット使用量のレポートには使用しないでください。 最新のクレジット使用量の情報については、組織の [Plan Overview (プラン概要)] をご覧ください。</i>
</small>

* * *

## CircleCI Server のインサイト

<div class="alert alert-warning" role="alert">
  <p><span style="font-size: 115%; font-weight: bold;">⚠️ 注意</span></p>
  <span> 以下のセクションは、CircleCI <i>Server</i> 製品の [Insights (インサイト)] ページの使用法に関するものです。 </span>
</div>

### 概要

CircleCI アプリケーションで [Insights (インサイト)] メニュー項目をクリックすると、フォローしているすべてのリポジトリのヘルス状態に関するダッシュボードが表示されます。 ここでは、デフォルト ブランチの平均ビルド時間、平均キュー時間、最終ビルド時刻、成功率、並列処理数を確認できます。 **メモ:** ワークフローを構成している場合、デフォルト ブランチに対して実行されるすべてのジョブがグラフに表示されます。

![header]({{ site.baseurl }}/assets/img/docs/insights-1.0.gif)

この画面では、ビルドに関する以下のデータを確認できます。

- CircleCI でビルドされているすべてのリポジトリのリアルタイム ステータス
- 平均キュー時間
- 平均ビルド時間
- ブランチ数
- 最終ビルド時刻

### Project insights

メイン ナビゲーション上の [Insights (インサイト)] アイコンをクリックしてから、リポジトリ名をクリックすると、プロジェクト別のインサイトのページにアクセスできます。

プロジェクト別のインサイトのページでは、選択したブランチにおけるビルド ステータスおよびビルド パフォーマンスのグラフを確認できます。

![header]({{ site.baseurl }}/assets/img/docs/insights-current-build.png)

- **ビルド ステータス:** デフォルト ブランチに関する直近 50 件のビルドが表示されます。 右上隅でブランチを選択すると、そのブランチに関する 100 件を超えるビルド・ジョブのステータスを確認できます。

- **ビルド パフォーマンス:** このグラフには、最大 90 日前までのビルド・ジョブのデータが日別に集約され、各日の平均値がプロットされています。 任意のブランチをクリックして、リポジトリのパフォーマンスをモニタリングできます。

## Sumo Logic integration

Sumo Logic を使用すると、CircleCI 上のすべてのジョブを追跡し、その分析データを可視化できます。 そのためには、Sumo Logic パートナー インテグレーション サイトから、Sumo Logic Orb と Sumo Logic アプリケーション インテグレーションを使用します。

### The CircleCI dashboard for Sumo Logic

![header]({{ site.baseurl }}/assets/img/docs/CircleCI_SumoLogic_Dashboard.png)

以下の情報が表示されます。

- 合計ジョブ数
- 合計成功ジョブ数
- 合計失敗ジョブ数
- ジョブの結果
- ジョブ別の平均実行時間 (秒単位)
- プロジェクト別のジョブ数
- 最新のジョブ (直近 10 個)
- 時間のかかった失敗ジョブ上位 10 個 (秒単位)
- 時間のかかった成功ジョブ上位 10 個 (秒単位)

CircleCI ダッシュボードは、ダッシュボードのホームページからアプリケーション カタログを使用してインストールできます。

![header]({{ site.baseurl }}/assets/img/docs/sumologic_app_catalog.png)

ダッシュボードは CircleCI Sumo Logic Orb を介してデータを受け取ります。この Orb は、追跡するプロジェクトに含まれている必要があります。

### The Sumo Logic orb

Sumo Logic Orb の最新版は、[CircleCI Orb レジストリ](https://circleci.com/developer/ja/orbs/orb/circleci/sumologic)で提供されています。

#### 1. Sumo Logic Orb をインポートする

トップ レベルの `orbs` キーを含めることで Sumo Logic Orb をプロジェクトに追加し、以下のように `circleci/sumologic@x.y.z` をインポートします (`x.y.z` は上記リンクの最新バージョンの番号で置き換えてください)。

```yaml
orbs:
  sumologic: circleci/sumologic@x.y.z
```

#### 2. Add *workflow-collector* to workflow.

`workflow-collector` ジョブはワークフローと同時に並列で実行され、ワークフロー内のすべてのジョブが完了するまで Sumo Logic に分析データを送信します。

```yaml
version: 2.1
workflows:
  build-test-and-deploy:
    jobs:
      - sumologic/workflow-collector # このジョブを追加してワークフローを追跡します
      - build
      - test:
          requires:
            - build
      - deploy:
          requires:
            - test
```

#### 3. ソース コレクターを 2 つ作成する

HTTPS URL を返す 2 つの*ソース コレクター*を Sumo Logic で作成する必要があります。 この HTTPS URL にジョブ データが送信されます。

作成する必要があるのは、`circleci/job-collector` と `circleci/workflow-collector` という名前のコレクターです。

以下の手順で 2 つのソース コレクターを作成します。

1. ダッシュボードから **[Setup Wizard (セットアップ ウィザード)]** を選択します。
2. **[Set Up Streaming Data (ストリーミング データのセットアップ)]** を選択します。
3. 一番下までスクロールし、**[All Other Sources (他のすべてのソース)]** を選択します。
4. **[HTTPS Source (HTTPS ソース)]** を選択します。
5. `Source Category` に、前述した 2 つのうちのいずれかを入力します。
6. 結果として得られる URL を保存します。

#### 4. 環境変数を追加する

ステップ 3 で生成された各 URL に対して、対応する環境変数を作成します。

対応する環境変数は以下の 2 つです。

- `JOB_HTTP_SOURCE`
- `WORKFLOW_HTTP_SOURCE`

**[プロジェクトに環境変数を追加する方法]({{ site.baseurl }}/2.0/env-vars/#setting-an-environment-variable-in-a-project)**

これにより、Orb が Sumo Logic ダッシュボードにリンクされます。

各ジョブが CircleCI で実行されると、Sumo Logic ダッシュボードはデータの入力を開始します。

## See also

Refer to the [Orbs Introduction]({{ site.baseurl }}/2.0/orb-intro/) document to learn more about using and authoring orbs. Refer to the [Collecting Test Metadata]({{ site.baseurl }}/2.0/collect-test-data/) document for instructions to configure insights into your most failed tests.