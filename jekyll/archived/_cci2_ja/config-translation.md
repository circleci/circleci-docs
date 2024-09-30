---
layout: classic-docs
title: "1.0 から 2.0 への config-translation エンドポイントの使用"
short-title: "1.0 から 2.0 への config-translation エンドポイントを使用する"
description: "CircleCI 1.0 の設定ファイルを 2.0 形式に変換する実験的な変換ツールの使用手順"
categories:
  - 移行
hide: true
order: 60
version:
  - Server v2.x
---

ここでは、`config-translation` エンドポイントを使用して、既存の CircleCI 1.0 プロジェクトから CircleCI 2.0 の基本的な作業用設定ファイルを生成する手順を説明します。
* Ruby
* PHP
* Node.js
* iOS (一部のみ。 1.0 のコード署名はサポートされないため、代わりに Fastlane を使用してください)
* Java (一部のみ)

生成される `config-translation` ファイルには、構成を修正して CircleCI 2.0 プロジェクトの `.circleci/config.yml` として使用する方法について、わかりやすい説明文が記載されています。

**警告: 生成された設定ファイルを本番環境に使用する前に、必ずテストを行ってください。 **一部の 1.0 の構造は、2.0 の構成では対応できないため、生成された設定ファイルをブランチに置き、テストして、修正した後に本番環境に移行してください。 `config-translation` を使用して生成された仮の設定ファイルによる結果は、1.0 の結果と大きく異なる場合があります。

## 概要
{: #overview }
`config-translation` エンドポイントを使用すると、CircleCI 1.0 プロジェクトから 2.0 用の仮設定ファイルを生成できます。 CircleCI 1.0 と 2.0 の主な違いは以下のとおりです。

* すべての構成は、リポジトリ内の `.circleci/config.yml` ファイルで明示的に宣言されていなければなりません。
* CircleCI 2.0 では、複数のステップやジョブから成るビルドをオーケストレーションするために、ワークフロー機能が導入されています。 ワークフローを使用すると、ビルドを複数のジョブに分割し、不具合をすばやく検出できます。 ワークフローを使用するには、`config.yml` ファイルに新しいスタンザを追加する必要があります (`config-translation` によって `workflows` スタンザは**生成されません**)。 手順と例については、[ワークフローに関するドキュメント]({{site.baseurl}}/ja/2.0/workflows/)を参照してください。

`config-translator` エンドポイントは、現在、1.0 ビルドの `deploy` ステップの変換を**サポートしていない**ため、デプロイのためのジョブも新しく追加する必要があります。 詳細な説明と例については、CircleCI 2.0 の[デプロイの構成に関するドキュメント]({{site.baseurl}}/ja/2.0/deployment-integrations/)を参照してください。

## `config-translation` の使用方法
{: #using-config-translation }

1. `config-translation` を使用するには、以下の API エンドポイントを使用して、1.0 の CircleCI プロジェクト ビルドの名前を渡します。

     `GET: /project/:vcs-type/:username/:project/config-translation`

     このエンドポイントは、1.0 プロジェクトのビルド履歴を使用して、`config-translation` ファイルを生成します。

2. `bar` という GitHub 組織の `foo` というリポジトリに対して、`circleci.com` で認証されている場合、ブラウザーから `config-translation` を使用するには、以下の URL をリクエストします。

     `https://circleci.com/api/v1.1/project/github/bar/foo/config-translation`

3. `bar` という GitHub 組織の `foo` というリポジトリに対して、`circleci.com` で**認証されていない**場合、ブラウザーから `config-translation` を使用するには、以下の URL をリクエストし、クエリ文字列に `circle-token` を直接渡します。 以下の例では、`curl` を使用してこれを呼び出し、変換する `branch` を渡しています。 また、[CircleCI API トークン]({{ site.baseurl }}/ja/2.0/managing-api-tokens/#パーソナル-api-トークンの作成)は `CIRCLE_TOKEN` という環境変数にあると仮定しています。

     ```shell
     curl -H "Circle-Token: $CIRCLE_TOKEN" "https://circleci.com/api/v1.1/project/github/bar/foo/config-translation?branch=develop"
     ```
      デフォルトでは、VCS で設定されているデフォルトのブランチ (通常は`master`) を使用します。

## 関連項目
{: #see-also }

 [1.0 から 2.0 への移行のヒント]({{site.baseurl}}/ja/2.0/migration/)

