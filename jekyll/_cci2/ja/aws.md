---
layout: classic-docs
title: "Terraformを使用してAmazon WebサービスにCircleCI 2.0をインストールする方法"
category:
  - 管理
order: 10
description: "Amazon Webサービス(AWS)にCircleCIをインストールする方法"
---
このドキュメントでは、Terraformを使用してAmazon Webサービス(AWS)にCircleCI 2.0をインストールする詳細手順について説明します。このドキュメントには以下のセクションがあります。

* TOC {:toc}

CircleCI Enterpriseがインストールされていれば、現在のインストールでCircleCI 2.0の機能にアクセスでき、現在の契約およびサポートレベル内での制限はありません。 アップグレードの方法については、[CircleCIアカウント担当者](https://support.circleci.com/hc/en-us/requests/new)にお問い合わせください。

**注: **- CircleCI 2.0はAWS上でのみ利用できます。 - チームで新しいCircleCI 2.0の`circleci/config.yml`ファイルをリポジトリに作成し、新しい2.0プロジェクトを段階的に追加しながら、それと平行して`circle.yml`構成ファイルを使用する1.0プロジェクトを引き続きビルドできます。

## 前準備

次の自動インフラストラクチャ・プロビジョニング・ソフトウェアをインストールします。

* Terraform。 [Terraformのダウンロード](https://www.terraform.io/downloads.html)で、お使いのアーキテクチャ用のパッケージを探してください。

インストール手順の開始前に、次の情報が利用可能なことを確認します。

* CircleCIライセンスファイル(.rli)。ライセンスについては、[CircleCIサポート](https://support.circleci.com/hc/en-us/requests/new)にお問い合わせください。
* AWSアクセスキーとAWS秘密キー。
* Name of [AWS EC2 SSHキー](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-key-pairs.html)の名前。
* AWSリージョン、たとえば`us-west-2`。
* AWS仮想プライベートクラウド(VPC)のIDと、AWSサブネットID。自分のアカウントがデフォルトVPCを使用するよう構成されていれば、デフォルトVPC IDは、Amazonの [アカウントの属性] に記載されています。
* VPCの [`enableDnsSupport`] を`true`に設定し、Amazonが提供するIPアドレス169.254.169.253のDNSサーバー、またはVPC IPv4ネットワーク範囲のベース+2の予約IPアドレスへのクエリが成功するようにします。 さらに詳しい情報については、Amazon Webサービスのドキュメントにある[VPCでのDNSの使用](https://docs.aws.amazon.com/AmazonVPC/latest/UserGuide/vpc-dns.html#vpc-dns-updating)を参照してください。

## 非公開サブネットの要件

AWS上の非公開サブネットをCircleCIで使用するには、次の追加設定が必要です。

* ビルダボックス用の非公開サブネットは、[NATゲートウェイ](https://docs.aws.amazon.com/AmazonVPC/latest/UserGuide/vpc-nat-gateway.html)または[インターネットゲートウェイ](https://docs.aws.amazon.com/AmazonVPC/latest/UserGuide/VPC_Internet_Gateway.html)で、添付のルートテーブルにより、インターネットへの外向けトラフィック用に構成する必要があります。
* [S3用のVPCエンドポイント](https://aws.amazon.com/blogs/aws/new-vpc-endpoint-for-amazon-s3/)を有効にします。 S3用のVPCエンドポイントを有効にすると、CircleCIや、サブネット内の他のノードについて、S3動作が大幅に改良されます。
* NATインスタンスに、多くのネットワーク動作に耐えられるよう、十分な性能があることを確認します。 展開の仕様によっては、Dockerや外部のネットワークリソースを使用して、NATインスタンスを並列性の高いビルドにすることもできます。 NATの性能が不十分な場合、ネットワークやキャッシュの動作速度が低下する可能性があります。
* [github.com](https://github.com)と統合する場合、ネットワークのアクセス制御リスト(ACL)のホワイトリストにGitHub webhooksのポート80および443が含まれていることを確認します。 GitHubと統合するときは、CircleCIを公開サブネットにセットアップするか、github.comのトラフィックを転送するための公開ロードバランサーをセットアップします。
* CircleCIインストールのインスタンスにアクセス可能な必要のあるポートの詳細については、「[管理者向け概要]({{site.baseurl}}/2.0/overview#services)」の「サービス」セクションを参照してください。

<!--- Check whether the ACL needs to be more open so the services/build can download build images -->

## 計画

プレビューリリースのインストールを開始する前に、次の情報とポリシーが利用可能なことを確認します。

* ネットワークプロキシを使用する場合、CircleCI 2.0のインストールを試みる前に、自社のアカウントチームに問い合わせます。
* サービス用に1つ、Nomad Clientsの最初のセット用に1つ、最低2つのAWSインスタンスのプロビジョニングを計画します。 ベストプラクティスとして、サービスとNomad Clientsインスタンスの両方に、8つのvCPUと32GBのRAMを持つ`m4.2xlarge`インスタンスを使用することをお勧めします。
* AWSインスタンスには、Dockerコンテナをプルするため、およびライセンスを確認するため、外向けのアクセスが必要です。
* 必要なAWSエンティティをTerraformでプロビジョニングするには、次のアクセス許可を持つIAMユーザーが必要です。

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
4. セクション2に`circle_secret_passphrase`を指定します。`...`の部分は英数字に置き換えます。パスフレーズは空白にできません。
5. Nomad Clientsのインスタンスタイプを指定します。 デフォルトでは、Nomad Clients用の `terraform.tfvars`ファイルに指定される値は `m4.2xlarge` (8つのvCPU、32GBのRAM)です。 各Nomad Clientsが同時に実行できるCircleCIジョブの数を増やすには、`terraform.tfvars`ファイルのセクション2を変更し、 `nomad_client_instance_type`の値を大きくします。 詳細については、AWSの「[Amazon EC2インスタンスタイプ](https://aws.amazon.com/ec2/instance-types)」ガイドを参照してください。 **注: **`builder_instance_type`は1.0でのみ使用されるもので、セクション3ではデフォルトで無効になっています。 
6. `terraform apply`を実行してプロビジョニングを行います。
7. Terraform出力の末尾にあるURLに移動し、指示に従います。
8. ライセンスを入力します。
9. `Storage`セクションを入力します。ベストプラクティスとして、認証用のインスタンスプロファイルの使用をお勧めします(追加構成は必要ありません)。
10. [Remote Docker]({{site.baseurl}}/2.0/building-docker-images/)または`machine` executor機能の使用を計画している場合、vm-serviceを構成します(後からでも構成できます)。 ここでも、認証用のインスタンスプロファイルの使用をお勧めします(追加構成は必要ありません)。
11. 設定の適用後、管理コンソール・ダッシュボードに転送されます。 必要なDockerコンテナすべてをダウンロードするため、数分間が必要です。 管理コンソールで、`Failure reported from operator: no such image`が報告された場合、[スタート] を再クリックすると動作が続行します。
12. アプリケーションの開始後、CircleCIにログインし、2.0ビルドの実行を開始します。

## インストールの検証

1. ダッシュボードの [開く] リンクをクリックすると、CircleCI アプリに移動します。CircleCIアプリケーションの起動中に開始ページが少しの間表示されてから、ホームページへ自動的に転送されます。
2. [使用開始] ボタンをクリックし、サインアップまたはサインインします。最初にログインしたユーザーは管理者になります。
3. [Hello World]({{site.baseurl}}/2.0/hello-world/)ドキュメントを使用して、プロジェクトを追加します。

## トラブルシューティング

最初のビルドが正しく実行されない場合、弊社の[トラブルシューティング]({{site.baseurl}}/2.0/troubleshooting/)ガイドや、『[Nomadクラスタの動作の概要]({{site.baseurl}}/2.0/nomad/)』ドキュメントを参照し、ビルダのステータスを調べる方法を確認します。

ビルドコンテナが開始し、イメージのダウンロードが完了した後で、最初のビルドがただちに開始されます。

15分間更新がなく、[更新] ボタンを押しても更新が行われない場合、[CircleCIサポート](https://support.circleci.com/hc/en-us)にお問い合わせください。