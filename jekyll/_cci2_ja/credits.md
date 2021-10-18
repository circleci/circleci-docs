---
layout: classic-docs
title: クレジットの使用
categories:
  - how-to
description: CircleCI のクレジットの使用方法
version:
  - Cloud
---

このドキュメントでは、CircleCI でのクレジット使用の基本事項について説明します。 If you are on the legacy CircleCI Container-based plan you may want to consider consulting the document on [using containers]({{site.baseurl}}/2.0/containers). コンテナ使用からクレジット使用への切り替えを希望される場合は、[サポート チケットを作成](https://support.circleci.com/hc/ja/requests/new)してお問い合わせください。

## 概要
{: #overview }

CircleCI のクレジットベースの従量課金制プランでは、チームの CI ソリューションを柔軟にカスタマイズおよびスケールでき、使用量に応じた料金のみが請求されます。 クレジットは分単位で消費され、レートは選択したビルドの構成によって異なります。

チームに最適なプランを検討するときには、以下のような要素を考慮する必要があります。

- チームのユーザー数
- 必要なサポートのレベル (コミュニティによるサポート、標準サポート、プレミアム サポート)
- 複数のマシン タイプへのアクセスの要否
- Docker レイヤー キャッシュ、ビルドの同時処理、ビルド履歴といった機能の要否

例として、Performance プランでクレジットを使用する場合を考えてみましょう。 この例では、チームが複数のグループに分かれ、それぞれ異なるプロジェクトを進めています。 大規模なプロジェクトもあれば、CI の構成で割り当てるリソースが少なくて済む小規模なプロジェクトもあります。 クレジットを使用すると、リソースを最大化する必要があるマシンと利用時間をピンポイントで指定できます。

For example, your team might use a `large` `resource_class` (4 vCPUs and 8gb of memory) and make use of more credits/minute to speed up a build for a bigger project, while only using the `small` `resource_class` (1 vCPU, 2gb Memory) with less credits/minute for a smaller project that may not ship code as frequently, or where build time is inconsequential.

ご希望のプランを設定するには、CircleCI の Web アプリケーションで [`Settings`] > [`Plan Overview`] を開き、 お客様のニーズに最適なプランを選択します。

## クレジットベース プランの設定
{: #configuring-your-credit-plan }

To set up your desired plan, go to `Settings > Plan Overview` in the CircleCI web application. From there, select the plan that best fits your needs.

## Free プラン
{: #free-plan }

As with the CircleCI legacy Container plan, CircleCI also supports a free-tier with the usage-based plan. Free プランでも CircleCI の主要機能の多くをご利用いただけます。

- Orb の使用
- ワークスペース
- 依存関係のキャッシュ
- Windows/Linux でのビルド

The free usage-based plan offers a set amount of build credits across medium-type machines per week (which offers 2 CPUs, 4gb of memory). With this combination, a small number of credits are charged per minute and there is no limit on user seats. Refer to the [Pricing](https://circleci.com/pricing/) page for more information on credit amounts.

## Performance プラン
{: #performance-plan }

Performance プランにアップグレードすると、Free プランの内容に加えて複数のメリットが提供されます。

- すべてのマシン サイズの Docker/Linux ベース マシンへのアクセス
- Access to medium sized MacOS machines
- Scalable user seat count
- Docker レイヤー キャッシュへのアクセス
- キューイングなし
- サポート

## オープンソース プロジェクトでのクレジット使用
{: #open-source-credit-usage }

Organizations on our Free plan receive a set amount of free credits per month for Linux open source builds. この特典を受け取るには、Free プランを利用し、リポジトリをパブリックにする必要があります。

If you build on macOS, we also offer organizations on our Free plan a number of free credits every month to use on macOS open source builds. ご希望の方は、billing@circleci.com までお問い合わせください。

## Docker レイヤー キャッシュ
{: #docker-layer-caching }

You are able to use credits per run job for Docker Layer Caching (DLC). DLCはPerformanceプランでのみ利用可能です。 DLC の詳細については、[こちらのドキュメント]({{site.baseurl}}/ja/2.0/docker-layer-caching)をご覧ください。

## トラブルシューティング
{: #troubleshooting }

### Am I charged if my build is "queued" or "preparing"?
{: #am-i-charged-if-my-build-is-queued-or-preparing }

No. If you are notified that a job is "queued", it indicates that your job is waiting due to a **plan** or **concurrency** limit. If your job indicates that it is "preparing", it means that CircleCI is setting up or _dispatching_ your job so that it may run.

If you find that jobs are "preparing" for quite some time, you may be able to reduce it if your jobs use the docker executor; try using more recent docker images to decrease preparation time.

## Questions and comments
{: #questions-and-comments }

ご不明な点がございましたら、まずは「よくあるご質問」の「[料金・支払]({{site.baseurl}}/ja/2.0/faq/#料金支払い)」セクションをご確認ください。 解決しない場合は、お気軽に[サポート チケットを作成](https://support.circleci.com/hc/ja/requests/new)してお問い合わせください。
