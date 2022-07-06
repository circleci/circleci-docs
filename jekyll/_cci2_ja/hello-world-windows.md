---
layout: classic-docs
title: "Windows での Hello World"
short-title: "Windows での Hello World"
description: "CircleCI での最初の Windows プロジェクト"
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


Windows Server 2022 イメージをクラウド版 CircleCI のお客様にもご利用いただけるようになりました。詳細については、[Discuss](https://discuss.circleci.com/t/march-2022-support-for-new-operating-system-for-windows-executors-windows-server-2022/43198) を参照してください。
{: class="alert alert-warning"}

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
- Windows Server 2019 Datacenter エディションとWindows Server 2022 Datacenter エディションの Server Core オプションのどちらでも使用可能
- PowerShell がデフォルトのシェル (Bash と cmd を手動で選択可能)
- Windows コンテナの実行に Docker Engine - Enterprise を使用可能

**注:**

- メモ: Windows Executor は現時点で Windows コンテナのみをサポートしています。 現在、Windows で Linux コンテナを実行することはできません。
- CircleCI Server v2.x では Orb の使用はサポートしていません（サーバー使用の場合は、[CircleCI Server での Windows Executor の使用](#windows-on-server)を参照してください。）

## Windows Executor イメージ
{: #windows-executor-images }

CircleCI は Windows Server 2019 では Visual Studio 2019 を、Windows Server 2022 では Visual Studio 2022 をサポートしています。 Windows イメージにプリインストールされているソフトフェアに関する情報は、[Developer Hub](https://circleci.com/developer/machine/image/windows-server) または [Discuss フォーラム](https://discuss.circleci.com/)をご覧ください。 Developer Hub の Windows イメージのページには、最新のアップデートへのリンクが掲載されています。

Windows Server 2022 イメージに関する詳細は、[Discuss の投稿（英語）](https://discuss.circleci.com/t/march-2022-support-for-new-operating-system-for-windows-executors-windows-server-2022/43198/1) を参照してください。

Windows イメージは約 30 日ごとにアップデートされます。 Windows イメージの使用時にタグが指定されていない場合、デフォルトでは最新の安定バージョンが適用されます。 Windows のタグ付けスキームは以下のとおりです。

- Current (Stable から変更） - 本番環境で使用可能な最新の Windows イメージを参照します。 このイメージは、安定性を適度に確保しつつ、ソフトウェアの定期アップデートを取り入れたいプロジェクトで使用してください。 アップデートは、通常月に 1 回の頻度で行われます。<br>

この新しい `current` タグは、Windows イメージで使用できます。 `current` と `stable` は同じであり、現在はどちらもサポートされています。 詳細については、[Discuss フォーラム](https://discuss.circleci.com/t/april-2022-windows-image-updates-available-for-stable-tags/43511)をご覧ください。
{: class="alert alert-info"}

- Previous: 本番環境で使用可能な過去の  Windows イメージを参照します。 このイメージは、最新のソフトウェアのアップデートに破壊的変更が含まれる場合などに使用できます。 アップデートは、通常月に 1 回の頻度で行われます。

- Edge: 最新の Windows イメージを参照し、メインブランチの HEAD からビルドされます。 このタグは、最新の変更を含み完全な安定性が保証されていないテストバージョンのイメージとして使うことが想定されています。

## サンプル設定ファイル
{: #example-configuration-file }

以下の設定スニペットを `.circleci/config.yml` ファイルに貼り付けると、CircleCI で Windows を使用できるようになります。

```yaml
version: 2.1 # バージョン 2.1 を指定して Orb の使用を有効化します

orbs:
  win: circleci/windows@4.1.1 # The Windows orb give you everything you need to start using the Windows executor.

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

さらに、Orb を使わずに直接ジョブ内で Windows イメージにアクセスすることができます。

```yaml
jobs:
  build-windows:
    machine:
      image: windows-server-2019:stable
      resource_class: windows.medium
      shell: powershell.exe -ExecutionPolicy Bypass
```

この場合、[Windows Orb](https://circleci.com/developer/orbs/orb/circleci/windows)を使用して設定を簡素化することを強く推奨します。

クラウド版 CircleCI で、Windows Orb を使って Windows Server 2022 イメージを使用するには、 `executor`タイプで以下のように指定する必要があります。
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

## Windows Executor でのシェルの指定
{: #specifying-a-shell-with-the-windows-executor }

Windows では 3 種類のシェルを使用してジョブステップを実行できます。

* PowerShell (Windows Orb のデフォルト)
* Bash
* コマンド

シェルは、ジョブレベルまたはステップレベルで構成できます。 同じジョブ内で複数のシェルを使用可能です。 以下の例では、`job` 宣言と `step` 宣言に `shell:` 引数を追加して、Bash、PowerShell、およびコマンドを使用しています。

```YAML
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

**注:** 更新された、または他の Windows シェルツールをインストールすることも可能です。 たとえば、`dotnet` CLI により Powershell Core の最新版をインストールし、ジョブの連続するステップで使用することができます。

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

## Windows Executor での Windows Docker コンテナの実行
{: #windows-docker-containers-on-windows-executor }

なお、Windows Dockerコンテナは、このように Windows Executor で実行することも可能です。

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

## サンプルアプリケーション
{: #example-application }

Windows Executor を使用した例として、少し進んだ (まだ初歩ですが) "hello world" を考えてみましょう。 この[サンプルアプリケーション](https://github.com/CircleCI-Public/circleci-demo-windows)も「Hello World」をコンソールに出力します。そのために .NET コアを使用して実行可能ファイルを作成し、依存関係キャッシュを使用し、ビルドごとにアーティファクトを作成します。

**注:** CircleCI Server で Windows を使用している場合、[CircleCI Server での Windows Executor の使用](#windows-on-server) に記載されているように Orb の使用をマシンイメージに置き換えてください。

設定ファイルの全体は[こちら](https://github.com/CircleCI-Public/circleci-demo-windows/blob/master/.circleci/config.yml)で確認してください。 これにはブラウザーと UI のテストが含まれますが、ここでは `hello-world` のワークフローに注目します。

```yaml
version: 2.1
```

上記のように、CircleCI のバージョン `2.1` を使用することを最初に宣言します。これにより、[Orb](https://circleci.com/ja/orbs/) と[パイプライン]({{site.baseurl}}/ja/2.0/build-processing/)を利用できます。

```yaml
orbs:
  win: circleci/windows@4.1.1
```

次に、ビルドで使用する Orb を宣言します。 最初は [Windows Orb](https://circleci.com/developer/orbs/orb/circleci/windows) のみを使用します。 このサンプルでは、2.4.0 バージョンの Orb を使用していますが、それ以降のバージョンも使用していただけます。

```yaml
workflows:
  hello-world:
    jobs:
      - build
```

`hello-world` ワークフローを定義します。ここでは`build` という単一のジョブを実行します。

```yaml
jobs:
  build:
    executor:
      name: win/default
```

`jobs` キーの下に、`build`ジョブを定義し、使用する Orb により Executor を設定します。

```yaml
    steps:
      - checkout
```

最初のステップでは、[`checkout`]({{ site.baseurl}}/ja/2.0/configuration-reference/#checkout) コマンドを実行して、バージョン管理システムからソース コードをプルします。

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
{:.no_toc}

1. SSH キーを [GitHub](https://help.github.com/articles/adding-a-new-ssh-key-to-your-github-account/) アカウントまたは [Bitbucket](https://confluence.atlassian.com/bitbucket/set-up-an-ssh-key-728138079.html) アカウントに追加していることを確認します。

2. SSH 接続を有効にしてジョブを起動するには、[Rerun Workflow (ワークフローを再実行する)] ドロップダウン メニューから [Rerun job with SSH (SSH でジョブを再実行する)] オプションを選択します。

3. SSH から Windows ジョブに接続し、`bash` シェルを使用すると、ターミナルのプロンプトが空になってしまう![SSH 接続の詳細情報]({{ site.baseurl }}/assets/img/docs/ssh-windows-obf.png)

SSH 接続するときには、実行するシェルの名前を渡してください。 上のビルドで `cmd.exe` を実行するには、`ssh -p <remote_ip> -- cmd.exe` を実行します。

以下のオプションが利用できます。

- powershell.exe
- bash.exe
- cmd.exe

ビルドで SSH を使用する方法については、[こちら]({{site.baseurl}}/ja/2.0/ssh-access-jobs)を参照してください。

## 既知の問題
{: #known-issues }

Windows Executor には以下に挙げる問題が確認されており、可能な限り早期の対処を目指しています。

* SSH から Windows ジョブに接続し、`bash` シェルを使用すると、ターミナルのプロンプトが空になってしまう
* 現時点では、ネストされた仮想化をサポートしていません (`--platform linux` フラグの使用など)。

## CircleCI Server での Windows Executor の使用
{: #windows-on-server }

CircleCI Server Windows イメージに含まれている内容の詳細はシステム管理者に問い合わせるか、[Discuss](https://discuss.circleci.com/) フォーラムのページをご覧ください。

{:.tab.windowsblocktwo.Server_3}
```yaml
version: 2.1

jobs:
  build: # name of your job
    machine:
      image: windows-server-2019-vs2019:current # Windows machine image
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
      image: windows-server-2019-vs2019:current # Windows machine image
    resource_class: windows.medium
    steps:
      # Commands are run in a Windows virtual machine environment
        - checkout
        - run: Write-Host 'Hello, Windows'
```

### シェルの指定
{: #specifying-a-shell-server }
{:.no_toc}

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

#### `dotnet` CLI を使って Powershell Core をインストールします。
{: #install-powershell-server }
{:.no_toc}

{:.tab.windowsblockfour.Server_3}
```yaml
version: 2.1

jobs:
  build: # name of your job
    machine:
      image: windows-server-2019-vs2019:current # Windows machine image
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
      image: windows-server-2019-vs2019:current # Windows machine image
    resource_class: windows.medium
    steps:
      - checkout
      - run: dotnet tool install --global PowerShell
      - run: pwsh ./<my-script>.ps1
```

### Windows Docker コンテナの実行
{: #run-windows-container-server }
{:.no_toc}

{:.tab.windowsblockone.Server_3}
```yaml
version: 2.1

jobs:
  build: # name of your job
    machine:
      image: windows-server-2019-vs2019:current # Windows machine image
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

## 次のステップ
{: #next-steps }

CircleCI の機能については、以下のドキュメントを確認してください。

* 2.0 設定ファイルの概要、および .circleci/config.yml ファイルにおけるトップレベル キーの階層については「[コンセプト]({{site.baseurl}}/2.0/concepts/)」を参照してください。
* 並列実行、順次実行、スケジュール実行、手動承認のワークフローによるジョブのオーケストレーションの例については「[ワークフローを使用したジョブのスケジュール]({{site.baseurl}}/ja/2.0/workflows)」を参照してください。
* すべてのキーとビルド済み Docker イメージに関する詳細なリファレンスについては、それぞれ「[CircleCI を設定する]({{site.baseurl}}/ja/2.0/configuration-reference/)」、「[CircleCI のビルド済み Docker イメージ]({{site.baseurl}}/ja/2.0/circleci-images/)」を参照してください。
