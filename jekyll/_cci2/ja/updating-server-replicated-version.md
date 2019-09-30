---
layout: classic-docs
title: "Server Replicated バージョンの更新"
category:
  - administration
order: 12
description: "Server Replicated バージョンおよび Docker バージョンを更新する方法"
---

以下のセクションに沿って、CircleCI プライベート環境の Server Replicated バージョンを更新する方法について説明します。

- 目次
{:toc}

## 前提

- Your installation is Ubuntu 14.04 or 16.04 based.
- You are running replicated version 2.10.3<= on your services machine 
  - replicated --version
- お使いの環境が孤立して**おらず**、インターネットにアクセスできること
- Services マシン上ですべての手順が完了していること
- Verify what version of replicated you need to update to by viewing the [Server Changelog](https://circleci.com/server/changelog/)

## 準備

Replicated バージョンの更新を実行する前に、[バックアップ手順]({{site.baseurl}}/ja/2.0/backup/)に従ってデータをバックアップします。

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
    

## 更新

以下のように更新スクリプトを実行して、Replicated の更新を実行します。

        curl -sSL "https://get.replicated.com/docker?replicated_tag=<specific_replicated_version>" | sudo bash
    

Replicated と Docker の両方のバージョンをチェックしてください。

Example Output

        replicatedctl version    # 2.29.0
        docker -v                # 17.12.1
    

Restart the app with

        replicatedctl app start
    

The application will take a few minutes to spin up. You can check the progress in the administration dashboard or by executing;

        replicatedctl app status inspect
    

Example output:

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