---
layout: classic-docs
title: "インサイトの利用"
short-title: "インサイトの利用"
description: "リポジトリのステータスおよびテストパフォーマンスの表示"
categories:
  - configuring-jobs
order: 41
---

ここでは、以下のセクションに沿って、CircleCI でインサイトを作成および使用する方法について説明します。

## 概要

CircleCI アプリケーションで [Insights (インサイト)] メニュー項目をクリックすると、フォローしているすべてのリポジトリのヘルス状態に関するダッシュボードが表示されます。 ここでは、デフォルトのブランチについて平均ビルド時間、平均キュー時間、最終ビルド時刻、成功率、並列処理数を確認できます。 **メモ：**ワークフローを設定している場合、デフォルトのブランチに対して実行されるすべてのジョブがグラフに表示されます。

![ヘッダー]({{ site.baseurl }}/assets/img/docs/insights-1.0.gif)

この画面では、ビルドに関する以下のデータを確認できます。

- CircleCI にビルドされているすべてのリポジトリのリアルタイムステータス

- 平均キュー時間

- 平均ビルド時間

- ブランチ数

- 最終ビルド時刻

## プロジェクトのインサイト

メインナビゲーション上の [Insights (インサイト)] アイコンをクリックしてから、リポジトリ名をクリックすると、プロジェクト別のインサイトのページにアクセスできます。

プロジェクト別のインサイトのページでは、選択したブランチに関するビルドステータスおよびビルドパフォーマンスのグラフを確認できます。

![ヘッダー]({{ site.baseurl }}/assets/img/docs/insights-current-build.png)

- **ビルドステータス：**[Insights (インサイト)] ダッシュボードに、デフォルトブランチに関する直近 50件のビルドが表示されます。 右上隅で任意のブランチを選択すると、選択したブランチに関する 100件を超えるビルド・ジョブのステータスを表示できます。

- **ビルドパフォーマンス：**[Build Performance (ビルドパフォーマンス)] グラフには、最大 90日前までのビルド・ジョブのデータが日別に集約され、各日の平均値がプロットされています。 特定のブランチをクリックすると、リポジトリのパフォーマンスをモニタリングできます。

## 関連項目

失敗が多いテストに対してインサイトを設定したい場合は、「[テストメタデータの収集]({{ site.baseurl }}/ja/2.0/collect-test-data/)」を参照してください。

## Sumo Logic Integration

Sumo Logic users may track and visualize analytical data across all of their jobs on CircleCI. To do so, use the Sumo Logic Orb and Sumo Logic app integration from the Sumo Logic partner integrations site.

### The CircleCI Dashboard for Sumo Logic

![header]({{ site.baseurl }}/assets/img/docs/CircleCI_SumoLogic_Dashboard.png)

Included panels:

- Total Job
- Total Successful Jobs
- Total Failed Jobs
- Job Outcome
- Average Runtime in Seconds (by Job)
- Jobs By Projects
- Recent Jobs (latest 10)
- Top 10 Slowest Failed Jobs In Seconds
- Top 10 Slowest Successful Jobs In Seconds

Install the CircleCI dashboard by using the App Catalog from the dashboard home page.

![header]({{ site.baseurl }}/assets/img/docs/sumologic_app_catalog.png)

This dashboard receives data through the CircleCI Sumo Logic orb which must be included in your projects to be tracked.

### The Sumo Logic Orb

Find the latest version of the Sumo Logic orb on the [Orb Registry](https://circleci.com/orbs/registry/orb/circleci/sumologic).

#### 1. Import the Sumo Logic orb.

Add the Sumo Logic orb to your project by including the top-level `orbs` key and import `circleci/sumologic@x.y.z` as follows, replacing `x.y.z` with the latest version number at the link above.

```yaml
orbs:
  sumologic: circleci/sumologic@x.y.z
```

#### 2. Add *Workflow-Collector* to Workflow.

The `workflow-collector` job runs in parallel along side your workflow and sends analytics to Sumo Logic until all of the jobs in your workflow have completed.

```yaml
version: 2.1
workflows:
  build-test-and-deploy:
    jobs:
      - sumologic/workflow-collector # add this job to track workflow.
      - build
      - test:
          requires:
            - build
      - deploy:
          requires:
            - test
```

#### 3. Create two source collectors.

You will need to create two *source collectors* on Sumo Logic which will return an HTTPS URL. Your job data will be sent to this HTTPS URL.

You will need to create one called `circleci/job-collector` and another called `circleci/workflow-collector`.

To create the two source collectors:

1. From the dashboard select the **Setup Wizard**.
2. Select **Set Up Streaming Data**.
3. Scroll to the bottom and select **All Other Sources**.
4. Select **HTTPS Source**
5. For the `Source Category` enter one of the two mentioned above.
6. Save the resulting URL.

#### 4. Add environment variables.

For each of the URLs produce in the previous step, create the corresponding environment variable.

Env vars:

- `JOB_HTTP_SOURCE`
- `WORKFLOW_HTTP_SOURCE`

**[How to add an environment variable to your project.]({{ site.baseurl }}/2.0/env-vars/#setting-an-environment-variable-in-a-project)**

This will link the orb with your Sumo Logic dashboard.

Your Sumo Logic dashboard will now begin to populate with data as each job runs on CircleCI.

## See Also

Refer to the [Orbs Introduction]({{ site.baseurl }}/2.0/orb-intro/) document to learn more about using and authoring orbs.