---
layout: classic-docs
title: "テスト インサイト"
short-title: "テスト インサイトの使用"
description: "テスト インサイトの使用"
version:
  - Cloud
---

## 概要
{: #overview }

CircleCI テスト インサイトを使用すると、最近の実行におけるテストのパフォーマンスを分析して、テストの最適化の余地を把握することができます。 テスト インサイトを確認するには、ワークフローの **[Insights (インサイト)]** ページで **[Tests (テスト)]** タブを選択します。

次のテスト インサイトが表示されます。

### パフォーマンスの概要
{: #performance-summary }


![]({{ site.baseurl }}/assets/img/docs/insights-test-performance.png)

サマリーグラフには、最近 10 回のワークフロー実行のテスト パフォーマンスが表示されます。 各棒グラフにカーソルを合わせると、テストの回数、スキップされたテストの数、テストの成功率を確認できます。

### [Top 10 most failed tests (失敗の多いテスト上位 10 個)]
{: #top-10-most-failed-tests }

![]({{ site.baseurl }}/assets/img/docs/insights-test-most-failed.png)

最近のパイプライン実行のうち、成功率が低いテスト上位 10 個を確認できます。 この表には、テストの名前、関連するジョブ、実行時間、成功率が表示されます。


### [Top 10 slowest tests (実行速度の遅いテスト上位 10 個)]
{: #top-10-slowest-tests }

![]({{ site.baseurl }}/assets/img/docs/insights-test-slowest.png)

最近のパイプライン実行のうち、実行速度が遅いテスト上位 10 個を確認できます。 この表には、テストの名前、関連するジョブ、実行時間、成功率が表示されます。

