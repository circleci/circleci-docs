---
layout: classic-docs
title: "言語ガイド：Clojure"
short-title: "Clojure"
description: "CircleCI 2.0 での Clojure を使用したビルドとテスト"
categories:
  - language-guides
order: 2
---

このガイドでは、CircleCI 2.0 で Clojure アプリケーションを作成する方法について説明します。お急ぎの場合は、以下の設定例をプロジェクトの root ディレクトリにある [`.circleci/config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) にコピーし、ビルドを開始してください。

* 目次
{:toc}

## 概要

{:.no_toc}

お急ぎでなければ、[設定の詳細](#設定の詳細)に目を通すことをお勧めします。

ここでは、以下を前提としています。

* Leiningen の組み込み `test` タスクを含む `clojure.test` を使用している
* アプリケーションをオールインワン uberjar として配布できる

他のテストツールを使用する場合は、別の `lein` タスクを実行するようにそのステップを調整するだけです。

## 設定例

{% raw %}

```yaml
version: 2 # CircleCI 2.0 を使用します
jobs: # 1回の実行の基本作業単位
  build: # Workflows を使用しない実行では、エントリポイントとして `build` ジョブが必要
    working_directory: ~/cci-demo-clojure # ステップが実行されるディレクトリ
    docker: # Docker でステップを実行します
      - image: circleci/clojure:lein-2.9.1 # このイメージをすべての `steps` が実行されるプライマリコンテナとして使用します
    environment: # プライマリコンテナの環境変数
      LEIN_ROOT: nbd
      JVM_OPTS: -Xmx3200m # メモリ不足エラーを回避するために最大ヒープサイズを制限します
    steps: # `build` ジョブを構成するコマンド
      - checkout # ソースコードを作業ディレクトリにチェックアウトします
      - restore_cache: # 最後の実行からチェックサムが変化していない場合は、保存されているキャッシュを復元します
          key: cci-demo-clojure-{{ checksum "project.clj" }}
      - run: lein deps
      - save_cache: # キーテンプレートを使用してキャッシュを生成し .m2 ディレクトリに保存します
          paths:
            - ~/.m2
          key: cci-demo-clojure-{{ checksum "project.clj" }}
      - run: lein do test, uberjar
      - store_artifacts: # アーティファクト (https://circleci.com/docs/ja/2.0/artifacts/) に表示するテストサマリーをアップロードします
          path: target/uberjar/cci-demo-clojure.jar
          destination: uberjar
      # デプロイ例については https://circleci.com/docs/ja/2.0/deployment-integrations/ を参照してください
```

{% endraw %}

## コードの取得

上記の設定は Clojure デモアプリケーションの一部です。このデモアプリケーションには、<https://github.com/CircleCI-Public/circleci-demo-clojure-luminus> からアクセスできます。

ご自身でコード全体を確認する場合は、GitHub でプロジェクトをフォークし、ローカルマシンにダウンロードします。 CircleCI で [[Add Projects (プロジェクトの追加)](https://circleci.com/add-projects){:rel="nofollow"}] ページにアクセスし、プロジェクトの横にある [Build Project (プロジェクトのビルド)] ボタンをクリックします。 最後に `.circleci/config.yml` の内容をすべて削除します。

これで `config.yml` を最初からビルドする準備ができました。

## 設定の詳細

常にバージョンの指定から始めます。

```yaml
version: 2
```

次に、`jobs` キーを置きます。 それぞれのジョブは、ビルド、テスト、デプロイのプロセス内の各段階を表しています。 このサンプルアプリケーションでは 1つの `build` ジョブのみが必要なので、他の要素はそのキーの下に置きます。

各ジョブには、`working_directory` を指定するオプションがあります。 この例では、ホームディレクトリにあるプロジェクトから名前を付けます。

```yaml
version: 2
jobs:
  build:
    working_directory: ~/cci-demo-clojure
```

他のディレクトリが指定されない限り、以降の `job` ではこのパスがデフォルトの作業ディレクトリとして使用されます。

`working_directory` の直下の `docker` キーで、コンテナイメージを指定できます。

```yaml
version: 2
...
    docker:
      - image: circleci/clojure:lein-2.9.1
```

`lein-2.7.1` タグを指定して [CircleCI 提供の Clojure イメージ](https://circleci.com/docs/ja/2.0/circleci-images/#clojure)を使用します。

ここでは、メモリ不足エラーが発生しないように、`JVM_OPTS` を設定して最大ヒープサイズを制限します。 標準のコンテナの制限は 4 GB ですが、JVM がヒープ外に確保する分と Leiningen 自体のために、いくらかの容量を残しておきます (場合によっては、`lein trampoline ...` を使用して Leiningen のオーバーヘッドを回避できます)。たとえば、データベースまたはキューのためのバックグラウンドコンテナがある場合は、メインの JVM ヒープにメモリを割り当てる際にそれらのコンテナを考慮してください。

通常、Leiningen は非 root ユーザーとして実行されることを前提とし、root として実行しているユーザーは例外的と見なします。 この例では、それが意図的であることを示すために `LEIN_ROOT` 環境変数を設定します。

```yaml
    environment:
      JVM_OPTS: -Xmx3200m
      LEIN_ROOT: nbd
```

この `build` ジョブ内にいくつかの `steps` を追加します。

コードベースで作業できるように、最初に `checkout` を置きます。

次に、キャッシュをプルダウンします (ある場合)。 初回実行時、または `project.clj` を変更した場合、これは実行されません。 さらに `lein deps` を実行して、プロジェクトの依存関係をプルダウンします。 通常、このタスクは必要時に自動的に実行されるため、これを直接呼び出すことはありません。ただし、このタスクを直接呼び出すことで、`save_cache` ステップを挿入して依存関係を保存し、次回の処理を高速化することができます。

その後、`lein do test, uberjar` によって実際のテストが実行されます。テストが正常に終了した場合は、アプリケーションソースとすべての依存関係を含む "uberjar" ファイルが作成されます。

最後に `store_artifacts` ステップを使用して、uberjar を[アーティファクト](https://circleci.com/docs/1.0/build-artifacts/)として保存します。 そこから、これを目的の継続的デプロイスキームに結び付けることができます。

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

完了です。 これで Clojure アプリケーション用に CircleCI を設定できました。

## 関連項目

{:.no_toc}

デプロイターゲットの設定例については、「[デプロイの設定]({{ site.baseurl }}/ja/2.0/deployment-integrations/)」を参照してください。

### 詳細な例

{:.no_toc}

このガイドでは、Clojure Web アプリの最も単純な設定例を示しました。通常、実際のプロジェクトはこれよりも複雑です。このため、独自のプロジェクトを設定する際は、以下のサイトのさらに詳細な例が参考になります。

* [Syme](https://github.com/technomancy/syme/blob/master/.circleci/config.yml)：リモートコラボレーション用に使い捨ての仮想マシンを設定できるサイト (PostgreSQL を使用し、Heroku に継続的デプロイ)
