---
layout: classic-docs
title: "macOS での Hello World"
short-title: "macOS での Hello World"
description: "CircleCI 2.0 での最初の macOS プロジェクト"
categories:
  - getting-started
order: 4
---

CircleCI の **macOS ビルド環境**で継続的インテグレーションを開始する方法について説明します。 CircleCI の基本的な操作について確認したい場合は、[入門ガイド]({{ site.baseurl }}/2.0/getting-started)を参照することをお勧めします。

また、「[macOS 上の iOS アプリケーションのテスト]({{ site.baseurl}}/2.0/testing-ios/)」や「[iOS プロジェクトのチュートリアル]({{ site.baseurl }}/2.0/ios-tutorial/)」も併せてご覧ください。

## 前提条件

作業を行う前に、以下を準備しておく必要があります。

- CircleCI の[アカウント](https://circleci.com/ja/signup/)
- macOS Executor でのビルドを実行できる[有料プラン](https://circleci.com/ja/pricing/#build-os-x)のサブスクリプション
- Xcode がインストールされた Apple コンピューター (サンプル プロジェクトを開く場合)

## macOS Executor の概要

macOS ビルド環境 (`executor`) は iOS と macOS の開発用に提供されるもので、これを使用して macOS および iOS アプリケーションのテスト、ビルド、デプロイを CircleCI 上で行うことができます。 macOS Executor は、macOS 環境でジョブを実行し、iPhone、iPad、Apple Watch、および Apple TV の各シミュレーターへのアクセスを提供します。

macOS Executor をセットアップする前に、サンプル アプリケーションをセットアップする必要があります。

## サンプル アプリケーション

このサンプル アプリケーションは簡単な Mac アプリです。5 分間のタイマーが実行され、単体テストが含まれています (このアプリは単に macOS ビルド環境の基礎を説明することを目的としており、実際のアプリケーションはこれよりもはるかに複雑です)。

macOS ビルド環境についての理解を深めていただければ、CircleCI を利用して以下のことが可能になります。

- コードをプッシュするたびに、macOS VM 上で Xcode を使用してテストを実行する
- テストが正常に完了した後、コンパイルされたアプリケーションをアーティファクトとして作成してアップロードする

サンプル アプリケーションのリポジトリは [GitHub](https://github.com/CircleCI-Public/circleci-demo-macos) にチェック アウトできます。

## サンプルの設定ファイル

このアプリケーションでは、外部ツールや依存関係が使用されていないため、`.circleci/config.yml` ファイルの内容はきわめて単純です。 各ステップの内容についてコメントを付けて説明しています。

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

まだ CircleCI の `config.yml` を編集したことがない方には、わかりにくい部分があるかもしれません。 `config.yml` の動作の概要については、以降のセクションに記載しているリンク先から確認できます。

macOS でのビルドの基礎について説明しているため、上記のサンプルの `config.yml` には以下の内容が含まれています。

- 使用する [`executor`]({{ site.baseurl }}/2.0/configuration-reference/#docker--machine--macos--windows-executor) の指定 
- [`checkout`]({{ site.baseurl }}/2.0/configuration-reference/#checkout) キーによるコードのプル
- Xcode でのテストの実行
- アプリケーションのビルド
- アプリケーションの圧縮と [`store_artifacts`]({{site.baseurl }}/2.0/configuration-reference/#store_artifacts) キーによる保存

`config.yml` ファイルの詳細については、[構成リファレンス ガイド]({{site.baseurl}}/2.0/configuration-reference/)を参照してください。

## 次のステップ

macOS Executor は iOS アプリケーションのテストとビルドに広く使用されていますが、継続的インテグレーションの構成が複雑になる可能性があります。 iOS アプリケーションのビルドやテストについて詳しく知りたい場合は、以下のドキュメントをご覧ください。

- [macOS 上の iOS アプリケーションのテスト]({{ site.baseurl }}/2.0/testing-ios)
- [iOS プロジェクトのチュートリアル]({{ site.baseurl }}/2.0/ios-tutorial)
- [iOS プロジェクトのコード署名のセットアップ]({{ site.baseurl }}/2.0/ios-codesigning)

また、CircleCI の機能については、以下のドキュメントを確認してください。

- 2.0 設定ファイルの概要、および `.circleci/config.yml` ファイルにおけるトップレベル キーの階層については「[コンセプト]({{ site.baseurl }}/2.0/concepts/)」を参照してください。

- 並列実行、順次実行、スケジュール実行、手動承認のワークフローによるジョブのオーケストレーションの例については「[ワークフローを使用したジョブのスケジュール]({{ site.baseurl }}/2.0/workflows)」を参照してください。

- すべてのキーとビルド済み Docker イメージに関する詳細なリファレンスについては、それぞれ「[CircleCI を設定する]({{ site.baseurl }}/2.0/configuration-reference/)」、「[CircleCI のビルド済み Docker イメージ]({{ site.baseurl }}/2.0/circleci-images/)」を参照してください。