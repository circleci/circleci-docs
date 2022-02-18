---
layout: classic-docs
title: "Docker レイヤー キャッシュの有効化"
short-title: "Docker レイヤー キャッシュの有効化"
description: "未変更のキャッシュ レイヤーを再利用してイメージをビルドすることにより、全体の実行時間を短縮する方法"
categories:
  - 最適化
order: 70
version:
  - クラウド
  - Server v3.x
  - Server v2.x
---

Docker レイヤー キャッシュ (DLC) を利用すると、CircleCI で Docker イメージのビルド時間を短縮できます。 DLC is available on the [Free and above](https://circleci.com/pricing/) usage plans (credits are charged per run job) and on installations of [CircleCI server](https://circleci.com/enterprise/). このドキュメントでは、以下のセクションに沿って、DLC について概説します。

* 目次
{:toc}

## 概要
{: #overview }

Docker レイヤー キャッシュ (DLC) は、Docker イメージのビルドが CI/CD プロセスの一環として定期的に行われる場合に役立つ優れた機能です。 DLC では、作成されるイメージレイヤーがジョブ内に保存されるため、ジョブの実行に使用される実際のコンテナには影響が及びません。

DLC では、CircleCI のジョブ中にビルドされた Docker イメージの各レイヤーがキャッシュされます。 その後で CircleCI を実行すると、イメージ全体が毎回リビルドされるのではなく、未変更のイメージレイヤーが再利用されます。 つまり、コミット間で Dockerfile の変更が少ないほど、イメージ ビルド ステップが短時間で完了します。

Docker レイヤー キャッシュは、[`machine` Executor]({{ site.baseurl }}/2.0/executor-types/#using-machine) と[リモート Docker 環境]({{ site.baseurl }}/2.0/building-docker-images) (`setup_remote_docker`) のどちらでも利用できます。

### 制限事項
{: #limitations }
{:.no_toc}

設定ファイルの [parallelism]({{site.baseurl}}/2.0/configuration-reference/#parallelism) の値が大きい状態 (30 以上) で DLC を利用すると、古いキャッシュがプルされてしまう、キャッシュがプルされないなどの問題が発生することがあります。 たとえば、次のとおりです。

- 30 の並列処理で 1 つのジョブを実行する場合、ワークフローが 1 つであれば正常に動作しますが、複数のワークフローがあるとキャッシュ ミスが発生します。
- 30 を超える `parallelism` で任意の数のジョブを実行する場合、ワークフローの数に関係なく、キャッシュ ミスが発生します。

キャッシュ ミスの問題が発生している場合、または高並列処理を行う必要がある場合は、実験的な [docker-registry-image-cache Orb](https://circleci.com/developer/ja/orbs/orb/cci-x/docker-registry-image-cache) をお試しください。

**注:** DLC は、ビルド コンテナとして使用する Docker イメージには影響を**及ぼしません**。 そのため、ジョブの_実行_に使用するコンテナは、[`docker` Executor]({{ site.baseurl }}/2.0/executor-types/#using-docker) を使用している場合、`image` キーで指定したものが [Jobs (ジョブ)] ページの [Spin up Environment (環境のスピンアップ)] ステップに表示されます。

DLC is only useful when creating your own Docker image  with docker build, docker compose, or similar docker commands, it does not decrease the wall clock time that all builds take to spin up the initial environment.

```yml
version: 2
jobs:
  build:
    docker:
      # DLC does nothing here, its caching depends on commonality of the image layers.
      キャッシュの状況は、イメージ レイヤーにどれだけ共通点があるかに左右されます。
      - image: circleci/node:9.8.0-stretch-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    steps:
      - checkout
      - setup_remote_docker:
          docker_layer_caching: true
      # ここでは、DLC はレイヤーを明示的にキャッシュし、リビルドを避けようとします。
      - run: docker build .
      - run: docker build .
```

## DLC のしくみ
{: #how-dlc-works }

DLC は、外部ボリュームを作成し、それを `machine` やリモート Docker ジョブを実行するインスタンスにアタッチすることで、Docker イメージレイヤーをキャッシュします。 ボリュームのアタッチは、アタッチ対象のボリュームに Docker がイメージ レイヤーを保存する形で実行されます。 ジョブが終了すると、ボリュームは切断され、その後のジョブで再利用されます。 つまり、DLC によって前のジョブでダウンロードされたレイヤーは、同じ DLC ボリュームを使用する次のジョブで利用可能になります。

1つの DLC ボリュームをアタッチできるのは、一度に 1つの `machine` またはリモート Docker ジョブだけです。 存在する DLC ボリュームが 1つだけで、DLC を要求するジョブが 2 つローンチされる場合、CircleCI は新しい DLC ボリュームを作成し、それを 2 番目のジョブにアタッチします。 プロジェクトでは、その時点以降、2 つの DLC ボリュームが関連付けられることになります。 これは、並列ジョブにも適用されます。 2つの `machine` ジョブを並列実行している場合、これらのジョブは異なる DLC ボリュームを取得します。

ボリュームがどのジョブで使用されるかに応じて、ボリューム上に異なるレイヤーが保存される場合があります。 使用頻度が低いボリュームには、古いレイヤーが保存されている可能性があります。

DLC ボリュームは、ジョブで 3 日間使用されないと削除されます。

CircleCI で 1 つのプロジェクトに作成される DLC ボリュームの上限は 50 個です。 プロジェクトごとに最大 50 個の `machine` またはリモート Docker ジョブが同時に DLC にアクセスできます。 これはジョブの並列処理を考慮するため、各プロジェクトで DLC にアクセスできるジョブの最大数は、50 個の並列処理があるジョブの場合は 1 つ、25 個の並列処理があるジョブの場合は 2 つとなります。

![Docker レイヤー キャッシュ]({{ site.baseurl }}/assets/img/docs/dlc_cloud.png)

### キャッシュの対象範囲
{: #scope-of-cache }
DLC が有効な場合、リモート ボリュームには `/var/lib/docker` の全体がキャッシュされます。 これには、前のジョブで作成されたカスタム ネットワークもすべて含まれます。

### リモート Docker 環境
{: #remote-docker-environment }
{:.no_toc}

リモート Docker 環境で DLC を使用するには、[config.yml]({{ site.baseurl }}/2.0/configuration-reference) ファイルで、`setup_remote_docker` キーの下に `docker_layer_caching: true` を追加します。

```yml
- setup_remote_docker:
    docker_layer_caching: true  # デフォルトは false
```

前のジョブでビルドされたレイヤーはすべて、リモート Docker 環境でアクセスできます。 ただし、設定で `docker_layer_caching: true` が指定されている場合でも、ジョブがクリーンな環境で実行される場合があります。

同一プロジェクトの多くの同時実行ジョブが同じ環境に依存している場合、それらを実行すると、すべてのジョブにリモート Docker 環境が提供されます。 Docker レイヤー キャッシュは、他のジョブがアクセスできない排他的リモート Docker 環境をジョブが持つことを保証します。 しかしジョブは、キャッシュされたレイヤーを持つ場合も持たない場合もあり、また、すべてのジョブが同一のキャッシュを持つとは限りません。

**注:** 以前、DLC は、`reusable: true` キーによって有効化されていましたが、 `reusable` キーは非推奨になり、`docker_layer_caching` キーがこれに代わりました。 `reusable` キーは非推奨になり、`docker_layer_caching` キーがこれに代わりました。 さらに、`exclusive: true` オプションも非推奨になり、すべてのリモート Docker VM が排他として扱われるようになりました。 つまり、DLC を使用すると、ジョブは必ず、他のジョブがアクセスできない排他的リモート Docker 環境を持つことになります。

### machine Executor
{: #machine-executor }
{:.no_toc}

Docker レイヤーキャッシュは、[`machine` Executor]({{ site.baseurl }}/ja/2.0/executor-types/#using-machine) を使用して Docker イメージをビルドする際のジョブ実行時間を短縮することもできます。 `machine` キーの下に `docker_layer_caching: true` を追加することで (後述の[例](#configyml)を参照)、`machine` Executor で DLC を使用できます。

```yml
machine:
  image: ubuntu-2004:202104-01  # any available image
  docker_layer_caching: true    # default - false
```

## 例
{: #examples }

以下の Dockerfile を例に、Docker レイヤー キャッシュがどのように機能するかを説明します。 この Dockerfile サンプルは、[Elixir 用 Circle CI イメージ](https://hub.docker.com/r/circleci/elixir/~/dockerfile)から引用して改変したものです。

### Dockerfile
{: #dockerfile }
{:.no_toc}

```dockerfile
FROM elixir:1.11.4

# make Apt non-interactive
RUN echo 'APT::Get::Assume-Yes "true";' > /etc/apt/apt.conf.d/90circleci \
  && echo 'DPkg::Options "--force-confnew";' >> /etc/apt/apt.conf.d/90circleci

ENV DEBIAN_FRONTEND=noninteractive

# Debian Jessie is EOL'd and original repos do not work.
# Switch to the archive mirror until we can get people to
# switch to Stretch.
RUN if grep -q Debian /etc/os-release && grep -q jessie /etc/os-release; then \
    rm /etc/apt/sources.list \
    && echo "deb http://archive.debian.org/debian/ jessie main" >> /etc/apt/sources.list \
    && echo "deb http://security.debian.org/debian-security jessie/updates main" >> /etc/apt/sources.list \
    ; fi

# Make sure PATH includes ~/.local/bin
# https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=839155
# This only works for root. The circleci user is done near the end of this Dockerfile
RUN echo 'PATH="$HOME/.local/bin:$PATH"' >> /etc/profile.d/user-local-path.sh

# man directory is missing in some base images
# https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=863199
RUN apt-get update \
  && mkdir -p /usr/share/man/man1 \
  && apt-get install -y \
    git mercurial xvfb apt \
    locales sudo openssh-client ca-certificates tar gzip parallel \
    net-tools netcat unzip zip bzip2 gnupg curl wget make


# Set timezone to UTC by default
RUN ln -sf /usr/share/zoneinfo/Etc/UTC /etc/localtime

# Use unicode
RUN locale-gen C.UTF-8 || true
ENV LANG=C.UTF-8

# install jq
RUN JQ_URL="https://circle-downloads.s3.amazonaws.com/circleci-images/cache/linux-amd64/jq-latest" \
  && curl --silent --show-error --location --fail --retry 3 --output /usr/bin/jq $JQ_URL \
  && chmod +x /usr/bin/jq \
  && jq --version

# Install Docker

#>    # To install, run the following commands as root:
#>    curl -fsSLO https://download.docker.com/linux/static/stable/x86_64/docker-17.05.0-ce.tgz && tar --strip-components=1 -xvzf docker-17.05.0-ce.tgz -C /usr/local/bin
#>
#>    # Then start docker in daemon mode:
#>    /usr/local/bin/dockerd

RUN set -ex \
  && export DOCKER_VERSION=docker-19.03.12.tgz \
  && DOCKER_URL="https://download.docker.com/linux/static/stable/x86_64/${DOCKER_VERSION}" \
  && echo Docker URL: $DOCKER_URL \
  && curl --silent --show-error --location --fail --retry 3 --output /tmp/docker.tgz "${DOCKER_URL}" \
  && ls -lha /tmp/docker.tgz \
  && tar -xz -C /tmp -f /tmp/docker.tgz \
  && mv /tmp/docker/* /usr/bin \
  && rm -rf /tmp/docker /tmp/docker.tgz \
  && which docker \
  && (docker version || true)

# docker compose
RUN COMPOSE_URL="https://circle-downloads.s3.amazonaws.com/circleci-images/cache/linux-amd64/docker-compose-latest" \
  && curl --silent --show-error --location --fail --retry 3 --output /usr/bin/docker-compose $COMPOSE_URL \
  && chmod +x /usr/bin/docker-compose \
  && docker-compose version

# install dockerize
RUN DOCKERIZE_URL="https://circle-downloads.s3.amazonaws.com/circleci-images/cache/linux-amd64/dockerize-latest.tar.gz" \
  && curl --silent --show-error --location --fail --retry 3 --output /tmp/dockerize-linux-amd64.tar.gz $DOCKERIZE_URL \
  && tar -C /usr/local/bin -xzvf /tmp/dockerize-linux-amd64.tar.gz \
  && rm -rf /tmp/dockerize-linux-amd64.tar.gz \
  && dockerize --version

RUN groupadd --gid 3434 circleci \
  && useradd --uid 3434 --gid circleci --shell /bin/bash --create-home circleci \
  && echo 'circleci ALL=NOPASSWD: ALL' >> /etc/sudoers.d/50-circleci \
  && echo 'Defaults    env_keep += "DEBIAN_FRONTEND"' >> /etc/sudoers.d/env_keep

# BEGIN IMAGE CUSTOMIZATIONS

# END IMAGE CUSTOMIZATIONS

USER circleci
ENV PATH /home/circleci/.local/bin:/home/circleci/bin:${PATH}

CMD ["/bin/sh"]
```

### config.yml
{: #configyml }
{:.no_toc}

以下の config.yml スニペットは、`build_elixir` ジョブが上記の Dockerfile を使用して定期的にイメージをビルドすることを前提としています。 `machine` Executor キーのすぐ下に `docker_layer_caching: true` を追加することで、この Elixir イメージがビルドされるときに CircleCI で各 Docker イメージ レイヤーが確実に保存されるようになります。

```yaml
version: 2
jobs:
  build_elixir:
    machine:
      image: ubuntu-2004:202104-01
      docker_layer_caching: true
    steps:
      - checkout
      - run:
          name: Elixir イメージのビルド
          command: docker build -t circleci/elixir:example .
```

後続のコミットでは、サンプルの Dockerfile が変更されていない場合、DLC は `Elixir イメージのビルド`のステップでキャッシュから各 Docker イメージ レイヤーをプルし、理論的にはほぼ瞬時にイメージがビルドされます。

では、Dockerfile の `# Unicode を使用`のステップと `# Docker をインストール`のステップの間に、以下のステップを追加します。

```dockerfile
# jq をインストール
RUN JQ_URL="https://circle-downloads.s3.amazonaws.com/circleci-images/cache/linux-amd64/jq-latest" \
  && curl --silent --show-error --location --fail --retry 3 --output /usr/bin/jq $JQ_URL \
  && chmod +x /usr/bin/jq \
  && jq --version
```

On the next commit, DLC will ensure that we still get cached image layers for the first few steps in our Dockerfile—pulling from `elixir:1.11.4` as our base image, the `# make apt non-interactive` step, the step starting with `RUN apt-get update`, the `# set timezone to UTC` step, and the `# use unicode` step.

しかし、`# jq をインストール`のステップは新しいステップです。 Dockerfile が変更されるとイメージ レイヤー キャッシュの残りの部分は無効化されるため、このステップ以降のステップはすべて最初から実行されます。 それでも DLC が有効であれば、Dockerfile の先頭部分にある未変更のレイヤーとステップのおかげで、全体的なビルド時間は短縮されます。

サンプルの Dockerfile の最初のステップを変更する場合は、別の Elixir 基本イメージからプルする方がよいでしょう。 この場合、Dockerfile の他の部分がすべて同じままであっても、このイメージのキャッシュ全体が無効化されます。

## ビデオ: Docker レイヤー キャッシュの概要
{: #video-overview-of-docker-layer-caching }
{:.no_toc}

このビデオの例では、`setup_remote_docker` ステップで `docker_layer_caching: true` と設定されており、ジョブは Dockerfile 内のすべての手順を実行します。 2 回目以降のジョブの実行時、Dockerfile 内の変更されていないステップは再利用されます。 したがって、最初の実行時は Docker イメージのビルドに 2 分以上かかりますが、 2 回目の実行前に Dockerfile が何も変更されなかった場合、これらのステップは一瞬 (0 秒) で完了します。 2 回目の実行前に Dockerfile が何も変更されなかった場合、これらのステップは一瞬 (0 秒) で完了します。

```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/node:9.8.0-stretch-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照

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

## さらに詳しく
{: #learn-more }
Take the [DLC course](https://academy.circleci.com/docker-layer-caching?access_code=public-2021) with CircleCI Academy to learn more.
