---
layout: classic-docs
title: "Docker レイヤーキャッシュの有効化"
short-title: "Docker レイヤーキャッシュの有効化"
description: "未変更のキャッシュレイヤーを再利用してイメージをビルドすることにより、全体の実行時間を短縮する方法"
categories:
  - 最適化
order: 70
contentTags:
  platform:
    - クラウド
    - Server v4.x
    - Server v3.x
    - Server v2.x
---

Docker レイヤー キャッシュ (DLC) を利用すると、Docker イメージのビルド時間を短縮できます。 DLC は、[Free および有料](https://circleci.com/pricing/)プラン (ジョブの実行ごとにクレジットが請求されます)、そして [CircleCI Server](https://circleci.com/enterprise/) 環境でご利用いただけます。

## 概要
{: #overview }

Docker layer caching (DLC) is beneficial if building Docker images is a regular part of your CI/CD process. DLC では、作成されるイメージレイヤーがジョブ内に保存されるため、ジョブの実行に使用される実際のコンテナには影響が及びません。

DLC では、CircleCI のジョブ中にビルドされた Docker イメージの各レイヤーがキャッシュされます。 その後で CircleCI を実行すると、イメージ全体が毎回リビルドされるのではなく、未変更のイメージレイヤーが再利用されます。 つまり、コミット間で Dockerfile の変更が少ないほど、イメージビルドステップが短時間で完了します。

Docker layer caching can be used with both the `machine` executor and in the [remote Docker environment](/docs/building-docker-images/) (`setup_remote_docker`).

現在、DLC 機能の更新作業を行っています。 **ユーザーの皆様に実行していただく作業はありません**。このページの以降の内容はすべて、段階的に廃止される DLC の実装についての内容です。 すべてのジョブが新しい実装に移行されると、このページの現在の内容は古い情報となり、新しいアーキテクチャに基づく情報に置き換えられます。
<br>
<br>
新しいアーキテクチャの詳細やこのロールアウトに関する最新の情報は、[Discuss の投稿 (英語)](https://discuss.circleci.com/t/fyi-small-dlc-update-no-action-required/44614)でご確認ください。
{: class="alert alert-info"}

### 制限事項
{: #limitations }

Please note that high usage of [parallelism](/docs/configuration-reference/#parallelism) (that is, a parallelism of 30 or above) in your configuration may cause issues with DLC, notably pulling a stale cache or no cache.  たとえば以下のようになります。

- 30 の並列実行で 1 つのジョブを実行する場合、ワークフローが 1 つであれば正常に動作しますが、複数のワークフローがあるとキャッシュミスが発生します。
- 30 を超える `parallelism` で任意の数のジョブを実行する場合、ワークフローの数に関係なく、キャッシュミスが発生します。

キャッシュミスの問題が発生している場合、または高並列実行を行う必要がある場合は、実験的な [docker-registry-image-cache Orb](https://circleci.com/developer/ja/orbs/orb/cci-x/docker-registry-image-cache) をお試しください。  **この制限は、上記の[お知らせ](#overview)に書かれている新しい DLC の実装には適用されません。**

DLC is only useful when creating your own Docker image with docker build, docker compose, or similar docker commands.It does not decrease the wall clock time that all builds take to spin up the initial environment.

{:.tab.switcher.Cloud}
```yaml
version: 2.1
orbs:
  browser-tools: circleci/browser-tools@1.2.3
jobs:
 build:
    docker:
      - image: cimg/node:17.2-browsers # ここでは、DLC は何もしません。キャッシュの状況は、イメージレイヤーにどれだけ共通点があるかによって左右されます。
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    steps:
      - checkout
      - setup_remote_docker:
          docker_layer_caching: true # ここでは、DLC はレイヤーを明示的にキャッシュし、リビルドを避けようとします
      - run: docker build .
```

{:.tab.switcher.Server_3}
```yaml
version: 2.1
jobs:
 build:
    docker:
      - image: cimg/node:17.2-browsers # ここでは、DLC は何もしません。キャッシュの状況は、イメージレイヤーにどれだけ共通点があるかによって左右されます。
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    steps:
      - checkout
      - setup_remote_docker:
          docker_layer_caching: true # ここでは、DLC はレイヤーを明示的にキャッシュし、リビルドを避けようとします
      - run: docker build .
```

{:.tab.switcher.Server_2}
```yaml
# Legacy convenience images (i.e. images in the `circleci/` Docker namespace)
# will be deprecated starting Dec. 31, 2021. Next-gen convenience images with 
# browser testing require the use of the CircleCI browser-tools orb, available 
# with config version 2.1.
version: 2
jobs:
 build:
    docker:
      - image: circleci/node:14.17.3-buster-browsers # ここでは、DLC は何もしません。キャッシュの状況は、イメージレイヤーにどれだけ共通点があるかによって左右されます。
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # コンテキスト/プロジェクト UI 環境変数の参照
    steps:
      - checkout
      - setup_remote_docker:
          docker_layer_caching: true # ここでは、DLC はレイヤーを明示的にキャッシュし、リビルドを避けようとします
      - run: docker build .
```

DLC has **no** effect on Docker images used as build containers. That is, containers that are used to _run_ your jobs are specified with the `image` key when using the [`docker` executor](/docs/using-docker/) and appear in the **Spin up Environment** step on your jobs pages.
{: class="alert alert-info"}

## DLC のしくみ
{: #how-dlc-works }

DLC は、外部ボリュームを作成し、それを `machine` やリモート Docker ジョブを実行するインスタンスにアタッチすることで、Docker イメージレイヤーをキャッシュします。 ボリュームのアタッチは、アタッチ対象のボリュームに Docker がイメージ レイヤーを保存する形で実行されます。 ジョブが終了すると、ボリュームは切断され、その後のジョブで再利用されます。 The layers downloaded in a previous job with DLC will be available in the next job that uses the same DLC volume.

1 つの DLC ボリュームをアタッチできるのは、一度に 1 つの `machine` またはリモート Docker ジョブだけです。 存在する DLC ボリュームが 1 つだけで、DLC を要求するジョブが 2 つローンチされる場合、CircleCI は新しい DLC ボリュームを作成し、それを 2 番目のジョブにアタッチします。 From that point on, the project will have two DLC volumes associated with it. これは、並列ジョブにも適用されます。 2つの `machine` ジョブを並列実行している場合、これらのジョブは異なる DLC ボリュームを取得します。

ボリュームがどのジョブで使用されるかに応じて、ボリューム上に異なるレイヤーが保存される場合があります。 For instance, the volumes that are used less frequently might have older layers saved on them.

DLC ボリュームは、ジョブで 3 日間使用されないと削除されます。

CircleCI で 1 つのプロジェクトに作成される DLC ボリュームの上限は 30 個です。プロジェクトごとに最大 30 個の `machine` またはリモート Docker ジョブが同時に DLC にアクセスできます。 これはジョブの並列処理を考慮するため、各プロジェクトで DLC にアクセスできるジョブの最大数は、30個の並列処理があるジョブの場合は 1つ、15個の並列処理があるジョブの場合は 2つとなります。

![Docker レイヤーキャッシュ](/docs/assets/img/docs/dlc_cloud.png)

### キャッシュの対象範囲
{: #scope-of-cache }
DLC が有効な場合、リモート ボリュームには `/var/lib/docker` の全体がキャッシュされます。 これには、前のジョブで作成されたカスタム ネットワークもすべて含まれます。

### リモート Docker 環境
{: #remote-docker-environment }

To use DLC in the Remote Docker Environment, add `docker_layer_caching: true` under the `setup_remote_docker` key in your [`.circleci/config.yml`](/docs/configuration-reference/) file:

```yml
- setup_remote_docker:
    docker_layer_caching: true  # デフォルトは false
```

前のジョブでビルドされたレイヤーはすべて、リモート Docker 環境でアクセスできます。 ただし、設定ファイルで `docker_layer_caching: true` を指定している場合でも、ジョブがクリーンな環境で実行される場合があります。

同一プロジェクトの多くの同時実行ジョブが同じ環境に依存している場合、それらを実行すると、すべてのジョブにリモート Docker 環境が提供されます。 Docker レイヤー キャッシュは、他のジョブがアクセスできない排他的なリモート Docker 環境をジョブが使用することを保証します。 しかしジョブは、キャッシュされたレイヤーを持つ場合も持たない場合もあり、また、すべてのジョブが同一のキャッシュを持つとは限りません。

DLC was previously enabled via the `reusable: true` key. The `reusable` key has been deprecated in favor of the `docker_layer_caching` key.
<br>
<br>
さらに、`exclusive: true` オプションも非推奨になり、すべてのリモート Docker VM が排他として扱われるようになりました。 This means that when using DLC, jobs are guaranteed to have an exclusive Remote Docker environment that other jobs cannot access.
{: class="alert alert-info"}

### Machine Executor
{: #machine-executor }

Docker layer caching can also reduce job runtimes when building Docker images using the [`machine` executor](/docs/configuration-reference/#machine). `machine` キーの下に `docker_layer_caching: true` を追加することで (後述の[例](#configyml)を参照)、`machine` Executor で DLC を使用できます。

```yml
machine:
  docker_layer_caching: true    # デフォルトは false
```

## サンプル
{: #examples }

We will use the following example Dockerfile to illustrate how Docker layer caching works. This eDockerfile is adapted from our [Elixir legacy convenience image](https://hub.docker.com/r/circleci/elixir/~/dockerfile):

### Dockerfile
{: #dockerfile }

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

In the `.circleci/config.yml` snippet below, let's assume the `build_elixir` job is regularly building an image using the above Dockerfile.

`machine` Executor キーのすぐ下に `docker_layer_caching: true` を追加することで、この Elixir イメージがビルドされるときに CircleCI で各 Docker イメージレイヤーが確実に保存されるようになります。

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

次のコミットで DLC は、基本イメージとして `elixir:1.11.4` からプルし、Dockerfile の最初のいくつかのステップ、つまり `# make apt non-interactive` のステップ、`RUN apt-get update` で始まるステップ、`# set timezone to UTC` のステップ、および `# use unicode` のステップのキャッシュされたイメージレイヤーが引き続き確実に取得されるようにします。

However, because our `#install jq` step is new, it as well as subsequent steps need to be run from scratch, because the Dockerfile changes will invalidate the rest of the image layer cache. But overall, with DLC enabled our image will still build more quickly, due to the unchanged layers/steps towards the beginning of the Dockerfile.

If we were to change the first step in our example Dockerfile (for example, perhaps we want to pull from a different Elixir base image), then our entire cache for this image would be invalidated even if every other part of our Dockerfile stayed the same.

## Video: overview of Docker layer caching
{: #video-overview-of-docker-layer-caching }

このビデオの例では、`setup_remote_docker` ステップで `docker_layer_caching: true` と設定されており、ジョブは Dockerfile 内のすべての手順を実行します。 On subsequent runs of that job, steps that have not changed in the Dockerfile will be reused.

The first run takes over two minutes to build the Docker image. If nothing changes in the Dockerfile before the second run, those steps happen instantly: in zero seconds.

```yaml
version: 2
jobs:
  build:
    docker:
      - image: cimg/node:14.17.3
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference

    steps:
      - checkout
      - setup_remote_docker:
          docker_layer_caching: true
      - run: docker build .
```

次のジョブ実行までにイメージ内のレイヤーがまったく変更されなかった場合、DLC はイメージ全体をリビルドするのではなく、以前にビルドされたイメージのキャッシュからレイヤーをプルして再利用します。

If part of the Dockerfile changes (which changes part of the image), a subsequent run of the exact same job with the modified Dockerfile may still finish faster than rebuilding the entire image. This is because the cache is used for the first few steps that did not change in the Dockerfile. Dockerfile を変更するとキャッシュが無効化されるため、加えられた変更以降のステップは再度実行されます。

This means that if you change something in the Dockerfile, all of those later steps are invalidated and the layers have to be rebuilt. しかし、一部のステップ (削除したステップよりも前のステップ) が変更されていない場合、それらのステップは再利用できます。 そのため、イメージ全体をリビルドするよりも処理が高速になります。

<div class="video-wrapper">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/AL7aBN7Olng" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
</div>

## さらに詳しく
{: #learn-more }
Circle CI Academy の [DLC コース](https://academy.circleci.com/docker-layer-caching?access_code=public-2021) を受講すると、さらに詳しく学ぶことができます。
