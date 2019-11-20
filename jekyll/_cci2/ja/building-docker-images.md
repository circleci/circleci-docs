---
layout: classic-docs
title: "Docker コマンドの実行手順"
short-title: "Docker コマンドの実行手順"
description: "Docker イメージをビルドし、リモート サービスにアクセスする方法"
categories:
  - configuring-jobs
order: 55
---

他の場所にデプロイしたり、高度なテストを行ったりするための Docker イメージのビルド方法や、リモート Docker コンテナ内のサービスを開始する方法について、以下のセクションに沿って説明します。

- 目次
{:toc}

## 概要

デプロイする Docker イメージを作成するには、セキュリティのために各ビルドに独立した環境を作成する特別な `setup_remote_docker` キーを使用する必要があります。 この環境はリモートで、完全に隔離され、Docker コマンドを実行するように構成されています。 ジョブで `docker` または `docker-compose` のコマンドが必要な場合は、`.circleci/config.yml` に `setup_remote_docker` ステップを追加します。

```yaml
jobs:
  build:
    steps:
      # ... アプリのビルド・テストに関する記述 ...

      - setup_remote_docker
```

`setup_remote_docker` が実行されるとリモート環境が作成され、現在の[プライマリ コンテナ]({{ site.baseurl }}/2.0/glossary/#プライマリ-コンテナ)は、それを使用するように構成されます。 これで、使用するすべての Docker 関連コマンドが、この新しい環境で安全に実行されます。

**メモ:** `setup_remote_docker` キーは、プライマリ Executor に *Docker コンテナ*を指定した設定ファイルに使用することが想定されています。 Executor が `machine` または `macos` の場合 (および設定ファイルで Docker コマンドを使用する場合)、`setup_remote_docker` キーを使用する必要はありません。

### 仕様
{:.no_toc}

リモート Docker 環境の技術仕様は以下のとおりです。

| CPU 数 | プロセッサー                    | RAM  | HD    |
| ----- | ------------------------- | ---- | ----- |
| 2     | Intel(R) Xeon(R) @ 2.3GHz | 8 GB | 100GB |
{: class="table table-striped"}

### 例
{:.no_toc}

以下に、デフォルト イメージと `machine` を使用して Docker イメージをビルドする例を示します。

```yaml
version: 2
jobs:
 build:
   machine: true
   steps:
     - checkout
     # UI に格納された認証情報とプライベート Docker イメージを
     # 使用して、固有 DB を開始します
     - run: |
         echo "$DOCKER_PASS" | docker login --username $DOCKER_USER --password-stdin
         docker run -d --name db company/proprietary-db:1.2.3

     # アプリケーション イメージをビルドします

     - run: docker build -t company/app:$CIRCLE_BRANCH .

     # イメージをデプロイします

     - run: docker push company/app:$CIRCLE_BRANCH
```

以下に、[Docker のデモ プロジェクト](https://github.com/CircleCI-Public/circleci-demo-docker)用の Docker イメージをビルドしてプッシュする例を示します。

```yaml
version: 2
jobs:
  build:
    docker:
      - image: golang:1.6.4-jessie   # (1)
    working_directory: /go/src/github.com/CircleCI-Public/circleci-demo-docker
    steps:
      - checkout
      # ... アプリのビルド・テストに関する記述 ...

      - setup_remote_docker:   # (2)
          docker_layer_caching: true # (3)

      # 既に Docker が存在するプライマリ イメージを使用するか (推奨)、
      # ここで行うようにビルド中にインストールします

      - run:
          name: Docker クライアントのインストール
          command: |
            set -x
            VER="17.03.0-ce"
            curl -L -o /tmp/docker-$VER.tgz https://download.docker.com/linux/static/stable/x86_64/docker-$VER.tgz
            tar -xz -C /tmp -f /tmp/docker-$VER.tgz
            mv /tmp/docker/* /usr/bin

      # Docker イメージをビルドしてプッシュします

      - run: |
          TAG=0.1.$CIRCLE_BUILD_NUM
          docker build -t   CircleCI-Public/circleci-demo-docker:$TAG .     
          docker login -u $DOCKER_USER -p $DOCKER_PASS         # (4)
          docker push CircleCI-Public/circleci-demo-docker:$TAG
```

ビルド中に何が行われているのか詳しく見てみましょう。

1. すべてのコマンドが[プライマリ コンテナ]({{ site.baseurl }}/2.0/glossary/#プライマリ-コンテナ)で実行されます。
2. `setup_remote_docker` が呼び出されると、新しいリモート環境が作成され、それを使用するようにプライマリ コンテナが構成されます。 Docker 関連のコマンドもすべてプライマリ コンテナで実行されますが、イメージのビルドおよびプッシュとコンテナの実行はリモート Docker Engine で行われます。
3. ここで [Docker レイヤー キャッシュ]({{ site.baseurl }}/2.0/glossary/#docker-レイヤー-キャッシュ) (DLC) を有効化して、イメージのビルドを高速化します (**メモ:** `docker_layer_caching: true` オプションは、[Performance プランと Custom プラン](https://circleci.com/ja/pricing/)で提供され、Free プランでは提供されません。 また、DLC は CircleCI Server で利用できます)。
4. プロジェクト環境変数を使用して、Docker Hub の認証情報を格納します。

## Docker のバージョン

ジョブで特定の Docker バージョンが必要な場合は、`version` 属性でバージョンを設定できます。

```yaml
      - setup_remote_docker:
          version: 18.06.0-ce
```

CircleCI は複数の Docker バージョンをサポートしており、デフォルトでは `17.09.0-ce` を使用します。 以下に、サポートされている安定版とエッジ版を示します。

- `17.03.0-ce`
- `17.05.0-ce`
- `17.06.0-ce`
- `17.06.1-ce`
- `17.07.0-ce`
- `17.09.0-ce`
- `17.10.0-ce`
- `17.11.0-ce`
- `17.12.0-ce`
- `17.12.1-ce`
- `18.01.0-ce`
- `18.02.0-ce`
- `18.03.0-ce`
- `18.03.1-ce`
- `18.04.0-ce`
- `18.05.0-ce`
- `18.06.0-ce`
- `18.09.3`

<!---
Consult the [Stable releases](https://download.docker.com/linux/static/stable/x86_64/) or [Edge releases](https://download.docker.com/linux/static/edge/x86_64/) for the full list of supported versions.
--->

**メモ:** 現在、プライベート クラウドまたはデータセンターにインストールされている CircleCI では、`version` キーがサポートされていません。 お使いのリモート Docker 環境にインストールされている Docker バージョンについては、システム管理者にお問い合わせください。

## 環境の分離

ジョブと[リモート Docker]({{ site.baseurl }}/2.0/glossary/#リモート-docker) は、独立した環境で実行されます。 したがって、Docker コンテナは、リモート Docker で実行されているコンテナと直接やり取りできません。

### サービスへのアクセス
{:.no_toc}

リモート Docker でサービスを開始してプライマリ コンテナから直接 ping することや、リモート Docker 内のサービスに ping できるプライマリ コンテナを開始することは**できません**。 これを解決するには、リモート Docker から同じコンテナを通してサービスとやり取りする必要があります。

```yaml
#...
      - run:
          name: "サービスの開始および実行チェック"
          command: |
            docker run -d --name my-app my-app
            docker exec my-app curl --retry 10 --retry-connrefused http://localhost:8080
#...
```

同じネットワーク内で動作する別のコンテナをターゲット コンテナとして使用する方法もあります

```yaml
#...
      - run: |
          docker run -d --name my-app my-app
          docker run --network container:my-app appropriate/curl --retry 10 --retry-connrefused http://localhost:8080
#...
```

### フォルダーのマウント
{:.no_toc}

ジョブ空間からリモート Docker 内のコンテナにボリュームをマウントすること (およびその逆) は**できません**。 `docker cp` コマンドを使用して、この 2 つの環境間でファイルを転送することは可能です。 たとえば以下のように、ソース コードから設定ファイルを使用してリモート Docker でコンテナを開始します。

```yaml
- run: |
    # 設定ファイルとボリュームを保持するダミー コンテナを作成します
    docker create -v /cfg --name configs alpine:3.4 /bin/true
    # このボリュームに設定ファイルをコピーします
    docker cp path/in/your/source/code/app_config.yml configs:/cfg
    # このボリュームを使用してアプリケーション コンテナを開始します
    docker run --volumes-from configs app-image:1.2.3
```

同様に、保存する必要があるアーティファクトをアプリケーションが生成する場合は、以下のようにリモート Docker からコピーできます。

```yaml
- run: |
    # アプリケーションとコンテナを開始します
    # `--rm` オプションは使用しません (使用すると、終了時にコンテナが強制終了されます)
    docker run --name app app-image:1.2.3

- run: |
    # アプリケーション コンテナの終了後、そこからアーティファクトを直接コピーします
    docker cp app:/output /path/in/your/job/space
```

以下の `circle-dockup.yml` 設定ファイルの例に示すように、https://github.com/outstand/docker-dockup などのバックアップ・復元用イメージを使用してコンテナをスピンアップすることもできます。

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
    

次に、以下の CircleCI `.circleci/config.yml` スニペットで `bundler-cache` コンテナにデータを挿入し、バックアップを行います。

{% raw %}
```yaml
# CircleCI キャッシュから bundler-data コンテナにデータを挿入します

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

# 同じボリュームを CircleCI キャッシュにバックアップします

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

**メモ:** 上記の例は、`docker` Executor で動作しないボリューム マウントを使用する方法を示しています。 この他に、ボリューム マウントが動作する `machine` Executor を使用する方法もあります。

この例は、ryansch のご協力によって作成されました。

## 関連項目

[Docker レイヤー キャッシュ]({{ site.baseurl }}/2.0/docker-layer-caching/)

[ジョブ空間]({{ site.baseurl }}/2.0/glossary/#ジョブ空間)

[プライマリ コンテナ]({{ site.baseurl }}/2.0/glossary/#プライマリ-コンテナ)

[Docker レイヤー キャッシュ]({{ site.baseurl }}/2.0/glossary/#docker-レイヤー-キャッシュ)