---
layout: classic-docs
title: "Docker レイヤー キャッシュの有効化"
short-title: "Docker レイヤー キャッシュの有効化"
description: "未変更のキャッシュ レイヤーを再利用してイメージをビルドすることにより、全体の実行時間を短縮する方法"
categories:
  - optimization
order: 70
version:
  - Cloud
  - Server v2.x
---

Docker レイヤー キャッシュ (DLC) を利用すると、CircleCI で Docker イメージのビルド時間を短縮できます。 DLC は [Performance と Custom](https://circleci.com/ja/pricing/) の従量課金制プラン、または [CircleCI Server](https://circleci.com/ja/enterprise/) の環境でご利用になれます (ジョブ実行 1 回ごとに 200 クレジットが必要です)。 このドキュメントでは、以下のセクションに沿って、DLC について概説します。

- 目次
{:toc}

## 概要

Docker レイヤー キャッシュ (DLC) は、Docker イメージのビルドが CI/CD プロセスの一環として定期的に行われる場合に役立つすばらしい機能です。 ジョブの実行に使用する実際のコンテナには影響せず、ジョブ内で作成されるイメージ レイヤーが保存されます。

DLC では、CircleCI のジョブ中にビルドされた Docker イメージの個々のレイヤーがキャッシュされます。その後で CircleCI を実行すると、イメージ全体が毎回リビルドされるのではなく、未変更のイメージ レイヤーが再利用されます。 つまり、コミット間で Dockerfile の変更が少ないほど、イメージ ビルド ステップが短時間で完了します。

Docker レイヤー キャッシュは、[`machine` Executor]({{ site.baseurl }}/2.0/executor-types/#machine-の使用) と[リモート Docker 環境]({{ site.baseurl }}/2.0/building-docker-images) (`setup_remote_docker`) のどちらでも利用できます。

### 制限事項
{:.no_toc}

設定ファイルの [parallelism]({{site.baseurl}}/2.0/configuration-reference/#parallelism) の値が大きい状態 (30 以上) で DLC を利用すると、古いキャッシュがプルされてしまう、キャッシュがプルされないなどの問題が発生することがあります。 たとえば以下のようなケースが考えられます。

- 30 の並列処理で 1 つのジョブを実行する場合、ワークフローが 1 つであれば正常に動作しますが、複数のワークフローがあるとキャッシュ ミスが発生します。
- 30 を超える `parallelism` で任意の数のジョブを実行する場合、ワークフローの数に関係なく、キャッシュ ミスが発生します。

If you are experiencing issues with cache-misses or need high-parallelism, consider trying the experimental [docker-registry-image-cache](https://circleci.com/developer/orbs/orb/cci-x/docker-registry-image-cache) orb.

**メモ:** DLC は、ビルド コンテナとして使用する Docker イメージには影響を**及ぼしません**。 そのため、ジョブの*実行*に使用するコンテナは、[`docker` Executor]({{ site.baseurl }}/2.0/executor-types/#docker-の使用) を使用している場合、`image` キーで指定したものが [Jobs (ジョブ)] ページの Spin up Environment ステップに表示されます。

DLC は、docker build、docker compose などの Docker コマンドを使用して独自の Docker イメージを作成する場合にのみ有効です。すべてのビルドが初期環境をスピンアップするのにかかる実時間は短縮されません。

```YAML
version: 2 
jobs: 
  build:
    docker:
      # DLC does nothing here, its caching depends on commonality of the image layers.
      - image: circleci/node:9.8.0-stretch-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - setup_remote_docker:
          docker_layer_caching: true
      # DLC will explicitly cache layers here and try to avoid rebuilding.
      - run: docker build .
```

## How DLC works

DLC は、外部ボリュームを作成し、それを `machine` やリモート Docker のジョブを実行するインスタンスにアタッチすることで、Docker イメージ レイヤーをキャッシュします。 ボリュームのアタッチは、そのボリュームに Docker がイメージ レイヤーを保存する形で実行されます。 ジョブが終了すると、ボリュームは切断され、その後のジョブで再利用されます。 つまり、DLC によって前のジョブでダウンロードされたレイヤーは、同じ DLC ボリュームを使用する次のジョブで利用可能になります。

1 つの DLC ボリュームをアタッチできるのは、一度に 1 つの `machine` またはリモート Docker ジョブだけです。 存在する DLC ボリュームが 1 つだけで、DLC を要求するジョブが 2 つローンチされる場合、CircleCI は新しい DLC ボリュームを作成し、それを 2 番目のジョブにアタッチします。 その時点以降、プロジェクトには 2 つの DLC ボリュームが関連付けられることになります。 これは、並列ジョブにも適用されます。2 つの `machine` ジョブを並列実行している場合、これらのジョブは異なる DLC ボリュームを取得します。

ボリュームがどのジョブで使用されるかに応じて、ボリューム上に異なるレイヤーが保存される場合があります。 使用頻度が低いボリュームには、古いレイヤーが保存されている可能性があります。

The DLC volumes are deleted after 3 days of not being used in a job.

CircleCI で 1 つのプロジェクトに作成される DLC ボリュームの上限は 50 個です。プロジェクトごとに最大 50 個の `machine` またはリモート Docker ジョブが同時に DLC にアクセスできます。 ジョブの並列処理が考慮されるため、各プロジェクトで DLC にアクセスできるジョブの最大数は、50 個の並列処理を行うジョブの場合は 1 つ、25 個の並列処理を行うジョブの場合は 2 つとなります。

![Docker レイヤー キャッシュ]({{ site.baseurl }}/assets/img/docs/dlc_cloud.png)

### Scope of cache

With DLC enabled, the entirety of `/var/lib/docker` is cached to the remote volume, which also includes any custom networks created in previous jobs.

### Remote Docker environment
{:.no_toc}

To use DLC in the Remote Docker Environment, add `docker_layer_caching: true` under the `setup_remote_docker` key in your [config.yml]({{ site.baseurl }}/2.0/configuration-reference/) file:

```YAML
- setup_remote_docker:
    docker_layer_caching: true  # デフォルトは false  
```

Every layer built in a previous job will be accessible in the Remote Docker Environment. However, in some cases your job may run in a clean environment, even if the configuration specifies `docker_layer_caching: true`.

If you run many concurrent jobs for the same project that depend on the same environment, all of them will be provided with a Remote Docker environment. Docker Layer Caching guarantees that jobs will have exclusive Remote Docker Environments that other jobs cannot access. However, some of the jobs may have cached layers, some may not have cached layers, and not all of the jobs will have identical caches.

**Note:** Previously DLC was enabled via the `reusable: true` key. The `reusable` key is deprecated in favor of the `docker_layer_caching` key. In addition, the `exclusive: true` option is deprecated and all Remote Docker VMs are now treated as exclusive. This means that when using DLC, jobs are guaranteed to have an exclusive Remote Docker Environment that other jobs cannot access.

### Machine executor
{:.no_toc}

Docker Layer Caching can also reduce job runtimes when building Docker images using the [`machine` executor]({{ site.baseurl }}/2.0/executor-types/#using-machine). Use DLC with the `machine` executor by adding `docker_layer_caching: true` below your `machine` key (as seen above in our [example](#configyml)):

```YAML
machine:
  docker_layer_caching: true    # デフォルトは false
```

## 例

Let's use the following Dockerfile to illustrate how Docker Layer Caching works. This example Dockerfile is adapted from our [Elixir convenience image](https://hub.docker.com/r/circleci/elixir/~/dockerfile):

### Dockerfile
{:.no_toc}

FROM elixir:1.6.5
    
    # Make apt non-interactive
    RUN echo 'APT::Get::Assume-Yes "true";' > /etc/apt/apt.conf.d/90circleci \
      && echo 'DPkg::Options "--force-confnew";' >> /etc/apt/apt.conf.d/90circleci
    
    ENV DEBIAN_FRONTEND=noninteractive
    
    # man directory is missing in some base images
    # https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=863199
    RUN apt-get update \
      && mkdir -p /usr/share/man/man1 \
      && apt-get install -y \
        git mercurial xvfb \
        locales sudo openssh-client ca-certificates tar gzip parallel \
        net-tools netcat unzip zip bzip2 gnupg curl wget
    
    # Set timezone to utc
    RUN ln -sf /usr/share/zoneinfo/Etc/UTC /etc/localtime
    
    # Use unicode
    RUN locale-gen C.UTF-8 || true
    ENV LANG=C.UTF-8
    
    # Install docker
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
    
    # Install docker-compose
    RUN curl --silent --show-error --location --fail --retry 3 --output /usr/bin/docker-compose \
        https://circle-downloads.s3.amazonaws.com/circleci-images/cache/linux-amd64/docker-compose-latest \
      && chmod +x /usr/bin/docker-compose \
      && docker-compose version
    
    # Setup circleci user
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
          name: Elixir イメージのビルド
          command: docker build -t circleci/elixir:example .
```

On subsequent commits, if our example Dockerfile has not changed, then DLC will pull each Docker image layer from cache during the `build Elixir image` step, and our image will theoretically build almost instantaneously.

Now, let's say we add the following step to our Dockerfile, in between the `# use unicode` and `# install docker` steps:

    # Install jq
    RUN JQ_URL="https://circle-downloads.s3.amazonaws.com/circleci-images/cache/linux-amd64/jq-latest" \
      && curl --silent --show-error --location --fail --retry 3 --output /usr/bin/jq $JQ_URL \
      && chmod +x /usr/bin/jq \
      && jq --version
    

On the next commit, DLC will ensure that we still get cached image layers for the first few steps in our Dockerfile—pulling from `elixir:1.6.5` as our base image, the `# make apt non-interactive` step, the step starting with `RUN apt-get update`, the `# set timezone to UTC` step, and the `# use unicode` step.

However, because our `#install jq` step is new, it and all subsequent steps will need to be run from scratch, because the Dockerfile changes will invalidate the rest of the image layer cache. Overall, though, with DLC enabled, our image will still build more quickly, due to the unchanged layers/steps towards the beginning of the Dockerfile.

If we were to change the first step in our example Dockerfile—perhaps we want to pull from a different Elixir base image—then our entire cache for this image would be invalidated, even if every other part of our Dockerfile stayed the same.

## Video: overview of Docker Layer Caching
{:.no_toc}

In the video example, the job runs all of the steps in a Dockerfile with the `docker_layer_caching: true` for the `setup_remote_docker` step. On subsequent runs of that job, steps that haven't changed in the Dockerfile, will be reused. So, the first run takes over two minutes to build the Docker image. If nothing changes in the Dockerfile before the second run, those steps happen instantly, in zero seconds.

```yaml
version: 2 
jobs: 
  build:
    docker:
      - image: circleci/node:9.8.0-stretch-browsers
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference

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
