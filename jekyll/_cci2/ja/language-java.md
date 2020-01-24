---
layout: classic-docs
title: "言語ガイド: Java"
short-title: "Java"
description: "CircleCI 2.0 での Java を使用したビルドとテスト"
categories:
  - language-guides
order: 4
---

このガイドでは、CircleCI で Gradle を使用して Java アプリケーションをビルドする方法について説明します。

- 目次
{:toc}

## 概要
{:.no_toc}

お急ぎの場合は、後述の設定ファイルの例をプロジェクトのルート ディレクトリにある [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) に貼り付け、ビルドを開始してください。

ここでは、以下を前提としています。

- [Gradle](https://gradle.org/) を使用している ([Maven](https://maven.apache.org/) 版のガイドは[こちら](https://circleci.com/ja/docs/2.0/language-java-maven/))
- Java 11 を使用している 
- Spring Framework を使用している (このプロジェクトは [Spring Initializr](https://start.spring.io/) を使用して生成されています) 
- アプリケーションをオールインワン uberjar として配布できる

## 設定ファイルの例

{% raw %}
```yaml
version: 2 # CircleCI 2.0 を使用します
jobs: # 一連のステップ
  build:
    # 並列処理が必要ない場合は削除します
    parallelism: 2
    environment:
      # OOM (メモリ不足) エラーを回避するように JVM と Gradle を構成します
      _JAVA_OPTIONS: "-Xmx3g"
      GRADLE_OPTS: "-Dorg.gradle.daemon=false -Dorg.gradle.workers.max=2"
    docker: # Docker でステップを実行します

      - image: circleci/openjdk:11.0.3-jdk-stretch # このイメージをすべての `steps` が実行されるプライマリ コンテナとして使用します
      - image: circleci/postgres:12-alpine
        environment:
          POSTGRES_USER: postgres
          POSTGRES_DB: circle_test
    steps: # 実行可能コマンドの集合
      - checkout # ソース コードを作業ディレクトリにチェックアウトします
      # 依存関係キャッシュについては https://circleci.com/ja/docs/2.0/caching/ をお読みください
      - restore_cache:
          key: v1-gradle-wrapper-{{ checksum "gradle/wrapper/gradle-wrapper.properties" }}
      - restore_cache:
          key: v1-gradle-cache-{{ checksum "build.gradle" }}
      - run:
          name: テストの並列実行 # https://circleci.com/ja/docs/2.0/parallelism-faster-jobs/ を参照してください
          # テストを並列に実行しない場合は、代わりに「./gradlew test」を使用します
          command: |
            cd src/test/java
            # このノードで実行する必要があるテストのクラス名のリストを取得します
            CLASSNAMES=$(circleci tests glob "**/*.java" \
              | cut -c 1- | sed 's@/@.@g' \
              | sed 's/.\{5\}$//' \
              | circleci tests split --split-by=timings --timings-type=classname)
            cd ../../..
            # 引数を「./gradlew test」にフォーマットします
            GRADLE_ARGS=$(echo $CLASSNAMES | awk '{for (i=1; i<=NF; i++) print "--tests",$i}')
            echo "Prepared arguments for Gradle: $GRADLE_ARGS"
            ./gradlew test $GRADLE_ARGS
      - save_cache:
          paths:
            - ~/.gradle/wrapper
          key: v1-gradle-wrapper-{{ checksum "gradle/wrapper/gradle-wrapper.properties" }}
      - save_cache:
          paths:
            - ~/.gradle/caches
          key: v1-gradle-cache-{{ checksum "build.gradle" }}
      - store_test_results:
      # テスト サマリー (https://circleci.com/ja/docs/2.0/collect-test-data/) に表示するテスト結果をアップロードします
          path: build/test-results/test
      - store_artifacts: # アーティファクト (https://circleci.com/ja/docs/2.0/artifacts/) に表示するテスト結果をアップロードします
          path: build/test-results/test
          when: always
      - run:
          name: JAR の収集
          command: |
            # 他のノードでは以下をスキップします
            if [ "$CIRCLE_NODE_INDEX" == 0 ]; then
              ./gradlew assemble
            fi
      # JAR は最初のビルド コンテナでのみ収集されるため、他のすべてのビルド コンテナでは build/libs が空になります
      - store_artifacts:
          path: build/libs
      # デプロイ例については https://circleci.com/ja/docs/2.0/deployment-integrations/ を参照してください
workflows:
  version: 2
  workflow:
    jobs:
    - build 
```
{% endraw %}

## コードの取得

上記は Java デモ アプリケーションの設定ファイルの抜粋です。このデモ アプリケーションには、<https://github.com/CircleCI-Public/circleci-demo-java-spring> からアクセスできます。

ご自身でコード全体を確認する場合は、GitHub でプロジェクトをフォークし、ローカル マシンにダウンロードします。 CircleCI で [[Add Projects (プロジェクトの追加)](https://circleci.com/add-projects){:rel="nofollow"}] ページにアクセスし、プロジェクトの横にある [Build Project (プロジェクトのビルド)] ボタンをクリックします。 最後に `.circleci/config.yml` の内容をすべて削除します。

これで `config.yml` を最初からビルドする準備ができました。

## 設定ファイルの詳細

常にバージョンの指定から始めます。

```yaml
version: 2
```

次に、`jobs` キーを記述します。 1 つひとつのジョブが、ビルド、テスト、デプロイのプロセス内の各段階を表します。 このサンプル アプリケーションでは 1 つの `build` ジョブのみが必要なので、他の要素はそのキーの下に置きます。

```yaml
version: 2
jobs:
  build:
    # 並列処理が必要ない場合は削除します
    parallelism: 2
    environment:
      # OOM (メモリ不足) エラーを回避するように JVM と Gradle を構成します
      _JAVA_OPTIONS: "-Xmx3g"
      GRADLE_OPTS: "-Dorg.gradle.daemon=false -Dorg.gradle.workers.max=2"
```

テストを[並列に実行](https://circleci.com/ja/docs/2.0/parallelism-faster-jobs/)してジョブを高速化するために、オプションの `parallelism` 値を 2 に指定しています。

また、`environment` キーを使用して、[OOM エラーを回避](https://circleci.com/blog/how-to-handle-java-oom-errors/)するように JVM と Gradle を構成しています。

```yaml
version: 2
...
    docker:
      - image: circleci/openjdk:11.0.3-jdk-stretch
      - image: circleci/postgres:12-alpine
        environment:
          POSTGRES_USER: postgres
          POSTGRES_DB: circle_test
```

バージョン `11.0.3-jdk-stretch` のタグが付いた [CircleCI OpenJDK コンビニエンス イメージ](https://hub.docker.com/r/circleci/openjdk/)を使用します。

この `build` ジョブ内にいくつかの `steps` を追加します。

コードベースで作業できるように、最初に `checkout` を置きます。

次に、Gradle ラッパーと依存関係のキャッシュをプル ダウンします (存在する場合)。 初回実行時、または `gradle/wrapper/gradle-wrapper.properties` と `build.gradle` を変更した場合、これは実行されません。

<div class="alert alert-info" role="alert">
  <strong>ヒント:</strong> プロジェクトに `build.gradle` ファイルが複数存在する場合、依存関係のキャッシュが完全には機能しない可能性があります。 その場合は、すべての `build.gradle` ファイルの内容に基づいてチェックサムを計算し、それをキャッシュ キーに組み込むことを検討してください。
</div>

{% raw %}
```yaml
...
    steps:

      - checkout
      - restore_cache:
          key: v1-gradle-wrapper-{{ checksum "gradle/wrapper/gradle-wrapper.properties" }}
      - restore_cache:
          key: v1-gradle-cache-{{ checksum "build.gradle" }}
```
{% endraw %}

 追加の引数を使用して `./gradlew test` を実行します。これにより、キャッシュが空だった場合、Gradle やプロジェクトの依存関係がプル ダウンされ、テストのサブセットが各ビルド コンテナで実行されます。 各並列ビルド コンテナで実行されるテストのサブセットは、組み込みの [`circleci tests split`](https://circleci.com/ja/docs/2.0/parallelism-faster-jobs/#circleci-cli-を使用したテストの分割) コマンドを使用して決定されます。

 {% raw %}
```yaml
...
    steps:

      - run:
          name: Run tests in parallel # https://circleci.com/ja/docs/2.0/parallelism-faster-jobs/ を参照してください
          # テストを並列に実行しない場合は、代わりに「./gradlew test」を使用します
          command: |
            cd src/test/java
            # このノードで実行する必要があるテストのクラス名のリストを取得します
            CLASSNAMES=$(circleci tests glob "**/*.java" \
              | cut -c 1- | sed 's@/@.@g' \
              | sed 's/.\{5\}$//' \
              | circleci tests split --split-by=timings --timings-type=classname)
            cd ../../..
            # 引数を「./gradlew test」にフォーマットします
            GRADLE_ARGS=$(echo $CLASSNAMES | awk '{for (i=1; i<=NF; i++) print "--tests",$i}')
            echo "Prepared arguments for Gradle: $GRADLE_ARGS"
            ./gradlew test $GRADLE_ARGS
```
{% endraw %}

次回の処理を高速化するために、`save_cache` ステップを使用して Gradle ラッパーと依存関係を保存します。

{% raw %}
```yaml
...

      - save_cache:
          paths:
            - ~/.gradle/wrapper
          key: v1-gradle-wrapper-{{ checksum "gradle/wrapper/gradle-wrapper.properties" }}
      - save_cache:
          paths:
            - ~/.gradle/caches
          key: v1-gradle-cache-{{ checksum "build.gradle" }}
```
{% endraw %}


続けて、CircleCI ダッシュボードにテスト メタデータを表示できるように、`store_test_results` が `build/test-results/test` ディレクトリから JUnit テスト メタデータを取得してアップロードします。 また、テスト メタデータを調べる必要がある場合は、`store_artifacts` を介してテスト メタデータをアーティファクトとしてアップロードします。


{% raw %}
```yaml
...

      - store_test_results:
          path: build/test-results/test
      - store_artifacts:
          path: build/test-results/test
          when: always
```
{% endraw %}

`./gradlew assemble` コマンドを使用して、"uberjar" ファイルを作成します。このファイルには、コンパイルされたアプリケーションと共にそのアプリケーションのすべての依存関係が含まれます。 uberjar のコピーは 1 つだけあればよいので、これは、並列に実行しているすべてのビルド コンテナではなく最初のビルド コンテナでだけ実行されます。

その後、`store_artifacts` ステップを使用して、uberjar を[アーティファクト](https://circleci.com/docs/ja/2.0/artifacts/)として保存します。 そこから、これを目的の継続的デプロイ スキームに結び付けることができます。

{% raw %}
```yaml
...

      - run:
          name: Assemble JAR
          command: |
            # 他のノードでは以下をスキップします
            if [ "$CIRCLE_NODE_INDEX" == 0 ]; then
              ./gradlew assemble
            fi
      # JAR は最初のビルド コンテナでのみ収集されるため、他のすべてのビルド コンテナでは build/libs が空になります
      - store_artifacts:
          path: build/libs
```
{% endraw %}

最後に、ワークフロー内の唯一のジョブとして `build` ジョブによって実行される `workflow` というワークフローを定義します。

{% raw %}
```yaml
...
workflows:
  version: 2
  workflow:
    jobs:

    - build
```
{% endraw %}

完了です。 これで Gradle と Spring を使用する Java アプリケーション用に CircleCI をセットアップできました。

## 関連項目
{:.no_toc}

- デプロイ ターゲットの構成例については、「[デプロイの構成]({{ site.baseurl }}/2.0/deployment-integrations/)」を参照してください。
- Java のメモリの問題に対処する方法については、「[Java メモリ エラーの回避とデバッグ]({{ site.baseurl }}/2.0/java-oom/)」を参照してください。