---
layout: classic-docs
title: "インサイトの使用"
short-title: "インサイトの使用"
description: "リポジトリのステータスおよびテスト パフォーマンスを表示する方法"
categories:
  - configuring-jobs
order: 41
version:
  - Server v2.x
---

<div class="alert alert-warning" role="alert">
  <p><span style="font-size: 115%; font-weight: bold;">⚠️ Heads up!</span></p>
  <span> This document refers to using the Insights page on the CircleCI <i>Server</i> product. If you are interested in accessing insights and analytics for your usage, please consider exploring the <a href="https://circleci.com/docs/api/v2/#circleci-api-insights">Insights endpoints</a> of the CircleCI V2 API.</span>
</div>

## 概要

Click the Insights menu item in the CircleCI app to view a dashboard showing the health of all repositories you are following. Median build time, median queue time, last build time, success rate, and parallelism appear for your default branch. **Note:** If you have configured Workflows, graphs display all of the jobs that are being executed for your default branch.

![header]({{ site.baseurl }}/assets/img/docs/insights-1.0.gif)

The image illustrates the following data about your builds:

- CircleCI でビルドされているすべてのリポジトリのリアルタイム ステータス

- 平均キュー時間

- 平均ビルド時間

- ブランチ数

- 最終ビルド時刻

## プロジェクトのインサイト

Click the Insights icon on the main navigation, then click your repo name to access per-project insights.

The per-project insights page gives you access to the build status and build performance graphs for a selected branch.

![header]({{ site.baseurl }}/assets/img/docs/insights-current-build.png)

- **ビルド ステータス:** デフォルト ブランチに関する直近 50 件のビルドが表示されます。 右上隅でブランチを選択すると、そのブランチに関する 100 件を超えるビルド・ジョブのステータスを確認できます。

- **ビルド パフォーマンス:** このグラフには、最大 90 日前までのビルド・ジョブのデータが日別に集約され、各日の平均値がプロットされています。 任意のブランチをクリックして、リポジトリのパフォーマンスをモニタリングできます。

## 関連項目

Refer to the [Collecting Test Metadata]({{ site.baseurl }}/2.0/collect-test-data/) document for instructions to configure insights into your most failed tests.

## Sumo Logic とのインテグレーション

Sumo Logic users may track and visualize analytical data across all of their jobs on CircleCI. To do so, use the Sumo Logic Orb and Sumo Logic app integration from the Sumo Logic partner integrations site.

### Sumo Logic の CircleCI ダッシュボード

![header]({{ site.baseurl }}/assets/img/docs/CircleCI_SumoLogic_Dashboard.png)

Included panels:

- 合計ジョブ数
- 合計成功ジョブ数
- 合計失敗ジョブ数
- ジョブの結果
- ジョブ別の平均実行時間 (秒単位)
- プロジェクト別のジョブ数
- 最新のジョブ (直近 10 個)
- 時間のかかった失敗ジョブ上位 10 個 (秒単位)
- 時間のかかった成功ジョブ上位 10 個 (秒単位)

Install the CircleCI dashboard by using the App Catalog from the dashboard home page.

![header]({{ site.baseurl }}/assets/img/docs/sumologic_app_catalog.png)

This dashboard receives data through the CircleCI Sumo Logic orb which must be included in your projects to be tracked.

### Sumo Logic Orb

Find the latest version of the Sumo Logic orb on the [Orb Registry](https://circleci.com/orbs/registry/orb/circleci/sumologic).

#### 1. Sumo Logic Orb をインポートする

Add the Sumo Logic orb to your project by including the top-level `orbs` key and import `circleci/sumologic@x.y.z` as follows, replacing `x.y.z` with the latest version number at the link above.

```yaml
orbs:
  sumologic: circleci/sumologic@x.y.z
```

#### 2. ワークフローに *Workflow-Collector* を追加する

The `workflow-collector` job runs concurrently along side your workflow and sends analytics to Sumo Logic until all of the jobs in your workflow have completed.

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

You will need to create two *source collectors* on Sumo Logic which will return an HTTPS URL. Your job data will be sent to this HTTPS URL.

You will need to create one called `circleci/job-collector` and another called `circleci/workflow-collector`.

To create the two source collectors:

1. ダッシュボードから **[Setup Wizard (セットアップ ウィザード)]** を選択します。
2. **[Set Up Streaming Data (ストリーミング データのセットアップ)]** を選択します。
3. 一番下までスクロールし、**[All Other Sources (他のすべてのソース)]** を選択します。
4. **[HTTPS Source (HTTPS ソース)]** を選択します。
5. `Source Category` に、前述した 2 つのうちのいずれかを入力します。
6. 結果として得られる URL を保存します。

#### 4. 環境変数を追加する

For each of the URLs produce in the previous step, create the corresponding environment variable.

Env vars:

- `JOB_HTTP_SOURCE`
- `WORKFLOW_HTTP_SOURCE`

**[How to add an environment variable to your project.]({{ site.baseurl }}/2.0/env-vars/#setting-an-environment-variable-in-a-project)**

This will link the orb with your Sumo Logic dashboard.

Your Sumo Logic dashboard will now begin to populate with data as each job runs on CircleCI.

## 関連項目

Refer to the [Orbs Introduction]({{ site.baseurl }}/2.0/orb-intro/) document to learn more about using and authoring orbs.