---
layout: classic-docs
title: "Amazon Web Services への CircleCI 2.0 の手動インストール"
category:
  - administration
order: 11
hide: true
published: false
description: "Amazon Web Services (AWS) 上に CircleCI を手動でインストールする方法"
---

以下のセクションに沿って、Amazon Web Services (AWS) 上に CircleCI 2.0 を手動でインストールする手順について説明します。

- 目次
{:toc}

CircleCI Enterprise をインストールしている場合は、現在の契約とサポート レベルの範囲で、CircleCI 2.0 の機能に無制限にアクセスすることができます。 アップグレードについてお困りの場合は、CircleCI のアカウント担当者にお問い合わせください。

- CircleCI 2.0 は AWS でのみ利用可能です。
- チームのリポジトリ内に新しい CircleCI 2.0 `.circleci/config.yml` ファイルを作成して、2.0 プロジェクトを少しずつ追加しながら、`circle.yml` 設定ファイルを使用する 1.0 プロジェクトのビルドを引き続き行うこともできます。

## 前提条件

インストールを開始する前に、以下を準備してください。

- CircleCI ライセンス ファイル (.rli)。ライセンスについては、[CircleCI サポート](https://support.circleci.com/hc/ja)にお問い合わせください。
- AWS アクセス キー、AWS シークレット キー、AWS サブネット ID。
- AWS リージョン。たとえば、`us-west-2`。
- AWS 仮想プライベート クラウド (VPC) ID。 デフォルト VPC を使用するようにアカウントが構成されている場合は、デフォルト VPC の ID が Amazon の [アカウントの属性] の下にリストされます。
- VPC の [`enableDnsSupport`] 設定を `true` に設定します。これは、IP アドレス 169.254.169.253 または予約済み IP アドレス (VPC IPv4 ネットワーク範囲のベースに 2 を加算したアドレス) で Amazon が提供する DNS サーバーへのクエリが成功するようにします。 詳細については、Amazon Web Services ドキュメントの「[VPC での DNS の使用](https://docs.aws.amazon.com/ja_jp/vpc/latest/userguide/vpc-dns.html#vpc-dns-updating)」を参照してください。

## プライベート サブネットの要件

AWS でのプライベート サブネットの使用を CircleCI でサポートするには、以下の追加設定が必要です。

- Builder boxes 用のプライベート サブネットは、ネットワーク アドレス変換 (NAT) インスタンスまたはインターネット ゲートウェイで、インターネットへのアウトバウンド トラフィック用に構成する必要があります。
- [S3 用 VPC エンドポイント](https://aws.amazon.com/jp/blogs/aws/new-vpc-endpoint-for-amazon-s3/)を有効にする必要があります。 S3 用 VPC エンドポイントを有効にすると、CircleCI およびサブネット内の他のノードに対する S3 操作が大幅に改善します。
- 高負荷のネットワーク操作に対しては NAT インスタンスを適切に強化します。 デプロイの仕様によっては、Docker および外部ネットワーク リソースを使用した高度並列ビルドによって NAT インスタンスが制約を受けるおそれがあります。 不適切な NAT によってネットワーク操作やキャッシュ操作が低速化するおそれがあります。
- https://github.com/ と連携する場合は、ネットワーク アクセス制御リスト (ACL) で github.com Web フックを許可します。 GitHub と連携する場合は、CircleCI をパブリック サブネット内に準備するか、パブリック ロード バランサーを使用して github.com トラフィックを転送するように設定します。

<!--- Check whether the ACL needs to be more open so the services/build can download build images -->

## AWS インスタンスのサイズ

以下の表では、M3、C3、R3 のマシンで、CircleCI のデフォルトのコンテナ サイズ (2 CPU、4 GB RAM、2 CPU オーバーヘッド) を使用してサポートされるコンテナまたは同時ビルドの数を示します。

| タイプ | サポートされるコンテナ数 | モデル          | メモ                   |
| --- | ------------ | ------------ | -------------------- |
| M3  | 最大 3         | `m3.2xlarge` | 最大の M3 インスタンス        |
| C3  | 最大 6         | `c3.4xlarge` | 制限付きメモリ割り当て          |
| C3  | 最大 14        | `c3.8xlarge` | 制限付きメモリ割り当て          |
| R3  | 最大 3         | `r3.2slarge` | High Memory、制限付き CPU |
| R3  | 最大 7         | `r3.4xlarge` | High Memory、制限付き CPU |
| R3  | 最大 15        | `r3.8xlarge` | High Memory、制限付き CPU |
{: class="table table-striped"}

R3 インスタンスは、メモリ消費量の多いビルドや、各コンテナのデフォルトのメモリ割り当て量を増やしたい場合に最適です。 ノイジー ネイバーの問題やリソースの競合が発生している場合は、R3 ファミリのメモリを追加することによって、デフォルトのコンテナ割り当てを変更しなくてもビルドをスピードアップできます。

## 計画

プレビュー リリースのインストールを開始する前に、以下の情報とポリシーを準備してください。

- ネットワーク プロキシを使用する場合は、CircleCI 2.0 をインストールする前に、お客様のアカウント チームに連絡してください。
- Services 用に 1 つ、Builders の最初のセット用に 1 つ、少なくとも 2 つの AWS インスタンスのプロビジョニングを行います。 ベスト プラクティスとして、Services に、8 基の CPU と 32 GB の RAM を備えた `m4.2xlarge` インスタンスを使用することをお勧めします。
- AWS インスタンスには、Docker コンテナをプルし、ライセンスを確認するために、アウトバウンド アクセスが必要です。
- 以下の表に、ポート構成の要件を示します。

### 手動インストールの手順

1. Services インスタンスに SSH 接続します。
2. `curl https://get.replicated.com/docker | sudo bash` コマンドを実行します。
3. 前の手順の最後に表示された URL に移動します。
4. 2.0 ライセンスを使用します。
5. ストレージを構成します。 ベスト プラクティスとして、認証にはインスタンス プロファイルを使用することをお勧めします。 なお、AWS 管理者向けの IAM 認証はサポートされます。 IAM ユーザーには、以下の権限を使用します。

     ```JSON
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
     ```

6. vm-service を構成します。 AWS ユーザーには以下の権限が必要です。 AWS ユーザーが S3 と同じユーザーの場合もあります。その場合は、両方の権限が必要になります。

     ```JSON
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
     ```

7. 以下のルールを持つ EC2 セキュリティ グループを設定します。
    
    | プロトコル | ポート範囲       | ソース     |
    | ----- | ----------- | ------- |
    | TCP   | 22          | 0.0.0.0 |
    | TCP   | 2376        | 0.0.0.0 |
    | TCP   | 32768-61000 | 0.0.0.0 |
     
{: class="table table-striped"}

8. 2.0 Builders クラスタをインストールするには、`m4.xlarge` または `m4.4xlarge` を使用し、適切な AWS リージョンで、各 Builder に対し以下のパブリック CircleCI AMI のいずれかを起動します (希望する同時実行数によって起動する数を調整します)。 {#builder} **メモ:** デフォルトでは、CircleCI はビルド コンテナごとに 4 GB を割り当てます。spot インスタンスを Builder コンポーネントとして使用することを検討してください。
    
    | リージョン          | AMI          |
    | -------------- | ------------ |
    | ap-northeast-1 | ami-eeffcd89 |
    | ap-northeast-2 | ami-8eec31e0 |
    | ap-southeast-1 | ami-5823a63b |
    | ap-southeast-2 | ami-7c12181f |
    | eu-central-1   | ami-0f32ec60 |
    | eu-west-1      | ami-821a14e4 |
    | sa-east-1      | ami-3a026d56 |
    | us-east-1      | ami-7d71046b |
    | us-east-2      | ami-eec5e28b |
    | us-west-1      | ami-45c8ee25 |
    | us-west-2      | ami-18492c78 |
     
{: class="table table-striped"}


9. 以下の属性を指定して、セキュリティ グループに Builder インスタンスを配置します。

- Builder boxes と Service box 間のすべてのトラフィックを許可する
- ユーザーにポート 22、80、443、64535-65535 を許可する SSH 機能にはポート番号の大きいポートが使用されます。これは、ユーザーがビルド コンテナに `ssh` 接続できるようにするためです。

10. インストールを開始するには、[Terraform スクリプト](https://github.com/circleci/enterprise-setup/blob/ccie2/nomad-cluster.tf)を使用します。 マシンがビルドを受け取れる状態になるまで、5 ～ 15 分程度かかります。

## 次のステップ

1. ダッシュボードで [Open (開く)] リンクをクリックして CircleCI アプリケーションに移動します。CircleCI アプリケーションの起動中には開始ページが数分間表示され、その後自動的にホームページにリダイレクトされます。
2. [Get Started (開始)] ボタンをクリックして登録またはサインインします。 最初にログインしたユーザーなので、管理者になります。
3. [Hello World]({{site.baseurl}}/2.0/hello-world/) ページを使用してプロジェクトを追加します。

## トラブルシューティング

CircleCI のサイド バーのナビゲーションにあるレンチのアイコンをクリックし、[Fleet State (フリート ステート)]を選択して、フリートの状態を確認します。

- リストに何も表示されない場合は、最初のビルドがまだ起動中です。 ビルド コンテナが起動するまで、最初のビルドはキュー内で待機します。
- リストに Builder インスタンスは表示されるものの、スタートアップ状態の場合は、ビルド コンテナ イメージのダウンロードがまだ完了しておらず、最初のビルド コンテナを起動中です。

ビルド コンテナが起動し、イメージのダウンロードが完了すると、直ちに最初のビルドが開始されます。

約 15 分が経過し、[Refresh (更新)] ボタンをクリックしても更新が行われない場合は、[CircleCI サポート](https://support.circleci.com/hc/ja)にお問い合わせください。