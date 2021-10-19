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
  - Server v3.x
---

CircleCI offers several build environments. We call these **executors**. **Executor** では、ジョブを実行する基盤テクノロジーまたは環境を定義します。 `docker`、`machine`、`macos`、または `windows` の Executor で実行するジョブをセットアップし、必要なツールとパッケージを含むイメージを指定します。

![Executor の概要]({{ site.baseurl }}/assets/img/docs/executor_types.png)

## Docker
{: #docker }

```
jobs:
  build: # ジョブの名前
    docker: # Executor タイプ
      - image: buildpack-deps:trusty # プライマリ コンテナで Ubuntu Trusty を実行します

      steps:
        # プライマリ コンテナで実行するコマンド
```

`docker` Executor の使用については、[こちら]({{ site.baseurl }}/ja/2.0/executor-types/#using-docker)をご覧ください。

## Machine
{: #machine }

{:.tab.machine.Cloud}
```
steps:
        # Linux 仮想マシン環境で実行するコマンド
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

`machine` Executor の使用については、[こちら]({{ site.baseurl }}/ja/2.0/executor-types/#machine-の使用)をご覧ください。

## macOS
{: #macos }

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

`macos` Executor の使用については、[こちら]({{ site.baseurl }}/ja/2.0/executor-types/#using-macos)をご覧ください。

## Windows
{: #windows }

Windows Executor を使用するための設定ファイルの構文は、以下のどちらを使用するのかによって異なります。

* クラウド版の CircleCI でバージョン 2.1 の設定ファイルと Windows Orb を使用する場合。
* オンプレミス版の CircleCI Server でバージョン 2.0 の設定ファイルを使用する場合。 これは、*CircleCI Server v2.18.3* からサポートされた、Windows イメージと `machine` Executor を使用するシナリオが考えられます。

{:.tab.windowsblock.Cloud}
```
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
```

{:.tab.windowsblock.Server}
```
jobs:
  build: # ジョブの名前
    machine:
      image: windows-default # Windows マシン イメージ
    resource_class: windows.medium
    steps:
      # Windows 仮想マシン環境で実行するコマンド

      - checkout
      - run: Write-Host 'Hello, Windows'
```

`windows` Executor の使用については、[こちら]({{ site.baseurl }}/ja/2.0/executor-types/#using-the-windows-executor)をご覧ください。 Windows Orb で使用できるオプションの一覧は [Windows Orb の詳細ページ](https://circleci.com/developer/ja/orbs/orb/circleci/windows)でご確認ください。

## 関連項目
{: #see-also }

* [Choosing an executor type]({{ site.baseurl }}/ja/2.0/executor-types/)
* [Pre-built CircleCI convenience images]({{ site.baseurl }}/ja/2.0/circleci-images/)
* [Building on MacOS]({{site.baseurl}}/ja/2.0/hello-world-macos)
* [Building on Windows]({{site.baseurl}}/ja/2.0/hello-world-windows)

## Learn More
{: #learn-more }
Take the [build environments course](https://academy.circleci.com/build-environments-1?access_code=public-2021) with CircleCI Academy to learn more about choosing and using an executor.
