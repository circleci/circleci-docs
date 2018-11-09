---
layout: classic-docs
title: "CircleCIデータのバックアップ"
category:
  - 管理
order: 50
description: "CircleCIインストールの定期的なバックアップ方法"
---
This document describes how to back up your CircleCI application so that you can recover from accidental or unexpected loss of CircleCI data on the Services machine:

* TOC {:toc}

**Note:** If you are running CircleCI with external databases configured, you must use separate standard backup mechanisms for those external datastores.

## データベースのバックアップ

The best practice for backing up your CircleCI Services machine is to use VM snapshots of the virtual disk acting as the root volume for the Services machine. 基盤となる仮想ディスクが、AWS EBSと同様にこの動作をサポートしていれば、停止時間なしにバックアップを実行できます。

## オブジェクトストレージのバックアップ

ビルドアーティファクト、出力、キャッシュは通常、AWS S3などのオブジェクトストレージ・サービスに保存されます。 これらのサービスは冗長性が高いため、別のバックアップを必要とする可能性は低いと考えられます。 An exception is if your instance is set up to store large objects locally on the Services machine, either directly on-disk or on an NFS volume. この場合、これらのファイルを別にバックアップし、復元時に同じ場所へマウントされることを保証する必要があります。

## AWS EBSのスナップショットの作成

AWS EBSスナップショットには、バックアップ処理を簡単にするため、いくつかの機能が搭載されています。

1. 手動でバックアップを作成するには、EC2コンソールでインスタンスを選択し、[アクション] > [イメージ] > [イメージの作成] を選択します。

2. 停止時間を避けるには、[リブートなし] オプションを選択します。復元用のAMIが作成され、新しいEC2インスタンスとしていつでも実行できます。

また、AWS APIを使用して、このプロセスを自動化することもできます。 それ以後のAMIやスナップショットは、前回のスナップショット以後の差分(変更されたブロック)分の大きさしかないため、頻繁にスナップショットを作成した場合に不必要なストレージコストは発生しません。詳細については、「[Amazon EBS スナップショットの利用料金はどのように計算されていますか?](https://aws.amazon.com/premiumsupport/knowledge-center/ebs-snapshot-billing/)」ドキュメントを参照してください。

## バックアップからの復元

テスト用バックアップの復元、または運用環境で復元を実行するとき、公開または非公開IPアドレスが変更されている場合は、新たに開始されたインスタンスにいくつかの変更が必要になることがあります。

1. Launch a fresh EC2 instance using the newly generated AMI from the previous steps.
2. Stop the app in the Management Console (at port 8800) if it is already running.
3. 管理コンソールのポート8800で構成されているホスト名が、正しいアドレスを反映していることを確認します。 ホスト名が変更されている場合、対応するGitHub OAuthアプリケーションの設定も変更するか、新しいOAuthアプリケーションを復元テスト用に作成し、そのアプリケーションにログインする必要があります。
4. Debian/Ubuntuの`/etc/default/replicated`および`/etc/default/replicated-operator`、またはRHEL/CentOSの`/etc/sysconfig/*`にある、バックアップされたインスタンスの公開および非公開IPアドレスへの参照をすべて、新しいIPアドレスに変更します。
5. From the root directory of the Services box, run `sudo rm -rf /opt/nomad`.
6. Restart the app in the Management Console at port 8800.

## ビルドレポートのクリーンアップ

ファイルシステム・レベルのデータ整合性の問題は稀であり、防止可能ですが、ビルドがシステムで実行中の特定の時間に作成されたバックアップでは、一部のデータ異常の可能性が高くなります。 たとえば、バックアップの時点でビルトが半分しか完了していなかった場合、コマンド出力の後半が存在せず、アプリケーションは恒久的に実行中の状態として示される可能性があります。

復元後に、データベース内の異常なビルドレコードをクリーンアップするには、Servicesマシンで次のコマンドを実行します。ここで、例のビルドURLは、CircleCIアプリケーションの実際のURLに置き換えます。

    $ circleci dev-console
    # コンソールのロードを待つ
    user=> (admin/delete-build "https://my-circleci-hostname.com/gh/my-org/my-project/1234")