---
layout: classic-docs
title: クレジットの使用
categories:
  - how-to
description: CircleCI のクレジットの使用方法
version:
  - Cloud
---

このドキュメントでは、CircleCI でのクレジット使用の基本事項について説明します。 CircleCI の従来のコンテナベースのプランを利用している場合は、「[コンテナを使用する]({{site.baseurl}}/ja/2.0/containers)」をご覧ください。 コンテナ使用からクレジット使用への切り替えを希望される場合は、[サポート チケットを作成](https://support.circleci.com/hc/ja/requests/new)してお問い合わせください。

## 概要
{: #overview }

CircleCI のクレジットベースの従量課金制プランでは、チームの CI ソリューションを柔軟にカスタマイズおよびスケールでき、使用量に応じた料金のみが請求されます。 クレジットは分単位で消費され、レートは選択したビルドの構成によって異なります。

チームに最適なプランを検討するときには、以下のような要素を考慮する必要があります。

- チームのユーザー数
- 必要なサポートのレベル (コミュニティによるサポート、標準サポート、プレミアム サポート)
- 複数のマシン タイプへのアクセスの要否
- Docker レイヤー キャッシュ、ビルドの同時処理、ビルド履歴といった機能の要否

例として、Performance プランでクレジットを使用する場合を考えてみましょう。 Performance プランでは以下を利用できます。 この例では、チームが複数のグループに分かれ、それぞれ異なるプロジェクトを進めています。 大規模なプロジェクトもあれば、CI の構成で割り当てるリソースが少なくて済む小規模なプロジェクトもあります。 With credits, it is possible to specify exactly where and when you need to maximize machine resources.

たとえば、大規模なプロジェクトのビルドを高速化するためには `large` `resource_class` (vCPU 4 基、RAM 8 GB、20 クレジット/分) を使用できます。 一方、小規模なプロジェクトでコードのリリース頻度が低い場合や、ビルド時間を重視しない場合は `small` `resource_class` (vCPU 1 基、RAM 2 GB、5 クレジット/分) を使用できます。

ご希望のプランを設定するには、CircleCI の Web アプリケーションで [`Settings`] > [`Plan Overview`] を開き、 お客様のニーズに最適なプランを選択します。

## クレジットベース プランの設定
{: #configuring-your-credit-plan }

ご希望のプランを設定するには、CircleCI の Web アプリケーションで [`Settings`] > [`Plan Overview`] を開き、 お客様のニーズに最適なプランを選択します。

## Free プラン
{: #free-plan }

従来の CircleCI のコンテナベース プランと同様に、従量課金制でも無料のプランをご用意しています。 By using the Free plan, you can take advantage of a large number of premium features that will allow your team to be more productive, efficient and fast.

従量課金制の Free プランでは、週に 2,500 クレジットが提供され、Medium タイプのマシン (vCPU 2 基、RAM 4 GB) で利用することができます。 With this combination, credits are used at a rate of 10 credits/minute and there is no limit on user seats. Refer to the [Pricing](https://circleci.com/pricing/) page for more information on credit amounts.

The table below lists some of the features you can use on the Free plan.

| おすすめ情報                                       | 説明                                                                                                                                                |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| UNLIMITED USERS                              | There is no limit to the number of users who can build and develop on CircleCI. Collaborate with different teams and groups on multiple projects. |
| EXPANDED ARRAY OF AVAILABLE RESOURCE CLASSES | You have access to an expanded array of Docker, Linux, and Windows resource classes (macOS coming soon).                                          |
| CONCURRENCY AND TEST SPLITTING               | Faster builds and test splitting equal increased productivity and speed when building on CircleCI.                                                |
| SELF HOSTED RUNNERS                          | The number of runners you can use has been increased providing you additional flexibility when working on CircleCI.                               |
| FLAKY TEST DETECTION                         | Advanced insights are available to help you troubleshoot failed and flaky tests.                                                                  |
| UNLIMITED PRIVATE ORBS                       | There is no limit to the number of private orbs you can use to securely share across teams and groups.                                            |
| DOCKER LAYER CACHING                         | Efficiency features have been specifically designed to take advantage of Docker performance so you can build faster.                              |
{: class="table table-striped"}

### ユーザー数制限なし
{: #unlimited-users }

When you use the Free plan, you have an unlimited number of users that can build and develop on CircleCI. This allows you to collaborate with more teams and groups within your organization, which can increase speed, productivity, and efficiency.

### Expansive array of available resource classes
{: #expansive-array-of-available-resource-classes }

When using the free plan, you have the widest array of resource classes on Docker, Linux, Windows, and macOS (coming soon) available to use. This flexibility helps ensure that you choose the right compute resources.

For more information about these resources, please refer to the the [Executors and Images](https://circleci.com/docs/2.0/executor-intro/) page.

### Concurrency and test splitting
{: #concurrency-and-test-splitting }

The ability to run multiple tests at the same time (concurrently) is a powerful feature that allows you to decrease your build times and shorten feedback cycles by running jobs concurrently with workflows.

For more information about how to utilize test splitting, refer to the [Running Tests In Parallel](https://circleci.com/docs/2.0/parallelism-faster-jobs/#using-test-splitting-with-python-django-tests) page.

### Self hosted runners
{: #self-hosted-runners }

CircleCI runners allow you to use your own infrastructure for running jobs, providing more granular control of your own environment and flexibility in building and testing on a wide variety of architectures.

For more information about using CircleCI runners, please see the [CircleCI Runner Overview](https://circleci.com/docs/2.0/runner-overview/) page.

### 結果の不安定なテストの検出
{: #flaky-test-detection }

The average failed workflow wastes approximately 30 minutes. Detecting flaky tests can save you significant amounts of time in your builds and workflows.

For more detailed information about flaky tests, refer to the [Test Insights](https://circleci.com/docs/2.0/insights-tests/#flaky-tests) page.

### プライベート Orb を無制限に利用可能
{: #unlimited-private-orbs }

CircleCI orbs are shareable configuration packages that enable developers to create private, standardardized configurations for use across an organization by different teams.

For more information on private orbs, refer to the [Orbs Introduction](https://circleci.com/docs/2.0/orb-intro/#private-orbs-vs-public-orbs) page.

### Docker レイヤーキャッシュ
{: #docker-layer-caching }

Reducing the time it takes to build a Docker image is an important consideration for developers who consistently use these images in their workflows. Consider using Docker Layer Caching (DLC) if building Docker images is a regular part of your CI/CD process. DLC saves image layers created within your jobs, rather than impact the actual container used to run your job.

For more information about Docker Layer Caching, please refer to the [Enabling Docker Layer Caching](https://circleci.com/docs/2.0/docker-layer-caching/) page.

## Performance プラン
{: #performance-plan }

Performance プランにアップグレードすると、Free プランの内容に加えて複数のメリットが提供されます。

- すべてのマシン サイズの Docker/Linux ベース マシンへのアクセス
- Medium サイズの macOS マシンへのアクセス
- 無制限のユーザーシート数
- Docker レイヤー キャッシュへのアクセス
- キューイングなし
- サポート

## オープンソース プロジェクトでのクレジット使用
{: #open-source-credit-usage }

Free プランの組織には、毎月 400,000 クレジットが無料で付与され、Linux コンピューティングでのオープンソース プロジェクトのビルドに利用できます。 この特典を受け取るには、Free プランを利用し、リポジトリをパブリックにする必要があります。  Open-source credit availability and limits will not be visible in the UI.

CircleCI の Free プランを使用して macOS でビルドを行っている組織にも、毎月 25,000 クレジットが無料で付与され、macOS オープンソース プロジェクトのビルドに利用できます。 ご希望の方は、billing@circleci.com までお問い合わせください。

## Docker レイヤー キャッシュ
{: #docker-layer-caching }

Docker レイヤー キャッシュ (DLC) は 1 回のジョブ実行につき 200 クレジットでご利用いただけます。 DLCはPerformanceプランでのみ利用可能です。 DLC の詳細については、[こちらのドキュメント]({{site.baseurl}}/2.0/docker-layer-caching)をご覧ください。

## トラブルシューティング
{: #troubleshooting }

### Am I charged if my build is "queued" or "preparing"?
{: #am-i-charged-if-my-build-is-queued-or-preparing }

はい。 If you are notified that a job is "queued", it indicates that your job is waiting due to a **plan** or **concurrency** limit. If your job indicates that it is "preparing", it means that CircleCI is setting up or _dispatching_ your job so that it may run.

If you find that jobs are "preparing" for quite some time, you may be able to reduce it if your jobs use the docker executor; try using more recent docker images to decrease preparation time.

## Questions and comments
{: #questions-and-comments }

ご不明な点がございましたら、まずは「よくあるご質問」の「[料金・支払]({{site.baseurl}}/2.0/faq/#billing)」セクションをご確認ください。 解決しない場合は、お気軽に[サポート チケットを作成](https://support.circleci.com/hc/ja/requests/new)してお問い合わせください。
