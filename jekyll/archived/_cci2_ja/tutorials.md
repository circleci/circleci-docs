---
layout: classic-docs
title: "チュートリアル"
description: "チュートリアルおよびガイド付き 2.0 サンプル アプリケーション"
version:
  - Cloud
  - Server v3.x
  - Server v2.x
redirect_from:
  - /ja/2.0/language-clojure/
  - /ja/2.0/language-crystal/
  - /ja/2.0/language-dart/
  - /ja/2.0/language-elixir/
---

お使いのプラットフォームに関連するチュートリアルを使用して、[`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) でどのようなカスタマイズが可能かをご確認ください。

| プラットフォーム ガイド                                                             | 説明                                                                      |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| <a href="{{ site.baseurl }}/ja/2.0/project-walkthrough/">Linux プロジェクトのチュートリアル</a>                                                | Flask を使用した Python プロジェクトを CircleCI 2.0 でビルドするためのセットアップについて、詳しく説明しています。 |
| <a href="{{ site.baseurl }}/ja/2.0/ios-tutorial/">iOS プロジェクトのチュートリアル</a>                                                | CircleCI 2.0 で iOS プロジェクトをセットアップする例をご紹介しています。                           |
| <a href="{{ site.baseurl }}/ja/2.0/language-android/">Android プロジェクトのチュートリアル</a>                                                | CircleCI 2.0 で Android プロジェクトをセットアップする例をご紹介しています。                       |
| [Windows プロジェクトのチュートリアル]({{ site.baseurl }}/ja/2.0/hello-world-windows/) | CircleCI 2.0 で .NET プロジェクトをセットアップする例をご紹介しています。                          |
{: class="table table-striped"}

## ガイド付きサンプルプロジェクト
{: #sample-projects-with-companion-guides }

サンプル プロジェクトを参照すると、アプリケーションの記述に使用する言語やフレームワークの構築に役立ちます。

{% include snippets/ja/language-guides.md %}

## サンプル ワークフロー
{: #sample-workflows }

| ワークフローの例       | GitHub リポジトリ                                                                                                                              |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 並列             | [parallel-jobs](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/parallel-jobs/.circleci/config.yml)                       |
| 順次             | [sequential-branch-filter](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/sequential-branch-filter/.circleci/config.yml) |
| ファンイン / ファンアウト | [fan-in-fan-out](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/fan-in-fan-out/.circleci/config.yml)                     |
| ワークスペース転送      | [workspace-forwarding](https://github.com/CircleCI-Public/circleci-demo-workflows/blob/workspace-forwarding/.circleci/config.yml)         |
{: class="table table-striped"}

## CircleCI public repos
{: #circleci-public-repos }

| GitHub リポジトリ           | 説明                                           | config.yml のリンク                                                                                      |
| ---------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| circleci-docs          | Jekyll によって生成された CircleCI ドキュメントの静的な Web サイト | [.circleci/config.yml](https://github.com/circleci/circleci-docs/blob/master/.circleci/config.yml)   |
| circleci frontend      | CircleCI のフロントエンドを実行しているコードのミラーです。           | [.circleci/config.yml](https://github.com/circleci/frontend/blob/master/.circleci/config.yml)        |
| circleci-images        | CircleCI が提供している公式のイメージ セットです。               | [.circleci/config.yml](https://github.com/circleci/circleci-images/blob/master/.circleci/config.yml) |
| circleci image-builder | Docker を使用するコンテナ イメージのビルド                    | [.circleci/config.yml](https://github.com/circleci/image-builder/blob/master/.circleci/config.yml)   |
{: class="table table-striped"}

## 関連項目
{: #see-also }

Hello World ドキュメントと`config.yml` ファイルの例を参照して、最初のビルドを構成できます。

| ドキュメント                    | 説明                                                                                                                                |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| <a href="{{ site.baseurl }}/ja/2.0/hello-world/">Hello World</a> | Hello World を表示するアプリケーションの `config.yml` ファイル テンプレートを使用して、簡単な手順で作業を開始できます。                                                         |
| <a href="{{ site.baseurl }}/ja/2.0/sample-config/">config.yml のリンク</a> | 4 種類の `config.yml` サンプル ファイル。それぞれ同時実行ワークフロー、順次実行ワークフロー、ファンイン ワークフロー、ファンアウト ワークフローを使用し、1 つの設定ファイルに基づいて Linux と iOS のプロジェクトをビルドします。 |
{: class="table table-striped"}
