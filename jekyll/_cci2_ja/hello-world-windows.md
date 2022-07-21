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

このドキュメントでは、CircleCI の **Windows 実行環境**で継続的インテグレーションを開始する方法を説明します。 今回初めて CircleCI をセットアップする場合は、先に[入門ガイド]({{ site.baseurl }}/ja/getting-started)をご覧になることをお勧めします。

* 目次
{:toc}


Windows Server 2022 イメージをクラウド版 CircleCI のお客様にもご利用いただけるようになりました。詳細については、[Discuss](https://discuss.circleci.com/t/march-2022-support-for-new-operating-system-for-windows-executors-windows-server-2022/43198) を参照してください。
{: class="alert alert-warning"}

## 前提条件
{: #prerequisites }

作業を行う前に、以下を準備しておく必要があります。

* CircleCI の[アカウント](https://circleci.com/ja/signup/)。
* Free プラン (デフォルト) または [Performance または Scale プラン](https://circleci.com/ja/pricing/)。

## サンプル アプリケーション
{: #example-application }

Windows Executor を使用した例として、少し進んだ (まだ初歩ですが) "hello world" を考えてみましょう。 この[サンプルアプリケーション](https://github.com/CircleCI-Public/circleci-demo-windows)も「Hello World」をコンソールに出力します。そのために .NET コアを使用して実行可能ファイルを作成し、依存関係キャッシュを使用し、ビルドごとにアーティファクトを作成します。

**注:** CircleCI Server で Windows を使用している場合、[CircleCI Server での Windows Executor の使用](#windows-on-server) に記載されているように Orb の使用をマシンイメージに置き換えてください。

設定ファイルの全体は[こちら](https://github.com/CircleCI-Public/circleci-demo-windows/blob/master/.circleci/config.yml)で確認してください。 これにはブラウザーと UI のテストが含まれますが、ここでは `hello-world` のワークフローに注目します。

```yaml
version: 2.1
```

Above, we start by declaring that we will use version `2.1` of CircleCI, giving us access to [Orbs](https://circleci.com/orbs/) and [Pipelines]({{site.baseurl}}/pipelines/).

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

最初のステップでは、[`checkout`]({{ site.baseurl}}/ja/configuration-reference/#checkout) コマンドを実行して、バージョン管理システムからソース コードをプルします。

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

次に設定ファイルでは、キャッシュを利用して、キャッシュされた依存関係を以前のビルドから復元します。 `dotnet restore` コマンドは、まだインストールされていない、または復元されていないすべての依存関係をキャッシュからフェッチします。 キャッシュの詳細については、[キャッシュ]({{ site.baseurl}}/ja/caching)に関するドキュメントを参照してください。

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



## 次のステップ
{: #next-steps }

CircleCI の機能については、以下のドキュメントを確認してください。

* 2.0 設定ファイルの概要、および .circleci/config.yml ファイルにおけるトップレベル キーの階層については「[コンセプト]({{site.baseurl}}/ja/concepts/)」を参照してください。
* 並列実行、順次実行、スケジュール実行、手動承認のワークフローによるジョブのオーケストレーションの例については「[ワークフローを使用したジョブのスケジュール]({{site.baseurl}}/ja/workflows)」を参照してください。
* すべてのキーとビルド済み Docker イメージに関する詳細なリファレンスについては、それぞれ「[CircleCI を設定する]({{site.baseurl}}/ja/configuration-reference/)」、「[CircleCI のビルド済み Docker イメージ]({{site.baseurl}}/ja/circleci-images/)」を参照してください。
