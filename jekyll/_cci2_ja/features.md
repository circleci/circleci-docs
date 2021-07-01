---
layout: classic-docs
title: "コア機能"
short-title: "コア機能"
description: "CircleCI 2.0 コア機能の入門ガイド"
categories:
  - getting-started
order: 1
version:
  - Cloud
  - Server v2.x
---

ここでは、CircleCI の機能について、開発者向け機能とオペレーター向け機能に分けて概要を説明します。

## 開発者向け機能
CircleCI が提供する機能のうち、開発者の方に関係する人気の機能を紹介します。

CircleCI が提供する機能のうち、オペレーターの皆様に関係する、問い合わせが多い機能を紹介します。

### ビルドへの SSH 接続
{: #ssh-into-builds }

多くの場合、問題を解決するには、[ジョブへの SSH 接続]({{ site.baseurl }}/ja/2.0/ssh-access-jobs/)を行い、ログ ファイル、実行中のプロセス、ディレクトリ パスなどを調べることが最善の方法です。 CircleCI 2.0 では、すべてのジョブに SSH を介してアクセスするオプションが用意されています。

Note: When CircleCI runs your pipeline, the [`run` ](https://circleci.com/docs/2.0/configuration-reference/#run) command executes shell commands in a _non-interactive_ shell. When SSH-ing into a build, you are using an _interactive_ shell (see the section on [Invocation](https://linux.die.net/man/1/bash) in the bash manual for more information). An interactive bash shell loads a series of startup files (such as `~/.bash_profile`), which may or may not change the outcome of SSH debugging process.

### 並列処理
CircleCI CLI を使用してテスト ファイルを分割するか、環境変数を使用して並列マシンを個別に構成します。

プロジェクトに多数のテストが含まれる場合、それらを 1 台のマシンで実行するのには時間がかかります。 この時間を短縮するために、テストを複数のマシンに分散させて[テストを並列実行]({{ site.baseurl }}/ja/2.0/parallelism-faster-jobs/)することができます。 それには、並列処理レベルを指定する必要があります。

Use either the CircleCI CLI to split test files or use environment variables to configure each parallel machine individually.


### リソース クラス
CircleCI の [ワークフロー]({{ site.baseurl }}/ja/2.0/workflows/)は、迅速なフィードバック、再実行時間の短縮、リソースの効率的な使用などによって、ソフトウェア開発をスピードアップさせる便利な機能です。

ジョブごとに CPU および RAM リソースを構成して、リソースを効率的に使用することができます。 [リソース クラス]({{ site.baseurl }}/ja/2.0/configuration-reference/#resource_class)は、`.circleci/config.yml` ファイルで指定する必要があります。  `resource_class` が指定されていない場合や、無効なクラスが指定されている場合は、デフォルトの `resource_class: medium` が使用されます。

### キャッシュ
システム管理者は、インストールされている Nomad クライアントや Docker のメトリクスなど、さまざまな環境変数を通じて CircleCI を[モニタリングするためのメトリクス]({{ site.baseurl }}/ja/2.0/monitoring/)を収集することができます。

[キャッシュ]({{ site.baseurl }}/ja/2.0/caching/)も、よく使用される機能です。 キャッシュは、以前のジョブの高コストなフェッチ操作から取得したデータを再利用することで、CircleCI のジョブを効果的に高速化します。

### ワークフロー
[CircleCI API]({{ site.baseurl }}/api/) は、全面的な機能を備えた RESTful API で、CircleCI のすべての情報にアクセスでき、すべてのアクションをトリガーできます。

プライベート サーバー上の CircleCI で問題が発生した場合は、「[Server のトラブルシューティング]({{ site.baseurl }}/ja/2.0/troubleshooting/)」の手順を参照してください。


## オペレーター向け機能
上記の記事で問題を解決できなかった場合は、お使いの CircleCI 用の[サポート バンドル](https://help.replicated.com/docs/native/packaging-an-application/support-bundle/)を生成して、サポート チケットをオープンしてください。

CircleCI UI の[インサイト ページ]({{ site.baseurl }}/ja/2.0/insights/)は、追跡中のすべてのリポジトリのヘルス状態を示すダッシュボードで、平均ビルド時間、平均キュー時間、最終ビルド時刻、成功率、並列処理などが表示されます。

### モニタリング
{: #monitoring }

System Administrators are able to gather [metrics for monitoring]({{ site.baseurl }}/2.0/monitoring/) their CircleCI installation for various environment variables including installed Nomad Clients and Docker metrics.

### Nomad クラスタ
{: #nomad-cluster }

CircleCI は、CircleCI 2.0 のプライマリ ジョブ スケジューラとして Nomad を使用します。 お使いの CircleCI 2.0 で Nomad クラスタを操作する方法については、[Nomad の基本的な概要の説明]({{ site.baseurl }}/ja/2.0/nomad/)を参照してください。

### API
{: #apis }

The [CircleCI API]({{ site.baseurl }}/api/) is a full-featured RESTful API that allows you to access all information and trigger all actions in CircleCI.

### 基本的なトラブルシューティング
{: #basic-troubleshooting }

There are some [initial troubleshooting]({{ site.baseurl }}/2.0/troubleshooting/) steps to take if you are having problems with your CircleCI installation on your private server.

If your issue is not addressed in the above article, generate a [support bundle](https://help.replicated.com/docs/native/packaging-an-application/support-bundle/) for your installation and open a support ticket.

### インサイト
{: #insights }

The [Insights page]({{ site.baseurl }}/2.0/insights/) in the CircleCI UI is a dashboard showing the health of all repositories you are following including median build time, median queue time, last build time, success rate, and parallelism.
