---
layout: classic-docs
title: クレジットの使用
categories:
  - how-to
description: CircleCI のクレジットの使用方法
version:
  - Cloud
---

このドキュメントでは、CircleCI でのクレジット使用の基本事項について説明します。 CircleCI の従来のコンテナベースのプランを利用している場合は、「[コンテナを使用する]({{site.baseurl}}/2.0/containers)」をご覧ください。 コンテナ使用からクレジット使用への切り替えを希望される場合は、[サポート チケットを作成](https://support.circleci.com/hc/ja/requests/new)してお問い合わせください。

## 概要
{: #overview }

The CircleCI credit-based usage plans enable you to only pay for what you use, while also providing flexibility in customizing and scaling your team's CI solution. Credits are consumed by the second at varying rates according to what build configuration you use.

The right plan for you and your team will depend on several factors:

- チームのユーザー数
- 必要なサポートのレベル (コミュニティによるサポート、標準サポート、プレミアム サポート)
- 複数のマシン タイプへのアクセスの要否
- Docker レイヤー キャッシュ、ビルドの同時処理、ビルド履歴といった機能の要否

Let's look at how a Performance plan might use credits. With the Performance plan you have:

- At least two credit blocks (at 25,000 credits per user)
- A variety of Docker/Linux machine-types (Small, Medium, Medium+, Large, or X-Large)
- The MacOS machine type
- The Windows machine type

In this example, your team is divided into several groups working on different projects; some projects are larger while others are smaller and need less resources from a CI configuration. With credits it's possible to specify exactly where and when you need to maximize machine resources. For example, your team might use a `large` `resource_class` (with 4 vCPUs and 8gb of memory at a rate of 20 credits/minute) to speed up a build for a bigger project, while only using the `small` `resource_class` (1 vCPU, 2gb Memory, 5 credits/minute) for a smaller project that may not ship code as frequently, or where build time is inconsequential.

Consider taking a moment to look at the CircleCI [Pricing](https://circleci.com/pricing/) page to learn about what each CircleCI plan offers and how credits are distributed across different machine types.

## Configuring your credit plan
{: #configuring-your-credit-plan }

To set up your desired plan, go to `Settings > Plan Overview` in the CircleCI web application. From there, select the plan that best fits your needs.

## Free plan
{: #free-plan }

As with the CircleCI legacy container plan, CircleCI also supports a free-tier with the usage-based plan. You can still make use of many key features offered by CircleCI:

- Orbs の使用
- ワークスペース
- 依存関係のキャッシュ
- Windows/Linux でのビルド

The free usage-based plan offers 2,500 build credits across medium-type machines per week (which offers 2 CPUs, 4gb of memory.) With this combination, credits are used at a rate of 10 credits/minute and there is no limit on user seats.

## Performance plan
{: #performance-plan }

Upgrading to a performance plan offers several improvements over the free plan:

- すべてのマシン サイズの Docker/Linux ベース マシンへのアクセス
- Medium サイズの macOS マシン (vCPU 4 基、RAM 8 GB、50 クレジット/分) へのアクセス
- Scalable user seat count (at 25,000 credits for the first three users and 25,000 credits for each additional user)
- Docker レイヤー キャッシュへのアクセス
- キューイングなし
- サポート

## Open source credit usage
{: #open-source-credit-usage }

Organizations on our free plan get 400,000 free credits per month for Linux open source builds. Using our free plan and keeping your repository public will enable this for you.

If you build on macOS, we also offer organizations on our free plan 25,000 free credits per month to use on macOS open source builds. For access to this, contact our team at billing@circleci.com.

## Docker layer caching
{: #docker-layer-caching }

Docker Layer Caching (DLC) is available for 200 credits per job run. DLC is only available on the Performance Plan. Read more about DLC in this [document]({{site.baseurl}}/2.0/docker-layer-caching).

## Troubleshooting
{: #troubleshooting }

### Am i charged if my build is "queued" or "preparing"?
{: #am-i-charged-if-my-build-is-queued-or-preparing }

No. If you are notified that a job is "queued", it indicates that your job is waiting due to a **plan** or **concurrency** limit. If your job indicates that it is "preparing", it means that CircleCI is setting up or _dispatching_ your job so that it may run.

If you find that jobs are "preparing" for quite some time, you may be able to reduce it if your jobs use the docker executor; try using more recent docker images to decrease preparation time.

## Questions and comments
{: #questions-and-comments }

Consider reading our section on Billing in our [FAQ]({{site.baseurl}}/2.0/faq/#billing). For any further questions, do not hesitate to open a [open a support ticket](https://support.circleci.com/hc/en-us/requests/new).
