---
layout: classic-docs
title: "1.0 から 2.0 への config-translation エンドポイントを使用する"
short-title: "1.0 から 2.0 への config-translation エンドポイントを使用する"
description: "CircleCI 1.0 の設定を 2.0 形式に変換する実験的な変換ツールの使用手順"
categories: [migration]
hide: true
order: 60
---

ここでは、`config-translation` エンドポイントを使用して、既存の CircleCI 1.0 プロジェクトから基本的な作業 CircleCI 2.0 設定を生成する手順を説明します。対象となる言語は、以下に限定されます。 * Ruby * PHP * Node.js * iOS (一部。1.0 のコード署名はサポートされません。代わりに Fastlane を使用してください) * Java (一部)

生成される `config-translation` ファイルには、CircleCI 2.0 プロジェクトの `.circleci/config.yml` として使用するために設定を変更する方法について、わかりやすいコメントが含まれています。

**警告：生成された設定ファイルをテストせずに本稼働で使用しないでください。**1.0 には、2.0 の設定で調整できない構造があるため、生成された設定ファイルをブランチに置き、テストし、修正してから、本稼働に移行してください。 `config-translation` を使用して生成された仮設定による結果は、1.0 の結果と大きく異なる場合があります。

## 概要

`config-translation` エンドポイントは、CircleCI 1.0 プロジェクトから 2.0 用の仮設定ファイルを生成するために役立ちます。 CircleCI 1.0 と 2.0 の主な違いは以下のとおりです。

* すべての設定は、リポジトリ内の `.circleci/config.yml` ファイルで明示的に宣言されていなければなりません。
* CircleCI 2.0 では、複数のステップやジョブで構成されるビルドを組織化するために Workflows が導入されています。 Workflows を使用すると、ビルドを複数のジョブに分割し、不具合を迅速に特定できます。 Workflows を使用するには、`config.yml` ファイルに新しいスタンザを追加する必要があります (`config-translation` によって `workflows` スタンザは生成**されません**)。 手順と例については、「[ワークフローの組織化]({{site.baseurl}}/ja/2.0/workflows/)」を参照してください。

`config-translator` エンドポイントは、現在、1.0 ビルドの `deploy` ステップの変換をサポートして**いない**ため、デプロイのためのジョブも新しく追加する必要があります。 詳細な説明と例については、CircleCI 2.0 の[デプロイインテグレーション]({{site.baseurl}}/ja/2.0/deployment-integrations/)のドキュメントを参照してください。

## `config-translation` の使用方法

1. `config-translation` を使用するには、以下の API エンドポイントを使用して、1.0 の CircleCI プロジェクトビルドの名前を渡します。

    `GET: /project/:vcs-type/:username/:project/config-translation`

    このエンドポイントは、1.0 プロジェクトのビルド履歴を使用して、`config-translation` ファイルを生成します。

2. `bar` という GitHub 組織の `foo` というリポジトリに対して、`circleci.com` で認証されている場合、ブラウザーから `config-translation` を使用するには、以下の URL をリクエストします。

    `https://circleci.com/api/v1.1/project/github/bar/foo/config-translation`

3. `bar` という GitHub 組織の `foo` というリポジトリに対して、`circleci.com` で認証されて**いない**場合、ブラウザーから `config-translation` を使用するには、以下の URL をリクエストし、クエリ文字列に `circle-token` を直接渡します。 以下の例では、`curl` を使用してこれを呼び出し、変換する `branch` を渡しています。また、[CircleCI API トークン]({{ site.baseurl }}/ja/2.0/managing-api-tokens/#パーソナル-api-トークンの作成)は `CIRCLE_TOKEN` という環境変数にあると仮定しています。

        Shell
         curl "https://circleci.com/api/v1.1/project/github/bar/foo/config-translation?circle-token=$CIRCLE_TOKEN&branch=develop" デフォルトでは、VCS で設定されているデフォルトのブランチ (通常は

    `master`) を使用します。

## 関連項目

[1.0 から 2.0 への移行のヒント]({{site.baseurl}}/2.0/migration/)
