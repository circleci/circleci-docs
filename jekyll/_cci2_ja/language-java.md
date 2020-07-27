---
layout: classic-docs
title: "言語ガイド：Java"
short-title: "Java"
description: "CircleCI 2.0 での Java を使用したビルドとテスト"
categories:
  - language-guides
order: 4
---

このガイドでは、CircleCI で Java アプリケーションを作成する方法について説明します。

- 目次
{:toc}

## 概要

{:.no_toc}

お急ぎの場合は、以下の設定例をプロジェクトの root ディレクトリにある [`.circleci/config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) にコピーし、ビルドを開始してください。

ここでは、以下を前提としています。

- <a href="https://maven.apache.org/">Maven</a> を使用している
- Java 8 を使用している
- Spring Framework を使用している (このプロジェクトは [Spring Initializr](https://start.spring.io/) を使用して生成されています)
- アプリケーションをオールインワン uberjar として配布できる

## 設定例

{% raw %}

```yaml
version: 2 # CircleCI 2.0 を使用します
jobs: # ステップの集合
  build: # Workflows を使用しない実行では、エントリポイントとして `build` ジョブが必要

    working_directory: ~/circleci-demo-java-spring # ステップが実行されるディレクトリ

    docker: # Docker でステップを実行します

      - image: circleci/openjdk:8-jdk-browsers # このイメージをすべての `steps` が実行されるプライマリコンテナとして使用します

    steps: # 実行可能コマンドの集合

      - checkout # ソースコードを作業ディレクトリにチェックアウトします

      - restore_cache: # 初回実行後、または `pom.xml` が変更されている場合に、保存されているキャッシュを復元します
          # 依存関係キャッシュについては https://circleci.com/docs/ja/2.0/caching/ をお読みください
          key: circleci-demo-java-spring-{{ checksum "pom.xml" }}

      - run: mvn dependency:go-offline # プロジェクトの依存関係を取得します

      - save_cache: # プロジェクトの依存関係を保存します
          paths:
            - ~/.m2
          key: circleci-demo-java-spring-{{ checksum "pom.xml" }}

      - run: mvn package # 実際のテストを実行します

      - store_test_results: # CircleCI ダッシュボードにテストメタデータを表示できるように、`target/surefire-reports` ディレクトリからアップロードします
      # テストサマリー (https://circleci.com/docs/ja/2.0/collect-test-data/) に表示するテスト結果をアップロードします
          path: target/surefire-reports

      - store_artifacts: # uberjar をアーティファクトとして保存します
      # アーティファクト (https://circleci.com/docs/ja/2.0/artifacts/) に表示するテストサマリーをアップロードします
          path: target/demo-java-spring-0.0.1-SNAPSHOT.jar
      # デプロイ例については https://circleci.com/docs/ja/2.0/deployment-integrations/ を参照してください
```

{% endraw %}

## コードの取得

上記の設定は、Java デモアプリケーションの一部です。このデモアプリケーションには、<https://github.com/CircleCI-Public/circleci-demo-java-spring> からアクセスできます。

ご自身でコード全体を確認する場合は、GitHub でプロジェクトをフォークし、ローカルマシンにダウンロードします。 CircleCI で [[Add Projects (プロジェクトの追加)](https://circleci.com/add-projects){:rel="nofollow"}] ページにアクセスし、プロジェクトの横にある [Build Project (プロジェクトのビルド)] ボタンをクリックします。 最後に `.circleci/config.yml` の内容をすべて削除します。

これで `config.yml` を最初からビルドする準備ができました。

## 設定の詳細

常にバージョンの指定から始めます。

```yaml
version: 2
```

次に、`jobs` キーを置きます。 それぞれのジョブは、ビルド、テスト、デプロイのプロセス内の各段階を表しています。 このサンプルアプリケーションでは 1つの `build` ジョブのみが必要なので、他の要素はそのキーの下に置きます。

各ジョブで、`working_directory` を指定する必要があります。 この例では、ホームディレクトリにあるプロジェクトから名前を付けます。

```yaml
version: 2
jobs:
  build:
    working_directory: ~/circleci-demo-java-spring
```

他のディレクトリが指定されない限り、以降の `job` ではこのパスがデフォルトの作業ディレクトリとして使用されます。

`working_directory` の直下の `docker` キーで、コンテナイメージを指定できます。

```yaml
version: 2
...
    docker:
      - image: circleci/openjdk:8-jdk-browsers
```

バージョン `8-jdk-browsers` のタグが付いた [CircleCI OpenJDK コンビニエンスイメージ](https://hub.docker.com/r/circleci/openjdk/)を使用します。これには、エンドツーエンドのテストを実行するためのブラウザーが含まれています。

この `build` ジョブ内にいくつかの `steps` を追加します。

コードベースで作業できるように、最初に `checkout` を置きます。

次に、キャッシュをプルダウンします (ある場合)。 初回実行時、または `pom.xml` を変更した場合、これは実行されません。 さらに `mvn dependency:go-offline` を実行して、プロジェクトの依存関係をプルダウンします。 これで、依存関係を保存する `save_cache` ステップを挿入して、次回の処理を高速化することができます。

<div class="alert alert-info" role="alert">
  <strong>ヒント：</strong>マルチモジュールプロジェクトのビルドを実行する場合、<code class="highlighter-rouge">mvn dependency:go-offline</code> は機能しません。 その場合は、<a href="https://github.com/qaware/go-offline-maven-plugin">go-offline-maven-plugin</a> の使用を検討してください。
</div>

その後、`mvn package` によって実際のテストが実行されます。テストが正常に終了した場合は、アプリケーションソースとすべての依存関係を含む "uberjar" ファイルが作成されます。

続けて、CircleCI ダッシュボードにテストメタデータを表示できるように、`store_test_results` が `target/surefire-reports` ディレクトリからテストメタデータを取得してアップロードします。

最後に `store_artifacts` ステップを使用して、uberjar を[アーティファクト](https://circleci.com/docs/ja/2.0/artifacts/)として保存します。 そこから、これを目的の継続的デプロイスキームに結び付けることができます。

{% raw %}

```yaml
...
    steps:

      - checkout

      - restore_cache:
          key: circleci-demo-java-spring-{{ checksum "pom.xml" }}

      - run: mvn dependency:go-offline

      - save_cache:
          paths:
            - ~/.m2
          key: circleci-demo-java-spring-{{ checksum "pom.xml" }}

      - run: mvn package

      - store_test_results:
          path: target/surefire-reports

      - store_artifacts:
          path: target/demo-java-spring-0.0.1-SNAPSHOT.jar
```

{% endraw %}

完了です。 Maven と Spring を使用する Java アプリケーション用に CircleCI を設定できました。

## 関連項目

{:.no_toc}

- デプロイターゲットの設定例については、「[デプロイの設定]({{ site.baseurl }}/ja/2.0/deployment-integrations/)」を参照してください。
- Java のメモリの問題に対処する方法については、「[Java メモリエラーの回避とデバッグ]({{ site.baseurl }}/ja/2.0/java-oom/)」を参照してください。
