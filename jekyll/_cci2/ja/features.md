---
layout: classic-docs
title: "コア機能"
short-title: "コア機能"
description: "CircleCI 2.0 コア機能の入門ガイド"
categories:
  - getting-started
order: 1
---

ここでは、CircleCI の機能について、開発者向け機能とオペレーター向け機能に分けて概要を説明します。

## 開発者向け機能

CircleCI が提供する機能のうち、開発者の方に関係する人気の機能を紹介します。

### ビルドへの SSH 接続

多くの場合、問題を解決するには、[ジョブへの SSH 接続]({{ site.baseurl }}/ja/2.0/ssh-access-jobs/)を行い、ログファイル、実行中のプロセス、ディレクトリパスなどを調べることが一番の方法です。 CircleCI 2.0 では、すべてのジョブに SSH を介してアクセスするオプションが用意されています。

SSH を使用してログインする場合、ユーザーは対話型のログインシェルを実行しています。 また、コマンドが失敗したことのあるディレクトリでコマンドを実行しているために、それ以降クリーンな実行を開始できていない可能性もあります。

これに対して CircleCI では、コマンドの実行にデフォルトで非対話型シェルを使用します。 このため、ステップの実行が対話モードでは成功しても非対話モードでは失敗することがあります。

### 並列処理

プロジェクトに多数のテストが含まれる場合、それらを 1台のマシンで実行するのは時間がかかります。 この時間を短縮するために、テストを複数のマシンに分散させて[テストを並列実行]({{ site.baseurl }}/ja/2.0/parallelism-faster-jobs/)することができます。 それには、並列処理レベルを指定する必要があります。

CircleCI CLI を使用してテストファイルを分割するか、環境変数を使用して並列マシンを個別に設定します。

### リソースクラス

ジョブごとに CPU および RAM リソースを設定して、リソースを効率的に使用することができます。 [リソースクラス]({{ site.baseurl }}/ja/2.0/configuration-reference/#resource_class)は、`.circleci/config.yml` ファイルで指定する必要があります。 `resource_class` が指定されていない場合や、無効なクラスが指定されている場合は、デフォルトの `resource_class: medium` が使用されます。

### キャッシュ

[キャッシュ]({{ site.baseurl }}/ja/2.0/caching/)も、よく使用される機能です。 キャッシュは、以前のジョブの高コストなフェッチ操作から取得したデータを再利用することで、CircleCI のジョブを効果的に高速化します。

### Workflows

CircleCI の[Workflows]({{ site.baseurl }}/ja/2.0/workflows/) は、迅速なフィードバック、再実行時間の短縮、リソースの効率的な使用などによって、ソフトウェア開発を加速するすばらしい機能です。

## オペレーター向け機能

CircleCI が提供する機能のうち、オペレーターの方に関係する、問い合わせ数の多い機能を紹介します。

### モニタリング

システム管理者は、インストールされている Nomad クライアントや Docker のメトリクスなど、さまざまな環境変数を通じて CircleCI を[モニタリングするためのメトリクス]({{ site.baseurl }}/ja/2.0/monitoring/)を収集することができます。

### Nomad クラスタ

CircleCI は、CircleCI 2.0 のプライマリジョブスケジューラとして Nomad を使用します。お使いの CircleCI 2.0 で Nomad クラスタを操作する方法については、[Nomad の基本的な概要の説明]({{ site.baseurl }}/ja/2.0/nomad/)を参照してください。

### API

[CircleCI API]({{ site.baseurl }}/api/) は、全面的な機能を備えた RESTful API で、CircleCI のすべての情報にアクセスでき、すべてのアクションをトリガーできます。

### 基本的なトラブルシューティング

プライベートサーバー上の CircleCI で問題が発生した場合は、「[Server のトラブルシューティング]({{ site.baseurl }}/ja/2.0/troubleshooting/)」の手順を参照してください。

上記の記事で問題を解決できなかった場合は、お使いの CircleCI 用の[サポートバンドル](https://help.replicated.com/docs/native/packaging-an-application/support-bundle/)を生成して、サポートチケットをオープンしてください。

### インサイト

CircleCI UI の[インサイトページ]({{ site.baseurl }}/ja/2.0/insights/)は、追跡中のすべてのリポジトリのヘルス状態を示すダッシュボードで、平均ビルド時間、平均キュー時間、最終ビルド時刻、成功率、並列処理などが表示されます。