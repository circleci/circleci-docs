---
layout: classic-docs
title: "Docker レイヤー キャッシュの有効化"
short-title: "Docker レイヤー キャッシュの有効化"
description: "未変更のキャッシュ レイヤーを再利用してイメージをビルドすることにより、全体の実行時間を短縮する方法"
categories:
  - optimization
order: 70
---

Docker レイヤー キャッシュ (DLC) を利用すると、CircleCI で Docker イメージのビルド時間を短縮できます。 DLC は [Performance と Custom](https://circleci.com/ja/pricing/) の従量課金制プラン、または [CircleCI Server](https://circleci.com/ja/enterprise/) の環境でご利用になれます (ジョブ実行 1 回ごとに 200 クレジットが必要です)。 このドキュメントでは、以下のセクションに沿って、DLC について概説します。

- 目次
{:toc}

## 概要

Docker レイヤー キャッシュ (DLC) は、Docker イメージのビルドが CI/CD プロセスの一環として定期的に行われる場合に役立つすばらしい機能です。 ジョブの実行に使用する実際のコンテナには影響せず、ジョブ内で作成されるイメージ レイヤーが保存されます。

DLC では、CircleCI のジョブ中にビルドされた Docker イメージの個々のレイヤーがキャッシュされます。その後で CircleCI を実行すると、イメージ全体が毎回リビルドされるのではなく、未変更のイメージ レイヤーが再利用されます。 つまり、コミット間で Dockerfile の変更が少ないほど、イメージ ビルド ステップが短時間で完了します。

Docker レイヤー キャッシュは、[`machine` Executor]({{ site.baseurl }}/ja/2.0/executor-types/#machine-の使用) と[リモート Docker 環境]({{ site.baseurl }}/ja/2.0/building-docker-images) (`setup_remote_docker`) のどちらでも利用できます。

### 制限事項
{:.no_toc}

設定ファイルの [parallelism]({{site.baseurl}}/ja/2.0/configuration-reference/#parallelism) の値が大きい状態 (30 以上) で DLC を利用すると、古いキャッシュがプルされてしまう、キャッシュがプルされないなどの問題が発生することがあります。 たとえば以下のようなケースが考えられます。

- 30 の並列処理で 1 つのジョブを実行する場合、ワークフローが 1 つであれば正常に動作しますが、複数のワークフローがあるとキャッシュ ミスが発生します。
- 30 を超える `parallelism` で任意の数のジョブを実行する場合、ワークフローの数に関係なく、キャッシュ ミスが発生します。

キャッシュ ミスの問題が発生している場合、または高並列処理を行う必要がある場合は、実験的な [docker-registry-image-cache Orb](https://circleci.com/developer/ja/orbs/orb/cci-x/docker-registry-image-cache) をお試しください。

**メモ:** DLC は、ビルド コンテナとして使用する Docker イメージには影響を**及ぼしません**。 そのため、ジョブの*実行*に使用するコンテナは、[`docker` Executor]({{ site.baseurl }}/ja/2.0/executor-types/#docker-の使用) を使用している場合、`image` キーで指定したものが [Jobs (ジョブ)] ページの Spin up Environment ステップに表示されます。

DLC は、docker build、docker compose などの Docker コマンドを使用して独自の Docker イメージを作成する場合にのみ有効です。すべてのビルドが初期環境をスピンアップするのにかかる実時間は短縮されません。

```YAML
version: 2 
jobs: 
 build: 
   docker: 
     # ここでは、DLC は動作しません。キャッシュの状況は、イメージ レイヤーにどれだけ共通点があるかによって左右されます。
     - image: circleci/node:9.8.0-stretch-browsers 
   steps: 
     - checkout 
     - setup_remote_docker: 
         docker_layer_caching: true 
     # ここでは、DLC はレイヤーを明示的にキャッシュし、リビルドを避けようとします。
     - run: docker build .
```

## DLC のしくみ

DLC は、外部ボリュームを作成し、それを `machine` やリモート Docker のジョブを実行するインスタンスにアタッチすることで、Docker イメージ レイヤーをキャッシュします。 ボリュームのアタッチは、そのボリュームに Docker がイメージ レイヤーを保存する形で実行されます。 ジョブが終了すると、ボリュームは切断され、その後のジョブで再利用されます。 つまり、DLC によって前のジョブでダウンロードされたレイヤーは、同じ DLC ボリュームを使用する次のジョブで利用可能になります。

1 つの DLC ボリュームをアタッチできるのは、一度に 1 つの `machine` またはリモート Docker ジョブだけです。 存在する DLC ボリュームが 1 つだけで、DLC を要求するジョブが 2 つローンチされる場合、CircleCI は新しい DLC ボリュームを作成し、それを 2 番目のジョブにアタッチします。 その時点以降、プロジェクトには 2 つの DLC ボリュームが関連付けられることになります。 これは、並列ジョブにも適用されます。2 つの `machine` ジョブを並列実行している場合、これらのジョブは異なる DLC ボリュームを取得します。

ボリュームがどのジョブで使用されるかに応じて、ボリューム上に異なるレイヤーが保存される場合があります。 使用頻度が低いボリュームには、古いレイヤーが保存されている可能性があります。

DLC ボリュームは、ジョブで 7 日間使用されないと削除されます。

CircleCI で 1 つのプロジェクトに作成される DLC ボリュームの上限は 50 個です。プロジェクトごとに最大 50 個の `machine` またはリモート Docker ジョブが同時に DLC にアクセスできます。 ジョブの並列処理が考慮されるため、各プロジェクトで DLC にアクセスできるジョブの最大数は、50 個の並列処理を行うジョブの場合は 1 つ、25 個の並列処理を行うジョブの場合は 2 つとなります。

![Docker レイヤー キャッシュ]({{ site.baseurl }}/assets/img/docs/dlc_cloud.png)

### リモート Docker 環境
{:.no_toc}

リモート Docker 環境で DLC を使用するには、[config.yml]({{ site.baseurl }}/ja/2.0/configuration-reference/) ファイルで、`setup_remote_docker` キーの下に `docker_layer_caching: true` を追加します。

```YAML
- setup_remote_docker:
    docker_layer_caching: true  # デフォルトは false  
```

前のジョブでビルドされたレイヤーはすべて、リモート Docker 環境でアクセスできます。 ただし、設定ファイルで `docker_layer_caching: true` を指定している場合でも、ジョブがクリーンな環境で実行される場合があります。

同一プロジェクトの多くの並列ジョブが同じ環境に依存している場合、すべてのジョブにリモート Docker 環境が提供されます。 Docker レイヤー キャッシュは、他のジョブがアクセスできない排他的なリモート Docker 環境をジョブが使用することを保証します。 ただしジョブは、キャッシュされたレイヤーを持つ場合もあれば持たない場合もあり、すべてのジョブが同一のキャッシュを持つとも限りません。

**メモ:** 以前は、DLC は `reusable: true` キーによって有効化されていましたが、 `reusable` キーは非推奨になり、`docker_layer_caching` キーがこれに代わりました。 さらに、`exclusive: true` オプションも非推奨になり、すべてのリモート Docker VM が排他として扱われるようになりました。 つまり DLC を使用すると、ジョブは必ず、他のジョブがアクセスできない排他的リモート Docker 環境を持つことになります。

### Machine Executor
{:.no_toc}

Docker レイヤー キャッシュは、[`machine` Executor]({{ site.baseurl }}/ja/2.0/executor-types/#machine-の使用) を使用して Docker イメージをビルドする際のジョブ実行時間も短縮します。 `machine` キーの下に `docker_layer_caching: true` を追加することで (後述の[例](#configyml)を参照)、`machine` Executor で DLC を使用できます。

```YAML
machine:
  docker_layer_caching: true    # デフォルトは false
```

## 例

以下の Dockerfile を例に、Docker レイヤー キャッシュがどのように機能するかを説明します。 このサンプル Dockerfile は、[Elixir コンビニエンス イメージ](https://hub.docker.com/r/circleci/elixir/~/dockerfile)から引用して改変したものです。

### Dockerfile
{:.no_toc}

FROM elixir:1.6.5
    
    # apt を非対話化
    RUN echo 'APT::Get::Assume-Yes "true";' > /etc/apt/apt.conf.d/90circleci \
      && echo 'DPkg::Options "--force-confnew";' >> /etc/apt/apt.conf.d/90circleci
    
    ENV DEBIAN_FRONTEND=noninteractive
    
    # いくつかの基本イメージには man ディレクトリがありません
    # https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=863199
    RUN apt-get update \
      && mkdir -p /usr/share/man/man1 \
      && apt-get install -y \
        git mercurial xvfb \
        locales sudo openssh-client ca-certificates tar gzip parallel \
        net-tools netcat unzip zip bzip2 gnupg curl wget
    
    # タイムゾーンを UTC に設定
    RUN ln -sf /usr/share/zoneinfo/Etc/UTC /etc/localtime
    
    # Unicode を使用
    RUN locale-gen C.UTF-8 || true
    ENV LANG=C.UTF-8
    
    # Docker をインストール
    RUN set -ex \
      && export DOCKER_VERSION=$(curl --silent --fail --retry 3 \
        https://download.docker.com/linux/static/stable/x86_64/ | \
        grep -o -e 'docker-[.0-9]*-ce\.tgz' | sort -r | head -n 1) \
      && DOCKER_URL="https://download.docker.com/linux/static/stable/x86_64/${DOCKER_VERSION}" \
      && echo Docker URL: $DOCKER_URL \
      && curl --silent --show-error --location --fail --retry 3 --output /tmp/docker.tgz "${DOCKER_URL}" \
      && ls -lha /tmp/docker.tgz \
      && tar -xz -C /tmp -f /tmp/docker.tgz \
      && mv /tmp/docker/* /usr/bin \
      && rm -rf /tmp/docker /tmp/docker.tgz
    
    # docker-compose をインストール
    RUN curl --silent --show-error --location --fail --retry 3 --output /usr/bin/docker-compose \
        https://circle-downloads.s3.amazonaws.com/circleci-images/cache/linux-amd64/docker-compose-latest \
      && chmod +x /usr/bin/docker-compose \
      && docker-compose version
    
    # CircleCI ユーザーをセットアップ
    RUN groupadd --gid 3434 circleci \
      && useradd --uid 3434 --gid circleci --shell /bin/bash --create-home circleci \
      && echo 'circleci ALL=NOPASSWD: ALL' >> /etc/sudoers.d/50-circleci \
      && echo 'Defaults    env_keep += "DEBIAN_FRONTEND"' >> /etc/sudoers.d/env_keep
    
    USER circleci
    
    CMD ["/bin/sh"]
    

### config.yml
{:.no_toc}

以下の config.yml スニペットは、`build_elixir` ジョブで上記の Dockerfile を使用して定期的にイメージをビルドすることを前提としています。 `machine` Executor キーのすぐ下に `docker_layer_caching: true` を追加することで、この Elixir イメージがビルドされるときに CircleCI が各 Docker イメージ レイヤーを確実に保存するようになります。

```yaml
version: 2
jobs:
  build_elixir:
    machine:
      docker_layer_caching: true
    steps:
      - checkout
      - run:
          name: Elixir イメージのビルド
          command: docker build -t circleci/elixir:example .
```

ここでコミットすると、サンプルの Dockerfile が変更されていない場合、DLC が `Elixir イメージのビルド` のステップでキャッシュから各 Docker イメージ レイヤーをプルし、理論的にはほぼ瞬時にビルドが行われます。

では、Dockerfile の `# Unicode を使用`のステップと `# Docker をインストール`のステップの間に、以下のステップを追加します。

    # jq をインストール
    RUN JQ_URL="https://circle-downloads.s3.amazonaws.com/circleci-images/cache/linux-amd64/jq-latest" \
      && curl --silent --show-error --location --fail --retry 3 --output /usr/bin/jq $JQ_URL \
      && chmod +x /usr/bin/jq \
      && jq --version
    

次にコミットすると、基本イメージとして `elixir:1.6.5` のイメージがプルされ、Dockerfile の最初のいくつかのステップ (`# apt を非対話化`のステップ、`RUN apt-get update` で始まるステップ、`# タイムゾーンを UTC に設定`のステップ、`# Unicode を使用`のステップ) では、キャッシュされていたイメージ レイヤーが引き続き確実に取得されます。

しかし、`# jq をインストール`のステップは新しいステップです。Dockerfile が変更されるとイメージ レイヤー キャッシュの残りの部分は無効化されるため、このステップ以降のステップはすべて最初から実行されます。 それでも DLC が有効であれば、Dockerfile 先頭部分の未変更のレイヤーとステップのおかげで、全体的なビルド時間は短縮されます。

サンプル Dockerfile の最初のステップを変更するとしたら、別の Elixir 基本イメージからプルするような変更が考えられますが、この場合は、Dockerfile の他の部分がすべて同じままであっても、このイメージのキャッシュ全体が無効化されます。

## ビデオ：Docker レイヤー キャッシュの概要
{:.no_toc}

このビデオの例では、`setup_remote_docker` ステップで `docker_layer_caching: true` と設定されており、ジョブは Dockerfile 内のすべての手順を実行します。 2 回目以降のジョブの実行時、Dockerfile 内の変更されていないステップは再利用されます。 したがって、最初の実行時は Docker イメージのビルドに 2 分以上かかりますが、 2 回目の実行前に Dockerfile が何も変更されなかった場合、これらのステップは一瞬 (0 秒) で完了します。

```yaml
version: 2 
jobs: 
 build: 
   docker: 
     - image: circleci/node:9.8.0-stretch-browsers 
   steps: 
     - checkout 
     - setup_remote_docker: 
         docker_layer_caching: true 
     - run: docker build . 
```

次のジョブ実行までにイメージ内のレイヤーがまったく変更されなかった場合、DLC はイメージ全体をリビルドするのではなく、以前にビルドされたイメージのキャッシュからレイヤーをプルして再利用します。

Dockerfile の一部を変更し、それによってイメージの一部が変更された場合でも、変更後の Dockerfile を使用してまったく同じジョブを実行すると、イメージ全体をリビルドするよりも短時間で完了できます。 これは、Dockerfile 内の変更されなかった最初の数ステップにはキャッシュが使用されるためです。 Dockerfile を変更するとキャッシュが無効化されるため、加えられた変更以降のステップは再度実行されます。

したがって、Dockerfile に何らかの変更を加えた場合、それ以降のステップはすべて無効化され、レイヤーをリビルドされます。 しかし、一部のステップ (削除したステップよりも前のステップ) が変更されていない場合、それらのステップは再利用できます。 そのため、イメージ全体をリビルドするよりも処理が高速になります。

<div class="video-wrapper">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/AL7aBN7Olng" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
</div>
