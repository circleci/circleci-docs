---
layout: classic-docs
title: "Executor とイメージ"
short-title: "Executor とイメージ"
description: "CircleCI 2.0 の Executor とイメージ"
categories:
  - configuration
order: 1
---

**Executor** では、ジョブを実行する基盤テクノロジーまたは環境を定義します。 `docker`、`machine`、`macos`、または `windows` の Executor で実行するジョブをセットアップし、必要なツールとパッケージを含むイメージを指定します。

![Executor の概要]({{ site.baseurl }}/assets/img/docs/executor_types.png)

## Docker

    jobs:
      build: # ジョブの名前
        docker: # Executor タイプ
          - image: buildpack-deps:trusty # プライマリ コンテナで Ubuntu Trusty を実行します
    
          steps:
            # プライマリ コンテナで実行するコマンド
    

`docker` Executor の使用については、[こちら]({{ site.baseurl }}/ja/2.0/executor-types/#docker-の使用)をご覧ください。

## Machine

{:.tab.windowsblock.Cloud}
jobs:
      build: # ジョブの名前
        machine: # Executor タイプ
          image: ubuntu-1604:201903-01 # 推奨 Linux イメージ - Ubuntu 16.04、docker 18.09.3、docker-compose 1.23.1 が含まれます
    
          steps:
            # Linux 仮想マシン環境で実行するコマンド

{:.tab.windowsblock.Server}
jobs:
      build: # ジョブの名前
        machine: true # Executor タイプ
    
          steps:
            # Linux 仮想マシン環境で実行するコマンド
    

`machine` Executor の使用については、[こちら]({{ site.baseurl }}/ja/2.0/executor-types/#machine-の使用)をご覧ください。

## macOS

*CircleCI.com で利用可能です。オンプレミス版の CircleCI Server では現在サポートされていません。*

    jobs:
      build: # ジョブの名前
        macos: # Executor タイプ
          xcode: 11.3.0
    
        steps:
          # Xcode 11.3 がインストールされた
          # macOS 仮想マシン環境で実行するコマンド
    

`macos` Executor の使用については、[こちら]({{ site.baseurl }}/ja/2.0/executor-types/#macos-の使用)をご覧ください。

## Windows

Windows Executor を使用するための設定ファイルの構文は、以下のどちらを使用するのかによって異なります。

* クラウド版の CircleCI でバージョン 2.1 の設定ファイルと Windows Orb を使用する場合。 [パイプラインの有効化]({{ site.baseurl }}/ja/2.0/build-processing)も必要です。
* オンプレミス版の CircleCI Server でバージョン 2.0 の設定ファイルを使用する場合。これは、*CircleCI Server v2.18.3* からサポートされた、Windows イメージと `machine` Executor を使用するシナリオが考えられます。

{:.tab.windowsblock.Cloud}
version: 2.1 # バージョン 2.1 を指定して Orb の使用を有効化します
    
    orbs:
      win: circleci/windows@2.2.0 # Windows Orb には Windows Executor の使用に必要なすべてが揃っています
    
    jobs:
      build: # ジョブの名前
        executor: win/default # Executor タイプ
    
        steps:
          # Windows 仮想マシン環境で実行するコマンド
    
          - checkout
          - run: Write-Host 'Hello, Windows'

{:.tab.windowsblock.Server}
version: 2
    
    jobs:
      build: # ジョブの名前
        machine:
          image: windows-default # Windows マシン イメージ
        resource_class: windows.medium
        steps:
          # Windows 仮想マシン環境で実行するコマンド
    
          - checkout
          - run: Write-Host 'Hello, Windows'
    

`windows` Executor の使用については、[こちら]({{ site.baseurl }}/ja/2.0/executor-types/#windows-executor-の使用)をご覧ください。 Windows Orb で使用できるオプションの一覧は [Windows Orb の詳細ページ](https://circleci.com/developer/ja/orbs/orb/circleci/windows)でご確認ください。

## 関連項目

* [ビルド済みの CircleCI コンビニエンス イメージ]({{ site.baseurl }}/ja/2.0/circleci-images/)
* [macOS でのビルド]({{site.baseurl}}/ja/2.0/hello-world-macos)
* [macOS でのビルド]({{site.baseurl}}/ja/2.0/hello-world-macos)
