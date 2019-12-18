---
layout: classic-docs
title: "ビルド環境について"
description: "CircleCI 2.0 ののビルド環境"
---


現在の状況や知りたい内容に従い、下記のドキュメントを参照してください。

タイトル | 概要
----|----------
<a href="{{ site.baseurl }}/ja/2.0/executor-types/">選択できる Executor タイプ</a> | `Docker`、`Machine`、`macOS` の違い、メリット＆デメリット、使用例。
<a href="{{ site.baseurl }}/ja/2.0/caching/">依存関係のキャッシュ</a> | 高コストな処理が必要なデータを前回のジョブから再利用することで、CircleCI のジョブを高速化する方法。
[CircleCI のコマンドラインインターフェースの使い方]({{ site.baseurl }}/ja/2.0/local-jobs/) | ローカル環境でジョブを実行する手順。
[CircleCI における Yarn の使い方]({{ site.baseurl }}/ja/2.0/yarn/) | Yarn のインストール方法および Yarn パッケージのキャッシュ方法。
[Snapcraft を用いた Snap パッケージのビルドとパブリッシュ]({{ site.baseurl }}/ja/2.0/build-publish-snap-packages/) | Snapcraft の導入、および Snap パッケージのビルドからパブリッシュに至るまでのガイドマニュアル。
{: class="table table-striped"}

## Docker

タイトル | 概要
----|----------
<a href="{{ site.baseurl }}/ja/2.0/circleci-images/">ビルド済みイメージ</a> | CircleCI が用意しているビルド済み Docker イメージの全リスト。
<a href="{{ site.baseurl }}/ja/2.0/custom-images/">カスタムイメージの使い方</a> | CircleCI におけるカスタム Docker イメージの作成方法と使用方法。
<a href="{{ site.baseurl }}/ja/2.0/private-images/">プライベートイメージの使い方</a> | プライベートリポジトリや Amazon ECR 上にあるイメージの使用方法。
<a href="{{ site.baseurl }}/ja/2.0/building-docker-images/">Docker コマンドの実行手順</a> | どこでもデプロイ可能なイメージや高度なテストを行う際の Docker イメージのビルド方法と、リモートの Docker コンテナ内のサービスを実行する方法。
<a href="{{ site.baseurl }}/ja/2.0/docker-compose/">Docker Compose の使い方</a> | ジョブ実行中のメインのコンテナ内における docker-compose の使用方法。
<a href="{{ site.baseurl }}/ja/2.0/docker-layer-caching/">Docker レイヤーキャッシュ (DLC) の利用</a> | DLC の呼び出し方と設定ファイルにおける記述の仕方。
{: class="table table-striped"}

## iOS アプリのビルド

タイトル | 概要
----|----------
<a href="{{ site.baseurl }}/ja/2.0/testing-ios/">macOS 上での iOS アプリのテスト手順</a> | CircleCI における iOS アプリのテスト方法のカスタマイズ。
<a href="{{ site.baseurl }}/ja/2.0/ios-codesigning/">iOS プロジェクトにおけるコード署名の設定</a> | CircleCI 2.0 での iOS および Mac のプロジェクトにおけるコード署名の設定に関するガイドライン。
{: class="table table-striped"}

CircleCI で開発の質と速度を底上げしよう！

*CircleCI チーム*

