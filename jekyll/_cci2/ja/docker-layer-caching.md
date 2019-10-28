---
layout: classic-docs
title: "Docker レイヤーキャッシュの有効化"
short-title: "Docker レイヤーキャッシュの有効化"
description: "未変更のキャッシュレイヤーを再利用してイメージをビルドすることにより、全体の実行時間を短縮する方法"
categories:
  - optimization
order: 70
---

This document offers an overview of Docker Layer Caching (DLC), which can reduce Docker image build times on CircleCI. Docker Layer Caching is only available on the Performance usage plan. DLC is available on the Premium usage plan, on all server-installations.

**Note:** Docker Layer caching is only available on select plans:

- The Performance usage plan, at 200 credits per build.
- On [enterprise](https://circleci.com/enterprise/) installations of CircleCI

- TOC
{:toc}

## 概要

Docker レイヤーキャッシュ (DLC) は、CI/CD プロセスの一環として Docker イメージのビルドが定期的に行われる場合に役立つすばらしい機能です。 DLC では、作成されるイメージレイヤーがジョブ内に保存されるため、ジョブの実行に使用される実際のコンテナには影響が及びません。

DLC では、CircleCI のジョブ中にビルドされた Docker イメージの各レイヤーがキャッシュされます。その後で CircleCI を実行すると、イメージ全体が毎回リビルドされるのではなく、未変更のイメージレイヤーが再利用されます。 つまり、コミット間で Dockerfile の変更が少ないほど、イメージビルドステップが短時間で完了します。

Docker レイヤーキャッシュは、[`machine` Executor]({{ site.baseurl }}/ja/2.0/executor-types/#using-machine) と[リモート Docker 環境]({{ site.baseurl }}/ja/2.0/building-docker-images) (`setup_remote_docker`) のどちらでも使用できます。

### 制限について
{:.no_toc}

**メモ：** DLC は、ビルドコンテナとして使用される Docker イメージには影響を**及ぼしません**。 そのため、ジョブを*実行*するために使用されるコンテナは、[`docker` Executor]({{ site.baseurl }}/ja/2.0/executor-types/#using-docker) を使用している場合、`image` キーで指定され、[Jobs (ジョブ)] ページの Spin up Environment ステップに表示されます。

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

![Docker Layer Caching]({{ site.baseurl }}/assets/img/docs/dlc_cloud.png)

### リモート Docker 環境
{:.no_toc}

To use DLC in the Remote Docker Environment, add `docker_layer_caching: true` under the `setup_remote_docker` key in your [config.yml]({{ site.baseurl }}/2.0/configuration-reference/) file:

```YAML
- setup_remote_docker:
    docker_layer_caching: true  # デフォルトは false  
```

Every layer built in a previous job will be accessible in the Remote Docker Environment. However, in some cases your job may run in a clean environment, even if the configuration specifies `docker_layer_caching: true`.

If you run many parallel jobs for the same project that depend on the same environment, all of them will be provided with a Remote Docker environment. Docker Layer Caching guarantees that jobs will have exclusive Remote Docker Environments that other jobs cannot access. However, some of the jobs may have cached layers, some may not have cached layers, and not all of the jobs will have identical caches.

**Note:** Previously DLC was enabled via the `reusable: true` key. The `reusable` key is deprecated in favor of the `docker_layer_caching` key. In addition, the `exclusive: true` option is deprecated and all Remote Docker VMs are now treated as exclusive. This means that when using DLC, jobs are guaranteed to have an exclusive Remote Docker Environment that other jobs cannot access.

### Machine Executor
{:.no_toc}

Docker Layer Caching can also reduce job runtimes when building Docker images using the [`machine` executor]({{ site.baseurl }}/2.0/executor-types/#using-machine). Use DLC with the `machine` executor by adding `docker_layer_caching: true` below your `machine` key (as seen above in our [example](#configyml)):

```YAML
machine:
  docker_layer_caching: true    # デフォルトは false
```

## Examples

Let's use the following Dockerfile to illustrate how Docker Layer Caching works. This example Dockerfile is adapted from our [Elixir convenience image](https://hub.docker.com/r/circleci/elixir/~/dockerfile):

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

In the config.yml snippet below, let's assume the `build_elixir` job is regularly building an image using the above Dockerfile. By adding `docker_layer_caching: true` underneath our `machine` executor key, we ensure that CircleCI will save each Docker image layer as this Elixir image is built.

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

On subsequent commits, if our example Dockerfile has not changed, then DLC will pull each Docker image layer from cache during the `build Elixir image` step, and our image will theoretically build almost instantaneously.

Now, let's say we add the following step to our Dockerfile, in between the `# use unicode` and `# install docker` steps:

    # jq をインストール
    RUN JQ_URL="https://circle-downloads.s3.amazonaws.com/circleci-images/cache/linux-amd64/jq-latest" \
      && curl --silent --show-error --location --fail --retry 3 --output /usr/bin/jq $JQ_URL \
      && chmod +x /usr/bin/jq \
      && jq --version
    

On the next commit, DLC will ensure that we still get cached image layers for the first few steps in our Dockerfile—pulling from `elixir:1.6.5` as our base image, the `# make apt non-interactive` step, the step starting with `RUN apt-get update`, the `# set timezone to UTC` step, and the `# use unicode` step.

However, because our `#install jq` step is new, it and all subsequent steps will need to be run from scratch, because the Dockerfile changes will invalidate the rest of the image layer cache. Overall, though, with DLC enabled, our image will still build more quickly, due to the unchanged layers/steps towards the beginning of the Dockerfile.

If we were to change the first step in our example Dockerfile—perhaps we want to pull from a different Elixir base image—then our entire cache for this image would be invalidated, even if every other part of our Dockerfile stayed the same.

## Video: Overview of Docker Layer Caching
{:.no_toc}

In the video example, the job runs all of the steps in a Dockerfile with the `docker_layer_caching: true` for the `setup_remote_docker` step. On subsequent runs of that job, steps that haven't changed in the Dockerfile, will be reused. So, the first run takes over two minutes to build the Docker image. If nothing changes in the Dockerfile before the second run, those steps happen instantly, in zero seconds.

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

When none of the layers in the image change between job runs, DLC pulls the layers from cache from the image that was built previously and reuses those instead of rebuilding the entire image.

If part of the Dockerfile changes (which changes part of the image) a subsequent run of the exact same job with the modified Dockerfile may still finish faster than rebuilding the entire image. It will finish faster because the cache is used for the first few steps that didn't change in the Dockerfile. The steps that follow the change must be rerun because the Dockerfile change invalidates the cache.

So, if you change something in the Dockerfile, all of those later steps are invalidated and the layers have to be rebuilt. When some of the steps remain the same (the steps before the one you removed), those steps can be reused. So, it is still faster than rebuilding the entire image.

<div class="video-wrapper">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/AL7aBN7Olng" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
</div>
