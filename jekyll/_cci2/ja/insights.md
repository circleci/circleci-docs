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


The CircleCI Insights dashboard provides an overview of the health and usage of your repository build processes, allowing users to make better engineering decisions. _Insights_ provides time-series data overviews of credit usage, success rates, pipeline duration, and other pertinent information.

This document describes how to access and use the Insights dashboard on CircleCI Cloud and Server.

## 使用法 (クラウド版 CircleCI)
{: #usage-circleci-cloud }

Insights across your organization can be accessed from the sidebar of the CircleCI web application.

To access a specific project's insights, view a pipeline's workflow and click the **Insights** button. Alternatively, you may access the Insights page by clicking on the **actions** button while viewing the _pipelines dashboard_.

{:.tab.insight-access.Access_by_sidebar}
![]({{ site.baseurl }}/assets/img/docs/screen_insights_access-3.png)

{:.tab.insight-access.Access_by_pipeline}
![]({{ site.baseurl }}/assets/img/docs/screen_insights_access-1.png)

{:.tab.insight-access.Access_by_workflow}
![]({{ site.baseurl }}/assets/img/docs/screen_insights_access-2.png)


### Workflow overview
{: #workflow-overview }

The Insights dashboard provides workflow details plotted over time. **Please note that the data is not real time and there may be up to a 24 hour delay**. You may also filter by different workflows at the top of the page. The following data is charted under the workflow overview:

- ワークフローの合計実行回数
- ワークフローの成功率
- ワークフローの実行時間
- ワークフローのクレジット使用量*

### Job overview
{: #job-overview }

Switch to the **Job** tab to view cumulative time-series data on a per-job basis:

- 合計クレジット使用量*
- 実行時間 (95 パーセンタイル)
- 合計実行回数
- 成功率


<small>
<i> * インサイト ダッシュボードはリアルタイム形式の財務報告ツールではありません。本ダッシュボードをクレジット使用量のレポートには使用しないでください。 最新のクレジット使用量の情報については、組織の [Plan Overview (プラン概要)] をご覧ください。</i>
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

Click the Insights menu item in the CircleCI app to view a dashboard showing the health of all repositories you are following. Median build time, median queue time, last build time, success rate, and parallelism appear for your default branch. **Note:** If you have configured Workflows, graphs display all of the jobs that are being executed for your default branch.

![header]({{ site.baseurl }}/assets/img/docs/insights-1.0.gif)

The image illustrates the following data about your builds:

- CircleCI でビルドされているすべてのリポジトリのリアルタイム ステータス
- 平均キュー時間
- 平均ビルド時間
- ブランチ数
- 最終ビルド時刻

### Project insights
{: #project-insights }

Click the Insights icon on the main navigation, then click your repo name to access per-project insights.

The per-project insights page gives you access to the build status and build performance graphs for a selected branch.

![header]({{ site.baseurl }}/assets/img/docs/insights-current-build.png)

- **Build Status:** The Insights dashboard shows the last 50 builds for your default branch. 右上隅でブランチを選択すると、そのブランチに関する 100 件を超えるビルド・ジョブのステータスを確認できます。

- **Build Performance:** The Build Performance graph aggregates your build/job data for a particular day and plots the median for that day going back as far as 90 days. 任意のブランチをクリックして、リポジトリのパフォーマンスをモニタリングできます。


## See also
{: #see-also }

Refer to the [Collecting Test Metadata]({{ site.baseurl }}/2.0/collect-test-data/) document for instructions to configure insights into your most failed tests.
