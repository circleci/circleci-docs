---
layout: classic-docs
title: "サンプル設定ファイル"
description: "CircleCI 2.0 のサンプル設定ファイル"
---
公開プロジェクトおよびオープンソースプロジェクトの CircleCI 2.0 用サンプル設定ファイル（`.circleci/config.yml`）についてまとめています。ご自由にお使いください。

* 目次 {:toc}

### 【動画】ローカル環境での設定ファイルのデバッグ手順

<div class="video-wrapper">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/HB5DehCufG0" frameborder="0" allowfullscreen></iframe>
</div>

1. シェルスクリプトを `run-build-locally.sh` などのファイル名で`.circleci` ディレクトリに作成します
2. [Create a personal API token]({{ site.baseurl }}/2.0/managing-api-tokens/#creating-a-personal-api-token).
3. コマンドラインで以下のように入力し、実行します  
    `export CIRCLE_TOKEN=<前の手順で生成したトークン文字列>`  
    ※<>は不要です
4. 下記の情報を準備します 
    * ビルド対象のコミットハッシュ
    * ユーザー名
    * プロジェクトソース
    * プロジェクト名
    * ビルド対象のブランチ
5. 用意した情報を下記のシェルスクリプトに当てはめます 

```bash
#!/usr/bin/env bash
curl --user ${CIRCLE_TOKEN}: \
    --request POST \
    --form revision=<コミットハッシュ>\
    --form config=@config.yml \
    --form notify=false \
        https://circleci.com/api/v1.1/project/<プロジェクトソース（例： github）>/<ユーザー名>/<プロジェクト名>/tree/<ブランチ>
```

このシェルスクリプトを実行すると、リポジトリを介してプッシュすることなく `config.yml` ファイルの内容をデバッグできます。

## CircleCI サンプル設定ファイル

サンプル名 | 内容 | ダウンロード \----|\---\---\----|\---\----- サンプル `config.yml` ファイル | パラレルワークフロー、シーケンシャルワークフロー、Fan-in / Fan-out ワークフローの4種類のサンプル `config.yml` ファイルです。1 つの設定ファイルでLinux と iOS のアプリのビルドに対応します。 | [`config.yml`]({{ site.baseurl }}/2.0/sample-config/) データベース設定の例 | PostgreSQL/Rails、Go/PostgreSQL、Ruby/MySQL の各組み合わせで利用する際の `config.yml` を用意しています。 | [サンプル設定ファイル]({{ site.baseurl }}/2.0/postgres-config/) パラレルジョブ | パラレルジョブのワークフロー設定の例です。 | [parallel-jobs/.circleci/config.yml](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/parallel-jobs/.circleci/config.yml) シーケンシャルジョブ | シーケンシャルジョブのワークフロー設定の例です。 | [sequential-branch-filter/.circleci/config.yml](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/sequential-branch-filter/.circleci/config.yml) Fan-in／Fan-out ジョブ | 最初はシーケンシャル、次にパラレル、最後に再びシーケンシャルでジョブを処理するワークフロー設定の例です。 | [fan-in-fan-out/.circleci/config.yml](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/fan-in-fan-out/.circleci/config.yml) ワークスペースフォワーディング | ワークスペース間でデータ連携するジョブ設定の例です。 | [workspace-forwarding/.circleci/config.yml](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/workspace-forwarding/.circleci/config.yml) circleci-docs | CircleCI マニュアルの静的 Web サイトを Jekyll で生成する例です。 | [circleci-docs/.circleci/config.yml](https://github.com/circleci/circleci-docs/blob/master/.circleci/config.yml) CircleCI フロントエンド | Clojure で作成した CircleCI フロントエンドのミラープロジェクトです。 | [frontend/.circleci/config.yml](https://github.com/circleci/frontend/blob/master/.circleci/config.yml) circleci-images | CircleCI のコンテナイメージをまとめたクリーンな環境設定の例です。 | [circleci-images/.circleci/config.yml](https://github.com/circleci/circleci-images/blob/master/.circleci/config.yml) CircleCI image-builder | ビルドイメージ作成用の Docker に用いる設定ファイルの例です。 | [image-builder/.circleci/config.yml](https://github.com/circleci/image-builder/blob/master/.circleci/config.yml) circleci-demo-docker | CircleCI 2.0 における Docker イメージのビルド方法を示した設定ファイルの例です。 | [.circleci/config.yml](https://github.com/CircleCI-Public/circleci-demo-docker/blob/master/.circleci/config.yml) {: class="table table-striped"}

## オープンソースプロジェクト（機能別）

以下では、CircleCI のさまざまな機能をカバーしたオープンソースプロジェクトの設定ファイル例を紹介しています。

参考機能例 | プロジェクト概要 | 設定ファイルの場所 \---\---|\---\---\-----|\---\---\---\--- テンプレートキャッシュ、ワークスペースの利用、パラレルワークフロー | JavaScript によるモバイルアプリ開発ツール **React** のプロジェクトです。 | [react-native/.circleci/config.yml](https://github.com/facebook/react-native/blob/master/.circleci/config.yml) `Xvfb`および Mocha を用いた ARM/x64 プラットフォーム向けコンテナイメージのビルドとテスト | Node.js と Chromium をベースにしたフレームワーク **Electron** のプロジェクトです。 JavaScript と HTML/CSS でクロスプラットフォームのデスクトップアプリを開発できます。 |[electron/.circleci/config.yml](https://github.com/electron/electron/blob/master/.circleci/config.yml) macOS と Linux 環境におけるビルド、テスト、アップロード | パッケージマネージャー **Conda** のプロジェクトです。プラットフォームや開発言語に依存せず、配布やインストール、バージョン管理が容易なのが特徴です。 | [bioconda-recipes/.circleci/config.yml](https://github.com/bioconda/bioconda-recipes/blob/master/.circleci/config.yml) Docker イメージのビルドとレジストレーション、AWS ECS へのデプロイ | DLSS（Digital Library Systems and Services）向けの次世代リポジトリシステム **Taco** のプロジェクトです。 | [taco/.circleci/config.yml](https://github.com/sul-dlss-labs/taco/blob/master/.circleci/config.yml) `store_artifacts` を併用した Docker Compose と `docker cp` コマンド | 英マサチューセッツ州の行政事務のデジタル化に向けたシステム **Mayflower** のプロジェクトです。 | [develop/.circleci/config.yml](https://github.com/massgov/mayflower/blob/develop/.circleci/config.yml) リモート Docker、Docker レイヤーキャッシュ、Docker イメージのビルドとプッシュ | æternity アプリ用に開発された新ブロックチェーン技術 **Epoch** のプロジェクトです。 | [epoch/.circleci/config.yml](https://github.com/aeternity/epoch/blob/master/.circleci/config.yml) fan-out/fan-in ワークフローで行うマルチプラットフォームのビルド、テスト、デプロイ | マルチプラットフォーム対応のサーバーレスシングルコマンドデプロイツール **Canary** のプロジェクトです。 | [canary/.circleci/config.yml](https://github.com/zeit/now-cli/blob/canary/.circleci/config.yml) タグ付きリリースを行う際の複数プラットフォームでのビルドおよびテスト | Ruby ライクなプログラミング言語 **Crystal** のプロジェクトです。 | [crystal/.circleci/config.yml](https://github.com/crystal-lang/crystal/blob/master/.circleci/config.yml) タグ付きワークフローおよびスケジュール設定されたワークフローのジョブ | アプリ間メッセージングサービス **Cloud Pub/Sub** を利用する、Node.js ベースのクライアントアプリのプロジェクトです。 | [nodejs-pubsub/.circleci/config.yml](https://github.com/googleapis/nodejs-pubsub/blob/master/.circleci/config.yml) {: class="table table-striped"}

## オープンソースプロジェクト（言語別）

以下では、主にプログラミング言語、テスト手法、デプロイ対象に関係するオープンソースプロジェクトの設定ファイル例を紹介しています。

参考機能例 | プロジェクト概要 | 設定ファイルの場所 \---\---|\---\---\-----|\---\---\---\--- `Xvfb` を利用した Bazel によるビルドとテスト | TypeScript や JavaScript などで構築するモバイルアプリおよび Web アプリ開発プラットフォーム **Angular** のプロジェクトです。 | [angular/.circleci/config.yml](https://github.com/angular/angular/blob/master/.circleci/config.yml) C++ address sanitizing and thread sanitizing, combined with platform-specific jobs | **Envoy** is an open source edge and service proxy, designed for cloud-native applications. | [envoy/.circleci/config.yml](https://github.com/envoyproxy/envoy/blob/master/.circleci/config.yml) Saleseforce DX | This repository shows one way you can successfully set up **Salesforce DX** with CircleCI. | [sfdx-circleci/.circleci/config.yml](https://github.com/forcedotcom/sfdx-circleci/blob/master/.circleci/config.yml) Kubernetes および codecov を用いた、Docker 上での Go 言語開発 と VM における各種処理（依存関係、lint、ビルド、テスト） | マイクロサービスの相互接続、管理、セキュリティ保護を目的としたオープンプラットフォーム **Istio** のプロジェクトです。 | [istio/.circleci/config.yml](https://github.com/istio/istio/blob/master/.circleci/config.yml) `JUnit` を組み合わせた Go 言語開発、本番公開に向けたKubernetes のテスト、およびマスタージョブのワークフロー | **Microsoft Azure Container Service Engine**（acs-engine）のプロジェクト。DC/OS や Kubernetes、Swarm Mode、あるいは Swarm orchestrators とともに使用し、Microsoft Azure 上で Docker 対応クラスタ向けのAzure Resource Manager のテンプレートを生成します。 | [acs-engine/.circleci/config.yml](https://github.com/Azure/acs-engine/blob/master/.circleci/config.yml) Go 言語と Node によるビルド、パッケージ、デプロイの実行 | Pivotal Cloud Foundry（PCF）によるデプロイを支援するポータルツール **Ignition** のプロジェクトです。 | [ignition/.circleci/config.yml](https://github.com/pivotalservices/ignition/blob/master/.circleci/config.yml) `sbt` を用いた Java アプリケーションのビルドおよびパブリッシュ | Apache Spark や Scalding に似た、Apache Beam および Google Cloud Dataflow 向けの Scala API **Scio** のプロジェクトです。 | [scio/.circleci/config.yml](https://github.com/spotify/scio/blob/master/.circleci/config.yml) `JUnit` で構築された JavaScript Node フロントエンド、および Webdriver によるエンドツーエンドのスクリーンショットテスト | React、MobX、TypeScriptを使用したフロントエンドコード**cBioPortal** のプロジェクトです。 | [cbioportal-frontend/.circleci/config.yml](https://github.com/cBioPortal/cbioportal-frontend/blob/master/.circleci/config.yml) 手動デプロイ環境での Node および Yarn | オープンソースな Web サイトのスムーズなビルドとデプロイ、メンテナンスを実現する **Docusaurus** のプロジェクトです。 | [master/.circleci/config.yml](https://github.com/facebook/Docusaurus/blob/master/.circleci/config.yml) Node と Yarn のテスト、およびキャッシュを活用した Web サイトのデプロイ | 独自の NEO ブロックチェーンによるソリューションを簡単にコーディング、テストし、デプロイを可能にする **NEO•ONE** のプロジェクトです。 | [neo-one/.circleci/config.yml](https://github.com/neo-one-suite/neo-one/blob/master/.circleci/config.yml) NPM と Yarn によるビルドとテスト、AWS S3 へのデプロイ | **CLARK Platform** 公式クライアント | [clark-client/.circleci/config.yml](https://github.com/Cyber4All/clark-client/blob/master/.circleci/config.yml) Postgres データベースを用いた Python コードのビルド、Selenium のテスト、Code Climateの使用 | 米国における職種ごとの人件費単価データベースに則って開発された **CALC**（旧 Hourglass）のプロジェクトです。 | [calc/.circleci/config.yml](https://github.com/18F/calc/blob/develop/.circleci/config.yml) Webhooks を活用したパラレルジョブを実現する `apt` を使った Python コードのビルド | 宇宙物理学のデータ分析向けオープンソース Python ライブラリ **SunPy** のプロジェクトです。 | [sunpy/.circleci/config.yml](https://github.com/sunpy/sunpy/blob/master/.circleci/config.yml) Scala および `sbt` を用いた3パターンのワークフローによるビルド、テスト、リリース | 仮想通貨 Arweave のブロックチェーン専用の軽量なモジュール型 HTTP クライアント **Arweave4s** のプロジェクトです。 | [arweave4s/.circleci/config.yml](https://github.com/toknapp/arweave4s/blob/master/.circleci/config.yml) {: class="table table-striped"}

## その他のサンプル

[チュートリアルとサンプルアプリ]({{ site.baseurl }}/2.0/tutorials/)もご覧ください。このページでは 11 のプログラム言語で作成された基礎的なアプリケーションについて、細かなコメントや解説がついたひと通りのサンプル設定ファイルを用意しています。