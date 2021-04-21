---
layout: classic-docs
title: "言語ガイド: Java (Maven を使用)"
short-title: "Maven を使用した Java プロジェクト"
description: "CircleCI 2.0 での Java と Maven を使用したビルドとテスト"
categories:
  - language-guides
order: 4
---

このガイドでは、CircleCI で Maven を使用して Java アプリケーションをビルドする方法について説明します。

* 目次
{:toc}

## 概要
{:.no_toc}

お急ぎの場合は、以下の設定ファイルの例をプロジェクトのルート ディレクトリにある [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) に貼り付け、ビルドを開始してください。

このガイドでは、以下を前提としています。

* [Maven](https://maven.apache.org/) を使用している  ([Gradle](https://gradle.org/) 版のガイドは[こちら](https://circleci.com/ja/docs/2.0/language-java/))
* Java 8 を使用している
* Spring Framework を使用している  (このプロジェクトは [Spring Initializr](https://start.spring.io/) を使用して生成されています)
* アプリケーションをオールインワン uberjar として配布できる


## 設定ファイルの例

{% raw %}
```yaml
version: 2 # CircleCI 2.0 を使用します
jobs: # 一連のステップ
  build: # ワークフローを使用しない実行では、エントリポイントとして `build` ジョブが必要です

    working_directory: ~/circleci-demo-java-spring # ステップを実行するディレクトリ

    docker: # Docker でステップを実行します
      - image: circleci/openjdk:8-jdk-stretch # このイメージをプライマリ コンテナとし、そこですべての `steps` を実行します

    steps: # 一連の実行可能コマンド

      - checkout # ソース コードを作業ディレクトリにチェックアウトします

      - restore_cache: # 初回実行後、または `pom.xml` を変更した場合に、保存されているキャッシュを復元します
          # 依存関係のキャッシュについては https://circleci.com/ja/docs/2.0/caching/ をお読みください
          key: circleci-demo-java-spring-{{ checksum "pom.xml" }}

      - run: mvn dependency:go-offline # プロジェクトの依存関係を取得します

      - save_cache: # プロジェクトの依存関係を保存します
          paths:
            - ~/.m2
          key: circleci-demo-java-spring-{{ checksum "pom.xml" }}

      - run: mvn package # 実際のテストを実行します

      - store_test_results: # テスト メタデータを `target/surefire-reports` ディレクトリからアップロードし、CircleCI ダッシュボードに表示されるようにします 
      # アップロードしたテスト結果は、テスト サマリー (https://circleci.com/ja/docs/2.0/collect-test-data/) に表示されます
          path: target/surefire-reports

      - store_artifacts: # uberjar をアーティファクトとして保存します
      # アップロードしたテスト結果は、アーティファクト (https://circleci.com/ja/docs/2.0/artifacts/) に表示されます
          path: target/demo-java-spring-0.0.1-SNAPSHOT.jar
      # デプロイの構成例は https://circleci.com/ja/docs/2.0/deployment-integrations/ を参照してください    
```
{% endraw %}

## コードの入手

上記の設定ファイルは、Java デモ アプリケーションの一部です。このデモ アプリケーションには、リポジトリの `maven` ブランチである [https://github.com/CircleCI-Public/circleci-demo-java-spring/tree/maven](https://github.com/CircleCI-Public/circleci-demo-java-spring/tree/maven) からアクセスできます。

ご自身でコード全体を確認する場合は、GitHub でプロジェクトをフォークし、ローカル マシンにダウンロードします。 CircleCI の [[Add Projects (プロジェクトの追加)](https://circleci.com/add-projects){:rel="nofollow"}] ページにアクセスし、プロジェクトの横にある [Build Project (プロジェクトのビルド)] ボタンをクリックします。 最後に `.circleci/config.yml` の内容をすべて削除します。

これで `config.yml` を最初からビルドする準備ができました。

## 設定ファイルの詳細

必ずバージョンの指定から始めます。

```yaml
version: 2
```

次に、`jobs` キーを記述します。 1 つひとつのジョブが、ビルド、テスト、デプロイのプロセス内の各段階を表します。 このサンプル アプリケーションでは 1 つの `build` ジョブのみが必要なので、このキーの下に各要素を記述します。

ジョブでは、`working_directory` を指定します。 この例では、ホーム ディレクトリにあるプロジェクトから名前を付けます。

```yaml
version: 2
jobs:
  build:
    working_directory: ~/circleci-demo-java-spring
```

他のディレクトリを指定しない限り、以降の `job` ではこのパスがデフォルトの作業ディレクトリとなります。

`working_directory` の直下の `docker` キーで、コンテナ イメージを指定できます。

```yaml
version: 2
...
    docker:
      - image: circleci/openjdk:8-jdk-stretch
```

バージョン `8-jdk-stretch` のタグが付いた [CircleCI OpenJDK コンビニエンス イメージ](https://hub.docker.com/r/circleci/openjdk/)を使用します。

次に、`build` ジョブ内にいくつかの `steps` を追加します。

コードベースで作業できるように、最初に `checkout` を記述します。

次に、キャッシュをプルダウンします (存在する場合)。 初回実行時、または `pom.xml` を変更した場合、この処理は実行されません。 さらに `mvn dependency:go-offline` を実行して、プロジェクトの依存関係をプルダウンします。 これで、依存関係を保存する `save_cache` ステップを挿入して、次回の処理を高速化することができます。

<div class="alert alert-info" role="alert">
  <strong>ヒント:</strong> マルチ モジュール プロジェクトをビルドしている場合、<code class="highlighter-rouge">mvn dependency:go-offline</code> が機能しない場合があります。 その場合は、<a href="https://github.com/qaware/go-offline-maven-plugin">go-offline-maven-plugin</a> の使用を検討してください。
</div>

次に、`mvn package` で実際のテストを実行します。テストが正常に終了した場合は、アプリケーション ソースとすべての依存関係を含む "uberjar" ファイルが作成されます。

続けて、CircleCI ダッシュボードにテスト メタデータを表示できるように、`store_test_results` ステップで `target/surefire-reports` ディレクトリからテスト メタデータを取得してアップロードします。

最後に　`store_artifacts` ステップで、uberjar を[アーティファクト](https://circleci.com/ja/docs/2.0/artifacts/)として保存します。 以降の部分は、任意の継続的デプロイ スキームにつなげて構成します。

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

完了です。 これで、Maven と Spring を使用する Java アプリケーション用に CircleCI を構成できました。

## 関連項目
{:.no_toc}

- デプロイ ターゲットの構成例については、「[デプロイの構成]({{ site.baseurl }}/2.0/deployment-integrations/)」を参照してください。
- Java のメモリの問題に対処する方法については、「[Java メモリ エラーの回避とデバッグ]({{ site.baseurl }}/2.0/java-oom/)」を参照してください。
