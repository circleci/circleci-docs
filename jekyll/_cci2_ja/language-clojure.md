---
layout: classic-docs
title: "言語ガイド: Clojure"
short-title: "Clojure"
description: "CircleCI 2.0 での Clojure を使用したビルドとテスト"
categories:
  - language-guides
order: 2
version:
  - Cloud
  - Server v2.x
---

このガイドでは、CircleCI 2.0 で Clojure アプリケーションをビルドする方法について説明します。 お急ぎの場合は、後述の設定ファイルの例をプロジェクトのルート ディレクトリにある [`.circleci/config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) に貼り付け、ビルドを開始してください。

* 目次
{:toc}

## 概要
{: #overview }
{:.no_toc}

他のテスト ツールを使用する場合は、別の `lein` タスクを実行するようにそのステップを調整するだけです。

ここでは、以下を前提としています。

* Leiningen の組み込み `test` タスクを含む `clojure.test` を使用している
* アプリケーションをオールインワン uberjar として配布できる

If you use another testing tool, you can just adjust that step to run a different `lein` task.

## 設定ファイルの例
{: #sample-configuration }

{% raw %}

```yaml
version: 2 # CircleCI 2.0 を使用します
jobs: # 1 回の実行の基本作業単位
  build: # ワークフローを使用しない実行では、エントリポイントとして `build` ジョブが必要です
    working_directory: ~/cci-demo-clojure # ステップが実行されるディレクトリ
    docker: # Docker でステップを実行します
      - image: circleci/clojure:lein-2.9.1 # ...このイメージをすべての `steps` が実行されるプライマリ コンテナとして使用します
    environment: # プライマリ コンテナの環境変数
      LEIN_ROOT: nbd
      JVM_OPTS: -Xmx3200m # メモリ不足エラーを回避するために最大ヒープ サイズを制限します
    steps: # `build` ジョブを構成するコマンド
      - checkout # ソース コードを作業ディレクトリにチェックアウトします
      - restore_cache: # 最後の実行からチェックサムが変化していない場合は、保存されているキャッシュを復元します
          key: cci-demo-clojure-{{ checksum "project.clj" }}
      - run: lein deps
      - save_cache: # キー テンプレートを使用してキャッシュを生成し .m2 ディレクトリに保存します
          paths:
            - ~/.m2
          key: cci-demo-clojure-{{ checksum "project.clj" }}
      - run: lein do test, uberjar
      - store_artifacts: # アーティファクト (https://circleci.com/ja/docs/2.0/artifacts/) に表示するテスト サマリーをアップロードします
          path: target/uberjar/cci-demo-clojure.jar
          destination: uberjar
      # デプロイ例については https://circleci.com/ja/docs/2.0/deployment-integrations/ を参照してください
```

{% endraw %}

## コードの取得
{: #get-the-code }

上記は Clojure デモ アプリケーションの設定ファイルの抜粋です。 このデモ アプリケーションには、<https://github.com/CircleCI-Public/circleci-demo-clojure-luminus> からアクセスできます。

ご自身でコード全体を確認する場合は、GitHub でプロジェクトをフォークし、ローカル マシンにダウンロードします。 CircleCI で [[Add Projects (プロジェクトの追加)](https://circleci.com/add-projects){:rel="nofollow"}] ページにアクセスし、プロジェクトの横にある [Build Project (プロジェクトのビルド)] ボタンをクリックします。 最後に `.circleci/config.yml` の内容をすべて削除します。

他のディレクトリを指定しない限り、以降の `job` ではこのパスがデフォルトの作業ディレクトリとなります。

## 設定ファイルの詳細
{: #config-walkthrough }

`working_directory` の直下の `docker` キーで、コンテナ イメージを指定できます。

`lein-2.7.1` タグを指定して [CircleCI 提供の Clojure イメージ](https://circleci.com/ja/docs/2.0/circleci-images/#clojure)を使用します。

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

この `build` ジョブ内にいくつかの `steps` を追加します。

コードベースで作業できるように、最初に `checkout` を置きます。

```yaml
version: 2
...
    docker:
      - image: circleci/clojure:lein-2.9.1
```

We use the [CircleCI-provided Clojure image](https://circleci.com/docs/2.0/circleci-images/#clojure) with the `lein-2.7.1` tag.

ここでは、メモリ不足エラーが発生しないように、`JVM_OPTS` を設定して最大ヒープ サイズを制限します。 標準のコンテナの制限は 4 GB ですが、JVM がヒープ外に確保する分と Leiningen 自体のために、いくらかの容量を残しておきます (場合によっては、`lein trampoline ...` を使用して Leiningen のオーバーヘッドを回避できます)。 (You can avoid the Leiningen overhead by using `lein trampoline ...` in some cases.) たとえば、データベースまたはキューのためのバックグラウンド コンテナがある場合は、メインの JVM ヒープにメモリを割り当てる際にそれらのコンテナを考慮してください。

通常、Leiningen は非 root ユーザーとして実行されることを前提とし、root として実行しているユーザーは例外的と見なします。 この例では、それが意図的であることを示すために `LEIN_ROOT` 環境変数を設定します。

```yaml
    environment:
      JVM_OPTS: -Xmx3200m
      LEIN_ROOT: nbd
```

Now we’ll add several `steps` within the `build` job.

We start with `checkout` so we can operate on the codebase.

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
