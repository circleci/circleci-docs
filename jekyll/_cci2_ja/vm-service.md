---
layout: classic-docs
title: "VM サービスの設定"
category:
  - administration
order: 12
description: "`machine` Executor とリモート Docker ジョブを使用する Server での VM サービスの設定"
---

お使いの CircleCI 環境に合わせて VM サービスを設定する方法と、独自の VM サービスイメージをカスタマイズする方法について説明します。

* 目次
{:toc}

## 概要

CircleCI Server のユーザーは、VM サービスを使用すると、[リモート Docker 環境](https://circleci.com/docs/ja/2.0/building-docker-images)と [`machine` Executor](https://circleci.com/docs/ja/2.0/executor-types/#machine-を使用する) を使用してジョブを実行できます。

## 設定

![CircleCI Server での VM サービスの設定]({{site.baseurl}}/assets/img/docs/vm-service.png)

VM サービスを設定するには、Replicated 管理コンソールで AWS EC2 オプションを選択することをお勧めします。これで、CircleCI が専用の EC2 インスタンスを使用してリモート Docker および `machine` Executor ジョブを実行できるようになります。

VM サービス用にカスタム [Amazon Machine Image](https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/AMIs.html) (AMI) を提供しない場合、Server 上の `machine` Executor とリモート Docker ジョブは、クラウドにデフォルトで用意されているのと同じマシンイメージ (Docker バージョン `17.03.0-ce` および docker-compose バージョン `1.9.0` を使用した Ubuntu 14.04 イメージ) と一般的な言語、ツール、フレームワークの一式を使用して実行されます。 詳細については、[image-builder リポジトリの `picard-vm-image` ブランチ](https://github.com/circleci/image-builder/tree/picard-vm-image/circleci-provision-scripts)を参照してください。

## カスタマイズ

場合によっては、お使いの CircleCI 環境に合わせて VM サービスイメージをカスタマイズすることが有効です。たとえば、他のバージョンの Docker や docker-compose を指定したり、CI/CD パイプラインに依存関係を追加インストールしたりすることができます。 カスタマイズしないと、こうした追加インストールや更新のステップをコミットのたびに `config.yml` ファイルの中で実行しなければならなくなります。

カスタム VM サービスイメージをビルドするには、<https://github.com/circleci/image-builder/tree/picard-vm-image> のリポジトリブランチを使用します。

`aws-vm.json` で必須グループを入力したら、`packer build aws-vm.json` コマンドを実行します。 アップロードにはアクセスキーとシークレットキーが必要です。 キーとシークレットのプロセスは要件に従って処理しますが、`ami_groups` を組織内に限定することを検討してください。

詳細については、<https://packer.io/docs/builders/amazon-ebs.html#ami_groups> を参照してください。 また、設定の詳細については、<https://github.com/circleci/image-builder/blob/picard-vm-image/provision.sh> を参照してください。

使用するイメージに `circleci` ユーザーを関連付ける必要があります。[https://github.com/circleci/image-builder/blob/picard-vm-image/aws_user_data](https://github.com/circleci/image-builder/blob/picard-vm-image/aws_user_data) の例を参照してください。
