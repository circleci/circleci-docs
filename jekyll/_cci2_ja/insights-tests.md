---
layout: classic-docs
title: テストインサイト
short-title: テストインサイト
description: Analyze your test performance using test Insights.
contentTags:
  platform:
    - クラウド
---

## 概要
{: #overview }

Using CircleCI test Insights, you are able to analyze your test performance within the most recent executions and identify opportunities for test optimization. テストインサイトを使用するには、**ワークフローのインサイト**のページで **Tests** タブを選択します。

下記ではご利用いただけるテストインサイト機能について説明します。

### Performance summary
{: #performance-summary }

サマリーグラフには、直近 100 回のワークフロー実行のテストパフォーマンスが表示されます。 以下の項目が確認できます。

- Average test per run
- Number of all flaky tests detected
- Failure counts
- Slow run times in test suite

![パフォーマンスサマリーの例]({{site.baseurl}}/assets/img/docs/test-insights-performance-summary.png)

### Most recent runs
{: #most-recent-runs }

最新のランチャートには、直近 100 回のテストスイートの実行が表示されます。 各棒グラフにカーソルを合わせると、以下の項目が確認できます。

- Test count
- Skipped tests
- Success rate of tests

![直近の実行例]({{site.baseurl}}/assets/img/docs/test-insights-recent-runs.png)

### Flaky tests
{: #flaky-tests }

結果が不安定なテストとは、非確定的に失敗するテストのことで、リポジトリの外部の状態によって成功したり失敗したりします。 結果として、プロジェクトのビルド状態に不確実性が生じます。

Test Insights detect flaky tests by identifying tests that failed and passed on the same commit in a 14-day window. 確定的なテストは、リポジトリの状態に依存し、再実行においても同じ動作を行います。 更に、このようなテストは、 CircleCI アプリケーション全体で「不安定」というラベルが付けられているため、簡単に特定し、修正できます。

![Flakey tests Insights example]({{site.baseurl}}/assets/img/docs/test-insights-flaky.png)

### Most failed tests
{: #most-failed-tests }

直近のパイプライン実行のうち、成功率が低いテスト上位 100 個を確認できます。 以下の項目が表示されます。

- Test name
- Associated job
- Run time
- 成功率

![失敗の多いテストの例]({{site.baseurl}}/assets/img/docs/test-insights-failed.png)

### Slowest tests
{: #slowest-tests }

直近のパイプライン実行のうち、実行速度が遅いテスト上位 100 個を確認できます。 以下の項目が表示されます。

- Test name
- Associated job
- Run time
- 成功率

![実行速度の遅いテストの例]({{site.baseurl}}/assets/img/docs/test-insights-slowest.png)
