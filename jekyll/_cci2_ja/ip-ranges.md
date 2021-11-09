---
layout: classic-docs
title: "IP アドレスの範囲"
short-title: "IP アドレスの範囲"
description: "CircleCI ジョブで使用される IP アドレスを、明確に定義された範囲のみに限定できます。"
categories: [ ]
order: 70
version:
  - Cloud
---


CircleCI ジョブで使用される IP アドレスを、明確に定義された範囲のみに限定できます。


* 目次
{:toc}

## 概要
{: #overview }

IP アドレスの範囲は、IP アドレスに基づくアクセス制御が行われている環境に CircleCI からアクセスしたいお客様のための機能です。 この機能の実装に伴い、CircleCI では、CircleCI サービスが利用する IP アドレスのリストを公開しました。 CircleCI のジョブでこの機能を有効にした場合、そのジョブから発生するネットワーク トラフィックは、リストにある IP アドレスのいずれかを使用するようになります。

本機能は現在プレビュー段階であり、[Performance または Scale プラン](https://circleci.com/ja/pricing/)のお客様がご利用いただけます。 将来的に、この機能を有効にしたジョブのネットワーク転送量に応じてクレジット消費が発生しますが、 プレビュー段階では無料で使用可能です。 料金の詳細については、後日の一般公開時にお知らせします。

## IP アドレスの範囲: ユース ケース
{: #usecases }

この機能を使用すれば、ご利用のインフラストラクチャへのインバウンド接続を、CircleCI に関連していることが確かな IP アドレスのみに制限することができます。

IP アドレスに基づくアクセス制御は、以下のようなユース ケースに便利です。
- プライベートのアーティファクト リポジトリにアクセスする
- ファイアウォール内でホストされている CocoaPods プロキシから依存関係をプルする
- 内部環境でテスト ケースを実行する
- プライベートの AWS リソースに対して結合テストを実行する
- 機密データが含まれる内部アプリケーションをデプロイする
- 本番環境ネットワークへのアクセスを許可する

これまで、静的 IP アドレスを構成および制御するには、[CircleCI ランナー](https://circleci.com/docs/ja/2.0/runner-overview/)を使用する必要がありました。 IP アドレスの範囲機能であれば、使用するワークフローとプラットフォームは変えることなく、IP ベースのセキュリティやコンプライアンスの要件を満たすことができます。

## IP アドレスの範囲機能を使用した設定ファイルの例
{: #exampleconfiguration }

```yaml
version: 2.1
jobs:
  build:
    circleci_ip_ranges: true # ジョブの IP アドレスの範囲機能を有効化
    docker:
      - image: curlimages/curl
    steps:
      - run: echo "Hello World"
workflows:
  build-workflow:
    jobs:
      - build
```

## IP アドレスの範囲機能で割り当てられる IP アドレスのリスト
{: #listofipaddressranges }

*最終更新*: 2021 年 8 月 23 日

IP アドレスの範囲機能を有効にしたジョブには、以下の IP アドレスのいずれかが関連付けられます。

- 107.22.40.20
- 18.215.226.36
- 3.228.208.40
- 3.228.39.90
- 3.91.130.126
- 34.194.144.202
- 34.194.94.201
- 35.169.17.173
- 35.174.253.146
- 52.20.179.68
- 52.21.153.129
- 52.22.187.0
- 52.3.128.216
- 52.4.195.249
- 52.5.58.121
- 52.72.72.233
- 52.72.73.201
- 54.144.204.41
- 54.161.182.76
- 54.162.196.253
- 54.164.161.41
- 54.167.72.230
- 54.205.138.102
- 54.209.115.53
- 54.211.118.70
- 54.226.126.177
- 54.81.162.133
- 54.83.41.200
- 54.92.235.88

**注:** _ジョブが使用するアドレスは上記のいずれかであり、指定はできません。 また、このアドレス リストは、本機能を有効化しているすべての CircleCI ユーザーと共有されることに注意してください。 _
{: class="alert alert-warning"}

コア サービス (ジョブのトリガーや CircleCI と GitHub 間でのユーザーに関する情報の交換などに使用されるサービス) の IP アドレスの範囲は以下のとおりです。

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

### Upcoming changes to the list of IP address ranges

#### 2021-08-23
* Added new items to the list of IP address ranges for core services.

**IP アドレス リストの変更予定** (最終更新: 2021 年 8 月 2 日): なし

**マシン用の IP アドレス リスト:**

- *ジョブ用* IP アドレス範囲: [DNS A レコード](https://dnsjson.com/jobs.knownips.circleci.com/A.json)

- *コア サービス用* IP アドレスの範囲: [DNS A レコード](https://dnsjson.com/core.knownips.circleci.com/A.json)

- *全 IP アドレス範囲*: [DNS A レコード](https://dnsjson.com/all.knownips.circleci.com/A.json)

このリストは、プレビュー期間中に変更される可能性があります。 少なくとも週に一度は、更新がないか確認することをお勧めします。

少なくとも 1 つのジョブについて IP アドレスの範囲機能を有効にしているお客様には、このリストの変更があり次第メールでお知らせします。 本機能の一般公開以降に既存の IP アドレス範囲が変更される場合、その **30 日前に通知**を行います。 今後の変更に応じて、このドキュメントとマシン用のリストも更新されます。

## 使用料金
{: #pricing }

IP アドレスの範囲機能を有効にしたジョブのネットワーク転送量に応じて、クレジットの消費が発生します。ただし、対象となるのは機能を有効にしたジョブのトラフィックのみです。 ワークフローやパイプラインにおいて、本機能を有効にしていないジョブと混在させても構いません。

具体的な料金や詳細については、機能の一般公開時にお知らせします。

プレビュー期間中、この機能を有効にしたジョブからの送信トラフィックが許容量を超えた場合、該当のお客様に CircleCI からご連絡する場合があります。

## AWS および GCP の IP アドレス
{: #awsandgcpipaddresses }

IP アドレスの範囲機能が有効なジョブも含め、*すべてのジョブ* を CircleCI のプラットフォームで実行するマシンは、Amazon Web Services (AWS)、Google Cloud Platform (GCP)、CircleCI の macOS 用クラウドでホストされます。 CircleCI のトラフィックの送信元となるこれらのクラウド プロバイダーの IP アドレスを網羅したリストについては、各プロバイダーの IP アドレスの範囲を参照してください。 AWS と GCP では、この情報を公開するエンドポイントが提供されています。

- [AWS](https://ip-ranges.amazonaws.com/ip-ranges.json): CircleCI は *us-east-1* および *us-east-2* リージョンを使用
- [GCP](https://www.gstatic.com/ipranges/cloud.json): CircleCI は *us-east1* および *us-central1* リージョンを使用
- CircleCI macOS 用クラウド:
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
  - 138.39.185.0/24

大半が CircleCI のマシンではないため、AWS または GCP の IP アドレスに基づいて IP ベースのファイアウォールを構成することは*推奨されません*。 また、AWS および GCP のエンドポイントのアドレス割り当ては継続的に変更されるので、常に同じであるという*保証はありません*。

IP ベースのファイアウォールを構成し、CircleCI のプラットフォームから送信されるトラフィックを許可する場合は、**IP アドレスの範囲**の使用をお勧めします。

## 既知の制限
{: #knownlimiations}

- 現在、IP アドレスの範囲機能を使用できるのは、[Docker Executor](https://circleci.com/docs/ja/2.0/executor-types/#using-docker) (`remote_docker` を除く) のみです。
- When downloading or uploading files larger than ~10 MB during execution of jobs with IP ranges enabled, intermittently, the job may receive TCP reset (RST) packets and drop the connection. This could cause the job to fail if there is no retry logic in place while downloading/uploading the file.  CircleCI recommends including robust retry mechanisms in your config when attempting to download/upload large files during execution of jobs with IP ranges enabled.  For example, if your job uses [curl](http://www.ipgp.fr/~arnaudl/NanoCD/software/win32/curl/docs/curl.html) to download/upload a large file, include the `--retry <num>` flag and set `<num>` to a large number such as 1,000.
