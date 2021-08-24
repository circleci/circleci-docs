---
layout: classic-docs
title: "Travis CI からの移行"
categories:
  - migration
description: "Travis CI からの移行"
---

Travis CI から CircleCI に移行する方法を概説します。

このドキュメントで使用しているビルド構成の例は、[JavaScript のサンプル リポジトリ](https://github.com/CircleCI-Public/circleci-demo-javascript-express/blob/master/.circleci/config.yml)を基にしています。

## 前提条件
{: #prerequisites }

This document assumes that:
1. リポジトリがリンクされた CircleCI アカウントをお持ちになっていることを前提としています。 まだアカウントをお持ちでない場合は、CircleCI の[入門ガイド]({{ site.baseurl }}/ja/2.0/getting-started/)を参照してください。
1. CircleCI では、チェックアウトされたコードを実行 (ビルド、テストなど) する環境を [Executor]({{ site.baseurl }}/ja/2.0/executor-intro/) と呼びます。

## 設定ファイル
{: #why-migrate-to-circleci }

- **Scaling Concurrency**: You can run up to 80 concurrent jobs on our monthly Performance Plan or even more on a [custom plan](https://circleci.com/pricing/). Travis CI has capped concurrencies of 1, 2, 5, and 10 on each of their plans.
- 初回のビルド後にすべての依存関係をキャッシュして、ビルド時間の短縮を図る
- **Parallelization by Timing**: On top of running many jobs concurrently, CircleCI offers built-in [test splitting]({{ site.baseurl }}/2.0/parallelism-faster-jobs/) across multiple environments by timing. This dramatically reduces wall clock time for large test suites to finish. You must implement this manually in Travis CI.
- **Orbs**: Rather than proprietary integrations, CircleCI offers [orbs]({{ site.baseurl }}/2.0/orb-intro/), which are reusable, templated configuration. On top of connecting to services and tools, orbs can be used to standardize and templatize configuration for your team and organization as well. [Visit the registry](https://circleci.com/developer/orbs).

## コードのプッシュ時のビルド
{: #configuration-files }

Both Travis CI and CircleCI make use of a _configuration file_ to define your workflows and jobs. CircleCI の場合は、リポジトリのルートにある `.circleci/config.yml` ファイルに保存します。

Below, you'll find a side-by-side comparison of different configuration declarations.

| Travis CI         | CircleCI                                                                                                                                                                      | 説明                                                                                                                                                                                                  |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| language:         | [docker、machine、macos]({{ site.baseurl }}/2.0/executor-types/)                                                                                                                | CircleCI doesn't assume dependencies or commands based on a language; instead, choose an executor and use `run:` steps as shown below to execute commands you require (e.g., install, build, test). |
| dist:             | [machine]({{ site.baseurl }}/2.0/configuration-reference/#machine)                                                                                                            | CircleCI の Linux VM Executor は Ubuntu VM です。 設定ファイルで [バージョン](https://circleci.com/ja/docs/2.0/configuration-reference/#使用可能な-machine-イメージ)を指定できます。                                                  |
| cache components: | [restore_cache:](https://circleci.com/ja/docs/2.0/configuration-reference/#restore_cache)、[save_cache:](https://circleci.com/ja/docs/2.0/configuration-reference/#save_cache) | キャッシュの復元機能と保存機能を使用して、ビルド内のキャッシュを制御します。                                                                                                                                                              |
| before_cache      | [run:]({{ site.baseurl }}/2.0/configuration-reference/#run)                                                                                                                   | キャッシュする前にコマンドを実行する場合は、単にキャッシュ ステップの前に run: ステップを記述します。                                                                                                                                              |
| before_install:   | [run:]({{ site.baseurl }}/2.0/configuration-reference/#run)                                                                                                                   | CircleCI では、コマンドをステージまたはタイプに分割しません。 run: ステップを使用して任意のコマンドを指定し、必要に応じて順序付けします。 条件付きステップの使用方法については、[設定ファイルに関するドキュメント](https://circleci.com/ja/docs/2.0/configuration-reference/#when-属性)を参照してください。     |
| install:          | [run:]({{ site.baseurl }}/2.0/configuration-reference/#run)                                                                                                                   | 上記を参照。                                                                                                                                                                                              |
| before_script     | [run:]({{ site.baseurl }}/2.0/configuration-reference/#run)                                                                                                                   | 上記を参照。                                                                                                                                                                                              |
| script:           | [run:]({{ site.baseurl }}/2.0/configuration-reference/#run)                                                                                                                   | 上記を参照。                                                                                                                                                                                              |
| after_script:     | [run:]({{ site.baseurl }}/2.0/configuration-reference/#run)                                                                                                                   | 上記を参照。                                                                                                                                                                                              |
| deploy:           | [run:]({{ site.baseurl }}/2.0/configuration-reference/#run)                                                                                                                   | Use a `run:` step to run needed commands for deployment. See our [Deployment Guide]({{ site.baseurl }}/2.0/deployment-integrations) for examples.                                                   |
| env:              | [environment:](https://circleci.com/docs/2.0/configuration-reference/#environment)                                                                                            | environment: 要素を使用して、環境変数を指定します。                                                                                                                                                                    |
| matrix:           | [matrix:](https://circleci.com/docs/2.0/configuration-reference/#matrix-requires-version-21)                                                                                  | CircleCI ではワークフローを使用して複数のジョブをオーケストレーションできます。                                                                                                                                                        |
| stage:            | [requires:](https://circleci.com/docs/2.0/configuration-reference/#requires)                                                                                                  | requires: 要素を使用して、ジョブの依存関係を定義し、ワークフローでの並列ビルドを制御します。                                                                                                                                                 |
{: class="table table-striped"}

## 環境変数
{: #building-on-pushing-code }

ドキュメント冒頭のリンク先にあるサンプル リポジトリは、記事の作成、読み取り、更新、削除を行う基本的なアプリケーションです。 アプリケーションは `MERN` スタックを使用してビルドし、クライアント上でテストを実行し、コードのプッシュ時に毎回 REST API を実行します。

CircleCI で同じ結果を得るために必要な構成をサンプル リポジトリから以下に抜粋します。

```yaml
language: node_js
services: mongodb
before_install: 
  - npm i -g npm@5
node_js:
  - "5"
cache: npm
```

基本的なビルドの場合、Travis CI の構成では、言語に関する最もよく知られた依存関係とビルド ツールを使用し、[1 つのジョブ ライフサイクル](https://docs.travis-ci.com/user/job-lifecycle/#the-job-lifecycle)においてオーバーライド可能なデフォルトのコマンドとしてそれらを抽象化します。 このビルドを実行すると、Travis CI は自動的に `install` ステップとして `npm install` を実行し、`script` ステップとして `npm start` を実行します。

CI 環境をさらに制御する必要があるときには、*フック*を使用して `install` ステップと `script` ステップの前後でコマンドを実行できます。 上記の例では、「before フック」を使用して npm バージョンを `5` に固定するように指定しています。 実行するシェル スクリプトは、通常、リポジトリのルートの `.travis` フォルダーに格納します。

The following CircleCI configuration to achieve the same results is excerpted from the example repository:

{% raw %}
```yaml
version: 2
jobs:
  build:
    working_directory: ~/mern-starter
    docker:

      - image: circleci/node:4.8.2
      - image: mongo:3.4.4
    steps:
      - checkout
      - run:
          name: npm の更新
          command: 'sudo npm install -g npm@5'
      - restore_cache:
          key: dependency-cache-{{ checksum "package-lock.json" }}
      - run:
          name: npm wee のインストール
          command: npm install
      - save_cache:
          key: dependency-cache-{{ checksum "package-lock.json" }}
          paths:
            - ./node_modules
      - run:
          name: テスト
          command: npm test
```
{% endraw %}

上記の構成では、特に*言語*を必要としていません。 また、ユーザーは任意の数の `steps` を指定して実行でき、ステップの順序にも制約はありません。 Docker を利用することで、特定のバージョンの Node.js と MongoDB が各 `command` で使用可能になります。

### コンテナの使用
{: #caching-dependencies }

CircleCI では、依存関係をキャッシュおよび復元するタイミングとその方法を設定ファイルで制御できます。 上記の CircleCI の `.circleci/config.yml` では、特に `package-lock.json` ファイルのチェックサムに基づいて依存関係のキャッシュをチェックしています。 `package-lock.json` に限らず、任意のキーに基づいてキャッシュを設定したり、一連のキャッシュ パスに対して宣言した順序でキャッシュを保留するよう設定したりすることができます。 ビルド時にキャッシュを作成および復元する方法のカスタマイズについては「[依存関係のキャッシュ]({{ site.baseurl }}/ja/2.0/caching/)」を参照してください。

Travis の構成の場合、[依存関係のキャッシュ](https://docs.travis-ci.com/user/caching/)は、ビルド時の `script` フェーズの後に発生し、使用している言語に関連付けられます。 `.travis.yml` の例では、`cache: npm` キーを使用することで、依存関係はデフォルトで `node_modules` をキャッシュするようになっています。

## アーティファクトのアップロード
**メモ:** CircleCI には、[定義済み環境変数](https://circleci.com/ja/docs/2.0/env-vars/#定義済み環境変数)が複数用意されています。

Travis CI では、AWS S3 を使用して手動で、または GitHub リリースのアタッチメントとしてビルド アーティファクトをアップロードできます。

CircleCI の `.circleci/config.yml` では、ビルド構成のステップ、ジョブ、またはコンテナ内に環境変数を直接含めることができます。 これらはパブリック変数であり、暗号化されていません。 Travis CI では、[暗号化された環境変数](https://docs.travis-ci.com/user/environment-variables#defining-encrypted-variables-in-travisyml)を構成に直接含めることができます (`travis` gem をインストールしている場合に限ります)。

### 依存関係のキャッシュ
Web アプリケーションでの環境変数の設定

Travis CI の[リポジトリ設定](https://docs.travis-ci.com/user/environment-variables#defining-variables-in-repository-settings)を使用している場合は、CircleCI のプロジェクト設定のページで簡単に環境変数を設定できます。 詳細については、「[プロジェクトでの環境変数の設定]({{ site.baseurl }}/ja/2.0/env-vars/#プロジェクトでの環境変数の設定)」を参照してください。

CircleCI では、[コンテキスト]({{site.baseurl}}/ja/2.0/contexts/)を使用することで、*すべて*のプロジェクト間で安全に環境変数を共有できます。

Travis と CircleCI はいずれも、ビルド時に環境変数を使用できます。

## 高度なツール
{: #artifacts-uploading }

With Travis CI you can upload build artifacts either manually using AWS S3 or as an attachment to a GitHub Release.

CircleCI では、アーティファクトのアップロードは設定ファイル内の 1 ステップとして実行します。

```yaml
      - run:
          name: テスト
          command: npm test
      - run:
          name: コード カバレッジの生成
          command: './node_modules/.bin/nyc report --reporter=text-lcov'
      - store_artifacts: # < test-results.xml を保存します。
          Web アプリまたは API から使用できます
          path: test-results.xml
          prefix: tests
      - store_artifacts:
          path: coverage
          prefix: coverage
      - store_test_results:
          path: test-results.xml
          path: test-results.xml
          prefix: tests
      - store_artifacts:
          path: coverage
          prefix: coverage
      - store_test_results:
          path: test-results.xml
          path: test-results.xml
          prefix: tests
      - store_artifacts:
          path: coverage
          prefix: coverage
      - store_test_results:
          path: test-results.xml
```

アーティファクトのアップロードが完了すると、ブラウザー上でジョブ ページの [Artifacts (アーティファクト)] タブでアーティファクトを確認したり、CircleCI API からアクセスしたりすることができます。 詳細については、「[ビルド アーティファクトの保存]({{site.baseurl}}/ja/2.0/artifacts/)」を参照してください。

## Advanced tooling
{: #advanced-tooling }

Travis でさらに高度な構成を行いたい場合は、*ビルド マトリックス* (複数の並列ジョブの実行を指定する構成) や*ビルド ステージ* (ジョブをステージにグループ化して並列実行したり、順次前のジョブの成功に基づいてジョブを順次実行したりする機能) が利用できます。

CircleCI では、`.circleci/config.yml` で [ワークフロー]({{site.baseurl}}/ja/2.0/workflows/) を使用することで、ジョブのグループ化と実行順序、並列処理の利用、ビルドのファンインまたはファンアウト、順次実行ビルドを定義できます。 ワークフローを使用すると、ビルド構成に対して複雑できめ細かな制御を行えるようになります。
