---
layout: classic-docs
title: "Installing CircleCI v2.16 on Amazon Web Services with Terraform"
category:
  - administration
order: 10
description: "Amazon Webサービス(AWS)にCircleCIをインストールする方法"
---
This document provides requirements and step-by-step instructions for installing CircleCI v2.16 on Amazon Web Services (AWS) with Terraform in the following sections.

- 目次
{:toc}

Refer to the [v2.16 Changelog](https://circleci.com/server/changelog) for what's new and fixed in this release.

**Notes:** - CircleCI v2.16 may be installed without a support agreement on AWS using the examples and instructions in this document. - It is possible to install and configure CircleCI on Azure or any other platform used in your organization with a Platinum CircleCI support agreement. Contact [CircleCI support](https://support.circleci.com/hc/en-us/requests/new) or your account representative to get started.

## System Requirements

This section defines the system requirements for installing CircleCI v2.16.

### Services Machine
{:no_toc}

The Services machine hosts the core of the Server product, including the user-facing website, API engine, datastores, and Nomad job scheduler. It is best practice to use an isolated machine.

The following table defines the Services machine CPU, RAM, and disk space requirements:

Number of daily active CircleCI users| CPU | RAM| Disk space | NIC speed \---\---\---\---\---\---\---\---\---\---\---|\---\---\---|\----|\---\---\---\---|\---\---\---- <50 | 8 cores | 32GB | 100GB | 1Gbps 50-250 | 12 cores | 64GB | 200GB | 1Gbps 251-1000 | 16 cores | 128GB | 500GB | 10Gbps 1001-5000 | 20 cores | 256GB | 1TB | 10Gbps 5000+ | 24 cores | 512GB | 2TB | 10Gbps
{: class="table table-striped"}

### Externalization
{:no_toc}

With a Platinum support agreement, it is possible to configure the following services to run external to the Services machine for improved performance:

- PostgreSQL
- MongoDB
- Vault
- Rabbitmq
- Redis
- Nomad 
- Slanger

Contact support to evaluate your installation against the current requirements for running external services.

### Nomad Clients
{:no_toc}

Nomad client machines run the CircleCI jobs that were scheduled by the Services machine. Following are the Minimum CPU, RAM, and disk space requirements per client for the default [resource class]({{site.baseurl}}/2.0/configuration-reference/#resource_class):

- CPU: 4 cores
- RAM: 16GB
- Disk space: 100GB
- NIC speed: 1Gbps

The following table defines the number of Nomad clients to make available as a best practice. Scale up and down according to demand on your system:

Number of daily active CircleCI users | Number of Nomad client machines \---\---\---\---\---\---\---\---\---|\---\---\---\---\---\---\----- <50 | 1-5 50-250 | 5-10 250-1000 | 10-15 5000+ | 15+
{: class="table table-striped"}

## Installation Prerequisites

次の自動インフラストラクチャ・プロビジョニング・ソフトウェアをインストールします。

- Terraform。 [Terraformのダウンロード](https://www.terraform.io/downloads.html)で、お使いのアーキテクチャ用のパッケージを探してください。

インストール手順の開始前に、次の情報が利用可能なことを確認します。

- CircleCIライセンスファイル(.rli)。ライセンスについては、[CircleCIサポート](https://support.circleci.com/hc/en-us/requests/new)にお問い合わせください。
- AWSアクセスキーとAWS秘密キー。
- Name of [AWS EC2 SSHキー](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-key-pairs.html)の名前。
- AWSリージョン、たとえば`us-west-2`。
- AWS Virtual Private Cloud (VPC) ID and AWS Subnet ID. Your default VPC ID is listed under Account Attributes in Amazon if your account is configured to use a default VPC.
- VPCの [`enableDnsSupport`] を`true`に設定し、Amazonが提供するIPアドレス169.254.169.253のDNSサーバー、またはVPC IPv4ネットワーク範囲のベース+2の予約IPアドレスへのクエリが成功するようにします。 さらに詳しい情報については、Amazon Webサービスのドキュメントにある[VPCでのDNSの使用](https://docs.aws.amazon.com/AmazonVPC/latest/UserGuide/vpc-dns.html#vpc-dns-updating)を参照してください。

### 非公開サブネットの要件
{:no_toc}

AWS上の非公開サブネットをCircleCIで使用するには、次の追加設定が必要です。

- ビルダボックス用の非公開サブネットは、[NATゲートウェイ](https://docs.aws.amazon.com/AmazonVPC/latest/UserGuide/vpc-nat-gateway.html)または[インターネットゲートウェイ](https://docs.aws.amazon.com/AmazonVPC/latest/UserGuide/VPC_Internet_Gateway.html)で、添付のルートテーブルにより、インターネットへの外向けトラフィック用に構成する必要があります。 **Note:** The subnet should be large enough to *never* exhaust the addresses.
- [S3用のVPCエンドポイント](https://aws.amazon.com/blogs/aws/new-vpc-endpoint-for-amazon-s3/)を有効にします。 S3用のVPCエンドポイントを有効にすると、CircleCIや、サブネット内の他のノードについて、S3動作が大幅に改良されます。
- NATインスタンスに、多くのネットワーク動作に耐えられるよう、十分な性能があることを確認します。 展開の仕様によっては、Dockerや外部のネットワークリソースを使用して、NATインスタンスを並列性の高いビルドにすることもできます。 NATの性能が不十分な場合、ネットワークやキャッシュの動作速度が低下する可能性があります。
- [github.com](https://github.com)と統合する場合、ネットワークのアクセス制御リスト(ACL)のホワイトリストにGitHub webhooksのポート80および443が含まれていることを確認します。 GitHubと統合するときは、CircleCIを公開サブネットにセットアップするか、github.comのトラフィックを転送するための公開ロードバランサーをセットアップします。
- CircleCIインストールのインスタンスにアクセス可能な必要のあるポートの詳細については、「[管理者向け概要]({{site.baseurl}}/2.0/overview#services)」の「サービス」セクションを参照してください。

<!--- Check whether the ACL needs to be more open so the services/build can download build images -->

## 計画

プレビューリリースのインストールを開始する前に、次の情報とポリシーが利用可能なことを確認します。

- ネットワークプロキシを使用する場合、CircleCI 2.0のインストールを試みる前に、自社のアカウントチームに問い合わせます。
- サービス用に1つ、Nomad Clientsの最初のセット用に1つ、最低2つのAWSインスタンスのプロビジョニングを計画します。 ベストプラクティスとして、サービスとNomad Clientsインスタンスの両方に、8つのvCPUと32GBのRAMを持つ`m4.2xlarge`インスタンスを使用することをお勧めします。
- AWSインスタンスには、Dockerコンテナをプルするため、およびライセンスを確認するため、外向けのアクセスが必要です。
- 必要なAWSエンティティをTerraformでプロビジョニングするには、次のアクセス許可を持つIAMユーザーが必要です。

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
    

## Terraformによるインストール

1. Clone the [Setup](https://github.com/circleci/enterprise-setup) repository (if you already have it cloned, make sure it is up-to-date and you are on the `master` branch: `git checkout master && git pull`).
2. `make init`を実行し、`terraform.tfvars`ファイルを初期化します(既に`terraform.tfvars`が存在する場合、同じディレクトリにバックアップされます)。
3. `terraform.tfvars`に、セクション1の適切なAWS値を入力します。 
4. Specify a `circle_secret_passphrase` in section 2, replacing `...` with alpha numeric characters. Passphrase cannot be empty.
5. Nomad Clientsのインスタンスタイプを指定します。 デフォルトでは、Nomad Clients用の `terraform.tfvars`ファイルに指定される値は `m4.2xlarge` (8つのvCPU、32GBのRAM)です。 各Nomad Clientsが同時に実行できるCircleCIジョブの数を増やすには、`terraform.tfvars`ファイルのセクション2を変更し、 `nomad_client_instance_type`の値を大きくします。 詳細については、AWSの「[Amazon EC2インスタンスタイプ](https://aws.amazon.com/ec2/instance-types)」ガイドを参照してください。 **注: **`builder_instance_type`は1.0でのみ使用されるもので、セクション3ではデフォルトで無効になっています。 
6. `terraform apply`を実行してプロビジョニングを行います。
7. Terraform出力の末尾にあるURLに移動し、指示に従います。
8. ライセンスを入力します。
9. Register CircleCI as a new OAuth application in GitHub.com by following the instructions in the management console GitHub integration section.

- **Note:** If you get an "Unknown error authenticating via GitHub. Try again, or contact us." message, try using `http:` instead of `https:` for the Homepage URL and callback URL. 8. Copy the Client ID from GitHub and paste it into the entry field for GitHub Application Client ID. 9. Copy the Secret from GitHub and paste it into the entry field for GitHub Application Client Secret and click Test Authentication. 10. Complete the `Storage` section. It is best practice to use an instance profile for authentication (no additional configuration required). 11. [Remote Docker]({{site.baseurl}}/2.0/building-docker-images/)または`machine` executor機能の使用を計画している場合、vm-serviceを構成します(後からでも構成できます)。 ここでも、認証用のインスタンスプロファイルの使用をお勧めします(追加構成は必要ありません)。 12. 設定の適用後、管理コンソール・ダッシュボードに転送されます。 必要なDockerコンテナすべてをダウンロードするため、数分間が必要です。 管理コンソールで、`Failure reported from operator: no such image`が報告された場合、[スタート] を再クリックすると動作が続行します。 13. アプリケーションの開始後、CircleCIにログインし、2.0ビルドの実行を開始します。 14. You can use [our realitycheck repo](https://github.com/circleci/realitycheck) to check basic CircleCI functionality.

## Validating Your Installation

1. ダッシュボードの [開く] リンクをクリックすると、CircleCI アプリに移動します。CircleCIアプリケーションの起動中に開始ページが少しの間表示されてから、ホームページへ自動的に転送されます。
2. Sign up or sign in by clicking the Get Started button. Because you are the first user to log in, you become the Administrator.
3. [Hello World]({{site.baseurl}}/2.0/hello-world/)ドキュメントを使用して、プロジェクトを追加します。

## トラブルシューティング

最初のビルドが正しく実行されない場合、弊社の[トラブルシューティング]({{site.baseurl}}/2.0/troubleshooting/)ガイドや、『[Nomadクラスタの動作の概要]({{site.baseurl}}/2.0/nomad/)』ドキュメントを参照し、ビルダのステータスを調べる方法を確認します。

ビルドコンテナが開始し、イメージのダウンロードが完了した後で、最初のビルドがただちに開始されます。

15分間更新がなく、[更新] ボタンを押しても更新が行われない場合、[CircleCIサポート](https://support.circleci.com/hc/en-us)にお問い合わせください。

### Server Ports

Following is the list of ports for machines in a CircleCI 2.16 installation:

| **Machine type** | **Port number** | **Protocol** | **Direction** | **Source / destination** | **Use** | **Notes** | | \---\--- | \---\--- | \---\--- | \---\--- | \---\--- | \---\--- | \---\--- | | **Services Machine** | 80 | TCP | Inbound | End users | HTTP web app traffic | | | | 443 | TCP | Inbound | End users | HTTPS web app traffic | | | | 7171 | TCP | Inbound | End users | Artifacts access | | | | 8081 | TCP | Inbound | End users | Artifacts access | | | | 22 | TCP | Inbound | Administrators | SSH | | | | 8800 | TCP | Inbound | Administrators | Admin console | | | | 8125 | UDP | Inbound | Nomad Clients | Metrics | | | | 8125 | UDP | Inbound | Nomad Servers | Metrics | Only if using externalised Nomad Servers | | | 8125 | UDP | Inbound | All Database Servers | Metrics | Only if using externalised databases |
{: class="table table-striped"}

| **Machine type** | **Port number** | **Protocol** | **Direction** | **Source / destination** | **Use** | **Notes** | | \---\--- | \---\--- | \---\--- | \---\--- | \---\--- | \---\--- | \---\--- | | **Services Machine** | 4647 | TCP | Bi-directional | Nomad Clients | Internal communication | | | | 8585 | TCP | Bi-directional | Nomad Clients | Internal communication | | | | 7171 | TCP | Bi-directional | Nomad Clients | Internal communication | | | | 3001 | TCP | Bi-directional | Nomad Clients | Internal communication | | | | 80 | TCP | Bi-directional | GitHub Enterprise / GitHub.com (whichever applies) | Webhooks / API access | | | | 443 | TCP | Bi-directional | GitHub Enterprise / GitHub.com (whichever applies) | Webhooks / API access | | | | 80 | TCP | Outbound | AWS API endpoints | API access | Only if running on AWS | | | 443 | TCP | Outbound | AWS API endpoints | API access | Only if running on AWS | | | 5432 | TCP | Outbound | PostgreSQL Servers | PostgreSQL database connection | Only if using externalised databases. Port is user-defined, assuming the default PostgreSQL port. |
{: class="table table-striped"}

| **Machine type** | **Port number** | **Protocol** | **Direction** | **Source / destination** | **Use** | **Notes** | | \---\--- | \---\--- | \---\--- | \---\--- | \---\--- | \---\--- | \---\--- | | **Services Machine** | 27017 | TCP | Outbound | MongoDB Servers | MongoDB database connection | Only if using externalised databases. Port is user-defined, assuming the default MongoDB port. | | | 5672 | TCP | Outbound | RabbitMQ Servers | RabbitMQ connection | Only if using externalised RabbitMQ | | | 6379 | TCP | Outbound | Redis Servers | Redis connection | Only if using externalised Redis | | | 4647 | TCP | Outbound | Nomad Servers | Nomad Server connection | Only if using externalised Nomad Servers | | | 443 | TCP | Outbound | CloudWatch Endpoints | Metrics | Only if using AWS CloudWatch |
{: class="table table-striped"}


| **Machine type** | **Port number** | **Protocol** | **Direction** | **Source / destination** | **Use** | **Notes** | | \---\--- | \---\--- | \---\--- | \---\--- | \---\--- | \---\--- | \---\--- | | **Nomad Clients** | 64535-65535 | TCP | Inbound | End users | SSH into builds feature | | | | 80 | TCP | Inbound | Administrators | CircleCI Admin API access | | | | 443 | TCP | Inbound | Administrators | CircleCI Admin API access | | | | 22 | TCP | Inbound | Administrators | SSH | | | | 22 | TCP | Outbound | GitHub Enterprise / GitHub.com (whichever applies) | Download Code From GitHub. | | | | 4647 | TCP | Bi-directional | Services Machine | Internal communication | | | | 8585 | TCP | Bi-directional | Services Machine | Internal communication | | | | 7171 | TCP | Bi-directional | Services Machine | Internal communication | | | | 3001 | TCP | Bi-directional | Services Machine | Internal communication | | | | 443 | TCP | Outbound | Cloud Storage Provider | Artifacts storage | Only if using external artifacts storage | | | 53 | UDP | Outbound | Internal DNS Server | DNS resolution | This is to make sure that your jobs can resolve all DNS names that are needed for their correct operation |
{: class="table table-striped"}


| **Machine type** | **Port number** | **Protocol** | **Direction** | **Source / destination** | **Use** | **Notes** | | \---\--- | \---\--- | \---\--- | \---\--- | \---\--- | \---\--- | \---\--- | | **GitHub Enterprise / GitHub.com (whichever applies)** | 22 | TCP | Inbound | Services Machine | Git access | | | | 22 | TCP | Inbound | Nomad Clients | Git access | | | | 80 | TCP | Inbound | Nomad Clients | API access | | | | 443 | TCP | Inbound | Nomad Clients | API access | | | | 80 | TCP | Bi-directional | Services Machine | Webhooks / API access | | | | 443 | TCP | Bi-directional | Services Machine | Webhooks / API access | |
{: class="table table-striped"}


| **Machine type** | **Port number** | **Protocol** | **Direction** | **Source / destination** | **Use** | **Notes** | | \---\--- | \---\--- | \---\--- | \---\--- | \---\--- | \---\--- | \---\--- | | **PostgreSQL Servers** | 5432 | TCP | Bi-directional | PostgreSQL Servers | PostgreSQL replication | Only if using externalised databases. Port is user-defined, assuming the default PostgreSQL port. |
{: class="table table-striped"}


| **Machine type** | **Port number** | **Protocol** | **Direction** | **Source / destination** | **Use** | **Notes** | | \---\--- | \---\--- | \---\--- | \---\--- | \---\--- | \---\--- | \---\--- | | **MongoDB Servers** | 27017 | TCP | Bi-directional | MongoDB Servers | MongoDB replication | Only if using externalised databases. Port is user-defined, assuming the default MongoDB port. |
{: class="table table-striped"}


| **Machine type** | **Port number** | **Protocol** | **Direction** | **Source / destination** | **Use** | **Notes** | | \---\--- | \---\--- | \---\--- | \---\--- | \---\--- | \---\--- | \---\--- | | **RabbitMQ Servers** | 5672 | TCP | Inbound | Services Machine | RabbitMQ connection | Only if using externalised RabbitMQ | | | 5672 | TCP | Bi-directional | RabbitMQ Servers | RabbitMQ mirroring | Only if using externalised RabbitMQ |
{: class="table table-striped"}



| **Machine type** | **Port number** | **Protocol** | **Direction** | **Source / destination** | **Use** | **Notes** | | \---\--- | \---\--- | \---\--- | \---\--- | \---\--- | \---\--- | \---\--- | | **Redis Servers** | 6379 | TCP | Inbound | Services Machine | Redis connection | Only if using externalised Redis | | | 6379 | TCP | Bi-directional | Redis Servers | Redis replication | Only if using externalised Redis and using Redis replication (optional) |
{: class="table table-striped"}



| **Machine type** | **Port number** | **Protocol** | **Direction** | **Source / destination** | **Use** | **Notes** | | \---\--- | \---\--- | \---\--- | \---\--- | \---\--- | \---\--- | \---\--- | | **Nomad Servers** | 4646 | TCP | Inbound | Services Machine | Nomad Server connection | Only if using externalised Nomad Servers | | | 4647 | TCP | Inbound | Services Machine | Nomad Server connection | Only if using externalised Nomad Servers | | | 4648 | TCP | Bi-directional | Nomad Servers | Nomad Servers internal communication | Only if using externalised Nomad Servers |
{: class="table table-striped"}
