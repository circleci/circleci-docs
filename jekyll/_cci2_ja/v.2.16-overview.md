---
layout: classic-docs
title: "CircleCI Server v2.16 の新機能"
short-title: "CircleCI Server v2.16 の新機能"
description: "CircleCI Server v2.16 の入門ガイド"
categories:
  - getting-started
order: 1
---

CircleCI Server v2.16 の機能強化や不具合修正についてまとめます。

## バージョン 2.16 の新機能

- Services マシンの外部にデータとワークロードを分散できるようになりました。 MongoDB、Redis、Nomad Server、RabbitMQ、Postgres、Vault を外部サービスとして使用できます。 最新ドキュメントについては、CSM にお問い合わせください。

- Telegraf 出力設定ファイルを通してカスタム メトリクスを取得できるようになりました。 運用ガイドの「モニタリング」の章を参照してください。

- ワークフローに関するメール通知を受信できるようになりました。

- PostgreSQL イメージが、`/etc/circleconfig/postgres/extra.conf` ファイルを作成することによってデフォルト設定を変更できるように更新されました。設定オプションの一覧は、[こちら](https://github.com/circleci/postgres-docker/blob/da250f226be17afdde923c08f2af6fe63ceec99e/postgresql.conf)でご覧いただけます。

- インストールと運用に関する PDF ドキュメントが公開されています。
   
   - *CircleCI v2.16 インストール ガイド*
   - *CircleCI v2.16 運用ガイド*

## バージョン 2.16 での修正点

- 32 日後にコンテキストが破損する問題を修正しました。

- Vault Auth トークンが期限切れにならないよう、定期的に更新されるようになりました。

- ワークフロー表示ページが断続的に描画されなくなる問題を修正しました。

- CircleCI が GitHub から受信する Web フックの処理に影響していた少数のバグを修正しました。

- HTTP プロキシまたは HTTPS プロキシが使用されている場合に、ジョブがプロキシを無視し、setup_remote_docker が機能するようになりました。

- 1.0 Builders が PostgreSQL データベースに対して作成する接続の数が削減されました。

- クロスサイト スクリプティングや HTTP ヘッダー インジェクションによる潜在的なセキュリティ脆弱性を修正しました。

- セキュリティ上の理由から、デフォルトでは、フォークされた PR が親プロジェクトのキャッシュに書き込むことはできなくなりました。 ただし、詳細設定の [Pass secrets to builds from forked pull requests (フォークされたプル リクエストからビルドにシークレットを渡す)] を有効にしている場合は、フォークから親プロジェクトのキャッシュに書き込むことができます。

## バージョン 2.16 での更新点

- ビルドのメールから EOL バナーを削除しました。

- VM サービスの安定性を向上させました。

- Machine Executor で VM プロビジョニングのメトリクスを強化しました。 以下のとおりメトリクス名が変更されているため、既に VM プロビジョニングをモニタリングしている場合、モニタリング ダッシュボードを再設定する必要があります。
   
   - `vm-service.gauges.available-vms` と `vm-service.gauges.running-vms` を `vm-service.gauges.vms_by_status` に変更
   - `vm-service.gauges.running-tasks` を `vm-service.gauges.tasks_by_status` に変更
   - `vm-service.gauges.oldest-unassigned-task` を `vm-service.gauges.unassigned_tasks_age` に変更

- 今回のリリースで Replicated がバージョン 2.29.0 に更新されたため、Docker 17.12.1 が必要になります。CircleCI v2.16 にアップグレードする前に、以下の手順を実行してください。

### Replicated を更新するための前提条件

- Ubuntu 14.04 ベースの環境を使用していること
- Services マシンで Replicated バージョン 2.10.3 を実行していること 
   - `replicated --version`
- お使いの環境が孤立して**おらず**、インターネットにアクセスできること
- Services マシン上ですべての手順が完了していること

### 準備

Replicated バージョンの更新を行う前に、『*CircleCI v2.16 運用ガイド*』の「バックアップ」に従ってデータをバックアップしてください。

- 以下のコマンドで CircleCI アプリケーションを停止させます。

        replicatedctl app stop
    

アプリケーションのシャットダウンには数分かかります。 管理ダッシュボードを確認して、ステータスが [Stopped (停止)] になってから続行してください。 以下のコマンドを実行してアプリケーションのステータスを表示する方法もあります。

        replicatedctl app status inspect
    

以下のように出力されます。

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
    

- Replicated の更新を成功させるには、Docker を推奨バージョン 17.12.1 に更新する必要があります。

        sudo apt-get install docker-ce=17.12.1~ce-0~ubuntu
    

- 以下のコマンドを使用して Docker のバージョンを固定します。

        sudo apt-mark hold docker-ce
    

### 更新

以下のように更新スクリプトを実行して、Replicated の更新を実行します。

        curl -sSL "https://get.replicated.com/docker?replicated_tag=2.29.0" | sudo bash
    

Replicated と Docker の両方のバージョンをチェックしてください。

        replicatedctl version    # 2.29.0
        docker -v                # 17.12.1
    

以下のコマンドでアプリケーションを再起動します。

        replicatedctl app start
    

アプリケーションのスピンアップには数分かかります。 以下のコマンドを実行するか、管理ダッシュボードにアクセスして進行状況を確認できます。

        replicatedctl app status inspect
    

以下のように出力されます。

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