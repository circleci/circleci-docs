---
layout: classic-docs
title: "ビルド環境"
description: "CircleCI 2.0 のビルド環境の設定"
---
お使いの環境に固有の手順については、以下のドキュメントを参照してください。

ドキュメント | 説明 \----|\---\---\----
<a href="{{ site.baseurl }}/2.0/executor-types/">Executor タイプの選択</a> | executor の `docker`、`machine`、`macos` タイプの比較、トレードオフ、使用例。
<a href="{{ site.baseurl }}/2.0/caching/">キャッシュの依存性</a> | コストの高いフェッチ操作が必要なデータを、以前のジョブから再利用し、CircleCI でジョブを高速化する方法。 [CircleCI のコマンドラインインターフェースの使用法]({{ site.baseurl }}/2.0/local-jobs/) | ローカルでジョブを実行する方法。 [CircleCI での Yarn の使用法]({{ site.baseurl }}/2.0/yarn/) | Yarn のインストール方法と、Yan パッケージのキャッシュ方法。 [CircleCI で Snapcraft を使用して Snap パッケージをビルドおよびパブリッシュする]({{ site.baseurl }}/2.0/build-publish-snap-packages/) | Snapcraft のセットアップと、パッケージのビルドおよびパブリッシュを行う方法の完全なガイド。 {: class="table table-striped"}

## Docker

ドキュメント | 説明 \----|\---\---\----
<a href="{{ site.baseurl }}/2.0/circleci-images/">ビルド済みイメージ</a> | CircleCI が用意しているビルド済み Docker イメージの全リスト。
<a href="{{ site.baseurl }}/2.0/custom-images/">カスタムイメージの使用法</a> | CircleCI でカスタム Docker イメージを作成し、使用する方法。
<a href="{{ site.baseurl }}/2.0/private-images/">プライベートイメージの使用法</a> | 非公開リポジトリや Amazon ECR からのイメージを使用する方法。
<a href="{{ site.baseurl }}/2.0/building-docker-images/">Docker コマンドの実行方法</a> | Docker イメージをビルドして他の場所にデプロイ、または詳細テストを行う方法、およびリモート Docker コンテナでサービスを開始する方法。
<a href="{{ site.baseurl }}/2.0/docker-compose/">Docker Compose の使用法</a> | ジョブ実行時に docker-compose をプライマリコンテナにインストールして使用する方法。
<a href="{{ site.baseurl }}/2.0/docker-layer-caching/">Docker レイヤーキャッシュ (DLC)</a> | DLC 機能を要求し、構成ファイルに追加する方法。 {: class="table table-striped"}

## iOS

タイトル | 説明 \----|\---\---\----
<a href="{{ site.baseurl }}/2.0/testing-ios/">macOS での iOS アプリケーションのテスト</a> | CircleCI で iOS アプリケーションのテストのセットアップとカスタマイズを行う方法。
<a href="{{ site.baseurl }}/2.0/ios-codesigning/">iOS プロジェクト用のコードサイニングのセットアップ</a> | CircleCI 2.0 で、iOS または Mac プロジェクト用のコードサイニングをセットアップするためのガイドライン。 {: class="table table-striped"}

CircleCI を使用して、より迅速で優れた開発をご利用ください!

*CircleCI チーム*