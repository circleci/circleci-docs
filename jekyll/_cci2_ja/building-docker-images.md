---
layout: classic-docs
title: "Docker コマンドの実行手順"
short-title: "Docker コマンドの実行手順"
description: "Docker イメージをビルドし、リモート サービスにアクセスする方法"
order: 55
version:
  - Cloud
  - Server v2.x
---

他の場所にデプロイしたり、高度なテストを行ったりするための Docker イメージのビルド方法や、リモート Docker 環境でサービスを開始する方法について説明します。

* 目次
{:toc}

## 概要
{: #overview }

デプロイする Docker イメージを作成するには、セキュリティのために各ビルドに独立した環境を作成する特別な `setup_remote_docker` キーを使用する必要があります。 この環境はリモートで、完全に隔離され、Docker コマンドを実行するように構成されています。 ジョブで `docker` または `docker-compose` のコマンドが必要な場合は、`.circleci/config.yml` に `setup_remote_docker` ステップを追加します。

```yaml
jobs:
  build:
    steps:
      # ... アプリのビルド・テストに関する記述 ...

      - setup_remote_docker
```

`setup_remote_docker` が実行されるとリモート環境が作成され、現在の[プライマリ コンテナ]({{ site.baseurl }}/2.0/glossary/#primary-container)は、それを使用するように構成されます。 これで、使用するすべての Docker 関連コマンドが、この新しい環境で安全に実行されます。

**メモ:** `setup_remote_docker` キーは、プライマリ Executor を *Docker コンテナ*とするよう指定した設定ファイルで使用することが想定されています。 Executor が `machine` または `macos` の場合 (および設定ファイルで Docker コマンドを使用する場合)、`setup_remote_docker` キーを使用する必要は**ありません**。

### 仕様
リモート Docker 環境の技術仕様は以下のとおりです (CircleCI Server をお使いの場合は、システム管理者にお問い合わせください)。
{:.no_toc}

The Remote Docker Environment has the following technical specifications (for CircleCI Server installations, contact the systems administrator for specifications):

| CPU 数 | プロセッサー                    | RAM  | HD    |
| ----- | ------------------------- | ---- | ----- |
| 2     | Intel(R) Xeon(R) @ 2.3GHz | 8 GB | 100GB |
{: class="table table-striped"}

### 例
ビルド中に何が行われているのか詳しく見てみましょう。
{:.no_toc}

ジョブで特定の Docker バージョンが必要な場合は、`version` 属性でバージョンを設定できます。

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

以下の `circle-dockup.yml` 設定ファイルの例に示すように、https://github.com/outstand/docker-dockup などのバックアップ・復元用イメージを使用してコンテナをスピンアップすることもできます。

<!-- markdownlint-disable MD046 -->
{% highlight yaml linenos %}
同じネットワーク内で動作する別のコンテナをターゲット コンテナとして使用する方法もあります

      - setup_remote_docker:
          version: 19.03.13
          docker_layer_caching: true
    
      # Docker イメージをビルドしプッシュします
    
      - run: |
          TAG=0.1.$CIRCLE_BUILD_NUM
          docker build -t CircleCI-Public/circleci-demo-docker:$TAG .
          echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
          docker push CircleCI-Public/circleci-demo-docker:$TAG
{% endhighlight %}
<!-- markdownlint-enable MD046 -->

**メモ:** `version` キーは、現在 CircleCI Server 環境ではサポートされていません。 お使いのリモート Docker 環境にインストールされている Docker バージョンについては、システム管理者にお問い合わせください。

```
      # Alpine ベースのイメージに APK でインストールします

      - run:
          name: Docker クライアントのインストール
          command: apk add docker-cli
```

Let’s break down what’s happening during this build’s execution:

1. すべてのコマンドが[プライマリ コンテナ]({{ site.baseurl }}/2.0/glossary/#primary-container)で実行されます。 (5 行目)
2. `setup_remote_docker` が呼び出されると、新しいリモート環境が作成され、それを使用するようにプライマリ コンテナが構成されます。 Docker 関連のコマンドもすべてプライマリ コンテナで実行されますが、イメージのビルドおよびプッシュとコンテナの実行はリモート Docker Engine で行われます。 (10 行目)
3. ここで [Docker レイヤー キャッシュ]({{ site.baseurl }}/2.0/glossary/#docker-layer-caching) (DLC) を有効化して、イメージのビルドを高速化します (**メモ:** `docker_layer_caching: true` オプションは、[Performance プランと Custom プラン](https://circleci.com/ja/pricing/)で提供され、Free プランでは提供されません。 また、DLC は CircleCI Server で利用できます)。 (11 行目)
4. プロジェクト環境変数を使用して、Docker Hub の認証情報を格納します。 (17 行目)

## Docker のバージョン
{: #docker-version }

To specify the Docker version, you can set it as a `version` attribute:

```
      - setup_remote_docker:
          version: 18.06.0-ce
```

CircleCI は複数の Docker バージョンをサポートしており、デフォルトでは `17.09.0-ce` が使用されます。 以下に、サポートされている安定版とエッジ版を示します。

- `17.03.0-ce`
- `17.05.0-ce`
- `17.06.0-ce`
- `17.06.1-ce`
- `17.07.0-ce`
- `19.03.8`
- `18.09.3`
- `17.09.0-ce` (default)

<!---
Consult the [Stable releases](https://download.docker.com/linux/static/stable/x86_64/) or [Edge releases](https://download.docker.com/linux/static/edge/x86_64/) for the full list of supported versions.
--->

**Note:** The `version` key is not currently supported on CircleCI Server installations. Contact your system administrator for information about the Docker version installed in your remote Docker environment.

## 環境の分離
{: #separation-of-environments }
ジョブと[リモート Docker]({{ site.baseurl }}/2.0/glossary/#remote-docker) は、独立した環境で実行されます。 したがって、ジョブ実行用に指定している Docker コンテナは、リモート Docker で実行されているコンテナと直接やり取りできません。

### サービスへのアクセス
{: #accessing-services }
{:.no_toc}

リモート Docker でサービスを開始してプライマリ コンテナから直接 ping することや、リモート Docker 内のサービスに ping できるプライマリ コンテナを開始することは**できません**。 これを解決するには、リモート Docker から同じコンテナを通してサービスとやり取りする必要があります。

```
#...
      - run:
          name: "サービスの開始および実行チェック"
          command: |
            docker run -d --name my-app my-app
            docker exec my-app curl --retry 10 --retry-connrefused http://localhost:8080
#...
```

A different way to do this is to use another container running in the same network as the target container:

```
#...
      - run: |
          docker run -d --name my-app my-app
          docker run --network container:my-app appropriate/curl --retry 10 --retry-connrefused http://localhost:8080
#...
```

### フォルダーのマウント
{: #mounting-folders }
{:.no_toc}

ジョブ空間からリモート Docker 内のコンテナにボリュームをマウントすること (およびその逆) は**できません**。 `docker cp` コマンドを使用して、この 2 つの環境間でファイルを転送することは可能です。 たとえば以下のように、ソース コードから設定ファイルを使用してリモート Docker でコンテナを開始します。

```
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

同様に、保存する必要があるアーティファクトをアプリケーションが生成する場合は、以下のようにリモート Docker からコピーできます。

```
run: |
  # アプリケーションとコンテナを開始します
  # <code>--rm</code> オプションは使用しません (使用すると、終了時にコンテナが強制終了されます)
  docker run --name app app-image:1.2.3
```

次に、以下の CircleCI `.circleci/config.yml` スニペットで `bundler-cache` コンテナにデータを挿入し、バックアップを行います。

```
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

Then, the sample CircleCI `.circleci/config.yml` snippets below populate and back up the `bundler-cache` container.

{% raw %}
``` yaml
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

### リモート Docker 環境へのアクセス
{: #accessing-the-remote-docker-environment }

リモート Docker 環境が起動されると、SSH エイリアスが作成され、リモート Docker 仮想マシンに対して SSH 接続できます。 SSH 接続は、ビルドをデバッグする場合や、Docker または VM ファイルシステムの構成を変更する場合に便利です。 リモート Docker 仮想マシンに SSH 接続するには、プロジェクトを構成するジョブ ステップ内で、または SSH 再実行中に、以下を実行します。

```
ssh remote-docker
```

**メモ:** 上記の例は、`docker` Executor で動作しないボリューム マウントを使用する方法を示しています。 この他に、ボリューム マウントが動作する `machine` Executor を使用する方法もあります。

この例は、ryansch のご協力によって作成されました。

## 関連項目
{: #see-also }

[Docker レイヤー キャッシュ]({{ site.baseurl }}/2.0/docker-layer-caching/)

[ジョブ空間]({{ site.baseurl }}/2.0/glossary/#job-space)

[プライマリ コンテナ]({{ site.baseurl }}/2.0/glossary/#primary-container)

[Docker レイヤー キャッシュ]({{ site.baseurl }}/2.0/glossary/#docker-layer-caching)
