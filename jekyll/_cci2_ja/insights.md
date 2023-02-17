---
layout: classic-docs
title: "インサイトの使用"
short-title: "インサイトの使用"
description: "リポジトリのステータスおよびテスト パフォーマンスを表示する方法"
order: 41
contentTags:
  platform:
    - クラウド
    - Server v4.x
    - Server v3.x
    - Server v2.x
---

## 概要
{: #overview }

The CircleCI Insights dashboard provides an overview of the health and usage of your projects' build processes, including time-series and aggreggated data on credit usage, success rates, and pipeline duration.

This document describes how to access and use the Insights dashboard on CircleCI cloud and server.

## 使用方法
{: #usage }

CircleCI Web アプリケーションのサイドバーから、組織全体のインサイトにアクセスできます。

To access a specific project's Insights, view a pipeline's workflow and click the **Insights** button. Alternatively, you may access the Insights page by opening a pipeline's **Actions** menu while viewing the pipelines dashboard.

{:.tab.insight-access.Access_by_sidebar}
![CircleCI Web アプリのサイドばーからインサイトにアクセスする]({{ site.baseurl }}/assets/img/docs/screen_insights_access-3.png)

{:.tab.insight-access.Access_by_workflow}
![CircleCI Web アプリのワークフローからインサイトにアクセスする]({{ site.baseurl }}/assets/img/docs/screen_insights_access-2.png)

{:.tab.insight-access.Access_by_pipeline}
![CircleCI Web アプリのパイプラインからインサイトにアクセスする]({{ site.baseurl }}/assets/img/docs/screen_insights_access-1.png)

### ワークフローの概要
{: #workflow-overview }

The Insights workflow overview provides metrics plotted over time for all branches, or a select branch, of a particular project workflow. The following data is charted under the workflow overview:

- Status (success versus failed) of up to 100 most recent workflow runs
- ワークフローの成功率
- Workflow duration (50th versus 95th percentile)
- ワークフローのクレジット使用量

Data is not real-time and there may be up to a 24 hour delay.
{: class="alert alert-info"}

The Insights dashboard is not a real time financial reporting tool and should not be used for credit reporting. The most up-to-date credit information can be found in your organization's Plan Overview.
{: class="alert alert-info"}

### ジョブの概要
{: #job-overview }

Click the **Jobs** tab next to **Overview** to view the following cumulative data on a per-job basis:

- 合計クレジット使用量
- Duration (95th percentile)
- 合計実行回数
- 成功率
- Compute usage (average and max for CPU and RAM)

---

## CircleCI Server v2.19.x のインサイト
{: #circleci-server-v219x-insights }

以下のセクションは、CircleCI Server v2.19.x のインストール時の [Insights (インサイト)] ページの使用法に関するものです。
{: class="alert alert-warning"}

### 概要
プロジェクトがオープン ソースであるか、フォーク可能としてコントリビューターのプル リクエスト (PR) を受け付ける場合は、次のことに注意してください。

CircleCI アプリケーションで [Insights (インサイト)] メニュー項目をクリックすると、フォローしているすべてのリポジトリのヘルス状態を示すダッシュボードが表示されます。 ここでは、デフォルト ブランチのビルド時間の中央値、キュー時間の中央値、最終ビルド時刻、成功率、並列実行数を確認できます。 Note that if you have configured Workflows, graphs display all of the jobs that are being executed for your default branch.

![header](/docs/assets/img/docs/insights-1.0.gif)

この画面では、ビルドに関する以下のデータを確認できます。

- CircleCI でビルドされているすべてのリポジトリのリアルタイム ステータス
- キュー時間の中央値
- ビルド時間の中央値
- ブランチ数
- 最終ビルド時刻

### プロジェクトのインサイト
{: #project-insights }

メイン ナビゲーション上の [Insights (インサイト)] アイコンをクリックしてから、リポジトリ名をクリックすると、プロジェクト別のインサイトのページにアクセスできます。

プロジェクト別のインサイトのページでは、選択したブランチにおけるビルド ステータスおよびビルド パフォーマンスのグラフを確認できます。

![header](/docs/assets/img/docs/insights-current-build.png)

- **[Build Status (ビルド ステータス)]:** デフォルト ブランチの直近 50 件のビルドが表示されます。 右上隅でブランチを選択すると、そのブランチに関する 100 件を超えるビルド・ジョブのステータスを確認できます。

- **[Build Performance (ビルド パフォーマンス)]:** このグラフには、最大 90 日前までのビルド・ジョブのデータが日別に集約され、各日の平均値がプロットされます。 任意のブランチをクリックして、リポジトリのパフォーマンスをモニタリングできます。


## 関連項目
{: #see-also }

Refer to the [Collect Test Data](/docs/collect-test-data/) document for guidance on configuring Insights into your most failed tests.

## さらに詳しく
{: #learn-more }
Take the [Insights course](https://academy.circleci.com/insights-course?access_code=public-2021) with CircleCI Academy to learn more.
