---
layout: classic-docs
title: "Terraform で Amazon Web Services 上に CircleCI v2.16 をインストールする"
category:
  - administration
order: 10
description: "Amazon Webサービス(AWS)にCircleCIをインストールする方法"
---
ここでは、以下のセクションに沿って、Terraform を使用して Amazon Web Services (AWS) 上に CircleCI v2.16 をインストールするための要件と手順について説明します。

- 目次
{:toc}

このリリースの新機能と修正点については、[v2.16 更新履歴](https://circleci.com/server/changelog)を参照してください。

**メモ**

- サポート契約を締結していなくても、本ドキュメントの例と指示に沿って AWS に CircleCI v2.16 をインストールできます。
- お客様の組織で Azure などの他のプラットフォームを使用している場合は、Platinum の CircleCI サポート契約を締結することで、CircleCI をインストールおよび設定できるようになります。 まずは、[CircleCI サポート](https://support.circleci.com/hc/ja/requests/new)またはお客様のアカウント担当者にお問い合わせください。

## システム要件

ここでは、CircleCI v2.16 をインストールするためのシステム要件を説明します。

### Services マシン
{:no_toc}

Services マシンは、ユーザー対面 Web サイト、API エンジン、データストア、Nomad ジョブスケジューラなどの Server プロダクトのコアコンポーネントをホスティングします。 独立のマシンを使用することをお勧めします。

下表に、Services マシンの CPU、RAM、およびディスク容量の要件を示します。

1 日の CircleCI アクティブユーザー数 | CPU | RAM | ディスク容量 | NIC 速度
---------------------------------|---------|----|------------|----------
～ 49 | 8コア | 32 GB | 100 GB | 1 Gbps
50 ～ 250 | 12コア | 64GB | 200 GB | 1 Gbps
251 ～ 1,000 | 16コア | 128 GB | 500 GB | 10 Gbps
1,001 ～ 5,000 | 20コア | 256 GB | 1 TB | 10 Gbps
5,000 ～ | 24コア | 512 GB | 2 TB | 10 Gbps
{: class="table table-striped"}

### 外部処理化
{:no_toc}

Platinum サポート契約では、パフォーマンスの向上のために以下のサービスを Services マシンの外部で実行するように設定できます。

- PostgreSQL
- MongoDB
- Vault
- RabbitMQ
- Redis
- Nomad
- Slanger

外部サービス実行の現在の要件に照らして環境を評価したい場合には、サポートにお問い合わせください。

### Nomad クライアント
{:no_toc}

Nomad クライアントマシンは、Services マシンによってスケジュールされた CircleCI ジョブを実行します。 デフォルトの[リソースクラス]({{site.baseurl}}/ja/2.0/configuration-reference/#resource_class)の 1 クライアントに対する CPU、RAM、およびディスク容量の最小要件は以下のとおりです。

- CPU：4コア
- RAM：16 GB
- ディスク容量：100 GB
- NIC 速度：1 Gbps

下表には、使用可能にする Nomad クライアント数のベスト プラクティスを示します。 システムの需要に合わせて増減させてください。

1 日の CircleCI アクティブユーザー数 | Nomad クライアントマシン数
---------------------------|-----------------------
～ 49 | 1 ～ 5
50 ～ 250 | 5 ～ 10
250 ～ 1,000 | 10 ～ 15
5,000 ～ | 15 ～
{: class="table table-striped"}

## インストールの前提条件

以下の自動インフラストラクチャプロビジョニングソフトウェアをインストールします。

- Terraform。[Terraform のダウンロード](https://www.terraform.io/downloads.html)サイトでお使いのアーキテクチャ用のパッケージを探してください。

インストール手順を開始する前に、以下の情報を準備してください。

- CircleCI ライセンスファイル (.rli)。ライセンスについては、[CircleCI サポート](https://support.circleci.com/hc/ja/requests/new)にお問い合わせください。
- AWS アクセスキーと AWS 秘密キー。
- [AWS EC2 SSH キー](https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/ec2-key-pairs.html)の名前。
- AWS リージョン。たとえば、`us-west-2`。
- AWS Virtual Private Cloud (VPC) ID および AWS サブネット ID。 デフォルト VPC を使用するようにアカウントが設定されている場合は、デフォルト VPC の ID が Amazon の [アカウントの属性] の下にリストされます。
- VPC の [`enableDnsSupport`] 設定を `true` に設定します。これは、IP アドレス 169.254.169.253 または予約済み IP アドレス (VPC IPv4 ネットワーク範囲のベースに 2 を加算したアドレス) で Amazon が提供する DNS サーバーへのクエリが成功するようにします。 詳細については、Amazon Web Services ドキュメントの「[VPC での DNS の使用](https://docs.aws.amazon.com/ja_jp/vpc/latest/userguide/vpc-dns.html#vpc-dns-updating)」を参照してください。

### プライベートサブネットの要件
{:no_toc}

AWS でのプライベートサブネットの使用を CircleCI でサポートするには、以下の追加設定が必要です。

- Builder box 用の非公開サブネットは、[NAT ゲートウェイ](https://docs.aws.amazon.com/ja_jp/vpc/latest/userguide/vpc-nat-gateway.html)または[インターネットゲートウェイ](https://docs.aws.amazon.com/ja_jp/vpc/latest/userguide/VPC_Internet_Gateway.html)で、添付のルートテーブルにより、インターネットへのアウトバウンドトラフィック用に構成する必要があります。 **メモ：** サブネットは、アドレスが枯渇することが*決してない*よう、十分な大きさが確保されている必要があります。
- [S3 用 VPC エンドポイント](https://aws.amazon.com/jp/blogs/aws/new-vpc-endpoint-for-amazon-s3/)を有効にする必要があります。 S3 用 VPC エンドポイントを有効にすると、CircleCI およびサブネット内の他のノードに対する S3 操作が大幅に改善します。
- 高負荷のネットワーク操作に対しては NAT インスタンスを適切に強化します。 デプロイの仕様によっては、Docker および外部ネットワークリソースを使用した高度並列ビルドによって NAT インスタンスが制約を受ける可能性があります。 不適切な NAT によってネットワーク操作やキャッシュ操作が低速化するおそれがあります。
- <a href=」https://github.com">github.com</a> と連携する場合、ネットワークのアクセス制御リスト (ACL) のホワイトリストに GitHub Webhook のポート 80 および 443 が含まれていることを確認します。 GitHub と連携する場合は、CircleCI をパブリックサブネット内に準備するか、パブリックロードバランサーを使用して github.com トラフィックを転送するように設定します。
- CircleCI インストールのインスタンスにアクセスできる必要のあるポートの詳細については、「[管理者向け概要]({{site.baseurl}}/ja/2.0/overview#services)」の「Services」セクションを参照してください。

<!--- Check whether the ACL needs to be more open so the services/build can download build images -->

## 計画

プレビューリリースのインストールを開始する前に、以下の情報とポリシーを準備してください。

- ネットワークプロキシを使用する場合は、CircleCI 2.0 をインストールする前に、お客様のアカウントチームに連絡してください。
- Services 用に 1つ、Nomad クライアントの最初のセット用に 1つ、少なくとも 2つの AWS インスタンスのプロビジョニングを計画します。 ベストプラクティスとして、Services と Nomad クライアントの両方のインスタンスに、8つの vCPU と 32 GB の RAM を備えた `m4.2xlarge` インスタンスを使用することをお勧めします。
- AWS インスタンスには、Docker コンテナをプルし、ライセンスを確認するために、アウトバウンドアクセスが必要です。
- 必要な AWS エンティティを Terraform でプロビジョニングするには、以下のアクセス許可を持つ IAM ユーザーが必要です。
```
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Action": [
                    "s3:*"
                ],
                "Effect": "Allow",
                "Resource": [
                    "arn:aws:s3:::circleci-*",
                    "arn:aws:s3:::circleci-*/*",
                    "arn:aws:s3:::*"
                ]
            },
            {
                "Action": [
                    "autoscaling:*",
                    "sqs:*",
                    "iam:*",
                    "ec2:StartInstances",
                    "ec2:RunInstances",
                    "ec2:TerminateInstances",
                    "ec2:Describe*",
                    "ec2:CreateTags",
                    "ec2:AuthorizeSecurityGroupEgress",
                    "ec2:AuthorizeSecurityGroupIngress",
                    "ec2:CreateSecurityGroup",
                    "ec2:DeleteSecurityGroup",
                    "ec2:DescribeInstanceAttribute",
                    "ec2:DescribeInstanceStatus",
                    "ec2:DescribeInstances",
                    "ec2:DescribeNetworkAcls",
                    "ec2:DescribeSecurityGroups",
                    "ec2:RevokeSecurityGroupEgress",
                    "ec2:RevokeSecurityGroupIngress",
                    "ec2:ModifyInstanceAttribute",
                    "ec2:ModifyNetworkInterfaceAttribute",
                    "cloudwatch:*",
                    "autoscaling:DescribeAutoScalingGroups",
                    "iam:GetUser"
                ],
                "Resource": [
                    "*"
                ],
                "Effect": "Allow"
            }
        ]
    }
```

## Terraform によるインストール

1. [Setup](https://github.com/circleci/enterprise-setup) リポジトリのクローンを作成します (既にクローンを作成している場合、それが最新であること、および `master` ブランチにいることを確認します：`git checkout master && git pull`)。
2. `make init` を実行し、`terraform.tfvars` ファイルを初期化します (既に `terraform.tfvars` が存在する場合、同じディレクトリにバックアップされます)。
3. `terraform.tfvars` に、セクション 1 の適切な AWS 値を入力します。
4. セクション 2 で `circle_secret_passphrase` を指定し、`...` は英数字で置き換えます。 パスフレーズを空にすることはできません。
5. Nomad クライアントのインスタンスタイプを指定します。 デフォルトでは、Nomad クライアント用の `terraform.tfvars` ファイルに指定される値は `m4.2xlarge` (8つの vCPU、32 GB の RAM)です。 各 Nomad クライアントが同時に実行できる CircleCI ジョブの数を増やすには、`terraform.tfvars` ファイルのセクション 2 を変更し、`nomad_client_instance_type` の値を大きくします。 詳細については、AWS の「[Amazon EC2 インスタンスタイプ](https://aws.amazon.com/jp/ec2/instance-types/)」ガイドを参照してください。 **メモ：**`builder_instance_type` は 1.0 でのみ使用されるもので、セクション 3 ではデフォルトで無効になっています。
6. `terraform apply` を実行してプロビジョニングを行います。
7. Terraform 出力の末尾にある URL に移動し、指示に従います。
8. ライセンスを入力します。
9. 管理コンソールの GitHub 連携セクション内の指示に従って、GitHub.com に CircleCI を新しい OAuth アプリケーションとして登録します。

- **メモ：**「Unknown error authenticating via GitHub. Try again, or contact us.」というメッセージが表示された場合は、ホームページ URL とコールバック URL で `https:` の代わりに `http:` を使用してみてください。 8. GitHub からクライアント ID をコピーし、GitHub アプリケーションクライアント ID の入力フィールドにペーストします。 9. GitHub からシークレットをコピーし、GitHub アプリケーションクライアントシークレットの入力フィールドにペーストして、[Test Authentication (認証のテスト)] をクリックします。 10. `Storage` セクションを完了します。 ベストプラクティスとして、認証にはインスタンスプロファイルを使用することをお勧めします (追加の設定は必要ありません)。 11. [リモートの Docker]({{site.baseurl}}/ja/2.0/building-docker-images/) または `machine` Executor 機能の使用を計画している場合、vm-service を構成します (後からでも構成できます)。 ここでも、認証用のインスタンスプロファイルの使用をお勧めします (追加の設定は必要ありません)。 12. 設定を適用すると、管理コンソールダッシュボードにリダイレクトされます。 必要な Docker コンテナすべてをダウンロードするまで数分がかかります。 管理コンソールで `Failure reported from operator: no such image` が報告された場合、[Start (スタート)] を再クリックすると続行できます。 13. アプリケーションが起動されたら、CircleCI にログインし、2.0 ビルドの実行を開始します。 14. [realitycheck レポート](https://github.com/circleci/realitycheck)を使用して、基本的な CircleCI 機能を検査できます。

## インストールのバリデーション

1. ダッシュボードで [Open (開く)] リンクをクリックして CircleCI アプリケーションに移動します。CircleCI アプリケーションの起動中には開始ページが数分間表示され、その後自動的にホームページにリダイレクトされます。
2. [Get Started (開始)] ボタンをクリックして登録またはサインインします。 最初にログインしたユーザーなので、管理者になります。
3. [Hello World]({{site.baseurl}}/ja/2.0/hello-world/) ページを使用してプロジェクトを追加します。

## トラブルシューティング

最初のビルドが正常に実行されない場合は、CircleCI の[トラブルシューティング]({{site.baseurl}}/ja/2.0/troubleshooting/)ガイドや、「[Nomad クラスタの動作の概要]({{site.baseurl}}/ja/2.0/nomad/)」ドキュメントを参照し、ビルダのステータスを調べる方法を確認してください。

ビルドコンテナが起動し、イメージのダウンロードが完了すると、直ちに最初のビルドが開始されます。

約 15分が経過し、[Refresh (更新)] ボタンをクリックしても更新が行われない場合は、[CircleCI サポート](https://support.circleci.com/hc/ja)にお問い合わせください。

### サーバーポート

下表に、CircleCI 2.16 で使用されるマシンのポートを記載します。

| **マシンタイプ** | **ポート番号** | **プロトコル** | **方向** | **送信元・送信先** | **用途** | **メモ** |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| **Services マシン** | 80 | TCP | インバウンド | エンドユーザー | HTTP Web アプリケーショントラフィック | |
| | 443 | TCP | インバウンド | エンドユーザー | HTTPS Web アプリケーショントラフィック | |
| | 7171 | TCP | インバウンド | エンドユーザー | Artifacts アクセス | |
| | 8081 | TCP | インバウンド | エンドユーザー | Artifacts アクセス | |
| | 22 | TCP | インバウンド | 管理者 | SSH | |
| | 8800 | TCP | インバウンド | 管理者 | 管理者コンソール | |
| | 8125 | UDP | インバウンド | Nomad クライアント | メトリクス | |
| | 8125 | UDP | インバウンド | Nomad サーバー | メトリクス | 外部処理用 Nomad サーバーを使用する場合のみ | |
| | 8125 | UDP | インバウンド | すべてのデータベースサーバー | メトリクス | 外部処理用データベースを使用する場合のみ |
{: class="table table-striped"}

| **マシンタイプ** | **ポート番号** | **プロトコル** | **方向** | **送信元・送信先** | **用途** | **メモ** |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| **Services マシン** | 4647 | TCP | 双方向 | Nomad クライアント | 内部通信 | |
| | 8585 | TCP | 双方向 | Nomad クライアント | 内部通信 | |
| | 7171 | TCP | 双方向 | Nomad クライアント | 内部通信 | |
| | 3001 | TCP | 双方向 | Nomad クライアント | 内部通信 | |
| | 80 | TCP | 双方向 | GitHub Enterprise / GitHub.com (該当する方) | Webhook / API アクセス | |
| | 443 | TCP | 双方向 | GitHub Enterprise / GitHub.com (該当する方) | Webhook / API アクセス | |
| | 80 | TCP | アウトバウンド | AWS API エンドポイント | API アクセス | AWS 上で実行される場合のみ | |
| | 443 | TCP | アウトバウンド | AWS API エンドポイント | API アクセス | AWS 上で実行される場合のみ | |
| |5432 | TCP | アウトバウンド | PostgreSQL サーバー | PostgreSQL データベース接続 | 外部処理用データベースを使用する場合のみ。 ポートはユーザー定義だが、デフォルトの PostgreSQL ポートを想定。 |
{: class="table table-striped"}

| **マシンタイプ** | **ポート番号** | **プロトコル** | **方向** | **送信元・送信先** | **用途** | **メモ** |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| **Services マシン** | 27017 | TCP | アウトバウンド | MongoDB サーバー | MongoDB データベース接続 | 外部処理用データベースを使用する場合のみ。 ポートはユーザー定義だが、デフォルトの MongoDB ポートを想定。 | |
| 5672 | TCP | アウトバウンド | RabbitMQ サーバー | RabbitMQ 接続 | 外部処理用 RabbitMQ を使用する場合のみ | |
| 6379 | TCP | アウトバウンド | Redis サーバー | Redis 接続 | 外部処理用 Redis を使用する場合のみ | |
| 4647 | TCP | アウトバウンド | Nomad サーバー | Nomad サーバー接続 | 外部処理用 Nomad サーバーを使用する場合のみ | |
| 443 | TCP | アウトバウンド | CloudWatch エンドポイント | メトリクス | AWS CloudWatch を使用する場合のみ |
{: class="table table-striped"}


| **マシンタイプ** | **ポート番号** | **プロトコル** | **方向** | **送信元・送信先** | **用途** | **メモ** |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| **Nomad クライアント** | 64535-65535 | TCP | インバウンド | エンドユーザー | ビルド機能への SSH | |
| | 80 | TCP | インバウンド | 管理者 | CircleCI 管理者 API アクセス | |
| | 443 | TCP | インバウンド | 管理者 | CircleCI 管理者 API アクセス | |
| | 22 | TCP | インバウンド | 管理者 | SSH | |
| | 22 | TCP | アウトバウンド | GitHub Enterprise / GitHub.com (該当する方) | GitHub からコードをダウンロード | |
| | 4647 | TCP | 双方向 | Services マシン | 内部通信 | |
| | 8585 | TCP | 双方向 | Services マシン | 内部通信 | |
| | 7171 | TCP | 双方向 | Services マシン | 内部通信 | |
| | 3001 | TCP | 双方向 | Services マシン | 内部通信 | |
| | 443 | TCP | アウトバウンド | クラウドストレージプロバイダー | アーティファクトストレージ | 外部アーティファクトストレージを使用する場合のみ | |
| |53 | UDP | アウトバウンド | 内部 DNS サーバー | DNS 解決 | これは、正しい操作に必要なすべての DNS 名をジョブが解決できることを保証するためです |
{: class="table table-striped"}


| **マシンタイプ** | **ポート番号** | **プロトコル** | **方向** | **送信元・送信先** | **用途** | **メモ** |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| **GitHub Enterprise / GitHub.com (該当する方)** | 22 | TCP | インバウンド | Services マシン | Git アクセス | |
| | 22 | TCP | インバウンド | Nomad クライアント | Git アクセス | |
| | 80 | TCP | インバウンド | Nomad クライアント | API アクセス | |
| | 443 | TCP | インバウンド | Nomad クライアント | API アクセス | |
| | 80 | TCP | 双方向 | Services マシン | Webhook / API アクセス | |
| | 443 | TCP | 双方向 | Services マシン | Webhook / API アクセス | |
{: class="table table-striped"}


| **マシンタイプ** | **ポート番号** | **プロトコル** | **方向** | **送信元・送信先** | **用途** | **メモ** |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| **PostgreSQL サーバー** | 5432 | TCP | 双方向 | PostgreSQL サーバー | PostgreSQL 複製 | 外部処理用データベースを使用する場合のみ。 ポートはユーザー定義だが、デフォルトの PostgreSQL ポートを想定。 |
{: class="table table-striped"}


| **マシンタイプ** | **ポート番号** | **プロトコル** | **方向** | **送信元・送信先** | **用途** | **メモ** |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| **MongoDB サーバー** | 27017 | TCP | 双方向 | MongoDB サーバー | MongoDB 複製 | 外部処理用データベースを使用する場合のみ。 ポートはユーザー定義だが、デフォルトの MongoDB ポートを想定。 |
{: class="table table-striped"}


| **マシンタイプ** | **ポート番号** | **プロトコル** | **方向** | **送信元・送信先** | **用途** | **メモ** |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| **RabbitMQ サーバー** | 5672 | TCP | インバウンド | Services マシン | RabbitMQ 接続 | 外部処理用 RabbitMQ を使用する場合のみ | |
| 5672 | TCP | 双方向 | RabbitMQ サーバー | RabbitMQ ミラーリング | 外部処理用 RabbitMQ を使用する場合のみ |
{: class="table table-striped"}



| **マシンタイプ** | **ポート番号** | **プロトコル** | **方向** | **送信元・送信先** | **用途** | **メモ** |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| **Redis サーバー** | 6379 | TCP | インバウンド | Services マシン | Redis 接続 | 外部処理用 Redis を使用する場合のみ | |
| 6379 | TCP | 双方向 | Redis サーバー | Redis 複製 | 外部処理用 Redis を使用し、Redis 複製 (オプション) を使用する場合のみ |
{: class="table table-striped"}



| **マシンタイプ** | **ポート番号** | **プロトコル** | **方向** | **送信元・送信先** | **用途** | **メモ** |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| **Nomad サーバー** | 4646 | TCP | インバウンド | Services マシン | Nomad サーバー接続 | 外部処理用 Nomad サーバーを使用する場合のみ | |
| 4647 | TCP | インバウンド | Services マシン | Nomad サーバー接続 | 外部処理用 Nomad サーバーを使用する場合のみ | |
| 4648 | TCP | 双方向 | Nomad サーバー | Nomad サーバー内部通信 | 外部処理用 Nomad サーバーを使用する場合のみ |
{: class="table table-striped"}
