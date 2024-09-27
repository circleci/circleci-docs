---
layout: classic-docs
title: "IP アドレスの範囲機能"
short-title: "IP アドレスの範囲機能"
description: "CircleCI のジョブで使用する IP アドレスを明確に定義された範囲のみに限定できます。"
categories: [ ]
contentTags:
  platform:
    - クラウド
---

CircleCI のジョブで使用する IP アドレスを、明確に定義された範囲のみに限定できます。

## 概要
{: #overview }

IP アドレスの範囲機能は、既存のワークフローやプラットフォームを使って、制限された環境への IP アドレスに基づくアクセスを設定する必要があるお客様のための機能です。 CircleCI は、この機能の一環として CircleCI のサービスで使用する IP アドレスのリストを公開しています。 この機能を有効にしたジョブのトラフィックは、ジョブの実行においてリスト上のいずれかの IP アドレスを使用するようになります。

本機能は現在 [Performance プランまたは Scale プラン](https://circleci.com/ja/pricing/)のお客様にご利用いただけます。 料金は、この機能を有効にしたジョブのデータ使用量に応じて計算されます。 料金に関する詳細は、[Discuss の投稿](https://discuss.circleci.com/t/ip/46029)をご覧ください。

## IP アドレスの範囲機能のユースケース
{: #use-cases }

この機能により、お客様のインフラストラクチャへのインバウンド接続を、CircleCI に関連付けられた IP アドレスに制限することができます。

IP アドレスに基づくアクセス制限は、以下のようなユースケースで便利です。
- プライベートアーティファクトリポジトリへのアクセス
- ファイアウォール内でホストされている CocoaPods プロキシからの依存関係のプル
- 社内環境でのテストケースの実行
- プライベート AWS リソースへの結合テストの実施
- 機密データが含まれる社内アプリのデプロイ
- 本番環境ネットワークへのアクセスの付与

## IP アドレスの範囲機能を使用した設定ファイルサンプル
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

IP アドレスの範囲機能を有効にしたジョブには、以下のいずれかの IP アドレスに割り当てられます。

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

**注:** ジョブが使用するアドレスは上記のいずれかであり、指定はできません。 また、このアドレスリストは、本機能を有効化しているすべての CircleCI ユーザーと共有されるのでご注意ください。
{: class="alert alert-info"}

## コアサービス用 IP アドレスのリスト
{: #list-of-ip-address-ranges-for-core-services }

コアサービス (ジョブのトリガーや CircleCI と GitHub 間でのユーザーに関する情報の交換などに使用されるサービス) 用の IP アドレスの範囲は以下のとおりです。

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

### IP アドレスの範囲に関する更新履歴
{: #list-of-ip-address-ranges-changelog }

#### 2021-08-23
* コアサービス用 IP アドレスのリストに新しい IP アドレスが追加されました。

マシン用のリストもアップデートされ、新しい IP アドレスが反映されました。

#### 2022-04-06
* Docker プルがリスト上の IP アドレスを使用するよう、IP アドレスの新規追加および削除を行いました。

マシン用のリストもアップデートされ、新しい IP アドレスが反映されました。

**マシン用のリストは、以下の DNS A レコードの照会により見つけられます。**

- *ジョブ用の* IP アドレス: `jobs.knownips.circleci.com`

- *コアサービス用の* IP アドレス: `core.knownips.circleci.com`

- *すべての IP アドレス*: `all.knownips.circleci.com`

照会には、お好きな DNS リゾルバをご使用いただけます。 以下は、デフォルトのリゾルバで `dig` を使った例です。

```shell
dig all.knownips.circleci.com A +short
```

少なくとも 1 つのジョブの IP アドレスの範囲機能を有効にしているお客様には、このリストが変更される場合はメールで通知します。 既存の IP アドレス範囲が変更される場合、その **30 日前**に通知を行います。 今後変更があった場合、本ドキュメントとマシン用のリストも更新されます。

## 料金
{: #pricing }

料金はこの機能を有効にしたジョブのデータ使用量に基づいて計算されます。 一つのワークフローやパイプラインにおいて、本機能を有効にしているジョブと有効にしていないジョブが混在しても構いません。 IP アドレスの範囲機能が有効なジョブにおいて、ジョブの実行の開始前に Docker イメージをコンテナにプルするために使用されるデータに対しては _料金は発生しません。_

料金に関する詳細は [Discuss の投稿](https://discuss.circleci.com/t/ip/46029)をご覧ください。

IP アドレスの範囲機能の使用量は、CircleCI アプリの **Plan Usage** でご確認いただけます。

![IP アドレスの範囲機能の場所を示すスクリーンショット]({{site.baseurl}}/assets/img/docs/ip-ranges.png)

**Job Details** の UI  ページの **Resources** タブから、すべての Docker ジョブ (IP アドレスの範囲機能を無効にしているジョブを含む) の概算ネットワーク通信量を確認できます。 この概算値から、ジョブのIP アドレスの範囲機能を有効にした場合の料金を有効化する前に見積もることができます。 詳細については、[Discuss](https://discuss.circleci.com/t/ip-resources/46031) をご参照ください。 ジョブが IP アドレスの範囲機能を有効にしているかどうかは「IP ranges」バッジで確認できます。

![概算ネットワーク通信量を示すスクリーンショット]({{site.baseurl}}/assets/img/docs/resources-network-transfer.png)

## AWS および GCP の IP アドレス
{: #aws-and-gcp-ip-addresses }

IP アドレスの範囲機能が有効なジョブだけでなく、*すべてのジョブ* を CircleCI のプラットフォームで実行するマシンは、Amazon Web Services (AWS)、Google Cloud Platform (GCP)、CircleCI の macOS 用クラウドでホストされます。 CircleCI のトラフィックの送信元となるこれらのクラウドプロバイダーの IP アドレスを網羅したリストについては、各プロバイダーの IP アドレスの範囲を参照してください。 AWS と GCP では、この情報を公開するエンドポイントが提供されています。

- [AWS](https://ip-ranges.amazonaws.com/ip-ranges.json): CircleCI は *us-east-1* および *us-east-2* リージョンを使用
- [GCP](https://www.gstatic.com/ipranges/cloud.json): CircleCI は *us-east1* および *us-central1* リージョンを使用

大半が CircleCI のマシンではないため、AWS または GCP の IP アドレスに基づいて IP ベースのファイアウォールを設定することは*推奨されません*。 また、AWS および GCP のエンドポイントのアドレス割り当ては継続的に変更されるので、常に同じであるという*保証はありません*。

## CircleCI macOS 用クラウド
{: #circleci-macos-cloud }

上記の AWS や GCP に加えて、CircleCI macOS 用クラウドでもマシンが実行するジョブをホストしています。 CircleCI の macOS 用クラウドでは下記の IP アドレスを使用します。

- 100.27.248.128/25
- 38.39.184.0/24
- 38.39.185.0/24
- 38.39.183.0/24
- 38.23.38.0/24
- 38.23.39.0/24
- 38.23.40.0/24
- 38.23.41.0/24
- 38.23.42.0/24
- 38.23.43.0/24
- 198.206.135.0/24
- 207.254.116.0/24
- 207.254.118.0/24

IP ベースのファイアウォールを構成し、CircleCI のプラットフォームから送信されるトラフィックを許可する場合は、**IP アドレスの範囲機能**の使用をお勧めします。

macOS のビルドは記載されてる IP アドレスに自動的に制限されます。 つまり macOS のビルドでは、`circleci_ip_ranges: true` を明示的に設定する必要がありません。
{: class="alert alert-info" }

## 既知の制限
{: #known-limitations}

- 現在、[パイプラインのパラメーター機能]({{site.baseurl}}/ja/pipeline-variables/#pipeline-parameters-in-configuration)を使った IP アドレス設定構文の指定はサポートしていません。 詳細は [Discuss の投稿 (英語)](https://discuss.circleci.com/t/ip-ranges-open-preview/40864/6)をご覧ください。

- 現在、IP アドレスの範囲機能を使用できるのは、[Docker Executor]({{site.baseurl}}/ja/configuration-reference/#docker) (`remote_docker` を除く) のみです。 [Machine Executor]({{site.baseurl}}/ja/configuration-reference/#machine) または `setup_remote_docker` で IP アドレスの範囲機能を使用しようとしたジョブは、エラーを表示して失敗します。 詳細は、[Discuss の投稿 (英語)](https://discuss.circleci.com/t/fyi-jobs-that-use-the-ip-ranges-feature-and-remote-docker-will-begin-to-fast-fail-this-week/44639) を参照して下さい。

- CircleCI では、まれに上記リストに明確に定義されている IP アドレス以外の IP アドレスががジョブの実行に使用される不具合があることを認識しています。
