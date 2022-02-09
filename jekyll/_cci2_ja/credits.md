---
layout: classic-docs
title: クレジットの使用
categories:
  - how-to
description: Learn about the CircleCI credits-based plan system
version:
  - Cloud
---

This document describes how to find the available resources regarding credits with CircleCI. If you are on the legacy CircleCI Container-based plan, you may want to consider consulting the document on [using containers]({{site.baseurl}}/2.0/containers). コンテナ使用からクレジット使用への切り替えを希望される場合は、[サポート チケットを作成](https://support.circleci.com/hc/ja/requests/new)してお問い合わせください。

## 概要
{: #overview }

Credits are used on CircleCI's Free, Performance, Scale, and Server plans. Each plan offers key CI/CD features, and some plans offer customization options depending on your needs.

チームに最適なプランを検討するときには、以下のような要素を考慮する必要があります。

- チームのユーザー数
- 必要なサポートのレベル (コミュニティによるサポート、標準サポート、プレミアム サポート)
- If you want access to different machine-types and resource classes
- If you want a limited or unlimited number of self-hosted runners

You can view the [Plan Overview]({{site.baseurl}}/2.0/plan-overview) page for more information, or if you would like more details on what features are available per plan, view the individual plan pages:
- [Free プラン]({{site.baseurl}}/2.0/plan-free)
- [Performance プラン]({{site.baseurl}}/2.0/plan-performance)
- [Scale プラン]({{site.baseurl}}/2.0/plan-scale)
- [Server Plan]({{site.baseurl}}/2.0/plan-server)

Consider taking a moment to look at the CircleCI [Pricing](https://circleci.com/pricing/) page to learn more about how credits are distributed across different machine types and resource classes.

## Managing credit usage
{: #managing-credit-usage }

Properly managing network and storage usage can potentially lower the amount of credits used per month. If you would like to find out more about managing network and storage usage, please see the [Persisting Data]({{site.baseurl}}/2.0/persist-data/) page.

## オープンソース プロジェクトでのクレジット使用
{: #open-source-credit-usage }

Free プランの組織には、毎月 400,000 クレジットが無料で付与され、Linux コンピューティングでのオープンソース プロジェクトのビルドに利用できます。 この特典を受け取るには、Free プランを利用し、リポジトリをパブリックにする必要があります。  オープンソース のクレジットの利用可能量や制限は、UI 画面上では確認できません。

CircleCI の Free プランを使用して macOS でビルドを行っている組織にも、毎月 25,000 クレジットが無料で付与され、macOS オープンソース プロジェクトのビルドに利用できます。 ご希望の方は、billing@circleci.com までお問い合わせください。

## Troubleshooting: Am I charged if my build is "queued" or "preparing"?
{: #troubleshooting }

はい。 If you are notified that a job is "queued", it indicates that your job is waiting due to a **plan** or **concurrency** limit. If your job indicates that it is "preparing", it means that CircleCI is setting up or _dispatching_ your job so that it may run.

If your jobs use the Docker executor and you find that they are "preparing" for quite some time, you may be able to reduce the delay by using more recent docker images. See [Building Docker Images]({{site.baseurl}}/2.0/building-docker-images/) for more information.

## ご意見・ご質問
{: #questions-and-comments }

ご不明な点がございましたら、まずは「よくあるご質問」の「[料金・支払]({{site.baseurl}}/2.0/faq/#billing)」セクションをご確認ください。 解決しない場合は、お気軽に[サポート チケットを作成](https://support.circleci.com/hc/ja/requests/new)してお問い合わせください。
