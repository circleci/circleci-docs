---
layout: classic-docs
title: "最適化"
short-title: "最適化"
description: "CircleCI 2.0 ビルドの最適化"
categories:
  - getting-started
order: 1
version:
  - Cloud
  - Server v2.x
---

このドキュメントでは、CircleCI 設定ファイルを最適化する方法をいくつか紹介します。 最適化の各方法について簡単に説明し、考えられるユース ケースを提示し、ジョブを最適化して高速化する例を示します。

* TOC
{:toc}

**Note**: For Cloud customers, some of the features discussed in this document may require a specific pricing plan. Visit our [pricing page](https://circleci.com/pricing/) to get an overview of the plans CircleCI offers. Or, if you are a logged in to the CircleCI web application, go to **Plan** from the sidebar to view and make adjustments to your plan.

## Docker image choice
{: #docker-image-choice }

Choosing the right docker image for your project can have huge impact on build time. For example, choosing a basic language image means dependencies and tools need to be downloaded each time your pipeline is run, whereas, if you choose or build an image that has these dependencies and tools already installed, this time will be saved for each build run. When configuring your projects and specifying images, consider the following options:

* CircleCI には多数の[コンビニエンス イメージ](https://circleci.com/ja/docs/2.0/circleci-images/#section=configuration)が用意されています。多くは公式の Docker イメージに基づいていますが、便利な言語ツールもプリインストールされています。
* プロジェクトに特化した[独自のイメージを作成](https://circleci.com/ja/docs/2.0/custom-images/#section=configuration)することも可能です。 それが容易になるよう、[Docker イメージ ビルド ウィザード](https://github.com/circleci-public/dockerfile-wizard)と、[イメージを手動で作成するためのガイダンス](https://circleci.com/ja/docs/2.0/custom-images/#カスタム-イメージの手動作成)が用意されています。

## Caching dependencies
{: #caching-dependencies }

Caching should be one of the first things you consider when trying to optimize your jobs. If a job fetches data at any point, it is likely that you can make use of caching. A common example is the use of a package/dependency manager. If your project uses Yarn, Bundler, or Pip, for example, the dependencies downloaded during a job can be cached for later use rather than being re-downloaded on every build.

{% raw %}

```yaml
version: 2
jobs:
  build:
    steps: # 'build' ジョブを構成する一連の実行可能コマンド
      - checkout # ソース コードを作業ディレクトリにプルします
      - restore_cache: # **Branch キー テンプレート ファイルまたは requirements.txt ファイルが前回の実行時から変更されていない場合、保存されている依存関係キャッシュを復元します**
          key: deps1-{{ .Branch }}-{{ checksum "requirements.txt" }}
      - run: # pip を使用して、仮想環境をインストールしてアクティブ化します
          command: |
            python3 -m venv venv
            . venv/bin/activate
            pip install -r requirements.txt
      - save_cache: # ** 依存関係キャッシュを保存する特別なステップ **
          key: deps1-{{ .Branch }}-{{ checksum "requirements.txt" }}
          paths:
            - "venv"
```

{% endraw %}

Make note of the use of a `checksum` in the cache `key`; this is used to calculate when a specific dependency-management file (such as a `package.json` or `requirements.txt` in this case) _changes_ and so the cache will be updated accordingly. In the above example, the [`restore_cache`]({{site.baseurl}}/2.0/configuration-reference#restore_cache) example uses interpolation to put dynamic values into the cache-key, allowing more control in what exactly constitutes the need to update a cache.

We recommend that you verify that the dependencies installation step succeeds before adding caching steps. Caching a failed dependency step will require you to change the cache key in order to avoid failed builds due to a bad cache.

Consult the [caching document]({{site.baseurl}}/2.0/caching) to learn more.

## ワークフロー
{: #workflows }

Workflows provide a means to define a collection of jobs and their run order. If at any point in your build you see a step where two jobs could happily run independent of one another, workflows may be helpful. Workflows also provide several other features to augment and improve your build configuration. Read more about workflows in the [workflow documentation]({{site.baseurl}}/2.0/workflows/).

**Note**: Workflows are available to all plans, but running jobs concurrently assumes that your plan provides multiple machines to execute on.

```yaml
version: 2.1
jobs: # here we define two jobs: "build" and "test"
  build:
    docker: # the docker executor is used
      - image: circleci/<language>:<version TAG> # An example docker image
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout # Pulls code down from your VCS
      - run: <command> # An example command
  test:
    docker: # same as previous docker key.
      - image: circleci/<language>:<version TAG>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - run: <command>
workflows: # Here we can orchestrate our jobs into a workflow
  version: 2
  build_and_test: # A single workflow named "build_and_test"
    jobs: # we run our `build` job and `test` job concurrently.
      - build
      - test
```


You can view more examples of workflows in the  [CircleCI demo workflows repo](https://github.com/CircleCI-Public/circleci-demo-workflows/).

## ワークスペース
{: #workspaces }

**Note**: Using workspaces presumes that you are also using [workflows](#workflows).

Workspaces are used to pass along data that is _unique to a run_ and is needed for _downstream jobs_. So, if you are using workflows, a job run earlier in your build might fetch data and then make it _available later_ for jobs that run later in a build.

To persist data from a job and make it available to downstream jobs via the [`attach_workspace`]({{ site.baseurl}}/2.0/configuration-reference#attach_workspace) key, configure the job to use the [`persist_to_workspace`]({{ site.baseurl}}/2.0/configuration-reference#persist_to_workspace) key. Files and directories named in the paths: property of `persist_to_workspace` will be uploaded to the workflow’s temporary workspace relative to the directory specified with the root key. The files and directories are then uploaded and made available for subsequent jobs (and re-runs of the workflow) to use.

Read more about how to use workspaces in the [workflows document]({{site.baseurl}}/2.0/workflows/#using-workspaces-to-share-data-among-jobs).

## 並列処理
{: #parallelism }

**Note**: Your CircleCI plan determines what level of parallelism you can use in your builds (1x, 2x, 4x, etc)

If your project has a large test suite, you can configure your build to use [`parallelism`]({{site.baseurl}}/2.0/configuration-reference#parallelism) together with either [CircleCI's test splitting functionality](https://circleci.com/docs/2.0/parallelism-faster-jobs/#using-the-circleci-cli-to-split-tests) or a [third party application or library](https://circleci.com/docs/2.0/parallelism-faster-jobs/#other-ways-to-split-tests) to split your tests across multiple machines. CircleCI supports automatic test allocation across machines on a file-basis, however, you can also manually customize how tests are allocated.

```yaml
# ~/.circleci/config.yml
version: 2
jobs:
  docker:
    - image: circleci/<language>:<version TAG>
      auth:
        username: mydockerhub-user
        password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
  test:
    parallelism: 4
```

Read more in-depth about splitting tests in our [document on parallelism]({{site.baseurl}}/2.0/parallelism-faster-jobs).

## Resource class
{: #resource-class }

**Note:** An eligible plan is required to use the [`resource_class`]({{site.baseurl}}/2.0/configuration-reference#resource_class) feature on Cloud. If you are on a container-based plan you will need to [open a support ticket](https://support.circleci.com/hc/en-us/requests/new) to enable this feature on your account. Resource class options for self hosted installations are set by system administrators.

Using `resource_class`, it is possible to configure CPU and RAM resources for each job. For Cloud, see [this table](https://circleci.com/docs/2.0/configuration-reference/#resource_class) for a list of available classes, and for self hosted installations contact your system administrator for a list. If `resource_class` is not specified or an invalid class is specified, the default `resource_class: medium` will be used.

Below is an example use case of the `resource_class` feature.

```yaml
jobs:
  build:
    docker:
      - image: buildpack-deps:trusty
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    environment:
      FOO: bar
    parallelism: 3
    resource_class: large # implements a machine with 4 vCPUS and 8gb of ram.
    steps:
      - run: make test
      - run: make
```

## Docker layer caching
{: #docker-layer-caching }

**Note**: [The Performance Plan](https://circleci.com/pricing/) is required to use Docker Layer Caching. If you are on the container-based plan you will need to upgrate to [the Performance Plan](https://circleci.com/pricing/) to enable DLC for your organization.

DLC is a feature that can help to reduce the _build time_ of a Docker image in your build. Docker Layer Caching is useful if you find yourself frequently building Docker images as a regular part of your CI/CD process.

DLC is similar to _caching dependencies_ mentioned above in that it _saves_ the image layers that you build within your job, making them available on subsequent builds.

```yaml
version: 2
jobs:
 build:
    docker:
      - image: circleci/node:9.8.0-stretch-browsers # ここでは DLC は動作しません。キャッシュの状況は、イメージ レイヤーがどれだけ共有されているかによって決まります。
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
    steps:
      - checkout
      - setup_remote_docker:
          docker_layer_caching: true # DLC will explicitly cache layers here and try to avoid rebuilding.
      - run: docker build .
```

Learn more about [Docker Layer Caching]({{site.baseurl}}/2.0/docker-layer-caching)

## See also
{: #see-also }
{:.no_toc}

- ビルドで構成可能な機能の一覧については、「[CircleCI を設定する]({{ site.baseurl}}/2.0/configuration-reference/)」を参照してください。
- Coinbase から、「[Continuous Integration at Coinbase: How we optimized CircleCI for speed and cut our build times by 75%](https://blog.coinbase.com/continuous-integration-at-coinbase-how-we-optimized-circleci-for-speed-cut-our-build-times-by-378c8b1d7161) (Coinbase での継続的インテグレーション: CircleCI を最適化して処理速度を向上させ、ビルド時間を 75% 短縮)」というタイトルの記事が公開されています。
- Yarn とキャッシュを使用してビルドを高速化する方法については、[こちらのドキュメント]({{site.baseurl}}/2.0/yarn)を参照してください。
