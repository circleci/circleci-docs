---
layout: classic-docs
title: クレジットの使用
categories:
  - how-to
description: CircleCI クレジットベースプランシステムについて
version:
  - Cloud
---

このドキュメントでは、 CircleCI のクレジットに関する利用可能なリソースを見つける方法について説明します。 If you are on the legacy CircleCI Container-based plan, you may want to consider consulting the document on [using containers]({{site.baseurl}}/containers). コンテナベースからクレジットベースへの切り替えをご希望のお客様は、[サポートチケットを作成して](https://support.circleci.com/hc/en-us/requests/new)お問い合わせください。

## 概要
{: #overview }

クレジットは CircleCI の Free プラン、Performance プラン、Scale プラン、Server プランで使用されます。 各プランで主要な CI/CD 機能を提供しており、一部のプランではニーズに応じたカスタマイズオプションもご利用いただけます。

チームに最適なプランを検討する際は、以下のような要素を考慮してください。

- チームのユーザー数
- 必要なサポートのレベル (無料の Community サポート、Standard サポート、Premium サポート)
- 複数のマシンタイプやリソースクラスの利用の要否
- セルフホストランナー数の制限の有無

You can view the [Plan Overview]({{site.baseurl}}/plan-overview) page for more information, or if you would like more details on what features are available per plan, view the individual plan pages:
- [Free プラン]({{site.baseurl}}/plan-free)
- [Performance プラン]({{site.baseurl}}/plan-performance)
- [Scale プラン]({{site.baseurl}}/plan-scale)
- [Server  プラン]({{site.baseurl}}/plan-server)

マシンタイプ別、リソースクラス別の消費クレジットについては、[料金プラン](https://circleci.com/pricing/)のページもご確認ください。

## クレジット使用状況の管理
{: #managing-credit-usage }

ネットワークとストレージの使用状況を適切に管理することで、毎月のクレジット使用量を削減することができます。 If you would like to find out more about managing network and storage usage, please see the [Persisting Data]({{site.baseurl}}/persist-data/) page.

## オープンソースプロジェクトでのクレジット使用
{: #open-source-credit-usage }

Free プランをご利用の組織には、毎月 400,000 クレジットが無料で付与され、Linux コンピューティングでのオープンソースプロジェクトのビルドに利用できます。 この特典を受けるには、Free プランを利用し、リポジトリをパブリックにする必要があります。  オープンソース のクレジットの利用可能量や制限は、UI 画面上では確認できません。

Free プランで macOS でビルドを行っている組織にも、毎月 25,000 クレジットが無料で付与され、macOS オープンソース プロジェクトのビルドに利用できます。 ご希望の方は、billing@circleci.com までお問い合わせください。

## ビルドが「Queued」または「Preparing」の場合、料金は請求されますか？
{: #troubleshooting }

請求されません。 ジョブが  "queued(キューに入っている)" と通知された場合、ジョブが**プラン**や**同時実行**の制限のために待機状態になっていることを意味しています。 ジョブが "preparing (準備中)" の場合は、CircleCI がセットアップを行っているか、ジョブの実行を _開始_ しようとしているため間もなく実行される可能性があります。

ジョブが Docker Executor を使用していて、そのジョブがかなりの時間 "preparing" である場合は、より新しい Docker イメージを使用することで遅延を減らすことができます。 See [Building Docker Images]({{site.baseurl}}/building-docker-images/) for more information.

## ご意見・ご質問
{: #questions-and-comments }

Consider reading our section on Billing in our [FAQ]({{site.baseurl}}/faq/#billing). 解決しない場合は、お気軽に[サポート チケットを作成](https://support.circleci.com/hc/ja/requests/new)してお問い合わせください。
