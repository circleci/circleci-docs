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

<div class="alert alert-warning" role="alert">
   <strong>Windows Server 2022 イメージをクラウド版 CircleCI のお客様にもご利用いただけるようになりました。詳細については、<a href="https://discuss.circleci.com/t/march-2022-support-for-new-operating-system-for-windows-executors-windows-server-2022/43198">Discuss</a> を参照してください。</strong>
</div>

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

**備考:**

- メモ: Windows Executor は現時点で Windows コンテナのみをサポートしています。 現在、Windows で Linux コンテナを実行することはできません。
- Orb usage is not supported on CircleCI Server v2.x (please view the [Using the Windows executor on CircleCI server](#windows-on-server) section for server usage.)

## Windows Executor イメージ
{: #windows-executor-images }

CircleCI は Windows Server 2019 では Visual Studio 2019 を、Windows Server 2022 では Visual Studio 2022 をサポートしています。 For information on what software is pre-installed on the Windows image, please visit the [Developer Hub](https://circleci.com/developer/machine/image/windows-server), or the [Discuss forum](https://discuss.circleci.com/). Developer Hub の Windows イメージのページには、最新のアップデートへのリンクが掲載されています。

Details on the Windows Server 2022 image can be found on this [Discuss post](https://discuss.circleci.com/t/march-2022-support-for-new-operating-system-for-windows-executors-windows-server-2022/43198/1).

Windows イメージは約 30 日ごとにアップデートされます。 Windows イメージの使用時にタグが指定されていない場合、デフォルトでは最新の安定バージョンが適用されます。 Windows のタグ付けスキームは以下のとおりです。

- Current (formerly Stable): This image tag points to the latest production-ready Windows image. このイメージは、安定性を適度に確保しつつ、ソフトウェアの定期アップデートを取り入れたいプロジェクトで使用してください。 アップデートは、通常月に 1 回の頻度で行われます。<br>

The new `current` tag is available for Windows images. The `current` and `stable` tags are equivalent, and are currently both supported. Refer to the [Discuss forum](https://discuss.circleci.com/t/april-2022-windows-image-updates-available-for-stable-tags/43511) for more information.
{: class="alert alert-info"}

- Previous: This image tag points to the previous production-ready Windows image. このイメージは、最新のソフトウェアのアップデートに破壊的変更が含まれる場合などに使用できます。 アップデートは、通常月に 1 回の頻度で行われます。

- Edge: 最新の Windows イメージを参照し、メインブランチの HEAD からビルドされます。 このタグは、最新の変更を含み完全な安定性が保証されていないテストバージョンのイメージとして使うことが想定されています。

## サンプル設定ファイル
{: #example-configuration-file }

以下の構成スニペットを `.circleci/config.yml` ファイルに貼り付けることで、CircleCI で Windows を使用できるようになります。

```yaml
version: 2.1 # バージョン 2.1 を指定して Orb の使用を有効化します

orbs:
  win: circleci/windows@4.1 # The Windows orb give you everything you need to start using the Windows executor.

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

Additionally, it is possible to access the Windows image directly in your jobs without using orbs:

```yaml
jobs:
  build-windows:
    machine:
      image: windows-server-2019:stable
      resource_class: windows.medium
      shell: powershell.exe -ExecutionPolicy Bypass
```

With that said, we strongly encourage using the [Windows orb](https://circleci.com/developer/orbs/orb/circleci/windows) as it helps simplify your configuration.

Note that in order to use the Windows Server 2022 image with the Windows orb in CircleCI cloud, it must be specified in the `executor` type, as shown in the following:
{: class="alert alert-info"}

```yaml
version: 2.1

orbs:
  win: circleci/windows@4.1

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

## Specifying a shell with the Windows executor
{: #specifying-a-shell-with-the-windows-executor }

Windows では 3 種類のシェルを使用してジョブ ステップを実行できます。

* PowerShell (default in the Windows orb)
* Bash
* コマンド

シェルは、ジョブレベルまたはステップレベルで構成できます。 同じジョブ内で複数のシェルを使用可能です。 以下の例では、`job` 宣言と `step` 宣言に `shell:` 引数を追加して、Bash、PowerShell、およびコマンドを使用しています。

```YAML
version: 2.1

orbs:
  win: circleci/windows@4.1

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

**Note:** It is possible to install updated or other Windows shell-tooling. For example, you could install the latest version of Powershell Core with the `dotnet` CLI and use it in a job's successive steps:

```yaml

version: 2.1

orbs:
  win: circleci/windows@4.1

jobs:
  build:
    executor: win/default
    steps:
      - checkout
      - run: dotnet tool install --global PowerShell
      - run: pwsh ./<my-script>.ps1

```

## Running Windows Docker containers on the Windows executor
{: #windows-docker-containers-on-windows-executor }

なお、WindowsのDockerコンテナは、このようにWindowsのExecutorで実行することも可能です。

```yaml
version: 2.1

orbs:
  win: circleci/windows@4.1

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

## サンプル アプリケーション
{: #example-application }

Let us consider a more advanced (but still introductory) "hello world" application using the Windows executor. この[サンプル アプリケーション](https://github.com/CircleCI-Public/circleci-demo-windows)も「Hello World」をコンソールに出力します。そのために .NET コアを使用して実行可能ファイルを作成し、依存関係キャッシュを使用し、ビルドごとにアーティファクトを作成します。

**Note:** If you are using Windows on CircleCI server, replace usage of orbs with a machine image, as described in the [Using the Windows executor on CircleCI server](#windows-on-server) section.

設定ファイルの全体は[こちら](https://github.com/CircleCI-Public/circleci-demo-windows/blob/master/.circleci/config.yml)で確認してください。 It also includes browser and UI testing, but we will focus on the `hello-world` workflow for now.

```yaml
version: 2.1
```

上記のように、CircleCI のバージョン `2.1` を使用することを最初に宣言します。これにより、[Orb](https://circleci.com/ja/orbs/) と[パイプライン]({{site.baseurl}}/2.0/build-processing/)を利用できます。

```yaml
orbs:
  win: circleci/windows@2.4.0
```

次に、ビルドで使用する Orb を宣言します。 We will only use the [Windows orb](https://circleci.com/developer/orbs/orb/circleci/windows) to help us get started. This example uses the 2.4.0 version of the orb, but you may consider using a more recent version.

```yaml
workflows:
  hello-world:
    jobs:
      - build
```

We define a `hello-world` workflow, in which we run a single job named `build`.

```yaml
jobs:
  build:
    executor:
      name: win/default
```

Under the `jobs` key, we define the `build` job, and set the executor via the orb we are using.

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

続いて 2 つのステップを実行します。 1 つは Windows 10 用の実行可能ファイルをビルドし、もう 1 つはその実行可能ファイルをテストします (コンソールに「Hello World」と出力されます)。

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

ビルドで SSH を使用する方法については、[こちら]({{site.baseurl}}/2.0/ssh-access-jobs)を参照してください。

## 既知の問題
{: #known-issues }

Windows Executor には以下に挙げる問題が確認されており、可能な限り早期の対処を目指しています。

* SSH から Windows ジョブに接続し、`bash` シェルを使用すると、ターミナルのプロンプトが空になってしまう
* 現時点では、ネストされた仮想化をサポートしていません (`--platform linux` フラグの使用など)。

## Using the Windows executor on CircleCI server
{: #windows-on-server }

Contact your systems administrator for details of what is included in CircleCI server Windows images, or visit the [Discuss](https://discuss.circleci.com/) forum.

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

### Specifying a shell
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

#### Install Powershell Core with the `dotnet` CLI
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

### Running Windows Docker containers
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

Consider reading documentation on some of CircleCI’s features:

* 2.0 設定ファイルの概要、および .circleci/config.yml ファイルにおけるトップレベル キーの階層については「[コンセプト]({{site.baseurl}}/2.0/concepts/)」を参照してください。
* 並列実行、順次実行、スケジュール実行、手動承認のワークフローによるジョブのオーケストレーションの例については「[ワークフローを使用したジョブのスケジュール]({{site.baseurl}}/ja/2.0/workflows)」を参照してください。
* すべてのキーとビルド済み Docker イメージに関する詳細なリファレンスについては、それぞれ「[CircleCI を設定する]({{site.baseurl}}/ja/2.0/configuration-reference/)」、「[CircleCI のビルド済み Docker イメージ]({{site.baseurl}}/ja/2.0/circleci-images/)」を参照してください。
