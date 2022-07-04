---
layout: classic-docs
title: "言語ガイド: Java (Maven を使用)"
short-title: "Maven を使用した Java プロジェクト"
description: "CircleCI  での Java と Maven を使用したビルドとテスト"
categories:
  - language-guides
order: 4
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

このガイドでは、CircleCI で Maven を使用して Java アプリケーションをビルドする方法について説明します。

* 目次
{:toc}

## 概要
{: #overview }

下記サンプルアプリケーションを使って CircleCI 2.1 で Java アプリを実行する方法を説明します。 このアプリケーションでは、[Spring PetClinic のサンプルプロジェクト](https://projects.spring.io/spring-petclinic/)を使用します。 このドキュメントには、ワークスペース、依存関係のキャッシュ、並列実行などの CircleCI のさまざまな機能を示すサンプル設定ファイルの一部が含まれています。

## サンプル設定ファイル: バージョン2.1
{: #sample-configuration-version-21 }

### Orb を使った基本的なビルド
{: #a-basic-build-with-an-orb }

```yaml
version: 2.1

orbs:
  maven: circleci/maven@0.0.12

workflows:
  maven_test:
    jobs:
      - maven/test # checkout, build, test, and upload test results
```


この設定ファイルでは、言語固有の Orb を使って利用可能な Executor、ビルドツール、コマンドを置き換えています。 ここでは Maven を使った Java プロジェクトのビルドとテストを簡易化する [Maven Orb](https://circleci.com/developer/orbs/orb/circleci/maven) を使用しています。 maven/test コマンドにより、コード、ビルド、テスト、テスト結果のアップロードのチェックアウトを行います。 このコマンドのパラメーターはカスタマイズ可能です。 詳細は、Maven Orb ドキュメントをご覧ください。

## バージョン 2.0 の設定 (CircleCI Server v2.x ユーザーにのみ推奨)
{: #for-20-configuration-recommended-for-circleci-server-v2-x-users-only }

```yaml
version: 2.0

jobs:
  build:
    docker:
      - image: cimg/openjdk:17.0.1
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run: ./mvnw package
```

ワークフローを含まない バージョン 2.0 の設定ファイルは `build` という名前のジョブを探します。 ジョブは、クリーンな実行環境で実行される一連のコマンドです。 ジョブには Executor とステップという 2 つの主要部分があります。 このサンプルでは Docker Executor を使い、CircleCI イメージでパスしています。

### ワークフローを使ったビルドとテスト
{: #using-a-workflow-to-build-then-test }

ワークフローとは、ジョブの依存関係を示すグラフです。 このベーシックなワークフローではビルドジョブの後にテストジョブを実行します。 テストジョブはビルドジョブが成功して終了しない限り実行されません。

```yaml
version: 2.0

jobs:
  test:
    docker:
      - image: cimg/openjdk:17.0.1
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run: ./mvnw test

  build:
    docker:
      - image: cimg/openjdk:17.0.1
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run: ./mvnw -Dmaven.test.skip=true package

workflows:
  version: 2

  build-then-test:
    jobs:
      - build
      - test:
          requires:
            - build
```

### 依存関係のキャッシュ
{: #caching-dependencies }

下記のコードサンプルで**キャッシュ**の使用に関する詳細をご確認ください。

{% raw %}
```yaml
version: 2.0

jobs:
  build:
    docker:
      - image: cimg/openjdk:17.0.1
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - restore_cache:
          keys:
            - v1-dependencies-{{ checksum "pom.xml" }} # appends cache key with a hash of pom.xml file
            - v1-dependencies- # fallback in case previous cache key is not found
      - run: ./mvnw -Dmaven.test.skip=true package
      - save_cache:
            paths:
              - ~/.m2
            key: v1-dependencies-{{ checksum "pom.xml" }}
```
{% endraw %}

The first time this build ran without any dependencies cached, it took 2m14s. Once the dependencies were restored, the build took 39 seconds.

Note that the `restore_cache` step will restore whichever cache it first matches. You can add a restore key here as a fallback. In this case, even if `pom.xml` changes, you can still restore the previous cache. This means the job will only have to fetch the dependencies that have changed between the new `pom.xml` and the previous cache.

### Persisting build artifacts to workspace
{: #persisting-build-artifacts-to-workspace }

The following configuration sample details persisting a build artifact to a workspace.

```yaml
version: 2.0

jobs:
  build:
    docker:
      - image: cimg/openjdk:17.0.1
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run: ./mvnw -Dmaven.test.skip=true package
      - persist_to_workspace:
         root: ./
         paths:
           - target/

  test:
    docker:
      - image: cimg/openjdk:17.0.1
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - attach_workspace:
          at: ./target
      - run: ./mvnw test

workflows:
  version: 2

  build-then-test:
    jobs:
      - build
      - test:
          requires:
            - build
```

This `persist_to_workspace` step allows you to persist files or directories to be used by downstream jobs in the workflow. In this case, the target directory produced by the build step is persisted for use by the test step.

### Splitting tests across parallel containers
{: #splitting-tests-across-parallel-containers }


{% raw %}
```yaml
version: 2.0

jobs:
  test:
    parallelism: 2 # parallel containers to split the tests among
    docker:
      - image: cimg/openjdk:17.0
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run: |
          ./mvnw \
          -Dtest=$(for file in $(circleci tests glob "src/test/**/**.java" \
          | circleci tests split --split-by=timings); \
          do basename $file \
          | sed -e "s/.java/,/"; \
          done | tr -d '\r\n') \
          -e test
      - store_test_results: # We use this timing data to optimize the future runs
          path: target/surefire-reports

  build:
    docker:
      - image: cimg/openjdk:17.0.1
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run: ./mvnw -Dmaven.test.skip=true package

workflows:
  version: 2

  build-then-test:
    jobs:
      - build
      - test:
          requires:
            - build
```

{% endraw %}

Splitting tests by timings is a great way to divide time-consuming tests across multiple parallel containers. You might think of splitting by timings as requiring 4 parts:

1. a list of tests to split
2. the command: `circleci tests split --split-by=timings`
3. containers to run the tests
4. historical data to intelligently decide how to split tests

To collect the list of tests to split, simply pull out all of the Java test files with this command: `circleci tests glob "src/test/**/**.java"`. Then use `sed` and `tr` to translate this newline-separated list of test files into a comma-separated list of test classes.

Adding `store_test_results` enables CircleCI to access the historical timing data for previous executions of these tests, so the platform knows how to split tests to achieve the fastest overall runtime.

### Storing code coverage artifacts
{: #storing-code-coverage-artifacts }

```yaml
version: 2.0

jobs:
  test:
    docker:
      - image: cimg/openjdk:17.0.1
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run: ./mvnw test verify
      - store_artifacts:
          path: target/site/jacoco/index.html

workflows:
  version: 2

  test-with-store-artifacts:
    jobs:
      - test
```

The Maven test runner with the [JaCoCo](https://www.eclemma.org/jacoco/) plugin generates a code coverage report during the build. To save that report as a build artifact, use the `store_artifacts` step.

### A configuration
{: #a-configuration }

The following code sample is the entirety of a configuration file combining the features described above.


{% raw %}

```yaml
version: 2.0

jobs:
  test:
    parallelism: 2
    docker:
      - image: cimg/openjdk:17.0.1
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - restore_cache:
          keys:
            - v1-dependencies-{{ checksum "pom.xml" }}
            - v1-dependencies-
      - attach_workspace:
          at: ./target
      - run: |
            ./mvnw \
            -Dtest=$(for file in $(circleci tests glob "src/test/**/**.java" \
            | circleci tests split --split-by=timings); \
            do basename $file \
            | sed -e "s/.java/,/"; \
            done | tr -d '\r\n') \
            -e test verify
      - store_test_results:
          path: target/surefire-reports
      - store_artifacts:
          path: target/site/jacoco/index.html

  build:
    docker:
      - image: cimg/openjdk:17.0.1
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - restore_cache:
          keys:
            - v1-dependencies-{{ checksum "pom.xml" }}
            - v1-dependencies-
      - run: ./mvnw -Dmaven.test.skip=true package
      - save_cache:
          paths:
            - ~/.m2
          key: v1-dependencies-{{ checksum "pom.xml" }}
      - persist_to_workspace:
         root: ./
         paths:
           - target/

workflows:
  version: 2

  build-then-test:
    jobs:
      - build
      - test:
          requires:
            - build
```
{% endraw %}

このデモ アプリケーションには、リポジトリの `maven` ブランチである [https://github.com/CircleCI-Public/circleci-demo-java-spring/tree/maven](https://github.com/CircleCI-Public/circleci-demo-java-spring/tree/maven) からアクセスできます。 ご自身でコード全体を確認する場合は、GitHub でプロジェクトをフォークし、ローカル マシンにダウンロードします。 CircleCI の [[Add Projects (プロジェクトの追加)](https://circleci.com/add-projects){:rel="nofollow"}] ページにアクセスし、プロジェクトの横にある [Build Project (プロジェクトのビルド)] ボタンをクリックします。 最後に `.circleci/config.yml` の内容をすべて削除します。 完了です。 これで、Maven と Spring を使用する Java アプリケーション用に CircleCI を構成できました。

## 設定ファイルの詳細
{: #see-also }

- [Maven](https://maven.apache.org/) を使用している  ([Gradle](https://gradle.org/) 版のガイドは[こちら](https://circleci.com/ja/docs/2.0/language-java/))
- Java 8 を使用している
