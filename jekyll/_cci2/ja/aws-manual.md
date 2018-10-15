---
layout: classic-docs
title: "Amazon Webサービスに手動でCircleCI 2.0をインストールする"
category:
  - 管理
order: 11
hide: true
published: false
description: "Amazon Webサービス(AWS)に手動でCircleCIをインストールする方法"
---
このドキュメントでは、Amazon Webサービス(AWS)に手動でCircleCI 2.0をインストールする詳細手順について説明します。このドキュメントには以下のセクションがあります。

- TOC {:toc}

CircleCI Enterpriseがインストールされていれば、現在のインストールでCircleCI 2.0の機能にアクセスでき、現在の契約およびサポートレベル内での制限はありません。 アップグレードの方法については、CircleCIアカウント担当者にお問い合わせください。

- 注: - CircleCI 2.0はAWS上でのみ利用できます。
- チームで新しいCircleCI 2.0の`.circleci/config.yml`ファイルをリポジトリに作成し、新しい2.0プロジェクトを段階的に追加しながら、それと平行して`circle.yml`構成ファイルを使用する1.0プロジェクトを引き続きビルドすることもできます。 

## 前準備

インストール手順の開始前に、次の情報が利用可能なことを確認します。

- CircleCIライセンスファイル(.rli)。ライセンスについては、[CircleCIサポート](https://support.circleci.com/hc/en-us)にお問い合わせください。
- AWSアクセスキー、AWS秘密キー、AWSサブネットID。
- AWSリージョン、たとえば`us-west-2`。
- AWS仮想プライベートクラウド(VPC)のID。自分のアカウントがデフォルトVPCを使用するよう構成されていれば、デフォルトVPC IDは、Amazonの [アカウントの属性] に記載されています。
- VPCの [`enableDnsSupport`] を`true`に設定し、Amazonが提供するIPアドレス169.254.169.253のDNSサーバー、またはVPC IPv4ネットワーク範囲のベース+2の予約IPアドレスへのクエリが成功するようにします。 さらに詳しい情報については、Amazon Webサービスのドキュメントにある[VPCでのDNSの使用](https://docs.aws.amazon.com/AmazonVPC/latest/UserGuide/vpc-dns.html#vpc-dns-updating)を参照してください。

## 非公開サブネットの要件

AWS上の非公開サブネットをCircleCIで使用するには、次の追加設定が必要です。

- ビルダボックス用の非公開サブネットは、ネットワークアドレス変換(NAT)インスタンスまたはインターネット・ゲートウェイで、インターネットへの外向きトラフィック用に構成されている必要があります。
- [S3用のVPCエンドポイント](https://aws.amazon.com/blogs/aws/new-vpc-endpoint-for-amazon-s3/)を有効にします。 S3用のVPCエンドポイントを有効にすると、CircleCIや、サブネット内の他のノードについて、S3動作が大幅に改良されます。
- NATインスタンスに、多くのネットワーク動作に耐えられるよう、十分な性能があることを確認します。 展開の仕様によっては、Dockerや外部のネットワークリソースを使用して、NATインスタンスを並列性の高いビルドにすることもできます。 NATの性能が不十分な場合、ネットワークやキャッシュの動作速度が低下する可能性があります。
- https://github.comと統合する場合、ネットワークのアクセス制御リスト(ACL)のホワイトリストにgithub.com webhooksが含まれていることを確認します。 GitHubと統合するときは、CircleCIを公開サブネットにセットアップするか、github.comのトラフィックを転送するための公開ロードバランサーをセットアップします。

<!--- Check whether the ACL needs to be more open so the services/build can download build images -->

## AWSインスタンスのサイズの決定

CircleCIコンテナのデフォルトサイズである2CPU/4GB RAMおよび2CPUオーバーヘッドを使用するM3、C3、R3マシンでサポートされるコンテナの数と、ビルドの同時実行数の一覧を、次の表に示します。

タイプ | サポートされるコンテナ数 | モデル | 注 \----|\---\---\---\---\---\---\-----|\---\----|\---\--- M3 | 最大3 | `m3.2xlarge` | 最大のM3インスタンス C3 | 最大6 | `c3.4xlarge` | メモリ割り当て制限あり C3 | 最大14 | `c3.8xlarge` | メモリ割り当て制限あり R3 | 最大3 | `r3.2slarge` | 大容量メモリ、CPU制限あり R3 | 最大7 | `r3.4xlarge` | 大容量メモリ、CPU制限あり R3 | 最大15 | `r3.8xlarge` | 大容量メモリ、CPU制限あり {: class="table table-striped"}

メモリを大量に使用するビルド、または各コンテナのデフォルトメモリ割り当てを増やすことを計画している場合は、R3インスタンスの選択が適切です。 周囲のノイズが多い、またはリソースの競合がある場合は、R3ファミリの追加メモリによって、デフォルトのコンテナ割り当てを変更せずビルドを高速化できます。

## 計画

プレビューリリースのインストールを開始する前に、次の情報とポリシーが利用可能なことを確認します。

- ネットワークプロキシを使用する場合、CircleCI 2.0のインストールを試みる前に、自社のアカウントチームに問い合わせます。
- サービス用に1つ、Buildersの最初のセット用に1つ、合計で最低2つのAWSインスタンスのプロビジョニングにアクセスできることを確認します。 ベストプラクティスとして、サービス用に、8つのvCPUと32GBのRAMを持つ`m4.2xlarge`インスタンスを使用することをお勧めします。
- AWSインスタンスには、Dockerコンテナをプルするため、およびライセンスを確認するため、外向けのアクセスが必要です。
- 必要なポート構成については、次の表を参照してください。

### 手動でのインストール手順

1. ServicesインスタンスへSSHで接続します。
2. `curl https://get.replicated.com/docker | sudo bash`を実行します。
3. 前の手順の最後で表示されるURLに移動します。
4. 2.0ライセンスを使用します。
5. ストレージを構成します。 ベストプラクティスとして、認証にインスタンスプロファイルを使用することをお勧めします。 ただし、AWS管理者用のIAM認証もサポートされています。 IAMユーザーでは、次のアクセス許可を使用します。 
        JSON
         {
             "Version": "2012-10-17",
             "Statement": [
                 {
                     "Effect": "Allow",
                     "Action": [
                         "ec2:RunInstances",
                         "ec2:TerminateInstances",
                         "ec2:Describe*",
                         "ec2:CreateTags",
                         "iam:GetUser",
                         "cloudwatch:*",
                         "sts:GetFederationToken"
                     ],
                     "Resource": [
                         "*"
                     ]
                 },
                 {
                     "Effect": "Allow",
                     "Action": [
                         "s3:*"
                     ],
                     "Resource": [
                         "arn:aws:s3:::YOUR-BUCKET-HERE",
                         "arn:aws:s3:::YOUR-BUCKET-HERE/*"
                     ]
                 }
             ]
         }

6. vm-serviceを構成します。AWSユーザーにはこれらのアクセス許可が必要です。S3用の同じユーザーを使用する場合、両方のアクセス許可のセットが必要です。 
        JSON
         {
             "Version": "2012-10-17",
             "Statement": [
                 {
                     "Action": [
                         "ec2:RunInstances",
                         "ec2:CreateTags"
                     ],
                     "Effect": "Allow",
                     "Resource": "arn:aws:ec2:HERE-IS-REGION-OR-*:*"
                 },
                 {
                     "Action": [
                         "ec2:Describe*"
                     ],
                     "Effect": "Allow",
                     "Resource": "*"
                 },
                 {
                     "Action": [
                         "ec2:TerminateInstances"
                     ],
                     "Effect": "Allow",
                     "Resource": "arn:aws:ec2:HERE-IS-REGION-OR-*:*:instance/*",
                     "Condition": {
                         "StringEquals": {
                             "ec2:ResourceTag/ManagedBy": "circleci-vm-service"
                         }
                     }
                 }
             ]
         }

7. EC2セキュリティグループに、次のルールを構成します。
    
    | プロトコル | ポートの範囲 | ソース | | \---\----- | \---\---\---- | \---\---- | | TCP | 22 | 0.0.0.0 | | TCP | 2376 | 0.0.0.0 | | TCP | 32768-61000| 0.0.0.0 | {: class="table table-striped"}

8. `m4.xlarge`または`m4.4xlarge`を使用して2.0 Buildersクラスタをインストールするには、適切なAWS領域において、各ビルダについて次の公開CircleCI AMIのいずれかを開始します(開始する数は、希望する同時ユーザー数によって異なります)。 {#builder}**注: **CircleCIは、スポットインスタンスをBuilderコンポーネントとして使用することを考慮し、ビルドのコンテナごとにデフォルトで4GBを割り当てます。
    
    領域 | AMI \---\---\---\---\----- |\---\---\---\---- ap-northeast-1 | ami-eeffcd89 ap-northeast-2 | ami-8eec31e0 ap-southeast-1 | ami-5823a63b ap-southeast-2 | ami-7c12181f eu-central-1 | ami-0f32ec60 eu-west-1 | ami-821a14e4 sa-east-1 | ami-3a026d56 us-east-1 | ami-7d71046b us-east-2 | ami-eec5e28b us-west-1 | ami-45c8ee25 us-west-2 | ami-18492c78 {: class="table table-striped"}

9. Builderのインスタンスを、次の属性を持つセキュリティグループに配置します。

- ビルダボックスおよびサービスボックスとの間で、すべてのトラフィックが双方向でホワイトリストに指定されている。
- ユーザー用に、ポート22、80、443、64535～65535がホワイトリストに指定されている。大きい番号のポートは、ユーザーがビルドコンテナに`ssh`で接続できるようにするためのSSH機能に使用されます。

1. インストールを開始するには、この[Terraformスクリプト](https://github.com/circleci/enterprise-setup/blob/ccie2/nomad-cluster.tf)を使用します。 5～15分で、マシンでビルドを受け付ける準備が完了します。

## 使用開始の次の手順

1. ダッシュボードの [開く] リンクをクリックすると、CircleCI アプリに移動します。CircleCIアプリケーションの起動中に開始ページが少しの間表示されてから、ホームページへ自動的に転送されます。 
2. [使用開始] ボタンをクリックし、サインアップまたはサインインします。最初にログインしたユーザーは管理者になります。
3. [Hello World]({{site.baseurl}}/2.0/hello-world/)ドキュメントを使用して、プロジェクトを追加します。

## トラブルシューティング

CircleCIのサイドバー・ナビゲーションにあるレンチのアイコンをクリックし、フリートの状態をチェックします。 - リストにインスタンスが表示されない場合、最初のBuilderがまだ開始中です。 ビルドコンテナの開始中、最初のビルドがキューに置かれたままになることがあります。 - リストにBuilderのインスタンスが表示されているが、状態が開始中の場合、ビルドコンテナのイメージをダウンロードし、最初のビルドコンテナを開始する作業がまだ終了していません。

ビルドコンテナが開始し、イメージのダウンロードが完了した後で、最初のビルドがただちに開始されます。

15分間更新がなく、[更新] ボタンを押しても更新が行われない場合、[CircleCIサポート](https://support.circleci.com/hc/en-us)にお問い合わせください。