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

Often the best way to troubleshoot problems is to [SSH into a job]({{ site.baseurl }}/ssh-access-jobs/) and inspect things like log files, running processes, and directory paths. CircleCI  では、すべてのジョブに SSH を介してアクセスできます。

Note: When CircleCI runs your pipeline, the [`run` ]({{site.baseurl}}/configuration-reference/#run) command executes shell commands in a _non-interactive_ shell. ビルドに SSH 接続する場合は、_対話型_シェルを使用します (詳細については、バッシュマニュアルの [Invocation](https://linux.die.net/man/1/bash) のセクションを参照してください)。  対話型バッシュシェルは、SSH デバッグプロセスの結果を変える可能性がある一連のスタートアップファイル (`~/.bash_profile` など) をロードします。

### 並列実行
{: #parallelism }

プロジェクトに多数のテストが含まれる場合、それらを 1 台のマシンで実行すると時間がかかります。 To reduce this time, you can [run tests in parallel]({{ site.baseurl }}/parallelism-faster-jobs/) by spreading them across multiple machines. それには、並列実行レベルを指定する必要があります。

CircleCI CLI を使用してテストファイルを分割するか、環境変数を使用して各並列マシンを個別に設定します。


### リソースクラス
{: #resource-class }

ジョブごとに CPU および RAM リソースを設定し、リソースを効率的に使用することができます。 The [resource class]({{ site.baseurl }}/configuration-reference/#resource_class) will need to be specified in the `.circleci/config.yml` file.

### キャッシュ
{: #cache }

Another popular feature is [caching]({{ site.baseurl }}/caching/). キャッシュは、以前のジョブの高コストなフェッチ操作から取得したデータを再利用することで、CircleCI のジョブを効果的に高速化します。

### ワークフロー
{: #workflows }

CircleCI [Workflows]({{ site.baseurl }}/workflows/) are a great feature that can increase the speed of your software development through faster feedback, shorter reruns, and more efficient use of resources.


## オペレーター向け機能
{: #operator-features }

CircleCI が提供する機能のうち、オペレーターの皆様に関係する、問い合わせが多い機能を紹介します。

### モニタリング
{: #monitoring }

System Administrators are able to gather [metrics for monitoring]({{ site.baseurl }}/monitoring/) their CircleCI installation for various environment variables including installed Nomad Clients and Docker metrics.

### Nomad クラスタ
{: #nomad-cluster }

CircleCI では、プライマリジョブスケジューラとして Nomad を使用します。 Refer to the [basic introduction to Nomad]({{ site.baseurl }}/server-3-operator-nomad/) for understanding how to operate the Nomad Cluster in your CircleCI server installation.

### API
{: #apis }

[CircleCI API]({{ site.baseurl }}/api/) は、全面的な機能を備えた RESTful API で、CircleCI のすべての情報にアクセスでき、すべてのアクションをトリガーできます。

### 基本的なトラブルシューティング
{: #basic-troubleshooting }

There are some [initial troubleshooting]({{ site.baseurl }}/troubleshooting/) steps to take if you are having problems with your CircleCI installation on your private server.

上記のドキュメントで問題を解決できなかった場合は、お使いの CircleCI 用の[サポートバンドル](https://help.replicated.com/docs/native/packaging-an-application/support-bundle/)を作成して、サポートチケットをオープンしてください。

### インサイト
{: #insights }

The [Insights page]({{ site.baseurl }}/insights/) in the CircleCI UI is a dashboard showing the health of all repositories you are following including median build time, median queue time, last build time, success rate, and parallelism.
