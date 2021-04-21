---
layout: classic-docs
title: "macOS での Hello World"
short-title: "macOS での Hello World"
description: "CircleCI 2.0 での最初の macOS プロジェクト"
categories:
  - getting-started
order: 4
version:
  - Cloud
---

This document describes how to get started with continuous integration on **macOS build environments** on CircleCI. CircleCI の基本的な操作について確認したい場合は、[入門ガイド]({{ site.baseurl }}/2.0/getting-started)を参照することをお勧めします。

また、「[macOS 上の iOS アプリケーションのテスト]({{ site.baseurl}}/2.0/testing-ios/)」や「[iOS プロジェクトのチュートリアル]({{ site.baseurl }}/2.0/ios-tutorial/)」も併せてご覧ください。

## 前提条件
{: #prerequisites }

To follow along with this document you will need:

- CircleCI の[アカウント](https://circleci.com/ja/signup/)
- macOS Executor でのビルドを実行できる[有料プラン](https://circleci.com/ja/pricing/#build-os-x)のサブスクリプション
- Xcode がインストールされた Apple コンピューター (サンプル プロジェクトを開く場合)

## Overview of the macOS executor
{: #overview-of-the-macos-executor }

The macOS build environment (or `executor`) is used for iOS and macOS development, allowing you to test, build, and deploy macOS and iOS applications on CircleCI. The macOS executor runs jobs in a macOS environment and provides access to iPhone, iPad, Apple Watch and Apple TV simulators.

Before we get to setting up the macOS executor, we will need to setup our example application.

## Example application
{: #example-application }

The example application is a simple mac app - it runs a 5 minute timer and contains a single unit test (real-world applications will be far more complex; this app simply serves as an introduction to the macOS build environment).

As a user getting to know the macOS build environment, our ideal scenario is for CircleCI to help with the following:

- コードをプッシュするたびに、macOS VM 上で Xcode を使用してテストを実行する
- テストが正常に完了した後、コンパイルされたアプリケーションをアーティファクトとして作成してアップロードする

You can checkout the example application's repo on [GitHub](https://github.com/CircleCI-Public/circleci-demo-macos).

## Example configuration file
{: #example-configuration-file }

Our application does not make use of any external tools or dependencies, so we have a fairly simple `.circleci/config.yml` file. Below, each line is commented to indicate what is happening at each step.

```yaml
version: 2.1
jobs: # 1 回の実行の基本作業単位
  build: # 「ワークフロー」を使用しない実行では、エントリポイントとして `build` ジョブが必要です
    macos:  # macOS Executor を使用していることを示します
      xcode: 11.3.0 # 選択された Xcode のバージョン
    steps: # 実行する一連のコマンド
      - checkout  # ユーザーのバージョン管理システムからコードをプル ダウンします
      - run:
          # Xcode の CLI ツール「xcodebuild」を使用してテストを実行します
          name: 単体テストの実行
          command: xcodebuild test -scheme circleci-demo-macos
      - run:
          # アプリケーションをビルドします
          name: アプリケーションのビルド
          command: xcodebuild
      - run:
          # Xcode のビルド出力を圧縮し、アーティファクトとして格納できるようにします
          name: 保存のためのアプリ圧縮
          command: zip -r app.zip build/Release/circleci-demo-macos.app
      - store_artifacts: # このビルド出力を保存します  (詳細については https://circleci.com/ja/docs/2.0/artifacts/ を参照)
          path: app.zip
          destination: app
```

If this is your first exposure to a CircleCI `config.yml`, some of the above might seem a bit confusing. In the section below you can find some links that provide a more in-depth overview of how a `config.yml` works.

Since this is a general introduction to building on MacOs, the `config.yml` above example covers the following:

- Picking an [`executor`]({{ site.baseurl }}/2.0/configuration-reference/#docker) to use
- [`checkout`]({{ site.baseurl }}/2.0/configuration-reference/#checkout) キーによるコードのプル
- Xcode でのテストの実行
- アプリケーションのビルド
- アプリケーションの圧縮と [`store_artifacts`]({{site.baseurl }}/2.0/configuration-reference/#store_artifacts) キーによる保存

You can learn more about the `config.yml` file in the [configuration reference guide]({{site.baseurl}}/2.0/configuration-reference/).

## Xcode Cross Compilation
{: #xcode-cross-compilation }

### Universal Binaries
{: #universal-binaries }
Xcode currently supports the creation of universal binaries which can be run on both x86_64 and ARM64 CPU architectures without needing to ship separate executables. This is supported only under Xcode 12.2+ although older Xcode versions can still be used to compile separate x86_64 and ARM64 executables.

### Extracting Unwanted Architectures
{: #extracting-unwanted-architectures }
Xcode 12.2+ will by default create universal binaries, compiling to a single executable that supports both x86_64 and ARM64 based CPUs. If you need to remove an instruction set, you can do so by using the `lipo` utility.

Assuming that we are interested in creating a standalone x86_64 binary from a universal binary called `circleci-demo-macos`, we can do so by running the command

`lipo -extract x86_64 circleci-demo-macos.app/Contents/MacOS/circleci-demo-macos -output circleci-demo-macos-x86_64`

We can then confirm the supported architecture of the extracted binary with `lipo -info circleci-demo-macos-x86_64` which will output the following

`Architectures in the fat file: circleci-demo-macos-x86_64 are: x86_64`


### Cross Compiled Binaries
{: #cross-compiled-binaries }

While universal binaries are only supported under Xcode 12.2+, you can still cross compile binaries for architectures other than the architecture of the machine being used to build the binary. For xcodebuild the process is relatively straightforward. To build ARM64 binaries, prepend the `xcodebuild` command with `ARCHS=ARM64 ONLY_ACTIVE_ARCH=NO` such that it reads `xcodebuild ARCHS=ARM64 ONLY_ACTIVE_ARCH=NO ...`. For the x86_64 architecture simply change `ARCHS` to `x86_64`.

## Next steps
{: #next-steps }

The macOS executor is commonly used for testing and building iOS applications, which can be more complex in their continuous integrations configuration. If you are interested in building and/or testing iOS applications, consider checking out our following docs that further explore this topic:

- [macOS 上の iOS アプリケーションのテスト]({{ site.baseurl }}/2.0/testing-ios)
- [iOS プロジェクトのチュートリアル]({{ site.baseurl }}/2.0/ios-tutorial)
- [iOS プロジェクトのコード署名のセットアップ]({{ site.baseurl }}/2.0/ios-codesigning)

Also, consider reading documentation on some of CircleCI's features:

- 2.0 設定ファイルの概要、および `.circleci/config.yml` ファイルにおけるトップレベル キーの階層については「[コンセプト]({{ site.baseurl }}/2.0/concepts/)」を参照してください。

- Refer to the [Workflows]({{ site.baseurl }}/2.0/workflows) document for examples of orchestrating job runs with concurrent, sequential, scheduled, and manual approval workflows.

- すべてのキーとビルド済み Docker イメージに関する詳細なリファレンスについては、それぞれ「[CircleCI を設定する]({{ site.baseurl }}/2.0/configuration-reference/)」、「[CircleCI のビルド済み Docker イメージ]({{ site.baseurl }}/2.0/circleci-images/)」を参照してください。
