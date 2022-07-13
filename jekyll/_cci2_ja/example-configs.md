---
layout: classic-docs
title: "パブリックリポジトリの例"
short-title: "パブリックリポジトリの例"
description: "このページでは CircleCI 設定ファイルのサンプルを紹介します。 これらのサンプルには、CircleCI を使ってコードのデプロイを開始するにの必要な基本的なステップがすべて含まれています。"
categories:
  - はじめよう
order: 1
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

CircleCI で実行されるパブリックプロジェクトおよびオープンソースプロジェクトのサンプル全体は、以下の各ドキュメントとリンク先の `.circleci/config.yml` ファイルでご確認いただけます。

* 目次
{:toc}

## CircleCI ファイルとパブリックリポジトリのサンプル
{: #example-circleci-files-and-public-repos }

| サンプル名                  | 説明                                                                                                                       | リンク                                                                                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `config.yml` のサンプルファイル | それぞれ同時実行ワークフロー、順次実行ワークフロー、ファンインワークフロー、ファンアウトワークフローを使用し、1 つの設定ファイルで Linux と iOS のプロジェクトをビルドする 4 種類の `config.yml` サンプルファイル | <a href="{{ site.baseurl }}/sample-config/">`config.yml` のサンプルファイル</a>                                                                                                                                      |
| データベースの設定例             | PostgreSQL/Rails、Go/PostgreSQL、Ruby/MySQL を使用する 3 種類の `config.yml` サンプルファイル                                              | [データベースの設定例]({{ site.baseurl }}/postgres-config/)                                                                                                              |
| 並列                     | ジョブを並列実行するワークフロー設定                                                                                                       | [parallel-jobs/.circleci/config.yml](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/parallel-jobs/.circleci/config.yml)                       |
| 順次                     | ジョブを順次実行するワークフロー設定                                                                                                       | [sequential-branch-filter/.circleci/config.yml](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/sequential-branch-filter/.circleci/config.yml) |
| ファンイン/ファンアウト           | 順次ジョブの後に同時ジョブ、最後に順次ジョブにチェーンされるワークフロー設定                                                                                   | [fan-in-fan-out/.circleci/config.yml](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/fan-in-fan-out/.circleci/config.yml)                     |
| ワークスペース転送              | ワークスペースを使用してデータを共有するように設定されたジョブ                                                                                          | [workspace-forwarding/.circleci/config.yml](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/workspace-forwarding/.circleci/config.yml)         |
| circleci-docs          | Jekyll によって生成された CircleCI ドキュメントの静的な Web サイト                                                                             | [circleci-docs/.circleci/config.yml](https://github.com/circleci/circleci-docs/blob/master/.circleci/config.yml)                                               |
| circleci frontend      | CircleCI のフロントエンド Clojure アプリを実行しているコードのミラー                                                                              | [frontend/.circleci/config.yml](https://github.com/circleci/frontend/blob/master/.circleci/config.yml)                                                         |
| circleci-images        | CircleCI が提供している公式のコンテナイメージ セット                                                                                          | [circleci-images/.circleci/config.yml](https://github.com/circleci/circleci-images/blob/master/.circleci/config.yml)                                           |
| circleci image-builder | Docker を使用するコンテナイメージのビルド                                                                                                 | [image-builder/.circleci/config.yml](https://github.com/circleci/image-builder/blob/master/.circleci/config.yml)                                               |
| circleci-demo-docker   | CircleCI  で Docker イメージをビルドする方法を紹介するサンプルアプリケーション                                                                         | [.circleci/config.yml](https://github.com/CircleCI-Public/circleci-demo-docker/blob/master/.circleci/config.yml)                                               |
{: class="table table-striped"}

## 機能別のオープンソースプロジェクト
{: #open-source-projects-by-feature }

下記プロジェクトで、CircleCI 設定構文のさまざまな機能を使ったサンプルをご確認下さい。

| サンプルの説明                                               | プロジェクト                                                                                                                            | config.yml のリンク                                                                                                        |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| テンプレートによるキャッシュ、ワークスペースの使用、並列実行ワークフロー ジョブ              | **React** を使用したモバイルアプリのビルド                                                                                                        | [react-native/.circleci/config.yml](https://github.com/facebook/react-native/blob/master/.circleci/config.yml)         |
| `xvfb` と mocha を使用した ARM/x64 向けカスタムコンテナイメージのビルドおよびテスト | **Electron** フレームワークで JavaScript、HTML、および CSS を使用して、クロスプラットフォームのデスクトップ アプリケーションを作成します。 このフレームワークは Node.js と Chromium がベースになっています。 | [electron/.circleci/config.yml](https://github.com/electron/electron/blob/master/.circleci/config.yml)                 |
| macOS および Linux で実行されるビルド、テスト、アップロード                  | **Conda** は、ソフトウェアの配布、インストール、バージョン管理を容易にする、プラットフォームおよび言語に依存しないパッケージマネージャーです。                                                      | [bioconda-recipes/.circleci/config.yml](https://github.com/bioconda/bioconda-recipes/blob/master/.circleci/config.yml) |
| Docker イメージのビルドと登録、AWS ECS へのデプロイ                     | **Taco** は DLSS 向けの次世代リポジトリシステムです。                                                                                                | [taco/.circleci/config.yml](https://github.com/sul-dlss-labs/taco/blob/master/.circleci/config.yml)                    |
| `store_artifacts` を併用した Docker Compose と `docker cp`  | **Mayflower** は、マサチューセッツ州のエンタープライズ設計システムです。                                                                                       | [mayflower/.circleci/config.yml](https://github.com/massgov/mayflower/blob/develop/.circleci/config.yml)               |
| リモート Docker、Docker レイヤー キャッシュ、Docker イメージのビルドとプッシュ    | **Epoch** は æpps 用の新しいブロックチェーンです。                                                                                                 | [epoch/.circleci/config.yml](https://github.com/aeternity/epoch/blob/master/.circleci/config.yml)                      |
| ファンアウト/ファンイン ワークフローで実行されるマルチプラットフォームのビルド、テスト、デプロイ     | **Canary** は、汎用のサーバーレスな 1 行コマンドデプロイです。                                                                                            | [canary/.circleci/config.yml](https://github.com/zeit/now-cli/blob/canary/.circleci/config.yml)                        |
| タグ付きリリースによる複数プラットフォームでのビルドとテスト                        | **Crystal** はプログラミング言語です。                                                                                                         | [crystal/.circleci/config.yml](https://github.com/crystal-lang/crystal/blob/master/.circleci/config.yml)               |
| スケジュールされたタグ付きワークフロー ジョブ                               | **Cloud Pub/Sub** 向けの Node.js イディオムクライアント                                                                                         | [nodejs-pubsub/.circleci/config.yml](https://github.com/googleapis/nodejs-pubsub/blob/master/.circleci/config.yml)     |
{: class="table table-striped"}

## 言語別のオープンソースプロジェクト
{: #open-source-projects-by-language }

下記プロジェクトで、プログラミング言語、テストのメカニズム、デプロイターゲット別のサンプルをご確認ください。

| サンプルの説明                                                                         | プロジェクト                                                                                                                                                                                       | istio/.circleci/config.yml                                                                                                     |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `xvfb` を使用した Bazel によるビルドとテスト                                                   | **Angular** は、TypeScript や JavaScript などの言語でモバイルおよびデスクトップ Web アプリケーションをビルドするための開発プラットフォームです。                                                                                                 | [angular/.circleci/config.yml](https://github.com/angular/angular/blob/master/.circleci/config.yml)                            |
| Salesforce DX                                                                   | CircleCI で **Salesforce DX** をセットアップする方法を示したリポジトリです。                                                                                                                                         | [sfdx-circleci/.circleci/config.yml](https://github.com/forcedotcom/sfdx-circleci/blob/master/.circleci/config.yml)            |
| `junit` を使用した Golang ビルド、および本番の master ジョブ ワークフローの Kubernetes テスト               | **Azure Container Service Engine** (acs-engine) では、DC/OS、Kubernetes、Swarm Mode、または Swarm オーケストレーターを自由に選んで使用し、Microsoft Azure 上で Docker 対応クラスタ向けの ARM (Azure Resource Manager) テンプレートを生成できます。 | [acs-engine/.circleci/config.yml](https://github.com/Azure/acs-engine/blob/master/.circleci/config.yml)                        |
| Go および Node のビルド、パッケージ、デプロイ実行                                                   | **Ignition** は、Pivotal Cloud Foundry (PCF) へのデプロイを目的とした開発者向けのセルフサービス ランディングページです。                                                                                                            | [ignition/.circleci/config.yml](https://github.com/ktpv/ignition/blob/master/.circleci/config.yml)                             |
| `sbt` を使用した Java のビルドとパブリッシュ                                                    | **Scio** は、Apache Spark や Scalding を基にした Apache Beam および Google Cloud Dataflow 向けの Scala API です。                                                                                             | [scio/.circleci/config.yml](https://github.com/spotify/scio/blob/master/.circleci/config.yml)                                  |
| `junit` でビルドされた Javascript Node フロントエンド、および WebDriver によるエンドツーエンドのスクリーンショットのテスト | React、MobX、TypeScript を使用した **cBioPortal** 向けのフロントエンドコードです。                                                                                                                                  | [cbioportal-frontend/.circleci/config.yml](https://github.com/cBioPortal/cbioportal-frontend/blob/master/.circleci/config.yml) |
| 手動デプロイゲートを使用した Node と Yarn                                                      | **Docusaurus** は、オープンソースプロジェクト Web サイトの簡単なビルド、デプロイ、メンテナンスを目的としたプロジェクトです。                                                                                                                     | [Docusaurus/.circleci/config.yml](https://github.com/circleci/circleci-images/blob/master/.circleci/config.yml)                |
| Node と Yarn のテストおよびキャッシュを使用した Web サイトのデプロイ                                      | **NEO•ONE** により、NEO ブロックチェーン ソリューションのコーディング、テスト、デプロイを簡単に行えます。                                                                                                                                | [neo-one/.circleci/config.yml](https://github.com/neo-one-suite/neo-one/blob/master/.circleci/config.yml)                      |
| NPM と Yarn によるビルドとテスト、AWS S3 へのデプロイ                                             | **Clark Platform** 公式クライアント                                                                                                                                                                  | [clark-client/.circleci/config.yml](https://github.com/Cyber4All/clark-client/blob/master/.circleci/config.yml)                |
| Postgres データベースでの Python ビルド、Selenium テスト、および Code Climate                      | **CALC** (旧称「Hourglass」) は、Contracts Awarded Labor Category の略で、契約の際に、価格設定の履歴情報に基づいて時間あたりの人件費の見積もりを支援するツールです。                                                                                | [calc/.circleci/config.yml](https://github.com/18F/calc/blob/develop/.circleci/config.yml)                                     |
| Web フック通知を使用した並列ジョブ実行を実現する `apt` による Python ビルド                                 | **SunPy** は、太陽物理学のデータ分析のためのオープンソース Python ライブラリです。                                                                                                                                           | [sunpy/.circleci/config.yml](https://github.com/sunpy/sunpy/blob/master/.circleci/config.yml)                                  |
| Scala および `sbt` を使用した 3 つのワークフローによるビルド、テスト、リリース                                 | **Arweave4s** は、Arweave ブロックチェーン向けの軽量なモジュール型 HTTP クライアントです。                                                                                                                                  | [arweave4s/.circleci/config.yml](https://github.com/toknapp/arweave4s/blob/master/.circleci/config.yml)                        |
{: class="table table-striped"}

## 関連項目
{: #see-also }

Refer to [Examples and Guides Overview]({{ site.baseurl }}/examples-and-guides-overview/) for configuration walkthroughs with commented examples and detailed explanations for basic applications written in several different languages.
