---
layout: このスクリプトは、上記のコマンドを使用してインスタンスをドレインモードに設定し、インスタンス上で実行中のジョブをモニタリングし、ジョブが完了するのを待ってからインスタンスを終了します。
title: "IP アドレスの範囲"
short-title: "IP アドレスの範囲"
description: "CircleCI ジョブで使用される IP アドレスを、明確に定義された範囲のみに限定できます。"
categories: [ ]
order: 70
version:
  - クラウド
---


CircleCI ジョブで使用される IP アドレスを、明確に定義された範囲のみに限定できます。


* 目次
{:toc}

## 概要
{: #overview }

IP アドレスの範囲は、IP アドレスに基づくアクセス制御が行われている環境に CircleCI からアクセスしたいお客様のための機能です。 この機能の実装に伴い、CircleCI では、CircleCI サービスが利用する IP アドレスのリストを公開しました。 CircleCI jobs that have this feature enabled will have their traffic routed through one of the defined IP address ranges during job execution.

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

IP ranges only routes traffic through one of the defined IP address ranges _during job execution_.  Any step that occurs before the job has started to execute will not have its traffic routed thorugh one of the defined IP address ranges.  For example, pulling a Docker image happens before _job execution_, therefore that step will not have its traffic routed through one of the defined IP address ranges.

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

*Last updated*: 2021-08-23

Jobs that have been opted into the IP ranges feature will have one of the following IP address ranges associated with them:

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

**Note:** _jobs can use any of the address ranges above. It is also important to note that the address ranges are shared by all CircleCI customers who have opted into using the feature._
{: class="alert alert-warning"}

IP address ranges for core services (used to trigger jobs, exchange information about users between CircleCI and Github etc):

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

The machine-consumable lists have also been updated to reflect the new IP address ranges.

**Machine-consumable lists can be found below:**

- *ジョブ用* IP アドレス範囲: [DNS A レコード](https://dnsjson.com/jobs.knownips.circleci.com/A.json)

- *コア サービス用* IP アドレスの範囲: [DNS A レコード](https://dnsjson.com/core.knownips.circleci.com/A.json)

- *全 IP アドレス範囲*: [DNS A レコード](https://dnsjson.com/all.knownips.circleci.com/A.json)

During the preview phase, this list may change. You should check regularly for updates, at least once a week.

Notifications of a change to this list will be sent out by email to all customers who have at least one job opted into the IP ranges feature. When the feature is generally available, **30 days notice** will be given before changes are made to the existing set of IP address ranges. This page and the machine-consumable list will also be updated when there are upcoming changes.

## 使用料金
{: #pricing }

Pricing will be calculated based on data usage of jobs opted into the IP ranges feature, however, only the traffic of the opted-in jobs will be counted. It is possible to mix jobs with and without the IP ranges feature within the same workflow or pipeline.  Data used to pull in the Docker image to the container before the job starts executing will _not incur usage costs_ for jobs with IP ranges enabled.

Specific rates and details are being finalized and will be published when the feature is generally available.

While IP ranges is in preview, CircleCI may contact you if the amount of traffic sent through this feature reaches an excessive threshold.

## AWS および GCP の IP アドレス
{: #awsandgcpipaddresses }

The machines that execute *all jobs* on CircleCI’s platform, not just jobs opted into IP ranges, are hosted on Amazon Web Services (AWS), Google Cloud Platform (GCP), and CircleCI's macOS Cloud. An exhaustive list of IP addresses that CircleCI’s traffic may come from on these cloud providers’ platforms can be found by looking up each cloud provider's IP address ranges. AWS & GCP offer endpoints to find this information.

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

CircleCI *does not recommend* configuring an IP-based firewall based on the AWS or GCP IP addresses, as the vast majority are not CircleCI’s machines. Additionally, there is *no guarantee* that the addresses in the AWS or GCP endpoints persist from day-to-day, as these addresses are reassigned continuously.

**IP ranges** is the recommended method for configuring an IP-based firewall to allow traffic from CircleCI’s platform.

## 既知の制限
{: #knownlimiations}

- 現在、IP アドレスの範囲機能を使用できるのは、[Docker Executor](https://circleci.com/docs/ja/2.0/executor-types/#using-docker) (`remote_docker` を除く) のみです。
- If your job enables IP ranges and _pushes_ anything to a destination that is hosted by the content delivery network (CDN) [Fastly](https://www.fastly.com/), the outgoing job traffic **will not** be routed through one of the well-defined IP addresses listed above. Instead, the IP address will be one that [AWS uses](https://circleci.com/docs/2.0/ip-ranges/#awsandgcpipaddresses) in the us-east-1 or us-east-2 regions. This is a known issue between AWS and Fastly that CircleCI is working to resolve.
