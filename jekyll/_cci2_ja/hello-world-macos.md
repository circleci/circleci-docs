---
layout: classic-docs
title: "macOS での Hello World"
short-title: "macOS での Hello World"
description: "CircleCI での最初の macOS プロジェクト"
categories:
  - はじめよう
order: 4
version:
  - クラウド
---

CircleCI の **macOS 実行環境**で継続的インテグレーションを開始する方法について説明します。 CircleCI の基本的な操作について確認したい場合は、[入門ガイド]({{ site.baseurl }}/ja/2.0/getting-started)を参照することをお勧めします。 また、「[macOS 上の iOS アプリケーションのテスト]({{ site.baseurl}}/ja/2.0/testing-ios/)」や「[iOS プロジェクトのチュートリアル]({{ site.baseurl }}/ja/2.0/ios-tutorial/)」も併せてご覧ください。

## 前提条件
{: #prerequisites }

作業を行う前に、以下を準備しておく必要があります。

- CircleCI の[アカウント](https://circleci.com/ja/signup/)
- Xcode がインストールされた Apple コンピューター (サンプル プロジェクトを開く場合)

## macOS Executor の概要
{: #overview-of-the-macos-executor }

macOS 実行環境 (`executor`) は iOS と macOS の開発用に提供されるもので、これを使用して macOS および iOS アプリケーションのテスト、ビルド、デプロイを CircleCI 上で行えます。 macOS Executor は、macOS 環境でジョブを実行し、iPhone、iPad、Apple Watch、および Apple TV の各シミュレーターへのアクセスを提供します。

macOS Executor をセットアップする前に、サンプル アプリケーションをセットアップする必要があります。

## サンプルアプリケーション
{: #example-application }

このサンプルアプリケーションは簡単な mac アプリです。5分間のタイマーが実行され、単体テストが含まれています (このアプリは単に macOS 実行環境の基礎を説明することを目的としており、実際のアプリケーションはこれよりもはるかに複雑です)。

macOS 実行環境についての理解を深めていただければ、CircleCI を利用して以下のことが可能になります。

- コードをプッシュするたびに、macOS VM 上で Xcode を使用してテストを実行する
- テストが正常に完了した後、コンパイルされたアプリケーションをアーティファクトとして作成してアップロードする

サンプル アプリケーションのリポジトリは [GitHub](https://github.com/CircleCI-Public/circleci-demo-macos) にチェック アウトできます。

下記のサンプル設定ファイルのコードを実行しテストする場合は、GitHub からサンプルアプリケーションをフォークまたは複製する必要があるのでご注意ください。 このサンプル設定ファイルが、すべての Xcode プロジェクトで動作するとは限りません。

## サンプル設定ファイル
{: #example-configuration-file }

このアプリケーションでは、外部ツールや依存関係が使用されていないため、`.circleci/config.yml` ファイルの内容はきわめて単純です。 各ステップの内容についてコメントを付けて説明しています。

```yaml
version: 2.1

jobs: # a basic unit of work in a run
  test: # your job name
    macos:
      xcode: 12.5.1 # indicate your selected version of Xcode
    steps: # a series of commands to run
      - checkout  # pull down code from your version control system.
      - run:
          name: Run Unit Tests
          command: xcodebuild test -scheme circleci-demo-macos

  build:
    macos:
      xcode: 12.5.1 # indicate your selected version of Xcode
    steps:
      - checkout
      - run:
          # build our application
          name: Build Application
          command: xcodebuild
      - run:
          # compress Xcode's build output so that it can be stored as an artifact
          name: Compress app for storage
          command: zip -r app.zip build/Release/circleci-demo-macos.app
      - store_artifacts: # store this build output. Read more: https://circleci.com/docs/2.0/artifacts/
          path: app.zip
          destination: app

workflows:
  version: 2
  test_build:
    jobs:
      - test
      - build:
        requires:
          test
```

まだ CircleCI の `config.yml` を編集したことがない方には、わかりにくい部分があるかもしれません。 `config.yml` の動作の概要については、以降のセクションに記載しているリンク先から確認できます。

macOS でのビルドの基礎について説明しているため、上記のサンプルの `config.yml` には以下の内容が含まれています。

- 使用する [`executor`]({{ site.baseurl }}/ja/2.0/configuration-reference/#docker--machine--macos--windows-executor) の指定
- [`checkout`]({{ site.baseurl }}/2.0/configuration-reference/#checkout) キーによるコードのプル
- Xcode でのテストの実行
- アプリケーションのビルド
- アプリケーションの圧縮と [`store_artifacts`]({{site.baseurl }}/2.0/configuration-reference/#store_artifacts) キーによる保存

`config.yml` ファイルの詳細については、[設定リファレンスガイド]({{site.baseurl}}/ja/2.0/configuration-reference/)を参照してください。

## Xcodeのクロスコンパイル
{: #xcode-cross-compilation }

### ユニバーサル バイナリ
{: #universal-binaries }

Xcode は現在、`x86_64` と `ARM64` の両方の CPU アーキテクチャで実行できるユニバーサルバイナリの作成をサポートしています。この場合、別々の実行可能ファイルをリリースする必要はありません。 この機能は Xcode 12.2 以降でのみサポートされていますが、古い Xcode バージョンを使用して、それぞれの `x86_64` と `ARM64` 実行可能ファイルをコンパイルすることもできます。

### 不要なアーキテクチャの抽出
{: #extracting-unwanted-architectures }

Xcode 12.2 以降では、デフォルトでユニバーサルバイナリが作成され、 `x86_64 `および `ARM64` ベースの CPU をサポートする実行可能ファイルにコンパイルされます。 一連の説明を削除する必要がある場合は、` ipo` ユーティリティを使って削除できます。

`circleci-demo-macos` というユニバーサルバイナリからスタンドアロンの x86_64 バイナリを作成する場合は、次のコマンドを実行します。

```shell
lipo -extract x86_64 circleci-demo-macos.app/Contents/MacOS/circleci-demo-macos -output circleci-demo-macos-x86_64
```

次に、`lipo -info circleci-demo-macos-x86_64`を使って抽出したバイナリがサポートするアーキテクチャを確認します。すると、以下が出力されます。

```
Architectures in the fat file: circleci-demo-macos-x86_64 are: x86_64
```


### バイナリのクロスコンパイル
{: #cross-compiled-binaries }

ユニバーサルバイナリは、Xcode 12.2 以降でのみサポートされていますが、バイナリのビルドに使用されるマシンのアーキテクチャ以外のアーキテクチャ用にバイナリをクロスコンパイルすることが可能です。 xcodebuild の場合、プロセスは比較的簡単です。 ARM64 バイナリをビルドするには、`xcodebuild` コマンドの先頭に `ARCHS=ARM64 ONLY_ACTIVE_ARCH=NO` を追加して、 `xcodebuild ARCHS=ARM64
ONLY_ACTIVE_ARCH=NO ...` を読み取ります。  `x86_64` のアーキテクチャの場合、`ARCHS` を `x86_64`  に変更します。

## 次のステップ
{: #next-steps }

macOS Executor は iOS アプリケーションのテストとビルドに広く使用されていますが、継続的インテグレーションの設定が複雑になる可能性があります。 iOS アプリケーションのビルドやテストについて詳しく知りたい場合は、以下のドキュメントをご覧ください。

- [macOS 上の iOS アプリケーションのテスト]({{ site.baseurl }}/ja/2.0/testing-ios)
- [iOS プロジェクトのチュートリアル]({{ site.baseurl }}/ja/2.0/ios-tutorial)
- [iOS プロジェクトのコード署名のセットアップ]({{ site.baseurl }}/ja/2.0/ios-codesigning)

また、CircleCI の機能については、以下のドキュメントを確認してください。

- 2.0 設定ファイルの概要、および `.circleci/config.yml` ファイルにおけるトップレベル キーの階層については「[コンセプト]({{ site.baseurl }}/ja/2.0/concepts/)」を参照してください。
- 並列実行、順次実行、スケジュール実行、手動承認のワークフローによるジョブのオーケストレーションの例については「[ワークフローを使用したジョブのスケジュール]({{ site.baseurl }}/ja/2.0/workflows)」を参照してください。
- すべてのキーとビルド済み Docker イメージに関する詳細なリファレンスについては、それぞれ「[CircleCI を設定する]({{ site.baseurl }}/2.0/configuration-reference/)」、「[CircleCI のビルド済み Docker イメージ]({{ site.baseurl }}/2.0/circleci-images/)」を参照してください。
