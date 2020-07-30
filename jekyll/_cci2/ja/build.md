---
layout: classic-docs
title: "ビルド環境"
description: "CircleCI 2.0 のビルド環境の構成"
---


お使いの環境に固有の作業手順については、以下のドキュメントを参照してください。

| ドキュメント                                                                                                   | 説明                                                                  |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| <a href="{{ site.baseurl }}/2.0/executor-types/">Executor タイプの選び方</a>                                                                                | `docker`、`windows`、`machine`、`macos` の各 Executor の違い、メリットとデメリット、使用例 |
| <a href="{{ site.baseurl }}/2.0/caching/">依存関係のキャッシュ</a>                                                                                | 高コストなフェッチ操作が必要なデータを前回のジョブから再利用することで、CircleCI のジョブを高速化する方法           |
| [CircleCI のローカル CLI の使用]({{ site.baseurl }}/2.0/local-jobs/)                                             | ローカル環境でジョブを実行する手順                                                   |
| [CircleCI での Yarn の使用]({{ site.baseurl }}/2.0/yarn/)                                                     | Yarn のインストール方法と Yarn パッケージのキャッシュ方法                                  |
| [CircleCI 上で Snapcraft を使用した Snap パッケージのビルドとパブリッシュ]({{ site.baseurl }}/2.0/build-publish-snap-packages/) | Snapcraft のセットアップと、Snap パッケージのビルドからパブリッシュまでを解説した完全ガイド               |
{: class="table table-striped"}

## Docker

| ドキュメント                    | 説明                                                                             |
| ------------------------- | ------------------------------------------------------------------------------ |
| <a href="{{ site.baseurl }}/2.0/circleci-images/">CircleCI のビルド済み Docker イメージ</a> | CircleCI が提供しているビルド済み Docker イメージの一覧                                           |
| <a href="{{ site.baseurl }}/2.0/custom-images/">カスタム ビルドの Docker イメージの使用</a> | CircleCI におけるカスタム Docker イメージの作成方法と使用方法                                        |
| <a href="{{ site.baseurl }}/2.0/private-images/">プライベート イメージの使用</a> | プライベート リポジトリや Amazon ECR 上にあるイメージの使用方法                                         |
| <a href="{{ site.baseurl }}/2.0/building-docker-images/">Docker コマンドの実行手順</a> | 他の場所にデプロイしたり、高度なテストを行ったりするための Docker イメージのビルド方法や、リモート Docker コンテナ内のサービスを開始する方法 |
| <a href="{{ site.baseurl }}/2.0/docker-compose/">docker-compose のインストールと使用</a> | docker-compose をジョブ実行時にプライマリ コンテナにインストールして使用する方法                               |
| <a href="{{ site.baseurl }}/2.0/docker-layer-caching/">Docker レイヤーキャッシュの有効化</a> | Docker レイヤーキャッシュ (DLC) 機能を有効化して、設定ファイルに追加する方法                                  |
{: class="table table-striped"}

## iOS と Mac

| ドキュメント                     | 説明                                                            |
| -------------------------- | ------------------------------------------------------------- |
| <a href="{{ site.baseurl }}/2.0/hello-world-macos/">macOS での Hello World</a>  | macOS Executor と CircleCI を利用する方法                             |
| <a href="{{ site.baseurl }}/2.0/testing-ios/">macOS 上の iOS アプリケーションのテスト</a>  | CircleCI で iOS アプリケーションのテストをセットアップおよびカスタマイズする方法               |
| <a href="{{ site.baseurl }}/2.0/ios-codesigning/">iOS プロジェクトのコード署名のセットアップ</a> | CircleCI 2.0 上の iOS プロジェクトまたは Mac プロジェクトのコード署名をセットアップするガイドライン |
{: class="table table-striped"}


## Windows

| ドキュメント                     | 説明                                  |
| -------------------------- | ----------------------------------- |
| <a href="{{ site.baseurl }}/2.0/hello-world-windows/">Windows 上での Hello World</a> | Windows Executor と CircleCI を利用する方法 |
{: class="table table-striped"}

このページをご参照くださり、ありがとうございます。 ビルドのお役に立てば幸いです。

*CircleCI チーム*