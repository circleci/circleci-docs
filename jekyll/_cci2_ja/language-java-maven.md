---
layout: classic-docs
title: "言語ガイド: Java (Maven を使用)"
short-title: "Maven を使用した Java プロジェクト"
description: "CircleCI での Java と Maven を使用したビルドとテスト"
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

このビルドは最初は依存関係のキャッシュは行わずに実行され、2 分 14 秒かかりました。 依存関係が復元されると、ビルド時間は 39 秒になりました。

この `restore_cache` ステップでは、最初にマッチしたキャッシュを復元します。 復元キーをフォールバックとして追加できます。 この場合、 `pom.xml` が変更されても、以前のキャッシュを復元することができます。 つまり、ジョブは新しい `pom.xml` と以前のキャッシュの間で変更された依存関係のみをフェッチすれば良いのです。

### ワークスーペースへのビルドアーティファクトの維持
{: #persisting-build-artifacts-to-workspace }

下記サンプル設定ファイルで、ワークスペースにビルドアーティファクトを維持する方法の詳細をご確認ください。

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

この `persist_to_workspace` ステップにより、ワークフローのダウンストリームジョブで使用するファイルやディレクトリを維持することができます。 この場合、ビルドステップによって生成されたターゲットディレクトリは、テストステップで使用するために維持されます。

### 並列コンテナ間でテストを分割する
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

タイミングに基づいたテスト分割は、時間のかかるテストを複数の並列コンテナに分ける優れた方法です。 タイミングに基づいたテスト分割には以下の4 つが必要です。

1. 分割するテストのリスト
2. コマンド: `circleci tests split --split-by=timings`
3. テストを実行するコンテナ
4. テストの分割方法をインテリジェントに決定するための履歴データ

分割するテストのリストの収集には、 `circleci tests glob "src/test/**/**.java"` コマンドを使ってすべての Java テストを抽出します。 次に、`sed` と `tr` を使って、この新しい行で区切られたテストファイルのリストを、テストクラスのカンマ区切りリストに変換します。

`store_test_results` を追加すると、CircleCI はこれらのテストの過去の実行におけるタイミングデータ履歴にアクセスできるようになり、全体の実行時間が最速になるようにテストを分割する方法を把握することができます。

### コードカバレッジアーティファクトの保存
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

[JaCoCo](https://www.eclemma.org/jacoco/) プラグインを使った Maven テストランナーでは、ビルドの間にコードカバレッジレポートを生成します。 このレポートをビルドアーティファクトとして保存するには、`store_artifacts` ステップを使用します。

### 設定ファイル
{: #a-configuration }

下記のコードサンプルは、上記の機能を組み合わせた全体の設定ファイルです。


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

このデモ アプリケーションには、リポジトリの `maven` ブランチである [https://github.com/CircleCI-Public/circleci-demo-java-spring/tree/maven](https://github.com/CircleCI-Public/circleci-demo-java-spring/tree/maven) からアクセスできます。 ご自身でコード全体を確認する場合は、GitHub でプロジェクトをフォークし、ローカル マシンにダウンロードします。 CircleCI の [[Add Projects (プロジェクトの追加)](https://circleci.com/add-projects){:rel="nofollow"}] ページにアクセスし、プロジェクトの横にある [Build Project (プロジェクトのビルド)] ボタンをクリックします。 最後に `.circleci/config.yml` の内容をすべて削除します。 完了です。 これで、Maven と Spring を使用する Java アプリケーション用に CircleCI を設定できました。

## 設定ファイルの詳細
{: #see-also }

- [Maven](https://maven.apache.org/) を使用している  ([Gradle](https://gradle.org/) 版のガイドは[こちら](https://circleci.com/ja/docs/2.0/language-java/))
- Java 8 を使用している
