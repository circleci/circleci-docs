---
layout: classic-docs
title: "CircleCI での Yarn (npm の代替) の使用"
short-title: "Yarn パッケージ マネージャー"
categories:
  - how-to
description: "CircleCI での Yarn パッケージ マネージャーの使用方法"
---

[Yarn](https://yarnpkg.com/ja/) は、JavaScript 用のオープンソース パッケージ マネージャーです。 Yarn によってインストールされるパッケージはキャッシュできるため、 ビルドを高速化できるだけでなく、さらに重要なメリットとして、ネットワーク接続に関するエラーも低減できます。

## CircleCI での Yarn の使用方法

[`docker` Executor](https://circleci.com/ja/docs/2.0/executor-types/#docker-を使用する) を使用している場合は、ビルド環境に既に Yarn がインストールされている可能性があります。 [CircleCI が提供しているビルド済み Docker イメージ](https://circleci.com/ja/docs/2.0/circleci-images/)では、Node.js イメージ (`circleci/node`) に Yarn がプリインストールされています。 `circleci/python`、`circleci/ruby` などの他の言語イメージを使用している場合は、Yarn と Node.js を含む 2 つの[イメージ バリアント](https://circleci.com/ja/docs/2.0/circleci-images/#言語イメージ)があります。 `-node` と `-node-browsers` のイメージ バリアントです。 たとえば、Docker イメージ `circleci/python:3-node` を使用すると、Yarn と Node.js がインストールされた Python ビルド環境が提供されます。

独自の Docker イメージ ベース、または `macos`、`windows`、`machine` の Executor を使用している場合は、[Yarn の公式ドキュメント](https://yarnpkg.com/lang/ja/docs/install/)の手順に従って Yarn をインストールできます。 Yarn ドキュメントには、マシン環境別のインストール手順が記載されています。 たとえば Unix 系の環境にインストールする場合には、以下の curl コマンドを使用します。

```sh
curl -o- -L https://yarnpkg.com/install.sh | bash
```

## キャッシュ

Yarn パッケージをキャッシュして、CI ビルド時間を短縮できます。 以下に例を示します。

{% raw %}
```yaml
#...

      - restore_cache:
          name: Yarn パッケージのキャッシュの復元
          keys:
            - yarn-packages-{{ checksum "yarn.lock" }}
      - run:
          name: 依存関係のインストール
          command: yarn install --frozen-lockfile
      - save_cache:
          name: Yarn パッケージのキャッシュの保存
          key: yarn-packages-{{ checksum "yarn.lock" }}
          paths:
            - ~/.cache/yarn
#...
```
{% endraw %}

## 関連項目

[依存関係のキャッシュ]({{ site.baseurl }}/2.0/caching/)