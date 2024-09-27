---
layout: classic-docs
title: "Docker コマンドの実行手順"
description: "Docker イメージをビルドし、リモートサービスにアクセスする方法"
contentTags:
  platform:
    - クラウド
    - Server v4.x
    - Server v3.x
---

このページでは、デプロイやテストを行う Docker イメージをビルドする方法について説明します。 このページの Docker 実行環境を使った例では、リモート Docker 環境でサービスを開始する方法を紹介します。

## 概要
{: #overview }

現在、リモート Docker 機能の更新作業を行っています。 **ユーザーの皆様に実行していただく作業はありません**。このページの内容はすべて、段階的に廃止される既存のリモート Docker の実装についての内容です。 すべてのジョブが新しい実装に移行されると、このページの現在の内容は古い情報となり、新しいアーキテクチャに基づく情報に置き換えられます。
<br>
新しいアーキテクチャの詳細やこのロールアウトに関する最新の情報は、[Discuss の投稿 (英語)](https://discuss.circleci.com/t/setup-remote-docker-architecture-change/45303)でご確認ください。
{: class="alert alert-info"}

Docker 実行環境でデプロイする Docker イメージをビルドするには、セキュリティのために各ビルドに独立した環境を作成する、特別な `setup_remote_docker` キーを使用する必要があります。 この環境は、リモートで完全に隔離され、Docker コマンドを実行するように設定されています。 ジョブで `docker` コマンドや `docker-compose` コマンドが必要な場合は、`.circleci/config.yml` に `setup_remote_docker` ステップを追加します。

```yaml
jobs:
  build:
    docker:
      - image: cimg/base:2022.06
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      # ... steps for building/testing app ...
      - setup_remote_docker:
        version: 20.10.14
```

`setup_remote_docker` が実行されるとリモート環境が作成され、現在の[プライマリコンテナ]({{ site.baseurl }}/ja/glossary/#primary-container)は、そのリモート環境を使用するように設定されます。 これにより、使用するすべての Docker 関連コマンドが、この新しい環境で安全に実行されるようになります。

**注:** `setup_remote_docker` キーは、プライマリ Executor を *Docker コンテナ*とするよう指定した設定ファイルで使用することが想定されています。 Executor が `machine` または `macos` の場合 (および設定ファイルで Docker コマンドを使用する場合)、`setup_remote_docker` キーを使用する必要は**ありません**。

## 仕様
{: #specifications }

リモート Docker 環境の技術仕様は以下のとおりです (CircleCI Server をお使いの場合は、システム管理者にお問い合わせください)。

| CPU 数 | プロセッサー                    | RAM  | HD     |
| ----- | ------------------------- | ---- | ------ |
| 2     | Intel(R) Xeon(R) @ 2.3GHz | 8 GB | 100 GB |
{: class="table table-striped"}

## Machine Executor を使った Docker コマンドの実行
{: #run-docker-commands-using-the-machine-executor }

以下の例では、`machine` Executor を使って、デフォルトのイメージで Docker イメージをビルドする方法を示しています。この場合、リモートDocker を使用する必要はありません。

```yaml
version: 2.1

jobs:
 build:
   machine:
    image: ubuntu-2204:2022.04.2
   steps:
     - checkout
     # start proprietary DB using private Docker image
     # with credentials stored in the UI
     - run: |
         echo "$DOCKER_PASS" | docker login --username $DOCKER_USER --password-stdin
         docker run -d --name db company/proprietary-db:1.2.3

     # build the application image
     - run: docker build -t company/app:$CIRCLE_BRANCH .


     # イメージをデプロイします。
     - run: docker push company/app:$CIRCLE_BRANCH
```

## Docker Executor を使った Docker コマンドの実行
{: #run-docker-commands-using-the-docker-executor }

以下では、リモート Docker で Docker Executor を使用して [Docker デモプロジェクト](https://github.com/CircleCI-Public/circleci-demo-docker)用の Docker イメージをビルドし、デプロイする例を紹介します。

```yml
version: 2.1
jobs:
  build:
    docker:
      - image: cimg/go:1.17
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      # ... steps for building/testing app ...

      - setup_remote_docker:
          version: 20.10.14
          docker_layer_caching: true

      # build and push Docker image
      - run: |
          TAG=0.1.$CIRCLE_BUILD_NUM
          docker build -t CircleCI-Public/circleci-demo-docker:$TAG .
          echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
          docker push CircleCI-Public/circleci-demo-docker:$TAG
```

ビルド中に何が行われているのか詳しく見てみましょう。

1. すべてのコマンドが[プライマリコンテナ]({{ site.baseurl }}/ja/glossary/#primary-container)で実行されます。 (5 行目)
2. `setup_remote_docker` が呼び出されると、新しいリモート環境が作成され、それを使用するようにプライマリコンテナが設定されます。 Docker 関連のコマンドもすべてプライマリコンテナで実行されますが、イメージのビルドおよびプッシュとコンテナの実行はリモート Docker エンジン内で行われます。 (10 行目)
3. ここで [Docker レイヤーキャッシュ (DLC) ]({{ site.baseurl }}/ja/glossary/#docker-layer-caching)を有効化し、イメージのビルドを高速化します。
4. プロジェクト環境変数を使用して、Docker ハブ の認証情報を格納します。 (17 行目)

**注:** Docker Executor 用の [CircleCI ビルド済み Docker イメージ]({{site.baseurl}}/circleci-images/) には、Docker CLI がプリインストールされています。 Docker CLI がインストールされていないサードパーティーのイメージをプライマリコンテナで使用する場合は、`docker` コマンドを実行する前に、ジョブの一部として [Docker CLI をインストールする必要があります。](https://docs.docker.com/install/#supported-platforms)

```yml
      # Alpine ベースのイメージに APK でインストールします。
      - run:
          name: Docker クライアントのインストール
          command: apk add docker-cli
```

## リモート Docker の Docker バージョンの指定
{: #docker-version }

ジョブで特定の Docker バージョンが必要な場合は、`version` 属性でバージョンを設定できます。

```yml
      - setup_remote_docker:
        version: 20.10.11
```

CircleCI は複数の Docker バージョンをサポートしています。 サポートされているバージョンは以下のとおりです。

- `20.10.18` (デフォルト)
- `20.10.17`
- `20.10.14`
- `20.10.12`
- `20.10.11`
- `20.10.7`
- `20.10.6`
- `20.10.2`
- `19.03.13`


<!---
Consult the [Stable releases](https://download.docker.com/linux/static/stable/x86_64/) or [Edge releases](https://download.docker.com/linux/static/edge/x86_64/) for the full list of supported versions.
--->

**注:** `version` キーは、現在 CircleCI サーバー環境ではサポートされていません。 リモート環境にインストールされている Docker のバージョンについては、システム管理者に問い合わせてください。

## 環境の分離
{: #separation-of-environments }
ジョブと[リモート Docker]({{ site.baseurl }}/ja/glossary/#remote-docker) は、独立した環境で実行されます。 したがって、ジョブ実行用に指定している Docker コンテナは、リモート Docker で実行されているコンテナと直接やり取りできません。

### サービスへのアクセス
{: #accessing-services }

リモート Docker でサービスを開始してプライマリコンテナから直接 ping することや、リモート Docker 内のサービスに ping できるプライマリコンテナを開始することは**できません**。 実行するには、リモート Docker から同じコンテナを通してサービスとやり取りをする必要があります。

```yml
#...
      - run:
          name: "サービスの開始および実行チェック"
          command: |
            docker run -d --name my-app my-app
            docker exec my-app curl --retry 10 --retry-connrefused http://localhost:8080
#...
```

同じネットワーク内で動作する別のコンテナをターゲットコンテナとして使用する方法もあります。

```yml
#...
      - run: |
          docker run -d --name my-app my-app
          docker run --network container:my-app appropriate/curl --retry 10 --retry-connrefused http://localhost:8080
#...
```

### フォルダーのマウント
{: #mounting-folders }

ジョブ空間からリモート Docker 内のコンテナにボリュームをマウントすること (およびその逆) は**できません**。 `docker cp` コマンドを使用して、この 2 つの環境間でファイルを転送することは可能です。 たとえば以下のように、ソースコードから設定ファイルを使用してリモート Docker でコンテナを開始します。

```yml
- run: |
    # 設定ファイルとボリュームを保持するダミー コンテナを作成します。
    docker create -v /cfg --name configs alpine:3.4 /bin/true
    # このボリュームに設定ファイルをコピーします。
    docker cp path/in/your/source/code/app_config.yml configs:/cfg
    # このボリュームを使用してアプリケーション コンテナを開始します。
    docker run --volumes-from configs app-image:1.2.3
```

同様に、保存する必要があるアーティファクトをアプリケーションが生成する場合は、以下のようにリモート Docker からコピーできます。

```yml
run: |
  # アプリケーションとコンテナを開始します。
  # <code>--rm</code> オプションは使用しません (使用すると、終了時にコンテナが強制終了されます)。
  docker run --name app app-image:1.2.3
```

また、https://github.com/outstand/docker-dockup やバックアップおよびリストア用の同様のイメージを使って、以下の例のようにコンテナをスピンアップさせることも可能です。 `circle-dockup.yml` の設定例:

```yml
version: '2'
services:
 bundler-cache:
   image: outstand/dockup:latest
   command: restore
   container_name: bundler-cache
   tty: true
   environment:
     COMPRESS: 'false'
   volumes:
     - bundler-data:/source/bundler-data
```

次に、以下の CircleCI `.circleci/config.yml` スニペットで `bundler-cache` コンテナにデータを挿入し、バックアップを行います。

{% raw %}
```yml
# CircleCI キャッシュから bundler-data コンテナにデータを挿入します。

- restore_cache:
    keys:
      - v4-bundler-cache-{{ arch }}-{{ .Branch }}-{{ checksum "Gemfile.lock" }}
      - v4-bundler-cache-{{ arch }}-{{ .Branch }}
      - v4-bundler-cache-{{ arch }}
- run:
    name: Docker ボリュームへの Bundler キャッシュの復元
    command: |
      NAME=bundler-cache
      CACHE_PATH=~/bundler-cache
      set -x
      mkdir -p $CACHE_PATH
      docker-compose -f docker-compose.yml -f docker/circle-dockup.yml up --no-start $NAME
      docker cp $CACHE_PATH/. $NAME:/backup
      docker-compose -f docker-compose.yml -f docker/circle-dockup.yml up --no-recreate $NAME
      docker rm -f $NAME

# 同じボリュームを CircleCI キャッシュにバックアップします。
- run:
    name: Docker ボリュームからの Bundler キャッシュのバックアップ
    command: |
      NAME=bundler-cache
      CACHE_PATH=~/bundler-cache
      set -x
      docker-compose -f docker-compose.yml -f docker/circle-dockup.yml run --name $NAME $NAME backup
      docker cp $NAME:/backup/. $CACHE_PATH
      docker rm -f $NAME
- save_cache:
    key: v4-bundler-cache-{{ arch }}-{{ .Branch }}-{{ checksum "Gemfile.lock" }}
    paths:
      - ~/bundler-cache
```
{% endraw %}

### リモート Docker 環境へのアクセス
{: #accessing-the-remote-docker-environment }

リモート Docker 環境が起動されると、SSH エイリアスが作成され、リモート Docker 仮想マシンに対して SSH 接続できます。 SSH 接続は、ビルドをデバッグする場合や、Docker または VM ファイルシステムの設定を変更する場合に便利です。 リモート Docker 仮想マシンに SSH 接続するには、プロジェクトを設定するジョブステップ内で、または SSH 再実行中に、以下を実行します。

```shell
ssh remote-docker
```

**注:** 上記の例は、`docker` Executor で動作しないボリュームマウントを使用する方法を示しています。 この他に、ボリューム マウントが動作する `machine` Executor を使用する方法もあります。

これらのサンプルコードは ryansch 氏より提供していただきました。

## 関連項目
{: #see-also }

[Docker レイヤーキャッシュ]({{ site.baseurl }}/ja/docker-layer-caching/)

[ジョブ空間]({{ site.baseurl }}/ja/glossary/#job-space)

[プライマリコンテナ]({{ site.baseurl }}/ja/glossary/#primary-container)

[Docker レイヤーキャッシュ]({{ site.baseurl }}/ja/glossary/#docker-layer-caching)
