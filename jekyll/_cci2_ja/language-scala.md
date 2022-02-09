---
layout: classic-docs
title: "言語ガイド: Scala"
short-title: "言語ガイド: Scala"
description: "CircleCI 言語ガイド: Scala"
categories:
  - はじめよう
order: 1
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

以下のセクションに沿って、Scala アプリケーションの [`.circleci/config.yml`]({{site.baseurl}}/ja/2.0/configuration-reference/) の作成方法について説明します。

* 目次
{:toc}

## 概要
{: #overview }
{:.no_toc}

This document assumes that your [project’s AWS Permission settings]({{site.baseurl}}/2.0/deployment-integrations/#aws) are configured with valid AWS keys that are permitted to read and write to an S3 bucket. このドキュメントの例では、指定された S3 バケットにビルド パッケージがアップロードされます。

## Scala サンプル プロジェクトのソース コード
{: #sample-scala-project-source-code }

このサンプル アプリケーションのソース コードは、[samplescala の GitHub パブリック リポジトリ](https://github.com/ariv3ra/samplescala)にあります。

## 前提条件
{: #prerequisites }

CircleCI では、リポジトリの root に新しいディレクトリを作成し、そのディレクトリ内に YAML ファイルを作成する必要があります。 これらの新しいアセットの名前は、ディレクトリが `.circleci/`、ファイルが `config.yml` と、命名スキーマに従って指定する必要があります。

```
mkdir .circleci/
touch .circleci/config.yml
```

最初のコマンドは `.circleci` という名前のディレクトリを作成し、次のコマンドは `.circleci` ディレクトリの中に `config.yml` という名前の新しいファイルを作成します。  繰り返しますが、.circleci というディレクトリ名と config.yml というファイル名を**使用する必要があります**。  バージョン 2.0 の前提条件については、[こちらのドキュメント]({{site.baseurl}}/2.0/migrating-from-1-2/)を参照してください。

### Scala の config.yml ファイル
{: #scala-configyml-file }

To get started, open the newly created `config.yml` in your favorite text editor and paste the following CircleCI schema into the file. 以下に、2.0 構成の全文を示します。

```yaml
version: 2
jobs:
  build:
    working_directory: ~/samplescala
    docker:
      - image: openjdk:8
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    environment:
      SBT_VERSION: 1.0.4
    steps:
      - run: echo 'export ARTIFACT_BUILD=$CIRCLE_PROJECT_REPONAME-$CIRCLE_BUILD_NUM.zip' >> $BASH_ENV
      - run:
          name: Get sbt binary
          command: |
                    apt update && apt install -y curl
                    curl -L -o sbt-$SBT_VERSION.deb https://dl.bintray.com/sbt/debian/sbt-$SBT_VERSION.deb
                    dpkg -i sbt-$SBT_VERSION.deb
                    rm sbt-$SBT_VERSION.deb
                    apt-get update
                    apt-get install -y python-pip git
                    pip install awscli
                    apt-get clean && apt-get autoclean
      - checkout
      - restore_cache:
          # Read about caching dependencies: https://circleci.com/docs/2.0/caching/
          key: sbt-cache
      - run:
          name: Compile samplescala dist package
          command: cat /dev/null | sbt clean update dist
      - store_artifacts: # for display in Artifacts: https://circleci.com/docs/2.0/artifacts/
          path: target/universal/samplescala.zip
          destination: samplescala
      - save_cache:
          key: sbt-cache
          paths:
            - "~/.ivy2/cache"
            - "~/.sbt"
            - "~/.m2"
      - run:
          command: |
              mv target/universal/samplescala.zip $CIRCLE_ARTIFACTS/$ARTIFACT_BUILD
              aws s3 cp $CIRCLE_ARTIFACTS/$ARTIFACT_BUILD s3://samplescala.blogs/builds/ --metadata {\"git_sha1\":\"$CIRCLE_SHA1\"}
```

## スキーマの詳細説明
{: #schema-walkthrough }

Every `config.yml` starts with the [`version`]({{site.baseurl}}/2.0/configuration-reference/#version) key. このキーは、互換性を損なう変更に関する警告を表示するために使用します。

```yaml
version: 2
```

スキーマの次のキーは jobs キーと build キーです。 これらのキーは必須で、実行時のデフォルトのエントリポイントを表します。 スキーマの残りの部分は build セクションに置かれ、ここでさまざまなコマンドが実行されます。 以下の説明を参照してください。

```yaml
version: 2
jobs:
  build:
    working_directory: ~/samplescala
    docker:
      - image: openjdk:8
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    environment:
      SBT_VERSION: 1.0.4
```

docker/image キーは、ビルドに使用する Docker イメージを表します。 この例では、[Docker Hub](https://hub.docker.com/_/openjdk/) にある公式の `openjdk:8` イメージを使用します。 これには、この Scala プロジェクトに必要なネイティブ Java コンパイラが含まれます。

environment/SBT_VERSION は、以降のコマンドでダウンロードする sbt のバージョンを指定する環境変数です。 これは Scala アプリケーションのコンパイルに必要です。

```yaml
version: 2
jobs:
  build:
    working_directory: ~/samplescala
    docker:
      - image: openjdk:8
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    environment:
      SBT_VERSION: 1.0.4
    steps:
      - run: echo 'export ARTIFACT_BUILD=$CIRCLE_PROJECT_REPONAME-$CIRCLE_BUILD_NUM.zip' >> $BASH_ENV
      - run:
          name: sbt バイナリの取得
          command: |
            apt update && apt install -y curl
            curl -L -o sbt-$SBT_VERSION.deb https://dl.bintray.com/sbt/debian/sbt-$SBT_VERSION.deb
            dpkg -i sbt-$SBT_VERSION.deb
            rm sbt-$SBT_VERSION.deb
            apt-get update
            apt-get install -y sbt python-pip git
            pip install awscli
            apt-get clean && apt-get autoclean
```

steps/run キーは、実行するアクションのタイプを指定します。 run キーは、実行するアクションを表します。

```yaml
      - run: echo 'export ARTIFACT_BUILD=$CIRCLE_PROJECT_REPONAME-$CIRCLE_BUILD_NUM.zip' >> $BASH_ENV
```

この echo コマンドは、$ARTIFACT_BUILD 環境変数を定義し、これをビルド ファイル名に設定します。

次の run コマンドは、openjdk コンテナ内の複数のコマンドを実行します。 複数のコマンドを実行するため、複数行で run コマンドを定義します。 以下のようにパイプ `|` 文字で指定されます。 複数行オプションを使用する場合は、1 つの行が 1 つのコマンドを表します。

```yaml
      - run:
          command: |
            apt update && apt install -y curl
            curl -L -o sbt-$SBT_VERSION.deb https://dl.bintray.com/sbt/debian/sbt-$SBT_VERSION.deb
            dpkg -i sbt-$SBT_VERSION.deb
            rm sbt-$SBT_VERSION.deb
            apt-get update
            apt-get install -y sbt python-pip git
            pip install awscli
            apt-get clean && apt-get autoclean
```

この 2.0 バージョンの samplescala スキーマでは、必要な依存関係をダウンロードしてコンテナにインストールする必要があります。  この複数行コマンドの例について以下に説明します。
- コンテナ OS を更新し、curl をインストールします。
- $SBT_VERSION 変数で指定されたバージョンの [Simple Build Tool (sbt)](https://www.scala-sbt.org/) コンパイラをダウンロードします。
- sbt コンパイラ パッケージをインストールします。
- インストール後に sbt.deb ファイルを削除します。
- OS パッケージ リストを更新します。
- python-pip と git クライアントをインストールします。
- `awscli` パッケージをインストールします。 これは、S3 へのアップロードに必要な AWS コマンドライン インターフェースです。
- 不要なインストール パッケージをすべて削除して、コンテナのサイズを最小化します。

以下のキーは、複数行コマンドの実行後に実行されるアクションを表します。

```yaml
    steps:
      - checkout
      - restore_cache:
          key: sbt-cache
      - run:
          name: samplescala dist パッケージのコンパイル
          command: cat /dev/null | sbt clean update dist
      - store_artifacts:
          path: target/universal/samplescala.zip
          destination: samplescala
      - save_cache:
          key: sbt-cache
          paths:
            - "~/.ivy2/cache"
            - "~/.sbt"
            - "~/.m2"
```

上記の例について以下に説明します。
- [`checkout`]({{site.baseurl}}/2.0/configuration-reference/#checkout): basically git clones the project repo from GitHub into the container
- [`restore_cache`]({{site.baseurl}}/2.0/configuration-reference/#restore_cache) key: specifies the name of the cache files to restore. キー名は、このスキーマの後方にある save_cache キーで指定されます。 指定されたキーが見つからない場合は、何も復元されず、処理が続行されます。
- [`run`]({{site.baseurl}}/2.0/configuration-reference/#run) command `cat /dev/null | sbt clean update dist`: executes the sbt compile command that generates the package .zip file.

**Note:** `cat /dev/null` is normally used to prevent a command from hanging if it prompts for interactive input and does not detect whether it is running with an interactive TTY. `sbt` will prompt on failures by default.

- [`store_artifacts`]({{site.baseurl}}/2.0/configuration-reference/#store_artifacts) path: specifies the path to the source file to copy to the ARTIFACT zone in the image.
- [`save_cache`]({{site.baseurl}}/2.0/configuration-reference/#save_cache) path: saves the specified directories for use in future builds when specified in the [`restore_cache`]({{site.baseurl}}/2.0/configuration-reference/#restore_cache) keys.

The final portion of the 2.0 schema is the run command key which moves and renames the compiled samplescala.zip to the $CIRCLE_ARTIFACTS/ directory.  その後、指定された AWS S3 バケットにファイルがアップロードされます。

```yaml
steps:
  - run:
      command: |
        mv target/universal/samplescala.zip $CIRCLE_ARTIFACTS/$ARTIFACT_BUILD
        aws s3 cp $CIRCLE_ARTIFACTS/$ARTIFACT_BUILD s3://samplescala.blogs/builds/ --metadata {\"git_sha1\":\"$CIRCLE_SHA1\"}
```

The run command is another multi-line execution.

## 関連項目
{: #see-also }
{:.no_toc}

- Refer to the [Migrating Your Scala/sbt Schema from CircleCI 1.0 to CircleCI](https://circleci.com/blog/migrating-your-scala-sbt-schema-from-circleci-1-0-to-circleci-2-0/) for the original blog post.
- See the [Deploy]({{site.baseurl}}/2.0/deployment-integrations/) document for more example deploy target configurations.
- [CircleCI で SBT のテストを並列化する](https://tanin.nanakorn.com/technical/2018/09/10/parallelise-tests-in-sbt-on-circle-ci.html)方法もご確認ください。
