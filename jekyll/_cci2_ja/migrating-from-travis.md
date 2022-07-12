---
layout: classic-docs
title: Travis CI からの移行
categories:
  - migration
description: Travis CI から CircleCI に移行する方法を概説します。
---

Travis CI から CircleCI に移行する方法を概説します。

このドキュメントで使用しているビルドの設定ファイル例は、[JavaScript のサンプルリポジトリ](https://github.com/CircleCI-Public/circleci-demo-javascript-express/blob/master/.circleci/config.yml)を基にしています。

## 前提条件
{: #prerequisites }

本ドキュメントでは、以下を前提としています。
1. リポジトリがリンクされた CircleCI アカウントをお持ちになっていることを前提としています。 まだアカウントをお持ちでない場合は、CircleCI の[入門ガイド]({{ site.baseurl }}/ja/2.0/getting-started/)を参照してください。
1. CircleCI では、チェックアウトされたコードを実行 (ビルド、テストなど) する環境を [Executor]({{ site.baseurl }}/ja/2.0/executor-intro/) と呼びます。

## CircleCI に移行する理由
{: #why-migrate-to-circleci }

- **同時実行のスケーリング**: CircleCI の 月額の Performance プランでは、最大 80 のジョブを同時実行することができ、[Custom プラン](https://circleci.com/ja/pricing/)ではさらに多くのジョブを同時実行することができます。 Travis CI で同時実行できるジョブの数は、各プランでそれぞれ 1、2、5、10 個までです。
- **リソースクラス**: CircleCI ジョブでは、[vCPU と RAM]({{ site.baseurl }}/ja/2.0/configuration-reference/#resource_class) を設定でき、戦略的にビルドを高速化し、クレジットを使用することができますが、Travis CI ではこれらの値は固定されています。
- **タイミングに基づいた並列化**: 多数のジョブの同時実行に加え、CircleCI では、タイミングに基づいて複数の環境で[テストを分割する機能]({{ site.baseurl }}/ja/2.0/parallelism-faster-jobs/)が組み込まれています。 この機能により、大きなテストスイートが完了するまでの時間を大幅に削減されます。 Travis CI では手動で行う必要があります。
- **Orb**: CircleCI では、独自のインテグレーションよりも、再利用可能な、テンプレート化された設定ファイルである [Orb]({{ site.baseurl }}/ja/2.0/orb-intro/) を提供しています。 サービスやツールの連携に加え、Orb を使用してチームや組織の設定ファイルを標準化し、テンプレート化することもできます。 [レジストリ](https://circleci.com/developer/ja/orbs)を参照してください。

## 設定ファイル
{: #configuration-files }

Travis CI でも CircleCI でも _設定ファイル_ を使ってワークフローやジョブが定義されます。 異なる点は、CircleCI の設定ファイルはリポジトリのルートにある `.circleci/config.yml` に保存されます。

下記では、それぞれの設定ファイルの宣言形式を比較していただけます。

| Travis CI         | CircleCI                                                                                                                                                                      | 説明                                                                                                                                                                                              |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| language:         | [docker、machine、macos]({{ site.baseurl }}/2.0/executor-intro/)                                                                                                                | CircleCI では言語に基づく依存関係やコマンドを想定していません。代わりに、Executor を選択し、下記のように `run:` ステップを使ってインストール、ビルド、テストなどの必要なコマンドを実行します。                                                                                    |
| dist:             | [machine]({{ site.baseurl }}/ja/2.0/configuration-reference/#machine)                                                                                                         | CircleCI の Linux VM Executor は Ubuntu VM です。 設定ファイルで [バージョン]({{ site.baseurl }}/ja/2.0/configuration-reference/#available-linux-machine-images)を指定できます。                                         |
| cache components: | [restore_cache:](https://circleci.com/ja/docs/2.0/configuration-reference/#restore_cache)、[save_cache:](https://circleci.com/ja/docs/2.0/configuration-reference/#save_cache) | キャッシュの復元機能と保存機能を使用して、ビルド内のキャッシュを制御します。                                                                                                                                                          |
| before_cache      | [run:]({{ site.baseurl }}/ja/2.0/configuration-reference/#run)                                                                                                                | キャッシュする前にコマンドを実行する場合は、単にキャッシュ ステップの前に run: ステップを記述します。                                                                                                                                          |
| before_install:   | [run:]({{ site.baseurl }}/ja/2.0/configuration-reference/#run)                                                                                                                | CircleCI では、コマンドをステージまたはタイプに分割しません。 run: ステップを使用して任意のコマンドを指定し、必要に応じて順序付けします。 条件付きステップの使用方法については、[設定ファイルに関するドキュメント](https://circleci.com/ja/docs/2.0/configuration-reference/#when-属性)を参照してください。 |
| install:          | [run:]({{ site.baseurl }}/ja/2.0/configuration-reference/#run)                                                                                                                | 上記を参照。                                                                                                                                                                                          |
| before_script     | [run:]({{ site.baseurl }}/ja/2.0/configuration-reference/#run)                                                                                                                | 上記を参照。                                                                                                                                                                                          |
| script:           | [run:]({{ site.baseurl }}/ja/2.0/configuration-reference/#run)                                                                                                                | 上記を参照。                                                                                                                                                                                          |
| after_script:     | [run:]({{ site.baseurl }}/ja/2.0/configuration-reference/#run)                                                                                                                | 上記を参照。                                                                                                                                                                                          |
| deploy:           | [run:]({{ site.baseurl }}/ja/2.0/configuration-reference/#run)                                                                                                                | `run:` ステップを使ってデプロイに必要なコマンドを実行します。 [デプロイ設定]({{ site.baseurl }}/ja/2.0/deployment-integrations) を参照してください。                                                                                       |
| env:              | [environment:]({{site.baseurl}}/ja/2.0/configuration-reference/#environment)                                                                                                  | environment: 要素を使用して、環境変数を指定します。                                                                                                                                                                |
| matrix:           | [matrix:]({{site.baseurl}}/ja/2.0/configuration-reference/#matrix-requires-version-21)                                                                                        | CircleCI ではワークフローを使用して複数のジョブをオーケストレーションできます。                                                                                                                                                    |
| stage:            | [requires:]({{site.baseurl}}/ja/2.0/configuration-reference/#requires)                                                                                                        | requires: 要素を使用して、ジョブの依存関係を定義し、ワークフローでの並列ビルドを制御します。                                                                                                                                             |
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

CircleCI で同じ結果を得るために必要な構成をサンプル リポジトリから以下に抜粋します。

{% raw %}
```yaml
version: 2.1

workflows:
  version: 2
  build:
    jobs:
      - build

jobs:
  build:
    working_directory: ~/mern-starter
    docker:
      - image: cimg/node:17.2.0 # Primary execution image
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: mongo:3.4.4         # Service/dependency image
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run:
          name: update-npm
          command: 'sudo npm install -g npm@5'
      - restore_cache:
          key: dependency-cache-{{ checksum "package-lock.json" }}
      - run:
          name: install-npm-wee
          command: npm install
      - save_cache:
          key: dependency-cache-{{ checksum "package-lock.json" }}
          paths:
            - ./node_modules
      - run:
          name: test
          command: npm test
```
{% endraw %}

上記の構成では、特に*言語*を必要としていません。 また、ユーザーは任意の数の `step` を指定して実行でき、ステップの順序にも制約はありません。 Docker を利用することで、特定のバージョンの Node.js と MongoDB が各 `command` で使用可能になります。

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

**メモ:** CircleCI には、[定義済み環境変数](https://circleci.com/ja/docs/2.0/env-vars/#built-in-environment-variables)が複数用意されています。

## 高度なツール
{: #artifacts-uploading }

Travis CI では、AWS S3 を使用して手動で、または GitHub リリースのアタッチメントとしてビルド アーティファクトをアップロードできます。

CircleCI では、アーティファクトのアップロードは設定ファイル内の 1 ステップとして実行します。

```yaml
      - run:
          name: テスト
          command: npm test
      - run:
          name: コード カバレッジの生成
          command: './node_modules/.bin/nyc report --reporter=text-lcov'
      - store_artifacts: # < test-results.xml を保存します。Web アプリまたは API から使用できます
          path: test-results.xml
          prefix: tests
      - store_artifacts:
          path: coverage
          prefix: coverage
      - store_test_results:
          path: test-results.xml
```

アーティファクトのアップロードが完了すると、ブラウザー上でジョブ ページの [Artifacts (アーティファクト)] タブでアーティファクトを確認したり、CircleCI API からアクセスしたりすることができます。 詳細については、「[ビルド アーティファクトの保存]({{site.baseurl}}/ja/2.0/artifacts/)」を参照してください。

## 高度なツール
{: #advanced-tooling }

Travis でさらに高度な構成を行いたい場合は、*ビルド マトリックス* (複数の並列ジョブの実行を指定する構成) や*ビルド ステージ* (ジョブをステージにグループ化して並列実行したり、順次前のジョブの成功に基づいてジョブを順次実行したりする機能) が利用できます。

CircleCI では、`.circleci/config.yml` で [ワークフロー]({{site.baseurl}}/ja/2.0/workflows/) を使用することで、ジョブのグループ化と実行順序、並列実行の利用、ビルドのファンインまたはファンアウト、順次実行ビルドを定義できます。 ワークフローを使用すると、ビルド構成に対して複雑できめ細かな制御を行えるようになります。
