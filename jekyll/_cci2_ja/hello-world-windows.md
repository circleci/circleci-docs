---
layout: classic-docs
title: "Windows での Hello World"
short-title: "Windows での Hello World"
description: "First Windows project on CircleCI"
categories:
  - はじめよう
order: 4
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

This document describes how to get started with continuous integration on **Windows execution environments** on CircleCI. If this is your first time setting up CircleCI, we recommend checking out the [Getting Started guide]({{ site.baseurl}}/2.0/getting-started/).

* 目次
{:toc}


## 前提条件
{: #prerequisites }

作業を行う前に、以下を準備しておく必要があります。

* CircleCI の[アカウント](https://circleci.com/ja/signup/)。
* Free プラン (デフォルト) または [Performance プラン](https://circleci.com/ja/pricing/)。 CircleCI Server をお使いの方向けには以下に別のコード例を掲載していますので、そちらをご参照ください。
* クラウド版をお使いの場合にプロジェクトで Windows を使用するには、[パイプラインを有効化]({{site.baseurl}}/ja/2.0/build-processing/)する必要があります。

## Overview of the Windows executor
{: #overview-of-the-windows-executor }

The Windows execution environment (or `executor`) gives users the tools to build Windows projects, such as a Universal Windows Platform (UWP) application, a .NET executable, or Windows-specific (like the .NET framework) projects. Windows Executor の仕様と機能は以下のとおりです。

- VM ベースでジョブの完全分離を保証
- Windows Server 2019 Datacenter エディションの Server Core バージョンを使用
- vCPU 4 基と RAM 15 GB を搭載
- PowerShell がデフォルトのシェル (Bash と cmd を手動で選択可能)
- Windows コンテナの実行に Docker Engine - Enterprise を使用可能

**備考:**

- メモ: Windows Executor は現時点で Windows コンテナのみをサポートしています。 現在、Windows で Linux コンテナを実行することはできません。
- Orb usage is not supported on CircleCI Server v2.x (please view the "server" code samples for server usage.)

## Windows executor images
{: #windows-executor-images }

現在、CircleCI は Windows イメージとして Windows Server 2019 with Visual Studio 2019 のみをサポートしています。 このイメージの完全な内容については、このドキュメント末尾の[インストール済みソフトウェアの一覧](#windows-イメージにプリインストールされているソフトウェア)を参照してください。 CircleCI Server の Windows イメージに何が含まれているのか、詳しい情報についてはシステム管理者にお問い合わせください。

なお、WindowsのDockerコンテナは、このようにWindowsのExecutorで実行することも可能です。

{:.tab.windowsblockone.Cloud}
```yaml
version: 2.1

orbs:
  win: circleci/windows@2.2.0

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


## Known issues
{: #known-issues }

Windows Executor には以下に挙げる問題が確認されており、可能な限り早期の対処を目指しています。

* SSH から Windows ジョブに接続し、`bash` シェルを使用すると、ターミナルのプロンプトが空になってしまう
* It is currently not possible to do nested virtualization (for example, using the `--platform linux` flag).

## Example configuration file
{: #example-configuration-file }

以下の構成スニペットを `.circleci/config.yml` ファイルに貼り付けることで、CircleCI で Windows を使用できるようになります。

{:.tab.windowsblocktwo.Cloud}
```yaml
version: 2.1 # バージョン 2.1 を指定して Orb の使用を有効化します

orbs:
  win: circleci/windows@2.2.0 # Windows Orb には Windows Executor の使用に必要なすべてが揃っています

jobs:
  build: # name of your job
    executor:
      name: win/default # executor type
      size: "medium" # resource class, can be "medium", "large", "xlarge", "2xlarge", defaults to "medium" if not specified

    steps:
      # Commands are run in a Windows virtual machine environment
      - checkout
      - run: Write-Host 'Hello, Windows'
```

{:.tab.windowsblocktwo.Server_3}
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

{:.tab.windowsblocktwo.Server_2}
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

ここからはバージョン 2.1 の構文を使用して Windows Executor の使用について説明しますが、CircleCI Server を使用している場合は前述の Executor 定義構文を参考にしてください。

## Specifying a Shell with the Windows Executor
{: #specifying-a-shell-with-the-windows-executor }

Windows では 3 種類のシェルを使用してジョブ ステップを実行できます。

* PowerShell (Windows Orb のデフォルト)
* Bash
* コマンド

シェルは、ジョブレベルまたはステップレベルで構成できます。 同じジョブ内で複数のシェルを使用可能です。 以下の例では、`job` 宣言と `step` 宣言に `shell:` 引数を追加して、Bash、PowerShell、およびコマンドを使用しています。


{:.tab.windowsblockthree.Cloud}
```YAML
version: 2.1

orbs:
  win: circleci/windows@2.2.0

jobs:
  build:
    executor:
      name: win/default
    steps:
      # デフォルトのシェルは PowerShell
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
```YAML
version: 2.0

jobs:
  build: # name of your job
    machine:
      image: windows-default # Windows machine image
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
```YAML
version: 2

jobs:
  build: # name of your job
    machine:
      image: windows-default # Windows machine image
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

**メモ:** 更新版などの Windows シェル ツールをインストールすることも可能です。 `dotnet` CLI で PowerShell Core の最新版をインストールし、ジョブの一連のステップに使用できます。


{:.tab.windowsblockfour.Cloud}
```YAML

version: 2.1

orbs:
  win: circleci/windows@2.2.0

jobs:
  build:
    executor: win/default
    steps:
      - checkout
      - run: dotnet tool install --global PowerShell
      - run: pwsh ./<my-script>.ps1

```

{:.tab.windowsblockfour.Server_3}
```YAML
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
```YAML
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

## Example application
{: #example-application }

Windows Executor を使用した例として、少し応用した (まだ初歩ですが) "hello world" アプリケーションを考えます。 この[サンプル アプリケーション](https://github.com/CircleCI-Public/circleci-demo-windows)も「Hello World」をコンソールに出力します。 **Note:** If you are using Windows on CircleCI server, replace usage of orbs with a machine image as described in the previous code samples.

設定ファイルの全体は[こちら](https://github.com/CircleCI-Public/circleci-demo-windows/blob/master/.circleci/config.yml)で確認してください。

```yaml
version: 2.1
```

上記のように、CircleCI のバージョン `2.1` を使用することを最初に宣言します。 これにより、[Orb](https://circleci.com/ja/orbs/) と[パイプライン]({{site.baseurl}}/ja/2.0/build-processing/)を利用できます。

```yaml
orbs:
  win: circleci/windows@2.2.0
```

次に、ビルドで使用する Orb を宣言します。 最初は [Windows Orb](https://circleci.com/developer/ja/orbs/orb/circleci/windows) のみを使用します。

```yaml
jobs:
  build:
    executor:
      name: win/default
      shell: powershell.exe
```

`jobs` キーの下で、使用している Orb を介して Executor を設定します。 以降のステップに適用されるデフォルトのシェルも宣言できます。 デフォルトのシェルは `powershell.exe` です。

```yaml
    steps:
      - checkout
```

In our first step, we run the [`checkout`]({{ site.baseurl}}/2.0/configuration-reference/#checkout) command to pull our source code from our version control system.

```yaml
      - restore_cache:
          keys:
      - run:
          name: "プロジェクト依存関係のインストール"
          command: dotnet.exe restore
      - save_cache:
          paths:
            - C:\Users\circleci\.nuget\packages
```

次に設定ファイルでは、キャッシュを利用して、キャッシュされた依存関係を以前のビルドから復元します。 `dotnet restore` コマンドは、まだインストールされていない、または復元されていないすべての依存関係をキャッシュからフェッチします。 キャッシュの詳細については、[キャッシュ]({{ site.baseurl}}/2.0/caching)に関するドキュメントを参照してください。

```yaml
      - run:
          name: "ビルド ステップの実行"
          command: dotnet.exe publish -c Release -r win10-x64
      - run:
          name: "実行可能ファイルのテスト"
          command: .\bin\Release\netcoreapp2.1\win10-x64\publish\circleci-demo-windows.exe
```

続いて 2 つのステップを実行します。 1 つは Windows 10 用の実行可能ファイルをビルドし、もう 1 つはその実行可能ファイルをテストします (コンソールに「Hello World」と出力されます)。

```yaml
      - store_artifacts:
          path: .\bin\Release\netcoreapp2.1\win10-x64\publish\circleci-demo-windows.exe
```

最後のステップでは、ビルド実行可能ファイルをアーティファクトとして保存し、CircleCI Web アプリケーションまたは API からアクセスできるようにします。

## SSH into your build
{: #ssh-into-your-build }

Windows ビルド コンテナに SSH 接続することができます。 これは、パイプラインに関する問題のトラブルシューティングに便利です。 Windows コンテナに SSH 接続するには、以下の手順を実行します。

### Steps
{: #steps }

1. SSH キーを [GitHub](https://help.github.com/articles/adding-a-new-ssh-key-to-your-github-account/) アカウントまたは [Bitbucket](https://confluence.atlassian.com/bitbucket/set-up-an-ssh-key-728138079.html) アカウントに追加していることを確認します。

2. SSH 接続を有効にしてジョブを起動するには、[Rerun Workflow (ワークフローを再実行する)] ドロップダウン メニューから [Rerun job with SSH (SSH でジョブを再実行する)] オプションを選択します。

3. SSH から Windows ジョブに接続し、`bash` シェルを使用すると、ターミナルのプロンプトが空になってしまう![SSH 接続の詳細情報]({{ site.baseurl }}/assets/img/docs/ssh-windows-obf.png)

SSH 接続するときには、実行するシェルの名前を渡してください。 上のビルドで `cmd.exe` を実行するには、`ssh -p <remote_ip> -- cmd.exe` を実行します。

以下のオプションが利用できます。

- powershell.exe
- bash.exe
- cmd.exe

ビルドで SSH を使用する方法については、[こちら]({{site.baseurl}}/ja/2.0/ssh-access-jobs)を参照してください。

## Next steps
{: #next-steps }

CircleCI の機能については、以下のドキュメントを確認してください。

* Windows Server 2019 Core Datacenter エディション
* 並列実行、順次実行、スケジュール実行、手動承認のワークフローによるジョブのオーケストレーションの例については「[ワークフローを使用したジョブのスケジュール]({{site.baseurl}}/ja/2.0/workflows)」を参照してください。
* すべてのキーとビルド済み Docker イメージに関する詳細なリファレンスについては、それぞれ「[CircleCI を設定する]({{site.baseurl}}/ja/2.0/configuration-reference/)」、「[CircleCI のビルド済み Docker イメージ]({{site.baseurl}}/ja/2.0/circleci-images/)」を参照してください。

## Software pre-installed in the Windows image
{: #software-pre-installed-in-the-windows-image }

**Windows Server 2019 with Visual Studio 2019**

* Visual Studio 2019 Community エディション
* Visual Studio 2019 Community Edition
    * CircleCI でこのバージョンの Visual Studio を使用する組織には、追加のライセンス条項が適用されます。 Windows ジョブでこの Visual Studio バージョンを使用する前に、[Visual Studio 2019 Community エディションのライセンス条項](https://visualstudio.microsoft.com/vs/community/#usage)を確認してください。
    * Azure SDK for Visual Studio 2019
    * Visual Studio 2019 Build Tools
* AWS
    * AWS CLI 1.16.209
    * Python 3.6.0
    * Botocore 1.12.199
* Shells:
    * Powershell 5
    * GNU bash 4.4.231 (x86_64-pc-msys)
    * cmd
* .NET Framework 5
* .NET Core
    * SDK 5.0.402
    * SDK 5.0.401
    * SDK 3.1.406 (x64)
    * SDK 3.0.100-preview7-012821
    * Runtime 3.0.0-preview6-27804-01
    * SDK 2.2.401
    * Runtime 2.2.6
    * SDK 2.1.801
* Nunit 3.10.0
* Git 2.33.1
* Git LFS 2.7.2
* Gzip 1.3.12
* 7zip 19.00
* PsExec64 2.34
* Windows 10 SDK
    * 10.0.26624
    * 10.1.18362.1
* Docker Engine - Enterprise version 18.09.7
* NuGet CLI 5.2.0.6090
* Chocolatey v0.11.2
* Azure Service Fabric
    * SDK 3.3.617.9590
    * Runtime 6.4.617.9590
* Azure CLI 2.0.70
* OpenJDK 12.0.2
* Node.js 14.17.5
* NVM (Node Version Manager) 1.1.7
* Yarn 1.22.17
* Ruby 2.6.3
* Go 1.17
* Python 3.9
* Java 12.0.2
* Miniconda 3
* WinAppDriver 1.1.1809.18001
* Text editors
    * nano 2.5
    * vim 8.2
* jq 1.5
