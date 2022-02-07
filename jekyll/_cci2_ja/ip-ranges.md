---
layout: classic-docs
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

**Note:** The pricing model for IP ranges has been finalized. Details can be found in this [Discuss post](https://discuss.circleci.com/t/ip-ranges-pricing-model/42464).
{: class="alert alert-info"}


## 概要
{: #overview }

IP アドレスの範囲は、IP アドレスに基づくアクセス制御が行われている環境に CircleCI からアクセスしたいお客様のための機能です。 この機能では、 CircleCI のサービスが使用する IP アドレスのリストを提供します。 CircleCI jobs that have this feature enabled will have their traffic routed through one of the defined IP address ranges during job execution.

本機能は現在プレビュー段階であり、[Performance または Scale プラン](https://circleci.com/ja/pricing/)のお客様がご利用いただけます。 なお、この機能では、当該機能を有効にしたジョブのネットワーク転送量に応じてクレジットの消費が発生します。 料金の詳細については、後日の一般公開時にお知らせします。

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

**Note:** Jobs can use any of the address ranges above. また、このアドレス リストは、本機能を有効化しているすべての CircleCI ユーザーと共有されることに注意してください。
{: class="alert alert-info"}

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

**Machine-consumable lists can be found by querying the DNS A records below:**

- IP address ranges *for jobs*: `jobs.knownips.circleci.com`.

- IP address ranges *for core services*: `core.knownips.circleci.com`.

- *All IP address ranges*:  `all.knownips.circleci.com`.

このリストは、プレビュー期間中に変更される可能性があります。 少なくとも週に一度は、更新がないか確認することをお勧めします。

To query these, you can use any DNS resolver. Here's an example using `dig` with the default resolver:

```
dig all.knownips.circleci.com A +short
```

少なくとも 1 つのジョブについて IP アドレスの範囲機能を有効にしているお客様には、このリストの変更があり次第メールでお知らせします。 本機能の一般公開以降に既存の IP アドレス範囲が変更される場合、その **30 日前に通知**を行います。 今後の変更に応じて、このドキュメントとマシン用のリストも更新されます。

## 使用料金
{: #pricing }

Pricing will be calculated based on data usage of jobs opted into the IP ranges feature, however, only the traffic of the opted-in jobs will be counted. ワークフローやパイプラインにおいて、本機能を有効にしていないジョブと混在させても構いません。  Data used to pull in the Docker image to the container before the job starts executing will _not incur usage costs_ for jobs with IP ranges enabled.

Specific rates and details can be found in this [Discuss post](https://discuss.circleci.com/t/ip-ranges-pricing-model/42464).

プレビュー期間中、この機能を有効にしたジョブからの送信トラフィックが許容量を超えた場合、該当のお客様に CircleCI からご連絡する場合があります。

IP ranges usage is visible in the "Plan Usage" page of the CircleCI app:

![Screenshot showing the location of the IP ranges feature]({{ site.baseurl }}/assets/img/docs/ip-ranges.png)

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
{: #knownlimitations}

- There currently is no support for specifying IP ranges config syntax when using the [pipeline parameters feature](https://circleci.com/docs/2.0/pipeline-variables/#pipeline-parameters-in-configuration).  Details in this [Discuss post](https://discuss.circleci.com/t/ip-ranges-open-preview/40864/6).
- 現在、IP アドレスの範囲機能を使用できるのは、[Docker Executor](https://circleci.com/docs/ja/2.0/executor-types/#using-docker) (`remote_docker` を除く) のみです。
- If your job enables IP ranges and _pushes_ anything to a destination that is hosted by the content delivery network (CDN) [Fastly](https://www.fastly.com/), the outgoing job traffic **will not** be routed through one of the well-defined IP addresses listed above. Instead, the IP address will be one that [AWS uses](https://circleci.com/docs/2.0/ip-ranges/#awsandgcpipaddresses) in the us-east-1 or us-east-2 regions. This is a known issue between AWS and Fastly that CircleCI is working to resolve.
