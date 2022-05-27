---
layout: classic-docs
title: "Windows 実行環境の使用"
description: "Windows 実行環境で実行するジョブの設定方法を説明します。"
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

[custom-images]: {{ site.baseurl }}/2.0/custom-images/ [building-docker-images]: {{ site.baseurl }}/2.0/building-docker-images/ [server-gpu]: {{ site.baseurl }}/2.0/gpu/

`windows` Executor を使用すると、Windows 環境でジョブを実行できます。 シンプルな Windows ジョブを実行する構成例を以下に示します。 Windows Executor を使用するための設定ファイルの構文は、以下のどちらを使用するのかによって異なります。
* クラウド版 CircleCI のバージョン 2.1 の設定ファイル
* オンプレミス版の CircleCI Server でバージョン 2.0 の設定ファイルを使用する場合。_CircleCI Server v2.18.3_ からサポートされた、Windows イメージと `machine` Executor を使用するシナリオが考えられます。

{:.tab.windowsblock.Cloud}
```yaml
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
```

{:.tab.windowsblock.Server}
```yaml
version: 2

jobs:
  build: # name of your job
    machine:
      image: windows-default
    resource_class: windows.medium
    steps:
      # Commands are run in a Windows virtual machine environment
        - checkout
        - run: Write-Host 'Hello, Windows'
```

クラウド版の例では、Windows Executor のセットアップに Windows Orb を使用することで、設定を簡素化しています。 詳細については、[Windows Orb の詳細ページ](https://circleci.com/developer/ja/orbs/orb/circleci/windows)を参照してください。

CircleCI Server を使用している場合、Windows ジョブに使用しているイメージに関する詳細情報については、システム管理者にお問い合わせください。 Windows イメージはシステム管理者によって構成され、CircleCI の設定ファイルでは常に `windows-default` というイメージ名で利用できます。
