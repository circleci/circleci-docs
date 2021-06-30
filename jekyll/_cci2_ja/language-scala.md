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

以下のセクションに沿って、Scala アプリケーションの [`.circleci/config.yml`]({{ site.baseurl }}/ja/2.0/configuration-reference/) の作成方法について説明します。

* 目次
{:toc}

## 概要
{: #overview }
{:.no_toc}

このドキュメントは、[プロジェクトの AWS 権限](https://circleci.com/ja/docs/2.0/deployment-integrations/#aws)に、S3 バケットの読み取りと書き込みが許可される有効な AWS キーが構成されていることを前提としています。 このドキュメントの例では、指定された S3 バケットにビルド パッケージがアップロードされます。

## Scala サンプル プロジェクトのソース コード
このサンプル アプリケーションのソース コードは、[samplescala の GitHub パブリック リポジトリ](https://github.com/ariv3ra/samplescala)にあります。

The source code for this sample application is in the [Public samplescala GitHub repo](https://github.com/ariv3ra/samplescala).

## 前提条件
{: #prerequisites }

CircleCI 2.0 では、リポジトリの root に新しいディレクトリを作成し、そのディレクトリ内に YAML ファイルを作成する必要があります。 これらの新しいアセットの名前は、ディレクトリが `.circleci/`、ファイルが `config.yml` と、命名スキーマに従って指定する必要があります。

```
mkdir .circleci/
touch .circleci/config.yml
```

最初のコマンドは `.circleci` という名前のディレクトリを作成し、次のコマンドは `.circleci` ディレクトリの中に `config.yml` という名前の新しいファイルを作成します。  繰り返しますが、.circleci というディレクトリ名と config.yml というファイル名を**使用する必要があります**。  バージョン 2.0 の前提条件については、[こちらのドキュメント]({{ site.baseurl }}/ja/2.0/migrating-from-1-2/)を参照してください。

### Scala の config.yml ファイル
{: #scala-configyml-file }

最初に、新しく作成した `config.yml` を任意のテキスト エディタで開き、以下の CircleCI 2.0 スキーマをファイルに貼り付けます。 以下に、2.0 構成の全文を示します。

```yaml
version: 2
jobs:
  build:
    working_directory: ~/samplescala
    docker:
      - image: openjdk:8
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
      - checkout
      - restore_cache:
          # 依存関係キャッシュについては https://circleci.com/ja/docs/2.0/caching/ をお読みください
          key: sbt-cache
      - run:
          name: samplescala dist パッケージのコンパイル
          command: cat /dev/null | sbt clean update dist
      - store_artifacts: # アーティファクト (https://circleci.com/ja/docs/2.0/artifacts/) に表示するため
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

## スキーマの詳細説明
この echo コマンドは、$ARTIFACT_BUILD 環境変数を定義し、これをビルド ファイル名に設定します。

`config.yml` は必ず [`version`]({{ site.baseurl }}/ja/2.0/configuration-reference/#version) キーから始めます。 このキーは、互換性を損なう変更に関する警告を表示するために使用します。

```yaml
version: 2
```

スキーマの次のキーは jobs キーと build キーです。  これらのキーは必須で、実行時のデフォルトのエントリポイントを表します。 スキーマの残りの部分は build セクションに置かれ、ここでさまざまなコマンドが実行されます。 以下の説明を参照してください。

```yaml
version: 2
jobs:
  build:
    working_directory: ~/samplescala
    docker:
      - image: openjdk:8
    environment:
      SBT_VERSION: 1.0.4
```

docker/image キーは、ビルドに使用する Docker イメージを表します。 この例では、[Docker Hub](https://hub.docker.com/_/openjdk/) にある公式の `openjdk:8` イメージを使用します。 これには、この Scala プロジェクトに必要なネイティブ Java コンパイラが含まれます。

上記の例について以下に説明します。

```yaml
version: 2
jobs:
  build:
    working_directory: ~/samplescala
    docker:
      - image: openjdk:8
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

この deploy コマンドも複数行実行コマンドです。

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

Below is an explanation of the preceding example:
- [`checkout`]({{ site.baseurl }}/ja/2.0/configuration-reference/#checkout): 基本的に、git は GitHub から取得したプロジェクト リポジトリをコンテナにクローンします。
- [`restore_cache`]({{ site.baseurl }}/ja/2.0/configuration-reference/#restore_cache) キー: 復元するキャッシュ ファイルの名前を指定します。 キー名は、このスキーマの後方にある save_cache キーで指定されます。 指定されたキーが見つからない場合は、何も復元されず、処理が続行されます。
- [`run`]({{ site.baseurl }}/ja/2.0/configuration-reference/#run) コマンドの `cat /dev/null | sbt clean update dist`: パッケージの .zip ファイルを生成する sbt コンパイル コマンドを実行します。
- [`store_artifacts`]({{ site.baseurl }}/ja/2.0/configuration-reference/#store_artifacts) パス: イメージの ARTIFACT ゾーンにコピーするソース ファイルのパスを指定します。
- [`save_cache`]({{ site.baseurl }}/ja/2.0/configuration-reference/#save_cache) パス: 将来のビルドで使用するために、指定されたディレクトリを保存します ([`restore_cache`]({{ site.baseurl }}/ja/2.0/configuration-reference/#restore_cache) キーで指定された場合)。

2.0 スキーマの最後の部分は deploy コマンド キーです。 これは、コンパイルされた samplescala.zip を $CIRCLE_ARTIFACTS/ ディレクトリに移動し、その名前を変更します。  その後、指定された AWS S3 バケットにファイルがアップロードされます。

```yaml
steps:
  - deploy:
      command: |
        mv target/universal/samplescala.zip $CIRCLE_ARTIFACTS/$ARTIFACT_BUILD
        aws s3 cp $CIRCLE_ARTIFACTS/$ARTIFACT_BUILD s3://samplescala.blogs/builds/ --metadata {\"git_sha1\":\"$CIRCLE_SHA1\"}
```

The deploy command is another multi-line execution.

## 関連項目
{: #see-also }
{:.no_toc}

- 引用元のブログ記事「[Migrating Your Scala/sbt Schema from CircleCI 1.0 to CircleCI 2.0 (Scala/sbt スキーマを CircleCI 1.0 から CircleCI 2.0 に移行する)](https://circleci.com/blog/migrating-your-scala-sbt-schema-from-circleci-1-0-to-circleci-2-0/)」を参照してください。
- デプロイ ターゲットのその他の構成例については、「[デプロイの構成]({{ site.baseurl }}/ja/2.0/deployment-integrations/)」を参照してください。
- [CircleCI で SBT のテストを並列化する](https://tanin.nanakorn.com/technical/2018/09/10/parallelise-tests-in-sbt-on-circle-ci.html)方法もご確認ください。
