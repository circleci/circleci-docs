---
layout: classic-docs
title: "Windows 実行環境の使用"
description: "このページでは、Windows 実行環境で実行するジョブの設定方法について解説しています。"
version:
  - クラウド
  - Server v4.x
  - Server v3.x
  - Services VM
---

Windows 実行環境は、Universal Windows Platform (UWP) アプリケーションや .NET 実行可能ファイル、Windows 固有プロジェクト (.NET フレームワークなど) といった、Windows プロジェクトをビルドするためのツールを提供します。 Windows Executor の仕様と機能は以下のとおりです。

- VM ベースでジョブの完全分離を保証
- Windows Server 2019 Datacenter エディションと Windows Server 2022 Datacenter エディションの Server Core バージョンのどちらでも使用可能
- PowerShell がデフォルトのシェル (Bash と cmd を手動で選択可能)
- Windows コンテナの実行に Docker Engine - Enterprise を使用可能

Machine Executor を使用して Windows イメージを指定すると、Windows 実行環境にアクセスできます。

設定をシンプルに保ち、最新のイメージを使用していることを確認するために、代わりに [Windows Orb](https://circleci.com/developer/ja/orbs/orb/circleci/windows) を使ってジョブ設定の Orb からデフォルトの Executor を指定することも可能です。 CircleCI では、[Windows Orb](https://circleci.com/developer/ja/orbs/orb/circleci/windows) を使って設定を簡素化することを強く推奨します。

次に、両方のオプションの例を示します。 Windows 実行環境がサーバー管理者によって管理されているため、CircleCI Server の設定が異なります。

{:.tab.windowsblock.Cloud_with_orb}
```yaml
version: 2.1 # Use version 2.1 to enable Orb usage.

orbs:
  win: circleci/windows@4.1.1 # Windows Orb には Windows Executor の使用に必要なすべてが揃っています

jobs:
  build: # name of your job
    executor: win/default # executor type

    steps:
      # Commands are run in a Windows virtual machine environment
      - checkout
      - run: Write-Host 'Hello, Windows'
```

{:.tab.windowsblock.Cloud_with_machine}
```yaml
version: 2

jobs:
  build: # name of your job
    resource_class: 'windows.medium'
    machine:
      image: 'windows-server-2022-gui:current'
      shell: 'powershell.exe -ExecutionPolicy Bypass'
    steps:
      # Commands are run in a Windows virtual machine environment
        - checkout
        - run: Write-Host 'Hello, Windows'
```

{:.tab.windowsblock.Server_v3.x}
```yaml
version: 2.1

jobs:
  build: # name of your job
    machine:
      image: windows-default
    steps:
      # Commands are run in a Windows virtual machine environment
        - checkout
        - run: Write-Host 'Hello, Windows'
```

{:.tab.windowsblock.Server_v2.x}
```yaml
version: 2

jobs:
  build: # name of your job
    machine:
      image: windows-default
    steps:
      # Commands are run in a Windows virtual machine environment
        - checkout
        - run: Write-Host 'Hello, Windows'
```

たとえば、Windows Server 2022 など、Windows Orb で特定のイメージを使用するには、次のスニペットに示すように `executor` タイプに指定する必要があります。
{: class="alert alert-info"}

```yaml
version: 2.1

orbs:
  win: circleci/windows@4.1.1

jobs:
  build:
    executor: win/server-2022
    steps:
      - run: Write-Host 'Hello, Windows'
workflows:
  my-workflow:
    jobs:
      - build
```

## 利用可能なリソースクラス
{: #available-resource-classes }

{% include snippets/ja/windows-resource-table.md %}

{:.tab.windowsresourceblock.Cloud_with_orb}
```yaml
version: 2.1 # Use version 2.1 to enable Orb usage.

orbs:
  win: circleci/windows@4.1.1 # The Windows orb give you everything you need to start using the Windows executor.

jobs:
  build: # name of your job
    executor: 
      name: win/default # executor type
      size: medium # can be medium, large, xlarge, 2xlarge

    steps:
      # Commands are run in a Windows virtual machine environment
      - checkout
      - run: Write-Host 'Hello, Windows'
```

{:.tab.windowsresourceblock.Cloud_with_machine}
```yaml
version: 2

jobs:
  build: # name of your job
    machine:
      image: 'windows-server-2022-gui:current'
    resource_class: windows.medium # can be medium, large, xlarge, 2xlarge
    steps:
      # Commands are run in a Windows virtual machine environment
        - checkout
        - run: Write-Host 'Hello, Windows'
```

{:.tab.windowsresourceblock.Server_v3.x}
```yaml
version: 2.1

jobs:
  build: # name of your job
    machine:
      image: windows-default
    resource_class: windows.medium # can be medium, large, xlarge, 2xlarge
    steps:
      # Commands are run in a Windows virtual machine environment
        - checkout
        - run: Write-Host 'Hello, Windows'
```

{:.tab.windowsresourceblock.Server_v2.x}
```yaml
version: 2

jobs:
  build: # name of your job
    machine:
      image: windows-default
    resource_class: windows.medium # can be medium, large, xlarge, 2xlarge
    steps:
      # Commands are run in a Windows virtual machine environment
        - checkout
        - run: Write-Host 'Hello, Windows'
```

## Windows の Machine Executor イメージ
{: #windows-machine-executor-images }

CircleCI は Windows Server 2019 では Visual Studio 2019 を、Windows Server 2022 では Visual Studio 2022 をサポートしています。 Windows イメージにプリインストールされているソフトウェアに関する情報は、[Developer Hub](https://circleci.com/developer/machine/image/windows-server) または [Discuss フォーラム](https://discuss.circleci.com/)をご覧ください。 Developer Hub の Windows イメージのページには、最新のアップデートへのリンクが掲載されています。

Windows Server 2022 イメージに関する詳細は、[Discuss の投稿 (英語)](https://discuss.circleci.com/t/march-2022-support-for-new-operating-system-for-windows-executors-windows-server-2022/43198/1) を参照してください。

Windows イメージは約 30 日ごとにアップデートされます。 Windows イメージの使用時にタグが指定されていない場合、デフォルトでは最新の安定バージョンが適用されます。 Windows イメージのタグ付けスキームは以下のとおりです。

- Current (Stable から変更): 本番環境で使用可能な最新の Windows イメージを参照します。 このイメージは、安定性を適度に確保しつつ、ソフトウェアの定期アップデートを取り入れたいプロジェクトで使用してください。 アップデートは、通常 1 か月に 1 回の頻度で行われます。

この新しい `current` タグは、Windows イメージで使用できます。 `current` タグと `stable` タグは同じであり、現在はどちらもサポートされています。 詳細については、[Discuss フォーラム](https://discuss.circleci.com/t/april-2022-windows-image-updates-available-for-stable-tags/43511)をご覧ください。
{: class="alert alert-info"}

- Previous: 本番環境で使用可能な過去の Windows イメージを参照します。 このイメージは、最新のソフトウェアのアップデートに破壊的変更が含まれる場合などに使用できます。 アップデートは、通常 1 か月に 1 回の頻度で行われます。

- Edge: 最新の Windows イメージを参照し、メインブランチの HEAD からビルドされます。 このタグは、最新の変更を含み完全な安定性が保証されていないテストバージョンのイメージとして使うことが想定されています。

## Windows Executor でのシェルの指定
{: #specifying-a-shell-with-the-windows-executor }

Windows では 3 種類のシェルを使用してジョブステップを実行できます。

* PowerShell (Windows Orb のデフォルト)
* Bash
* コマンド

シェルは、ジョブレベルまたはステップレベルで設定できます。 同じジョブ内で複数のシェルを使用可能です。 以下の例では、`job` 宣言と `step` 宣言に `shell:` 引数を追加して、Bash、PowerShell、およびコマンドを使用しています。

{:.tab.windowsblockthree.Cloud}
```yaml
version: 2.1

orbs:
  win: circleci/windows@4.1.1

jobs:
  build:
    executor:
      name: win/default
    steps:
      # default shell is Powershell
      - run:
         command: $(echo hello | Out-Host; $?) -and $(echo world | Out-Host; $?)
         shell: powershell.exe
      - run:
         command: echo hello && echo world
         shell: bash.exe
      - run:
         command: echo hello & echo world
         shell: cmd.exe
```

{:.tab.windowsblockthree.Server_3}
```yaml
version: 2.1
jobs:
  build: # name of your job
    machine:
      image: windows-server-2019-vs2019:current # Windows machine image
    resource_class: windows.medium
    steps:
      # default shell is Powershell
      - run:
         command: $(echo hello | Out-Host; $?) -and $(echo world | Out-Host; $?)
         shell: powershell.exe
      - run:
         command: echo hello && echo world
         shell: bash.exe
      - run:
         command: echo hello & echo world
         shell: cmd.exe
```

{:.tab.windowsblockthree.Server_2}
```yaml
version: 2
jobs:
  build: # name of your job
    machine:
      image: windows-server-2019-vs2019:current # Windows machine image
    resource_class: windows.medium
    steps:
      # default shell is Powershell
      - run:
         command: $(echo hello | Out-Host; $?) -and $(echo world | Out-Host; $?)
         shell: powershell.exe
      - run:
         command: echo hello && echo world
         shell: bash.exe
      - run:
         command: echo hello & echo world
         shell: cmd.exe
```

**注:** 更新された、または他の Windows シェルツールをインストールすることも可能です。 たとえば、`dotnet` CLI により Powershell Core の最新版をインストールし、ジョブの連続するステップで使用することができます。

{:.tab.windowsblockfour.Cloud}
```yaml

version: 2.1

orbs:
  win: circleci/windows@4.1.1

jobs:
  build:
    executor: win/default
    steps:
      - checkout
      - run: dotnet tool install --global PowerShell
      - run: pwsh ./<my-script>.ps1

```

{:.tab.windowsblockfour.Server_3}
```yaml
version: 2.1
jobs:
  build: # name of your job
    machine:
      image: windows-default # Windows machine image
    resource_class: windows.medium
    steps:
      - checkout
      - run: dotnet tool install --global PowerShell
      - run: pwsh ./<my-script>.ps1
```

{:.tab.windowsblockfour.Server_2}
```yaml
version: 2
jobs:
  build: # name of your job
    machine:
      image: windows-default # Windows machine image
    resource_class: windows.medium
    steps:
      - checkout
      - run: dotnet tool install --global PowerShell
      - run: pwsh ./<my-script>.ps1
```


## Windows Executor での Windows Docker コンテナの実行
{: #windows-docker-containers-on-windows-executor }

Windows Docker コンテナは、このように Windows Executor で実行することも可能です。

{:.tab.windowsblockone.Cloud}
```yaml
version: 2.1

orbs:
  win: circleci/windows@4.1.1

jobs:
  build:
    executor:
      name: win/default
      shell: powershell.exe
    steps:
      - checkout
      - run: systeminfo
      - run:
          name: "Check docker"
          shell: powershell.exe
          command: |
            docker info
            docker run hello-world:nanoserver-1809

```

{:.tab.windowsblockone.Server_3}
```yaml
version: 2.1
jobs:
  build: # name of your job
    machine:
      image: windows-default # Windows machine image
    resource_class: windows.medium
    steps:
      - checkout
      - run: systeminfo
      - run:
          name: "Check docker"
          shell: powershell.exe
          command: |
            docker info
            docker run hello-world:nanoserver-1809
```

{:.tab.windowsblockone.Server_2}
```yaml
version: 2
jobs:
  build: # name of your job
    machine:
      image: windows-default # Windows machine image
    resource_class: windows.medium
    steps:
      - checkout
      - run: systeminfo
      - run:
          name: "Check docker"
          shell: powershell.exe
          command: |
            docker info
            docker run hello-world:nanoserver-1809
```

## Windows ビルドへの SSH 接続
{: #ssh-into-your-windows-build }

Windows ビルドコンテナに SSH 接続することができます。 これは、パイプラインに関する問題のトラブルシューティングに便利です。 Windows コンテナに SSH 接続するには、以下の手順を実行します。

### 手順
{: #steps }
{:.no_toc}

1. SSH キーを [GitHub](https://help.github.com/articles/adding-a-new-ssh-key-to-your-github-account/) アカウントまたは [Bitbucket](https://confluence.atlassian.com/bitbucket/set-up-an-ssh-key-728138079.html) アカウントに追加していることを確認します。

2. SSH 接続を有効にしてジョブを起動するには、Rerun Workflow ドロップダウンメニューから Rerun job with SSH オプションを選択します。

3. 接続の詳細情報を確認するには、ジョブ出力の Enable SSH セクションを展開します。ここで、接続に必要な SSH コマンドを確認できます。![SSH 接続の詳細情報]({{ site.baseurl }}/assets/img/docs/ssh-windows-obf.png)

SSH 接続するときには、実行するシェルの名前を渡してください。 上のビルドで `cmd.exe` を実行するには、`ssh -p <remote_ip> -- cmd.exe` を実行します。

以下のオプションが利用できます。

- powershell.exe
- bash.exe
- cmd.exe

ビルドで SSH を使用する方法については、[こちら]({{site.baseurl}}/ja/ssh-access-jobs)を参照してください。

## 既知の問題と制限事項
{: #known-issues-and-limitations }

Windows Executor には以下に挙げる問題が確認されており、可能な限り早期に対処することを目指しています。

* SSH から Windows ジョブに接続し、`bash` シェルを使用すると、ターミナルのプロンプトが空になってしまう
* 現時点では、ネストされた仮想化をサポートしていない(`--platform linux` フラグの使用など)
* Windows Executor は現時点で Windows コンテナのみをサポートしている。 現在、Windows で Linux コンテナを実行することはできません。

## 次のステップ
{: #next-steps }

「[Windows での Hello World]({{site.baseurl}}/ja/hello-world-windows/)」ページを参照してください。

