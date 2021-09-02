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

CircleCI の **macOS ビルド環境**で継続的インテグレーションを開始する方法について説明します。 CircleCI の基本的な操作について確認したい場合は、[入門ガイド]({{ site.baseurl }}/ja/2.0/getting-started)を参照することをお勧めします。 You may also wish to visit the documentation for [testing iOS]({{ site.baseurl}}/2.0/testing-ios/) and [an example iOS project]({{ site.baseurl }}/2.0/ios-tutorial/).

## 前提条件
また、「[macOS 上の iOS アプリケーションのテスト]({{ site.baseurl}}/2.0/testing-ios/)」や「[iOS プロジェクトのチュートリアル]({{ site.baseurl }}/ja/2.0/ios-tutorial/)」も併せてご覧ください。

To follow along with this document you will need:

- CircleCI の[アカウント](https://circleci.com/ja/signup/)
- macOS Executor でのビルドを実行できる[有料プラン](https://circleci.com/ja/pricing/#build-os-x)のサブスクリプション
- Xcode がインストールされた Apple コンピューター (サンプル プロジェクトを開く場合)

## macOS Executor の概要
{: #overview-of-the-macos-executor }

macOS ビルド環境 (`executor`) は iOS と macOS の開発用に提供されるもので、これを使用して macOS および iOS アプリケーションのテスト、ビルド、デプロイを CircleCI 上で行うことができます。 macOS Executor は、macOS 環境でジョブを実行し、iPhone、iPad、Apple Watch、および Apple TV の各シミュレーターへのアクセスを提供します。

macOS Executor をセットアップする前に、サンプル アプリケーションをセットアップする必要があります。

## サンプル アプリケーション
macOS ビルド環境についての理解を深めていただければ、CircleCI を利用して以下のことが可能になります。

サンプル アプリケーションのリポジトリは [GitHub](https://github.com/CircleCI-Public/circleci-demo-macos) にチェック アウトできます。

As a user getting to know the macOS build environment, our ideal scenario is for CircleCI to help with the following:

- コードをプッシュするたびに、macOS VM 上で Xcode を使用してテストを実行する
- テストが正常に完了した後、コンパイルされたアプリケーションをアーティファクトとして作成してアップロードする

You can checkout the example application's repo on [GitHub](https://github.com/CircleCI-Public/circleci-demo-macos).

## サンプルの設定ファイル
macOS でのビルドの基礎について説明しているため、上記のサンプルの `config.yml` には以下の内容が含まれています。

このアプリケーションでは、外部ツールや依存関係が使用されていないため、`.circleci/config.yml` ファイルの内容はきわめて単純です。 各ステップの内容についてコメントを付けて説明しています。

```yaml
version: 2.1

jobs: # a basic unit of work in a run
  test: # your job name
    macos:
      xcode: 11.3.0 # indicate our selected version of Xcode
    steps: # a series of commands to run
      - checkout  # pull down code from your version control system.
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
          destination: app Read more: https://circleci.com/docs/2.0/artifacts/
          path: app.zip
          destination: app

workflows:
  version: 2
  test_build:
    jobs:
      - test
      - build:
        requires:
          test Read more: https://circleci.com/docs/2.0/artifacts/
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

Since this is a general introduction to building on MacOs, the `config.yml` above example covers the following:

- 使用する [`executor`]({{ site.baseurl }}/ja/2.0/configuration-reference/#docker--machine--macos--windows-executor) の指定
- [`checkout`]({{ site.baseurl }}/2.0/configuration-reference/#checkout) キーによるコードのプル
- Xcode でのテストの実行
- アプリケーションのビルド
- アプリケーションの圧縮と [`store_artifacts`]({{site.baseurl }}/2.0/configuration-reference/#store_artifacts) キーによる保存

You can learn more about the `config.yml` file in the [configuration reference guide]({{site.baseurl}}/2.0/configuration-reference/).

## 次のステップ
{: #xcode-cross-compilation }

### Universal Binaries
Xcode currently supports the creation of universal binaries which can be run on both x86_64 and ARM64 CPU architectures without needing to ship separate executables. This is supported only under Xcode 12.2+ although older Xcode versions can still be used to compile separate x86_64 and ARM64 executables.

### Extracting Unwanted Architectures
{: #extracting-unwanted-architectures }

Xcode 12.2+ will by default create universal binaries, compiling to a single executable that supports both x86_64 and ARM64 based CPUs. If you need to remove an instruction set, you can do so by using the `lipo` utility.

Assuming that we are interested in creating a standalone x86_64 binary from a universal binary called `circleci-demo-macos`, we can do so by running the command

```sh
lipo -extract x86_64 circleci-demo-macos.app/Contents/MacOS/circleci-demo-macos -output circleci-demo-macos-x86_64
```

We can then confirm the supported architecture of the extracted binary with `lipo -info circleci-demo-macos-x86_64` which will output the following

```sh
Architectures in the fat file: circleci-demo-macos-x86_64 are: x86_64
```


### Cross Compiled Binaries
{: #cross-compiled-binaries }

While universal binaries are only supported under Xcode 12.2+, you can still cross compile binaries for architectures other than the architecture of the machine being used to build the binary. For xcodebuild the process is relatively straightforward. To build ARM64 binaries, prepend the `xcodebuild` command with `ARCHS=ARM64 ONLY_ACTIVE_ARCH=NO` such that it reads `xcodebuild ARCHS=ARM64 ONLY_ACTIVE_ARCH=NO ...`. For the x86_64 architecture simply change `ARCHS` to `x86_64`.

## Next steps
{: #next-steps }

macOS Executor は iOS アプリケーションのテストとビルドに広く使用されていますが、継続的インテグレーションの構成が複雑になる可能性があります。 iOS アプリケーションのビルドやテストについて詳しく知りたい場合は、以下のドキュメントをご覧ください。

- [macOS 上の iOS アプリケーションのテスト]({{ site.baseurl }}/2.0/testing-ios)
- [iOS プロジェクトのチュートリアル]({{ site.baseurl }}/2.0/ios-tutorial)
- [iOS プロジェクトのコード署名のセットアップ]({{ site.baseurl }}/2.0/ios-codesigning)

また、CircleCI の機能については、以下のドキュメントを確認してください。

- 2.0 設定ファイルの概要、および `.circleci/config.yml` ファイルにおけるトップレベル キーの階層については「[コンセプト]({{ site.baseurl }}/ja/2.0/concepts/)」を参照してください。
- 並列実行、順次実行、スケジュール実行、手動承認のワークフローによるジョブのオーケストレーションの例については「[ワークフローを使用したジョブのスケジュール]({{ site.baseurl }}/ja/2.0/workflows)」を参照してください。
- すべてのキーとビルド済み Docker イメージに関する詳細なリファレンスについては、それぞれ「[CircleCI を設定する]({{ site.baseurl }}/2.0/configuration-reference/)」、「[CircleCI のビルド済み Docker イメージ]({{ site.baseurl }}/2.0/circleci-images/)」を参照してください。
