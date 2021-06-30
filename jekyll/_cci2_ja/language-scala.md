---
layout: classic-docs
title: "言語ガイド: Scala"
short-title: "言語ガイド: Scala"
description: "CircleCI 2.0 言語ガイド: Scala"
categories:
  - getting-started
order: 1
version:
  - Cloud
  - Server v2.x
---

以下のセクションに沿って、Scala アプリケーションの [`.circleci/config.yml`]({{ site.baseurl }}/2.0/configuration-reference/) の作成方法について説明します。

* TOC
{:toc}

## 概要
{: #overview }
{:.no_toc}

This document assumes that your [project’s AWS Permission settings](https://circleci.com/docs/2.0/deployment-integrations/#aws) are configured with valid AWS keys that are permitted to read and write to an S3 bucket. The examples in this post upload build packages to the specified S3 bucket.

## Sample Scala project source code
{: #sample-scala-project-source-code }

The source code for this sample application is in the [Public samplescala GitHub repo](https://github.com/ariv3ra/samplescala).

## 前提条件
{: #prerequisites }

CircleCI 2.0 requires you to create a new directory in the repo's root and a YAML file within this new directory. The new assets must follow these naming schema's directory: `.circleci/` file: `config.yml`.

```
mkdir .circleci/
touch .circleci/config.yml
```

These commands create a directory named `.circleci` & the next command creates a new file named `config.yml` within the `.circleci` directory.  Again you **must** use the names .circleci for the dir and config.yml.  Learn more about the [version 2.0 prerequisites here]({{ site.baseurl }}/2.0/migrating-from-1-2/).

### Scala config.yml file
{: #scala-configyml-file }

To get started, open the newly created `config.yml` in your favorite text editor and paste the following CircleCI 2.0 schema into the file. Below is the complete 2.0 configuration:

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
      - deploy:
          command: |
              mv target/universal/samplescala.zip $CIRCLE_ARTIFACTS/$ARTIFACT_BUILD
              aws s3 cp $CIRCLE_ARTIFACTS/$ARTIFACT_BUILD s3://samplescala.blogs/builds/ --metadata {\"git_sha1\":\"$CIRCLE_SHA1\"}
```

## Schema walkthrough
{: #schema-walkthrough }

Every `config.yml` starts with the [`version`]({{ site.baseurl }}/2.0/configuration-reference/#version) key. This key is used to issue warnings about breaking changes.

```yaml
version: 2
```

The next key in the schema is the jobs & build keys.  These keys are required and represent the default entry point for a run. The build section hosts the remainder of the schema which executes our commands. This will be explained below.

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

The docker/image key represents the Docker image you want to use for the build. In this case, we want to use the official `openjdk:8` image from [Docker Hub](https://hub.docker.com/_/openjdk/) because it has the native Java compiler we need for our Scala project.

The environment/SBT_VERSION is an environment variable that specifies the version of sbt to download in later commands which is required to compile the Scala app.

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
```

The steps/run keys specify the types of actions to perform. The run keys represent the actions to be executed.

```yaml
      - run: echo 'export ARTIFACT_BUILD=$CIRCLE_PROJECT_REPONAME-$CIRCLE_BUILD_NUM.zip' >> $BASH_ENV
```

This echo command defines the $ARTIFACT_BUILD environment variable and sets it to a build filename.

The next run command executes multiple commands within the openjdk container. Since we're executing multiple commands we'll be defining a multi-line run command which is designated by the pipe `|` character, as shown below. When using the multi-line option, one line represents one command.

```yaml
      - run:
          command: |
            apt update && apt install -y curl
            curl -L -o sbt-$SBT_VERSION.deb https://dl.bintray.com/sbt/debian/sbt-$SBT_VERSION.deb
            dpkg -i sbt-$SBT_VERSION.deb
            rm sbt-$SBT_VERSION.deb
            apt-get update
            apt-get install -y python-pip git
            pip install awscli
            apt-get clean && apt-get autoclean
```

The 2.0 version of our samplescala schema requires us to download required dependencies and install them into the container.  Below is an explanation of the example multi-line command:
- コンテナ OS を更新し、curl をインストールします。
- $SBT_VERSION 変数で指定されたバージョンの [Simple Build Tool (sbt)](https://www.scala-sbt.org/) コンパイラをダウンロードします。
- sbt コンパイラ パッケージをインストールします。
- インストール後に sbt.deb ファイルを削除します。
- OS パッケージ リストを更新します。
- python-pip と git クライアントをインストールします。
- `awscli` パッケージをインストールします。 これは、S3 へのアップロードに必要な AWS コマンドライン インターフェースです。
- 不要なインストール パッケージをすべて削除して、コンテナのサイズを最小化します。

The following keys represent actions performed after the multi-line command is executed:

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

Below is an explanation of the preceding example:
- [`checkout`]({{ site.baseurl }}/2.0/configuration-reference/#checkout): basically git clones the project repo from GitHub into the container
- [`restore_cache`]({{ site.baseurl }}/2.0/configuration-reference/#restore_cache) キー: 復元するキャッシュ ファイルの名前を指定します。 キー名は、このスキーマの後方にある save_cache キーで指定されます。 指定されたキーが見つからない場合は、何も復元されず、処理が続行されます。
- [`run`]({{ site.baseurl }}/2.0/configuration-reference/#run) コマンドの `cat /dev/null | sbt clean update dist`: パッケージの .zip ファイルを生成する sbt コンパイル コマンドを実行します。
- [`store_artifacts`]({{ site.baseurl }}/2.0/configuration-reference/#store_artifacts) パス: イメージの ARTIFACT ゾーンにコピーするソース ファイルのパスを指定します。
- [`save_cache`]({{ site.baseurl }}/2.0/configuration-reference/#save_cache) パス: 将来のビルドで使用するために、指定されたディレクトリを保存します ([`restore_cache`]({{ site.baseurl }}/2.0/configuration-reference/#restore_cache) キーで指定された場合)。

The final portion of the 2.0 schema are the deploy command keys which move and rename the compiled samplescala.zip to the $CIRCLE_ARTIFACTS/ directory.  The file is then uploaded to the AWS S3 bucket specified.

```yaml
steps:
  - deploy:
      command: |
        mv target/universal/samplescala.zip $CIRCLE_ARTIFACTS/$ARTIFACT_BUILD
        aws s3 cp $CIRCLE_ARTIFACTS/$ARTIFACT_BUILD s3://samplescala.blogs/builds/ --metadata {\"git_sha1\":\"$CIRCLE_SHA1\"}
```

The deploy command is another multi-line execution.

## See also
{: #see-also }
{:.no_toc}

- 引用元のブログ記事「[Migrating Your Scala/sbt Schema from CircleCI 1.0 to CircleCI 2.0 (Scala/sbt スキーマを CircleCI 1.0 から CircleCI 2.0 に移行する)](https://circleci.com/blog/migrating-your-scala-sbt-schema-from-circleci-1-0-to-circleci-2-0/)」を参照してください。
- デプロイ ターゲットのその他の構成例については、「[デプロイの構成]({{ site.baseurl }}/2.0/deployment-integrations/)」を参照してください。
- [CircleCI で SBT のテストを並列化する](https://tanin.nanakorn.com/technical/2018/09/10/parallelise-tests-in-sbt-on-circle-ci.html)方法もご確認ください。
