---
layout: classic-docs
title: "言語ガイド: Clojure"
short-title: "Clojure"
description: "Building and Testing with Clojure on CircleCI"
categories:
  - language-guides
order: 2
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

このガイドでは、CircleCI で Clojure アプリケーションをビルドする方法について説明します。 お急ぎの場合は、後述の設定ファイルの例をプロジェクトのルート ディレクトリにある [`.circleci/config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) に貼り付け、ビルドを開始してください。

* 目次
{:toc}

## 概要
{: #overview }
{:.no_toc}

お急ぎでなければ、[設定ファイルの詳細](#config-walkthrough)に目を通すことをお勧めします。

ここでは、以下を前提としています。

* Leiningen の組み込み `test` タスクを含む `clojure.test` を使用している
* アプリケーションをオールインワン uberjar として配布できる

他のテスト ツールを使用する場合は、別の `lein` タスクを実行するようにそのステップを調整するだけです。

## 設定ファイルの例
{: #sample-configuration }

{% raw %}

```yaml
version: 2
jobs: # basic units of work in a run
  build: # runs not using Workflows must have a `build` job as entry point
    working_directory: ~/cci-demo-clojure # directory where steps will run
    docker: # run the steps with Docker
      - image: cimg/clojure:1.10 # ...with this image as the primary container; this is where all `steps` will run
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    environment: # environment variables for primary container
      LEIN_ROOT: nbd
      JVM_OPTS: -Xmx3200m # limit the maximum heap size to prevent out of memory errors
    steps: # commands that comprise the `build` job
      - checkout # check out source code to working directory
      - restore_cache: # restores saved cache if checksum hasn't changed since the last run
          key: cci-demo-clojure-{{ checksum "project.clj" }}
      - run: lein deps
      - save_cache: # generate and store cache in the .m2 directory using a key template
          paths:
            - ~/.m2
          key: cci-demo-clojure-{{ checksum "project.clj" }}
      - run: lein do test, uberjar
      - store_artifacts: # Upload test summary for display in Artifacts: https://circleci.com/docs/2.0/artifacts/
          path: target/uberjar/cci-demo-clojure.jar
          destination: uberjar
      # See https://circleci.com/docs/2.0/deployment-integrations/ for deploy examples
```

{% endraw %}

## コードの取得
{: #get-the-code }

上記は Clojure デモ アプリケーションの設定ファイルの抜粋です。 このデモ アプリケーションには、<https://github.com/CircleCI-Public/circleci-demo-clojure-luminus> からアクセスできます。

ご自身でコード全体を確認する場合は、GitHub でプロジェクトをフォークし、ローカル マシンにダウンロードします。 CircleCI アプリケーションの[プロジェクトダッシュボード](https://app.circleci.com/projects/){:rel="nofollow"}に行き、プロジェクトの隣にある**[Follow Project (プロジェクトをフォローする)]**ボタンをクリックします。 最後に `.circleci/config.yml` の内容をすべて削除します。

これで `config.yml`を最初から作る準備ができました。

## 設定ファイルの詳細
{: #config-walkthrough }

必ずバージョンの指定から始めます。

```yaml
version: 2
```

次に、`jobs` キーを記述します。 1 つひとつのジョブが、ビルド、テスト、デプロイのプロセス内の各段階を表します。 このサンプル アプリケーションでは 1 つの `build` ジョブのみが必要なので、他の要素はそのキーの下に置きます。

各ジョブには、`working_directory` を指定するオプションがあります。 この例では、ホーム ディレクトリにあるプロジェクトから名前を付けます。

```yaml
version: 2
jobs:
  build:
    working_directory: ~/cci-demo-clojure
```

他のディレクトリが指定されない限り、以降の `job` ではこのパスがデフォルトの作業ディレクトリとして使用されます。

`working_directory` の直下の `docker` キーで、コンテナ イメージを指定できます。

```yaml
version: 2
...
    docker:
      - image: cimg/clojure:1.10
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
```

`lein-2.7.1` タグを指定して [CircleCI 提供の Clojure イメージ](https://circleci.com/ja/docs/2.0/circleci-images/#clojure)を使用します。

ここでは、メモリ不足エラーが発生しないように、`JVM_OPTS` を設定して最大ヒープ サイズを制限します。 標準のコンテナの制限は 4 GB ですが、JVM がヒープ外に確保する分と Leiningen 自体のために、いくらかの容量を残しておきます。 (場合によっては、`lein trampoline ...` を使用して Leiningen のオーバーヘッドを回避できます)。 たとえば、データベースまたはキューのためのバックグラウンド コンテナがある場合は、メインの JVM ヒープにメモリを割り当てる際にそれらのコンテナを考慮してください。

通常、Leiningen は非 root ユーザーとして実行されることを前提とし、root として実行しているユーザーは例外的と見なします。 この例では、それが意図的であることを示すために `LEIN_ROOT` 環境変数を設定します。

```yaml
    environment:
      JVM_OPTS: -Xmx3200m
      LEIN_ROOT: nbd
```

次に、`build` ジョブ内にいくつかの `steps` を追加します。

コードベースで作業できるように、最初に `checkout` を記述します。

次に、キャッシュをプル ダウンします (存在する場合)。 初回実行時、または `project.clj` を変更した場合、これは実行されません。 さらに `lein deps` を実行して、プロジェクトの依存関係をプル ダウンします。 通常、このタスクは必要時に自動的に実行されるため、これを直接呼び出すことはありません。 ただし、このタスクを直接呼び出すことで、`save_cache` ステップを挿入して依存関係を保存し、次回の処理を高速化することができます。

その後、`lein do test, uberjar` によって実際のテストが実行されます。 テストが正常に終了した場合は、アプリケーション ソースとすべての依存関係を含む "uberjar" ファイルが作成されます。

最後に `store_artifacts` ステップを使用して、uberjar を[アーティファクト](https://circleci.com/docs/1.0/build-artifacts/)として保存します。 そこから、これを目的の継続的デプロイ スキームに結び付けることができます。

{% raw %}
```yaml
...
    steps:

      - checkout
      - restore_cache:
          key: cci-demo-clojure-{{ checksum "project.clj" }}
      - run: lein deps
      - save_cache:
          paths:
            - ~/.m2
          key: cci-demo-clojure-{{ checksum "project.clj" }}
      - run: lein do test, uberjar
      - store_artifacts:
          path: target/cci-demo-clojure.jar
          destination: uberjar
```
{% endraw %}

完了です。 これで Clojure アプリケーション用に CircleCI をセットアップできました。

## 関連項目
{: #see-also }
{:.no_toc}

デプロイ ターゲットの構成例については、「[デプロイの構成i]({{ site.baseurl }}/ja/2.0/deployment-integrations/)」を参照してください。

### 詳細な例
{: #detailed-examples }
{:.no_toc}

このガイドでは、Clojure Web アプリの最も単純な構成例を示しました。 通常、実際のプロジェクトはこれよりも複雑です。 このため、独自のプロジェクトを構成するときは、以下のサイトのさらに詳細な例が参考になります。

* [Syme](https://github.com/technomancy/syme/blob/master/.circleci/config.yml): リモート コラボレーション用に使い捨ての仮想マシンを構成できるサイト (PostgreSQL を使用し、Heroku に継続的デプロイ)
