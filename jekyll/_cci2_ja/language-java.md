---
layout: classic-docs
title: "言語ガイド: Java"
short-title: "Java"
description: "CircleCI での Java を使用したビルドとテスト"
categories:
  - language-guides
order: 4
version:
  - クラウド
  - Server v4.x
  - Server v3.x
  - Services VM
---

このガイドでは、CircleCI で Gradle を使用して Java アプリケーションをビルドする方法について説明します。

* 目次
{:toc}

## 概要
{: #overview }
{:.no_toc}

お急ぎの場合は、後述の設定ファイルの例をプロジェクトのルート ディレクトリにある [`.circleci/config.yml`]({{ site.baseurl }}/ja/configuration-reference/) に貼り付け、ビルドを開始してください。

ここでは、以下を前提としています。

* [Gradle](https://gradle.org/) を使用している。 [Maven](https://maven.apache.org/) 版のガイドは[こちら]({{site.baseurl}}/ja/language-java-maven/)。
* Java 11 を使用している。
* Spring Framework を使用している。  (このプロジェクトは [Spring Initializr](https://start.spring.io/) を使用して生成されています)
* アプリケーションをオールインワン uberjar として配布できる。


## 設定ファイルの例
{: #sample-configuration }

{% raw %}
```yaml
version: 2
jobs: # a collection of steps
  build:
    # Remove if parallelism is not desired
    parallelism: 2
    environment:
      # Configure the JVM and Gradle to avoid OOM errors
      _JAVA_OPTIONS: "-Xmx3g"
      GRADLE_OPTS: "-Dorg.gradle.daemon=false -Dorg.gradle.workers.max=2"
    docker: # run the steps with Docker
      - image: cimg/openjdk:17.0.1 # ...with this image as the primary container; this is where all `steps` will run
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: cimg/postgres:14.0
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          POSTGRES_USER: postgres
          POSTGRES_DB: circle_test
    steps: # a collection of executable commands
      - checkout # check out source code to working directory
      # Read about caching dependencies: https://circleci.com/docs/caching/
      - restore_cache:
          key: v1-gradle-wrapper-{{ checksum "gradle/wrapper/gradle-wrapper.properties" }}
      - restore_cache:
          key: v1-gradle-cache-{{ checksum "build.gradle" }}
      - run:
          name: Run tests in parallel # See: https://circleci.com/docs/parallelism-faster-jobs/
          # Use "./gradlew test" instead if tests are not run in parallel
          command: |
            cd src/test/java
            # Get list of classnames of tests that should run on this node
            CLASSNAMES=$(circleci tests glob "**/*.java" \
              | cut -c 1- | sed 's@/@.@g' \
              | sed 's/.\{5\}$//' \
              | circleci tests split --split-by=timings --timings-type=classname)
            cd ../../..
            # Format the arguments to "./gradlew test"
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
      # Upload test results for display in Test Summary: https://circleci.com/docs/collect-test-data/
          path: build/test-results/test
      - store_artifacts: # Upload test results for display in Artifacts: https://circleci.com/docs/artifacts/
          path: build/test-results/test
      - run:
          name: Assemble JAR
          command: |
            # Skip this for other nodes
            if [ "$CIRCLE_NODE_INDEX" == 0 ]; then
              ./gradlew assemble
            fi
      # As the JAR was only assembled in the first build container, build/libs will be empty in all the other build containers.
      - store_artifacts:
          path: build/libs
      # See https:circleci/docs/deployment-overview#next-steps document for links to target configuration examples
workflows:
  version: 2
  workflow:
    jobs:
    - build
```
{% endraw %}

## コードの取得
{: #get-the-code }

このデモ アプリケーションには、<https://github.com/CircleCI-Public/circleci-demo-java-spring> からアクセスできます。

ご自身でコード全体を確認する場合は、GitHub でプロジェクトをフォークし、ローカル マシンにダウンロードします。 CircleCI の[プロジェクトダッシュボード](https://app.circleci.com/projects/){:rel="nofollow"}に行き、プロジェクトの隣にある **[Follow Project (プロジェクトをフォローする)]** ボタンをクリックします。 最後に `.circleci/config.yml` の内容をすべて削除します。

これで `config.yml`を最初から作る準備ができました。

## 設定ファイルの詳細
{: #config-walkthrough }

必ずバージョンの指定から始めます。

```yaml
version: 2
```

次に、`jobs` キーを記述します。 1 つひとつのジョブが、ビルド、テスト、デプロイのプロセス内の各段階を表します。 このサンプル アプリケーションでは 1 つの `build` ジョブのみが必要なので、他の要素はそのキーの下に置きます。

```yaml
version: 2
jobs:
  build:
    # Remove if parallelism is not desired
    parallelism: 2
    environment:
      # Configure the JVM and Gradle to avoid OOM errors
      _JAVA_OPTIONS: "-Xmx3g"
      GRADLE_OPTS: "-Dorg.gradle.daemon=false -Dorg.gradle.workers.max=2"
```

テストを[並列に実行]({{site.baseurl}}/ja/parallelism-faster-jobs/)してジョブを高速化するために、オプションの `parallelism` 値を 2 に指定しています。

また、`environment` キーを使用して、[OOM エラーを回避](https://circleci.com/blog/how-to-handle-java-oom-errors/)するように JVM と Gradle を設定しています。 Gradleプロセスが終了した後に終了させるため、Gradle デーモンを無効にします。 これにより、メモリを節約し、OOMエラーの発生を抑えることができます。

```yaml
version: 2
...
    docker:
      - image: cimg/openjdk:17.0.1
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
      - image: cimg/postgres:14.0
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          POSTGRES_USER: postgres
          POSTGRES_DB: circle_test
```

バージョン `11.0.3-jdk-stretch` のタグが付いた [CircleCI OpenJDK イメージ](https://hub.docker.com/r/circleci/openjdk/)を使用します。

この `build` ジョブ内にいくつかの `steps` を追加します。

コードベースで作業できるように、最初に `checkout` を置きます。

次に、Gradle ラッパーと依存関係のキャッシュをプル ダウンします (存在する場合)。 初回実行時、または `gradle/wrapper/gradle-wrapper.properties` と `build.gradle` を変更した場合、これは実行されません。


**ヒント:** プロジェクトに `build.gradle` ファイルが複数存在する場合、依存関係のキャッシュが完全には機能しない可能性があります。 その場合は、すべての `build.gradle` ファイルの内容に基づいてチェックサムを計算し、それをキャッシュ キーに組み込むことを検討してください。
{: class="alert alert-info"}

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

 追加の引数を使用して `./gradlew test` を実行します。これにより、キャッシュが空だった場合、Gradle やプロジェクトの依存関係がプル ダウンされ、テストのサブセットが各ビルド コンテナで実行されます。 各並列ビルド コンテナで実行されるテストのサブセットは、組み込みの [`circleci tests split`](https://circleci.com/docs/ja/parallelism-faster-jobs/#circleci-cli-を使用したテストの分割) コマンドを使用して決定されます。

 {% raw %}
```yaml
...
    steps:
      - run:
          name: Run tests in parallel # See: https://circleci.com/docs/parallelism-faster-jobs/
          # Use "./gradlew test" instead if tests are not run in parallel
          command: |
            cd src/test/java
            # Get list of classnames of tests that should run on this node
            CLASSNAMES=$(circleci tests glob "**/*.java" \
              | cut -c 1- | sed 's@/@.@g' \
              | sed 's/.\{5\}$//' \
              | circleci tests split --split-by=timings --timings-type=classname)
            cd ../../..
            # Format the arguments to "./gradlew test"
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
```
{% endraw %}

`./gradlew assemble` コマンドを使用して、"uberjar" ファイルを作成します。このファイルには、コンパイルされたアプリケーションと共にそのアプリケーションのすべての依存関係が含まれます。 uberjar のコピーは 1 つだけあればよいので、これは、並列に実行しているすべてのビルド コンテナではなく最初のビルド コンテナでだけ実行されます。

その後、`store_artifacts` ステップを使用して、uberjar を[アーティファクト]({{site.baseurl}}/ja/artifacts/)として保存します。 そこから、これを目的の継続的デプロイ スキームに結び付けることができます。

{% raw %}
```yaml
...
      - run:
          name: Assemble JAR
          command: |
            # Skip this for other nodes
            if [ "$CIRCLE_NODE_INDEX" == 0 ]; then
              ./gradlew assemble
            fi
      # As the JAR was only assembled in the first build container, build/libs will be empty in all the other build containers.
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
{: #see-also }
{:.no_toc}

- [デプロイの概要]({{site.baseurl}}/ja/deployment-overview#next-steps/)に、さまざまなターゲットの設定例へのリンクを掲載しています。
- Java のメモリに関する問題への対処について、詳しくは [Java OOM のデバッグ]({{site.baseurl}}/java-oom/) を参照して下さい。
