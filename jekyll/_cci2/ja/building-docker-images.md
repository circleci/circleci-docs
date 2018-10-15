---
layout: classic-docs
title: "Docker コマンドの実行手順"
short-title: "Docker コマンドの実行手順"
description: "Docker イメージのビルドとリモートサービスへのアクセスの方法"
categories:
  - configuring-jobs
order: 55
---
このドキュメントでは、Docker イメージをビルドして他の場所にデプロイ、または詳細テストを行う方法、およびリモート Docker コンテナでサービスを開始する方法について説明します。このドキュメントには以下のセクションがあります。

- TOC {:toc}

## 概要

デプロイ用の Docker イメージをビルドするには、セキュアなビルドを実現するため、ビルドごとに異なる環境を作成する `setup_remote_docker` という特別なキーを使います。 これは完全に隔離され、Docker コマンドの実行用に構成されたリモート環境ですす。 ジョブの中で `docker` もしくは `docker-compose` コマンドを使う時は、`.circleci/config.yml` 内に`setup_remote_docker` ステップを挿入します。

```yaml
jobs:
  build:
    steps:
      # ... アプリのビルド/テスト用の手順 ...

      - setup_remote_docker
```

`setup_remote_docker` が実行されるとリモート環境が作成され、現在の \[primary container\]\[primary-container\] がそのリモート環境用に構成されます。 その後は、Docker に関連するコマンドはすべて、この新しい環境で安全に実行されるようになります。

**※**`setup_remote_docker` は、現在のところ `machine` および `macos` Executor とは一緒に使えません。

### 仕様

{:.no_toc}

リモート Docker 環境の技術仕様は次のとおりです。

CPU数 | プロセッサー | RAM | ストレージ \-----|\---\---\---\---\---\---\---\---\---|\-----|\---\--- 2 | Intel(R) Xeon(R) @ 2.3GHz | 8GB | 100GB {: class="table table-striped"}

### 例

{:.no_toc}

`machine` を使用して、デフォルトイメージで Docker イメージをビルドする例を次に示します。

```yaml
version: 2
jobs:
 build:
   machine: true
   steps:
     - checkout
     # UI に保管されている資格情報を使用して
     # プライベート Docker イメージによる専用 DB を開始する
     - run: |
         docker login -u $DOCKER_USER -p $DOCKER_PASS
         docker run -d --name db company/proprietary-db:1.2.3

     # アプリケーションイメージをビルドする
     - run: docker build -t company/app:$CIRCLE_BRANCH .

     # イメージをデプロイする
     - run: docker push company/app:$CIRCLE_BRANCH
```

弊社の [Docker デモ用プロジェクト](https://github.com/CircleCI-Public/circleci-demo-docker)の Docker イメージのビルドとプッシュに使用されている例を、次に示します。

```yaml
version: 2
jobs:
  build:
    docker:
      - image: golang:1.6.4-jessie   # (1)
    working_directory: /go/src/github.com/CircleCI-Public/circleci-demo-docker
    steps:
      - checkout
      # ... アプリのビルドおよびテストの手順は次のとおりです。

      - setup_remote_docker:   # (2)
          docker_layer_caching: true # (3)

      # Docker が既に存在するプライマリイメージを使う (推奨) か
      # 以下のようにビルド中にインストールします
      - run:
          name: Install Docker client
          command: |
            set -x
            VER="17.03.0-ce"
            curl -L -o /tmp/docker-$VER.tgz https://download.docker.com/linux/static/stable/x86_64/docker-$VER.tgz
            tar -xz -C /tmp -f /tmp/docker-$VER.tgz
            mv /tmp/docker/* /usr/bin

      # Docker イメージのビルドとプッシュ
      - run: |
          TAG=0.1.$CIRCLE_BUILD_NUM
          docker build -t   CircleCI-Public/circleci-demo-docker:$TAG .      # (4)
          docker login -u $DOCKER_USER -p $DOCKER_PASS         # (5)
          docker push CircleCI-Public/circleci-demo-docker:$TAG
```

このビルドの実行中に行われる動作の詳細は次のとおりです。

1. すべてのコマンドは、\[primary container\]\[primary-container\] 内で実行されます。
2. `setup_remote_docker` が呼び出されると、新たなリモート環境が作成され、プライマリコンテナはそのリモート環境用に設定されます。 Docker 関連のコマンドはすべてプライマリコンテナ内でも実行されますが、イメージのビルド/プッシュおよびコンテナの実行は、リモート Docker エンジン内で処理されます。
3. Docker イメージのビルド高速化のため \[Docker レイヤーキャッシュ\]\[docker-layer-caching\] をここで有効にしています
4. プロジェクト環境変数を使用して、Docker Hub の資格情報を保存します。

## Docker のバージョン

ジョブによって特定のバージョンの Docker を使う必要がある場合は、`version` キーをセットします。

```yaml
      - setup_remote_docker:
          version: 17.05.0-ce
```

現在サポートしているバージョンは次のとおりです。

[安定版](https://download.docker.com/linux/static/stable/x86_64/) - `17.03.0-ce` (デフォルト) - `17.06.0-ce` - `17.06.1-ce` - `17.09.0-ce` - `18.03.0-ce` - `18.03.1-ce` - `18.05.0-ce`

[Edge リリース](https://download.docker.com/linux/static/edge/x86_64/) - `17.05.0-ce` - `17.07.0-ce` - `17.10.0-ce` - `17.11.0-ce` - `18.06.0-ce`

Docker をインストールした Git を含む Docker イメージを使いたい時は、`17.05.0-ce-git` を利用してください。 **注：**`version` キーは現在のところ、プライベートクラウドやオンプレミス環境の CircleCI では利用できません。 リモート環境にインストールされている Docker のバージョンについては、システム管理者に問い合わせてください。

## 環境の分離

ジョブと[リモート Docker]({{ site.baseurl }}/2.0/glossary/#remote-docker)はそれぞれ異なる隔離された環境内で実行されます。 そのため、Docker コンテナはリモート Docker 内で稼働しているコンテナと直接やりとりすることはできません。

### サービスへのアクセス方法

{:.no_toc}

プライマリコンテナからリモート Docker 内のサービスを開始させたり Ping したりすることは**できません**。また、リモート Docker 内のサービスに対して Ping するようなプライマリコンテナを稼働させることも**できません**。 ただし、同じコンテナを経由する形でリモート Docker 側からサービスに対してコマンドを実行することで、この問題を解決できます。

```yaml
#...
      - run:
          name: "サービスを起動し実行状況をチェックする"
          command: |
            docker run -d --name my-app my-app
            docker exec my-app curl --retry 10 --retry-connrefused http://localhost:8080
#...
```

あるいは、ターゲットとするコンテナと同じネットワーク内で実行しているもう 1 つのコンテナを使う方法もあります。

```yaml
#...
      - run: |
          docker run -d --name my-app my-app
          docker run --network container:my-app appropriate/curl --retry 10 --retry-connrefused http://localhost:8080
#...
```

### フォルダのマウント

{:.no_toc}

ジョブスペースからリモート Docker 内のコンテナに (もしくはその反対でも) フォルダをマウントすることは**できません**。 そのような 2 つの環境間でファイルをやりとりするには、`docker cp` コマンドを使うことができます。 例えば、ソースコード内の設定ファイルを使ってリモート Docker のコンテナを起動するには、下記のように記述します。

```yaml
- run: |
    # 設定ファイルのコピー先ボリューム用のダミーコンテナを作成します
    docker create -v /cfg --name configs alpine:3.4 /bin/true
    # 設定ファイルをダミーコンテナのボリュームにコピーします
    docker cp path/in/your/source/code/app_config.yml configs:/cfg
    # このボリュームを使ってアプリエーションコンテナを起動します
    docker run --volumes-from configs app-image:1.2.3
```

これを応用することで、アプリケーションが生成した何らかのデータを保管したいときに、リモート Docker からコピーさせる、という使い方ができます。

```yaml
- run: |
    # アプリケーションとともにコンテナを起動します
    # 「--rm」オプションを指定してはいけません。終了時にコンテナが kill されてしまいます
    docker run --name app app-image:1.2.3

- run: |
    # アプリケーションコンテナが終了した後、そこからアーティファクトが直接コピーされます
    docker cp app:/output /path/in/your/job/space
```

https://github.com/outstand/docker-dockup や、下記で示したようなコンテナを活用する `circle-dockup.yml` ファイルを使ったデータバックアップ・リストア用のイメージを利用するのもおすすめです。

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
    

以下にある `.circleci/config.yml` のサンプルスニペットも、`bundler-cache` コンテナのデータ格納やバックアップのサンプルとして参考にしてください。

{% raw %}

```yaml
# CircleCI キャッシュから bundler-data コンテナを格納する
- restore_cache:
    keys:
      - v4-bundler-cache-{{ arch }}-{{ .Branch }}-{{ checksum "Gemfile.lock" }}
      - v4-bundler-cache-{{ arch }}-{{ .Branch }}
      - v4-bundler-cache-{{ arch }}      
- run:
    name: bundler cache を Docker ボリュームにリストア
    command: |
      NAME=bundler-cache
      CACHE_PATH=~/bundler-cache
      set -x
      mkdir -p $CACHE_PATH
      docker-compose -f docker-compose.yml -f docker/circle-dockup.yml up --no-start $NAME
      docker cp $CACHE_PATH/. $NAME:/backup
      docker-compose -f docker-compose.yml -f docker/circle-dockup.yml up --no-recreate $NAME
      docker rm -f $NAME

# 同じボリュームを CircleCI キャッシュにバックアップする
- run:
    name: bundler キャッシュを Docker ボリュームから バックアップ
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

これらのサンプルコードは ryansch 氏より提供していただきました。

## その他の参考資料

[Docker レイヤーキャッシュ]({{ site.baseurl }}/2.0/docker-layer-caching/)

[job-space]: {{ site.baseurl }}/2.0/glossary/#job-space [primary-container]: {{ site.baseurl }}/2.0/glossary/#primary-container [docker-layer-caching]: {{ site.baseurl }}/2.0/glossary/#docker-layer-caching