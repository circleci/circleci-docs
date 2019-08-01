---
layout: classic-docs
title: "Docker レイヤーキャッシュの有効化"
short-title: "Docker レイヤーキャッシュの有効化"
description: "未変更のキャッシュレイヤーを再利用してイメージをビルドすることにより、全体の実行時間を短縮する方法"
categories:
  - optimization
order: 70
---

{% include beta-premium-feature.html feature='Docker Layer Caching' %}

ここでは、CircleCI で Docker イメージのビルド時間を短縮できる Docker レイヤーキャッシュ (DLC) について概要を説明します。

- 目次
{:toc}

## 概要

Docker レイヤーキャッシュ (DLC) は、CI/CD プロセスの一環として Docker イメージのビルドが定期的に行われる場合に役立つすばらしい機能です。 DLC では、作成されるイメージレイヤーがジョブ内に保存されるため、ジョブの実行に使用される実際のコンテナには影響が及びません。

DLC では、CircleCI のジョブ中にビルドされた Docker イメージの各レイヤーがキャッシュされます。その後で CircleCI を実行すると、イメージ全体が毎回リビルドされるのではなく、未変更のイメージレイヤーが再利用されます。 つまり、コミット間で Dockerfile の変更が少ないほど、イメージビルドステップが短時間で完了します。

Docker レイヤーキャッシュは、[`machine` Executor]({{ site.baseurl }}/ja/2.0/executor-types/#machine-を使用する) と[リモート Docker 環境]({{ site.baseurl }}/ja/2.0/building-docker-images) (`setup_remote_docker`) のどちらでも使用できます。

### 制限について

{:.no_toc}

**メモ：** DLC は、ビルドコンテナとして使用される Docker イメージには影響を**及ぼしません**。 そのため、ジョブを*実行*するために使用されるコンテナは、[`docker` Executor]({{ site.baseurl }}/ja/2.0/executor-types/#docker-を使用する) を使用している場合、`image` キーで指定され、[Jobs (ジョブ)] ページの Spin up Environment ステップに表示されます。

DLC は、docker build、docker compose などの Docker コマンドを使用して独自の Docker イメージを作成する場合にのみ有効です。すべてのビルドが初期環境をスピンアップするのにかかる実測時間は短縮されません。

```YAML
version: 2
jobs:
 build:
   docker:
     # ここでは、DLC は何もしません。キャッシュの状況は、イメージレイヤーにどれだけ共通点があるかによって左右されます。
     - image: circleci/node:9.8.0-stretch-browsers
   steps:
     - checkout
     - setup_remote_docker:
         docker_layer_caching: true
     # ここでは、DLC はレイヤーを明示的にキャッシュし、リビルドを避けようとします。
     - run: docker build .
```

## DLC の仕組み

DLC は、外部ボリュームを作成し、それを `machine` やリモート Docker のジョブを実行するインスタンスにアタッチすることで、Docker イメージレイヤーをキャッシュします。 ボリュームのアタッチは、アタッチされるボリュームに Docker がイメージレイヤーを保存するような方法で実行されます。 ジョブが終了すると、ボリュームは切断され、その後のジョブで再利用されます。 つまり、DLC を使用して前のジョブでダウンロードされたレイヤーは、同じ DLC ボリュームを使用する次のジョブで使用できます。

1つの DLC ボリュームをアタッチできるのは、一度に 1つの `machine` またはリモート Docker ジョブだけです。 存在する DLC ボリュームが 1つだけで、DLC を要求するジョブが 2つローンチされる場合、CircleCI は新しい DLC ボリュームを作成し、それを 2番目のジョブにアタッチします。 プロジェクトでは、その時点以降、2つの DLC ボリュームが関連付けられることになります。 これは、並列ジョブにも適用されます。2つの `machine` ジョブを並列実行している場合、これらのジョブは異なる DLC ボリュームを取得します。

ボリュームがどのジョブで使用されるかに応じて、ボリューム上に異なるレイヤーが保存される場合があります。 使用頻度が低いボリュームには、古いレイヤーが保存されている可能性があります。

DLC ボリュームは、ジョブで 14日間使用されないと、削除されます。

CircleCI で 1つのプロジェクトに作成される DLC ボリュームの上限は 50個です。プロジェクトごとに最大 50個の同時 `machine` またはリモート Docker ジョブが DLC にアクセスできます。 これはジョブの並列処理を考慮するため、各プロジェクトで DLC にアクセスできるジョブの最大数は、50個の並列処理があるジョブの場合は 1つ、25個の並列処理があるジョブの場合は 2つとなります。

## DLC の有効化

**メモ：**CircleCI 営業担当者に依頼して有料の Docker レイヤーキャッシュを circleci.com アカウントで有効にするには、[サポートチケットをオープン](https://support.circleci.com/hc/ja/requests/new)する必要があります。 ユーザー自身のデータセンターまたはプライベートクラウドでホスティングされている CircleCI では、DLC をデフォルトで使用できます。

### リモート Docker 環境

{:.no_toc}

リモート Docker 環境で DLC を使用するには、[config.yml]({{ site.baseurl }}/ja/2.0/configuration-reference/) ファイルで、`setup_remote_docker` キーの下に `docker_layer_caching: true` を追加します。

```YAML
- setup_remote_docker:
    docker_layer_caching: true  # デフォルトは false
```

前のジョブでビルドされたレイヤーはすべて、リモート Docker 環境でアクセスできます。 ただし、設定で `docker_layer_caching: true` が指定されている場合でも、ジョブがクリーンな環境で実行される場合があります。

同一プロジェクトの多くの並列ジョブが同一環境に依存している場合、それらを実行すると、すべてのジョブにリモート Docker 環境が提供されます。 Docker レイヤーキャッシュは、他のジョブがアクセスできない排他的リモート Docker 環境をジョブが持つことを保証します。 しかしジョブは、キャッシュされたレイヤーを持つ場合も持たない場合もあり、また、すべてのジョブが同一のキャッシュを持つとは限りません。

**メモ：**以前 DLC は `reusable: true` キーによって有効化されていました。 `reusable` キーは非推奨になり、`docker_layer_caching` キーがこれに代わりました。 さらに、`exclusive: true` オプションも非推奨になり、すべてのリモート Docker VM が排他として扱われるようになりました。 つまり、DLC を使用すると、ジョブは必ず、他のジョブがアクセスできない排他的リモート Docker 環境を持つことになります。

### Machine Executor

{:.no_toc}

Docker レイヤーキャッシュは、[`machine` Executor]({{ site.baseurl }}/ja/2.0/executor-types/#machine-を使用する) を使用して Docker イメージをビルドする際のジョブ実行時間を短縮することもできます。 `machine` キーの下に `docker_layer_caching: true` を追加することで (前述の[例](#configyml)を参照)、`machine` Executor で DLC を使用できます。

```YAML
machine:
  docker_layer_caching: true    # デフォルトは false
```

## サンプル

以下の Dockerfile を例に、Docker レイヤーキャッシュがどのように機能するかを説明します。 この Dockerfile サンプルは、[Elixir コンビニエンスイメージ](https://hub.docker.com/r/circleci/elixir/~/dockerfile)から引用して改変したものです。

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


### Config.yml

{:.no_toc}

以下の config.yml スニペットは、`build_elixir` ジョブが上記の Dockerfile を使用して定期的にイメージをビルドすることを前提としています。 `machine` executor キーのすぐ下に `docker_layer_caching: true` を追加することで、この Elixir イメージがビルドされるときに CircleCI が各 Docker イメージレイヤーを確実に保存されるようになります。

```yaml
version: 2
jobs:
  build_elixir:
    machine:
      docker_layer_caching: true
    steps:
      - checkout
      - run:
          name: Elixir イメージをビルド
          command: docker build -t circleci/elixir:example .
```

後続のコミットでは、サンプルの Dockerfile が変更されていない場合、DLC は ` Elixir イメージをビルド`のステップでキャッシュから各 Docker イメージレイヤーをプルし、理論的にはほぼ瞬時にイメージがビルドされます。

次に、以下のステップを Dockerfile の `# Unicode を使用`のステップと `# Docker をインストール`のステップの間に追加します。

    # jq をインストール
    RUN JQ_URL="https://circle-downloads.s3.amazonaws.com/circleci-images/cache/linux-amd64/jq-latest" \
      && curl --silent --show-error --location --fail --retry 3 --output /usr/bin/jq $JQ_URL \
      && chmod +x /usr/bin/jq \
      && jq --version


次のコミットで DLC は、基本イメージとして `elixir:1.6.5` からプルし、Dockerfile の最初のいくつかのステップ、つまり `# apt を非対話化`のステップ、`RUN apt-get update` で始まるステップ、`# タイムゾーンを UTC に設定`のステップ、および `# Unicode を使用`のステップのキャッシュされたイメージレイヤーが引き続き確実に取得されるようにします。

しかし、`# jq をインストール`のステップは新しいステップです。Dockerfile が変更されるとイメージレイヤーキャッシュの残りの部分は無効化されるため、このステップ以降のすべてのステップは最初から実行される必要があります。 それでも DLC が有効であれば、Dockerfile の先頭部分にある未変更のレイヤーとステップのおかげで、全体的なビルド時間は短縮されます。

サンプルの Dockerfile の最初のステップを変更する場合は、別の Elixir 基本イメージからプルする方がよいでしょう。この場合、Dockerfile の他の部分がすべて同じままであっても、このイメージのキャッシュ全体が無効化されます。

## ビデオ：Docker レイヤーキャッシュの概要

{:.no_toc}

このビデオの例では、`setup_remote_docker` ステップの `docker_layer_caching: true` により、ジョブが Dockerfile 内のすべての手順を実行します。 2回目以降のジョブの実行時、Dockerfile 内の変更されていないステップは再利用されます。 したがって、最初の実行時は Docker イメージのビルドに 2分以上かかります。 2回目の実行前に Dockerfile が何も変更されなかった場合、これらのステップは一瞬 (0 秒) で完了します。

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

Dockerfile の一部を変更し、それによってイメージの一部が変更された場合でも、変更後の Dockerfile を使用してまったく同じジョブを実行すると、イメージ全体をリビルドするよりも短時間で完了できます。 これは、Dockerfile 内の変更されなかった最初の数ステップにはキャッシュが使用されるためです。 Dockerfile を変更するとキャッシュが無効化されるため、加えられた変更以降のステップは再度実行する必要があります。

したがって、Dockerfile に何らかの変更を加えた場合、それ以降のステップはすべて無効化され、レイヤーをリビルドする必要が出てきます。 しかし、一部のステップ (削除したステップよりも前のステップ) が変更されていない場合、それらのステップは再利用できます。 そのため、イメージ全体をリビルドするよりも処理が高速になります。

<div class="video-wrapper">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/AL7aBN7Olng" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
</div>
