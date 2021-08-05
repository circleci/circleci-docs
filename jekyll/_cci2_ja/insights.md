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
{: #overview }


CircleCI Insights ダッシュボードでは、リポジトリのビルド プロセスについて状態と使用状況の概要を確認でき、開発方針の検討に役立てられます。 _Insights ダッシュボード_には、クレジット使用量、成功率、パイプラインの実行時間、その他の関連情報に関する時系列データの概要が示されます。

ここでは、クラウド版 CircleCI と CircleCI Server それぞれでの Insights ダッシュボードへのアクセス方法と使用方法について説明します。

## 使用法 (クラウド版 CircleCI)
{: #usage-circleci-cloud }

CircleCI Web アプリケーションのサイドバーから、組織全体のインサイトにアクセスできます。

特定のプロジェクトのインサイトにアクセスするには、パイプラインのワークフローを表示して **[Insights (インサイト)]** ボタンをクリックします。 または、_パイプライン ダッシュボード_で、**[actions (アクション)]** セクションの [Insights (インサイト)] ボタンをクリックします。

{:.tab.insight-access.Access_by_sidebar}
![]({{ site.baseurl }}/assets/img/docs/screen_insights_access-3.png)

{:.tab.insight-access.Access_by_pipeline}
![]({{ site.baseurl }}/assets/img/docs/screen_insights_access-1.png)

{:.tab.insight-access.Access_by_workflow}
![]({{ site.baseurl }}/assets/img/docs/screen_insights_access-2.png)


### ワークフローの概要
{: #workflow-overview }

Insights ダッシュボードには、一定期間のワークフローの詳細が表示されます。 **このデータはリアルタイムのものではなく、最新の情報が反映されるまでには最大で 24 時間かかることがあります**。 ページ上部で、ワークフローごとにフィルタリングすることも可能です。 ワークフローの概要に表示されるデータは以下のとおりです。

- ワークフローの合計実行回数
- ワークフローの成功率
- ワークフローの実行時間
- ワークフローのクレジット使用量*

### ジョブの概要
{: #job-overview }

**[JOBS (ジョブ)]** タブに切り替えると、ジョブごとに集計された以下の時系列データを確認できます。

- 合計クレジット使用量*
- 実行時間 (95 パーセンタイル)
- 合計実行回数
- 成功率


<small>
<i> * インサイト ダッシュボードはリアルタイム形式の財務報告ツールではありません。 本ダッシュボードをクレジット使用量のレポートには使用しないでください。 最新のクレジット使用量の情報については、組織の [Plan Overview (プラン概要)] をご覧ください。</i>
</small>

---

## CircleCI Server のインサイト
{: #circleci-server-insights }

<div class="alert alert-warning" role="alert">
  <p><span style="font-size: 115%; font-weight: bold;">⚠️ 注意</span></p>
  <span> 以下のセクションは、CircleCI <i>Server</i> 製品の [Insights (インサイト)] ページの使用法に関するものです。 </span>
</div>

### 概要
{: #overview }

CircleCI アプリケーションで [Insights (インサイト)] メニュー項目をクリックすると、フォローしているすべてのリポジトリのヘルス状態を示すダッシュボードが表示されます。 ここでは、デフォルト ブランチの平均ビルド時間、平均キュー時間、最終ビルド時刻、成功率、並列処理数を確認できます。 **注:** ワークフローを構成している場合、デフォルト ブランチに対して実行されるすべてのジョブがグラフに表示されます。

![header]({{ site.baseurl }}/assets/img/docs/insights-1.0.gif)

この画面では、ビルドに関する以下のデータを確認できます。

- CircleCI でビルドされているすべてのリポジトリのリアルタイム ステータス
- 平均キュー時間
- 平均ビルド時間
- ブランチ数
- 最終ビルド時刻

### プロジェクトのインサイト
{: #project-insights }

メイン ナビゲーション上の [Insights (インサイト)] アイコンをクリックしてから、リポジトリ名をクリックすると、プロジェクト別のインサイトのページにアクセスできます。

プロジェクト別のインサイトのページでは、選択したブランチにおけるビルド ステータスおよびビルド パフォーマンスのグラフを確認できます。

![header]({{ site.baseurl }}/assets/img/docs/insights-current-build.png)

- **[Build Status (ビルド ステータス)]:** デフォルト ブランチの直近 50 件のビルドが表示されます。 右上隅でブランチを選択すると、そのブランチに関する 100 件を超えるビルド・ジョブのステータスを確認できます。

- **[Build Performance (ビルド パフォーマンス)]:** このグラフには、最大 90 日前までのビルド・ジョブのデータが日別に集約され、各日の平均値がプロットされます。 任意のブランチをクリックして、リポジトリのパフォーマンスをモニタリングできます。


## 関連項目
{: #see-also }

失敗が多いテストのインサイトを得る方法については、「[テスト メタデータの収集]({{ site.baseurl }}/2.0/collect-test-data/)」を参照してください。
