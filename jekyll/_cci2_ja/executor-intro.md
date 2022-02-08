---
layout: classic-docs
title: "Executor とイメージ"
short-title: "Executor とイメージ"
description: "CircleCI executors and images"
categories:
  - 設定
order: 1
version:
  - クラウド
  - Server v2.x
  - Server v3.x
---

CircleCI offers several execution environments. CircleCI ではこれらを **Executor** と呼んでいます。 **Executor** では、ジョブを実行する基盤テクノロジーまたは環境を定義します。 `docker`、`machine`、`macos`、または `windows` の Executor で実行するジョブをセットアップし、必要なツールとパッケージを含むイメージを指定します。

![Executor の概要]({{ site.baseurl }}/assets/img/docs/executor_types.png)

## Docker
{: #docker }

<div class="alert alert-warning" role="alert">
  <strong>プレフィックスが「 circleci / 」のレガシーイメージは、 2021 年 12 月 31 日に<a href="https://discuss.circleci.com/t/legacy-convenience-image-deprecation/41034">廃止</a></strong>されます。 ビルドを高速化するには、<a href="https://circleci.com/blog/announcing-our-next-generation-convenience-images-smaller-faster-more-deterministic/"> 次世代の CircleCI イメージ </a>を使ってプロジェクトをアップグレードしてください。
</div>

```yaml
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
```yaml
steps:
        # Linux 仮想マシン環境で実行するコマンド
```

{:.tab.machine.Server}
```yaml
jobs:
  build:
    machine:
      image: ubuntu-1604:202007-01 # VM will run Ubuntu 16.04 for this release date
    steps:
      # Commands run in a Linux virtual machine environment
```

`machine` Executor の使用については、[こちら]({{ site.baseurl }}/ja/2.0/executor-types/#machine-の使用)をご覧ください。
```yaml
jobs:
  build: # name of your job
    machine: # executor type
      image: ubuntu-1604:202007-01 # VM will run Ubuntu 16.04 for this release date

    steps:
      # Commands run in a Linux virtual machine environment
```

`macos` Executor の使用については、[こちら]({{ site.baseurl }}/ja/2.0/executor-types/#using-macos)をご覧ください。

## macOS
{: #macos }

_The macOS executor is not currently available on self-hosted installations of CircleCI server_

```yaml
jobs:
  build: # ジョブの名前
    macos: # Executor タイプ
      xcode: 12.5.1

    steps:
      # Xcode 11.3 がインストールされた
      # macOS 仮想マシン環境で実行するコマンド
```

`macos` Executor の使用については、[こちら]({{ site.baseurl }}/ja/2.0/executor-types/#using-macos)をご覧ください。

## Windows
{: #windows }

Windows Executor を使用するための設定ファイルの構文は、以下のどちらを使用するのかによって異なります。

* クラウド版の CircleCI でバージョン 2.1 の設定ファイルと Windows Orb を使用する場合。
* Self-hosted installation of CircleCI server with config version 2.0 – this option is an instance of using the `machine` executor with a Windows image – _Introduced in CircleCI server v2.18.3_.

{:.tab.windowsblock.Cloud}
```yaml
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


{:.tab.windowsblock.Server_3}
```yaml
version: 2.1

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

{:.tab.windowsblock.Server_2}
```yaml
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

`windows` Executor の使用については、[こちら]({{ site.baseurl }}/ja/2.0/executor-types/#using-the-windows-executor)をご覧ください。 Windows Orb で使用できるオプションの一覧は [Windows Orb の詳細ページ](https://circleci.com/developer/ja/orbs/orb/circleci/windows)でご確認ください。

## 関連項目
{: #see-also }

* [Executor タイプの選択]({{ site.baseurl }}/ja/2.0/executor-types/)
* [ビルド済み CircleCI イメージ]({{ site.baseurl }}/ja/2.0/circleci-images/)
* [macOS でのビルド]({{site.baseurl}}/ja/2.0/hello-world-macos)
* [Windows でビルド]({{site.baseurl}}/ja/2.0/hello-world-windows)

## さらに詳しく
{: #learn-more }
CircleCI Academy の [ビルド環境コース](https://academy.circleci.com/build-environments-1?access_code=public-2021) を受講すると、Executor の選択と使用についてさらに詳しく学ぶことができます。
