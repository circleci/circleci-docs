---
layout: classic-docs
title: "Travis CI からの移行"
categories:
  - migration
description: "Travis CI からの移行"
---

ここでは、Travis CI から CircleCI に移行する方法の概要について説明します。

このドキュメントで使用しているビルドの設定例は、こちらの [JavaScript のサンプルリポジトリ](https://github.com/CircleCI-Public/circleci-demo-javascript-express/blob/master/.circleci/config.yml)を基にしています。 背景としては (取り上げる内容を限定するために)、設定例のリポジトリのオーナーが以下の目的で CI ツールを使用するケースを想定しています。

- コードのプッシュ時に、ビルドおよびすべてのテストを実行する
- 初回のビルド後にすべての依存関係をキャッシュして、ビルド時間の短縮を図る
- 環境変数を安全に使用する
- 各ビルドに `test-results.xml` ファイルをアップロードして、オンラインでアクセスする

## 前提条件

リポジトリがリンクされた CircleCI アカウントをお持ちになっていることを前提としています。 まだアカウントをお持ちでない場合は、CircleCI の[入門ガイド]({{ site.baseurl }}/ja/2.0/getting-started/)を参照してください。

## 設定ファイル

Travis と CircleCI の各 CI プロバイダーで何が実行されるのかは、*設定ファイル*に基づいて決定されます。 Travis の場合、この設定はリポジトリのルートにある `.travis.yml` ファイルに保存されています。 CircleCI の場合は、リポジトリのルートにある `.circleci/config.yml` ファイルに保存されています。

| Travis CI         | CircleCI                                                                                                                                                                      | 説明                                                                                                                                                                                                                                                                     |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| language:         | [docker.image](https://circleci.com/docs/2.0/configuration-reference/#docker)                                                                                                 | Docker Executor を使用して、対象言語に対応する Docker イメージを指定します。                                                                                                                                                                                                                     |
| dist:             | [machine](https://circleci.com/docs/2.0/configuration-reference/#machine)                                                                                                     | Our Linux VM executor is a Ubuntu VM. You can specify [versions](https://circleci.com/docs/2.0/configuration-reference/#available-machine-images) in the config                                                                                                        |
| os:               | [docker, machine, macos](https://circleci.com/docs/2.0/executor-types/)                                                                                                       | Rather than an os, we offer Docker, Linux VM, and MacOS execution environments.                                                                                                                                                                                        |
| cache components: | [restore_cache:](https://circleci.com/docs/ja/2.0/configuration-reference/#restore_cache)、[save_cache:](https://circleci.com/docs/ja/2.0/configuration-reference/#save_cache) | キャッシュの復元機能と保存機能を使用して、ビルド内のキャッシュを制御します。                                                                                                                                                                                                                                 |
| before_cache      | [run:](https://circleci.com/docs/2.0/configuration-reference/#run)                                                                                                            | If you want to run any commands before you cache, simply place a run: step before your cache step(s)                                                                                                                                                                   |
| before_install:   | [run:](https://circleci.com/docs/2.0/configuration-reference/#run)                                                                                                            | CircleCI doesn't separate commands into stages or types. Use run: steps to specify any arbitrary commands and order them per your needs. See [documentation](https://circleci.com/docs/2.0/configuration-reference/#the-when-attribute) for usage of conditional steps |
| install:          | [run:](https://circleci.com/docs/2.0/configuration-reference/#run)                                                                                                            | " (see above)                                                                                                                                                                                                                                                          |
| before_script     | [run:](https://circleci.com/docs/2.0/configuration-reference/#run)                                                                                                            | " (see above)                                                                                                                                                                                                                                                          |
| script:           | [run:](https://circleci.com/docs/2.0/configuration-reference/#run)                                                                                                            | " (see above)                                                                                                                                                                                                                                                          |
| after_script:     | [run:](https://circleci.com/docs/2.0/configuration-reference/#run)                                                                                                            | " (see above)                                                                                                                                                                                                                                                          |
| deploy:           | [deploy:](https://circleci.com/docs/2.0/configuration-reference/#deploy)                                                                                                      | Use the deploy: step to deploy build artifacts                                                                                                                                                                                                                         |
| env:              | [environment:](https://circleci.com/docs/2.0/configuration-reference/#environment)                                                                                            | Use the environment: element to specify environment variables                                                                                                                                                                                                          |
| matrix:           | [workflows:](https://circleci.com/docs/2.0/configuration-reference/#workflows)                                                                                                | Workflows are used on CircleCI to orchestrate multiple jobs                                                                                                                                                                                                            |
| stage:            | [requires:](https://circleci.com/docs/2.0/configuration-reference/#requires)                                                                                                  | Use the requires: element to define job dependencies and control parallel builds in workflows                                                                                                                                                                          |
{: class="table table-striped"}

### コンテナの使用時

CircleCI では、ビルド、テストなどのチェックアウトされたコードを実行するコンテキストを [Executor]({{ site.baseurl }}/ja/2.0/executor-intro/) と呼びます。

Rather than selecting a language and distribution to run on, you can select a Docker image, a clean Linux VM, or a clean macOS VM as your execution environment and write arbitrary run commands to install needed dependencies. However, using a specific Docker image (e.g., nodejs) will be the closest means to running a build based on a language. While you can use any custom Docker image, CircleCI maintains several [Docker Images]({{ site.baseurl }}/2.0/circleci-images/) tailored for common `.config` scenarios.

## コードのプッシュ時のビルド

ドキュメント冒頭のリンク先にあるサンプルリポジトリは、記事を作成、読み取り、更新、および削除する基本的なアプリケーションです。 このアプリケーションは `MERN` スタックを使用してビルドされ、クライアント上のテストと、コードのプッシュ時に実行される REST API があります。

このサンプルリポジトリに対してテストを実行する場合、Travis のシンプルな設定内容のうち、先頭部は以下のようになります。

```yaml
language: node_js
services: mongodb
before_install: 
  - npm i -g npm@5
node_js:
  - "5"
cache: npm
```

基本的なビルドの場合、Travis CI の設定では言語の最もよく知られた依存関係とビルドツールが使用され、上書き可能なデフォルトのコマンドとして [1つのジョブライフサイクル](https://docs.travis-ci.com/user/job-lifecycle/#the-job-lifecycle)に抽象化されます。 このビルドを実行すると、Travis CI は自動的に `install` ステップとして `npm install` を実行し、`script` ステップとして `npm start` を実行します。

CI 環境をさらに制御する必要があるときには、*フック*を使用して `install` ステップと `script` ステップの前後でコマンドを実行できます。 上記の例では、「before フック」を使用して npm バージョンを `5` に固定するように指定しています。 フックでシェルスクリプトを実行することも可能です。実行したシェルスクリプトは、通常、リポジトリのルートの `.travis` フォルダーに格納されます。

CircleCI で同じ結果を得るために必要な設定をサンプルリポジトリから以下に抜粋します。

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

上記のコンフィグでは、特定の*言語*が要求されていません。また、任意の数の `steps` を指定して実行でき、ステップの順序にも制約はありません。 Docker を利用すると、各 `command` で特定のバージョンの Node.js および MongoDB が使用できます。

### 依存関係のキャッシュ

CircleCI では、依存関係をキャッシュおよび復元するタイミングとその方法をコンフィグで制御できます。 In the above example, the CircleCI `.circleci/config.yml` checks for a dependency cache based specifically on a checksum of the `package-lock.json` file. You can set your cache based on any key (not just `package-lock.json`) as well as set a group of cache paths to defer to in the declared order. ビルドでキャッシュを作成および復元する方法のカスタマイズについては「[依存関係のキャッシュ]({{ site.baseurl }}/ja/2.0/caching/)」を参照してください。

Travis 設定の場合、[依存関係のキャッシュ](https://docs.travis-ci.com/user/caching/)は、ビルド内で `script` フェーズの後に発生し、使用している言語に関連付けられています。 このドキュメントの例の場合、`.travis.yml` で `cache: npm` キーを使用すると、依存関係はデフォルトで `node_modules` をキャッシュするようになります。

## 環境変数

Travis と CircleCI はいずれも、ビルドで環境変数を使用できます。

CircleCI の `.circleci/config.yml` では、ビルドコンフィグのステップ、ジョブ、またはコンテナ内に環境変数を直接含めることができます。 これらはパブリック変数であり、暗号化されていません。 Travis CI では、[暗号化された環境変数](https://docs.travis-ci.com/user/environment-variables#defining-encrypted-variables-in-travisyml)をコンフィグに直接含めることができます (`travis` gem をインストールしている場合に限ります)。

### Web アプリケーションでの環境変数の設定

Travis CI の[リポジトリ設定](https://docs.travis-ci.com/user/environment-variables#defining-variables-in-repository-settings)を使用している場合は、CircleCI のプロジェクト設定のページで簡単に環境変数を設定できます。 詳細については、[プロジェクト内で環境変数を設定する方法]({{ site.baseurl }}/ja/2.0/env-vars/#プロジェクト内で環境変数を設定する)を参照してください。

CircleCI では[コンテキスト]({{site.baseurl}}/ja/2.0/contexts/)を使用することで、*すべて*のプロジェクト間で安全に環境変数を共有できます。

**メモ：**CircleCI には[定義済み環境変数](https://circleci.com/docs/ja/2.0/env-vars/#定義済み環境変数)が複数用意されています。

## アーティファクトのアップロード

Travis CI では、AWS S3 を使用して手動で、または GitHub リリースのアタッチメントとしてビルドアーティファクトをアップロードできます。

CircleCI では、アーティファクトのアップロードはコンフィグ内の 1ステップとして実行されます。

```yaml
      - run:
          name: test
          command: npm test
      - run:
          name: code-coverage
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

アーティファクトのアップロードが完了すると、ブラウザー上でジョブページの [Artifacts (アーティファクト)] タブにアーティファクトを表示させたり、CircleCI API からアクセスしたりすることができます。 詳細については、[アーティファクトのアップロードに関するドキュメント]({{site.baseurl}}/ja/2.0/artifacts/)を参照してください。

## 高度なツール

Travis でさらに高度な設定を行いたい場合は、*ビルドマトリックス* (複数の並列ジョブの実行を指定する設定) や*ビルドステージ* (ジョブを複数のステージにグループ化して並列に実行させたり、順次実行されるジョブを前のジョブの成功に依存させたりする機能) が利用できます。

CircleCI では、`.circleci/config.yml` で [Workflows]({{site.baseurl}}/ja/2.0/workflows/) を使用することで、ジョブの集合と実行順序、並列処理の利用、ビルドのファンインまたはファンアウト、さらに依存的順次実行ビルドについて定義できます。 Workflows を使用すると、ビルド設定に対して複雑できめ細かな制御を行えるようになります。