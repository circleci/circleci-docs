---
layout: classic-docs
title: "Running Docker Commands"
short-title: "Running Docker Commands"
description: "How to build Docker images and access remote services"
categories:
  - configuring-jobs
order: 55
---
This document explains how to build Docker images for deploying elsewhere or for further testing and how to start services in remote docker containers in the following sections:

- TOC {:toc}

## Overview

To build Docker images for deployment, you must use a special `setup_remote_docker` key which creates a separate environment for each build for security. This environment is remote, fully-isolated and has been configured to execute Docker commands. ジョブの中で `docker` もしくは `docker-compose` コマンドを使う時は、`.circleci/config.yml` 内に`setup_remote_docker` ステップを挿入します。

```yaml
jobs:
  build:
    steps:
      # ... steps for building/testing app ...

      - setup_remote_docker
```

When `setup_remote_docker` executes, a remote environment will be created, and your current \[primary container\]\[primary-container\] will be configured to use it. Then, any docker-related commands you use will be safely executed in this new environment.

**Note:** `setup_remote_docker` is not currently compatible with the `machine` or the `macos` executors.

### Specifications

{:.no_toc}

The Remote Docker Environment has the following technical specifications:

CPU数 | プロセッサー | RAM | ストレージ \-----|\---\---\---\---\---\---\---\---\---|\-----|\---\--- 2 | Intel(R) Xeon(R) @ 2.3GHz | 8GB | 100GB {: class="table table-striped"}

### Example

{:.no_toc}

Following is an example of building a Docker image using `machine` with the default image:

```yaml
version: 2
jobs:
 build:
   machine: true
   steps:
     - checkout
     # start proprietary DB using private Docker image
     # with credentials stored in the UI
     - run: |
         docker login -u $DOCKER_USER -p $DOCKER_PASS
         docker run -d --name db company/proprietary-db:1.2.3

     # build the application image
     - run: docker build -t company/app:$CIRCLE_BRANCH .

     # deploy the image
     - run: docker push company/app:$CIRCLE_BRANCH
```

Following is an example where we build and push a Docker image for our [demo docker project](https://github.com/CircleCI-Public/circleci-demo-docker):

```yaml
version: 2
jobs:
  build:
    docker:
      - image: golang:1.6.4-jessie   # (1)
    working_directory: /go/src/github.com/CircleCI-Public/circleci-demo-docker
    steps:
      - checkout
      # ... steps for building/testing app ...

      - setup_remote_docker:   # (2)
          docker_layer_caching: true # (3)

      # use a primary image that already has Docker (recommended)
      # or install it during a build like we do here
      - run:
          name: Install Docker client
          command: |
            set -x
            VER="17.03.0-ce"
            curl -L -o /tmp/docker-$VER.tgz https://download.docker.com/linux/static/stable/x86_64/docker-$VER.tgz
            tar -xz -C /tmp -f /tmp/docker-$VER.tgz
            mv /tmp/docker/* /usr/bin

      # build and push Docker image
      - run: |
          TAG=0.1.$CIRCLE_BUILD_NUM
          docker build -t   CircleCI-Public/circleci-demo-docker:$TAG .      # (4)
          docker login -u $DOCKER_USER -p $DOCKER_PASS         # (5)
          docker push CircleCI-Public/circleci-demo-docker:$TAG
```

Let’s break down what’s happening during this build’s execution:

1. All commands are executed in the \[primary container\]\[primary-container\].
2. Once `setup_remote_docker` is called, a new remote environment is created, and your primary container is configured to use it. All docker-related commands are also executed in your primary container, but building/pushing images and running containers happens in the remote Docker Engine.
3. We enable \[Docker Layer Caching\]\[docker-layer-caching\] here to speed up image building.
4. We use project environment variables to store credentials for Docker Hub.

## Docker Version

ジョブによって特定のバージョンの Docker を使う必要がある場合は、`version` キーをセットします。

```yaml
      - setup_remote_docker:
          version: 17.05.0-ce
```

The currently supported versions are:

[安定版](https://download.docker.com/linux/static/stable/x86_64/) - `17.03.0-ce` (デフォルト) - `17.06.0-ce` - `17.06.1-ce` - `17.09.0-ce` - `18.03.0-ce` - `18.03.1-ce` - `18.05.0-ce`

[Edge リリース](https://download.docker.com/linux/static/edge/x86_64/) - `17.05.0-ce` - `17.07.0-ce` - `17.10.0-ce` - `17.11.0-ce` - `18.06.0-ce`

Docker をインストールした Git を含む Docker イメージを使いたい時は、`17.05.0-ce-git` を利用してください。 **注：**`version` キーは現在のところ、プライベートクラウドやオンプレミス環境の CircleCI では利用できません。 リモート環境にインストールされている Docker のバージョンについては、システム管理者に問い合わせてください。

## Separation of Environments

ジョブと[リモート Docker]({{ site.baseurl }}/2.0/glossary/#remote-docker)はそれぞれ異なる隔離された環境内で実行されます。 そのため、Docker コンテナはリモート Docker 内で稼働しているコンテナと直接やりとりすることができません。

### Accessing Services

{:.no_toc}

プライマリコンテナからリモート Docker 内のサービスを開始させたり Ping したりすることは**できません**。また、リモート Docker 内のサービスに対して Ping するようなプライマリコンテナを稼働させることも**できません**。 ただし、同じコンテナを経由する形でリモート Docker 側からサービスに対してコマンドを実行することで、この問題を解決できます。

```yaml
#...
      - run:
          name: "Start Service and Check That it’s Running"
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

### Mounting Folders

{:.no_toc}

ジョブスペースからリモート Docker 内のコンテナに（もしくはその反対でも）フォルダをマウントすることはできません。 そのような 2 つの環境間でファイルをやりとりするには、`docker cp` コマンドを使うことができます。 例えば、ソースコード内の設定ファイルを使ってリモート Docker のコンテナを起動するには、下記のように記述します。

```yaml
- run: |
    # create a dummy container which will hold a volume with config
    docker create -v /cfg --name configs alpine:3.4 /bin/true
    # copy a config file into this volume
    docker cp path/in/your/source/code/app_config.yml configs:/cfg
    # start an application container using this volume
    docker run --volumes-from configs app-image:1.2.3
```

これを応用することで、アプリケーションが生成した何らかのデータを保管しておきたいときにリモート Docker からコピーさせる、といった使い方ができます。

```yaml
- run: |
    # start container with the application
    # make sure you're not using `--rm` option otherwise the container will be killed after finish
    docker run --name app app-image:1.2.3

- run: |
    # after application container finishes, copy artifacts directly from it
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
    

以下にある `.circleci/config.yml` のサンプルスニペットも、`bundler-cache` コンテナのデータ格納やバックアップのサンプルとして参考にしてみてください。

{% raw %}

```yaml
# Populate bundler-data container from circleci cache
- restore_cache:
    keys:
      - v4-bundler-cache-{{ arch }}-{{ .Branch }}-{{ checksum "Gemfile.lock" }}
      - v4-bundler-cache-{{ arch }}-{{ .Branch }}
      - v4-bundler-cache-{{ arch }}      
- run:
    name: Restoring bundler cache into docker volumes
    command: |
      NAME=bundler-cache
      CACHE_PATH=~/bundler-cache
      set -x
      mkdir -p $CACHE_PATH
      docker-compose -f docker-compose.yml -f docker/circle-dockup.yml up --no-start $NAME
      docker cp $CACHE_PATH/. $NAME:/backup
      docker-compose -f docker-compose.yml -f docker/circle-dockup.yml up --no-recreate $NAME
      docker rm -f $NAME

# Back up the same volume to circle cache
- run:
    name: Backing up bundler cache from docker volumes
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

## See Also

[Docker Layer Caching]({{ site.baseurl }}/2.0/docker-layer-caching/)

[job-space]: {{ site.baseurl }}/2.0/glossary/#job-space [primary-container]: {{ site.baseurl }}/2.0/glossary/#primary-container [docker-layer-caching]: {{ site.baseurl }}/2.0/glossary/#docker-layer-caching