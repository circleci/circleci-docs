---
layout: classic-docs
title: "CircleCI での Yarn (npm の代替) の使用"
short-title: "Yarn パッケージマネージャー"
categories:
  - how-to
description: "CircleCI での Yarn パッケージマネージャーの使用方法"
---

[Yarn](https://yarnpkg.com/) は、JavaScript 用のオープンソースパッケージマネージャーです。 Yarn によってインストールされるパッケージは、キャッシュすることができます。 これによってビルドを高速化できますが、さらに重要なメリットとして、ネットワーク接続に関するエラーも低減できます。

## CircleCI での Yarn の使用方法

[`docker` Executor](https://circleci.com/docs/ja/2.0/executor-types/#docker-を使用する) を使用している場合は、ビルド環境に既に Yarn がインストールされている可能性があります。 [CircleCI が提供しているビルド済み Docker イメージ](https://circleci.com/docs/ja/2.0/circleci-images/)では、Node.js イメージ (`circleci/node`) に Yarn がプリインストールされています。 `circleci/python`、`circleci/ruby` などの他の言語イメージを使用している場合は、Yarn と Node.js を含む 2つの[イメージバリアント](https://circleci.com/docs/ja/2.0/circleci-images/#言語イメージ)があります。 `-node` と `-node-browsers` のイメージバリアントです。 たとえば、Docker イメージ `circleci/python:3-node` を使用すると、Yarn と Node.js がインストールされた Python ビルド環境が提供されます。

独自の Docker イメージベースを使用している場合、`macos` Executor または `machine` Executor を使用している場合は、[Yarn ドキュメント](https://yarnpkg.com/lang/ja/docs/install/)の公式手順に従って Yarn をインストールできます。

## キャッシュ

Yarn パッケージをキャッシュして、CI ビルド時間を短縮できます。 以下に例を示します。

{% raw %}

```yaml
#...

      - restore_cache:
          name: Yarn パッケージキャッシュを復元
          keys:
            - yarn-packages-{{ checksum "yarn.lock" }}
      - run:
          name: 依存関係をインストール
          command: yarn install --frozen-lockfile
      - save_cache:
          name: Yarn パッケージキャッシュを保存
          key: yarn-packages-{{ checksum "yarn.lock" }}
          paths:
            - ~/.cache/yarn
#...
```

{% endraw %}

## 関連項目

[依存関係のキャッシュ]({{ site.baseurl }}/2.0/caching/)