---
layout: classic-docs
title: "CircleCI での Yarn (npm の代替) の使用"
short-title: "Yarn パッケージ マネージャー"
categories:
  - 使用方法
description: "Yarn is an open-source package manager for JavaScript. Learn how to use Yarn in CircleCI config and with caching to speed up builds."
version:
  - Cloud
  - Server v3.x
  - Server v2.x
---

[Yarn](https://yarnpkg.com/ja/) は、JavaScript 用のオープンソース パッケージ マネージャーです。 Yarn によってインストールされるパッケージはキャッシュできるため、 This can potentially speed up builds, but, more importantly, can reduce errors related to network connectivity.

## CircleCI での Yarn の使用方法
{: #using-yarn-in-circleci }

Yarn might already be installed in your execution environment if you are using the [`docker` executor](https://circleci.com/docs/2.0/executor-types/#using-docker). [CircleCI のビルド済み Docker イメージ](https://circleci.com/ja/docs/2.0/circleci-images/)では、Node.js イメージ (`circleci/node`) に Yarn がプリインストールされています。 `circleci/python`、`circleci/ruby` などの他の言語イメージを使用している場合は、Yarn と Node.js を含む 2 つの[イメージ バリアント](https://circleci.com/docs/2.0/circleci-images/#language-image-variants)があります。 `-node` と `-node-browsers` のイメージ バリアントです。 For example, using the Docker image `circleci/python:3-node` will give you a Python execution environment with Yarn and NodeJS installed.

独自の Docker イメージ ベース、または `macos`、`windows`、`machine` の Executor を使用している場合は、[Yarn の公式ドキュメント](https://yarnpkg.com/lang/ja/docs/install/)の手順に従って Yarn をインストールできます。 Yarn ドキュメントには、マシン環境別のインストール手順が記載されています。 たとえば Unix 系の環境にインストールする場合は、以下の curl コマンドを使用します。

```shell
curl -o- -L https://yarnpkg.com/install.sh | bash
```

## キャッシュ
{: #caching }

Yarn パッケージをキャッシュして、CI ビルド時間を短縮できます。

Yarn 2.xでは、 [Zero Installs](https://yarnpkg.com/features/zero-installs)という機能が追加されました。Zero Installsを使用している場合、特別なキャッシュは必要ありません。

Yarn 2.x を Zero Installs なしで使用している場合は、次のように設定します。

{% raw %}
```yaml
#...
      - restore_cache:
          name: Yarn パッケージのキャッシュの復元
          keys:
            - yarn-packages-{{ checksum "yarn.lock" }}
      - run:
          name: 依存関係のインストール
          command: yarn install --immutable
      - save_cache:
          name: Yarn パッケージのキャッシュの保存
          key: yarn-packages-{{ checksum "yarn.lock" }}
          paths:
            - ~/.cache/yarn
#...
```
{% endraw %}

Yarn 1.x の例:

{% raw %}
```yaml
#...
      - restore_cache:
          name: Yarn パッケージのキャッシュの復元
          keys:
            - yarn-packages-{{ checksum "yarn.lock" }}
      - run:
          name: 依存関係のインストール
          command: yarn install --frozen-lockfile --cache-folder ~/.cache/yarn
      - save_cache:
          name: Yarn パッケージのキャッシの保存
          key: yarn-packages-{{ checksum "yarn.lock" }}
          paths:
            - ~/.cache/yarn
#...
```
{% endraw %}

## 関連項目
{: #see-also }

[依存関係のキャッシュ]({{ site.baseurl }}/2.0/caching/)
