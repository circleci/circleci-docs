---
layout: classic-docs
title: "パブリックリポジトリの例"
short-title: "パブリックリポジトリの例"
description: "CircleCI 2.0 マニュアルの入口"
categories: [getting-started]
order: 1
---

公開プロジェクトおよびオープンソースプロジェクトの CircleCI 2.0 用サンプル設定ファイル (`.circleci/config.yml`) についてまとめています。ご自由にお使いください。

* 目次
{:toc}

## CircleCI サンプル設定ファイル

サンプル名 | 内容 | リンク 
----|----------|-------- 
サンプル `config.yml` ファイル | パラレル Workflow、シーケンシャル Workflow、Fan-in / Fan-out Workflow の 4 種類のサンプル `config.yml` ファイルです。1 つの設定ファイルで Linux と iOS のアプリのビルドに対応します。 | [`config.yml`]({{ site.baseurl }}/ja/2.0/sample-config/) 
データベース設定の例 | PostgreSQL/Rails、Go/PostgreSQL、Ruby/MySQL の各組み合わせで利用する際の `config.yml` を用意しています。 | [サンプル設定ファイル]({{ site.baseurl }}/ja/2.0/postgres-config/) 
パラレルジョブ | パラレルジョブの Workflow 設定の例です。 | [parallel-jobs/.circleci/config.yml](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/parallel-jobs/.circleci/config.yml) 
シーケンシャルジョブ | シーケンシャルジョブの Workflow 設定の例です。 | [sequential-branch-filter/.circleci/config.yml](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/sequential-branch-filter/.circleci/config.yml) 
Fan-in／Fan-out ジョブ | 最初はシーケンシャル、次にパラレル、最後に再びシーケンシャルでジョブを処理する Workflow 設定の例です。 | [fan-in-fan-out/.circleci/config.yml](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/fan-in-fan-out/.circleci/config.yml) 
Workspace フォワーディング | Workspace 間でデータ連携するジョブ設定の例です。 | [workspace-forwarding/.circleci/config.yml](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/workspace-forwarding/.circleci/config.yml) 
circleci-docs | CircleCI マニュアルの静的 Web サイトを Jekyll で生成する例です。 | [circleci-docs/.circleci/config.yml](https://github.com/circleci/circleci-docs/blob/master/.circleci/config.yml) 
CircleCI フロントエンド | Clojure で作成した CircleCI フロントエンドのミラープロジェクトです。 | [frontend/.circleci/config.yml](https://github.com/circleci/frontend/blob/master/.circleci/config.yml) 
circleci-images | CircleCI のコンテナイメージをまとめたクリーンな環境設定の例です。 | [circleci-images/.circleci/config.yml](https://github.com/circleci/circleci-images/blob/master/.circleci/config.yml) 
circleci image-builder | ビルドイメージ作成用の Docker に用いる設定ファイルの例です。 | [image-builder/.circleci/config.yml](https://github.com/circleci/image-builder/blob/master/.circleci/config.yml) 
circleci-demo-docker | CircleCI 2.0 における Docker イメージのビルド方法について説明する設定ファイルの例です。 | [.circleci/config.yml](https://github.com/CircleCI-Public/circleci-demo-docker/blob/master/.circleci/config.yml)
{: class="table table-striped"}

## オープンソースプロジェクト (機能別)

以下では、CircleCI のさまざまな機能をカバーしたオープンソースプロジェクトの設定ファイル例を紹介しています。

参考機能例 | プロジェクト概要 | 設定ファイルの場所 
------|-----------|------------ 
テンプレートキャッシュ、Workspace の利用、パラレル Workflow | モバイルアプリの開発に **React** を使用できます。 | [react-native/.circleci/config.yml](https://github.com/facebook/react-native/blob/master/.circleci/config.yml) 
`Xvfb`および Mocha を用いた ARM/x64 プラットフォーム向けコンテナイメージのビルドとテスト | **Electron** は、Node.js と Chromium をベースにしたフレームワークです。 JavaScript と HTML/CSS でクロスプラットフォームのデスクトップアプリを開発できます。 |[electron/.circleci/config.yml](https://github.com/electron/electron/blob/master/.circleci/config.yml) 
macOS と Linux 環境におけるビルド、テスト、アップロード | **Conda** は、プラットフォームや開発言語に依存せず、配布やインストール、バージョン管理を容易に実行できるパッケージマネージャーです。 | [bioconda-recipes/.circleci/config.yml](https://github.com/bioconda/bioconda-recipes/blob/master/.circleci/config.yml) 
Docker イメージのビルドとレジストレーション、AWS ECS へのデプロイ | **Taco** は、DLSS (Digital Library Systems and Services) 向けの次世代リポジトリシステムです。 | [taco/.circleci/config.yml](https://github.com/sul-dlss-labs/taco/blob/master/.circleci/config.yml) 
`store_artifacts` を併用した Docker Compose と `docker cp` コマンド | **Mayflower** は、マサチューセッツ州の行政事務のデジタル化に向けたシステムです。 | [develop/.circleci/config.yml](https://github.com/massgov/mayflower/blob/develop/.circleci/config.yml) 
リモート Docker、Docker レイヤーキャッシュ、Docker イメージのビルドとプッシュ | **Epoch** は、æternity アプリ用に開発された新ブロックチェーン技術です。 | [epoch/.circleci/config.yml](https://github.com/aeternity/epoch/blob/master/.circleci/config.yml) 
fan-out/fan-in Workflow で行うマルチプラットフォームのビルド、テスト、デプロイ | **Canary** は、マルチプラットフォーム対応のサーバーレスシングルコマンドデプロイツールです。 | [canary/.circleci/config.yml](https://github.com/zeit/now-cli/blob/canary/.circleci/config.yml) 
タグ付きリリースを行う際の複数プラットフォームでのビルドおよびテスト | **Crystal** は、Ruby ライクなプログラミング言語です。 | [crystal/.circleci/config.yml](https://github.com/crystal-lang/crystal/blob/master/.circleci/config.yml) 
スケジュール設定されたタグ付き Workflow のジョブ | Node.js で **Cloud Pub/Sub** を使用できます。 | [nodejs-pubsub/.circleci/config.yml](https://github.com/googleapis/nodejs-pubsub/blob/master/.circleci/config.yml)
{: class="table table-striped"}

## オープンソースプロジェクト (言語別)

以下では、主にプログラミング言語、テスト手法、デプロイ対象に関係するオープンソースプロジェクトの設定ファイル例を紹介しています。

参考機能例 | プロジェクト概要 | 設定ファイルの場所 
------|-----------|------------ 
`Xvfb` を利用した Bazel によるビルドとテスト | **Angular** は、TypeScript や JavaScript などで構築するモバイルアプリおよび Web アプリの開発プラットフォームです。 | [angular/.circleci/config.yml](https://github.com/angular/angular/blob/master/.circleci/config.yml) 
Saleseforce DX | CircleCI で **Salesforce DX** をセットアップする方法を示したリポジトリです。 | [sfdx-circleci/.circleci/config.yml](https://github.com/forcedotcom/sfdx-circleci/blob/master/.circleci/config.yml) 
Kubernetes および codecov を用いた、Docker 上での Go 言語開発 と VM における各種処理 (依存関係、lint、ビルド、テスト) | **Istio** は、マイクロサービスの相互接続、管理、セキュリティ保護を目的としたオープンプラットフォームです。 | [istio/.circleci/config.yml](https://github.com/istio/istio/blob/master/.circleci/config.yml) 
`JUnit` を組み合わせた Go 言語開発、本番公開に向けた Kubernetes のテスト、およびマスタージョブの Workflow | **Microsoft Azure Container Service Engine** (acs-engine) は、DC/OS や Kubernetes、Swarm Mode、あるいは Swarm orchestrators とともに使用し、Microsoft Azure 上で Docker 対応クラスタ向けの Azure Resource Manager のテンプレートを生成します。 | [acs-engine/.circleci/config.yml](https://github.com/Azure/acs-engine/blob/master/.circleci/config.yml) 
Go 言語と Node によるビルド、パッケージ、デプロイの実行 | **Ignition** は、Pivotal Cloud Foundry (PCF) によるデプロイを支援する開発ツールです。 | [ignition/.circleci/config.yml](https://github.com/pivotalservices/ignition/blob/master/.circleci/config.yml) 
`sbt` を用いた Java アプリケーションのビルドおよびパブリッシュ | **Scio** は、Apache Spark や Scalding に似た、Apache Beam および Google Cloud Dataflow 向けの Scala API です。 | [scio/.circleci/config.yml](https://github.com/spotify/scio/blob/master/.circleci/config.yml) 
`JUnit` で構築された JavaScript Node フロントエンド開発、および Webdriver によるエンドツーエンドのスクリーンショットテスト | React、MobX、TypeScript を使用した **cBioPortal** 向けのフロントエンド言語です。 | [cbioportal-frontend/.circleci/config.yml](https://github.com/cBioPortal/cbioportal-frontend/blob/master/.circleci/config.yml) 
手動デプロイ環境での Node および Yarn | **Docusaurus** は、オープンソースな Web サイトのスムーズなビルド、デプロイ、メンテナンスの実現を目指したプロジェクトです。 | [master/.circleci/config.yml](https://github.com/facebook/Docusaurus/blob/master/.circleci/config.yml) 
Node と Yarn のテスト、およびキャッシュを活用した Web サイトのデプロイ | **NEO•ONE** は、NEO によるブロックチェーンソリューションのコーディング、テスト、デプロイ作業を簡単に進められます。 | [neo-one/.circleci/config.yml](https://github.com/neo-one-suite/neo-one/blob/master/.circleci/config.yml) 
NPM と Yarn によるビルドとテスト、AWS S3 へのデプロイ | **CLARK Platform** 公式クライアント | [clark-client/.circleci/config.yml](https://github.com/Cyber4All/clark-client/blob/master/.circleci/config.yml) 
Postgres データベースを用いた Python コードのビルド、Selenium のテスト、Code Climate の使用 | **CALC** (旧 Hourglass) は、Contracts Awarded Labor Category の略で、米国における職種ごとの人件費単価データベースを活用できる、契約時の人件費算出サポートのツールです。 | [calc/.circleci/config.yml](https://github.com/18F/calc/blob/develop/.circleci/config.yml) 
Webhooks を活用したパラレルジョブを実現する `apt` を使った Python コードのビルド | **SunPy** は、太陽物理学のデータ分析向けオープンソース Python ライブラリです。 | [sunpy/.circleci/config.yml](https://github.com/sunpy/sunpy/blob/master/.circleci/config.yml) 
Scala および `sbt` を用いた 3 パターンの Workflow によるビルド、テスト、リリース | **Arweave4s** は、仮想通貨 Arweave のブロックチェーン専用の軽量なモジュール型 HTTP クライアントです。 | [arweave4s/.circleci/config.yml](https://github.com/toknapp/arweave4s/blob/master/.circleci/config.yml)
{: class="table table-striped"}

## 関連情報

[チュートリアルとサンプルアプリ]({{ site.baseurl }}/ja/2.0/tutorials/)もご覧ください。このページでは 11 のプログラム言語で作成された基礎的なアプリケーションについて、コメントや細かな解説がついたひと通りのサンプル設定ファイルを用意しています。
