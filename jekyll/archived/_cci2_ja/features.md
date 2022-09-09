---
layout: classic-docs
title: "コア機能"
short-title: "コア機能"
description: "CircleCI コア機能の入門ガイド"
categories:
  - はじめよう
order: 1
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

ここでは、CircleCI の機能について、開発者向け機能とオペレーター向け機能に分けて概要を説明します。

## 開発者向け機能
{: #developer-features }

CircleCI が提供する機能のうち、よく使用されている開発者向け機能をご紹介します。

### ビルドへの SSH 接続
{: #ssh-into-builds }

問題の解決には、[ジョブへの SSH 接続]({{ site.baseurl }}/ja/ssh-access-jobs/)を行い、ログファイル、実行中のプロセス、ディレクトリパスなどを調べることが、多くの場合最善の方法です。 CircleCI  では、すべてのジョブに SSH を介してアクセスできます。

注: CircleCI はパイプラインを実行する際、[`run`]({{site.baseurl}}/ja/configuration-reference/#run) コマンドにより _非対話型_ シェルでシェルコマンドを実行します。 ビルドに SSH 接続する場合は、_対話型_シェルを使用します (詳細については、バッシュマニュアルの [Invocation](https://linux.die.net/man/1/bash) のセクションを参照してください)。  対話型バッシュシェルは、SSH デバッグプロセスの結果を変える可能性がある一連のスタートアップファイル (`~/.bash_profile` など) をロードします。

### 並列実行
{: #parallelism }

プロジェクトに多数のテストが含まれる場合、それらを 1 台のマシンで実行すると時間がかかります。 この時間を短縮するために、テストを複数のマシンに分散させて[テストを並列実行]({{ site.baseurl }}/ja/parallelism-faster-jobs/)することができます。 それには、並列実行レベルを指定する必要があります。

CircleCI CLI を使用してテストファイルを分割するか、環境変数を使用して各並列マシンを個別に設定します。


### リソースクラス
{: #resource-class }

ジョブごとに CPU および RAM リソースを設定し、リソースを効率的に使用することができます。 [リソースクラス]({{ site.baseurl }}/ja/configuration-reference/#resource_class)を、`.circleci/config.yml` ファイルで指定する必要があります。

### キャッシュ
{: #cache }

[キャッシュ]({{ site.baseurl }}/ja/caching/)も、よく使用される機能です。 キャッシュは、以前のジョブの高コストなフェッチ操作から取得したデータを再利用することで、CircleCI のジョブを効果的に高速化します。

### ワークフロー
{: #workflows }

CircleCI の [ワークフロー]({{ site.baseurl }}/ja/workflows/)は、迅速なフィードバック、再実行時間の短縮、リソースの効率的な使用などによって、ソフトウェア開発をスピードアップさせる便利な機能です。


## オペレーター向け機能
{: #operator-features }

CircleCI が提供する機能のうち、オペレーターの皆様に関係する、問い合わせが多い機能を紹介します。

### モニタリング
{: #monitoring }

システム管理者は、インストールされている Nomad クライアントや Docker のメトリクスなど、さまざまな環境変数を通じて CircleCI を[モニタリングするためのメトリクス]({{ site.baseurl }}/ja/monitoring/)を収集することができます。

### Nomad クラスタ
{: #nomad-cluster }

CircleCI では、プライマリジョブスケジューラとして Nomad を使用します。 お使いの CircleCI Server で Nomad クラスタを操作する方法については、[Nomad の基本的な概要の説明]({{ site.baseurl }}/ja/server-3-operator-nomad/)を参照してください。

### API
{: #apis }

[CircleCI API]({{ site.baseurl }}/api/) は、全面的な機能を備えた RESTful API で、CircleCI のすべての情報にアクセスでき、すべてのアクションをトリガーできます。

### 基本的なトラブルシューティング
{: #basic-troubleshooting }

プライベートサーバー上の CircleCI で問題が発生した場合は、[最初のトラブルシューティング手順]({{ site.baseurl }}/ja/troubleshooting/)を参照してください。

上記のドキュメントで問題を解決できなかった場合は、お使いの CircleCI 用の[サポートバンドル](https://help.replicated.com/docs/native/packaging-an-application/support-bundle/)を作成して、サポートチケットをオープンしてください。

### インサイト
{: #insights }

CircleCI UI の[インサイト ページ]({{ site.baseurl }}/ja/insights/)は、追跡中のすべてのリポジトリのヘルス状態を示すダッシュボードで、平均ビルド時間、平均キュー時間、最終ビルド時刻、成功率、並列実行などが表示されます。
