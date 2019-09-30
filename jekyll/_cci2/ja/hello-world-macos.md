---
layout: classic-docs
title: "macOS での Hello World"
short-title: "macOS での Hello World"
description: "CircleCI 2.0 での最初の macOS プロジェクト"
categories:
  - getting-started
order: 4
---

This document describes how to get started with continuous integration on **macOS build environments** on CircleCI. If you still need to get acquainted with CircleCI, it is recommended to checkout the [getting started guide]({{ site.baseurl }}/2.0/getting-started).

Also, there is documentation for [testing iOS]({{ site.baseurl}}/2.0/testing-ios/) and [an example iOS project]({{ site.baseurl }}/2.0/ios-tutorial/).

## 前提条件

To follow along with this document you will need:

- CircleCI の[アカウント](https://circleci.jp/signup/)
- macOS Executor でのビルドを実行できる[有料プラン](https://circleci.jp/pricing/#build-os-x)のサブスクリプション
- Xcode がインストールされた Apple コンピュータ (サンプルプロジェクトを開く場合)

## macOS Executor の概要

The macOS build environment (or `executor`) is used for iOS and macOS development, allowing you to test, build, and deploy macOS and iOS applications on CircleCI. The macOS executor runs jobs in a macOS environment and provides access to iPhone, iPad, Apple Watch and Apple TV simulators.

Before we get to setting up the macOS executor, we will need to setup our example application.

## サンプルアプリケーション

The example application is a simple mac app - it runs a 5 minute timer and contains a single unit test (real-world applications will be far more complex; this app simply serves as an introduction to the macOS build environment).

As a user getting to know the macOS build environment, our ideal scenario is for CircleCI to help with the following:

- コードをプッシュするたびに、macOS VM 上で Xcode を使用してテストを実行する
- テストが正常に完了した後、コンパイルされたアプリケーションをアーティファクトとして作成してアップロードする

You can checkout the example application's repo on [GitHub](https://github.com/CircleCI-Public/circleci-demo-macos).

## サンプルの設定ファイル

Our application does not make use of any external tools or dependencies, so we have a fairly simple `.circleci/config.yml` file. Below, each line is commented to indicate what is happening at each step.

```yaml
version: 2 # CircleCI のバージョン 2.0 を使用していることを示します
jobs: # 1回の実行の基本作業単位
  build: # `Workflows` を使用しない実行では、エントリポイントとして `build` ジョブが必要です
    macos:  # macOS Executor を使用していることを示します
      xcode: "10.0.0" # 選択された Xcode のバージョン
    steps: # 実行する一連のコマンド
      - checkout  # ユーザーのバージョン管理システムからコードをプルダウンします
      - run:
          # Xcode の CLI ツール `xcodebuild` を使用してテストを実行します
          name: 単体テストを実行
          command: xcodebuild test -scheme circleci-demo-macos
      - run:
          # アプリケーションをビルドします
          name: アプリケーションをビルド
          command: xcodebuild
      - run:
          # Xcode のビルド出力を圧縮して、アーティファクトとして格納できるようにします
          name: 保存のためにアプリを圧縮
          command: zip -r app.zip build/Release/circleci-demo-macos.app
      - store_artifacts: # このビルド出力を保存します  (詳細については https://circleci.com/docs/ja/2.0/artifacts/ を参照)
          path: app.zip
          destination: app
```

If this is your first exposure to a CircleCI `config.yml`, some of the above might seem a bit confusing. In the section below you can find some links that provide a more in-depth overview of how a `config.yml` works.

Since this is a general introduction to building on MacOs, the `config.yml` above example covers the following:

- Picking an [`executor`]({{ site.baseurl }}/2.0/configuration-reference/#docker--machine--macos--windows-executor) to use 
- [`checkout`]({{ site.baseurl }}/ja/2.0/configuration-reference/#checkout) キーによるコードのプル
- Xcode でのテストの実行
- アプリケーションのビルド
- アプリケーションの圧縮と [`store_artifacts`]({{site.baseurl }}/2.0/configuration-reference/#store_artifacts) キーによる保存

You can learn more about the `config.yml` file in the [configuration reference guide]({{site.baseurl}}/2.0/configuration-reference/).

## 次のステップ

The macOS executor is commonly used for testing and building iOS applications, which can be more complex in their continuous integrations configuration. If you are interested in building and/or testing iOS applications, consider checking out our following docs that further explore this topic:

- [macOS 上の iOS アプリケーションのテスト]({{ site.baseurl }}/2.0/testing-ios)
- [iOS プロジェクトのチュートリアル]({{ site.baseurl }}/2.0/ios-tutorial)
- [iOS プロジェクトのコード署名の設定]({{ site.baseurl }}/2.0/ios-codesigning)

Also, consider reading documentation on some of CircleCI's features:

- 2.0 設定の概要、および `.circleci/config.yml` ファイルにおけるトップレベルキーの階層については「[コンセプト]({{ site.baseurl }}/ja/2.0/concepts/)」を参照してください。

- 並列実行、順次実行、スケジュール実行、手動承認のワークフローによるジョブをオーケストレーションする例については「[ジョブの実行を Workflow で制御する]({{ site.baseurl }}/ja/2.0/workflows)」を参照してください。

- すべてのキーとビルド済み Docker イメージに関する詳細なリファレンスについては、それぞれ「[CircleCI を設定する]({{ site.baseurl }}/ja/2.0/configuration-reference/)」、「[CircleCI のビルド済み Docker イメージ]({{ site.baseurl }}/ja/2.0/circleci-images/)」を参照してください。