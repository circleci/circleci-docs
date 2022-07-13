---
layout: classic-docs
title: "Docker から Machine への移行"
description: "Executor を Docker からマシンに移行する際のベストプラクティスと考慮すべき事項"
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

このドキュメントでは、Docker Executor から Machine Executor (またはその逆) に移行する際に考慮すべき事項と一般的なガイドラインについて説明します。

* TOC
{:toc}

## はじめに
{: #overview }
{:.no_toc}

お客様のビルドによっては、Docker Executor が適さない場合があります。 メモリ不足や専用の CPU が必要な場合などがその例です。 専用の仮想マシンに移行することで、これらの問題の一部は解消できますが、Executor の変更は設定ファイルを数行変えるような簡単な作業ではありません。 アプリケーションやテスト用にインストールしなければならないツールやライブラリなど、他にも考慮すべき事項がいくつかあります。

## プリインストールされているソフトウェア
{: #pre-installed-software }

プリインストールされているソフトウェアの最新のリストは [Image Builder](https://raw.githubusercontent.com/circleci/image-builder/picard-vm-image/provision.sh) のページを参照してください。 詳細は、[Discuss](https://discuss.circleci.com/) のページでもご確認いただけます。

`sudo apt-get install<package>` を使って追加パッケージをインストールできます。 パッケージが見つからない場合は、インストールの前に `sudo apt-get update` が必要な場合があります。

## マシンで Docker コンテナを実行する
{: #running-docker-containers-on-machine }

Machine Executor には Docker がインストールされています。 Docker は、追加の依存関係をインストールするためではなく、コンテナ内でアプリケーションを実行するために使用されます。 この場合、CircleCI イメージではなくお客様の Docker イメージを使用することをお勧めします。 CircleCI イメージは、 Docker Executor での使用を前提としてビルドされているため、それ以外の用途には合わない可能性があります。 各 Machine Executor の環境は専用の仮想マシンなため、通常バックグラウンドコンテナを実行するためのコマンドが使用できます。

**注:** アカウントで Docker レイヤーキャッシュ (DLC) を有効にしている場合、Machine Executor は DLC を使ってその後の実行に備えてイメージレイヤーをキャッシュします。

## Docker Executor を使う理由
{: #why-use-docker-executors-at-all }

Machine Executor の使用により、メモリが倍増し、より隔離された環境が提供されますが、スピンアップ時間にオーバーヘッドが追加されます。また、アプリケーションの実行方法によっては、必要な依存関係のインストールや Docker イメージのプルに時間がかかる場合があります。 また Docker Executor は、DLC を有効にする必要がある Machine Executor とは異なり、スピンアップ中にイメージからできるだけ多くのレイヤーをキャッシュします。

それぞれの Executor  に長所と短所があるため、ここでの説明を読み、お客様のパイプラインに最適な Executor を選択してください。

## 関連情報
{: #further-reading }

We have more details on each specific executor [here]({{site.baseurl}}/executor-intro/), which includes links to specific memory and vCPU allocation details, as well as how to implement each one in your own configuration.
