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
    

`docker` Executor の使用については、[こちら]({{ site.baseurl }}/2.0/executor-types/#docker-の使用)をご覧ください。

## Machine

{:.tab.windowsblock.Cloud}
jobs:
      build: # name of your job
        machine: # executor type
          image: ubuntu-1604:201903-01 # # recommended linux image - includes Ubuntu 16.04, docker 18.09.3, docker-compose 1.23.1
    
          steps:
            # Commands run in a Linux virtual machine environment

{:.tab.windowsblock.Server}
jobs:
      build: # name of your job
        machine: true # executor type
    
          steps:
            # Commands run in a Linux virtual machine environment
    

Find out more about using the `machine` executor [here]({{ site.baseurl }}/2.0/executor-types/#using-machine).

## macOS

*Available on CircleCI.com - not currently available on self-hosted installations of CircleCI Server.*

    jobs:
      build: # name of your job
        macos: # executor type
          xcode: 11.3.0
    
        steps:
          # Commands run in a macOS virtual machine environment
          # with Xcode 11.3 installed
    

Find out more about using the `macos` executor [here]({{ site.baseurl }}/2.0/executor-types/#using-macos).

## Windows

The syntax for using the Windows executor in your config differs depending on whether you are using:

* クラウド版の CircleCI でバージョン 2.1 の設定ファイルと Windows Orb を使用する場合。 [パイプラインの有効化]({{ site.baseurl }}/2.0/build-processing)も必要です。
* オンプレミス版の CircleCI Server でバージョン 2.0 の設定ファイルを使用する場合。これは、*CircleCI Server v2.18.3* からサポートされた、Windows イメージと `machine` Executor を使用するシナリオが考えられます。

{:.tab.windowsblock.Cloud}
version: 2.1 # Use version 2.1 to enable orb usage.
    
    orbs:
      win: circleci/windows@2.2.0 # The Windows orb give you everything you need to start using the Windows executor.
    
    jobs:
      build: # name of your job
        executor: win/default # executor type
    
        steps:
          # Commands are run in a Windows virtual machine environment
    
          - checkout
          - run: Write-Host 'Hello, Windows'

{:.tab.windowsblock.Server}
version: 2
    
    jobs:
      build: # name of your job
        machine:
          image: windows-default # Windows machine image
        resource_class: windows.medium
        steps:
          # Commands are run in a Windows virtual machine environment
    
          - checkout
          - run: Write-Host 'Hello, Windows'
    

Find out more about using the `windows` executor [here]({{ site.baseurl }}/2.0/executor-types/#using-the-windows-executor). See [the Windows orb details](https://circleci.com/orbs/registry/orb/circleci/windows) for the list of options available in the Windows orb.

## 関連項目

* [ビルド済みの CircleCI コンビニエンス イメージ]({{ site.baseurl }}/2.0/circleci-images/)
* [macOS でのビルド]({{site.baseurl}}/2.0/hello-world-macos)
* [macOS でのビルド]({{site.baseurl}}/2.0/hello-world-macos)