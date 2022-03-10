---
layout: classic-docs
title: "Windows での Hello World"
short-title: "Windows での Hello World"
description: "CircleCI  での最初の Windows プロジェクト"
categories:
  - はじめよう
order: 4
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

このドキュメントでは、CircleCI の **Windows 実行環境**で継続的インテグレーションを開始する方法を説明します。 今回初めて CircleCI をセットアップする場合は、先に[入門ガイド]({{ site.baseurl }}/ja/2.0/getting-started)をご覧になることをお勧めします。

* 目次
{:toc}


## 前提条件
{: #prerequisites }

作業を行う前に、以下を準備しておく必要があります。

* CircleCI の[アカウント](https://circleci.com/ja/signup/)。
* Free プラン (デフォルト) または [Performance または Scale プラン](https://circleci.com/ja/pricing/)。 CircleCI Server をお使いの方には以下に別のコード例を掲載していますので、そちらをご参照ください。
* クラウド版でプロジェクトに Windows を使用するには、[パイプラインを有効化]({{site.baseurl}}/ja/2.0/build-processing/)する必要があります。

## Windows Executor の概要
{: #overview-of-the-windows-executor }

Windows 実行環境 (`executor`) は、Universal Windows Platform (UWP) アプリケーションや .NET が実行可能な Windows 固有プロジェクト(.NET フレームワークなど) といった、Windows プロジェクトをビルドするためのツールを提供します。 Windows Executor の仕様と機能は以下のとおりです。

- VM ベースでジョブの完全分離を保証
- Windows Server 2019 Datacenter エディションの Server Core バージョンを使用
- PowerShell がデフォルトのシェル (Bash と cmd を手動で選択可能)
- Windows コンテナの実行に Docker Engine - Enterprise を使用可能

**備考:**

- メモ: Windows Executor は現時点で Windows コンテナのみをサポートしています。 現在、Windows で Linux コンテナを実行することはできません。
- CircleCI Server v2.x では Orb の使用はサーポートしていません (CircleCI Server を使用の場合は、"Server" コードサンプルを参照してください)。

## Windows Executor イメージ
{: #windows-executor-images }

現在、CircleCI は Windows イメージとして Windows Server 2019 with Visual Studio 2019 のみをサポートしています。 このイメージの完全な内容については、このドキュメント末尾の[インストール済みソフトウェアの一覧](#windows-イメージにプリインストールされているソフトウェア)を参照してください。 CircleCI Server の Windows イメージに含まれる内容の詳細についてはシステム管理者にお問い合わせください。

Windows イメージは約 30 日ごとにアップデートされます。 Windows イメージの使用時にタグが指定されていない場合、デフォルトでは最新の安定バージョンが適用されます。 Windows のタグ付けスキームは以下のとおりです。

- Stable: 本番環境で使用可能な最新の Windows イメージを参照します。 このイメージは、安定性を適度に確保しつつ、ソフトウェアの定期アップデートを取り入れたいプロジェクトで使用してください。 アップデートは、通常月に 1 回の頻度で行われます。

- Previous: 本番環境で使用可能な過去の (安定した)  Windows イメージを参照します。 このイメージは、最新のソフトウェアのアップデートに破壊的変更が含まれる場合などに使用できます。 アップデートは、通常月に 1 回の頻度で行われます。

- Edge: 最新の Windows イメージを参照し、メインブランチの HEAD からビルドされます。 このタグは、最新の変更を含み完全な安定性が保証されていないテストバージョンのイメージとして使うことが想定されています。

なお、Windows の Docker コンテナは、このように Windows の Executor で実行することも可能です。

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


## 既知の問題
{: #known-issues }

Windows Executor には以下に挙げる問題が確認されており、可能な限り早期の対処を目指しています。

* SSH から Windows ジョブに接続し、`bash` シェルを使用すると、ターミナルのプロンプトが空になってしまう
* 現時点では、ネストされた仮想化をサポートしていません (`--platform linux` フラグの使用など)。

## サンプルの設定ファイル
{: #example-configuration-file }

以下の設定スニペットを `.circleci/config.yml` ファイルに貼り付けることで、CircleCI で Windows を使用できるようになります。

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

## Windows Executor でのシェルの指定
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

**注:** 更新版や他の Windows シェルツールをインストールすることも可能です。たとえば、`dotnet` CLI で PowerShell Core の最新版をインストールし、ジョブの一連のステップに使用できます。


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

## サンプル アプリケーション
{: #example-application }

Windows Executor を使用した例として、少し応用した (まだ初歩ですが) "hello world" アプリケーションを考えます。 この[サンプル アプリケーション](https://github.com/CircleCI-Public/circleci-demo-windows)も「Hello World」をコンソールに出力します。そのために .NET コアを使用して実行可能ファイルを作成し、依存関係キャッシュを使用し、ビルドごとにアーティファクトを作成します。 **注:** CircleCI Server をご使用の場合は、上記のコードサンプルに記載されているように Orb をマシンイメージの使用に置き換えます。

設定ファイルの全体は[こちら](https://github.com/CircleCI-Public/circleci-demo-windows/blob/master/.circleci/config.yml)で確認してください。

```yaml
version: 2.1
```

上記のように、CircleCI のバージョン `2.1` を使用することを最初に宣言します。これにより、[Orb](https://circleci.com/ja/orbs/) と[パイプライン]({{site.baseurl}}/2.0/build-processing/)を利用できます。

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

最初のステップでは、[`checkout`]({{ site.baseurl}}/2.0/configuration-reference/#checkout) コマンドを実行して、バージョン管理システムからソース コードをプルします。

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

続いて 2 つのステップを実行します。1 つは Windows 10 用の実行可能ファイルをビルドし、もう 1 つはその実行可能ファイルをテストします (コンソールに「Hello World」と出力されます)。

```yaml
      - store_artifacts:
          path: .\bin\Release\netcoreapp2.1\win10-x64\publish\circleci-demo-windows.exe
```

最後のステップでは、ビルド実行可能ファイルをアーティファクトとして保存し、CircleCI Web アプリケーションまたは API からアクセスできるようにします。

## ビルドへの SSH 接続
{: #ssh-into-your-build }

Windows ビルド コンテナに SSH 接続することができます。 これは、パイプラインに関する問題のトラブルシューティングに便利です。 Windows コンテナに SSH 接続するには、以下の手順を実行します。

### 手順
{: #steps }

1. SSH キーを [GitHub](https://help.github.com/articles/adding-a-new-ssh-key-to-your-github-account/) アカウントまたは [Bitbucket](https://confluence.atlassian.com/bitbucket/set-up-an-ssh-key-728138079.html) アカウントに追加していることを確認します。

2. SSH 接続を有効にしてジョブを起動するには、[Rerun Workflow (ワークフローを再実行する)] ドロップダウン メニューから [Rerun job with SSH (SSH でジョブを再実行する)] オプションを選択します。

3. SSH から Windows ジョブに接続し、`bash` シェルを使用すると、ターミナルのプロンプトが空になってしまう![SSH 接続の詳細情報]({{ site.baseurl }}/assets/img/docs/ssh-windows-obf.png)

SSH 接続するときには、実行するシェルの名前を渡してください。 上のビルドで `cmd.exe` を実行するには、`ssh -p <remote_ip> -- cmd.exe` を実行します。

以下のオプションが利用できます。

- powershell.exe
- bash.exe
- cmd.exe

ビルドで SSH を使用する方法については、[こちら]({{site.baseurl}}/2.0/ssh-access-jobs)を参照してください。

## 次のステップ
{: #next-steps }

CircleCI の機能については、以下のドキュメントを確認してください。

* 2.0 設定ファイルの概要、および .circleci/config.yml ファイルにおけるトップレベル キーの階層については「[コンセプト]({{site.baseurl}}/2.0/concepts/)」を参照してください。
* 並列実行、順次実行、スケジュール実行、手動承認のワークフローによるジョブのオーケストレーションの例については「[ワークフローを使用したジョブのスケジュール]({{site.baseurl}}/ja/2.0/workflows)」を参照してください。
* すべてのキーとビルド済み Docker イメージに関する詳細なリファレンスについては、それぞれ「[CircleCI を設定する]({{site.baseurl}}/ja/2.0/configuration-reference/)」、「[CircleCI のビルド済み Docker イメージ]({{site.baseurl}}/ja/2.0/circleci-images/)」を参照してください。

## Windows イメージにプリインストールされているソフトウェア
{: #software-pre-installed-on-the-windows-image }

Windows イメージにプリインストールされているソフトフェアに関する情報は、[Discuss](https://discuss.circleci.com/) のページをご覧ください。