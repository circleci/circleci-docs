---
layout: classic-docs
title: "CircleCI Server v2.16 の新機能"
short-title: "CircleCI Server v2.16 の新機能"
description: "CircleCI Server v2.16 の入門ガイド"
categories:
  - はじめよう
order: 1
---

This document provides a summary of features and product notes for the release of CircleCI server v2.16.

## What's new in release 2.16
{: #whats-new-in-release-216 }

- Services マシンの外部にデータとワークロードを分散できるようになりました。 MongoDB、Redis、Nomad Server、RabbitMQ、Postgres、Vault を外部サービスとして使用できます。 最新ドキュメントについては、CSM にお問い合わせください。

- Telegraf 出力設定ファイルを通してカスタム メトリクスを取得できるようになりました。 運用ガイドの「モニタリング」の章を参照してください。

- ワークフローに関するメール通知を受信できるようになりました。

- PostgreSQL イメージが、`/etc/circleconfig/postgres/extra.conf` ファイルを作成することによってデフォルト設定を変更できるように更新されました。 設定オプションの一覧は、[こちら](https://github.com/circleci/postgres-docker/blob/da250f226be17afdde923c08f2af6fe63ceec99e/postgresql.conf)でご覧いただけます。

- インストールと運用に関する PDF ドキュメントが公開されています。
   - *CircleCI v2.16 インストール ガイド*
   - *CircleCI v2.16 運用ガイド*

## Fixed in release 2.16
{: #fixed-in-release-216 }

- 32 日後にコンテキストが破損する問題を修正しました。

- Vault Auth トークンが期限切れにならないよう、定期的に更新されるようになりました。

- ワークフロー表示ページが断続的に描画されなくなる問題を修正しました。

- CircleCI が GitHub から受信する Web フックの処理に影響していた少数のバグを修正しました。

- HTTP プロキシまたは HTTPS プロキシが使用されている場合に、ジョブがプロキシを無視し、setup_remote_docker が機能するようになりました。

- 1.0 Builders が PostgreSQL データベースに対して作成する接続の数が削減されました。

- クロスサイト スクリプティングや HTTP ヘッダー インジェクションによる潜在的なセキュリティ脆弱性を修正しました。

- セキュリティ上の理由から、デフォルトでは、フォークされた PR が親プロジェクトのキャッシュに書き込むことはできなくなりました。 ただし、詳細設定の [Pass secrets to builds from forked pull requests (フォークされたプル リクエストからビルドにシークレットを渡す)] を有効にしている場合は、フォークから親プロジェクトのキャッシュに書き込むことができます。


## Updated in release 2.16
{: #updated-in-release-216 }

- ビルドのメールから EOL バナーを削除しました。

- VM サービスの安定性を向上させました。

- Machine Executor で VM プロビジョニングのメトリクスを強化しました。 以下のとおりメトリクス名が変更されているため、既に VM プロビジョニングをモニタリングしている場合、モニタリング ダッシュボードを再設定する必要があります。
    - `vm-service.gauges.available-vms` と `vm-service.gauges.running-vms` を `vm-service.gauges.vms_by_status` に変更
    - `vm-service.gauges.running-tasks` を `vm-service.gauges.tasks_by_status` に変更
    - `vm-service.gauges.oldest-unassigned-task` を `vm-service.gauges.unassigned_tasks_age` に変更

- Replicated was updated to version 2.29.0 in this release which requires Docker 17.12.1. Follow the instructions below before upgrading to CircleCI v2.16.

### Prequisites for updating Replicated
{: #prequisites-for-updating-replicated }

- Ubuntu 14.04 ベースの環境を使用していること
- Services マシンで Replicated バージョン 2.10.3 を実行していること
  - `replicated --version`
- お使いの環境が孤立して**おらず**、インターネットにアクセスできること
- Services マシン上ですべての手順が完了していること

### 準備
{: #preparations }

Before performing a replicated version update, backup your data using the Backup section of the *CircleCI v2.16 Operations Guide*.

- 以下のコマンドで CircleCI アプリケーションを停止させます。

```shell
    replicatedctl app stop
```

Application shutdown takes a few minutes. Please check the administration dashboard, and wait for the status to become “Stopped” before continuing. You can also run the following command to view the app status:

```shell
    replicatedctl app status inspect
```

Example Output:
```json
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

```shell
    sudo apt-get install docker-ce=17.12.1~ce-0~ubuntu
```

- 以下のコマンドを使用して Docker のバージョンを固定します。

```shell
    sudo apt-mark hold docker-ce
```

### 更新
{: #update }

Perform the Replicated update by executing the update script as follows:

```shell
    curl -sSL "https://get.replicated.com/docker?replicated_tag=2.29.0" | sudo bash
```

Double-check your replicated and docker versions:

```shell
    replicatedctl version    # 2.29.0
    docker -v                # 17.12.1
```

Restart the app with

```shell
    replicatedctl app start
```

The application will take a few minutes to spin up. You can check the progress in the administration dashboard or by executing;

```shell
    replicatedctl app status inspect
```

Example output:
```json
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
