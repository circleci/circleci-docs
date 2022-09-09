---
layout: classic-docs
title: "IP アドレスの範囲機能"
short-title: "IP アドレスの範囲機能"
description: "CircleCI ジョブで使用される IP アドレスを明確に定義された範囲のみに限定できます。"
categories: [ ]
order: 70
version:
  - クラウド
---

CircleCI のジョブで使用する IP アドレスを、明確に定義された範囲のみに限定できます。

* 目次
{:toc}

## 概要
{: #overview }

IP アドレスの範囲機能は、IP アドレスに基づくアクセス制御が行われている環境に CircleCI からアクセスしたいお客様のための機能です。 お客様には CircleCI のサービスで使用する IP アドレスのリストが提供されます。 この機能を有効にしたジョブのトラフィックは、リスト上のいずれかの IP アドレスを使用するようになります。

本機能は現在 [Performance プランまたは Scale プラン](https://circleci.com/ja/pricing/)のお客様のみご利用いただけます。 この機能を有効にしたジョブのデータ使用量に応じてクレジットの消費が発生します。 料金に関する詳細は [Discuss の投稿 (英語)](https://discuss.circleci.com/t/ip-ranges-pricing-model/42464)をご覧ください。

## IP アドレスの範囲機能: ユースケース
{: #use-cases }

この機能により、お客様のインフラストラクチャへのインバウンド接続を、CircleCI に関連付けられた IP アドレスのみに制限することができます。

IP アドレスに基づくアクセス制御は、以下のようなユースケースで便利です。
- プライベートのアーティファクトリポジトリにアクセスする
- ファイアウォール内でホストされている CocoaPods プロキシから依存関係をプルする
- 内部環境でテストケースを実行する
- プライベートの AWS リソースに対して結合テストを実行する
- 機密データが含まれる内部アプリケーションをデプロイする
- 本番環境ネットワークへのアクセスを許可する

これまでは、静的 IP アドレスを設定および制御するには、[CircleCI ランナー]({{site.baseurl}}/ja/runner-overview/)を使用する必要がありました。 IP アドレスの範囲機能により、既存のワークフローとプラットフォームを変えることなく、IP ベースのセキュリティ要件やコンプライアンス要件を満たせるようになりました。

## IP アドレスの範囲機能を使用した設定ファイルの例
{: #example-configuration }

```yaml
version: 2.1
jobs:
  build:
    circleci_ip_ranges: true # opts the job into the IP ranges feature
    docker:
      - image: curlimages/curl
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - run: echo “Hello World”
workflows:
  build-workflow:
    jobs:
      - build
```

## この機能により割り当てられる IP アドレスのリスト
{: #list-of-ip-address-ranges }

*最終更新*: 2022 年 4 月 6 日

IP アドレスの範囲機能を有効にしたジョブには、以下の IP アドレスのいずれかが関連付けられます。

- 3.228.39.90
- 18.213.67.41
- 34.194.94.201
- 34.194.144.202
- 34.197.6.234
- 35.169.17.173
- 35.174.253.146
- 52.3.128.216
- 52.4.195.249
- 52.5.58.121
- 52.21.153.129
- 52.72.72.233
- 54.92.235.88
- 54.161.182.76
- 54.164.161.41
- 54.166.105.113
- 54.167.72.230
- 54.172.26.132
- 54.205.138.102
- 54.208.72.234
- 54.209.115.53

**注:** ジョブが使用するアドレスは上記のいずれかであり、指定することはできません。 また、このアドレスリストは、本機能を有効化しているすべての CircleCI ユーザーと共有されるのでご注意ください。
{: class="alert alert-info"}

## コアサービスの IP アドレスのリスト
{: #list-of-ip-address-ranges-for-core-services }

コアサービス (ジョブのトリガーや CircleCI と GitHub 間でのユーザーに関する情報の交換などに使用されるサービス) の IP アドレスの範囲は以下のとおりです。

- 18.214.70.5
- 52.20.166.242
- 18.214.156.84
- 54.236.156.101
- 52.22.215.219
- 52.206.105.184
- 52.6.77.249
- 34.197.216.176
- 35.174.249.131
- 3.210.128.175

### IP アドレスの範囲に関する更新履歴のリスト
{: #list-of-ip-address-ranges-changelog }

#### 2021-08-23
* コアサービス用 IP アドレスリストに新しい IP アドレスが追加されました。

マシン用のリストもアップデートされ、新しい IP アドレスが反映されました。

#### 2022-04-06
* Docker プルが IP アドレスリストを通過できるよう、IP アドレスの新規追加および削除を行いました。

マシン用のリストもアップデートされ、これらの新しい IP アドレスが反映されました。

**マシン用のリストは、以下の DNS A レコードの照会により見つけられます。**

- *ジョブ用の* IP アドレス: `jobs.knownips.circleci.com`

- *コアサービス用の* IP アドレス: `core.knownips.circleci.com`

- *すべての IP アドレス*: `all.knownips.circleci.com`

照会には、お好きな DNS リゾルバをご使用いただけます。 以下は、デフォルトのリゾルバで `dig` を使った例です。

```shell
dig all.knownips.circleci.com A +short
```

少なくとも 1 つのジョブの IP アドレスの範囲機能を有効にしているお客様には、このリストの変更があった場合メールで通知します。 本機能の一般公開以降に既存の IP アドレス範囲が変更される場合は、その **30 日前に通知**を行います。 今後の変更に応じて、このドキュメントとマシン用のリストも更新されます。

## 価格
{: #pricing }

この機能を有効にしたジョブのデータ使用量に応じてクレジットの消費が発生します。 ワークフローやパイプラインにおいて、本機能を有効にしていないジョブと混在させても構いません。  IP 範囲機能が有効なジョブにおいて、ジョブの実行の開始前に Docker イメージをコンテナにプルするために使用されるデータには_料金は発生しません _。

料金に関する詳細は [Discuss の投稿 (英語)](https://discuss.circleci.com/t/ip-ranges-pricing-model/42464)をご覧ください。

IP アドレスの範囲機能の使用状況は、 CircleCI アプリケーションの「 Plan Usage 」のページに表示されます。

![IP アドレスの範囲機能の場所を示すスクリーンショット]({{site.baseurl}}/assets/img/docs/ip-ranges.png)

**Job Details** の UI  ページの **Resources** タブから、すべての Docker ジョブ (IP アドレスの範囲機能を無効にしているジョブを含む) の概算ネットワーク通信量を確認できます。 この概算値から、ジョブのIP アドレスの範囲機能を有効にした場合の料金を有効化する前に見積もることができます。  詳細については、[Discuss (英語)](https://discuss.circleci.com/t/helping-customers-predict-the-cost-of-enabling-the-ip-ranges-feature-an-update-to-the-resources-tab/43068) をご参照ください。 ジョブが IP アドレスの範囲機能を有効にしているかどうかは「IP ranges」バッジを表示することで確認できます。

![イメージについて]({{site.baseurl}}/assets/img/docs/resources-network-transfer.png)

## AWS および GCP の IP アドレス
{: #aws-and-gcp-ip-addresses }

IP アドレスの範囲機能が有効なジョブだけでなく、*すべてのジョブ* を CircleCI のプラットフォームで実行するマシンは、Amazon Web Services (AWS)、Google Cloud Platform (GCP)、CircleCI の macOS 用クラウドでホストされます。 CircleCI のトラフィックの送信元となるこれらのクラウドプロバイダーの IP アドレスを網羅したリストについては、各プロバイダーの IP アドレスの範囲を参照してください。 AWS と GCP では、この情報を公開するエンドポイントが提供されています。

- [AWS](https://ip-ranges.amazonaws.com/ip-ranges.json): CircleCI は *us-east-1* および *us-east-2* リージョンを使用
- [GCP](https://www.gstatic.com/ipranges/cloud.json): CircleCI は *us-east1* および *us-central1* リージョンを使用

大半が CircleCI のマシンではないため、AWS または GCP の IP アドレスに基づいて IP ベースのファイアウォールを構成することは*推奨されません*。 また、AWS および GCP のエンドポイントのアドレス割り当ては継続的に変更されるので、常に同じであるという*保証はありません*。

## CircleCI macOS 用クラウド
{: #circleci-macos-cloud }

上記の AWS や GCP に加えて、CircleCI の macOS 用クラウドでもマシンが実行するジョブをホストしています。 CircleCI の macOS 用クラウドでは下記の IP アドレスを使用します。

- 162.252.208.0/24
- 162.252.209.0/24
- 192.206.63.0/24
- 162.221.90.0/24
- 38.39.177.0/24
- 38.39.178.0/24
- 38.39.188.0/24
- 38.39.189.0/24
- 38.39.186.0/24
- 38.39.187.0/24
- 38.39.184.0/24
- 38.39.185.0/24
- 38.39.183.0/24
- 38.23.38.0/24
- 38.23.39.0/24
- 38.23.40.0/24
- 198.206.135.0/24

IP ベースのファイアウォールを構成し、CircleCI のプラットフォームから送信されるトラフィックを許可する場合は、**IP アドレスの範囲機能**の使用をお勧めします。 **注:** macOS のビルドは記載されてるIP アドレスに自動的に制限されます。 つまり macOS のビルドでは、`circleci_ip_ranges: true` を明示的に設定する必要がありません。

## 既知の制限
{: #known-limitations}

- 現在、[パイプラインのパラメーター機能]({{site.baseurl}}/pipeline-variables/#pipeline-parameters-in-configuration)を使った IP アドレス設定構文の指定はサポートしていません。  詳細は [Discuss の投稿 (英語)](https://discuss.circleci.com/t/ip-ranges-open-preview/40864/6)をご覧ください。
- 現在、IP アドレスの範囲機能を使用できるのは、[Docker Executor]({{site.baseurl}}/ja/configuration-reference/#docker) (`remote_docker` を除く) のみです。  [Machine executor]({{site.baseurl}}/ja/configuration-reference/#machine) または `setup_remote_docker` で IP アドレスの範囲機能を使用しようとしたジョブは、エラーを表示して失敗します。 詳細は、[Discuss の投稿](https://discuss.circleci.com/t/fyi-jobs-that-use-the-ip-ranges-feature-and-remote-docker-will-begin-to-fast-fail-this-week/44639)を参照して下さい。
- CircleCI では、まれに上記のリストに明確に定義された IP アドレスがジョブの実行に使用されない不具合を認識しています。 解決方法について詳細な情報が分かり次第、このページを更新します。  
