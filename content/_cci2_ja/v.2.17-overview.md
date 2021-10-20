---
layout: classic-docs
title: "CircleCI Server v2.17 の新機能"
short-title: "CircleCI Server v2.17 の新機能"
description: "CircleCI Server v2.17 の入門ガイド"
categories:
  - getting-started
order: 1
---

CircleCI Server v2.17 の機能強化や不具合修正についてまとめます。 パッチ リリースを含むすべての変更の一覧は、[変更履歴](https://circleci.com/ja/server/changelog)でご確認ください。

## What's new in release 2.17
{: #whats-new-in-release-217 }

* ワークフローで Slack インテグレーションが利用できるようになりました。 ユーザーは、ワークフローの完了時に Slack 通知を受信するよう選択できます。
* CircleCI 環境へのアクセスを許可する組織を、管理者が制限できるようになりました。 この機能を有効化する方法の詳細については、2.17 の操作マニュアルのユーザー管理セクションを参照してください。
* 名称が変更された組織のフローを変更しました。 これにより、名称が変更された組織は今後エラーが発生しないようになります。 このユース ケースで回避策を適用していたユーザーは、今後その回避策は不要となります。
* ワークフローが占有する DB スペースが減り、管理が容易になります。
* GraphQL API の直前のキャッシュ改善し、全体的なパフォーマンスを改善しました。
* Added backpressure to avoid overwhelming nomad with requests, this will result in increased performance from existing nomad clusters.

## Fixed in release 2.17
{: #fixed-in-release-217 }

* GitHub API 応答処理と Web フック処理に関連するいくつかのバグを修正しました。
* Services マシンを再起動したときのスケジュール済みワークフローに関する問題を修正しました。
* 外部処理化するときのスケジュール済みワークフローの RabbitMQ ホスト名の変更について修正しました。
* 名前のないコンテキストを作成できなくなりました。 名前のないコンテキストを使用している場合は、既存の実行環境からアクセスできなくなります。
* メモリ不足エラーを回避するために、大量のビルド出力とテスト結果 XML の処理を最適化しました。
* CIRCLE_PULL_REQUEST 環境変数は、複数のフォークからビルドする際、すべてのケースで正しく設定されていませんでしたが、 これを修正しました。 これを修正しました。
* メッセージに [ci skip] を含むコミットの一部がいまだにビルドされていたバグを修正しました。
* ジョブが失敗した後に infrastructure_failure が発生するとワークフローがスタックするバグを修正しました。
* 同じ Nomad クライアントでの Docker ネットワークの重複が引き起こされるバグを修正しました (machine: true かつ vm-provider=on_host を使用してビルドを実行している場合)。
* ローカル ストレージを使用する際のパフォーマンスを改善しました。 以前は、デフォルト オプションの S3 ではなくローカル ストレージを使用すると、キャッシュの問題が発生していました (管理コンソールのストレージ ドライバー オプションで [None (なし)] を選択）。
* We have added more error checking and validation around GitHub’s API so the existing list commit endpoint no longer causes issues.
* Datadog API トークン フィールドはプレーン テキストで保存されていましたが、パスワード フィールドとして設定されるようになりました。
* ワークフローの多数のジョブへのファンアウトが制限されていた問題を修正しました。


## Updated in release 2.17
{: #updated-in-release-217 }

* AWS 向け Ubuntu 16.04 をベースとする新しい Machine Executor AMI を導入しました。 Docker 18.09.3 がインストールされた Ubuntu 16.04 では、apt-daily サービスと apt-daily-upgrade サービスが無効になっています。 正式に切り替える前に、以下の AMI でお試しになることを強くお勧めします。 新しいイメージは以下のとおりです。

  ```
  Ap-northeast-1:ami-0e49af0659db9fc5d,
  Ap-northeast-2:ami-03e485694bc2da249,
  Ap-south-1:ami-050370e57dfc6574a,
  Ap-southeast-1:ami-0a75ff7b28897268c
  Ap-southeast-2:ami-072b1b45245549586,
  Ca-central-1:ami-0e44086f0f518ad2d,
  Eu-central-1:ami-09cbcfe446101b4ea,
  Eu-west-1:ami-0d1cbc2cc3075510a,
  Eu-west-2:ami-0bd22dcdc30fa260b,
  Sa-east-1:ami-038596d5a4fc9893b,
  Us-east-1:ami-0843ca047684abe87,
  Us-east-2:ami-03d60a35576647f63,
  Us-west-1:ami-06f6efb13d9ccf93d,
  us-west-2:ami-0b5b8ad02f405a909
  ```

  以下を置き換えます。

  ```
  Ap-northeast-1:ami-cbe000ad
  ap-northeast-2:ami-629b420c,
  Ap-south-1:ami-97bac2f8
  ap-southeast-1:ami-63b22100,
  Ap-southeast-2:ami-dd6c73be,
  Ca-central-1:ami-d02c93b4,
  Eu-central-1:ami-b243eedd
  eu-west-1:ami-61de3718,
  Eu-west-2:ami-904e5ff4,
  Sa-east-1:ami-c22057ae,
  Us-east-1:ami-05b6e77e,
  Us-east-2:ami-9b4161fe,
  Us-west-1:ami-efc9e08f,
  us-west-2:ami-ce8c94b7
  ```

* 現時点のベスト プラクティスは、32 GB 以上の RAM を備えた Services マシンを使用することです。 v2.18 からは、32 GB 以上の RAM が必須となります。 推奨事項については、[こちらのドキュメント](https://circleci.com/ja/docs/2.0/aws/#計画)をご覧ください。
* ソフトウェア パッケージを以下のバージョンに更新しました。 現時点では、外部処理化された環境において更新の必要はありませんが、v2.18 のリリース時は必須となります。

  * Vault 1.1.2
  * Mongo 3.6.12-xenial
  * Redis 4.0.14

* We are removing the 1.0 Single-Box options from CircleCI 2.0. We found a few critical vulnerabilities in our 1.0 build image, and we have long stopped recommending it for trials. ワークフローに確実に必要な場合はご連絡ください。 なお、クラスター モードで 1.0 を実行しているユーザーには影響しません。

## Steps to update to CircleCI Server v2.17
{: #steps-to-update-to-circleci-server-v217 }
Steps to update to CircleCI Server v2.17 are as follows:

1. 後から必要に応じてロールバックできるよう、お使いの環境のスナップショットを取得します (任意ですが推奨の手順です)。
2. Docker v17.12.1 を実行していることを確認し、必要に応じて更新します。
3. Replicated を v2.34.1 に更新します (後述のセクションを参照)。
4. Navigate to your Management Console dashboard (e.g. `<your-circleci-hostname>.com:8800`) and select the v2.17 upgrade

### Snapshot for rollback
{: #snapshot-for-rollback }

To take a snapshot of your installation:

1. Go to the Management Console (`<circleci-hostname>.com:8800`) and click Stop Now to stop the CircleCI Services machine from running
2. `nomad status` を実行して、Nomad クライアントでジョブが実行されていないことを確認します。
3. AWS EC2 管理コンソールにアクセスし、Services マシンのインスタンスを選択します。
4. Select Actions > Image > Create Image – Select the No Reboot option if you want to avoid downtime at this point. ここでのイメージ作成では、お使いの環境を復元するための新しい EC2 インスタンスとして簡単に起動できる AMI を作成します。 **メモ:** AWS API を使用すると、このプロセスを自動化することも可能です。 以後の AMI/スナップショットは、最後に取得したスナップショットからの差分 (変更されたブロック) と同じ大きさであるため、頻繁にスナップショットを作成しても、ストレージ コストが必ず大きくなるわけではありません。 詳細については、Amazon の EBS スナップショットの請求に関するドキュメントをご覧ください。 スナップショットを取得したら、Services マシンに自由に変更を加えることができます。

If you do need to rollback at any point, see our [restore from backup](http://localhost:4000/docs/2.0/backup/#restoring-from-backup) guide.

### Replicated の更新
{: #update-replicated }

**Perquisites**

- Ubuntu 14.04 または 16.04 ベースの環境を使用していること
- You are running replicated version 2.10.3<= on your services machine
  - replicated --version
- お使いの環境が孤立して**おらず**、インターネットにアクセスできること
- Services マシン上ですべての手順が完了していること
- Verify what version of replicated you need to update to by viewing the [Server Changelog](https://circleci.com/server/changelog/)

#### Preparations for updating Replicated
{: #preparations-for-updating-replicated }

Before performing a replicated version update, backup your data using the [Backup instructions]({{site.baseurl}}/2.0/backup/).

- 以下のコマンドで CircleCI アプリケーションを停止させます。

```
    replicatedctl app stop
```

Application shutdown takes a few minutes. Please check the administration dashboard, and wait for the status to become “Stopped” before continuing. You can also run the following command to view the app status:

```
    replicatedctl app status inspect
```

Example Output:
```
[
    {
        "AppID": "edd9471be0bc4ea04dfca94718ddf621",
        "Sequence": 2439,
        "State": "stopped",
        "DesiredState": "stopped",
        "Error": "",
        "IsCancellable": false,
        "IsTransitioning": false,
        "LastModifiedAt": "2018-10-23T22:00:21.314987894Z"
    }
]
```

- Replicated の更新を成功させるには、Docker を推奨バージョン 17.12.1 に更新する必要があります。

```
    sudo apt-get install docker-ce=17.12.1~ce-0~ubuntu
```

- 以下のコマンドを使用して Docker のバージョンを固定します。

```
    sudo apt-mark hold docker-ce
```

#### Replicated の更新
{: #update-replicated }

Perform the Replicated update by executing the update script as follows:

```
    curl -sSL "https://get.replicated.com/docker?replicated_tag=2.34.1" | sudo bash
```

Double-check your replicated and docker versions:

Example Output
```
    replicatedctl version    # 2.34.1
    docker -v                # 17.12.1
```

Restart the app with

```
    replicatedctl app start
```

The application will take a few minutes to spin up. You can check the progress in the administration dashboard or by executing;

```
    replicatedctl app status inspect
```

Example output:
```
[
    {
        "AppID": "edd9471be0bc4ea04dfca94718ddf621",
        "Sequence": 2439,
        "State": "started",
        "DesiredState": "started",
        "Error": "",
        "IsCancellable": true,
        "IsTransitioning": true,
        "LastModifiedAt": "2018-10-23T22:04:05.00374451Z"
    }
]
```
