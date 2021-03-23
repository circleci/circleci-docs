---
layout: classic-docs
title: "Executor とイメージ"
short-title: "Executor とイメージ"
description: "CircleCI 2.0 の Executor とイメージ"
categories:
  - configuration
order: 1
version:
  - Cloud
  - Server v2.x
---

An **executor** defines the underlying technology or environment in which to run a job. `docker`、`machine`、`macos`、または `windows` の Executor で実行するジョブをセットアップし、必要なツールとパッケージを含むイメージを指定します。

![Executor の概要]({{ site.baseurl }}/assets/img/docs/executor_types.png)

## Docker

```
jobs:
  build: # ジョブの名前
    docker: # Executor タイプ
      - image: buildpack-deps:trusty # プライマリ コンテナで Ubuntu Trusty を実行します

      steps:
        # プライマリ コンテナで実行するコマンド
```

`docker` Executor の使用については、[こちら]({{ site.baseurl }}/2.0/executor-types/#docker-の使用)をご覧ください。

## Machine

{:.tab.machine.Cloud}
```
jobs:
  build: # name of your job
    machine: # executor type
      image: ubuntu-2004:202010-01 # # recommended linux image - includes Ubuntu 20.04, docker 19.03.13, docker-compose 1.27.4

      steps:
        # Commands run in a Linux virtual machine environment
```

{:.tab.machine.Server}
```
jobs:
  build: 
    machine: 
      image: ubuntu-1604:202007-01 # VM will run Ubuntu 16.04 for this release date
    steps:
      # Commands run in a Linux virtual machine environment
```

`machine` Executor の使用については、[こちら]({{ site.baseurl }}/2.0/executor-types/#machine-の使用)をご覧ください。

## macOS

_The macOS executor is not currently available on self-hosted installations of CircleCI Server_

```
jobs:
  build: # ジョブの名前
    macos: # Executor タイプ
      xcode: 11.3.0

    steps:
      # Xcode 11.3 がインストールされた
      # macOS 仮想マシン環境で実行するコマンド
```

`macos` Executor の使用については、[こちら]({{ site.baseurl }}/2.0/executor-types/#macos-の使用)をご覧ください。

## Windows

Windows Executor を使用するための設定ファイルの構文は、以下のどちらを使用するのかによって異なります。

* The cloud version of CircleCI, using config version 2.1 and the Windows orb.
* Self-hosted installation of CircleCI Server with config version 2.0 – this option is an instance of using the `machine` executor with a Windows image – _Introduced in CircleCI Server v2.18.3_.

{:.tab.windowsblock.Cloud}
```
version: 2.1 # バージョン 2.1 を指定して Orb の使用を有効化します

orbs:
  win: circleci/windows@2.2.0 # Windows Orb には Windows Executor の使用に必要なすべてが揃っています

jobs:
  build: # name of your job
    executor: win/default # executor type

    steps:
      # Commands are run in a Windows virtual machine environment
      - checkout
      - run: Write-Host 'Hello, Windows'
```

{:.tab.windowsblock.Server}
```
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
```

`windows` Executor の使用については、[こちら]({{ site.baseurl }}/2.0/executor-types/#windows-executor-の使用)をご覧ください。 See [the Windows orb details](https://circleci.com/developer/orbs/orb/circleci/windows) for the list of options available in the Windows orb.

## See also

* [ビルド済みの CircleCI コンビニエンス イメージ]({{ site.baseurl }}/2.0/circleci-images/)
* [macOS でのビルド]({{site.baseurl}}/2.0/hello-world-macos)
* [macOS でのビルド]({{site.baseurl}}/2.0/hello-world-macos)
